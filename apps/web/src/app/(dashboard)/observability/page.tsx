"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Spinner } from "@/components/ui/Spinner"
import { Input } from "@/components/ui/Input"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { EmptyState } from "@/components/ui/EmptyState"
import { formatDuration, formatDate, getStatusColor, cn } from "@/lib/utils"

interface MetricCard {
  label: string
  value: string
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  color: string
}

interface RunRecord {
  id: string
  agent: string
  workflow: string
  status: string
  duration: number
  tokens: number
  cost: number
  error: string | null
  started_at: string
}

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  agent: string
  message: string
}

function MetricCardView({ metric }: { metric: MetricCard }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          {metric.label}
        </p>
        <p className={cn("text-2xl font-bold mt-1", metric.color)}>{metric.value}</p>
        {metric.subtitle && (
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{metric.subtitle}</p>
        )}
        {metric.trend && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-xs mt-2",
            metric.trend === "up" ? "text-success-600" : metric.trend === "down" ? "text-danger-600" : "text-surface-400",
          )}>
            {metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→"}
            {metric.trend === "up" ? " +2.3%" : metric.trend === "down" ? " -1.1%" : " 0%"}
          </span>
        )}
      </CardContent>
    </Card>
  )
}

function BarChart({ data, label, color }: { data: { label: string; value: number }[]; label: string; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-surface-500 dark:text-surface-400 w-24 shrink-0 truncate">{item.label}</span>
          <div className="flex-1 h-5 bg-surface-100 dark:bg-surface-800 rounded overflow-hidden">
            <div
              className={cn("h-full rounded transition-all duration-500", color)}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-surface-600 dark:text-surface-400 w-12 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

const AGENT_COLORS: Record<string, string> = {
  pm: "bg-blue-500",
  ra: "bg-purple-500",
  sa: "bg-cyan-500",
  fe: "bg-green-500",
  be: "bg-indigo-500",
  de: "bg-orange-500",
  se: "bg-pink-500",
  qa: "bg-yellow-500",
  cr: "bg-red-500",
}

const LOG_LEVEL_STYLES: Record<string, string> = {
  info: "text-primary-600 dark:text-primary-400",
  warn: "text-warning-600 dark:text-warning-400",
  error: "text-danger-600 dark:text-danger-400",
  debug: "text-surface-400 dark:text-surface-500",
}

export default function ObservabilityPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [logFilter, setLogFilter] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")

  const metrics: MetricCard[] = [
    { label: "Workflow Success Rate", value: "94.2%", subtitle: "Last 30 days", trend: "up", color: "text-success-600" },
    { label: "Avg Workflow Duration", value: "12m 34s", subtitle: "Across all workflows", trend: "down", color: "text-surface-900 dark:text-surface-100" },
    { label: "Total Agent Runs", value: "1,847", subtitle: "All-time", trend: "up", color: "text-primary-600" },
    { label: "Total Token Usage", value: "12.4M", subtitle: "Prompt + Completion", trend: "up", color: "text-secondary-600" },
    { label: "Estimated Cost", value: "$42.18", subtitle: "Total spend", trend: "up", color: "text-warning-600" },
    { label: "Approval Latency", value: "3.2m", subtitle: "Avg response time", trend: "down", color: "text-accent-600" },
  ]

  const workflowChartData = [
    { label: "Full Pipeline", value: 45 },
    { label: "Requirements", value: 28 },
    { label: "Architecture", value: 19 },
    { label: "Development", value: 52 },
    { label: "Review", value: 33 },
  ]

  const agentRunData = [
    { label: "PM", value: 156 },
    { label: "RA", value: 89 },
    { label: "SA", value: 67 },
    { label: "FE", value: 312 },
    { label: "BE", value: 278 },
    { label: "DE", value: 45 },
    { label: "SE", value: 34 },
    { label: "QA", value: 198 },
    { label: "CR", value: 145 },
  ]

  const tokenData = [
    { label: "Week 1", value: 980000 },
    { label: "Week 2", value: 1200000 },
    { label: "Week 3", value: 1450000 },
    { label: "Week 4", value: 2100000 },
  ]

  const [recentRuns] = useState<RunRecord[]>([
    { id: "r1", agent: "FE", workflow: "UI Implementation", status: "completed", duration: 420, tokens: 12450, cost: 0.42, error: null, started_at: new Date(Date.now() - 300000).toISOString() },
    { id: "r2", agent: "BE", workflow: "Auth Module", status: "completed", duration: 580, tokens: 18200, cost: 0.61, error: null, started_at: new Date(Date.now() - 600000).toISOString() },
    { id: "r3", agent: "QA", workflow: "UI Testing", status: "running", duration: 210, tokens: 8900, cost: 0.30, error: null, started_at: new Date(Date.now() - 900000).toISOString() },
    { id: "r4", agent: "CR", workflow: "Code Review", status: "failed", duration: 120, tokens: 5600, cost: 0.19, error: "Rate limit exceeded", started_at: new Date(Date.now() - 1800000).toISOString() },
    { id: "r5", agent: "SA", workflow: "Architecture", status: "completed", duration: 890, tokens: 32100, cost: 1.08, error: null, started_at: new Date(Date.now() - 3600000).toISOString() },
  ])

  const [logs] = useState<LogEntry[]>([
    { id: "l1", timestamp: new Date(Date.now() - 10000).toISOString(), level: "info", agent: "FE", message: "Component generation completed successfully" },
    { id: "l2", timestamp: new Date(Date.now() - 30000).toISOString(), level: "warn", agent: "BE", message: "API rate limit approaching threshold" },
    { id: "l3", timestamp: new Date(Date.now() - 60000).toISOString(), level: "error", agent: "CR", message: "Review failed: exceeds max file size" },
    { id: "l4", timestamp: new Date(Date.now() - 120000).toISOString(), level: "info", agent: "QA", message: "Test suite execution started" },
    { id: "l5", timestamp: new Date(Date.now() - 180000).toISOString(), level: "debug", agent: "FE", message: "Processing template variables" },
    { id: "l6", timestamp: new Date(Date.now() - 240000).toISOString(), level: "info", agent: "PM", message: "Requirements analysis complete" },
    { id: "l7", timestamp: new Date(Date.now() - 300000).toISOString(), level: "warn", agent: "SA", message: "Deprecated package detected in dependencies" },
    { id: "l8", timestamp: new Date(Date.now() - 360000).toISOString(), level: "info", agent: "BE", message: "Database migration executed" },
  ])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = levelFilter === "all" || log.level === levelFilter
      const matchesSearch = !logFilter || log.message.toLowerCase().includes(logFilter.toLowerCase()) || log.agent.toLowerCase().includes(logFilter.toLowerCase())
      return matchesLevel && matchesSearch
    })
  }, [logs, logFilter, levelFilter])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const activeRuns = recentRuns.filter((r) => r.status === "running").length
  const failedRuns = recentRuns.filter((r) => r.status === "failed").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-slideUp">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Observability</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          System metrics, logs, and run history
        </p>
      </div>

      {activeRuns > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800 text-sm text-primary-700 dark:text-primary-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          {activeRuns} run{activeRuns > 1 ? "s" : ""} in progress
        </div>
      )}

      {failedRuns > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-danger-50 dark:bg-danger-900/10 border border-danger-200 dark:border-danger-800 text-sm text-danger-700 dark:text-danger-400 flex items-center gap-2">
          {failedRuns} run{failedRuns > 1 ? "s" : ""} failed
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {metrics.map((metric) => (
          <MetricCardView key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">Workflow Runs</h3>
          </CardHeader>
          <CardContent>
            <BarChart data={workflowChartData} label="Workflow" color="bg-primary-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">Agent Run Duration</h3>
          </CardHeader>
          <CardContent>
            <BarChart data={agentRunData} label="Agent" color="bg-secondary-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">Token Usage Over Time</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {tokenData.map((item) => {
                const maxTokens = Math.max(...tokenData.map((d) => d.value))
                const height = (item.value / maxTokens) * 100
                return (
                  <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-surface-400 dark:text-surface-500">{(item.value / 1000000).toFixed(1)}M</span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-surface-500 dark:text-surface-400">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Recent Runs</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400">Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400">Workflow</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400">Duration</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400">Tokens</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {recentRuns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-surface-400 dark:text-surface-500">No runs recorded</td>
                  </tr>
                ) : (
                  recentRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", AGENT_COLORS[run.agent.toLowerCase()] || "bg-surface-400")} />
                          <span className="font-medium text-surface-700 dark:text-surface-300">{run.agent}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{run.workflow}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          getStatusColor(run.status),
                        )}>
                          {run.status === "running" && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 animate-pulse" />}
                          {run.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-surface-600 dark:text-surface-400">{formatDuration(run.duration)}</td>
                      <td className="px-4 py-3 text-right text-surface-600 dark:text-surface-400">{run.tokens.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-surface-600 dark:text-surface-400">${run.cost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-surface-600 dark:text-surface-400 max-w-[200px] truncate">
                        {run.error ? <span className="text-danger-600">{run.error}</span> : <span className="text-surface-400">&mdash;</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">Structured Logs</h3>
            <div className="flex items-center gap-3">
              <select
                className="text-xs rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-2 py-1.5 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                aria-label="Filter by log level"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
                <option value="debug">Debug</option>
              </select>
              <div className="w-48">
                <Input
                  placeholder="Search logs..."
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  aria-label="Search logs"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No logs found"
                description={logFilter || levelFilter !== "all" ? "Try adjusting your filters." : "No logs recorded yet"}
              />
            </div>
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-700 max-h-96 overflow-y-auto" role="log" aria-label="System logs">
              {filteredLogs.map((log) => (
                <div key={log.id} className="px-4 py-2.5 flex items-start gap-3 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <span className="text-[11px] text-surface-400 dark:text-surface-500 font-mono w-24 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={cn("text-xs font-semibold w-10 shrink-0 uppercase", LOG_LEVEL_STYLES[log.level])}>
                    {log.level}
                  </span>
                  <span className="text-xs font-medium text-surface-600 dark:text-surface-400 w-8 shrink-0">
                    {log.agent}
                  </span>
                  <span className="text-sm text-surface-700 dark:text-surface-300">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
