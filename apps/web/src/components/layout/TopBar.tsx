"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface TopBarProps {
  onMenuClick: () => void
  breadcrumbs?: { label: string; href?: string }[]
}

export function TopBar({ onMenuClick, breadcrumbs = [] }: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowUserMenu(false)
    }
    if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
      setShowNotifications(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              {breadcrumbs.length === 0 ? (
                <li className="text-gray-900 dark:text-white font-medium">Overview</li>
              ) : (
                breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {index > 0 && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                    {crumb.href ? (
                      <a href={crumb.href} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
                    )}
                  </li>
                ))
              )}
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            aria-label="Command search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-400">
              <span>Ctrl</span><span>+</span><span>K</span>
            </kbd>
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" aria-hidden="true" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg animate-slideDown" role="menu">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-semibold">
                U
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg animate-slideDown" role="menu">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">User</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">user@devsquad.ai</p>
                </div>
                <div className="p-2">
                  {["Profile", "Settings", "Sign out"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      role="menuitem"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
