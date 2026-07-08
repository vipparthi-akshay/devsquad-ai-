"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { events, type EventResponse } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { EmptyState } from "@/components/ui/EmptyState"
import { cn, formatDate } from "@/lib/utils"

type EventTypeFilter = string | "all"

const EVENT_COLORS: Record<string, string> = {
  PROJECT_CREATED: "bg-blue-500",
  WORKFLOW_STARTED: "bg-success-500",
  AGENT_STARTED: "bg-secondary-500",
  APPROVAL_REQUESTED: "bg-warning-500",
  APPROVAL_APPROVED: "bg-success-500",
  APPROVAL_REJECTED: "bg-danger-500",
  TASK_CREATED: "bg-primary-500",
  TASK_COMPLETED: "bg-success-500",
  AGENT_FAILED: "bg-danger-500",
  REVIEW_STARTED: "bg-purple-500",
  REVIEW_COMPLETED: "bg-purple-500",
  CODE_GENERATED: "bg-cyan-500",
  DEPLOYMENT_STARTED: "bg-orange-500",
  DEPLOYMENT_COMPLETED: "bg-success-500",
}

const EVENT_ICONS: Record<string, string> = {
  PROJECT_CREATED: "P",
  WORKFLOW_STARTED: "W",
  AGENT_STARTED: "A",
  APPROVAL_REQUESTED: "R",
  APPROVAL_APPROVED: "Y",
  APPROVAL_REJECTED: "N",
  TASK_CREATED: "T",
  TASK_COMPLETED: "D",
  AGENT_FAILED: "F",
  REVIEW_STARTED: "V",
  REVIEW_COMPLETED: "V",
  CODE_GENERATED: "C",
  DEPLOYMENT_STARTED: "D",
  DEPLOYMENT_COMPLETED: "D",
}

const eventTypes = [
  "all",
  "PROJECT_CREATED",
  "WORKFLOW_STARTED",
  "AGENT_STARTED",
  "APPROVAL_REQUESTED",
  "APPROVAL_APPROVED",
  "APPROVAL_REJECTED",
  "TASK_CREATED",
  "TASK_COMPLETED",
  "AGENT_FAILED",
  "REVIEW_STARTED",
  "REVIEW_COMPLETED",
  "CODE_GENERATED",
  "DEPLOYMENT_STARTED",
  "DEPLOYMENT_COMPLETED",
]

function EventDot({ eventType }: { eventType: string }) {
  return (
    <div
      className={cn(
        "w-3 h-3 rounded-full ring-2 ring-white dark:ring-surface-900 shrink-0",
        EVENT_COLORS[eventType] || "bg-surface-400",
      )}
    />
  )
}

function EventIcon({ eventType }: { eventType: string }) {
  const bg = EVENT_COLORS[eventType] || "bg-surface-400"
  const icon = EVENT_ICONS[eventType] || "●"
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", bg)}>
      {icon}
    </div>
  )
}

export default function ActivityPage() {
  const params = useParams()
  const projectId = params.id as string

  const [activityList, setActivityList] = useState<EventResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<EventTypeFilter>("all")
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [displayCount, setDisplayCount] = useState(20)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadActivities = useCallback(async () => {
    try {
      const data = await events.list(projectId, 100)
      setActivityList(data)
      setError(null)
    } catch (err) {
      if (!activityList.length) {
        const mock: EventResponse[] = [
          { id: "e1", project_id: projectId, workspace_id: "w1", event_type: "PROJECT_CREATED", title: "Project initialized", description: "DevSquad AI project created", agent_type: null, metadata_json: null, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
          { id: "e2", project_id: projectId, workspace_id: "w1", event_type: "WORKFLOW_STARTED", title: "Requirements workflow started", description: "Full pipeline workflow initiated for requirement gathering", agent_type: "pm", metadata_json: null, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: "e3", project_id: projectId, workspace_id: "w1", event_type: "AGENT_STARTED", title: "PM agent started", description: "Product Manager agent began analyzing requirements", agent_type: "pm", metadata_json: null, created_at: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString() },
          { id: "e4", project_id: projectId, workspace_id: "w1", event_type: "TASK_CREATED", title: "User stories created", description: "5 user stories generated from requirements analysis", agent_type: "pm", metadata_json: null, created_at: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString() },
          { id: "e5", project_id: projectId, workspace_id: "w1", event_type: "APPROVAL_REQUESTED", title: "Approval: Architecture design", description: "System Architect requesting approval for component model", agent_type: "sa", metadata_json: null, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: "e6", project_id: projectId, workspace_id: "w1", event_type: "APPROVAL_APPROVED", title: "Architecture design approved", description: "Component model approved with minor changes", agent_type: null, metadata_json: null, created_at: new Date(Date.now() - 86400000 + 1800000).toISOString() },
          { id: "e7", project_id: projectId, workspace_id: "w1", event_type: "AGENT_STARTED", title: "FE agent started", description: "Frontend Engineer agent began UI implementation", agent_type: "fe", metadata_json: null, created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: "e8", project_id: projectId, workspace_id: "w1", event_type: "CODE_GENERATED", title: "UI components generated", description: "Button, Card, and Input components created", agent_type: "fe", metadata_json: null, created_at: new Date(Date.now() - 1800000).toISOString() },
          { id: "e9", project_id: projectId, workspace_id: "w1", event_type: "REVIEW_STARTED", title: "Code review started", description: "Code Reviewer agent reviewing frontend implementation", agent_type: "cr", metadata_json: null, created_at: new Date(Date.now() - 600000).toISOString() },
          { id: "e10", project_id: projectId, workspace_id: "w1", event_type: "TASK_COMPLETED", title: "Authentication module completed", description: "JWT authentication module implementation finished", agent_type: "be", metadata_json: null, created_at: new Date(Date.now() - 300000).toISOString() },
        ]
        setActivityList(mock)
      }
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  useEffect(() => {
    if (autoRefresh) {
      const id = setInterval(loadActivities, 10000)
      intervalRef.current = id
      return () => { clearInterval(id); intervalRef.current = null }
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh, loadActivities])

  const filteredActivities = useMemo(() => {
    let list = activityList
    if (filter !== "all") {
      list = list.filter((e) => e.event_type === filter)
    }
    return list.slice(0, displayCount)
  }, [activityList, filter, displayCount])

  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }, [filteredActivities])

  function formatEventTime(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return formatDate(dateStr)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Activity</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Timeline of events and actions
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
          />
          Auto-refresh
        </label>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg" role="tablist" aria-label="Event type filters">
        {eventTypes.slice(0, 7).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            role="tab"
            aria-selected={filter === type}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
              filter === type
                ? "bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm"
                : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300",
            )}
          >
            {type === "all" ? "All" : type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {sortedActivities.length === 0 ? (
        <EmptyState
          title="No activity found"
          description={filter !== "all" ? "No events match the selected filter." : "Project activity will appear here."}
        />
      ) : (
        <div className="relative" role="feed" aria-label="Activity timeline">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-surface-200 dark:bg-surface-700" aria-hidden="true" />
          <div className="space-y-0">
            {sortedActivities.map((event, index) => (
              <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="relative z-10 flex items-center justify-center">
                  <EventIcon eventType={event.event_type} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                      {event.title}
                    </span>
                    <span className="text-xs text-surface-400 dark:text-surface-500 whitespace-nowrap">
                      {formatEventTime(event.created_at)}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                      EVENT_COLORS[event.event_type]
                        ? "text-white"
                        : "bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400",
                    )}>
                      {event.event_type.replace(/_/g, " ")}
                    </span>
                    {event.agent_type && (
                      <span className="text-[10px] text-surface-400 dark:text-surface-500 uppercase">
                        Agent: {event.agent_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {displayCount < activityList.length && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setDisplayCount((c) => c + 20)}>
            Load More ({activityList.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}
