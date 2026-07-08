"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api, type ProjectResponse, type WorkflowResponse, type EventResponse, type ApprovalResponse } from "@/lib/api"
import { cn, formatDate, getStatusColor } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Tabs } from "@/components/ui/Tabs"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { ProgressBar } from "@/components/ui/ProgressBar"

const PAGE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "requirements", label: "Requirements" },
  { id: "architecture", label: "Architecture" },
  { id: "backlog", label: "Backlog" },
  { id: "agents", label: "Agents" },
  { id: "workflows", label: "Workflows" },
  { id: "approvals", label: "Approvals" },
  { id: "activity", label: "Activity" },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [workflows, setWorkflows] = useState<WorkflowResponse[]>([])
  const [events, setEvents] = useState<EventResponse[]>([])
  const [approvals, setApprovals] = useState<ApprovalResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, workflowsData, eventsData, approvalsData] = await Promise.all([
          api.projects.get(projectId),
          api.workflows.list(projectId),
          api.events.list(projectId),
          api.approvals.list(projectId),
        ])
        setProject(projectData)
        setWorkflows(workflowsData)
        setEvents(eventsData.slice(0, 5))
        setApprovals(approvalsData)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [projectId])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const tabRoutes: Record<string, string> = {
      requirements: `/projects/${projectId}/requirements`,
      architecture: `/projects/${projectId}/architecture`,
      backlog: `/projects/${projectId}/backlog`,
    }
    if (tabRoutes[tabId]) {
      router.push(tabRoutes[tabId])
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project doesn't exist or you don't have access."
        action={
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        }
      />
    )
  }

  const pendingApprovals = approvals.filter((a) => a.status === "pending")

  return (
    <div className="space-y-6 animate-slideUp">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
              {project.name}
            </h1>
            <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
          </div>
          {project.description && (
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <Tabs tabs={PAGE_TABS} activeTab={activeTab} onChange={handleTabChange} />

      <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-surface-600 dark:text-surface-400">Workflow Completion</span>
                      <span className="font-medium text-surface-900 dark:text-surface-100">
                        {workflows.length > 0
                          ? `${Math.round((workflows.filter((w) => w.status === "completed").length / workflows.length) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                    <ProgressBar
                      value={workflows.length > 0
                        ? (workflows.filter((w) => w.status === "completed").length / workflows.length) * 100
                        : 0
                      }
                      variant={workflows.length > 0 &&
                        (workflows.filter((w) => w.status === "completed").length / workflows.length) >= 0.7
                        ? "success"
                        : "warning"
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-surface-100 p-3 dark:border-surface-800">
                      <p className="text-xs text-surface-500 dark:text-surface-400">Active Workflows</p>
                      <p className="mt-1 text-xl font-bold text-surface-900 dark:text-surface-50">
                        {workflows.filter((w) => w.status === "running" || w.status === "in_progress").length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-surface-100 p-3 dark:border-surface-800">
                      <p className="text-xs text-surface-500 dark:text-surface-400">Pending Approvals</p>
                      <Link
                        href={`/projects/${projectId}/approvals`}
                        className="mt-1 block text-xl font-bold text-warning-600 hover:text-warning-500 dark:text-warning-400"
                      >
                        {pendingApprovals.length}
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                {workflows.filter((w) => w.status === "running" || w.status === "in_progress").length === 0 ? (
                  <EmptyState
                    title="No active workflows"
                    description="Start a workflow to see it here"
                  />
                ) : (
                  <div className="space-y-2">
                    {workflows
                      .filter((w) => w.status === "running" || w.status === "in_progress")
                      .map((workflow) => (
                        <div
                          key={workflow.id}
                          className="flex items-center justify-between rounded-lg border border-surface-100 p-3 dark:border-surface-800"
                        >
                          <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                            {workflow.name}
                          </span>
                          <Badge variant={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <EmptyState
                    title="No activity yet"
                    description="Events will appear here as work progresses"
                  />
                ) : (
                  <div className="space-y-0">
                    {events.map((event, idx) => (
                      <div key={event.id} className="relative flex gap-4 pb-4">
                        {idx < events.length - 1 && (
                          <div className="absolute left-[7px] top-4 bottom-0 w-px bg-surface-200 dark:bg-surface-800" />
                        )}
                        <div className="relative flex h-4 w-4 flex-shrink-0 mt-1">
                          <div className={cn(
                            "h-4 w-4 rounded-full border-2",
                            getEventColor(event.event_type)
                          )} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-surface-900 dark:text-surface-100">
                            {event.description}
                          </p>
                          <p className="text-xs text-surface-500 dark:text-surface-400">
                            {formatDate(event.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  icon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.007-1.875 2.25-1.875s2.25.84 2.25 1.875c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0c.31 0 .555-.26.532-.57a48.04 48.04 0 00-.648-5.102 48.05 48.05 0 00-5.08-.617.64.64 0 00-.657.643z" />
                    </svg>
                  }
                  onClick={() => {
                    api.workflows.create({ project_id: projectId, name: "Demo Workflow" }).catch(() => {})
                  }}
                >
                  Start Demo Workflow
                </Button>
                <Link href={`/projects/${projectId}/requirements`}>
                  <Button
                    className="w-full justify-start"
                    variant="secondary"
                    icon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    }
                  >
                    New Requirement
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {pendingApprovals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                  <Link
                    href={`/projects/${projectId}/approvals`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingApprovals.slice(0, 3).map((approval) => (
                    <div
                      key={approval.id}
                      className="rounded-lg border border-surface-100 p-3 dark:border-surface-800"
                    >
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                        {approval.title}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                        {formatDate(approval.created_at)}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm">Approve</Button>
                        <Button size="sm" variant="ghost">Review</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getEventColor(type: string): string {
  const map: Record<string, string> = {
    created: "border-primary-500 bg-primary-500",
    completed: "border-success-500 bg-success-500",
    failed: "border-danger-500 bg-danger-500",
    started: "border-accent-500 bg-accent-500",
    updated: "border-warning-500 bg-warning-500",
  }
  return map[type?.toLowerCase()] ?? "border-surface-400 bg-surface-400"
}
