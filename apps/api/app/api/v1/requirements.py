from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.requirement import RequirementCreate, RequirementResponse
from app.services.requirement_service import RequirementService

router = APIRouter(prefix="/api/v1/requirements", tags=["requirements"])


@router.post("", response_model=RequirementResponse)
async def create_requirement(
    req: RequirementCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = RequirementService(db)
    return await service.create(req)


@router.get("/project/{project_id}", response_model=list[RequirementResponse])
async def list_requirements(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = RequirementService(db)
    return await service.get_by_project(project_id)


@router.patch("/{req_id}", response_model=RequirementResponse)
async def update_requirement(
    req_id: str,
    updates: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = RequirementService(db)
    result = await service.update(req_id, updates)
    if result is None:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return result
