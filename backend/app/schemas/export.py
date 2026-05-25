from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.schemas.activity import ActivityRead
from app.schemas.idea import IdeaRead
from app.schemas.project import ProjectRead
from app.schemas.tag import TagRead
from app.schemas.task import TaskRead
from app.schemas.auth import UserResponse


class ExportPayload(BaseModel):
    exported_at: datetime
    backend_url: str
    user: UserResponse
    projects: list[ProjectRead]
    tasks: list[TaskRead]
    ideas: list[IdeaRead]
    tags: list[TagRead]
    activity: list[ActivityRead]
