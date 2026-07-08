import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.approval import Approval, ApprovalStatus
from app.models.event import Event
from app.schemas.approval import ApprovalAction, ApprovalResponse


class ApprovalService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, project_id: str, title: str, description: str | None = None,
                     requesting_agent: str | None = None, proposed_action: str | None = None,
                     reason: str | None = None, affected_files: list | None = None,
                     command_preview: str | None = None, risk_level: str = "LOW",
                     expected_impact: str | None = None,
                     workflow_id: str | None = None,
                     agent_run_id: str | None = None) -> ApprovalResponse:
        approval = Approval(
            project_id=uuid.UUID(project_id),
            workflow_id=uuid.UUID(workflow_id) if workflow_id else None,
            agent_run_id=uuid.UUID(agent_run_id) if agent_run_id else None,
            title=title,
            description=description,
            requesting_agent=requesting_agent,
            proposed_action=proposed_action,
            reason=reason,
            affected_files=affected_files,
            command_preview=command_preview,
            risk_level=risk_level,
            expected_impact=expected_impact,
            status=ApprovalStatus.PENDING,
        )
        self.db.add(approval)
        await self.db.flush()

        event = Event(
            project_id=uuid.UUID(project_id),
            event_type="APPROVAL_REQUESTED",
            title=f"Approval requested: {title}",
            agent_type=requesting_agent,
        )
        self.db.add(event)
        await self.db.flush()

        return self._to_response(approval)

    async def list_pending(self, project_id: str) -> list[ApprovalResponse]:
        result = await self.db.execute(
            select(Approval)
            .where(Approval.project_id == uuid.UUID(project_id))
            .where(Approval.status == ApprovalStatus.PENDING)
            .order_by(Approval.created_at.desc())
        )
        approvals = result.scalars().all()
        return [self._to_response(a) for a in approvals]

    async def list_all(self, project_id: str) -> list[ApprovalResponse]:
        result = await self.db.execute(
            select(Approval)
            .where(Approval.project_id == uuid.UUID(project_id))
            .order_by(Approval.created_at.desc())
        )
        approvals = result.scalars().all()
        return [self._to_response(a) for a in approvals]

    async def act(self, approval_id: str, action: ApprovalAction, user_id: str) -> ApprovalResponse | None:
        result = await self.db.execute(select(Approval).where(Approval.id == uuid.UUID(approval_id)))
        approval = result.scalar_one_or_none()
        if approval is None:
            return None

        if action.action == "APPROVE":
            approval.status = ApprovalStatus.APPROVED
            approval.approved_by = uuid.UUID(user_id)
            approval.reviewed_at = datetime.now(UTC).isoformat()
        elif action.action == "REJECT":
            approval.status = ApprovalStatus.REJECTED
            approval.approved_by = uuid.UUID(user_id)
            approval.reviewed_at = datetime.now(UTC).isoformat()
            approval.rejection_reason = action.rejection_reason
        else:
            raise ValueError(f"Unknown action: {action.action}")

        await self.db.flush()

        event_type = "APPROVAL_GRANTED" if action.action == "APPROVE" else "APPROVAL_REJECTED"
        event = Event(
            project_id=approval.project_id,
            event_type=event_type,
            title=f"Approval {action.action.lower()}d: {approval.title}",
        )
        self.db.add(event)
        await self.db.flush()

        return self._to_response(approval)

    def _to_response(self, a: Approval) -> ApprovalResponse:
        return ApprovalResponse(
            id=str(a.id),
            project_id=str(a.project_id),
            workflow_id=str(a.workflow_id) if a.workflow_id else None,
            agent_run_id=str(a.agent_run_id) if a.agent_run_id else None,
            title=a.title,
            description=a.description,
            status=a.status.value if hasattr(a.status, 'value') else a.status,
            requesting_agent=a.requesting_agent,
            proposed_action=a.proposed_action,
            reason=a.reason,
            affected_files=a.affected_files,
            command_preview=a.command_preview,
            risk_level=a.risk_level,
            expected_impact=a.expected_impact,
            rejection_reason=a.rejection_reason,
            created_at=a.created_at.isoformat() if a.created_at else None,
        )
