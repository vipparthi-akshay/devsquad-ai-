import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import AgentDefinition, AgentRun, AgentStatus, AgentType
from app.models.approval import Approval, ApprovalStatus
from app.models.architecture import Architecture
from app.models.artifact import Artifact
from app.models.event import Event
from app.models.requirement import Requirement
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.workflow import Workflow, WorkflowStatus
from app.providers.base import AIProvider
from app.providers.mock_provider import MockAIProvider


class DemoWorkflowOrchestrator:
    def __init__(self, db: AsyncSession, ai_provider: AIProvider | None = None):
        self.db = db
        self.ai_provider = ai_provider or MockAIProvider()
        self.project_id: str | None = None
        self.workflow_id: str | None = None
        self.requirement_id: str | None = None
        self.architecture_id: str | None = None

    async def run_demo(self, project_id: str, input_text: str) -> dict:
        self.project_id = project_id

        workflow = Workflow(
            project_id=uuid.UUID(project_id),
            name="RetailFlow - Full Demo",
            description="End-to-end demo workflow: requirements, architecture, planning, code, review",
            workflow_type="DEMO",
            status=WorkflowStatus.PLANNING,
            current_stage="REQUIREMENTS_ANALYSIS",
        )
        self.db.add(workflow)
        await self.db.flush()
        self.workflow_id = str(workflow.id)

        await self._create_event("WORKFLOW_STARTED", "Demo workflow started - RetailFlow")

        await self._run_requirements_agent(input_text)
        await self._run_architecture_agent()
        await self._run_task_planning_agent()
        await self._run_code_generation_agent()
        await self._run_security_review_agent()
        await self._run_qa_agent()
        await self._request_approval()

        workflow.status = WorkflowStatus.WAITING_FOR_APPROVAL
        workflow.current_stage = "AWAITING_APPROVAL"
        await self.db.flush()

        return {"workflow_id": self.workflow_id, "status": "WAITING_FOR_APPROVAL"}

    async def continue_after_approval(self, workflow_id: str) -> dict:
        result = await self.db.execute(
            select(Workflow).where(Workflow.id == uuid.UUID(workflow_id))
        )
        workflow = result.scalar_one_or_none()
        if not workflow:
            return {"error": "Workflow not found"}

        workflow.status = WorkflowStatus.COMPLETED
        workflow.current_stage = "PULL_REQUEST_READY"
        await self.db.flush()

        await self._create_event("WORKFLOW_COMPLETED", "Demo workflow completed - PR draft ready")

        return {
            "workflow_id": workflow_id,
            "status": "COMPLETED",
            "message": "Pull request draft prepared successfully. All stages completed.",
        }

    async def _run_requirements_agent(self, input_text: str):
        agent = await self._get_or_create_agent(AgentType.REQUIREMENTS_ANALYST, "Requirements Analyst")
        run = AgentRun(
            agent_id=agent.id,
            workflow_id=uuid.UUID(self.workflow_id) if self.workflow_id else None,
            project_id=uuid.UUID(self.project_id),
            status="RUNNING",
            model_provider=self.ai_provider.provider_name,
            model_identifier=self.ai_provider.model_name,
            prompt_version="1.0",
            start_time=datetime.now(UTC).isoformat(),
        )
        self.db.add(run)
        await self.db.flush()

        await self._create_event("AGENT_STARTED", "Requirements Analyst analyzing product idea",
                                  agent_type="REQUIREMENTS_ANALYST")

        output = await self.ai_provider.generate_structured(
            f"Analyze the following product idea and produce structured requirements: {input_text}",
            {"type": "object", "properties": {"problem_statement": {"type": "string"}}}
        )

        requirement = Requirement(
            project_id=uuid.UUID(self.project_id),
            input_text=input_text,
            problem_statement=output.get("problem_statement", ""),
            personas=output.get("personas"),
            user_journeys=output.get("user_journeys"),
            functional_requirements=output.get("functional_requirements"),
            non_functional_requirements=output.get("non_functional_requirements"),
            assumptions=output.get("assumptions"),
            constraints=output.get("constraints"),
            risks=output.get("risks"),
            acceptance_criteria=output.get("acceptance_criteria"),
            mvp_scope=output.get("mvp_scope"),
            future_scope=output.get("future_scope"),
            status="DRAFT",
        )
        self.db.add(requirement)
        await self.db.flush()
        self.requirement_id = str(requirement.id)

        usage = self.ai_provider.get_last_token_usage()
        run.status = "COMPLETED"
        run.end_time = datetime.now(UTC).isoformat()
        run.output_data = output
        run.token_usage_prompt = usage.prompt_tokens
        run.token_usage_completion = usage.completion_tokens
        run.estimated_cost = usage.estimated_cost

        artifact = Artifact(
            agent_run_id=run.id,
            name="Requirements Analysis",
            artifact_type="REQUIREMENTS",
            content_json=output,
        )
        self.db.add(artifact)
        await self.db.flush()

        await self._create_event("AGENT_COMPLETED", "Requirements analysis complete - PRD draft created",
                                  agent_type="REQUIREMENTS_ANALYST")

    async def _run_architecture_agent(self):
        agent = await self._get_or_create_agent(AgentType.SYSTEM_ARCHITECT, "System Architect")
        run = AgentRun(
            agent_id=agent.id,
            workflow_id=uuid.UUID(self.workflow_id) if self.workflow_id else None,
            project_id=uuid.UUID(self.project_id),
            status="RUNNING",
            model_provider=self.ai_provider.provider_name,
            model_identifier=self.ai_provider.model_name,
            prompt_version="1.0",
            start_time=datetime.now(UTC).isoformat(),
        )
        self.db.add(run)
        await self.db.flush()

        await self._create_event("AGENT_STARTED", "System Architect designing architecture",
                                  agent_type="SYSTEM_ARCHITECT")

        output = await self.ai_provider.generate_structured(
            "Design a system architecture for a multi-tenant inventory SaaS for small retailers. "
            "Include component model, deployment model, API boundaries, data flow, and risks.",
            {"type": "object", "properties": {"summary": {"type": "string"}}}
        )

        arch = Architecture(
            project_id=uuid.UUID(self.project_id),
            summary=output.get("summary", ""),
            component_model=output.get("component_model"),
            deployment_model=output.get("deployment_model"),
            api_boundaries=output.get("api_boundaries"),
            data_flow=output.get("data_flow"),
            risks=output.get("risks"),
            alternatives=output.get("alternatives"),
            decisions=output.get("decisions"),
            mermaid_diagram=output.get("mermaid_diagram"),
            status="DRAFT",
        )
        self.db.add(arch)
        await self.db.flush()
        self.architecture_id = str(arch.id)

        usage = self.ai_provider.get_last_token_usage()
        run.status = "COMPLETED"
        run.end_time = datetime.now(UTC).isoformat()
        run.output_data = output
        run.token_usage_prompt = usage.prompt_tokens
        run.token_usage_completion = usage.completion_tokens
        run.estimated_cost = usage.estimated_cost

        artifact = Artifact(
            agent_run_id=run.id,
            name="Architecture Design",
            artifact_type="ARCHITECTURE",
            content_json=output,
        )
        self.db.add(artifact)
        await self.db.flush()

        await self._create_event("AGENT_COMPLETED", "Architecture proposed - modular monolith with PostgreSQL",
                                  agent_type="SYSTEM_ARCHITECT")
        await self._create_event("RISK_IDENTIFIED",
                                  "Scaling risk: Database scaling at high tenant count - mitigation: read replicas",
                                  agent_type="SYSTEM_ARCHITECT")

    async def _run_task_planning_agent(self):
        agent = await self._get_or_create_agent(AgentType.BACKEND_ENGINEER, "Task Planner")
        run = AgentRun(
            agent_id=agent.id,
            workflow_id=uuid.UUID(self.workflow_id) if self.workflow_id else None,
            project_id=uuid.UUID(self.project_id),
            status="RUNNING",
            model_provider=self.ai_provider.provider_name,
            model_identifier=self.ai_provider.model_name,
            prompt_version="1.0",
            start_time=datetime.now(UTC).isoformat(),
        )
        self.db.add(run)
        await self.db.flush()

        await self._create_event("AGENT_STARTED", "Task Planner creating work breakdown",
                                  agent_type="BACKEND_ENGINEER")

        output = await self.ai_provider.generate_structured(
            "Create a task plan for building a multi-tenant inventory SaaS. Include epics, stories, and tasks.",
            {"type": "object", "properties": {"tasks": {"type": "array"}}}
        )

        tasks_data = output.get("tasks", [])
        for i, task_data in enumerate(tasks_data):
            task = Task(
                project_id=uuid.UUID(self.project_id),
                title=task_data.get("title", f"Task {i+1}"),
                description=task_data.get("description"),
                priority=TaskPriority(task_data.get("priority", "MEDIUM")),
                status=TaskStatus.READY,
                assignee_agent=task_data.get("assignee_agent", "BACKEND_ENGINEER"),
                estimate=task_data.get("estimate"),
                sort_order=i,
            )
            self.db.add(task)

        await self.db.flush()

        usage = self.ai_provider.get_last_token_usage()
        run.status = "COMPLETED"
        run.end_time = datetime.now(UTC).isoformat()
        run.output_data = output
        run.token_usage_prompt = usage.prompt_tokens
        run.token_usage_completion = usage.completion_tokens

        artifact = Artifact(
            agent_run_id=run.id,
            name="Task Plan",
            artifact_type="TASK_PLAN",
            content_json=output,
        )
        self.db.add(artifact)
        await self.db.flush()

        await self._create_event("AGENT_COMPLETED", f"Task plan created with {len(tasks_data)} tasks",
                                  agent_type="BACKEND_ENGINEER")

    async def _run_code_generation_agent(self):
        agent = await self._get_or_create_agent(AgentType.BACKEND_ENGINEER, "Backend Engineer")
        run = AgentRun(
            agent_id=agent.id,
            workflow_id=uuid.UUID(self.workflow_id) if self.workflow_id else None,
            project_id=uuid.UUID(self.project_id),
            status="RUNNING",
            model_provider=self.ai_provider.provider_name,
            model_identifier=self.ai_provider.model_name,
            prompt_version="1.0",
            start_time=datetime.now(UTC).isoformat(),
        )
        self.db.add(run)
        await self.db.flush()

        await self._create_event("AGENT_STARTED", "Backend Engineer implementing inventory service",
                                  agent_type="BACKEND_ENGINEER")

        output = {
            "files_proposed": [
                "app/services/inventory_service.py",
                "app/models/product.py",
                "app/api/v1/inventory.py",
            ],
            "summary": "Implemented inventory management service with CRUD operations, stock tracking, and tenant isolation.",
            "changes": [
                {"file": "app/models/product.py", "action": "CREATE", "summary": "Product model with tenant ID"},
                {"file": "app/services/inventory_service.py", "action": "CREATE", "summary": "Inventory service with stock management"},
                {"file": "app/api/v1/inventory.py", "action": "CREATE", "summary": "REST API endpoints for inventory"},
            ],
        }

        usage = self.ai_provider.get_last_token_usage()
        run.status = "COMPLETED"
        run.end_time = datetime.now(UTC).isoformat()
        run.output_data = output
        run.token_usage_prompt = usage.prompt_tokens
        run.token_usage_completion = usage.completion_tokens

        artifact = Artifact(
            agent_run_id=run.id,
            name="Code Changes",
            artifact_type="CODE_CHANGE",
            content_json=output,
            file_paths=output.get("files_proposed"),
        )
        self.db.add(artifact)
        await self.db.flush()

        await self._create_event("CHANGE_PROPOSED", "3 files proposed for inventory service",
                                  agent_type="BACKEND_ENGINEER")

    async def _run_security_review_agent(self):
        agent = await self._get_or_create_agent(AgentType.SECURITY_ENGINEER, "Security Engineer")
        run = AgentRun(
            agent_id=agent.id,
            workflow_id=uuid.UUID(self.workflow_id) if self.workflow_id else None,
            project_id=uuid.UUID(self.project_id),
            status="RUNNING",
            model_provider=self.ai_provider.provider_name,
            model_identifier=self.ai_provider.model_name,
            prompt_version="1.0",
            start_time=datetime.now(UTC).isoformat(),
        )
        self.db.add(run)
        await self.db.flush()

        await self._create_event("AGENT_STARTED", "Security Engineer reviewing code changes",
                                  agent_type="SECURITY_ENGINEER")

        output = await self.ai_provider.generate_structured(
            "Perform a security review of the inventory service code. Check for auth issues, injection risks, and tenant isolation.",
            {"type": "object", "properties": {"summary": {"type": "string"}}}
        )

        usage = self.ai_provider.get_last_token_usage()
        run.status = "COMPLETED"
        run.end_time = datetime.now(UTC).isoformat()
        run.output_data = output
        run.token_usage_prompt = usage.prompt_tokens
        run.token_usage_completion = usage.completion_tokens

        artifact = Artifact(
            agent_run_id=run.id,
            name="Security Review",
            artifact_type="SECURITY_REVIEW",
            content_json=output,
        )
        self.db.add(artifact)
        await self.db.flush()

        await self._create_event("REVIEW_COMPLETED",
                                  "Security review: 1 medium-severity authorization issue found",
                                  agent_type="SECURITY_ENGINEER")

    async def _run_qa_agent(self):
        agent = await self._get_or_create_agent(AgentType.QA_ENGINEER, "QA Engineer")
        run = AgentRun(
            agent_id=agent.id,
            workflow_id=uuid.UUID(self.workflow_id) if self.workflow_id else None,
            project_id=uuid.UUID(self.project_id),
            status="RUNNING",
            model_provider=self.ai_provider.provider_name,
            model_identifier=self.ai_provider.model_name,
            prompt_version="1.0",
            start_time=datetime.now(UTC).isoformat(),
        )
        self.db.add(run)
        await self.db.flush()

        await self._create_event("AGENT_STARTED", "QA Engineer creating test plan",
                                  agent_type="QA_ENGINEER")

        output = await self.ai_provider.generate_structured(
            "Create a test plan for the inventory management system. Include unit, integration, and E2E tests.",
            {"type": "object", "properties": {"summary": {"type": "string"}}}
        )

        usage = self.ai_provider.get_last_token_usage()
        run.status = "COMPLETED"
        run.end_time = datetime.now(UTC).isoformat()
        run.output_data = output
        run.token_usage_prompt = usage.prompt_tokens
        run.token_usage_completion = usage.completion_tokens

        artifact = Artifact(
            agent_run_id=run.id,
            name="Test Plan",
            artifact_type="TEST_PLAN",
            content_json=output,
        )
        self.db.add(artifact)
        await self.db.flush()

        await self._create_event("TEST_EXECUTED", "QA Agent generated comprehensive test plan",
                                  agent_type="QA_ENGINEER")

    async def _request_approval(self):
        approval = Approval(
            project_id=uuid.UUID(self.project_id),
            workflow_id=uuid.UUID(self.workflow_id) if self.workflow_id else None,
            title="Approve Demo Workflow - RetailFlow",
            description="The full demo workflow has completed all stages. Review and approve to prepare the pull request.",
            status=ApprovalStatus.PENDING,
            requesting_agent="Workflow Orchestrator",
            proposed_action="Prepare pull request with all proposed changes",
            reason="All agents have completed their tasks. Human approval is required before creating a PR.",
            affected_files=[
                "app/services/inventory_service.py",
                "app/models/product.py",
                "app/api/v1/inventory.py",
            ],
            command_preview="git checkout -b feature/retailflow-inventory && git add . && git commit -m 'Add inventory management'",
            risk_level="MEDIUM",
            expected_impact="Creates 3 new files for inventory management functionality.",
        )
        self.db.add(approval)
        await self.db.flush()

        await self._create_event("APPROVAL_REQUESTED",
                                  "Human approval required for pull request preparation")

    async def _get_or_create_agent(self, agent_type: AgentType, name: str) -> AgentDefinition:
        result = await self.db.execute(
            select(AgentDefinition).where(AgentDefinition.agent_type == agent_type)
        )
        agent = result.scalar_one_or_none()
        if agent is None:
            agent = AgentDefinition(
                name=name,
                agent_type=agent_type,
                description=f"{name} agent for automated software engineering tasks",
                capabilities=["analysis", "generation", "review"],
                is_active=AgentStatus.IDLE,
            )
            self.db.add(agent)
            await self.db.flush()
        return agent

    async def _create_event(self, event_type: str, title: str, agent_type: str | None = None):
        event = Event(
            project_id=uuid.UUID(self.project_id) if self.project_id else None,
            event_type=event_type,
            title=title,
            agent_type=agent_type,
        )
        self.db.add(event)
