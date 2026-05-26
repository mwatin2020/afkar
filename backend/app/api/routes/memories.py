from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import User
from app.schemas.common import ApiMessage
from app.schemas.memory import MemoryCreate, MemoryRead, MemoryUpdate
from app.services.memory_service import (
    create_memory,
    delete_memory,
    get_memory,
    list_active_memories,
    update_memory,
)

router = APIRouter(prefix="/memories", tags=["memories"])


@router.get("", response_model=list[MemoryRead])
async def get_memories(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> list[MemoryRead]:
    memories = await list_active_memories(session, current_user)
    return [MemoryRead.model_validate(m) for m in memories]


@router.post("", response_model=MemoryRead, status_code=status.HTTP_201_CREATED)
async def post_memory(
    payload: MemoryCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> MemoryRead:
    memory = await create_memory(session, current_user, payload)
    return MemoryRead.model_validate(memory)


@router.patch("/{memory_id}", response_model=MemoryRead)
async def patch_memory(
    memory_id: int,
    payload: MemoryUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> MemoryRead:
    memory = await get_memory(session, current_user, memory_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found.")
    updated = await update_memory(session, current_user, memory, payload)
    return MemoryRead.model_validate(updated)


@router.delete("/{memory_id}", response_model=ApiMessage)
async def remove_memory(
    memory_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ApiMessage:
    memory = await get_memory(session, current_user, memory_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found.")
    await delete_memory(session, current_user, memory)
    return ApiMessage(message="Memory deleted.")
