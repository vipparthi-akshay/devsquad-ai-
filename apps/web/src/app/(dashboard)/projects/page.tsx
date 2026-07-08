"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { workspaces, projects as projectsApi, type ProjectResponse } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { cn, formatDate, getStatusColor } from "@/lib/utils"

export default function ProjectsPage() {
  const [projectList, setProjectList] = useState<ProjectResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    workspaces.list()
      .then((wsList) => {
        const wsId = wsList[0]?.id
        if (!wsId) throw new Error("No workspace found")
        return projectsApi.listByWorkspace(wsId)
      })
      .then(setProjectList)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" variant="rectangular" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Failed to load projects"
          description={error}
          action={
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-6 animate-slideUp">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Projects
        </h1>
        <Link href="/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>

      {projectList.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          title="No projects yet"
          description="Create your first project to get started with DevSquad AI."
          action={
            <Link href="/projects/new">
              <Button>New Project</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project, i) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full hover:border-primary-500 transition-colors cursor-pointer">
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-surface-900 dark:text-surface-50 truncate">
                      {project.name}
                    </h3>
                    <Badge className={cn(getStatusColor(project.status))}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <p className="text-xs text-surface-400 dark:text-surface-500 mt-auto">
                    Created {formatDate(project.created_at)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
