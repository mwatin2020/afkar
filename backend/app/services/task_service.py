from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.associations import TaskTag
from app.models.project import Project
from app.models.tag import Tag
from app.models.task import Task
from app.models.user import User
from app.models.enums import TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.activity_service import log_activity


def _task_query(owner: User):
    return (
        select(Task)
        .where(Task.owner_id == owner.id)
        .options(selectinload(Task.project), selectinload(Task.tag_links).selectinload(TaskTag.tag))
        .order_by(Task.updated_at.desc())
    )


async def list_tasks(
    session: AsyncSession,
    owner: User,
    *,
    search: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    project_id: int | None = None,
) -> list[Task]:
    query = _task_query(owner)
    if search:
        term = f"%{search.strip()}%"
        query = query.where(or_(Task.title.ilike(term), Task.description.ilike(term)))
    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if project_id:
        query = query.where(Task.project_id == project_id)

    result = await session.execute(query)
    return list(result.scalars().all())


async def get_task(session: AsyncSession, owner: User, task_id: int) -> Task | None:
    result = await session.execute(_task_query(owner).where(Task.id == task_id))
    return result.scalar_one_or_none()


async def _validate_project(session: AsyncSession, owner: User, project_id: int | None) -> Project | None:
    if project_id is None:
        return None
    result = await session.execute(select(Project).where(Project.id == project_id, Project.owner_id == owner.id))
    project = result.scalar_one_or_none()
    if project is None:
        raise ValueError("Project not found.")
    return project


async def _sync_task_tags(session: AsyncSession, task: Task, owner: User, tag_ids: list[int]) -> None:
    await session.execute(delete(TaskTag).where(TaskTag.task_id == task.id))
    if not tag_ids:
        return
    result = await session.execute(select(Tag).where(Tag.owner_id == owner.id, Tag.id.in_(tag_ids)))
    tags = {tag.id: tag for tag in result.scalars().all()}
    for tag_id in tag_ids:
        if tag_id in tags:
            session.add(TaskTag(task_id=task.id, tag_id=tag_id))


async def create_task(session: AsyncSession, owner: User, payload: TaskCreate) -> Task:
    await _validate_project(session, owner, payload.project_id)
    task = Task(
        owner_id=owner.id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        due_date=payload.due_date,
        project_id=payload.project_id,
    )
    session.add(task)
    await session.flush()
    await _sync_task_tags(session, task, owner, payload.tag_ids)
    await log_activity(
        session,
        owner=owner,
        entity_type="task",
        entity_id=task.id,
        action="created",
        message=f"Created task '{task.title}'.",
    )
    await session.commit()
    return await get_task(session, owner, task.id)  # type: ignore[return-value]


async def update_task(session: AsyncSession, owner: User, task: Task, payload: TaskUpdate) -> Task:
    data = payload.model_dump(exclude_unset=True)
    tag_ids = data.pop("tag_ids", None)
    for field, value in data.items():
        setattr(task, field, value)

    if task.status == TaskStatus.DONE and task.completed_at is None:
        task.completed_at = datetime.now(UTC)
    if task.status != TaskStatus.DONE:
        task.completed_at = None
    if task.status == TaskStatus.ARCHIVED and task.archived_at is None:
        task.archived_at = datetime.now(UTC)
    if task.status != TaskStatus.ARCHIVED:
        task.archived_at = None

    if tag_ids is not None:
        await _sync_task_tags(session, task, owner, tag_ids)

    await log_activity(
        session,
        owner=owner,
        entity_type="task",
        entity_id=task.id,
        action="updated",
        message=f"Updated task '{task.title}'.",
    )
    await session.commit()
    return await get_task(session, owner, task.id)  # type: ignore[return-value]


async def mark_task_done(session: AsyncSession, owner: User, task: Task) -> Task:
    task.status = TaskStatus.DONE
    task.completed_at = datetime.now(UTC)
    await log_activity(
        session,
        owner=owner,
        entity_type="task",
        entity_id=task.id,
        action="completed",
        message=f"Marked task '{task.title}' as done.",
    )
    await session.commit()
    return await get_task(session, owner, task.id)  # type: ignore[return-value]


async def archive_task(session: AsyncSession, owner: User, task: Task) -> Task:
    task.status = TaskStatus.ARCHIVED
    task.archived_at = datetime.now(UTC)
    await log_activity(
        session,
        owner=owner,
        entity_type="task",
        entity_id=task.id,
        action="archived",
        message=f"Archived task '{task.title}'.",
    )
    await session.commit()
    return await get_task(session, owner, task.id)  # type: ignore[return-value]


async def delete_task(session: AsyncSession, owner: User, task: Task) -> None:
    title = task.title
    await log_activity(
        session,
        owner=owner,
        entity_type="task",
        entity_id=task.id,
        action="deleted",
        message=f"Deleted task '{title}'.",
    )
    await session.delete(task)
    await session.commit()
