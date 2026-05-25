from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.activity_service import log_activity


async def list_projects(session: AsyncSession, owner: User) -> list[Project]:
    result = await session.execute(select(Project).where(Project.owner_id == owner.id).order_by(Project.updated_at.desc()))
    return list(result.scalars().all())


async def get_project(session: AsyncSession, owner: User, project_id: int) -> Project | None:
    result = await session.execute(select(Project).where(Project.owner_id == owner.id, Project.id == project_id))
    return result.scalar_one_or_none()


async def create_project(session: AsyncSession, owner: User, payload: ProjectCreate) -> Project:
    project = Project(owner_id=owner.id, **payload.model_dump())
    session.add(project)
    await session.flush()
    await log_activity(
        session,
        owner=owner,
        entity_type="project",
        entity_id=project.id,
        action="created",
        message=f"Created project '{project.name}'.",
    )
    await session.commit()
    await session.refresh(project)
    return project


async def update_project(session: AsyncSession, owner: User, project: Project, payload: ProjectUpdate) -> Project:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    await log_activity(
        session,
        owner=owner,
        entity_type="project",
        entity_id=project.id,
        action="updated",
        message=f"Updated project '{project.name}'.",
    )
    await session.commit()
    await session.refresh(project)
    return project


async def delete_project(session: AsyncSession, owner: User, project: Project) -> None:
    project_name = project.name
    await log_activity(
        session,
        owner=owner,
        entity_type="project",
        entity_id=project.id,
        action="deleted",
        message=f"Deleted project '{project_name}'.",
    )
    await session.delete(project)
    await session.commit()
