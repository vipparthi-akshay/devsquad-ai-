import type { ReactNode } from "react"

type CardVariant = "default" | "bordered" | "elevated"

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
  bordered: "bg-white dark:bg-gray-900 border-2 border-primary-200 dark:border-primary-800",
  elevated: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg",
}

function Card({ children, className = "", title, description, variant = "default" }: CardProps) {
  return (
    <div className={`rounded-lg ${variantStyles[variant]} ${className}`}>
      {title && (
        <div className="px-6 pt-6 pb-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      )}
      <div className={title ? "p-6" : "p-6"}>{children}</div>
    </div>
  )
}

function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>{children}</h3>
}

function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 pt-6 pb-4 ${className}`}>{children}</div>
}

export { Card, CardTitle, CardContent, CardHeader }
export type { CardProps, CardVariant }
