from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_workspace_and_check_role
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse
from app.services.project_service import ProjectService

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse)
async def create_project(
    req: ProjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_workspace_and_check_role(req.workspace_id, user, db)
    service = ProjectService(db)
    return await service.create(req, str(user.id))


@router.get("/workspace/{workspace_id}", response_model=list[ProjectResponse])
async def list_projects(
    workspace_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_workspace_and_check_role(workspace_id, user, db)
    service = ProjectService(db)
    return await service.list_by_workspace(workspace_id)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project = await service.get(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
