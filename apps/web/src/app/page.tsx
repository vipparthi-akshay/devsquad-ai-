"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      router.push(user ? "/dashboard" : "/landing")
    }
  }, [user, isLoading, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-light dark:bg-surface-dark">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
