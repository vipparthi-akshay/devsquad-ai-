"use client"

import { useState, useEffect } from "react"
import { payments, type PaymentPlanResponse, type SubscriptionStatusResponse } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { EmptyState } from "@/components/ui/EmptyState"

export default function BillingPage() {
  const [plans, setPlans] = useState<PaymentPlanResponse[]>([])
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [plansData, subData] = await Promise.all([
          payments.plans(),
          payments.subscription().catch(() => null),
        ])
        setPlans(plansData)
        setSubscription(subData)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSubscribe = async (priceId: string, planName: string) => {
    setCheckoutLoading(priceId)
    try {
      const { url } = await payments.createCheckoutSession({
        price_id: priceId,
        success_url: `${window.location.origin}/billing?success=1`,
        cancel_url: `${window.location.origin}/billing?canceled=1`,
      })
      window.location.href = url
    } catch {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const { url } = await payments.createPortalSession()
      window.location.href = url
    } catch {
      setPortalLoading(false)
    }
  }

  const currentPlanId = subscription?.plan_id
  const isSubscribed = subscription?.status === "active" || subscription?.status === "trialing"

  return (
    <div className="space-y-6 animate-slideUp">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Billing</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Manage your subscription and billing information
        </p>
      </div>

      {isSubscribed && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Current Plan</p>
                <p className="text-lg font-semibold text-surface-900 dark:text-surface-50 capitalize mt-1">
                  {currentPlanId}
                </p>
                <Badge
                  variant={subscription.status === "active" ? "success" : "warning"}
                  size="sm"
                  className="mt-1"
                >
                  {subscription.status}
                </Badge>
              </div>
              <Button
                variant="outline"
                loading={portalLoading}
                onClick={handleManageSubscription}
              >
                Manage Subscription
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </Card>
            ))
          : plans.map((plan) => {
              const isCurrent = isSubscribed && currentPlanId === plan.id
              const isFree = plan.price === 0
              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${
                    isCurrent ? "ring-2 ring-primary-500" : ""
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <Badge variant="primary" size="sm">Current Plan</Badge>
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                      {plan.description}
                    </p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-surface-900 dark:text-surface-50">
                        {isFree ? "Free" : `$${(plan.price / 100).toFixed(0)}`}
                      </span>
                      {!isFree && (
                        <span className="text-sm text-surface-500 dark:text-surface-400">
                          /{plan.interval}
                        </span>
                      )}
                    </div>
                    <ul className="mt-6 space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300">
                          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      {isCurrent ? (
                        <Button className="w-full" variant="outline" disabled>
                          Current Plan
                        </Button>
                      ) : isFree ? (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => window.location.href = "/register"}
                        >
                          Get Started
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          loading={checkoutLoading === plan.id}
                          onClick={() => handleSubscribe(plan.id, plan.name)}
                        >
                          Subscribe
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
      </div>

      {!loading && !isSubscribed && plans.length === 0 && (
        <EmptyState
          title="No plans available"
          description="Unable to load pricing plans. Please try again later."
        />
      )}
    </div>
  )
}
