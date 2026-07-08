"use client"

import type { ReactNode } from "react"

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 ${className}`} role="tablist">
      <nav className="flex space-x-1" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-t-md ${
                isActive
                  ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export { Tabs }
export type { TabsProps, Tab }
