from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tag import Tag
from app.models.user import User
from app.schemas.tag import TagCreate, TagUpdate
from app.services.activity_service import log_activity


async def list_tags(session: AsyncSession, owner: User) -> list[Tag]:
    result = await session.execute(select(Tag).where(Tag.owner_id == owner.id).order_by(Tag.name.asc()))
    return list(result.scalars().all())


async def get_tag(session: AsyncSession, owner: User, tag_id: int) -> Tag | None:
    result = await session.execute(select(Tag).where(Tag.owner_id == owner.id, Tag.id == tag_id))
    return result.scalar_one_or_none()


async def create_tag(session: AsyncSession, owner: User, payload: TagCreate) -> Tag:
    tag = Tag(owner_id=owner.id, **payload.model_dump())
    session.add(tag)
    await session.flush()
    await log_activity(
        session,
        owner=owner,
        entity_type="tag",
        entity_id=tag.id,
        action="created",
        message=f"Created tag '{tag.name}'.",
    )
    await session.commit()
    await session.refresh(tag)
    return tag


async def update_tag(session: AsyncSession, owner: User, tag: Tag, payload: TagUpdate) -> Tag:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(tag, field, value)
    await log_activity(
        session,
        owner=owner,
        entity_type="tag",
        entity_id=tag.id,
        action="updated",
        message=f"Updated tag '{tag.name}'.",
    )
    await session.commit()
    await session.refresh(tag)
    return tag


async def delete_tag(session: AsyncSession, owner: User, tag: Tag) -> None:
    tag_name = tag.name
    await log_activity(
        session,
        owner=owner,
        entity_type="tag",
        entity_id=tag.id,
        action="deleted",
        message=f"Deleted tag '{tag_name}'.",
    )
    await session.delete(tag)
    await session.commit()
