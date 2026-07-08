from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.architecture import ArchitectureCreate, ArchitectureResponse
from app.services.architecture_service import ArchitectureService

router = APIRouter(prefix="/api/v1/architecture", tags=["architecture"])


@router.post("", response_model=ArchitectureResponse)
async def create_architecture(
    req: ArchitectureCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ArchitectureService(db)
    return await service.create(req)


@router.get("/project/{project_id}", response_model=list[ArchitectureResponse])
async def list_architectures(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ArchitectureService(db)
    return await service.get_by_project(project_id)


@router.patch("/{arch_id}", response_model=ArchitectureResponse)
async def update_architecture(
    arch_id: str,
    updates: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ArchitectureService(db)
    result = await service.update(arch_id, updates)
    if result is None:
        raise HTTPException(status_code=404, detail="Architecture not found")
    return result
