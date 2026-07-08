"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-slideUp">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
        Settings
      </h1>

      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
            Profile
          </h2>
          <div className="space-y-4">
            <Input label="Name" value={user?.full_name || ""} readOnly />
            <Input label="Email" value={user?.email || ""} readOnly />
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Dark Mode
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Toggle dark mode for the workspace
              </p>
            </div>
            <Button
              variant={darkMode ? "primary" : "outline"}
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "Dark" : "Light"}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
            API Keys
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            API keys are configured via environment variables. Contact your workspace
            administrator to update API credentials.
          </p>
        </div>
      </Card>

      <Card className="border-danger-200 dark:border-danger-800">
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-danger-600 dark:text-danger-400">
            Danger Zone
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Irreversible actions. Proceed with caution.
          </p>
          <Button variant="danger" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
}
