from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.providers.mock_provider import MockAIProvider
from app.workflows.demo_workflow import DemoWorkflowOrchestrator

router = APIRouter(prefix="/api/v1/demo", tags=["demo"])


class DemoStartRequest(BaseModel):
    project_id: str
    input_text: str = "Build a multi-tenant inventory SaaS for small Indian retailers."


class DemoContinueRequest(BaseModel):
    workflow_id: str


@router.post("/start")
async def start_demo(
    req: DemoStartRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        provider = MockAIProvider()
        orchestrator = DemoWorkflowOrchestrator(db, ai_provider=provider)
        result = await orchestrator.run_demo(req.project_id, req.input_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/continue")
async def continue_demo(
    req: DemoContinueRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        provider = MockAIProvider()
        orchestrator = DemoWorkflowOrchestrator(db, ai_provider=provider)
        result = await orchestrator.continue_after_approval(req.workflow_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
