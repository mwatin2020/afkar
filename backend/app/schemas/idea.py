from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import IdeaCategory, IdeaConfidentiality, IdeaMaturity, IdeaStatus
from app.schemas.common import BaseReadSchema
from app.schemas.tag import TagRead


class IdeaCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    summary: str = Field(min_length=2, max_length=500)
    content: str = Field(min_length=2)
    category: IdeaCategory = IdeaCategory.OTHER
    confidentiality: IdeaConfidentiality = IdeaConfidentiality.MEDIUM
    maturity: IdeaMaturity = IdeaMaturity.RAW
    status: IdeaStatus = IdeaStatus.RAW
    decision_note: str | None = None
    project_id: int | None = None
    tag_ids: list[int] = []


class IdeaUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    summary: str | None = Field(default=None, min_length=2, max_length=500)
    content: str | None = Field(default=None, min_length=2)
    category: IdeaCategory | None = None
    confidentiality: IdeaConfidentiality | None = None
    maturity: IdeaMaturity | None = None
    status: IdeaStatus | None = None
    decision_note: str | None = None
    project_id: int | None = None
    tag_ids: list[int] | None = None


class IdeaStatusUpdate(BaseModel):
    status: IdeaStatus
    decision_note: str | None = None


class IdeaRead(BaseReadSchema):
    title: str
    summary: str
    content: str
    category: IdeaCategory
    confidentiality: IdeaConfidentiality
    maturity: IdeaMaturity
    status: IdeaStatus
    decision_note: str | None
    frozen_at: datetime | None
    deleted_at: datetime | None
    project_id: int | None
    project_name: str | None
    tags: list[TagRead]
