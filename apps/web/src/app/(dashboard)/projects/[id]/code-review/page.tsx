"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { Dialog } from "@/components/ui/Dialog"
import { cn, getSeverityColor, getStatusColor } from "@/lib/utils"

interface Finding {
  id: string
  title: string
  description: string | null
  severity: string
  category: string | null
  file_path: string | null
  line_start: number | null
  line_end: number | null
  evidence: string | null
  recommendation: string | null
  confidence: string | null
  status: string
}

interface Review {
  id: string
  title: string
  summary: string | null
  review_type: string
  created_at: string
  findings: Finding[]
}

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
}

const categoryBadgeStyles: Record<string, string> = {
  security: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  correctness: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  performance: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  style: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  documentation: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
}

export default function CodeReviewPage() {
  const params = useParams<{ id: string }>()
  const [review, setReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"severity" | "file">("severity")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null)

  const fetchReview = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/projects/${params.id}/reviews`)
      if (!res.ok) throw new Error("Failed to load review")
      const data = await res.json()
      setReview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchReview()
  }, [fetchReview])

  const generateReview = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${params.id}/reviews/generate`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to generate review")
      const data = await res.json()
      setReview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate")
    }
  }

  if (isLoading) {
    return (
    <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-10 w-full rounded-lg" variant="rectangular" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" variant="rectangular" />
          ))}
        </div>
      </div>
    )
  }

  if (error && !review) {
    return (
      <div className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Error loading review"
          description={error}
          action={<Button onClick={fetchReview}>Retry</Button>}
        />
      </div>
    )
  }

  if (!review) {
    return (
      <div className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
          title="No code review"
          description="Generate a code review to analyze your project code."
          action={<Button onClick={generateReview}>Generate Code Review</Button>}
        />
      </div>
    )
  }

  const categories = Array.from(new Set(review.findings.map((f) => f.category).filter(Boolean) as string[]))
  const statuses = Array.from(new Set(review.findings.map((f) => f.status)))

  let findings = [...review.findings]

  if (filterCategory) {
    findings = findings.filter((f) => f.category === filterCategory)
  }
  if (filterStatus) {
    findings = findings.filter((f) => f.status === filterStatus)
  }

  if (sortBy === "severity") {
    findings.sort((a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99))
  } else {
    findings.sort((a, b) => (a.file_path || "").localeCompare(b.file_path || ""))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            {review.title}
          </h1>
          <div className="flex items-center gap-3">
            {review.summary && (
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {review.summary}
              </p>
            )}
            <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              {review.review_type.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={generateReview}>
          Regenerate Review
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-surface-600 dark:text-surface-400">Sort:</label>
          <select
            className="text-sm border border-surface-200 dark:border-surface-700 rounded-md px-2 py-1 bg-surface-light dark:bg-surface-800 text-surface-900 dark:text-surface-100"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "severity" | "file")}
            aria-label="Sort findings"
          >
            <option value="severity">Severity</option>
            <option value="file">File Path</option>
          </select>
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-surface-600 dark:text-surface-400">Category:</label>
            <select
              className="text-sm border border-surface-200 dark:border-surface-700 rounded-md px-2 py-1 bg-surface-light dark:bg-surface-800 text-surface-900 dark:text-surface-100"
              value={filterCategory || ""}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              aria-label="Filter by category"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {statuses.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-surface-600 dark:text-surface-400">Status:</label>
            <select
              className="text-sm border border-surface-200 dark:border-surface-700 rounded-md px-2 py-1 bg-surface-light dark:bg-surface-800 text-surface-900 dark:text-surface-100"
              value={filterStatus || ""}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              aria-label="Filter by status"
            >
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        <span className="text-sm text-surface-500 dark:text-surface-400 ml-auto">
          {findings.length} finding{findings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {findings.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="No findings match filters"
          description="Try adjusting your filter criteria."
        />
      ) : (
        <div className="space-y-3">
          {findings.map((finding) => (
            <button
              key={finding.id}
              className="w-full text-left"
              onClick={() => setSelectedFinding(finding)}
              aria-label={`View finding: ${finding.title}`}
            >
              <Card className="hover:border-primary-500 transition-colors cursor-pointer">
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(getSeverityColor(finding.severity))}>
                        {finding.severity.toUpperCase()}
                      </Badge>
                      {finding.category && (
                        <Badge className={categoryBadgeStyles[finding.category.toLowerCase()] || ""}>
                          {finding.category}
                        </Badge>
                      )}
                    </div>
                    <Badge className={getStatusColor(finding.status.toLowerCase())}>
                      {finding.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <h3 className="font-medium text-surface-900 dark:text-surface-50">
                    {finding.title}
                  </h3>

                  {finding.description && (
                    <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-2">
                      {finding.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500 dark:text-surface-400">
                    {finding.file_path && (
                      <span className="font-mono">{finding.file_path}{finding.line_start ? `:${finding.line_start}` : ""}{finding.line_end && finding.line_end !== finding.line_start ? `-${finding.line_end}` : ""}</span>
                    )}
                    {finding.confidence && (
                      <span>Confidence: {finding.confidence}</span>
                    )}
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {selectedFinding && (
        <Dialog
          isOpen={!!selectedFinding}
          onClose={() => setSelectedFinding(null)}
          title={selectedFinding.title}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getSeverityColor(selectedFinding.severity)}>
                {selectedFinding.severity.toUpperCase()}
              </Badge>
              {selectedFinding.category && (
                <Badge className={categoryBadgeStyles[selectedFinding.category.toLowerCase()] || ""}>
                  {selectedFinding.category}
                </Badge>
              )}
            </div>

            {selectedFinding.description && (
              <p className="text-sm text-surface-600 dark:text-surface-400">
                {selectedFinding.description}
              </p>
            )}

            {selectedFinding.evidence && (
              <div>
                <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Evidence</h4>
                <pre className="text-xs bg-surface-100 dark:bg-surface-800 p-3 rounded-md overflow-x-auto text-surface-800 dark:text-surface-200">
                  {selectedFinding.evidence}
                </pre>
              </div>
            )}

            {selectedFinding.recommendation && (
              <div>
                <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Recommendation</h4>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  {selectedFinding.recommendation}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-500 dark:text-surface-400 pt-2 border-t border-surface-200 dark:border-surface-700">
              {selectedFinding.file_path && (
                <span className="font-mono">
                  {selectedFinding.file_path}:{selectedFinding.line_start || "?"}-{selectedFinding.line_end || "?"}
                </span>
              )}
              {selectedFinding.confidence && (
                <span>Confidence: {selectedFinding.confidence}</span>
              )}
              <span>Status: {selectedFinding.status.replace("_", " ")}</span>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
