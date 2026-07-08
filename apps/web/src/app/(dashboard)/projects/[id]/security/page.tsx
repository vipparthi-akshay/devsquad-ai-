"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { cn, getSeverityColor } from "@/lib/utils"

interface SecurityFinding {
  id: string
  title: string
  severity: string
  category: string
  description: string | null
  status: string
}

interface ThreatModel {
  assets: string[]
  actors: string[]
  trust_boundaries: string[]
  threats: { threat: string; mitigation: string }[]
}

interface SecurityData {
  total_findings: number
  severity_counts: Record<string, number>
  risk_score: number
  findings: SecurityFinding[]
  secrets: SecurityFinding[]
  dependencies: SecurityFinding[]
  auth_risks: SecurityFinding[]
  config_risks: SecurityFinding[]
  prompt_injection: SecurityFinding[]
  threat_model: ThreatModel
}

export default function SecurityPage() {
  const params = useParams<{ id: string }>()
  const [data, setData] = useState<SecurityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/projects/${params.id}/security`)
      if (!res.ok) throw new Error("Failed to load security data")
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
    <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" variant="rectangular" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" variant="rectangular" />
        <Skeleton className="h-64 rounded-xl" variant="rectangular" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Error loading security data"
          description={error}
          action={<Button onClick={fetchData}>Retry</Button>}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          title="No security data available"
          description="Run a security review to see findings."
        />
      </div>
    )
  }

  const sections: { title: string; items: SecurityFinding[]; empty: string }[] = [
    { title: "Security Findings", items: data.findings, empty: "No security findings" },
    { title: "Secrets", items: data.secrets, empty: "No secrets found" },
    { title: "Dependency Vulnerabilities", items: data.dependencies, empty: "No dependency vulnerabilities" },
    { title: "Auth / Authorization Risks", items: data.auth_risks, empty: "No auth risks" },
    { title: "Configuration Risks", items: data.config_risks, empty: "No configuration risks" },
    { title: "AI Prompt Injection Risks", items: data.prompt_injection, empty: "No prompt injection risks" },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
        Security Center
      </h1>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-4 text-center">
            <p className="text-3xl font-bold text-surface-900 dark:text-surface-50">
              {data.total_findings}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400">Total Findings</p>
          </div>
        </Card>
        {Object.entries(data.severity_counts).map(([severity, count]) => (
          <Card key={severity}>
            <div className="p-4 text-center">
              <p className={cn("text-3xl font-bold", getSeverityColor(severity))}>
                {count}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400 capitalize">
                {severity}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
              Risk Score
            </h2>
            <span className={cn("text-lg font-bold", data.risk_score >= 70 ? "text-danger-600" : data.risk_score >= 40 ? "text-warning-600" : "text-success-600")}>
              {data.risk_score}/100
            </span>
          </div>
          <ProgressBar
            value={data.risk_score}
            variant={data.risk_score >= 70 ? "danger" : data.risk_score >= 40 ? "warning" : "default"}
          />
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {data.risk_score >= 70 ? "High risk - immediate attention required" : data.risk_score >= 40 ? "Moderate risk - review recommended" : "Low risk - acceptable posture"}
          </p>
        </div>
      </Card>

      {sections.map((section) => (
        <Card key={section.title}>
          <div className="p-5">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">
              {section.title}
            </h2>
            {section.items.length === 0 ? (
              <p className="text-sm text-surface-500 dark:text-surface-400">{section.empty}</p>
            ) : (
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-900">
                    <Badge className={cn("shrink-0 mt-0.5", getSeverityColor(item.severity))}>
                      {item.severity.toUpperCase()}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}

      {data.threat_model && (
        <Card>
          <div className="p-5 space-y-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
              Threat Model
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Assets</h3>
                <ul className="space-y-1">
                  {data.threat_model.assets.map((asset, i) => (
                    <li key={i} className="text-sm text-surface-600 dark:text-surface-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                      {asset}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Actors</h3>
                <ul className="space-y-1">
                  {data.threat_model.actors.map((actor, i) => (
                    <li key={i} className="text-sm text-surface-600 dark:text-surface-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                      {actor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Trust Boundaries</h3>
              <div className="flex flex-wrap gap-2">
                {data.threat_model.trust_boundaries.map((boundary, i) => (
                  <Badge key={i} className="bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300">
                    {boundary}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Threats & Mitigations</h3>
              <div className="space-y-3">
                {data.threat_model.threats.map((t, i) => (
                  <div key={i} className="p-3 rounded-lg bg-surface-50 dark:bg-surface-900 space-y-1">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                      {t.threat}
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      Mitigation: {t.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
