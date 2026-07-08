"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Agents", href: "#agents" },
  { label: "Workflow", href: "#workflow" },
  { label: "Security", href: "#security" },
  { label: "Docs", href: "/docs" },
]

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
          : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Landing navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/landing" className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
              <defs>
                <linearGradient id="landing-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#landing-logo)" />
              <path
                d="M8 16l6-6 4 4 6-6"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 20l6-6 4 4 6-6"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={`text-lg font-bold transition-colors duration-300 ${
              scrolled ? "text-gray-900 dark:text-white" : "text-white dark:text-white"
            }`}>
              DevSquad <span className={`${scrolled ? "text-primary-600" : "text-primary-300"}`}>AI</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  scrolled
                    ? "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    : "text-gray-500 dark:text-gray-300 hover:text-white dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/25"
            >
              Start Building
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 animate-slideDown">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-3 border-gray-200 dark:border-gray-800" />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-center"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors text-center"
            >
              Start Building
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
