"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { api, type WorkspaceResponse } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"

const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  workspace_id: z.string().optional(),
})

type ProjectForm = z.infer<typeof projectSchema>

export default function NewProjectPage() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([])
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
  })

  useEffect(() => {
    api.workspaces
      .list()
      .then(setWorkspaces)
      .catch(() => {})
      .finally(() => setLoadingWorkspaces(false))
  }, [])

  const onSubmit = async (data: ProjectForm) => {
    setError(null)
    try {
      const project = await api.projects.create({
        name: data.name,
        description: data.description || undefined,
        workspace_id: data.workspace_id!,
      })
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    }
  }

  return (
      <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Create Project</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Set up a new engineering project
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-label="Create project form">
            {error && (
              <div
                className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-400"
                role="alert"
              >
                {error}
              </div>
            )}

            <Input
              label="Project Name"
              placeholder="My Project"
              error={errors.name?.message}
              {...register("name")}
            />

            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 placeholder-surface-400 transition-colors duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder-surface-500 dark:focus:border-primary-400"
                placeholder="Describe what this project is about..."
                aria-invalid={errors.description ? "true" : undefined}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-danger-600 dark:text-danger-400" role="alert">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="workspace_id"
                className="block text-sm font-medium text-surface-700 dark:text-surface-300"
              >
                Workspace
              </label>
              {loadingWorkspaces ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="workspace_id"
                  className="block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 transition-colors duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:focus:border-primary-400"
                  {...register("workspace_id")}
                >
                  <option value="">No workspace</option>
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={isSubmitting} size="lg">
                Create Project
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
