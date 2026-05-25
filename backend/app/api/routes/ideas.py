from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.serializers import serialize_idea
from app.core.database import get_db_session
from app.models.user import User
from app.schemas.common import ApiMessage
from app.schemas.idea import IdeaCreate, IdeaRead, IdeaStatusUpdate, IdeaUpdate
from app.services.idea_service import (
    create_idea,
    delete_idea,
    freeze_idea,
    get_idea,
    list_ideas,
    soft_delete_idea,
    update_idea,
    update_idea_status,
)


router = APIRouter(prefix="/ideas", tags=["ideas"])


@router.get("", response_model=list[IdeaRead])
async def get_ideas(
    search: str | None = None,
    status: str | None = None,
    category: str | None = None,
    confidentiality: str | None = None,
    maturity: str | None = None,
    project_id: int | None = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> list[IdeaRead]:
    ideas = await list_ideas(
        session,
        current_user,
        search=search,
        status=status,
        category=category,
        confidentiality=confidentiality,
        maturity=maturity,
        project_id=project_id,
    )
    return [serialize_idea(idea) for idea in ideas]


@router.post("", response_model=IdeaRead, status_code=201)
async def post_idea(
    payload: IdeaCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> IdeaRead:
    return serialize_idea(await create_idea(session, current_user, payload))


@router.get("/{idea_id}", response_model=IdeaRead)
async def get_idea_by_id(
    idea_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> IdeaRead:
    idea = await get_idea(session, current_user, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return serialize_idea(idea)


@router.patch("/{idea_id}", response_model=IdeaRead)
async def patch_idea(
    idea_id: int,
    payload: IdeaUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> IdeaRead:
    idea = await get_idea(session, current_user, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return serialize_idea(await update_idea(session, current_user, idea, payload))


@router.patch("/{idea_id}/status", response_model=IdeaRead)
async def patch_idea_status(
    idea_id: int,
    payload: IdeaStatusUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> IdeaRead:
    idea = await get_idea(session, current_user, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return serialize_idea(await update_idea_status(session, current_user, idea, payload))


@router.patch("/{idea_id}/freeze", response_model=IdeaRead)
async def patch_idea_freeze(
    idea_id: int,
    decision_note: str | None = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> IdeaRead:
    idea = await get_idea(session, current_user, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return serialize_idea(await freeze_idea(session, current_user, idea, decision_note))


@router.patch("/{idea_id}/soft-delete", response_model=IdeaRead)
async def patch_idea_soft_delete(
    idea_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> IdeaRead:
    idea = await get_idea(session, current_user, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return serialize_idea(await soft_delete_idea(session, current_user, idea))


@router.delete("/{idea_id}", response_model=ApiMessage)
async def remove_idea(
    idea_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ApiMessage:
    idea = await get_idea(session, current_user, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found.")
    await delete_idea(session, current_user, idea)
    return ApiMessage(message="Idea deleted.")
