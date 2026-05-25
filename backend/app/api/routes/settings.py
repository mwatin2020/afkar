from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import User
from app.schemas.export import ExportPayload
from app.services.export_service import export_user_data


router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/export", response_model=ExportPayload)
async def get_export(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ExportPayload:
    return await export_user_data(session, current_user)
