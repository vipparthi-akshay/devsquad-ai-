"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { cn, formatDuration, getStatusColor } from "@/lib/utils"

interface WorkflowStep {
  id: number
  title: string
  agent: string
  description: string
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped"
}

interface AgentActivity {
  id: string
  name: string
  agent_type: string
  status: string
  current_operation: string | null
  duration_seconds: number | null
}

interface TimelineEvent {
  id: string
  title: string
  description: string | null
  agent_type: string | null
  created_at: string
}

interface CodeChange {
  file: string
  additions: number
  deletions: number
}

interface PullRequestData {
  title: string
  branch: string
  commits: { message: string; author: string }[]
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, title: "Requirements Analysis", agent: "Product Manager", description: "Analyzing product idea and generating PRD", status: "pending" },
  { id: 2, title: "Architecture Design", agent: "Architect", description: "Proposing system architecture and design", status: "pending" },
  { id: 3, title: "Task Planning", agent: "Project Manager", description: "Decomposing work into tasks and epics", status: "pending" },
  { id: 4, title: "Code Generation", agent: "Backend Engineer", description: "Generating code based on tasks", status: "pending" },
  { id: 5, title: "Security Review", agent: "Security Engineer", description: "Reviewing code for security issues", status: "pending" },
  { id: 6, title: "QA Review", agent: "QA Engineer", description: "Generating and executing test plans", status: "pending" },
  { id: 7, title: "Human Approval", agent: "Human", description: "Waiting for human approval", status: "pending" },
  { id: 8, title: "Pull Request", agent: "DevOps", description: "Preparing and submitting pull request", status: "pending" },
]

function StepIcon({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }
  if (status === "in_progress") {
    return (
      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shrink-0 animate-pulse">
        <div className="w-3 h-3 bg-white rounded-full" />
      </div>
    )
  }
  if (status === "failed") {
    return (
      <div className="w-8 h-8 rounded-full bg-danger-500 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center shrink-0">
      <div className="w-3 h-3 rounded-full bg-surface-400 dark:bg-surface-500" />
    </div>
  )
}

function ApprovalCard({ onApprove, onReject, isProcessing }: {
  onApprove: () => void
  onReject: () => void
  isProcessing: boolean
}) {
  return (
    <div className="mt-4 p-4 rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 ">
      <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
        Approval Required
      </h4>
      <p className="text-sm text-primary-700 dark:text-primary-300 mb-4">
        Review the proposed changes and approve or reject to continue.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" onClick={onApprove} loading={isProcessing} aria-label="Approve changes">
          Approve
        </Button>
        <Button variant="danger" onClick={onReject} loading={isProcessing} aria-label="Reject changes">
          Reject
        </Button>
      </div>
    </div>
  )
}

function CodeDiffPreview({ changes }: { changes: CodeChange[] }) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Changed Files</p>
      <div className="space-y-1">
        {changes.map((change) => (
          <div key={change.file} className="flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded bg-surface-50 dark:bg-surface-900">
            <span className="text-surface-700 dark:text-surface-300 truncate">{change.file}</span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-success-600">+{change.additions}</span>
              <span className="text-danger-600">-{change.deletions}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DependenciesView({ tasks, deps }: { tasks: string[]; deps: [string, string][] }) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Dependency Graph</p>
      <div className="flex flex-wrap gap-2">
        {tasks.map((task) => (
          <Badge key={task} className="bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300">
            {task}
          </Badge>
        ))}
      </div>
      {deps.length > 0 && (
        <div className="space-y-1 mt-2">
          {deps.map(([from, to], i) => (
            <div key={i} className="text-xs text-surface-500 dark:text-surface-400 font-mono">
              {from} → {to}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PendingPR({ pr }: { pr: PullRequestData }) {
  return (
    <div className="mt-3 space-y-3 p-4 rounded-lg bg-surface-50 dark:bg-surface-900 ">
      <div>
        <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{pr.title}</p>
        <p className="text-xs text-surface-500 dark:text-surface-400 font-mono mt-1">{pr.branch}</p>
      </div>
      {pr.commits.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-surface-600 dark:text-surface-400">Commits</p>
          {pr.commits.map((c, i) => (
            <div key={i} className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-surface-400 shrink-0" />
              <span className="truncate">{c.message}</span>
              <span className="shrink-0 text-surface-400">— {c.author}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DemoWorkflowPage() {
  const params = useParams<{ id: string }>()
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [steps, setSteps] = useState<WorkflowStep[]>(WORKFLOW_STEPS)
  const [activities, setActivities] = useState<AgentActivity[]>([])
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isProcessingApproval, setIsProcessingApproval] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startDemo = async () => {
    setIsStarting(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/projects/${params.id}/demo/start`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to start demo workflow")
      const data = await res.json()
      setWorkflowId(data.workflow_id)
      setIsRunning(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start")
    } finally {
      setIsStarting(false)
    }
  }

  const fetchStatus = useCallback(async () => {
    if (!workflowId) return
    try {
      const [workflowRes, eventsRes] = await Promise.all([
        fetch(`/api/v1/workflows/${workflowId}`),
        fetch(`/api/v1/projects/${params.id}/events?limit=50`),
      ])
      if (!workflowRes.ok) throw new Error("Failed to fetch workflow status")
      const workflowData = await workflowRes.json()
      const eventsData = await eventsRes.json()

      setEvents(eventsData)

      const currentStageIndex = workflowData.current_stage ? parseInt(workflowData.current_stage) - 1 : -1
      const completedStages = workflowData.completed_stages || []

      setSteps((prev) =>
        prev.map((step) => {
          if (completedStages.includes(step.title)) return { ...step, status: "completed" }
          if (step.id - 1 === currentStageIndex) return { ...step, status: "in_progress" }
          if (step.id - 1 < currentStageIndex) return { ...step, status: "completed" }
          return step
        })
      )

      setProgress(((currentStageIndex + 1) / WORKFLOW_STEPS.length) * 100)

      if (workflowData.status === "completed" || workflowData.status === "failed") {
        setIsRunning(false)
        if (pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
        }
      }
    } catch (err) {
      console.error("Polling error:", err)
    }
  }, [workflowId, params.id])

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/projects/${params.id}/agents/runs`)
      if (!res.ok) return
      const data = await res.json()
      setActivities(data)
    } catch {}
  }, [params.id])

  useEffect(() => {
    async function loadExisting() {
      try {
        const res = await fetch(`/api/v1/projects/${params.id}/workflows?type=demo`)
        if (!res.ok) return
        const workflows = await res.json()
        if (workflows.length > 0) {
          const wf = workflows[workflows.length - 1]
          setWorkflowId(wf.id)
          if (wf.status === "in_progress" || wf.status === "pending") {
            setIsRunning(true)
          }
        }
      } catch {} finally {
        setIsLoading(false)
      }
    }
    loadExisting()
  }, [params.id])

  useEffect(() => {
    if (isRunning && workflowId) {
      fetchStatus()
      fetchActivities()
      pollRef.current = setInterval(() => {
        fetchStatus()
        fetchActivities()
      }, 2000)
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [isRunning, workflowId, fetchStatus, fetchActivities])

  const handleApprove = async () => {
    setIsProcessingApproval(true)
    try {
      await fetch(`/api/v1/approvals/${params.id}/act`, {
        method: "POST",
        body: JSON.stringify({ action: "approved" }),
      })
      fetchStatus()
    } catch {} finally {
      setIsProcessingApproval(false)
    }
  }

  const handleReject = async () => {
    setIsProcessingApproval(true)
    try {
      await fetch(`/api/v1/approvals/${params.id}/act`, {
        method: "POST",
        body: JSON.stringify({ action: "rejected", rejection_reason: "Rejected by user" }),
      })
      fetchStatus()
    } catch {} finally {
      setIsProcessingApproval(false)
    }
  }

  const formatEventTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full rounded" />
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" variant="rectangular" />
            ))}
          </div>
          <Skeleton className="w-80 rounded-xl" variant="rectangular" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Demo Workflow
        </h1>
        <div className="flex items-center gap-3">
          {isRunning && (
            <Button variant="ghost" onClick={fetchStatus} aria-label="Refresh status">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          )}
          {!isRunning && (
            <Button onClick={startDemo} loading={isStarting}>
              Start Demo Workflow
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800">
          <p className="text-sm text-danger-700 dark:text-danger-300">{error}</p>
        </div>
      )}

      {isRunning && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500 dark:text-surface-400">Workflow Progress</span>
            <span className="text-surface-700 dark:text-surface-300">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {!isRunning && steps.every((s) => s.status === "pending") ? (
            <EmptyState
              icon={
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Demo workflow ready"
              description="Click 'Start Demo Workflow' to begin the automated workflow process."
              action={<Button onClick={startDemo} loading={isStarting}>Start Demo Workflow</Button>}
            />
          ) : (
            steps.map((step, index) => (
              <div
                key={step.id}
                className={cn("relative flex gap-4 ", step.status === "pending" && "opacity-40")}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col items-center">
                  <StepIcon status={step.status} />
                  {index < steps.length - 1 && (
                    <div className={cn("w-0.5 h-full min-h-[2rem] mt-1", step.status === "completed" ? "bg-success-500" : "bg-surface-200 dark:bg-surface-700")} />
                  )}
                </div>

                <div className={cn("flex-1 pb-6 min-w-0", step.status === "completed" && "")}>
                  <Card className={cn(
                    step.status === "in_progress" && "border-primary-500 ring-1 ring-primary-500/30",
                    step.status === "completed" && "border-success-300 dark:border-success-700",
                    step.status === "failed" && "border-danger-500"
                  )}>
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                            Step {step.id}: {step.title}
                          </h3>
                          <p className="text-sm text-surface-500 dark:text-surface-400">
                            {step.agent} — {step.description}
                          </p>
                        </div>
                        <Badge className={cn("shrink-0", getStatusColor(step.status))}>
                          {step.status.replace("_", " ")}
                        </Badge>
                      </div>

                      {step.id === 1 && step.status === "in_progress" && (
                        <div className="mt-3 space-y-2 ">
                          <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-3/4" />
                          <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-1/2" />
                        </div>
                      )}
                      {step.id === 1 && step.status === "completed" && (
                        <div className="mt-3 p-3 rounded bg-surface-50 dark:bg-surface-900 text-sm text-surface-700 dark:text-surface-300 ">
                          <p className="font-medium mb-1">Product Idea</p>
                          <p className="text-surface-600 dark:text-surface-400">
                            Build a multi-tenant inventory SaaS for small retailers.
                          </p>
                          <div className="mt-2 space-y-1 text-xs text-surface-500 dark:text-surface-400">
                            <p>✓ Problem Statement defined</p>
                            <p>✓ Personas identified</p>
                            <p>✓ User Journeys mapped</p>
                            <p>✓ Functional Requirements documented</p>
                            <p>✓ Non-functional Requirements specified</p>
                          </div>
                        </div>
                      )}

                      {step.id === 2 && step.status === "completed" && (
                        <div className="mt-3 space-y-3 ">
                          <div className="p-3 rounded bg-surface-50 dark:bg-surface-900 text-sm">
                            <p className="font-medium text-surface-900 dark:text-surface-50 mb-1">Architecture Summary</p>
                            <p className="text-surface-600 dark:text-surface-400">
                              Modular monolith with event-driven microservices for inventory, orders, and tenant management.
                            </p>
                          </div>
                          <pre className="text-xs bg-surface-100 dark:bg-surface-800 p-3 rounded-md overflow-x-auto text-surface-600 dark:text-surface-400">
{`graph TD
    A[Web App] --> B[API Gateway]
    B --> C[Inventory Service]
    B --> D[Order Service]
    B --> E[Tenant Service]
    C --> F[(PostgreSQL)]
    D --> F
    E --> F`}
                          </pre>
                          <div className="p-3 rounded bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 text-sm">
                            <p className="font-medium text-warning-700 dark:text-warning-300">Scaling Risk Identified</p>
                            <p className="text-warning-600 dark:text-warning-400 text-xs mt-1">
                              PostgreSQL may become bottleneck at 100k+ tenants. Consider sharding strategy.
                            </p>
                          </div>
                        </div>
                      )}

                      {step.id === 3 && step.status === "completed" && (
                        <div className="mt-3 ">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">Epic: Inventory Management</Badge>
                            <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">Epic: Order Processing</Badge>
                            <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">Epic: Tenant Onboarding</Badge>
                          </div>
                          <DependenciesView
                            tasks={["Setup DB schema", "API CRUD for products", "Order validation", "Tenant isolation"]}
                            deps={[["Setup DB schema", "API CRUD for products"], ["API CRUD for products", "Order validation"]]}
                          />
                        </div>
                      )}

                      {step.id === 4 && step.status === "completed" && (
                        <div className="mt-3 ">
                          <CodeDiffPreview
                            changes={[
                              { file: "src/services/inventory.py", additions: 142, deletions: 0 },
                              { file: "src/models/product.py", additions: 89, deletions: 0 },
                              { file: "src/api/routes.py", additions: 56, deletions: 12 },
                              { file: "src/migrations/001_initial.sql", additions: 34, deletions: 0 },
                            ]}
                          />
                        </div>
                      )}

                      {step.id === 5 && step.status === "in_progress" && (
                        <div className="mt-3 space-y-2 ">
                          <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-2/3" />
                          <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-1/3" />
                        </div>
                      )}

                      {step.id === 7 && step.status === "in_progress" && (
                        <ApprovalCard onApprove={handleApprove} onReject={handleReject} isProcessing={isProcessingApproval} />
                      )}

                      {step.id === 8 && step.status === "completed" && (
                        <PendingPR
                          pr={{
                            title: "feat: multi-tenant inventory management system",
                            branch: "feature/multi-tenant-inventory",
                            commits: [
                              { message: "feat: add inventory models and migrations", author: "Backend Agent" },
                              { message: "feat: implement CRUD API for products", author: "Backend Agent" },
                              { message: "fix: add tenant isolation middleware", author: "Security Agent" },
                              { message: "test: add unit tests for inventory service", author: "QA Agent" },
                            ],
                          }}
                        />
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="w-full lg:w-80 shrink-0 space-y-4">
          {activities.length > 0 && (
            <Card>
              <div className="p-4">
                <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-3">
                  Agent Activity
                </h2>
                <div className="space-y-3">
                  {activities.map((agent) => (
                    <div key={agent.id} className="flex items-start gap-3">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", agent.status === "running" ? "bg-success-500 animate-pulse" : "bg-surface-400")} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">
                          {agent.name}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {agent.current_operation || agent.status}
                        </p>
                        {agent.duration_seconds !== null && (
                          <p className="text-xs text-surface-400 dark:text-surface-500">
                            {formatDuration(agent.duration_seconds)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {events.length > 0 && (
            <Card>
              <div className="p-4">
                <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-3">
                  Event Timeline
                </h2>
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start gap-2 text-xs ">
                      <span className="text-surface-400 dark:text-surface-500 shrink-0 font-mono w-10">
                        {formatEventTime(event.created_at)}
                      </span>
                      <span className="text-surface-700 dark:text-surface-300">
                        <span className="font-medium">{event.agent_type || "System"}</span>
                        {" — "}
                        {event.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}
