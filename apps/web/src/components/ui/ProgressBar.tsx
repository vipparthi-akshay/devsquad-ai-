type ProgressVariant = "default" | "success" | "warning" | "danger"
type ProgressSize = "sm" | "md"

interface ProgressBarProps {
  value: number
  max?: number
  variant?: ProgressVariant
  size?: ProgressSize
  showLabel?: boolean
  className?: string
}

const variantStyles: Record<ProgressVariant, string> = {
  default: "bg-primary-600 dark:bg-primary-500",
  success: "bg-green-600 dark:bg-green-500",
  warning: "bg-yellow-500 dark:bg-yellow-400",
  danger: "bg-red-600 dark:bg-red-500",
}

const sizeStyles: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
}

function ProgressBar({ value, max = 100, variant = "default", size = "md", showLabel = false, className = "" }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(percentage)}% complete`}
      >
        <div
          className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export { ProgressBar }
export type { ProgressBarProps, ProgressVariant, ProgressSize }
