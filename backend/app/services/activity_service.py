from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity_log import ActivityLog
from app.models.user import User


async def log_activity(
    session: AsyncSession,
    *,
    owner: User,
    entity_type: str,
    entity_id: int | None,
    action: str,
    message: str,
    metadata_json: dict | None = None,
) -> ActivityLog:
    activity = ActivityLog(
        owner_id=owner.id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        message=message,
        metadata_json=metadata_json,
    )
    session.add(activity)
    return activity


async def list_activity(session: AsyncSession, owner: User) -> list[ActivityLog]:
    result = await session.execute(
        select(ActivityLog)
        .where(ActivityLog.owner_id == owner.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(200)
    )
    return list(result.scalars().all())
