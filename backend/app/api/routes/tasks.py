from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.serializers import serialize_task
from app.core.database import get_db_session
from app.models.user import User
from app.schemas.common import ApiMessage
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services.task_service import archive_task, create_task, delete_task, get_task, list_tasks, mark_task_done, update_task


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
async def get_tasks(
    search: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    project_id: int | None = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> list[TaskRead]:
    tasks = await list_tasks(
        session,
        current_user,
        search=search,
        status=status,
        priority=priority,
        project_id=project_id,
    )
    return [serialize_task(task) for task in tasks]


@router.post("", response_model=TaskRead, status_code=201)
async def post_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> TaskRead:
    return serialize_task(await create_task(session, current_user, payload))


@router.get("/{task_id}", response_model=TaskRead)
async def get_task_by_id(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> TaskRead:
    task = await get_task(session, current_user, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    return serialize_task(task)


@router.patch("/{task_id}", response_model=TaskRead)
async def patch_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> TaskRead:
    task = await get_task(session, current_user, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    return serialize_task(await update_task(session, current_user, task, payload))


@router.patch("/{task_id}/done", response_model=TaskRead)
async def patch_task_done(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> TaskRead:
    task = await get_task(session, current_user, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    return serialize_task(await mark_task_done(session, current_user, task))


@router.patch("/{task_id}/archive", response_model=TaskRead)
async def patch_task_archive(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> TaskRead:
    task = await get_task(session, current_user, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    return serialize_task(await archive_task(session, current_user, task))


@router.delete("/{task_id}", response_model=ApiMessage)
async def remove_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ApiMessage:
    task = await get_task(session, current_user, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    await delete_task(session, current_user, task)
    return ApiMessage(message="Task deleted.")
