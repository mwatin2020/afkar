from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import User
from app.schemas.common import ApiMessage
from app.schemas.tag import TagCreate, TagRead, TagUpdate
from app.services.tag_service import create_tag, delete_tag, get_tag, list_tags, update_tag


router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagRead])
async def get_tags(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> list[TagRead]:
    tags = await list_tags(session, current_user)
    return [TagRead.model_validate(tag) for tag in tags]


@router.post("", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def post_tag(
    payload: TagCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> TagRead:
    return TagRead.model_validate(await create_tag(session, current_user, payload))


@router.patch("/{tag_id}", response_model=TagRead)
async def patch_tag(
    tag_id: int,
    payload: TagUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> TagRead:
    tag = await get_tag(session, current_user, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found.")
    return TagRead.model_validate(await update_tag(session, current_user, tag, payload))


@router.delete("/{tag_id}", response_model=ApiMessage)
async def remove_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ApiMessage:
    tag = await get_tag(session, current_user, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found.")
    await delete_tag(session, current_user, tag)
    return ApiMessage(message="Tag deleted.")
