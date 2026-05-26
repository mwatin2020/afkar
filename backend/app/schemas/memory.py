from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import BaseReadSchema


class MemoryCreate(BaseModel):
    content: str = Field(min_length=1)


class MemoryUpdate(BaseModel):
    content: str | None = Field(default=None, min_length=1)
    is_completed: bool | None = None


class MemoryRead(BaseReadSchema):
    content: str
    is_completed: bool
