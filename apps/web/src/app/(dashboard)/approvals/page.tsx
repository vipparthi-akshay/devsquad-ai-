"use client"

import { useState, useEffect, useMemo } from "react"
import { approvals, type ApprovalResponse } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { EmptyState } from "@/components/ui/EmptyState"
import { Dialog } from "@/components/ui/Dialog"
import { getSeverityColor, cn, formatDate } from "@/lib/utils"

type ApprovalFilter = "all" | "pending" | "approved" | "rejected"

interface ApprovalWithDetail extends ApprovalResponse {
  expanded?: boolean
}

const tabs: { key: ApprovalFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
]

function RiskBadge({ level }: { level: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      getSeverityColor(level),
    )}>
      {level.toUpperCase()}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
    approved: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
    rejected: "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400",
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-surface-100 text-surface-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function ApprovalsPage() {
  const [approvalList, setApprovalList] = useState<ApprovalWithDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ApprovalFilter>("all")
  const [selectedApproval, setSelectedApproval] = useState<ApprovalWithDetail | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ action: "approved" | "rejected"; approval: ApprovalWithDetail } | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isActing, setIsActing] = useState(false)

  async function loadApprovals() {
    setIsLoading(true)
    setError(null)
    try {
      const mockApprovals: ApprovalWithDetail[] = [
        {
          id: "1", project_id: "p1", workflow_id: "w1", agent_run_id: null,
          title: "Implement user authentication module",
          description: "Proposed implementation of JWT-based authentication with refresh token rotation and session management.",
          status: "pending", requesting_agent: "Backend Engineer",
          proposed_action: "Create auth service with JWT token generation, validation, and refresh logic",
          reason: null, affected_files: ["src/services/auth.ts", "src/middleware.ts", "src/lib/jwt.ts"],
          command_preview: "npm run generate:auth -- --provider=jwt --refresh=true",
          risk_level: "high", expected_impact: "All API routes will require authentication",
          approved_by: null, reviewed_at: null, rejection_reason: null, created_at: new Date(Date.now() - 3600000).toISOString(),
          expanded: false,
        },
        {
          id: "2", project_id: "p1", workflow_id: "w1", agent_run_id: null,
          title: "Add database migration for user profiles",
          description: "Schema migration to add user_profiles table with indexing on email and username.",
          status: "pending", requesting_agent: "Data Engineer",
          proposed_action: "Create migration file for user_profiles table",
          reason: null, affected_files: ["prisma/migrations/add_user_profiles.sql"],
          command_preview: "npx prisma migrate dev --name add_user_profiles",
          risk_level: "medium", expected_impact: "New table created, no existing data affected",
          approved_by: null, reviewed_at: null, rejection_reason: null, created_at: new Date(Date.now() - 7200000).toISOString(),
          expanded: false,
        },
        {
          id: "3", project_id: "p1", workflow_id: "w1", agent_run_id: null,
          title: "Update API rate limiting config",
          description: "Adjust rate limiting thresholds for production deployment.",
          status: "approved", requesting_agent: "Security Engineer",
          proposed_action: "Update rate limiter configuration",
          reason: null, affected_files: ["src/config/rate-limit.ts"],
          command_preview: "npm run config:set -- --rate-limit=100 --window=60",
          risk_level: "low", expected_impact: "API rate limits adjusted",
          approved_by: "user-1", reviewed_at: new Date(Date.now() - 43200000).toISOString(), rejection_reason: null,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          expanded: false,
        },
        {
          id: "4", project_id: "p1", workflow_id: "w1", agent_run_id: null,
          title: "Delete legacy API endpoints",
          description: "Remove deprecated v1 API endpoints that have been deprecated for 6 months.",
          status: "rejected", requesting_agent: "Backend Engineer",
          proposed_action: "Delete legacy v1 routes and controllers",
          reason: null, affected_files: ["src/api/v1/*.ts"],
          command_preview: "rm -rf src/api/v1/",
          risk_level: "critical", expected_impact: "All v1 API consumers will be affected",
          approved_by: "user-1", reviewed_at: new Date(Date.now() - 86400000).toISOString(),
          rejection_reason: "Need to ensure all consumers have migrated. Schedule for next release.",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          expanded: false,
        },
      ]
      setApprovalList(mockApprovals)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load approvals")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApprovals()
  }, [])

  const filteredApprovals = useMemo(() => {
    if (activeTab === "all") return approvalList
    return approvalList.filter((a) => a.status === activeTab)
  }, [approvalList, activeTab])

  async function handleAction(approval: ApprovalWithDetail, action: "approved" | "rejected") {
    setIsActing(true)
    try {
      await approvals.act(approval.id, action, action === "rejected" ? rejectionReason : undefined)
      setApprovalList((prev) =>
        prev.map((a) =>
          a.id === approval.id
            ? { ...a, status: action, rejection_reason: action === "rejected" ? rejectionReason : null }
            : a,
        ),
      )
      setConfirmDialog(null)
      setRejectionReason("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process approval")
    } finally {
      setIsActing(false)
    }
  }

  function toggleExpand(id: string) {
    setApprovalList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, expanded: !a.expanded } : a)),
    )
    const approval = approvalList.find((a) => a.id === id)
    if (approval) setSelectedApproval(approval.expanded ? null : approval)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-slideUp">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Approvals</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Review and manage agent-proposed changes
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg text-sm text-danger-700 dark:text-danger-400" role="alert">
          {error}
        </div>
      )}

      <div className="flex gap-1 mb-6 p-1 bg-surface-100 dark:bg-surface-800 rounded-lg w-fit" role="tablist" aria-label="Approval filters">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === tab.key
                ? "bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm"
                : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300",
            )}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 text-xs">({approvalList.filter((a) => a.status === tab.key).length})</span>
            )}
          </button>
        ))}
      </div>

      {filteredApprovals.length === 0 ? (
        <EmptyState
          title={activeTab === "all" ? "No approvals" : `No ${activeTab} approvals`}
          description={activeTab === "all" ? "Approvals requested by agents will appear here." : `No ${activeTab} approvals found`}
        />
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <Card key={approval.id}>
              <button
                className="w-full text-left"
                onClick={() => toggleExpand(approval.id)}
                aria-expanded={approval.expanded}
                aria-label={`${approval.title} approval details`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-surface-900 dark:text-surface-100">{approval.title}</h3>
                        <StatusBadge status={approval.status} />
                        <RiskBadge level={approval.risk_level} />
                      </div>
                      {approval.description && (
                        <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{approval.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="purple">{approval.requesting_agent}</Badge>
                        <span className="text-xs text-surface-400 dark:text-surface-500">{formatDate(approval.created_at)}</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-surface-400 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </CardHeader>
              </button>

              {approval.expanded && (
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                        Proposed Action
                      </h4>
                      <p className="text-sm text-surface-700 dark:text-surface-300">{approval.proposed_action}</p>
                    </div>

                    {approval.expected_impact && (
                      <div>
                        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                          Expected Impact
                        </h4>
                        <p className="text-sm text-surface-700 dark:text-surface-300">{approval.expected_impact}</p>
                      </div>
                    )}

                    {approval.affected_files && approval.affected_files.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                          Affected Files ({approval.affected_files.length})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {approval.affected_files.map((file, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400"
                            >
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {approval.command_preview && (
                      <div>
                        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                          Command Preview
                        </h4>
                        <pre className="p-3 rounded-lg bg-surface-900 dark:bg-surface-950 text-surface-100 text-sm font-mono overflow-x-auto">
                          $ {approval.command_preview}
                        </pre>
                      </div>
                    )}

                    {approval.rejection_reason && (
                      <div>
                        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                          Rejection Reason
                        </h4>
                        <p className="text-sm text-danger-600 dark:text-danger-400">{approval.rejection_reason}</p>
                      </div>
                    )}

                    {approval.status === "pending" && (
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="primary"
                          className="!bg-success-600 hover:!bg-success-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDialog({ action: "approved", approval })
                          }}
                          aria-label="Approve this request"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDialog({ action: "rejected", approval })
                          }}
                          aria-label="Reject this request"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog
        isOpen={confirmDialog !== null}
        onClose={() => { setConfirmDialog(null); setRejectionReason("") }}
        title={confirmDialog?.action === "approved" ? "Confirm Approval" : "Confirm Rejection"}
        size="md"
      >
        {confirmDialog && (
          <div className="space-y-4">
            <p className="text-sm text-surface-600 dark:text-surface-400">
              {confirmDialog.action === "approved"
                ? `Are you sure you want to approve "${confirmDialog.approval.title}"?`
                : `Are you sure you want to reject "${confirmDialog.approval.title}"?`}
            </p>
            {confirmDialog.action === "rejected" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Reason for rejection</label>
                <textarea
                  className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setConfirmDialog(null); setRejectionReason("") }}>
                Cancel
              </Button>
              <Button
                variant={confirmDialog.action === "approved" ? "primary" : "danger"}
                loading={isActing}
                onClick={() => handleAction(confirmDialog.approval, confirmDialog.action)}
              >
                {confirmDialog.action === "approved" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
