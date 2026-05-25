from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import TaskPriority, TaskStatus
from app.schemas.common import BaseReadSchema
from app.schemas.tag import TagRead


class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: datetime | None = None
    project_id: int | None = None
    tag_ids: list[int] = []


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_date: datetime | None = None
    project_id: int | None = None
    tag_ids: list[int] | None = None


class TaskRead(BaseReadSchema):
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    due_date: datetime | None
    completed_at: datetime | None
    archived_at: datetime | None
    project_id: int | None
    project_name: str | None
    tags: list[TagRead]
