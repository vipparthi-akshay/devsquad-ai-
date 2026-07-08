type SkeletonVariant = "text" | "circular" | "rectangular"

interface SkeletonProps {
  className?: string
  variant?: SkeletonVariant
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded",
  circular: "h-10 w-10 rounded-full",
  rectangular: "h-24 w-full rounded-lg",
}

function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  )
}

export { Skeleton }
export type { SkeletonProps, SkeletonVariant }
