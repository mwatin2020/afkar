from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.memory import Memory
from app.models.user import User
from app.schemas.memory import MemoryCreate, MemoryUpdate
from app.services.activity_service import log_activity


async def list_active_memories(session: AsyncSession, owner: User) -> list[Memory]:
    # Returns uncompleted memories, or we can fetch all and filter in frontend. Let's return all uncompleted memories sorted by created_at.
    result = await session.execute(
        select(Memory)
        .where(Memory.owner_id == owner.id, Memory.is_completed == False)
        .order_by(Memory.created_at.desc())
    )
    return list(result.scalars().all())


async def get_memory(session: AsyncSession, owner: User, memory_id: int) -> Memory | None:
    result = await session.execute(
        select(Memory).where(Memory.owner_id == owner.id, Memory.id == memory_id)
    )
    return result.scalar_one_or_none()


async def create_memory(session: AsyncSession, owner: User, payload: MemoryCreate) -> Memory:
    memory = Memory(owner_id=owner.id, **payload.model_dump())
    session.add(memory)
    await session.flush()
    await log_activity(
        session,
        owner=owner,
        entity_type="memory",
        entity_id=memory.id,
        action="created",
        message=f"Jotted down a memory: '{memory.content[:30]}...'",
    )
    await session.commit()
    await session.refresh(memory)
    return memory


async def update_memory(
    session: AsyncSession, owner: User, memory: Memory, payload: MemoryUpdate
) -> Memory:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(memory, field, value)
    
    action = "updated"
    if payload.is_completed:
        action = "completed"
        msg = f"Completed a memory: '{memory.content[:30]}...'"
    else:
        msg = f"Updated a memory: '{memory.content[:30]}...'"
        
    await log_activity(
        session,
        owner=owner,
        entity_type="memory",
        entity_id=memory.id,
        action=action,
        message=msg,
    )
    await session.commit()
    await session.refresh(memory)
    return memory


async def delete_memory(session: AsyncSession, owner: User, memory: Memory) -> None:
    content_preview = memory.content[:30]
    await log_activity(
        session,
        owner=owner,
        entity_type="memory",
        entity_id=memory.id,
        action="deleted",
        message=f"Deleted a memory: '{content_preview}...'",
    )
    await session.delete(memory)
    await session.commit()
