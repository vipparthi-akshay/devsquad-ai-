# DevSquad AI — Complete Project Documentation

> Version 0.1.0 | MIT License | AI-Native Engineering Workspace

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Repository Structure](#3-repository-structure)
4. [Backend API (FastAPI)](#4-backend-api-fastapi)
5. [Frontend (Next.js 14)](#5-frontend-nextjs-14)
6. [Packages (Placeholders)](#6-packages-placeholders)
7. [Database Schema](#7-database-schema)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [AI Providers](#9-ai-providers)
10. [Workflows](#10-workflows)
11. [API Reference](#11-api-reference)
12. [Frontend Routes](#12-frontend-routes)
13. [UI Component Library](#13-ui-component-library)
14. [Infrastructure & DevOps](#14-infrastructure--devops)
15. [Quick Start](#15-quick-start)
16. [Build & Test Commands](#16-build--test-commands)
17. [Environment Variables](#17-environment-variables)
18. [Known Issues](#18-known-issues)
19. [Future Roadmap](#19-future-roadmap)

---

## 1. Project Overview

DevSquad AI is an auditable AI-powered software engineering platform that transforms product requirements into plans, code changes, tests, reviews, and pull requests. It orchestrates a team of specialized AI agents (Product Manager, Architect, Engineers, Security Reviewer, QA, etc.) through a structured workflow with human approval gates.

**Core Philosophy:** AI does the work, humans make the decisions.

### Key Features
- **Multi-agent orchestration** — 11 specialized AI agent types collaborating on software delivery
- **Demo workflow** — End-to-end demo: requirements → architecture → task planning → code generation → security review → QA → human approval → PR
- **Approval gates** — Human-in-the-loop approval before code is generated
- **Event tracking** — Full audit trail of all agent activities
- **Requirements & Architecture studios** — Structured document generation with AI assistance
- **Task backlog** — Auto-generated epics, stories, and tasks with dependency tracking
- **Code review & security** — Automated review findings with severity classification
- **Dark mode** — Full dark/light theme support
- **Landing page** — Marketing site with feature showcase

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                          │
│                    Next.js 14 App Router                            │
│              Port 3000 (dev) / Port 3000 (prod)                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTP (REST JSON)
                       │ JWT Bearer Auth
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Python 3.12+)                    │
│                    Port 8000 (dev) / Port 8000 (prod)                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  API Routers  │──│  Services    │──│  Models (SQLAlchemy ORM)  │  │
│  │  (11 routers) │  │  (7 services)│  │  (16 tables)              │  │
│  └──────────────┘  └──────┬───────┘  └───────────┬───────────────┘  │
│                           │                       │                   │
│                    ┌──────▼───────┐       ┌───────▼──────────────┐  │
│                    │ AI Providers  │       │  Database            │  │
│                    │ (Mock/Gemini) │       │  SQLite/PostgreSQL   │  │
│                    └──────────────┘       └──────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  DemoWorkflowOrchestrator (6 agent stages + approval)        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Deployment Options
| Mode | Database | Setup |
|------|----------|-------|
| Development | SQLite (auto-created) | `npm run dev` |
| Production (Docker) | PostgreSQL 16 | `docker compose up` |
| Production (Manual) | PostgreSQL 16 | Configure `DATABASE_URL` env |

---

## 3. Repository Structure

```
devsquad-ai/
├── apps/
│   ├── api/                          # FastAPI backend (Python 3.12+)
│   │   ├── app/
│   │   │   ├── api/v1/               # 11 API routers
│   │   │   ├── core/                 # Config, database, security, deps
│   │   │   ├── models/               # 16 SQLAlchemy ORM models
│   │   │   ├── providers/            # AI providers (Mock, Gemini)
│   │   │   ├── schemas/              # Pydantic request/response schemas
│   │   │   ├── services/             # 7 business logic services
│   │   │   └── workflows/            # Demo workflow orchestrator
│   │   ├── tests/                    # Pytest test files
│   │   ├── Dockerfile
│   │   └── pyproject.toml
│   └── web/                          # Next.js 14 frontend
│       └── src/
│           ├── app/                  # 23 routes (App Router)
│           │   ├── (auth)/           # Login, Register
│           │   ├── (dashboard)/      # Dashboard, Projects, Agents, etc.
│           │   └── landing/          # Marketing page
│           ├── components/
│           │   ├── layout/           # DashboardLayout, Sidebar, TopBar, LandingNav
│           │   └── ui/               # 15 reusable UI components
│           └── lib/                  # API client, auth context, utilities
├── packages/                         # 6 empty package placeholders
│   ├── agent-core/
│   ├── ai-core/
│   ├── config/
│   ├── contracts/
│   ├── shared/
│   └── ui/
├── docs/                             # Documentation
│   └── decisions/                    # Architecture Decision Records (empty)
├── .github/workflows/                # CI/CD pipeline (ci.yml)
├── infrastructure/                   # Empty (future IaC)
├── scripts/                          # Empty (future scripts)
├── docker-compose.yml                # Postgres + API + Web
├── .env.example                      # Environment template
└── package.json                      # npm workspaces root
```

---

## 4. Backend API (FastAPI)

### Tech Stack
- **Framework:** FastAPI 0.115+
- **ORM:** SQLAlchemy 2.0+ (async)
- **Validation:** Pydantic 2.10+, Pydantic-Settings
- **Auth:** python-jose (JWT), passlib (bcrypt), HTTPBearer
- **AI:** Google Generative AI (Gemini 1.5 Flash)
- **Database:** SQLite + aiosqlite (dev), PostgreSQL + asyncpg (prod)
- **Migrations:** Alembic (no migration files yet — schema creates on startup)
- **Package manager:** `uv` (pip alternative)
- **Linting/Formatting:** Ruff, MyPy

### Core Modules

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI app with lifespan (auto-creates tables), CORS, global exception handler |
| `app/core/config.py` | `Settings` via pydantic-settings (.env file support) |
| `app/core/database.py` | Async engine + session factory + `init_db()` |
| `app/core/security.py` | `hash_password`, `verify_password`, `create_access_token`, `decode_access_token` |
| `app/core/dependencies.py` | `get_current_user` (JWT), `get_workspace_and_check_role` (membership guard) |

### API Routers (all under `/api/v1`)

| Router | Endpoints | Status |
|--------|-----------|--------|
| `auth.py` | POST register, POST login, GET me | WORKING |
| `workspaces.py` | GET list | WORKING |
| `projects.py` | POST create, GET by workspace, GET by id | WORKING |
| `requirements.py` | POST create, GET by project, PATCH update | WORKING |
| `architecture.py` | POST create, GET by project, PATCH update | WORKING |
| `workflows.py` | POST create, GET by project, GET single, PATCH status | WORKING |
| `approvals.py` | GET by project, POST act (approve/reject) | WORKING |
| `events.py` | GET by project (+ filter by type, limit) | WORKING |
| `agents.py` | GET list (from AgentDefinition table) | WORKING |
| `tasks.py` | GET by project (+ filter by status, priority) | WORKING |
| `demo.py` | POST start, POST continue | WORKING (MockAIProvider) |

### Services

| Service | Methods | Description |
|---------|---------|-------------|
| `auth_service.py` | register, login, get_user | User registration with auto-created personal workspace |
| `project_service.py` | create, list_by_workspace, get | CRUD with event emission |
| `requirement_service.py` | create, get_by_project, update | Full field update support |
| `architecture_service.py` | create, get_by_project, update | Full field update support |
| `workflow_service.py` | create, list_by_project, get, update_status | Status + stage transitions |
| `approval_service.py` | create, list_pending, list_all, act | Approve/reject with events |
| `event_service.py` | list_by_project, create | List with limit, create with metadata |

---

## 5. Frontend (Next.js 14)

### Tech Stack
- **Framework:** Next.js 14 (App Router), React 18
- **Language:** TypeScript 6
- **Styling:** Tailwind CSS 3
- **Forms:** react-hook-form 7 + zod 4 + @hookform/resolvers 5
- **Data fetching:** @tanstack/react-query 5 (minimal usage)
- **Testing:** Vitest 4 + @testing-library/react 16

### Theme System
- Dark mode via `class` strategy (`dark` class on `<html>`)
- Extended Tailwind color palette: primary (indigo), secondary (violet), accent (cyan), success (emerald), warning (amber), danger (red), surface (zinc/neutral)
- Font stack: Inter (sans), JetBrains Mono (mono)
- Animations: fadeIn, slideUp, slideDown

### Routes (23 total)

| Route | Feature | Data Source |
|-------|---------|-------------|
| `/` | Redirect to /dashboard or /landing | Client-side |
| `/landing` | Marketing page | Static |
| `/login` | Login form | API |
| `/register` | Registration form | API |
| `/dashboard` | Metrics, projects, events, approvals | API |
| `/projects` | Project list | API |
| `/projects/new` | Create project form | API |
| `/projects/[id]` | Project detail overview | API |
| `/projects/[id]/requirements` | Requirements Studio | API |
| `/projects/[id]/architecture` | Architecture Studio | API |
| `/projects/[id]/backlog` | Task backlog | API |
| `/projects/[id]/workflows` | Workflow orchestration | API |
| `/projects/[id]/approvals` | Approval gates | API |
| `/projects/[id]/activity` | Event timeline | API + Mock fallback |
| `/projects/[id]/code-review` | Code review | API + Mock |
| `/projects/[id]/security` | Security center | API + Mock |
| `/projects/[id]/tests` | Testing center | API + Mock |
| `/projects/[id]/demo` | Demo workflow (8 steps) | API (polling) |
| `/agents` | Agent control room | API + Mock statuses |
| `/approvals` | Global approvals | Mock data |
| `/observability` | Metrics/logs dashboard | Mock data |
| `/settings` | User settings | Client-side |

### Components

#### Layout Components (4)
| Component | Purpose |
|-----------|---------|
| `DashboardLayout.tsx` | Auth guard + sidebar + topbar wrapper |
| `Sidebar.tsx` | Navigation sidebar with 3 sections (Main, Workflow, System) |
| `TopBar.tsx` | Breadcrumb, search, notifications, user menu |
| `LandingNav.tsx` | Fixed navbar with scroll-aware background |

#### UI Components (15)
| Component | Variants/Props | Accessibility |
|-----------|---------------|---------------|
| `Button` | primary, secondary, outline, ghost, danger; sm/md/lg; loading | aria-busy |
| `Card` | default, bordered, elevated | — |
| `Badge` | default, primary, success, warning, danger, info, purple; sm/md | — |
| `Input` | label, error, helperText, forwarded ref | aria-invalid, aria-describedby |
| `Textarea` | label, error, helperText | Same as Input |
| `Select` | label, error, options, placeholder | Same as Input |
| `Dialog` | sm/md/lg/xl, portal-based | aria-modal, Tab trap, Escape key |
| `Dropdown` | trigger + items pattern | role="menu", role="menuitem" |
| `EmptyState` | icon, title, description, action slot | — |
| `ProgressBar` | default/success/warning/danger; sm/md; showLabel | role="progressbar" |
| `Skeleton` | text, circular, rectangular; pulse animation | aria-hidden="true" |
| `Spinner` | sm/md/lg; SVG animation | role="status" |
| `Tabs` | id/label array; underline indicator | role="tablist", aria-selected |
| `Toast` | success, error, info, warning; auto-dismiss 5s | aria-live="polite" |
| `Tooltip` | top/bottom/left/right; hover/focus | role="tooltip" |

---

## 6. Packages (Placeholders)

All 6 packages under `packages/` are empty scaffolding with only `src/` subdirectories:

| Package | Purpose |
|---------|---------|
| `agent-core` | Future: shared agent runtime logic |
| `ai-core` | Future: shared AI provider abstractions |
| `config` | Future: shared configuration schemas |
| `contracts` | Future: API contracts / shared types |
| `shared` | Future: shared utilities |
| `ui` | Future: shared UI component library |

---

## 7. Database Schema

**16 tables** auto-created on startup via `Base.metadata.create_all`.

### Entity Relationship Summary

```
User ──< WorkspaceMember >── Workspace ──< Project
                                          ├──< Requirement
                                          ├──< Architecture
                                          ├──< Task ──< TaskDependency
                                          ├──< Workflow ──< AgentRun
                                          │                ├──< Artifact
                                          │                └──< ToolCall
                                          ├──< Approval
                                          ├──< Event
                                          ├──< Review ──< Finding
                                          ├──< Evaluation ──< EvaluationCase
                                          └──< AgentRun

AgentDefinition ──< AgentRun
PromptTemplate ──< PromptVersion
AuditLog (standalone)
```

### Table Details

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | id, email, password_hash, full_name, is_active, is_superuser | — |
| `workspaces` | id, name, slug, description | Personal workspace auto-created on register |
| `workspace_members` | user_id, workspace_id, role (OWNER/ADMIN/DEVELOPER/REVIEWER/VIEWER) | Unique constraint on (user_id, workspace_id) |
| `projects` | id, name, description, status, workspace_id | Status: ACTIVE (default) |
| `requirements` | id, project_id, input_text, problem_statement, personas, user_journeys, functional_requirements, non_functional_requirements, assumptions, constraints, risks, acceptance_criteria, mvp_scope, future_scope, status, version | JSON fields for structured data |
| `architectures` | id, project_id, summary, component_model, deployment_model, api_boundaries, data_flow, risks, alternatives, decisions, mermaid_diagram, status | JSON fields for structured data |
| `workflows` | id, project_id, name, description, status (DRAFT/PLANNING/WAITING_FOR_APPROVAL/RUNNING/PAUSED/REVIEWING/COMPLETED/FAILED/CANCELLED), workflow_type, current_stage | 9 statuses |
| `tasks` | id, project_id, title, description, acceptance_criteria, priority (LOW/MEDIUM/HIGH/CRITICAL), status (BACKLOG/READY/IN_PROGRESS/BLOCKED/IN_REVIEW/DONE/CANCELLED), assignee_agent, estimate, labels, epic, story, sort_order | 7 statuses, 4 priorities |
| `task_dependencies` | task_id, depends_on_id | Self-referential |
| `agent_definitions` | id, name, agent_type (11 types), description, role_description, capabilities, is_active | Seeded on first use |
| `agent_runs` | id, agent_id, workflow_id, project_id, status, model_provider, model_identifier, prompt_version, input_data, output_data, start_time, end_time, duration_seconds, token_usage_prompt, token_usage_completion, estimated_cost, error, retry_count | Full AI run tracking |
| `artifacts` | id, agent_run_id, name, artifact_type, content, content_json, file_paths | Output artifacts |
| `tool_calls` | id, agent_run_id, tool_name, input_args, output, status, duration_ms | Tool execution log |
| `approvals` | id, project_id, workflow_id, agent_run_id, title, description, status (PENDING/APPROVED/REJECTED/EXPIRED/CANCELLED), requesting_agent, proposed_action, reason, affected_files, command_preview, risk_level, expected_impact, approved_by, reviewed_at, rejection_reason | Full audit trail |
| `events` | id, project_id, workspace_id, event_type, title, description, agent_type, metadata_json | Event sourcing |
| `reviews` | id, project_id, agent_run_id, title, summary, review_type | Code/Security reviews |
| `findings` | id, review_id, title, description, severity (INFO/LOW/MEDIUM/HIGH/CRITICAL), category (7), file_path, line_start, line_end, evidence, recommendation, confidence, status (OPEN/ACKNOWLEDGED/FIXED/WONT_FIX) | Review findings |
| `evaluations` | id, project_id, name, evaluator_type, score, notes | AI evaluation |
| `evaluation_cases` | id, evaluation_id, input_text, expected_constraints, output_text, score, evaluator_notes | Evaluation cases |
| `prompt_templates` | id, name, version, role, template, schema_definition, is_active | Prompt management |
| `prompt_versions` | id, template_id, version, template, change_log | Version history |
| `audit_logs` | id, workspace_id, user_id, action, resource_type, resource_id, details, ip_address | Audit trail |

---

## 8. Authentication & Authorization

### Flow
1. **Register** — POST `/api/v1/auth/register` with email, password, full_name
   - Creates user record (bcrypt hashed password)
   - Auto-creates personal workspace + OWNER membership
   - Returns JWT access token
2. **Login** — POST `/api/v1/auth/login` with email, password
   - Verifies credentials
   - Returns JWT access token
3. **Authenticate** — Bearer token in `Authorization` header
   - `get_current_user` dependency decodes JWT, looks up user
4. **Authorize** — `get_workspace_and_check_role` verifies membership + role

### JWT Configuration
| Parameter | Default |
|-----------|---------|
| Secret | `change-this-to-a-random-secret-in-production` |
| Algorithm | HS256 |
| Expiry | 10080 minutes (7 days) |

### Workspace Roles
| Role | Level |
|------|-------|
| OWNER | Full control |
| ADMIN | Administrative |
| DEVELOPER | Can create/edit |
| REVIEWER | Can review |
| VIEWER | Read-only |

---

## 9. AI Providers

### Abstract Base (`AIProvider`)
```python
class AIProvider(ABC):
    async def generate_text(prompt, **kwargs) -> str
    async def generate_structured(prompt, output_schema, **kwargs) -> dict
    async def stream_text(prompt, **kwargs) -> AsyncGenerator[str]
    def provider_name -> str
    def model_name -> str
    def get_last_token_usage() -> TokenUsage
```

### MockAIProvider
- **Provider:** `mock`
- **Model:** `mock-model-v1`
- **Behavior:** Returns hardcoded data based on prompt keywords
- **Data includes:**
  - Requirements (problem statement, personas, user journeys, FRs, NFRs, risks, etc.)
  - Architecture (component model, deployment, API boundaries, mermaid diagram)
  - Task plans (epics, stories, tasks with assignments)
  - Code reviews (findings with severity, category, file paths)
  - Security reviews (findings, threats, mitigations)
- **Simulated latency:** 300-500ms
- **Usage:** hardcoded token counts

### GeminiProvider
- **Provider:** `google-gemini`
- **Model:** `gemini-1.5-flash`
- **Requires:** `GEMINI_API_KEY` env var
- **Features:**
  - Structured output via `response_schema` config
  - Streaming support
  - Token usage capture from response metadata
- **Error:** Raises `ValueError` if no API key configured

---

## 10. Workflows

### DemoWorkflowOrchestrator

Located at `apps/api/app/workflows/demo_workflow.py`, this is the **only** workflow implementation.

**8-step pipeline:**

```
Step 1: REQUIREMENTS ANALYSIS  ──> Requirements Analyst agent
Step 2: ARCHITECTURE DESIGN    ──> System Architect agent
Step 3: TASK PLANNING          ──> Backend Engineer (planner)
Step 4: CODE GENERATION        ──> Backend Engineer (hardcoded output)
Step 5: SECURITY REVIEW        ──> Security Engineer agent
Step 6: QA REVIEW              ──> QA Engineer agent
Step 7: HUMAN APPROVAL         ──> Approval record created
Step 8: PULL REQUEST READY     ──> Workflow completed
```

**Key behaviors:**
- Uses `MockAIProvider` exclusively (hardcoded for demo/presentation)
- Each step creates agent runs, artifacts, and events
- After step 6, workflow status becomes `WAITING_FOR_APPROVAL`
- `POST /api/v1/demo/continue` completes the workflow and sets status to `COMPLETED`
- Agents auto-created on first use (AgentDefinition table seeded dynamically)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/demo/start` | POST | Starts full demo workflow |
| `/api/v1/demo/continue` | POST | Completes workflow after approval |

---

## 11. API Reference

### Health
| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/health` | No | `{"status": "ok", "version": "0.1.0", "app": "DevSquad AI"}` |

### Auth
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/v1/auth/register` | No | `{email, password, full_name}` | `{access_token, token_type}` |
| POST | `/api/v1/auth/login` | No | `{email, password}` | `{access_token, token_type}` |
| GET | `/api/v1/auth/me` | Yes | — | `{id, email, full_name, is_active}` |

### Workspaces
| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/v1/workspaces` | Yes | `[{id, name, slug, description, role}]` |

### Projects
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/v1/projects` | Yes | `{name, description?, workspace_id}` | Project |
| GET | `/api/v1/projects/workspace/{workspace_id}` | Yes | — | `[Project]` |
| GET | `/api/v1/projects/{project_id}` | Yes | — | Project |

### Requirements
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/v1/requirements` | Yes | `{project_id, input_text}` | Requirement |
| GET | `/api/v1/requirements/project/{project_id}` | Yes | — | `[Requirement]` |
| PATCH | `/api/v1/requirements/{req_id}` | Yes | Partial fields | Requirement |

### Architecture
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/v1/architecture` | Yes | `{project_id}` | Architecture |
| GET | `/api/v1/architecture/project/{project_id}` | Yes | — | `[Architecture]` |
| PATCH | `/api/v1/architecture/{arch_id}` | Yes | Partial fields | Architecture |

### Workflows
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/v1/workflows` | Yes | `{project_id, name, description?, workflow_type?}` | Workflow |
| GET | `/api/v1/workflows/project/{project_id}` | Yes | — | `[Workflow]` |
| GET | `/api/v1/workflows/{workflow_id}` | Yes | — | Workflow |

### Approvals
| Method | Endpoint | Auth | Query/Body | Response |
|--------|----------|------|------------|----------|
| GET | `/api/v1/approvals/project/{project_id}` | Yes | `pending_only?` | `[Approval]` |
| POST | `/api/v1/approvals/{approval_id}/act` | Yes | `{action, rejection_reason?}` | Approval |

### Events
| Method | Endpoint | Auth | Query | Response |
|--------|----------|------|-------|----------|
| GET | `/api/v1/events/project/{project_id}` | Yes | `limit?` (max 200) | `[Event]` |

### Agents
| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/v1/agents` | Yes | `[AgentDefinition]` |

### Tasks
| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/v1/tasks/project/{project_id}` | Yes | `[Task]` |

### Demo
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/v1/demo/start` | Yes | `{project_id, input_text?}` | `{workflow_id, status}` |
| POST | `/api/v1/demo/continue` | Yes | `{workflow_id}` | `{workflow_id, status, message}` |

---

## 12. Frontend Routes

### Top-level Routes
| Path | Layout | Auth | Description |
|------|--------|------|-------------|
| `/` | Root | No | Redirects to /dashboard or /landing |
| `/landing` | Landing | No | Marketing page |
| `/login` | Auth | No | Login form |
| `/register` | Auth | No | Registration form |

### Dashboard Routes (all under `/dashboard` layout)
| Path | Description |
|------|-------------|
| `/dashboard` | Metrics dashboard with stats, projects, approvals, events |
| `/projects` | Project list |
| `/projects/new` | Create project form |
| `/projects/[id]` | Project detail (overview, health, activity, quick actions) |
| `/projects/[id]/requirements` | Requirements studio (editable sections) |
| `/projects/[id]/architecture` | Architecture studio (diagram, components, decisions) |
| `/projects/[id]/backlog` | Task backlog with epic/story hierarchy |
| `/projects/[id]/workflows` | Workflow orchestration (create, manage, continue) |
| `/projects/[id]/approvals` | Approval gates (approve/reject with dialog) |
| `/projects/[id]/activity` | Event timeline (filtered, paginated, auto-refresh) |
| `/projects/[id]/code-review` | Code review findings (sortable, filterable) |
| `/projects/[id]/security` | Security center (risk score, findings, threats) |
| `/projects/[id]/tests` | Testing center (test plan, cases by type) |
| `/projects/[id]/demo` | Demo workflow (8-step visualization with polling) |
| `/agents` | Agent control room (status, runs, tool calls, metrics) |
| `/approvals` | Global approvals list (all projects) |
| `/observability` | Observability dashboard (metrics, charts, logs) |
| `/settings` | User settings (profile, dark mode, API keys, sign out) |

---

## 13. UI Component Library

All components are in `apps/web/src/components/ui/` and follow these conventions:
- TypeScript with strict types
- Tailwind CSS with dark mode support
- Accessible (ARIA attributes, keyboard navigation)
- Exported via `index.ts`
- Variants via computed className strings

### Component Props Patterns
```tsx
// Standard pattern
interface ComponentProps {
  variant?: "primary" | "secondary" | ...;
  size?: "sm" | "md" | "lg";
  className?: string;  // Extensibility
  children?: React.ReactNode;
}
```

### Styling Constants (from utils.ts)
- `getStatusColor(status)` — Maps status strings to badge variants
- `getSeverityColor(severity)` — Maps severity to badge variants
- `formatDate(date)` — Relative time formatting
- `formatDuration(seconds)` — Human-readable duration
- `cn(...classes)` — Conditional class name utility

---

## 14. Infrastructure & DevOps

### Docker Setup
```yaml
# docker-compose.yml
services:
  db:         # PostgreSQL 16 on port 5432
  api:        # Python 3.13-slim, FastAPI on port 8000
  web:        # Next.js 14 on port 3000
```

### CI/CD (GitHub Actions)
File: `.github/workflows/ci.yml`
- **Triggers:** Push/PR to `main`
- **Backend job:** Python 3.13, ruff lint, mypy type check, pytest (with Postgres 16 service)
- **Frontend job:** Node 24, npm lint, typecheck, test, build

### Pre-commit Hooks (`.pre-commit-config.yaml`)
- trailing-whitespace, end-of-file-fixer, check-yaml, check-added-large-files
- black (code formatter)
- ruff (linter with --fix)
- mypy (type checker)

---

## 15. Quick Start

### Prerequisites
- Python 3.12+
- Node.js 24+
- npm
- uv (pip alternative)

### Development Setup
```bash
# Clone and install
git clone <repo-url>
cd devsquad-ai

# Backend setup
cd apps/api
uv sync
uv sync --group dev
cd ../..

# Frontend setup
npm install

# Environment
cp .env.example .env
# Edit .env as needed

# Start both services
npm run dev
# API: http://localhost:8000
# Web: http://localhost:3000
```

### Docker Setup
```bash
docker compose up
# API: http://localhost:8000
# Web: http://localhost:3000
# DB: postgresql://postgres:postgres@localhost:5432/devsquad
```

---

## 16. Build & Test Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API (port 8000) + Web (port 3000) concurrently |
| `npm run dev:api` | Start API only (uvicorn reload) |
| `npm run dev:web` | Start Web only (next dev) |
| `npm run build` | Build web (next build) |
| `npm run lint` | Lint web (next lint) |
| `npm run typecheck` | TypeScript check web (tsc --noEmit) |
| `npm run test` | Run all tests (pytest + vitest) |
| `npm run test:api` | Run API tests (pytest) |
| `npm run test:web` | Run web tests (vitest) |
| `docker compose up` | Start full stack (Postgres + API + Web) |

### Backend commands (from `apps/api/`)
| Command | Description |
|---------|-------------|
| `uv run ruff check .` | Ruff linting |
| `uv run mypy app` | MyPy type checking |
| `uv run pytest` | Run tests |

---

## 17. Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./devsquad.db` | Database connection string |
| `JWT_SECRET` | `change-this-to-a-random-secret-in-production` | JWT signing secret |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Token expiry (7 days) |
| `GEMINI_API_KEY` | — | Google Gemini API key |
| `APP_NAME` | `DevSquad AI` | Application name |
| `APP_ENV` | `development` | Environment |
| `DEBUG` | `true` | Debug mode |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `LOG_LEVEL` | `INFO` | Logging level |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | (Web) API base URL |

---

## 18. Known Issues

### Frontend
1. **Sidebar.tsx:25** — References `/overview` route (should be `/dashboard`)
2. **DashboardLayout inline sidebar** — Duplicates the Sidebar.tsx component
3. **Landing page** — Links to `/signup` but actual route is `/register`
4. **Sidebar nav links** — `/requirements`, `/architecture`, `/backlog`, `/code-review`, `/tests`, `/security`, `/evaluations` point to top-level routes that don't exist — should be `/projects/[id]/...`
5. **Approvals page** — Uses mock data instead of calling the real API
6. **Observability page** — All data is hardcoded mock data
7. **Code Review, Security, Tests pages** — Fall back to mock data
8. **No frontend tests** — Only 1 test file (Button.test.tsx)

### Backend
9. **No backend tests** — Only 2 test files with 3 tests total
10. **UUID column type** — Uses `postgresql.UUID` which may conflict with SQLite
11. **Alembic** — Migration directory is gitignored; no captured migrations
12. **MockAIProvider** — Hardcoded data only; GeminiProvider requires API key
13. **AI integration** — Requirements/Architecture creation APIs don't call AI; need external trigger
14. **No CI/CD** — `.github/workflows/ci.yml` exists but has never run

### General
15. **No README/CONTRIBUTING/SECURITY/CODE_OF_CONDUCT** — Missing documentation files
16. **All 6 packages** — Empty placeholders with no code
17. **No scripts or infrastructure** — `scripts/` and `infrastructure/` are empty

---

## 19. Future Roadmap

### Immediate (Phase 3 — Stabilization)
- [ ] Fix sidebar route references (/overview → /dashboard)
- [ ] Fix landing page signup link (/signup → /register)
- [ ] Fix sidebar nav links to use project-scoped routes
- [ ] Eliminate DashboardLayout/Sidebar duplication
- [ ] Add frontend test scaffolding
- [ ] Add backend test scaffolding
- [ ] Configure CI/CD pipeline

### Short-term
- [ ] Connect approvals, observability pages to real API data
- [ ] Add AI provider integration for requirements/architecture generation
- [ ] Replace MockAIProvider with real provider in production
- [ ] Add proper migration management (Alembic)
- [ ] Fix UUID type compatibility for SQLite

### Medium-term
- [ ] Implement full agent orchestration engine (beyond demo workflow)
- [ ] Add code generation agent with real file I/O
- [ ] Implement evaluation framework for AI outputs
- [ ] Add prompt template management with versioning
- [ ] Build out package libraries (agent-core, ai-core, shared, ui)

### Long-term
- [ ] Real-time collaboration features
- [ ] Multi-workspace support with team management
- [ ] Custom agent definitions
- [ ] Integration with GitHub/GitLab for PR management
- [ ] Deployment to cloud (AWS/GCP/Azure)
- [ ] Mobile app

---

*Generated on 2026-07-07 | DevSquad AI v0.1.0*
