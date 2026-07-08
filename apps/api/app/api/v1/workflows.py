from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.workflow import WorkflowCreate, WorkflowResponse
from app.services.workflow_service import WorkflowService

router = APIRouter(prefix="/api/v1/workflows", tags=["workflows"])


@router.post("", response_model=WorkflowResponse)
async def create_workflow(
    req: WorkflowCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkflowService(db)
    return await service.create(req)


@router.get("/project/{project_id}", response_model=list[WorkflowResponse])
async def list_workflows(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkflowService(db)
    return await service.list_by_project(project_id)


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = WorkflowService(db)
    workflow = await service.get(workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow
