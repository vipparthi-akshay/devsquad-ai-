"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"

interface DropdownItem {
  label: string
  onClick: () => void
  icon?: ReactNode
  danger?: boolean
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
}

function Dropdown({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick()
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  item.danger
                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                role="menuitem"
              >
                {item.icon && <span className="h-4 w-4 flex-shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { Dropdown }
export type { DropdownProps, DropdownItem }
