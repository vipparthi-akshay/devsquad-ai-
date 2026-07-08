import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.workflow import Workflow, WorkflowStatus
from app.schemas.workflow import WorkflowCreate, WorkflowResponse


class WorkflowService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, req: WorkflowCreate) -> WorkflowResponse:
        workflow = Workflow(
            project_id=uuid.UUID(req.project_id),
            name=req.name,
            description=req.description,
            workflow_type=req.workflow_type or "DEMO",
            status=WorkflowStatus.DRAFT,
        )
        self.db.add(workflow)
        await self.db.flush()

        event = Event(
            project_id=workflow.project_id,
            event_type="WORKFLOW_STARTED",
            title=f"Workflow started: {workflow.name}",
        )
        self.db.add(event)
        await self.db.flush()

        return self._to_response(workflow)

    async def list_by_project(self, project_id: str) -> list[WorkflowResponse]:
        result = await self.db.execute(
            select(Workflow).where(Workflow.project_id == uuid.UUID(project_id)).order_by(Workflow.created_at.desc())
        )
        workflows = result.scalars().all()
        return [self._to_response(w) for w in workflows]

    async def get(self, workflow_id: str) -> WorkflowResponse | None:
        result = await self.db.execute(
            select(Workflow).where(Workflow.id == uuid.UUID(workflow_id))
        )
        w = result.scalar_one_or_none()
        if w is None:
            return None
        return self._to_response(w)

    async def update_status(self, workflow_id: str, status: WorkflowStatus, stage: str | None = None) -> WorkflowResponse | None:
        result = await self.db.execute(select(Workflow).where(Workflow.id == uuid.UUID(workflow_id)))
        w = result.scalar_one_or_none()
        if w is None:
            return None
        w.status = status
        if stage:
            w.current_stage = stage
        await self.db.flush()
        return self._to_response(w)

    def _to_response(self, w: Workflow) -> WorkflowResponse:
        return WorkflowResponse(
            id=str(w.id),
            project_id=str(w.project_id),
            name=w.name,
            description=w.description,
            status=w.status.value if hasattr(w.status, 'value') else w.status,
            workflow_type=w.workflow_type,
            current_stage=w.current_stage,
            created_at=w.created_at.isoformat() if w.created_at else None,
            updated_at=w.updated_at.isoformat() if w.updated_at else None,
        )
