from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.user import User
from app.schemas.activity import ActivityRead
from app.schemas.auth import UserResponse
from app.schemas.export import ExportPayload
from app.schemas.idea import IdeaRead
from app.schemas.project import ProjectRead
from app.schemas.tag import TagRead
from app.schemas.task import TaskRead
from app.services.activity_service import list_activity
from app.services.idea_service import list_ideas
from app.services.project_service import list_projects
from app.services.tag_service import list_tags
from app.services.task_service import list_tasks
from app.api.serializers import serialize_idea, serialize_task


settings = get_settings()


async def export_user_data(session: AsyncSession, owner: User) -> ExportPayload:
    projects = await list_projects(session, owner)
    tasks = await list_tasks(session, owner)
    ideas = await list_ideas(session, owner)
    tags = await list_tags(session, owner)
    activity = await list_activity(session, owner)

    return ExportPayload(
        exported_at=datetime.now(UTC),
        backend_url=f"http://{settings.backend_host}:{settings.backend_port}",
        user=UserResponse.model_validate(owner),
        projects=[ProjectRead.model_validate(project) for project in projects],
        tasks=[serialize_task(task) for task in tasks],
        ideas=[serialize_idea(idea) for idea in ideas],
        tags=[TagRead.model_validate(tag) for tag in tags],
        activity=[ActivityRead.model_validate(item) for item in activity],
    )
