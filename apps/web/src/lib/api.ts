export interface UserResponse {
  id: string
  email: string
  full_name: string
  is_active: boolean
}

export interface WorkspaceResponse {
  id: string
  name: string
  slug: string
  description: string | null
  role: string
}

export interface ProjectResponse {
  id: string
  name: string
  description: string | null
  status: string
  workspace_id: string
  created_at: string
  updated_at: string
}

export interface EventResponse {
  id: string
  project_id: string
  workspace_id: string | null
  event_type: string
  title: string
  description: string
  agent_type: string | null
  metadata_json: Record<string, unknown> | null
  created_at: string
}

export interface ApprovalResponse {
  id: string
  project_id: string
  workflow_id: string | null
  agent_run_id: string | null
  title: string
  description: string | null
  status: string
  requesting_agent: string
  proposed_action: string
  reason: string | null
  affected_files: string[]
  command_preview: string | null
  risk_level: string
  expected_impact: string | null
  approved_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
}

export interface RequirementResponse {
  id: string
  project_id: string
  input_text: string
  problem_statement: string | null
  personas: unknown[] | null
  user_journeys: unknown[] | null
  functional_requirements: string[] | null
  non_functional_requirements: string[] | null
  assumptions: string[] | null
  constraints: string[] | null
  risks: unknown[] | null
  acceptance_criteria: string[] | null
  mvp_scope: string[] | null
  future_scope: string[] | null
  status: string
  version: number
  created_at: string
}

export interface ComponentModelItem {
  name: string
  description: string
  responsibilities: string[]
}

export interface ApiBoundaryItem {
  name: string
  description: string
  methods: string[]
}

export interface RiskItem {
  description: string
  severity: string
  mitigation?: string
}

export interface DecisionItem {
  title: string
  decision: string
  rationale: string
}

export interface ArchitectureResponse {
  id: string
  project_id: string
  summary: string | null
  component_model: ComponentModelItem[] | null
  deployment_model: string | null
  api_boundaries: ApiBoundaryItem[] | null
  data_flow: string | null
  risks: RiskItem[] | null
  alternatives_considered: string[] | null
  adrs: DecisionItem[] | null
  mermaid_diagram: string | null
  status: string
  created_at: string
}

export interface TaskResponse {
  id: string
  project_id: string
  title: string
  description: string | null
  acceptance_criteria: string | null
  priority: string
  status: string
  assignee_agent: string | null
  estimate: number | null
  labels: string[] | null
  epic: string | null
  story: string | null
  depends_on: string[] | null
  sort_order: number
  created_at: string
}

export interface Story {
  id: string
  title: string
  description: string | null
  status: string
  tasks: TaskResponse[]
}

export interface Epic {
  id: string
  project_id: string
  title: string
  description: string | null
  status: string
  stories: Story[]
  created_at: string
}

export interface WorkflowResponse {
  id: string
  project_id: string
  name: string
  description: string | null
  status: string
  workflow_type: string | null
  current_stage: string | null
  created_at: string
  updated_at: string
}

export interface AgentDefinitionResponse {
  id: string
  name: string
  agent_type: string
  description: string | null
  role_description: string | null
  capabilities: string[] | null
  is_active: boolean
}

export interface AgentRunResponse {
  id: string
  agent_id: string
  workflow_id: string | null
  project_id: string
  status: string
  model_provider: string | null
  model_identifier: string | null
  prompt_version: string | null
  start_time: string | null
  end_time: string | null
  duration_seconds: number | null
  token_usage_prompt: number | null
  token_usage_completion: number | null
  estimated_cost: number | null
  error: string | null
  input_data: unknown | null
  output_data: unknown | null
  created_at: string
}

export interface PaymentPlanResponse {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: string
  features: string[]
}

export interface SubscriptionStatusResponse {
  id: string
  plan_id: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("devsquad_token") : null

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "An error occurred" }))
    throw new Error(error.detail || `Request failed: ${res.status}`)
  }

  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; token_type: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { full_name: string; email: string; password: string }) =>
      request<{ access_token: string; token_type: string }>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<UserResponse>("/api/v1/auth/me"),
    google: (idToken: string) =>
      request<{ access_token: string; token_type: string }>("/api/v1/auth/google", {
        method: "POST",
        body: JSON.stringify({ id_token: idToken }),
      }),
  },

  workspaces: {
    list: () => request<WorkspaceResponse[]>("/api/v1/workspaces"),
  },

  projects: {
    listByWorkspace: (workspaceId: string) => request<ProjectResponse[]>(`/api/v1/projects/workspace/${workspaceId}`),
    get: (id: string) => request<ProjectResponse>(`/api/v1/projects/${id}`),
    create: (data: { name: string; description?: string; workspace_id: string }) =>
      request<ProjectResponse>("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  events: {
    list: (projectId: string, limit?: number) =>
      request<EventResponse[]>(`/api/v1/events/project/${projectId}` + (limit ? `?limit=${limit}` : "")),
  },

  approvals: {
    list: (projectId: string, pendingOnly?: boolean) =>
      request<ApprovalResponse[]>(`/api/v1/approvals/project/${projectId}` + (pendingOnly ? "?pending_only=true" : "")),
    act: (approvalId: string, action: string, rejectionReason?: string) =>
      request<ApprovalResponse>(`/api/v1/approvals/${approvalId}/act`, {
        method: "POST",
        body: JSON.stringify({ action, rejection_reason: rejectionReason }),
      }),
  },

  requirements: {
    list: (projectId: string) => request<RequirementResponse[]>(`/api/v1/requirements/project/${projectId}`),
    create: (data: { project_id: string; input_text: string }) =>
      request<RequirementResponse>("/api/v1/requirements", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (reqId: string, data: Record<string, unknown>) =>
      request<RequirementResponse>(`/api/v1/requirements/${reqId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  architecture: {
    list: (projectId: string) => request<ArchitectureResponse[]>(`/api/v1/architecture/project/${projectId}`),
    create: (data: { project_id: string }) =>
      request<ArchitectureResponse>("/api/v1/architecture", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (archId: string, data: Record<string, unknown>) =>
      request<ArchitectureResponse>(`/api/v1/architecture/${archId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  tasks: {
    list: (projectId: string) => request<TaskResponse[]>(`/api/v1/tasks/project/${projectId}`),
  },

  backlog: {
    list: async (projectId: string): Promise<Epic[]> => {
      const tasks = await request<TaskResponse[]>(`/api/v1/tasks/project/${projectId}`)
      const epicMap = new Map<string, { id: string; title: string; description: string | null; stories: Map<string, { id: string; title: string; description: string | null; status: string; tasks: TaskResponse[] }> }>()
      for (const task of tasks) {
        const epicKey = task.epic || "default"
        if (!epicMap.has(epicKey)) {
          epicMap.set(epicKey, { id: epicKey, title: epicKey, description: null, stories: new Map() })
        }
        const epic = epicMap.get(epicKey)!
        const storyKey = task.story || "default"
        if (!epic.stories.has(storyKey)) {
          epic.stories.set(storyKey, { id: storyKey, title: storyKey, description: null, status: "backlog", tasks: [] })
        }
        epic.stories.get(storyKey)!.tasks.push(task)
      }
      return Array.from(epicMap.values()).map((e) => ({
        id: e.id,
        project_id: projectId,
        title: e.title,
        description: e.description,
        status: "backlog",
        stories: Array.from(e.stories.values()),
        created_at: "",
      }))
    },
  },

  workflows: {
    list: (projectId: string) => request<WorkflowResponse[]>(`/api/v1/workflows/project/${projectId}`),
    get: (id: string) => request<WorkflowResponse>(`/api/v1/workflows/${id}`),
    create: (data: { project_id: string; name: string; description?: string; workflow_type?: string }) =>
      request<WorkflowResponse>("/api/v1/workflows", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  agents: {
    list: () => request<AgentDefinitionResponse[]>("/api/v1/agents"),
  },

  payments: {
    plans: () => request<PaymentPlanResponse[]>("/api/v1/payments/plans"),
    createCheckoutSession: (data: { price_id: string; success_url: string; cancel_url: string }) =>
      request<{ session_id: string; url: string }>("/api/v1/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createPortalSession: () =>
      request<{ url: string }>("/api/v1/payments/create-portal-session", {
        method: "POST",
      }),
    subscription: () => request<SubscriptionStatusResponse | null>("/api/v1/payments/subscription"),
  },

  demo: {
    start: (projectId: string) =>
      request<{ workflow_id: string }>("/api/v1/demo/start", {
        method: "POST",
        body: JSON.stringify({ project_id: projectId }),
      }),
    continue: (workflowId: string) =>
      request<{ status: string }>("/api/v1/demo/continue", {
        method: "POST",
        body: JSON.stringify({ workflow_id: workflowId }),
      }),
  },
}

export const { agents, approvals, events, workflows, demo, auth, projects, requirements, architecture, backlog, tasks, workspaces, payments } = api
