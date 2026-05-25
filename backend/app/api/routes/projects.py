from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.models.user import User
from app.schemas.common import ApiMessage
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.project_service import create_project, delete_project, get_project, list_projects, update_project


router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
async def get_projects(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> list[ProjectRead]:
    projects = await list_projects(session, current_user)
    return [ProjectRead.model_validate(project) for project in projects]


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def post_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ProjectRead:
    project = await create_project(session, current_user, payload)
    return ProjectRead.model_validate(project)


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project_by_id(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ProjectRead:
    project = await get_project(session, current_user, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    return ProjectRead.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectRead)
async def patch_project(
    project_id: int,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ProjectRead:
    project = await get_project(session, current_user, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    return ProjectRead.model_validate(await update_project(session, current_user, project, payload))


@router.delete("/{project_id}", response_model=ApiMessage)
async def remove_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ApiMessage:
    project = await get_project(session, current_user, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    await delete_project(session, current_user, project)
    return ApiMessage(message="Project deleted.")
