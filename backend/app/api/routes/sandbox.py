from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.serializers import serialize_idea
from app.core.database import get_db_session
from app.models.user import User
from app.schemas.idea import IdeaRead
from app.services.idea_service import list_sandbox_ideas


router = APIRouter(tags=["sandbox"])


@router.get("/ideas/sandbox", response_model=list[IdeaRead])
async def get_sandbox_ideas(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> list[IdeaRead]:
    ideas = await list_sandbox_ideas(session, current_user)
    return [serialize_idea(idea) for idea in ideas]
