"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardTitle } from "@/components/ui/Card"
import { GoogleSignIn } from "@/components/auth/GoogleSignIn"

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    try {
      await registerUser(data.full_name, data.email, data.password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    }
  }

  return (
    <Card>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
          <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold">DevSquad AI</CardTitle>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Create your workspace account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Registration form">
        {error && (
          <div
            className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-400"
            role="alert"
          >
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirm_password?.message}
          {...register("confirm_password")}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
        >
          Create account
        </Button>
      </form>

      <GoogleSignIn />

      <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          Sign in
        </Link>
      </p>
    </Card>
  )
}
