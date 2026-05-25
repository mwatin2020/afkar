from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import User
from app.schemas.activity import ActivityRead
from app.services.activity_service import list_activity


router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("", response_model=list[ActivityRead])
async def get_activity(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> list[ActivityRead]:
    activity = await list_activity(session, current_user)
    return [ActivityRead.model_validate(item) for item in activity]
