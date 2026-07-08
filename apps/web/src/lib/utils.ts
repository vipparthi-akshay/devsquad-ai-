export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ")
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      if (minutes === 0) return "just now"
      return `${minutes}m ago`
    }
    return `${hours}h ago`
  }
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return "N/A"
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMin = minutes % 60
  if (remainingMin === 0) return `${hours}h`
  return `${hours}h ${remainingMin}m`
}

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple"

const statusColorMap: Record<string, BadgeVariant> = {
  active: "success",
  running: "success",
  completed: "success",
  done: "success",
  passed: "success",
  in_progress: "warning",
  pending: "warning",
  paused: "warning",
  failed: "danger",
  blocked: "danger",
  cancelled: "default",
  backlog: "default",
  ready: "info",
  in_review: "purple",
  approved: "success",
  rejected: "danger",
}

export function getStatusColor(status: string): BadgeVariant {
  return statusColorMap[status?.toLowerCase()] ?? "default"
}

const severityColorMap: Record<string, BadgeVariant> = {
  low: "info",
  medium: "warning",
  high: "danger",
  critical: "danger",
}

export function getSeverityColor(severity: string): BadgeVariant {
  return severityColorMap[severity?.toLowerCase()] ?? "default"
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}
