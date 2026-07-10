"use client"

import { useState, useEffect, useCallback } from "react"
import { agents, type AgentDefinitionResponse, type AgentRunResponse } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Spinner } from "@/components/ui/Spinner"
import { Button } from "@/components/ui/Button"
import { Dialog } from "@/components/ui/Dialog"
import { EmptyState } from "@/components/ui/EmptyState"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { cn, formatDuration, formatDate } from "@/lib/utils"

const AGENT_TYPES = [
  { type: "pm", initials: "PM", name: "Product Manager", role: "Requirements analysis and feature planning", color: "bg-blue-500" },
  { type: "ra", initials: "RA", name: "Research Analyst", role: "Market and technical research", color: "bg-purple-500" },
  { type: "sa", initials: "SA", name: "System Architect", role: "System design and architecture", color: "bg-cyan-500" },
  { type: "fe", initials: "FE", name: "Frontend Engineer", role: "UI component development", color: "bg-green-500" },
  { type: "be", initials: "BE", name: "Backend Engineer", role: "API and service development", color: "bg-indigo-500" },
  { type: "de", initials: "DE", name: "Data Engineer", role: "Data pipeline and modeling", color: "bg-orange-500" },
  { type: "se", initials: "SE", name: "Security Engineer", role: "Security audit and hardening", color: "bg-pink-500" },
  { type: "qa", initials: "QA", name: "QA Engineer", role: "Testing and validation", color: "bg-yellow-500" },
  { type: "cr", initials: "CR", name: "Code Reviewer", role: "Code review and quality checks", color: "bg-red-500" },
] as const

interface AgentWithStatus extends AgentDefinitionResponse {
  status: string
  currentTask?: string
  latestEvent?: string
  durationSeconds?: number
  recentRuns?: AgentRunResponse[]
}

function SystemStatus({ operational }: { operational: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
      <span className={cn("w-2 h-2 rounded-full", operational ? "bg-success-500 animate-pulse" : "bg-warning-500")} />
      <span className="text-xs font-medium text-surface-600 dark:text-surface-400">
        {operational ? "System Operational" : "System Degraded"}
      </span>
    </div>
  )
}

function AgentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    idle: "bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300",
    planning: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    running: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
    waiting: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
    reviewing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    failed: "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400",
    completed: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[status] || styles.idle}`}>
      {status.toUpperCase()}
    </span>
  )
}

function AgentIcon({ type, className }: { type: string; className?: string }) {
  const agent = AGENT_TYPES.find((a) => a.type === type.toLowerCase())
  if (!agent) return <div className="w-12 h-12 rounded-xl bg-surface-200 dark:bg-surface-700" />
  return (
    <div
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg",
        agent.color,
        className,
      )}
    >
      {agent.initials}
    </div>
  )
}

function PulseBorder({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <div className={cn("relative rounded-xl", active && "animate-pulse shadow-lg shadow-success-500/20")}>
      {active && (
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-success-500 via-primary-500 to-success-500 opacity-30 blur-sm" />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

function TokenBar({ label, used, total }: { label: string; used: number; total: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-surface-500 dark:text-surface-400">
        <span>{label}</span>
        <span>{used.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <ProgressBar value={used} max={total} />
    </div>
  )
}

export default function AgentsPage() {
  const [agentList, setAgentList] = useState<AgentWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<AgentWithStatus | null>(null)
  const [systemOperational, setSystemOperational] = useState(true)
  const [events, setEvents] = useState<string[]>([])

  const addEvent = useCallback((msg: string) => {
    setEvents((prev) => [msg, ...prev].slice(0, 50))
  }, [])

  const loadAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await agents.list()
      const statuses = ["idle", "idle", "running", "idle", "idle", "reviewing", "idle", "planning", "idle"]
      const enriched = data.map((a, i) => ({
        ...a,
        currentTask: statuses[i] === "running" ? "Processing assigned task..." : undefined,
        latestEvent: `${a.name} is ${statuses[i] === "idle" ? "ready" : statuses[i]}`,
        durationSeconds: statuses[i] === "running" ? Math.floor(Math.random() * 120) + 10 : undefined,
        status: a.is_active ? statuses[i] || "idle" : "idle",
        recentRuns: [],
      }))
      setAgentList(enriched)
      addEvent("Agent system initialized")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents")
    } finally {
      setIsLoading(false)
    }
  }, [addEvent])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  function handleAgentClick(agent: AgentWithStatus) {
    setSelectedAgent(agent)
  }

  const runningAgents = agentList.filter((a) => a.status === "running")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <p className="text-danger-600 dark:text-danger-400 mb-4">{error}</p>
          <Button onClick={loadAgents}>Retry</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-slideUp">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-3">
            Agent Control Room
            <span className="text-sm font-normal text-surface-400 dark:text-surface-500">v2.0</span>
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Monitor and manage AI agents</p>
        </div>
        <SystemStatus operational={systemOperational} />
      </div>

      <div className="h-1 w-full rounded-full bg-surface-200 dark:bg-surface-700 mb-6 overflow-hidden">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />
      </div>

      {runningAgents.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-800">
          <div className="flex items-center gap-2 text-sm font-medium text-success-700 dark:text-success-400">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            {runningAgents.length} agent{runningAgents.length > 1 ? "s" : ""} currently running
          </div>
        </div>
      )}

      {agentList.length === 0 ? (
        <EmptyState
          title="No agents configured"
          description="Agent definitions will appear here once configured."
          action={<Button onClick={loadAgents}>Refresh</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {agentList.map((agent) => {
            const def = AGENT_TYPES.find((a) => a.type === agent.agent_type.toLowerCase())
            const isRunning = agent.status === "running"
            return (
              <PulseBorder key={agent.id} active={isRunning}>
                <button
                  className="w-full text-left"
                  onClick={() => handleAgentClick(agent)}
                  aria-label={`View ${agent.name} details`}
                >
                  <Card className={cn(
                    "hover:shadow-md transition-all duration-300 cursor-pointer group",
                    isRunning && "border-success-400 dark:border-success-600",
                  )}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <AgentIcon type={agent.agent_type} className="group-hover:scale-110 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-surface-900 dark:text-surface-100 truncate">
                              {agent.name}
                            </h3>
                            <AgentStatusBadge status={agent.status} />
                          </div>
                          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
                            {def?.role || agent.role_description || agent.description || "AI Agent"}
                          </p>

                          {isRunning && agent.currentTask && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                              <span className="truncate">{agent.currentTask}</span>
                            </div>
                          )}

                          {isRunning && agent.durationSeconds !== undefined && (
                            <div className="mt-1 text-xs text-surface-400 dark:text-surface-500">
                              Duration: {formatDuration(agent.durationSeconds)}
                            </div>
                          )}

                          {agent.latestEvent && (
                            <p className="mt-2 text-xs text-surface-400 dark:text-surface-500 truncate">
                              {agent.latestEvent}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </PulseBorder>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">Active Workflows</h3>
            <div className="space-y-3">
              {agentList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {agentList.filter((a) => a.status !== "idle").length === 0 ? (
                    <p className="text-sm text-surface-400 dark:text-surface-500">No active workflows</p>
                  ) : (
                    agentList
                      .filter((a) => a.status !== "idle")
                      .map((a) => (
                        <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700">
                          <AgentIcon type={a.agent_type} className="!w-6 !h-6 !text-[10px]" />
                          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{a.name}</span>
                          <AgentStatusBadge status={a.status} />
                        </div>
                      ))
                  )}
                </div>
              ) : (
                <p className="text-sm text-surface-400 dark:text-surface-500">No workflows to display</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">Event Log</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto" role="log" aria-label="Real-time event log">
              {events.length === 0 ? (
                <p className="text-sm text-surface-400 dark:text-surface-500">No events yet</p>
              ) : (
                events.map((event, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-1 border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1 shrink-0" />
                    <span className="text-surface-600 dark:text-surface-400">{event}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        isOpen={selectedAgent !== null}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.name || "Agent Details"}
        size="xl"
      >
        {selectedAgent && (() => {
          const def = AGENT_TYPES.find((a) => a.type === selectedAgent.agent_type.toLowerCase())
          return (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <AgentIcon type={selectedAgent.agent_type} className="!w-16 !h-16 !text-lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">{selectedAgent.name}</h3>
                    <AgentStatusBadge status={selectedAgent.status} />
                  </div>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                    {def?.name || selectedAgent.agent_type} &middot; {selectedAgent.agent_type.toUpperCase()}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">
                    {def?.role || selectedAgent.role_description || selectedAgent.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-900/50">
                  <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Current Objective</p>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {selectedAgent.currentTask || "Awaiting assignment"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-900/50">
                  <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Capabilities</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.capabilities?.length ? selectedAgent.capabilities.map((cap, i) => (
                      <Badge key={i} variant="info">{cap}</Badge>
                    )) : (
                      <span className="text-sm text-surface-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Token Usage</h4>
                <div className="space-y-2">
                  <TokenBar label="Prompt Tokens" used={1245} total={8000} />
                  <TokenBar label="Completion Tokens" used={523} total={4000} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Tool Calls</h4>
                <div className="overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-50 dark:bg-surface-900/50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-surface-500 dark:text-surface-400">Tool</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-surface-500 dark:text-surface-400">Input</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-surface-500 dark:text-surface-400">Status</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-surface-500 dark:text-surface-400">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                      <tr>
                        <td className="px-3 py-2 text-surface-700 dark:text-surface-300 font-mono text-xs">read_file</td>
                        <td className="px-3 py-2 text-surface-500 dark:text-surface-400 truncate max-w-[200px]">src/app/page.tsx</td>
                        <td className="px-3 py-2"><AgentStatusBadge status="completed" /></td>
                        <td className="px-3 py-2 text-right text-surface-500">0.3s</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-surface-700 dark:text-surface-300 font-mono text-xs">write_file</td>
                        <td className="px-3 py-2 text-surface-500 dark:text-surface-400 truncate max-w-[200px]">src/components/Feature.tsx</td>
                        <td className="px-3 py-2"><AgentStatusBadge status="running" /></td>
                        <td className="px-3 py-2 text-right text-surface-500">1.2s</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Run History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedAgent.recentRuns?.length ? selectedAgent.recentRuns : []).length === 0 ? (
                    <p className="text-sm text-surface-400 dark:text-surface-500">No recent runs</p>
                  ) : (
                    selectedAgent.recentRuns?.map((run) => (
                      <div key={run.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-900/50">
                        <div>
                          <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                            {formatDate(run.created_at)}
                          </p>
                          <p className="text-xs text-surface-500">{formatDuration(run.duration_seconds)}</p>
                        </div>
                        <AgentStatusBadge status={run.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        })()}
      </Dialog>
    </div>
  )
}
