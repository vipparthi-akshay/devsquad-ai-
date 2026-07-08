"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            element: HTMLElement,
            options: { theme?: string; size?: string; shape?: string; width?: number }
          ) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export function GoogleSignIn() {
  const router = useRouter()
  const { loginWithGoogle } = useAuth()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => setLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (!loaded || !buttonRef.current || !GOOGLE_CLIENT_ID) return

    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        setLoggingIn(true)
        setError(null)
        try {
          await loginWithGoogle(response.credential)
          router.push("/dashboard")
        } catch (err) {
          setError(err instanceof Error ? err.message : "Google sign-in failed")
        } finally {
          setLoggingIn(false)
        }
      },
    })

    window.google?.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      width: 400,
    })
  }, [loaded, router, loginWithGoogle])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-300 dark:border-surface-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-surface-900 px-2 text-surface-500 dark:text-surface-400">
            or continue with
          </span>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {loggingIn ? (
        <div className="flex justify-center">
          <div className="h-10 w-64 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
        </div>
      ) : (
        <div ref={buttonRef} className="flex justify-center" />
      )}
    </div>
  )
}
