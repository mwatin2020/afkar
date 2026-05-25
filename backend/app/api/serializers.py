from __future__ import annotations

from app.models.idea import Idea
from app.models.task import Task
from app.schemas.idea import IdeaRead
from app.schemas.tag import TagRead
from app.schemas.task import TaskRead


def serialize_task(task: Task) -> TaskRead:
    tags = [TagRead.model_validate(link.tag) for link in task.tag_links if link.tag is not None]
    return TaskRead(
        id=task.id,
        created_at=task.created_at,
        updated_at=task.updated_at,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        completed_at=task.completed_at,
        archived_at=task.archived_at,
        project_id=task.project_id,
        project_name=task.project.name if task.project else None,
        tags=tags,
    )


def serialize_idea(idea: Idea) -> IdeaRead:
    tags = [TagRead.model_validate(link.tag) for link in idea.tag_links if link.tag is not None]
    return IdeaRead(
        id=idea.id,
        created_at=idea.created_at,
        updated_at=idea.updated_at,
        title=idea.title,
        summary=idea.summary,
        content=idea.content,
        category=idea.category,
        confidentiality=idea.confidentiality,
        maturity=idea.maturity,
        status=idea.status,
        decision_note=idea.decision_note,
        frozen_at=idea.frozen_at,
        deleted_at=idea.deleted_at,
        project_id=idea.project_id,
        project_name=idea.project.name if idea.project else None,
        tags=tags,
    )
