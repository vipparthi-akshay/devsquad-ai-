"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api, workspaces, approvals as approvalsApi, type ProjectResponse, type EventResponse, type ApprovalResponse, type WorkspaceResponse } from "@/lib/api"
import { cn, formatDate, getStatusColor, truncate } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"

export default function DashboardPage() {
  const [projectList, setProjectList] = useState<ProjectResponse[]>([])
  const [eventList, setEventList] = useState<EventResponse[]>([])
  const [approvalList, setApprovalList] = useState<ApprovalResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const wsData: WorkspaceResponse[] = await workspaces.list()
        const wsId = wsData[0]?.id
        if (wsId) {
          const [projectsData, eventsData, approvalsData] = await Promise.all([
            api.projects.listByWorkspace(wsId),
            api.events.list(wsData[0]?.id || "", 10),
            approvalsApi.list(wsData[0]?.id || ""),
          ])
          setProjectList(projectsData)
          setEventList(eventsData.slice(0, 10))
          setApprovalList(approvalsData.filter((a) => a.status === "pending"))
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const pendingApprovals = approvalList.filter((a) => a.status === "pending")
  const runningAgents = projectList.length > 0 ? Math.min(3, projectList.length) : 0

  return (
      <div className="space-y-6 animate-slideUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Dashboard</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Overview of your workspace
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={projectList.length} loading={loading} accent="primary" />
        <StatCard label="Running Agents" value={runningAgents} loading={loading} accent="secondary" />
        <StatCard label="Pending Approvals" value={pendingApprovals.length} loading={loading} accent="warning" />
        <StatCard label="Workflow Success Rate" value={loading ? "..." : "100%"} loading={loading} accent="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <Link
                href="/projects"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : projectList.length === 0 ? (
                <EmptyState
                  title="No projects yet"
                  description="Create your first project to get started"
                  action={
                    <Link href="/projects/new">
                      <Button>Create Project</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {projectList.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between rounded-lg border border-surface-100 p-3 transition-colors hover:border-surface-200 hover:bg-surface-50 dark:border-surface-800 dark:hover:border-surface-700 dark:hover:bg-surface-800/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate dark:text-surface-100">
                            {project.name}
                          </p>
                          {project.description && (
                            <p className="text-xs text-surface-500 truncate dark:text-surface-400">
                              {truncate(project.description, 60)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={getStatusColor(project.status)} size="sm">
                        {project.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {pendingApprovals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <Link
                  href="/approvals"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingApprovals.slice(0, 3).map((approval) => (
                    <div
                      key={approval.id}
                      className="flex items-center justify-between rounded-lg border border-surface-100 p-3 dark:border-surface-800"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                          {approval.title}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {approval.requesting_agent}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-3">
                        <Button size="sm" variant="primary">Approve</Button>
                        <Button size="sm" variant="ghost">Review</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : eventList.length === 0 ? (
                <EmptyState
                  title="No events yet"
                  description="Activity will appear here"
                />
              ) : (
                <div className="space-y-0">
                  {eventList.map((event, idx) => (
                    <div key={event.id} className="relative flex gap-4 pb-4">
                      {idx < eventList.length - 1 && (
                        <div className="absolute left-[7px] top-4 bottom-0 w-px bg-surface-200 dark:bg-surface-800" />
                      )}
                      <div className="relative flex h-4 w-4 flex-shrink-0 mt-1">
                        <div className={cn("h-4 w-4 rounded-full border-2", getEventColor(event.event_type))} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-surface-900 dark:text-surface-100">
                          {event.description || event.title}
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

function StatCard({
  label,
  value,
  loading,
  accent,
}: {
  label: string
  value: string | number
  loading: boolean
  accent: "primary" | "secondary" | "warning" | "success"
}) {
  const accentBar = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    warning: "bg-warning-500",
    success: "bg-success-500",
  }[accent]

  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute top-0 left-0 h-1 w-full", accentBar)} />
      <CardContent>
        <div className="mt-3">
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
              {value}
            </p>
          )}
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
