from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    SetupRequest,
    SetupStatusResponse,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import (
    InvalidCredentialsError,
    SetupAlreadyCompletedError,
    authenticate_user,
    create_initial_admin,
    requires_setup,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/setup-status", response_model=SetupStatusResponse)
async def get_setup_status(session: AsyncSession = Depends(get_db_session)) -> SetupStatusResponse:
    return SetupStatusResponse(requires_setup=await requires_setup(session))


@router.post("/setup")
async def post_setup(
    payload: SetupRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, UserResponse | TokenResponse]:
    try:
        user, token = await create_initial_admin(session, payload)
    except SetupAlreadyCompletedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Initial setup has already been completed.",
        ) from exc

    return {
        "user": UserResponse.model_validate(user),
        "token": TokenResponse(access_token=token),
    }


@router.post("/login")
async def post_login(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, UserResponse | TokenResponse]:
    try:
        user, token = await authenticate_user(session, payload)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        ) from exc

    return {
        "user": UserResponse.model_validate(user),
        "token": TokenResponse(access_token=token),
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
