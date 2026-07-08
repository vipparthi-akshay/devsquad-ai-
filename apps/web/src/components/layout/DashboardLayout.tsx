"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopBar onMenuClick={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
