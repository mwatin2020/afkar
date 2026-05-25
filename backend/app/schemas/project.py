from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.enums import ProjectStatus
from app.schemas.common import BaseReadSchema


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    status: ProjectStatus = ProjectStatus.ACTIVE


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    status: ProjectStatus | None = None


class ProjectRead(BaseReadSchema):
    name: str
    description: str | None
    status: ProjectStatus
