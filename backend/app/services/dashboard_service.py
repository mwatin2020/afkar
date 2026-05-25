from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import IdeaStatus, ProjectStatus, TaskStatus
from app.models.idea import Idea
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.dashboard import DashboardSummary


async def get_dashboard_summary(session: AsyncSession, owner: User) -> DashboardSummary:
    total_projects = await session.scalar(select(func.count()).select_from(Project).where(Project.owner_id == owner.id)) or 0
    active_projects = await session.scalar(
        select(func.count()).select_from(Project).where(Project.owner_id == owner.id, Project.status == ProjectStatus.ACTIVE)
    ) or 0
    total_tasks = await session.scalar(select(func.count()).select_from(Task).where(Task.owner_id == owner.id)) or 0
    open_tasks = await session.scalar(
        select(func.count()).select_from(Task).where(Task.owner_id == owner.id, Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED]))
    ) or 0
    completed_tasks = await session.scalar(
        select(func.count()).select_from(Task).where(Task.owner_id == owner.id, Task.status == TaskStatus.DONE)
    ) or 0
    total_ideas = await session.scalar(select(func.count()).select_from(Idea).where(Idea.owner_id == owner.id)) or 0
    sandbox_ideas = await session.scalar(
        select(func.count()).select_from(Idea).where(Idea.owner_id == owner.id, Idea.status == IdeaStatus.SANDBOX)
    ) or 0
    approved_ideas = await session.scalar(
        select(func.count()).select_from(Idea).where(Idea.owner_id == owner.id, Idea.status == IdeaStatus.APPROVED)
    ) or 0
    frozen_ideas = await session.scalar(
        select(func.count()).select_from(Idea).where(Idea.owner_id == owner.id, Idea.status == IdeaStatus.FROZEN)
    ) or 0

    return DashboardSummary(
        total_projects=total_projects,
        active_projects=active_projects,
        total_tasks=total_tasks,
        open_tasks=open_tasks,
        completed_tasks=completed_tasks,
        total_ideas=total_ideas,
        sandbox_ideas=sandbox_ideas,
        approved_ideas=approved_ideas,
        frozen_ideas=frozen_ideas,
    )
