"use client"

import { useState, type ReactNode } from "react"

type TooltipPosition = "top" | "bottom" | "left" | "right"

interface TooltipProps {
  content: string
  children: ReactNode
  position?: TooltipPosition
}

const positionStyles: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
}

const arrowStyles: Record<TooltipPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-700",
  left: "left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900 dark:border-l-gray-700",
  right:
    "right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-gray-700",
}

function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionStyles[position]}`}
          role="tooltip"
          aria-label={content}
        >
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md px-2.5 py-1.5 shadow-lg whitespace-nowrap">
            {content}
          </div>
          <div className={`absolute ${arrowStyles[position]}`} />
        </div>
      )}
    </div>
  )
}

export { Tooltip }
export type { TooltipProps, TooltipPosition }
