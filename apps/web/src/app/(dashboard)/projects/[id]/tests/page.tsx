"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { cn, getStatusColor } from "@/lib/utils"

interface TestCase {
  id: string
  name: string
  type: string
  status: string
  scenario: string
  expected_result: string
}

interface TestPlan {
  id: string
  name: string
  types: string[]
  test_cases: TestCase[]
}

const testTypeStyles: Record<string, string> = {
  unit: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  integration: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  e2e: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
}

export default function TestsPage() {
  const params = useParams<{ id: string }>()
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const fetchTestPlan = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/projects/${params.id}/test-plans`)
      if (!res.ok) throw new Error("Failed to load test plan")
      const data = await res.json()
      setTestPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchTestPlan()
  }, [fetchTestPlan])

  const generateTestPlan = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${params.id}/test-plans/generate`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to generate test plan")
      const data = await res.json()
      setTestPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate")
    }
  }

  if (isLoading) {
    return (
    <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" variant="rectangular" />
          <Skeleton className="h-8 w-24 rounded-full" variant="rectangular" />
          <Skeleton className="h-8 w-16 rounded-full" variant="rectangular" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" variant="rectangular" />
          ))}
        </div>
      </div>
    )
  }

  if (error && !testPlan) {
    return (
      <div className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Error loading test plan"
          description={error}
          action={<Button onClick={fetchTestPlan}>Retry</Button>}
        />
      </div>
    )
  }

  if (!testPlan) {
    return (
      <div className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="No test plan"
          description="Generate a test plan to get started."
          action={<Button onClick={generateTestPlan}>Generate Test Plan</Button>}
        />
      </div>
    )
  }

  const tabs = [
    { id: "all", label: `All (${testPlan.test_cases.length})` },
    { id: "unit", label: `Unit (${testPlan.test_cases.filter((t) => t.type === "unit").length})` },
    { id: "integration", label: `Integration (${testPlan.test_cases.filter((t) => t.type === "integration").length})` },
    { id: "e2e", label: `E2E (${testPlan.test_cases.filter((t) => t.type === "e2e").length})` },
  ]

  const filteredCases = activeTab === "all"
    ? testPlan.test_cases
    : testPlan.test_cases.filter((t) => t.type === activeTab)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            {testPlan.name}
          </h1>
          <div className="flex gap-2">
            {testPlan.types.map((type) => (
              <Badge key={type} className={testTypeStyles[type] || ""}>
                {type.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
        <Button variant="outline" onClick={generateTestPlan}>
          Generate Test Plan
        </Button>
      </div>

      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300"
            }`}
            aria-label={`Filter by ${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredCases.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title={`No ${activeTab === "all" ? "" : activeTab} test cases`}
          description="Generate a test plan to create test cases."
        />
      ) : (
        <div className="space-y-3">
          {filteredCases.map((testCase) => (
            <Card key={testCase.id}>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-surface-900 dark:text-surface-50">
                      {testCase.name}
                    </h3>
                    <Badge className={testTypeStyles[testCase.type] || ""}>
                      {testCase.type.toUpperCase()}
                    </Badge>
                  </div>
                  <Badge className={cn("shrink-0", getStatusColor(testCase.status.toLowerCase()))}>
                    {testCase.status}
                  </Badge>
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  {testCase.scenario}
                </p>
                <div className="text-sm">
                  <span className="font-medium text-surface-700 dark:text-surface-300">
                    Expected:
                  </span>{" "}
                  <span className="text-surface-600 dark:text-surface-400">
                    {testCase.expected_result}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
