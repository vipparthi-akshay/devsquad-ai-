"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { api, type Epic, type TaskResponse } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"

const statusConfig: Record<string, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple"; className: string }> = {
  BACKLOG: { label: "Backlog", variant: "default", className: "border-l-surface-300 dark:border-l-surface-600" },
  READY: { label: "Ready", variant: "info", className: "border-l-accent-500" },
  IN_PROGRESS: { label: "In Progress", variant: "warning", className: "border-l-warning-500" },
  BLOCKED: { label: "Blocked", variant: "danger", className: "border-l-danger-500" },
  IN_REVIEW: { label: "In Review", variant: "purple", className: "border-l-secondary-500" },
  DONE: { label: "Done", variant: "success", className: "border-l-success-500" },
  CANCELLED: { label: "Cancelled", variant: "default", className: "border-l-surface-400 line-through opacity-60" },
}

const priorityConfig: Record<string, "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple"> = {
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger",
}

export default function BacklogPage() {
  const params = useParams()
  const projectId = params.id as string

  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.backlog.list(projectId)
        setEpics(data)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [projectId])

  const allTasks = epics.flatMap((epic) =>
    (epic.stories || []).flatMap((story) =>
      (story.tasks || []).map((task) => ({ ...task, epicTitle: epic.title, storyTitle: story.title }))
    )
  )

  const filteredTasks = allTasks.filter((task) => {
    if (statusFilter !== "ALL" && task.status !== statusFilter) return false
    if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  if (epics.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Backlog</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Task graph and backlog management
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              title="No backlog items yet"
              description="Generate requirements and architecture first to populate the backlog"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Backlog</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {allTasks.length} tasks across {epics.length} epics
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-surface-500 dark:text-surface-400">Status:</label>
          <select
            className="rounded-lg border border-surface-300 bg-white px-3 py-1.5 text-sm text-surface-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-surface-500 dark:text-surface-400">Priority:</label>
          <select
            className="rounded-lg border border-surface-300 bg-white px-3 py-1.5 text-sm text-surface-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="ALL">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {epics.map((epic) => {
          const epicTasks = (epic.stories || []).flatMap((s) => s.tasks || [])
          const hasVisibleTasks = statusFilter === "ALL"
            ? epicTasks.length > 0
            : epicTasks.some((t) => t.status === statusFilter)

          if (!hasVisibleTasks && statusFilter !== "ALL") return null

          return (
            <Card key={epic.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-100 text-sm font-medium text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300">
                    E
                  </div>
                  <div>
                    <CardTitle>{epic.title}</CardTitle>
                    {epic.description && (
                      <p className="text-sm text-surface-500 dark:text-surface-400">{epic.description}</p>
                    )}
                  </div>
                </div>
                <Badge variant={epic.status === "completed" ? "success" : epic.status === "in_progress" ? "warning" : "default"}>
                  {epic.status}
                </Badge>
              </CardHeader>
              <CardContent>
                {(epic.stories || []).length === 0 ? (
                  <p className="text-sm text-surface-500 dark:text-surface-400">No stories in this epic yet.</p>
                ) : (
                  <div className="space-y-4">
                    {epic.stories?.map((story) => {
                      const visibleTasks = (story.tasks || []).filter((t) => {
                        if (statusFilter !== "ALL" && t.status !== statusFilter) return false
                        if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false
                        return true
                      })

                      if (visibleTasks.length === 0 && statusFilter !== "ALL") return null

                      return (
                        <div key={story.id} className="ml-6 border-l-2 border-surface-200 pl-4 dark:border-surface-700">
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent-100 text-xs font-medium text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
                              S
                            </div>
                            <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                              {story.title}
                            </span>
                            <Badge size="sm" variant={
                              story.status === "completed" || story.status === "done" ? "success"
                              : story.status === "in_progress" ? "warning"
                              : "default"
                            }>
                              {story.status}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            {visibleTasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                allTasks={allTasks}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  allTasks,
}: {
  task: TaskResponse & { epicTitle?: string; storyTitle?: string }
  allTasks: (TaskResponse & { epicTitle?: string; storyTitle?: string })[]
}) {
  const config = statusConfig[task.status] || statusConfig.BACKLOG
  const dependencies = task.depends_on
    ?.map((depId) => allTasks.find((t) => t.id === depId))
    .filter(Boolean) as (TaskResponse & { epicTitle?: string; storyTitle?: string })[] | undefined

  return (
    <div
      className={cn(
        "rounded-lg border border-surface-100 bg-white p-3 transition-colors hover:border-surface-200 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700",
        "border-l-4",
        config.className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium text-surface-900 dark:text-surface-100",
              task.status === "CANCELLED" && "line-through"
            )}>
              {task.title}
            </span>
          </div>
          {task.description && (
            <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400 line-clamp-2">
              {task.description}
            </p>
          )}
          {dependencies && dependencies.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 flex-shrink-0 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
              <span className="text-xs text-surface-500 dark:text-surface-400">Depends on: </span>
              {dependencies.map((dep) => (
                <span
                  key={dep.id}
                  className="inline-flex items-center rounded bg-surface-100 px-1.5 py-0.5 text-xs text-surface-600 dark:bg-surface-800 dark:text-surface-400"
                >
                  {dep.title}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <Badge variant={priorityConfig[task.priority] || "default"} size="sm">
            {task.priority}
          </Badge>
          <Badge variant={config.variant} size="sm">
            {config.label}
          </Badge>
          {task.assignee_agent && (
            <span className="text-xs text-surface-500 dark:text-surface-400">{task.assignee_agent}</span>
          )}
        </div>
      </div>
    </div>
  )
}
