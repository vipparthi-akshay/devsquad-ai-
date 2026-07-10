"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { api, type ArchitectureResponse } from "@/lib/api"
import { formatDate, getSeverityColor } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"

export default function ArchitecturePage() {
  const params = useParams()
  const projectId = params.id as string

  const [architecture, setArchitecture] = useState<ArchitectureResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [challenging, setChallenging] = useState(false)

  const fetchArchitecture = useCallback(async () => {
    try {
      const list = await api.architecture.list(projectId)
      const data = list[list.length - 1] || null
      setArchitecture(data)
    } catch {
      setArchitecture(null)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchArchitecture()
  }, [fetchArchitecture])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const data = await api.architecture.create({ project_id: projectId })
      setArchitecture(data)
    } catch {
    } finally {
      setGenerating(false)
    }
  }

  const handleChallenge = async () => {
    setChallenging(true)
    try {
      const data = await api.architecture.create({ project_id: projectId })
      setArchitecture(data)
    } catch {
    } finally {
      setChallenging(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!architecture) {
    return (
<div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Architecture Studio</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Generate a comprehensive architecture for your project
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 15.75V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              }
              title="No architecture yet"
              description="Generate an architecture from your requirements using AI"
              action={
                <Button onClick={handleGenerate} loading={generating} size="lg">
                  Generate Architecture
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Architecture Studio</h1>
            <Badge variant={
              architecture.status === "approved" ? "success"
              : architecture.status === "reviewed" ? "purple"
              : "warning"
            }>
              {architecture.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Created {formatDate(architecture.created_at)}
          </p>
        </div>
        <Button
          onClick={handleChallenge}
          loading={challenging}
          variant="secondary"
        >
          Challenge Architecture
        </Button>
      </div>

      {architecture.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              {architecture.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {architecture.mermaid_diagram && (
        <Card>
          <CardHeader>
            <CardTitle>Architecture Diagram</CardTitle>
            <Badge variant="info">Mermaid</Badge>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-surface-50 p-4 text-sm font-mono text-surface-700 dark:bg-surface-950 dark:text-surface-300">
              <code>{architecture.mermaid_diagram}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {architecture.component_model && architecture.component_model.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Component Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {architecture.component_model.map((component, idx) => (
                <div key={idx} className="rounded-lg border border-surface-100 p-4 dark:border-surface-800">
                  <p className="font-medium text-surface-900 dark:text-surface-100">{component.name}</p>
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{component.description}</p>
                  {component.responsibilities.length > 0 && (
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {component.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx} className="text-sm text-surface-600 dark:text-surface-400">{resp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {architecture.deployment_model && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment Model</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed whitespace-pre-wrap">
              {architecture.deployment_model}
            </p>
          </CardContent>
        </Card>
      )}

      {architecture.api_boundaries && architecture.api_boundaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Boundaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {architecture.api_boundaries.map((api_item, idx) => (
                <div key={idx} className="rounded-lg border border-surface-100 p-3 dark:border-surface-800">
                  <p className="font-medium text-surface-900 dark:text-surface-100">{api_item.name}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{api_item.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {api_item.methods.map((method, mIdx) => (
                      <span
                        key={mIdx}
                        className="inline-flex items-center rounded bg-surface-100 px-2 py-0.5 text-xs font-mono text-surface-600 dark:bg-surface-800 dark:text-surface-400"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {architecture.data_flow && (
        <Card>
          <CardHeader>
            <CardTitle>Data Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed whitespace-pre-wrap">
              {architecture.data_flow}
            </p>
          </CardContent>
        </Card>
      )}

      {architecture.risks && architecture.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {architecture.risks.map((risk, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-surface-100 p-3 dark:border-surface-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-surface-700 dark:text-surface-300">{risk.description}</p>
                    <Badge variant={getSeverityColor(risk.severity)} size="sm">{risk.severity}</Badge>
                  </div>
                  {risk.mitigation && (
                    <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                      {risk.mitigation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {architecture.alternatives_considered && architecture.alternatives_considered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternatives Considered</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2">
              {architecture.alternatives_considered.map((alt, idx) => (
                <li key={idx} className="text-sm text-surface-600 dark:text-surface-400">{alt}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {architecture.adrs && architecture.adrs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Architecture Decision Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {architecture.adrs.map((adr, idx) => (
                <div key={idx} className="rounded-lg border border-surface-100 p-4 dark:border-surface-800">
                  <p className="font-medium text-surface-900 dark:text-surface-100">{adr.title}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Decision</p>
                    <p className="text-sm text-surface-700 dark:text-surface-300">{adr.decision}</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Rationale</p>
                    <p className="text-sm text-surface-600 dark:text-surface-400">{adr.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
