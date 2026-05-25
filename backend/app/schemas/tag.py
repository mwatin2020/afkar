from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import BaseReadSchema


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    color: str | None = Field(default=None, max_length=32)


class TagUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=64)
    color: str | None = Field(default=None, max_length=32)


class TagRead(BaseReadSchema):
    name: str
    color: str | None
