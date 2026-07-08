import type { ReactNode } from "react"

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple"
type BadgeSize = "sm" | "md"

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  primary: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
}

function Badge({ children, variant = "default", size = "sm", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  )
}

export { Badge }
export type { BadgeProps, BadgeVariant, BadgeSize }
