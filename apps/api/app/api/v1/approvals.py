from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.approval import ApprovalAction, ApprovalResponse
from app.services.approval_service import ApprovalService

router = APIRouter(prefix="/api/v1/approvals", tags=["approvals"])


@router.get("/project/{project_id}", response_model=list[ApprovalResponse])
async def list_approvals(
    project_id: str,
    pending_only: bool = False,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ApprovalService(db)
    if pending_only:
        return await service.list_pending(project_id)
    return await service.list_all(project_id)


@router.post("/{approval_id}/act", response_model=ApprovalResponse)
async def act_on_approval(
    approval_id: str,
    action: ApprovalAction,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ApprovalService(db)
    try:
        result = await service.act(approval_id, action, str(user.id))
        if result is None:
            raise HTTPException(status_code=404, detail="Approval not found")
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
