from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.enums import IdeaCategory, IdeaConfidentiality, IdeaMaturity, IdeaStatus


class Idea(BaseModel):
    __tablename__ = "ideas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[str] = mapped_column(Text(), nullable=False)
    category: Mapped[IdeaCategory] = mapped_column(
        Enum(IdeaCategory, name="idea_category"),
        default=IdeaCategory.OTHER,
        nullable=False,
        index=True,
    )
    confidentiality: Mapped[IdeaConfidentiality] = mapped_column(
        Enum(IdeaConfidentiality, name="idea_confidentiality"),
        default=IdeaConfidentiality.MEDIUM,
        nullable=False,
        index=True,
    )
    maturity: Mapped[IdeaMaturity] = mapped_column(
        Enum(IdeaMaturity, name="idea_maturity"),
        default=IdeaMaturity.RAW,
        nullable=False,
        index=True,
    )
    status: Mapped[IdeaStatus] = mapped_column(
        Enum(IdeaStatus, name="idea_status"),
        default=IdeaStatus.RAW,
        nullable=False,
        index=True,
    )
    decision_note: Mapped[str | None] = mapped_column(Text(), nullable=True)
    frozen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)

    owner = relationship("User", back_populates="ideas")
    project = relationship("Project", back_populates="ideas")
    tag_links = relationship("IdeaTag", back_populates="idea", cascade="all, delete-orphan")
