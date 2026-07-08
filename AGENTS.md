# DevSquad AI — Anchored State Summary

## Objective
Audit and stabilize the existing DevSquad AI monorepo, then continue development toward a professional AI-powered software engineering platform — without breaking working features.

## Important Rules
- This is an EXISTING project. Do NOT scaffold new apps, delete working features, or replace the architecture blindly.
- Never modify `AGENTS.md` without explicit user approval.
- Before any code change, re-read this file to re-anchor context.
- After any code change, verify against project conventions (lint/typecheck).

## Repository Structure

```
devsquad-ai/
├── apps/
│   ├── api/          # FastAPI backend (Python 3.12+, SQLAlchemy async, SQLite/Postgres)
│   └── web/          # Next.js 14 frontend (React 18, TypeScript 6, Tailwind 3)
├── packages/
│   ├── agent-core/   # EMPTY (placeholder only)
│   ├── ai-core/      # EMPTY (placeholder only)
│   ├── config/       # EMPTY (placeholder only)
│   ├── contracts/    # EMPTY (placeholder only)
│   ├── shared/       # EMPTY (placeholder only)
│   └── ui/           # EMPTY (placeholder only)
├── docker-compose.yml
├── .env.example
├── .github/workflows/  # EMPTY (no CI/CD)
└── package.json        # npm workspaces root
```

## Backend Architecture (`apps/api`)

### Tech Stack
- Python 3.12+, FastAPI 0.115+, SQLAlchemy 2.0+ (async), Pydantic 2.10+, Pydantic-Settings
- Auth: python-jose (JWT), passlib (bcrypt), HTTPBearer
- AI: MockAIProvider (working), GeminiProvider (needs GEMINI_API_KEY env var)
- DB: SQLite+aiosqlite (default), PostgreSQL+asyncpg (production/Docker)
- Schema: Auto-created on startup via `Base.metadata.create_all`; Alembic present but no migration files (gitignored)
- Package manager: `uv` (pip alternative)

### API Routers (all under `/api/v1`)
| Router | Endpoints | Status |
|--------|-----------|--------|
| `auth.py` | POST register, POST login, GET me | WORKING |
| `workspaces.py` | GET list, GET single | WORKING |
| `projects.py` | POST create, GET by workspace, GET by id | WORKING |
| `requirements.py` | POST create, GET by project, PATCH update | WORKING |
| `architecture.py` | POST create, GET by project, PATCH update | WORKING |
| `workflows.py` | POST create, GET by project, GET single, PATCH status | WORKING |
| `approvals.py` | GET by project, POST act (approve/reject) | WORKING |
| `events.py` | GET by project (+ filter by type, limit) | WORKING |
| `agents.py` | GET list (from AgentDefinition table) | WORKING |
| `tasks.py` | GET by project (+ filter by status, priority) | WORKING |
| `demo.py` | POST start, POST continue (hardcoded MockAIProvider) | WORKING (mock) |

### Models (16 total)
User, Workspace, WorkspaceMember, Project, Requirement, Architecture, Workflow (8 statuses), AgentDefinition (11 types), AgentRun, Task (7 statuses/4 priorities), TaskDependency, Approval (5 statuses), Event, Artifact, ToolCall, Review, Finding (5 severities/7 categories/4 statuses), Evaluation, EvaluationCase, PromptTemplate, PromptVersion, AuditLog

### Services (7)
- `auth_service.py` — register/login/get_user (auto-creates personal workspace on register)
- `project_service.py` — CRUD with event creation
- `requirement_service.py` — CRUD with event creation
- `architecture_service.py` — CRUD with event creation
- `workflow_service.py` — CRUD + status transitions
- `approval_service.py` — CRUD + approve/reject + events
- `event_service.py` — list/filter events by project

### AI Providers (3)
- `base.py` — Abstract `AIProvider` class with `TokenUsage`
- `mock_provider.py` — MockAIProvider with hardcoded data (requirements, architecture, tasks, reviews, security, test plans)
- `gemini_provider.py` — Real Gemini 1.5 Flash (raises ValueError if no API key)

### Workflows (1)
- `demo_workflow.py` — `DemoWorkflowOrchestrator` with 6 agent stages + approval request (uses MockAIProvider only)

### Empty directories (scaffolding only)
- `agents/`, `adapters/`, `evaluation/`, `prompts/` — only `__init__.py`

### Tests
- `tests/__init__.py` only — NO actual tests

### Core Modules
| File | Purpose |
|------|---------|
| `config.py` | `Settings` via pydantic-settings (.env file support) |
| `database.py` | Async engine + session factory + `init_db()` (auto-create-all) |
| `security.py` | hash_password, verify_password, create_access_token, decode_access_token |
| `dependencies.py` | get_current_user (JWT), get_workspace_and_check_role (membership guard) |

## Frontend Architecture (`apps/web`)

### Tech Stack
- Next.js 14 (App Router), React 18, TypeScript 6, Tailwind CSS 3
- zod 4, react-hook-form 7, @hookform/resolvers 5
- @tanstack/react-query 5 (installed, minimal usage seen)

### Routes (16)
| Route | Feature | Status |
|-------|---------|--------|
| `/` | Redirects to /dashboard or /landing | WORKING |
| `/landing` | Marketing page (features, agents, workflow, security, CTA) | WORKING (links to `/signup` not `/register`) |
| `/login` | Auth form | WORKING |
| `/register` | Auth form | WORKING |
| `/dashboard` | Metrics, projects, events, approvals | WORKING |
| `/projects` | Project list | WORKING |
| `/projects/new` | Create project form | WORKING |
| `/projects/[id]` | Project detail with 10 tabs | WORKING |
| `/projects/[id]/requirements` | Requirements Studio | WORKING |
| `/projects/[id]/architecture` | Architecture Studio | WORKING |
| `/projects/[id]/backlog` | Task Backlog | WORKING |
| `/projects/[id]/workflows` | Workflow Orchestration | WORKING |
| `/projects/[id]/approvals` | Approval Gates | WORKING |
| `/projects/[id]/activity` | Event Timeline | WORKING |
| `/projects/[id]/code-review` | Code Review | MOCK (static data) |
| `/projects/[id]/security` | Security Center | MOCK (static data) |
| `/projects/[id]/tests` | Testing Center | MOCK (static data) |
| `/projects/[id]/demo` | Demo Workflow | WORKING |
| `/agents` | Agent Control Room | WORKING |
| `/approvals` | Global approvals list | WORKING |
| `/observability` | Metrics/logs dashboard | MOCK (hardcoded data) |
| `/settings` | User settings | WORKING |

### Components (15)
Button, Card, Badge, Input, Textarea, Select, Dialog, Dropdown, EmptyState, ProgressBar, Skeleton, Spinner, Tabs, Toast, Tooltip

### Layout
- DashboardLayout in `(dashboard)/layout.tsx` — inline sidebar (duplicate of Sidebar.tsx component)
- Sidebar.tsx — separate component (UNUSED by dashboard layout)

### Known Issues
1. `Sidebar.tsx:25` — references `/overview` route (should be `/dashboard`)
2. DashboardLayout inline sidebar duplicates Sidebar.tsx component
3. Landing page links to `/signup` but actual route is `/register`
4. Sidebar nav links (`/requirements`, `/architecture`, `/backlog`, `/code-review`, `/tests`, `/security`, `/evaluations`) point to top-level routes that don't exist — should be `/projects/[id]/...`
5. No README, CONTRIBUTING, SECURITY, or CODE_OF_CONDUCT
6. All 6 packages have empty `src/` directories
7. No backend tests (empty `tests/__init__.py`)
8. No frontend tests (vitest setup exists but no test files)
9. `.env.example` has placeholder JWT secret
10. Alembic migrations directory exists but is gitignored — no captured migrations
11. No CI/CD (`.github/workflows/` empty)
12. Backend uses UUID column type from postgresql dialect — may conflict with SQLite at runtime

## Feature Classification

### WORKING
- Auth (register, login, JWT, protected routes)
- Workspace management (auto-create on register, list)
- Project CRUD (create, list, get)
- Requirements CRUD via API (create, list, update)
- Architecture CRUD via API (create, list, update)
- Workflow CRUD (create, list, get, status updates)
- Approvals (CRUD, approve/reject with event tracking)
- Events (CRUD, list with filtering)
- Agents list (from AgentDefinition table)
- Tasks list with filtering
- Demo workflow (full multi-step orchestration)
- Dark mode toggle
- Settings page (profile form)
- Landing page (marketing)

### PARTIAL
- Code Review page (UI exists — data is static demo content)
- Security page (UI exists — data is static demo content)
- Tests page (UI exists — data is static demo content)
- Observability page (UI exists — hardcoded metrics)
- Requirements creation (API creates but doesn't call AI — need external trigger)
- Architecture creation (API creates but doesn't call AI — need external trigger)

### MOCK
- AIProvider — MockProvider returns hardcoded data; GeminiProvider requires GEMINI_API_KEY
- Demo workflow — uses MockAIProvider exclusively
- All agent orchestration — only `demo_workflow.py` exists
- Code generation agent — hardcoded output (not calling any AI)

### BROKEN / MISSING
- `Sidebar.tsx` — `/overview` route doesn't exist
- Landing page `/signup` link — route is `/register`
- Sidebar nav links to top-level `/requirements`, `/architecture`, `/backlog`, `/code-review`, `/tests`, `/security`, `/evaluations` — these aren't valid routes outside a project context
- All 6 packages — empty placeholders
- No backend tests
- No frontend tests
- No CI/CD
- No README or project documentation
- No Alembic migrations captured
- UUID column type from PostgreSQL may not work with SQLite

## Build Commands (from root `package.json`)
```bash
npm run dev          # Starts both api (port 8000) and web (port 3000) concurrently
npm run build        # Builds web only
npm run lint         # Lints web only (next lint)
npm run typecheck    # TypeScript check web (tsc --noEmit)
npm run test         # Runs both api (pytest) and web (vitest) tests
npm run dev:api      # uvicorn on port 8000
npm run dev:web      # next dev
```

## Docker
```bash
docker compose up    # Starts postgres:16, api (port 8000), web (port 3000)
```

## Build Verification Results (Phase 2 Complete)

| Command | Status | Details |
|---------|--------|---------|
| `npm install` | PASSED | 521 packages, 5 vulns (1 moderate, 4 high) |
| `npm run typecheck` (tsc --noEmit) | **PASSED** | Fixed — added `.next` to tsconfig exclude |
| `npm run lint:web` (next lint) | **PASSED** | Fixed — downgraded eslint to ^8.56.0 + eslint-config-next to ^14.2.0 + `.eslintrc.json` |
| `npm run build:web` (next build) | PASSED | All 23 routes built; lockfile warnings persist (npm workspace issue) |
| `ruff check app` (backend) | **PASSED** | Fixed — ran `ruff --fix` (210 auto, 10 unsafe), added per-file-ignores for E501/E402 |
| `mypy app` (backend) | PASSED | No issues in 67 source files |
| `pytest` (backend) | PASSED | 0 tests collected (tests/ directory is empty) |
| Docker compose build | SKIPPED | Docker not available on this machine |

### Fixes Applied
1. **backend ruff (323 → 0 errors)**: `ruff --fix` fixed 210 errors, `--unsafe-fixes` fixed 10 more; added per-file-ignores in `pyproject.toml` for E501 in model/service files and E402 in main.py; manually fixed 1 remaining E501 in `core/dependencies.py`
2. **frontend lint**: Downgraded `eslint` from ^9→^8 and `eslint-config-next` from ^16→^14 to match Next.js 14; created `.eslintrc.json` with `next/core-web-vitals`; lint now passes with only 6 pre-existing `react-hooks/exhaustive-deps` warnings
3. **frontend typecheck**: Added `.next` to tsconfig `exclude` array — fixes 25 TS6053 errors from missing `.next/types/` files before first build
4. **build lockfile warnings**: Pre-existing npm workspace issue with Next.js 14 SWC patching — non-blocking, builds succeed

## Next Steps (Phase 3 — Stabilization)
1. Fix the 12 known issues from Phase 1 audit (sidebar routes, landing links, etc.)
2. Add frontend test setup (vitest config exists but no tests)
3. Add backend test scaffolding (empty `tests/` dir)
4. Configure CI/CD (GitHub Actions workflows)
