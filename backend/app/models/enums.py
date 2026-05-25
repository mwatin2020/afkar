from __future__ import annotations

from enum import StrEnum


class ProjectStatus(StrEnum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    ARCHIVED = "ARCHIVED"


class TaskStatus(StrEnum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    DONE = "DONE"
    ARCHIVED = "ARCHIVED"


class TaskPriority(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IdeaCategory(StrEnum):
    PRODUCT = "PRODUCT"
    TECHNICAL = "TECHNICAL"
    PHILOSOPHY = "PHILOSOPHY"
    BUSINESS = "BUSINESS"
    PATENT = "PATENT"
    PERSONAL = "PERSONAL"
    OTHER = "OTHER"


class IdeaConfidentiality(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    SECRET = "SECRET"


class IdeaMaturity(StrEnum):
    RAW = "RAW"
    EARLY = "EARLY"
    MEDIUM = "MEDIUM"
    STRONG = "STRONG"
    READY = "READY"


class IdeaStatus(StrEnum):
    RAW = "RAW"
    SANDBOX = "SANDBOX"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    FROZEN = "FROZEN"
    DELETED = "DELETED"
