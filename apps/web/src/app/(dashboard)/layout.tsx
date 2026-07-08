"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-300 border-t-primary-600 dark:border-surface-700 dark:border-t-primary-400" />
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
