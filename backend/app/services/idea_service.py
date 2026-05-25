from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.associations import IdeaTag
from app.models.enums import IdeaStatus
from app.models.idea import Idea
from app.models.project import Project
from app.models.tag import Tag
from app.models.user import User
from app.schemas.idea import IdeaCreate, IdeaStatusUpdate, IdeaUpdate
from app.services.activity_service import log_activity


def _idea_query(owner: User):
    return (
        select(Idea)
        .where(Idea.owner_id == owner.id)
        .options(selectinload(Idea.project), selectinload(Idea.tag_links).selectinload(IdeaTag.tag))
        .order_by(Idea.updated_at.desc())
    )


async def list_ideas(
    session: AsyncSession,
    owner: User,
    *,
    search: str | None = None,
    status: str | None = None,
    category: str | None = None,
    confidentiality: str | None = None,
    maturity: str | None = None,
    project_id: int | None = None,
) -> list[Idea]:
    query = _idea_query(owner)
    if search:
        term = f"%{search.strip()}%"
        query = query.where(or_(Idea.title.ilike(term), Idea.summary.ilike(term), Idea.content.ilike(term)))
    if status:
        query = query.where(Idea.status == status)
    if category:
        query = query.where(Idea.category == category)
    if confidentiality:
        query = query.where(Idea.confidentiality == confidentiality)
    if maturity:
        query = query.where(Idea.maturity == maturity)
    if project_id:
        query = query.where(Idea.project_id == project_id)
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_idea(session: AsyncSession, owner: User, idea_id: int) -> Idea | None:
    result = await session.execute(_idea_query(owner).where(Idea.id == idea_id))
    return result.scalar_one_or_none()


async def _sync_idea_tags(session: AsyncSession, idea: Idea, owner: User, tag_ids: list[int]) -> None:
    await session.execute(delete(IdeaTag).where(IdeaTag.idea_id == idea.id))
    if not tag_ids:
        return
    result = await session.execute(select(Tag).where(Tag.owner_id == owner.id, Tag.id.in_(tag_ids)))
    tags = {tag.id: tag for tag in result.scalars().all()}
    for tag_id in tag_ids:
        if tag_id in tags:
            session.add(IdeaTag(idea_id=idea.id, tag_id=tag_id))


async def _validate_project(session: AsyncSession, owner: User, project_id: int | None) -> Project | None:
    if project_id is None:
        return None
    result = await session.execute(select(Project).where(Project.id == project_id, Project.owner_id == owner.id))
    project = result.scalar_one_or_none()
    if project is None:
        raise ValueError("Project not found.")
    return project


async def create_idea(session: AsyncSession, owner: User, payload: IdeaCreate) -> Idea:
    await _validate_project(session, owner, payload.project_id)
    idea = Idea(owner_id=owner.id, **payload.model_dump(exclude={"tag_ids"}))
    session.add(idea)
    await session.flush()
    await _sync_idea_tags(session, idea, owner, payload.tag_ids)
    await log_activity(
        session,
        owner=owner,
        entity_type="idea",
        entity_id=idea.id,
        action="created",
        message=f"Created idea '{idea.title}'.",
    )
    await session.commit()
    return await get_idea(session, owner, idea.id)  # type: ignore[return-value]


async def update_idea(session: AsyncSession, owner: User, idea: Idea, payload: IdeaUpdate) -> Idea:
    data = payload.model_dump(exclude_unset=True)
    tag_ids = data.pop("tag_ids", None)
    if "project_id" in data:
        await _validate_project(session, owner, data["project_id"])
    for field, value in data.items():
        setattr(idea, field, value)

    if tag_ids is not None:
        await _sync_idea_tags(session, idea, owner, tag_ids)

    await log_activity(
        session,
        owner=owner,
        entity_type="idea",
        entity_id=idea.id,
        action="updated",
        message=f"Updated idea '{idea.title}'.",
    )
    await session.commit()
    return await get_idea(session, owner, idea.id)  # type: ignore[return-value]


async def update_idea_status(session: AsyncSession, owner: User, idea: Idea, payload: IdeaStatusUpdate) -> Idea:
    idea.status = payload.status
    idea.decision_note = payload.decision_note
    if payload.status == IdeaStatus.FROZEN:
        idea.frozen_at = datetime.now(UTC)
    await log_activity(
        session,
        owner=owner,
        entity_type="idea",
        entity_id=idea.id,
        action="status_changed",
        message=f"Changed idea '{idea.title}' status to {idea.status}.",
    )
    await session.commit()
    return await get_idea(session, owner, idea.id)  # type: ignore[return-value]


async def freeze_idea(session: AsyncSession, owner: User, idea: Idea, decision_note: str | None = None) -> Idea:
    idea.status = IdeaStatus.FROZEN
    idea.frozen_at = datetime.now(UTC)
    if decision_note is not None:
        idea.decision_note = decision_note
    await log_activity(
        session,
        owner=owner,
        entity_type="idea",
        entity_id=idea.id,
        action="frozen",
        message=f"Froze idea '{idea.title}'.",
    )
    await session.commit()
    return await get_idea(session, owner, idea.id)  # type: ignore[return-value]


async def soft_delete_idea(session: AsyncSession, owner: User, idea: Idea) -> Idea:
    idea.status = IdeaStatus.DELETED
    idea.deleted_at = datetime.now(UTC)
    await log_activity(
        session,
        owner=owner,
        entity_type="idea",
        entity_id=idea.id,
        action="soft_deleted",
        message=f"Soft deleted idea '{idea.title}'.",
    )
    await session.commit()
    return await get_idea(session, owner, idea.id)  # type: ignore[return-value]


async def delete_idea(session: AsyncSession, owner: User, idea: Idea) -> None:
    title = idea.title
    await log_activity(
        session,
        owner=owner,
        entity_type="idea",
        entity_id=idea.id,
        action="deleted",
        message=f"Deleted idea '{title}'.",
    )
    await session.delete(idea)
    await session.commit()


async def list_sandbox_ideas(session: AsyncSession, owner: User) -> list[Idea]:
    result = await session.execute(
        _idea_query(owner).where(Idea.status.in_([IdeaStatus.SANDBOX, IdeaStatus.UNDER_REVIEW]))
    )
    return list(result.scalars().all())
