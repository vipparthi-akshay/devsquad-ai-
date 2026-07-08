import { cn } from "@/lib/utils"
import { Spinner } from "./Spinner"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm",
        variant === "secondary" && "bg-surface-100 text-surface-900 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-700",
        variant === "outline" && "border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800",
        variant === "ghost" && "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800",
        variant === "danger" && "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 shadow-sm",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  )
}
