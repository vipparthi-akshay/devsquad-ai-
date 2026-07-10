"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { api, type RequirementResponse } from "@/lib/api"
import { formatDate, getStatusColor } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"

interface PersonaItem {
  name: string
  role: string
  description: string
}

interface JourneyItem {
  persona: string
  steps: string[]
}

interface RiskEntry {
  description: string
  severity: string
  mitigation?: string
}

interface RequirementSections {
  problem_statement: string | null
  personas: PersonaItem[] | null
  user_journeys: JourneyItem[] | null
  functional_requirements: string[] | null
  non_functional_requirements: string[] | null
  assumptions: string[] | null
  constraints: string[] | null
  risks: RiskEntry[] | null
  acceptance_criteria: string[] | null
  mvp_scope: string[] | null
  future_scope: string[] | null
}

export default function RequirementsPage() {
  const params = useParams()
  const projectId = params.id as string

  const [requirement, setRequirement] = useState<RequirementResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [approving, setApproving] = useState(false)

  const fetchRequirements = useCallback(async () => {
    try {
      const list = await api.requirements.list(projectId)
      const data = list[list.length - 1] || null
      setRequirement(data)
    } catch {
      setRequirement(null)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchRequirements()
  }, [fetchRequirements])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const data = await api.requirements.create({ project_id: projectId, input_text: "Build a multi-tenant inventory SaaS for small retailers." })
      setRequirement(data)
    } catch {
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerateSection = async (section: string) => {
    setRegeneratingSection(section)
    try {
      const data = await api.requirements.create({ project_id: projectId, input_text: `Regenerate section: ${section}` })
      setRequirement(data)
    } catch {
    } finally {
      setRegeneratingSection(null)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      const data = await api.requirements.list(projectId)
      setRequirement(data[data.length - 1] || null)
    } catch {
    } finally {
      setApproving(false)
    }
  }

  const handleEdit = (section: string, currentValue: string) => {
    setEditingSection(section)
    setEditValue(currentValue)
  }

  const handleSaveEdit = async () => {
    if (!editingSection || !requirement) return
    try {
      const fieldName = editingSection === "problem_statement" ? "problem_statement" : editingSection
      const data = await api.requirements.update(requirement.id, { [fieldName]: editValue })
      setRequirement(data)
    } catch {
    } finally {
      setEditingSection(null)
      setEditValue("")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!requirement) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Requirements Studio</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Generate comprehensive requirements for your project
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
              title="No requirements yet"
              description="Generate requirements from your project description using AI"
              action={
                <Button onClick={handleGenerate} loading={generating} size="lg">
                  Generate Requirements
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const sections = {
    problem_statement: requirement.problem_statement,
    personas: requirement.personas,
    user_journeys: requirement.user_journeys,
    functional_requirements: requirement.functional_requirements,
    non_functional_requirements: requirement.non_functional_requirements,
    assumptions: requirement.assumptions,
    constraints: requirement.constraints,
    risks: requirement.risks,
    acceptance_criteria: requirement.acceptance_criteria,
    mvp_scope: requirement.mvp_scope,
    future_scope: requirement.future_scope,
  } as RequirementSections

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-50 dark:text-surface-50">Requirements Studio</h1>
            <Badge variant={getStatusColor(requirement.status)}>{requirement.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Version {requirement.version} &middot; Updated {formatDate(requirement.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          {requirement.status !== "approved" && (
            <Button onClick={handleApprove} loading={approving} variant="primary">
              Approve Requirements
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <SectionCard
          title="Problem Statement"
          section="problem_statement"
          onRegenerate={handleRegenerateSection}
          regenerating={regeneratingSection === "problem_statement"}
          editing={editingSection === "problem_statement"}
          editValue={editValue}
          onEdit={(v) => setEditValue(v)}
          onStartEdit={() => handleEdit("problem_statement", sections.problem_statement || "")}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingSection(null)}
        >
          {sections.problem_statement || "No problem statement defined."}
        </SectionCard>

        {sections.personas && sections.personas.length > 0 && (
          <SectionCard
            title="Personas"
            section="personas"
            onRegenerate={handleRegenerateSection}
            regenerating={regeneratingSection === "personas"}
          >
            <div className="space-y-3">
              {sections.personas.map((persona, idx) => (
                <div key={idx} className="rounded-lg border border-surface-100 p-3 dark:border-surface-800">
                  <p className="font-medium text-surface-900 dark:text-surface-100">{persona.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{persona.role}</p>
                  <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">{persona.description}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {sections.user_journeys && sections.user_journeys.length > 0 && (
          <SectionCard
            title="User Journeys"
            section="user_journeys"
            onRegenerate={handleRegenerateSection}
            regenerating={regeneratingSection === "user_journeys"}
          >
            <div className="space-y-4">
              {sections.user_journeys.map((journey, idx) => (
                <div key={idx} className="rounded-lg border border-surface-100 p-3 dark:border-surface-800">
                  <p className="font-medium text-surface-900 dark:text-surface-100">{journey.persona}</p>
                  <ol className="mt-2 list-inside list-decimal space-y-1">
                    {journey.steps.map((step, sIdx) => (
                      <li key={sIdx} className="text-sm text-surface-600 dark:text-surface-400">{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <SectionCard
          title="Functional Requirements"
          section="functional_requirements"
          onRegenerate={handleRegenerateSection}
          regenerating={regeneratingSection === "functional_requirements"}
        >
          {sections.functional_requirements && sections.functional_requirements.length > 0 ? (
            <ol className="list-inside list-decimal space-y-2">
              {sections.functional_requirements.map((req, idx) => (
                <li key={idx} className="text-sm text-surface-700 dark:text-surface-300">{req}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-surface-500 dark:text-surface-400">No functional requirements defined.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Non-Functional Requirements"
          section="non_functional_requirements"
          onRegenerate={handleRegenerateSection}
          regenerating={regeneratingSection === "non_functional_requirements"}
        >
          {sections.non_functional_requirements && sections.non_functional_requirements.length > 0 ? (
            <ul className="list-inside list-disc space-y-2">
              {sections.non_functional_requirements.map((req, idx) => (
                <li key={idx} className="text-sm text-surface-700 dark:text-surface-300">{req}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-500 dark:text-surface-400">No non-functional requirements defined.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Assumptions"
          section="assumptions"
          onRegenerate={handleRegenerateSection}
          regenerating={regeneratingSection === "assumptions"}
        >
          {sections.assumptions && sections.assumptions.length > 0 ? (
            <ul className="list-inside list-disc space-y-2">
              {sections.assumptions.map((item, idx) => (
                <li key={idx} className="text-sm text-surface-700 dark:text-surface-300">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-500 dark:text-surface-400">No assumptions defined.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Constraints"
          section="constraints"
          onRegenerate={handleRegenerateSection}
          regenerating={regeneratingSection === "constraints"}
        >
          {sections.constraints && sections.constraints.length > 0 ? (
            <ul className="list-inside list-disc space-y-2">
              {sections.constraints.map((item, idx) => (
                <li key={idx} className="text-sm text-surface-700 dark:text-surface-300">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-500 dark:text-surface-400">No constraints defined.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Risks"
          section="risks"
          onRegenerate={handleRegenerateSection}
          regenerating={regeneratingSection === "risks"}
        >
          {sections.risks && sections.risks.length > 0 ? (
            <div className="space-y-3">
              {sections.risks.map((risk, idx) => (
                <div key={idx} className="rounded-lg border border-surface-100 p-3 dark:border-surface-800">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-surface-700 dark:text-surface-300">{risk.description}</p>
                    <Badge variant={
                      risk.severity === "critical" || risk.severity === "high" ? "danger"
                      : risk.severity === "medium" ? "warning"
                      : "info"
                    } size="sm">
                      {risk.severity}
                    </Badge>
                  </div>
                  {risk.mitigation && (
                    <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                      Mitigation: {risk.mitigation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-500 dark:text-surface-400">No risks defined.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Acceptance Criteria"
          section="acceptance_criteria"
          onRegenerate={handleRegenerateSection}
          regenerating={regeneratingSection === "acceptance_criteria"}
        >
          {sections.acceptance_criteria && sections.acceptance_criteria.length > 0 ? (
            <ul className="list-inside list-disc space-y-2">
              {sections.acceptance_criteria.map((item, idx) => (
                <li key={idx} className="text-sm text-surface-700 dark:text-surface-300">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-500 dark:text-surface-400">No acceptance criteria defined.</p>
          )}
        </SectionCard>

        <SectionCard
          title="MVP Scope"
          section="mvp_scope"
          onRegenerate={handleRegenerateSection}
          regenerating={regeneratingSection === "mvp_scope"}
        >
          {sections.mvp_scope && sections.mvp_scope.length > 0 ? (
            <ul className="list-inside list-disc space-y-2">
              {sections.mvp_scope.map((item, idx) => (
                <li key={idx} className="text-sm text-surface-700 dark:text-surface-300">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-500 dark:text-surface-400">No MVP scope defined.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Future Scope"
          section="future_scope"
          onRegenerate={handleRegenerateSection}
          regenerating={regeneratingSection === "future_scope"}
        >
          {sections.future_scope && sections.future_scope.length > 0 ? (
            <ul className="list-inside list-disc space-y-2">
              {sections.future_scope.map((item, idx) => (
                <li key={idx} className="text-sm text-surface-700 dark:text-surface-300">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-500 dark:text-surface-400">No future scope defined.</p>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  section,
  children,
  onRegenerate,
  regenerating,
  editing,
  editValue,
  onEdit,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: {
  title: string
  section: string
  children: React.ReactNode
  onRegenerate: (section: string) => void
  regenerating?: boolean
  editing?: boolean
  editValue?: string
  onEdit?: (v: string) => void
  onStartEdit?: () => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {onStartEdit && (
            <Button size="sm" variant="ghost" onClick={onStartEdit}>
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onRegenerate(section)}
            loading={regenerating}
          >
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            <textarea
              className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:focus:border-primary-400"
              rows={4}
              value={editValue}
              onChange={(e) => onEdit?.(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSaveEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={onCancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-surface-600 dark:text-surface-400">{children}</div>
        )}
      </CardContent>
    </Card>
  )
}
