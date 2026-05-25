from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, SetupRequest


class SetupAlreadyCompletedError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


async def requires_setup(session: AsyncSession) -> bool:
    result = await session.scalar(select(func.count()).select_from(User))
    return result == 0


async def create_initial_admin(session: AsyncSession, payload: SetupRequest) -> tuple[User, str]:
    if not await requires_setup(session):
        raise SetupAlreadyCompletedError

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        is_admin=True,
        is_active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user, create_access_token(str(user.id))


async def authenticate_user(session: AsyncSession, payload: LoginRequest) -> tuple[User, str]:
    result = await session.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.password_hash) or not user.is_active:
        raise InvalidCredentialsError

    return user, create_access_token(str(user.id))


async def get_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    return await session.get(User, user_id)
