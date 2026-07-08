"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { workflows, demo, type WorkflowResponse } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Spinner } from "@/components/ui/Spinner"
import { EmptyState } from "@/components/ui/EmptyState"
import { Dialog } from "@/components/ui/Dialog"
import { formatDate, cn } from "@/lib/utils"

interface AgentRun {
  id: string
  agent_type: string
  status: string
  started_at: string | null
}

interface WorkflowWithRuns extends WorkflowResponse {
  agent_runs?: AgentRun[]
  expanded?: boolean
}

const agentTypeLabels: Record<string, string> = {
  pm: "PM", ra: "RA", sa: "SA", fe: "FE", be: "BE", de: "DE", se: "SE", qa: "QA", cr: "CR",
}

const workflowTypeOptions = [
  { value: "full_pipeline", label: "Full Pipeline" },
  { value: "requirements_only", label: "Requirements Only" },
  { value: "architecture_only", label: "Architecture Only" },
  { value: "development_only", label: "Development Only" },
  { value: "review_only", label: "Review Only" },
]

function getStatusVariant(status: string): "default" | "success" | "warning" | "danger" | "info" | "purple" {
  const map: Record<string, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
    draft: "default",
    pending: "warning",
    in_progress: "info",
    completed: "success",
    failed: "danger",
    cancelled: "default",
  }
  return map[status] || "default"
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={getStatusVariant(status)}>{status.replace("_", " ")}</Badge>
}

function AgentIcon({ type }: { type: string }) {
  const label = agentTypeLabels[type.toLowerCase()] || type.slice(0, 2).toUpperCase()
  const bgColors: Record<string, string> = {
    pm: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ra: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    sa: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    fe: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    be: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    de: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    se: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    qa: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    cr: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${bgColors[type.toLowerCase()] || "bg-surface-100 text-surface-600"}`}>
      {label}
    </div>
  )
}

export default function WorkflowsPage() {
  const params = useParams()
  const projectId = params.id as string

  const [workflowList, setWorkflowList] = useState<WorkflowWithRuns[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [createType, setCreateType] = useState("full_pipeline")
  const [isCreating, setIsCreating] = useState(false)

  async function loadWorkflows() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await workflows.list(projectId)
      setWorkflowList(data.map((w) => ({ ...w, expanded: false })))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflows")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()
  }, [projectId])

  async function handleCreate() {
    if (!createName.trim()) return
    setIsCreating(true)
    try {
      await workflows.create({
        project_id: projectId,
        name: createName,
        description: createDescription || undefined,
        workflow_type: createType,
      })
      setDialogOpen(false)
      setCreateName("")
      setCreateDescription("")
      setCreateType("full_pipeline")
      loadWorkflows()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow")
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDemoContinue(workflowId: string) {
    try {
      await demo.continue(workflowId)
      loadWorkflows()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to continue workflow")
    }
  }

  function toggleExpand(id: string) {
    setWorkflowList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, expanded: !w.expanded } : w)),
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Workflows</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Manage AI agent workflows for this project
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} aria-label="Create new workflow">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Workflow
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg text-sm text-danger-700 dark:text-danger-400" role="alert">
          {error}
        </div>
      )}

      {workflowList.length === 0 && !error ? (
        <EmptyState
          title="No workflows yet"
          description="Create your first workflow to get started with AI-powered development."
          action={
            <Button onClick={() => setDialogOpen(true)}>Create Workflow</Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {workflowList.map((workflow) => (
            <Card key={workflow.id}>
              <button
                className="w-full text-left"
                onClick={() => toggleExpand(workflow.id)}
                aria-expanded={workflow.expanded}
                aria-label={`${workflow.name} workflow details`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-surface-100">{workflow.name}</h3>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                          {(workflow.workflow_type || "manual").replace(/_/g, " ")} &middot; Created {formatDate(workflow.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={workflow.status} />
                      <svg
                        className={cn(
                          "w-4 h-4 text-surface-400 transition-transform",
                          workflow.expanded && "rotate-180",
                        )}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </CardHeader>
              </button>

              {workflow.expanded && (
                <CardContent>
                  <div className="space-y-4">
                    {workflow.description && (
                      <p className="text-sm text-surface-600 dark:text-surface-400">{workflow.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-surface-500 dark:text-surface-400">Current Stage</span>
                        <p className="font-medium text-surface-900 dark:text-surface-100 mt-0.5">
                          {workflow.current_stage || "Not started"}
                        </p>
                      </div>
                      <div>
                        <span className="text-surface-500 dark:text-surface-400">Type</span>
                        <p className="font-medium text-surface-900 dark:text-surface-100 mt-0.5 capitalize">
                          {(workflow.workflow_type || "manual").replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>

                    {workflow.status === "pending" && (
                      <div className="pt-2">
                        <Button size="sm" onClick={() => handleDemoContinue(workflow.id)}>
                          Continue Demo
                        </Button>
                      </div>
                    )}

                    {workflow.agent_runs && workflow.agent_runs.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                          Agent Runs ({workflow.agent_runs.length})
                        </h4>
                        <div className="space-y-2">
                          {workflow.agent_runs.map((run) => (
                            <div
                              key={run.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-surface-50 dark:bg-surface-900/50"
                            >
                              <AgentIcon type={run.agent_type} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-surface-700 dark:text-surface-300 capitalize">
                                  {run.agent_type}
                                </p>
                              </div>
                              <StatusBadge status={run.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} title="New Workflow" size="lg">
        <div className="space-y-4">
          <Input
            label="Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="e.g., Full Feature Implementation"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Description</label>
            <textarea
              className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Workflow Type</label>
            <select
              className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={createType}
              onChange={(e) => setCreateType(e.target.value)}
            >
              {workflowTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={isCreating} disabled={!createName.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
