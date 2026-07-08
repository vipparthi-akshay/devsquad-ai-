"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView] as const
}

function FadeInSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, inView] = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  )
}

const agents = [
  { name: "Product Manager", role: "Strategy & Roadmap", color: "border-l-primary-500", icon: "PM" },
  { name: "Requirements Analyst", role: "Specification Writing", color: "border-l-secondary-500", icon: "RA" },
  { name: "System Architect", role: "Architecture Design", color: "border-l-accent-500", icon: "SA" },
  { name: "Frontend Engineer", role: "UI Development", color: "border-l-primary-400", icon: "FE" },
  { name: "Backend Engineer", role: "API & Services", color: "border-l-secondary-400", icon: "BE" },
  { name: "Security Engineer", role: "Threat Modeling", color: "border-l-danger-500", icon: "SE" },
  { name: "QA Engineer", role: "Test Automation", color: "border-l-success-500", icon: "QA" },
  { name: "Code Reviewer", role: "Code Quality", color: "border-l-warning-500", icon: "CR" },
  { name: "DevOps Engineer", role: "Infrastructure", color: "border-l-accent-400", icon: "DE" },
]

const workflowSteps = [
  { number: "01", title: "Idea", description: "Start with a product requirement or feature request" },
  { number: "02", title: "Requirements", description: "AI analyzes and structures detailed specifications" },
  { number: "03", title: "Architecture", description: "System design and component relationships" },
  { number: "04", title: "Tasks", description: "Breakdown into actionable development tasks" },
  { number: "05", title: "Code", description: "AI agents write implementation code" },
  { number: "06", title: "Review", description: "Automated code review and quality checks" },
  { number: "07", title: "Test", description: "Unit, integration, and E2E test generation" },
  { number: "08", title: "Security", description: "Vulnerability scanning and threat analysis" },
  { number: "09", title: "Approve", description: "Human approval before any merge" },
  { number: "10", title: "PR", description: "Ready-to-merge pull request with full context" },
]

const approvalRequest = {
  title: "Add user authentication module",
  description: "Implements OAuth2 flow with Google and GitHub providers. Includes session management, token refresh, and MFA support.",
  author: "Backend Engineer Agent",
  files: 12,
  changes: "+847 / -123",
  timeAgo: "2 minutes ago",
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-950 to-violet-950 dark:from-indigo-950 dark:via-gray-950 dark:to-violet-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-950" />

        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 lg:pt-0">
          <FadeInSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              AI-Native Engineering Platform
            </div>
          </FadeInSection>

          <FadeInSection>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-6">
              Your AI Engineering Team.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400">
                Auditable. Reviewable. Under Your Control.
              </span>
            </h1>
          </FadeInSection>

          <FadeInSection>
            <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              Turn requirements into architecture, tasks, reviewed code changes and pull requests with specialized AI agents and human approval gates.
            </p>
          </FadeInSection>

          <FadeInSection>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40"
              >
                Start Building
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl text-base font-semibold text-white border border-white/20 hover:bg-white/5 transition-all"
              >
                View Live Demo
              </Link>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-success-400" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-success-400" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                SOC 2 Compliant
              </span>
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-success-400" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Private deployment
              </span>
            </div>
          </FadeInSection>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-400" aria-hidden="true">
            <polyline points="7 13 12 18 17 13" />
            <line x1="12" y1="6" x2="12" y2="18" />
          </svg>
        </div>
      </section>

      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Platform</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Everything you need to ship better software
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                From requirements to pull requests, our specialized AI agents work together under your supervision.
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Repository Intelligence", desc: "Deep understanding of any codebase. File tree analysis, language detection, dependency mapping, and symbol indexing.", icon: "RI" },
              { title: "Human Approval Gates", desc: "Every change requires your sign-off. Review, approve, or reject before any code is merged.", icon: "HA" },
              { title: "Built-in Security", desc: "Threat modeling, secrets detection, dependency review, and prompt injection protection baked into every workflow.", icon: "BU" },
              { title: "Full Observability", desc: "Activity timeline, token tracking, cost estimation, and execution logs for complete transparency.", icon: "FO" },
              { title: "Multi-Agent Collaboration", desc: "Specialized agents work together, handing off context seamlessly from requirements to deployment.", icon: "MA" },
              { title: "Audit Trail", desc: "Every decision, change, and approval is recorded. Full compliance and audit readiness out of the box.", icon: "AT" },
            ].map((feature, i) => (
              <FadeInSection key={feature.title}>
                <div className="group p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="agents" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Agent Team</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Specialized AI Agents
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Each agent has a distinct role, expertise, and responsibility — just like a real engineering team.
              </p>
            </div>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {agents.map((agent) => (
              <FadeInSection key={agent.name}>
                <div className={`group p-5 lg:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 border-l-4 ${agent.color}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                      {agent.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{agent.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Specialized in {agent.role.toLowerCase()} with deep expertise in modern engineering practices and patterns.
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Workflow</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                From Idea to Pull Request
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                A structured, transparent pipeline that turns any idea into production-ready code.
              </p>
            </div>
          </FadeInSection>

          <div className="relative">
            <div className="absolute left-[31px] lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500 hidden lg:block" />

            <div className="space-y-8 lg:space-y-12">
              {workflowSteps.map((step, i) => (
                <FadeInSection key={step.number}>
                  <div className={`lg:flex items-center gap-8 lg:gap-16 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                    <div className="hidden lg:flex lg:w-1/2 justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                        {step.number}
                      </div>
                    </div>

                    <div className="lg:w-1/2">
                      <div className="lg:hidden flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm shrink-0">
                          {step.number}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                      </div>
                      <div className="hidden lg:block">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                      </div>
                      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">{step.description}</p>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Control</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                You Stay in Control
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Human-in-the-loop is at our core. Every pull request requires your review and explicit approval before it can be merged.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="max-w-2xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
              <div className="p-5 lg:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center text-secondary-700 dark:text-secondary-300 text-sm font-bold">
                    BE
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Approval Required</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{approvalRequest.timeAgo}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-warning-100 dark:bg-warning-950 text-warning-700 dark:text-warning-300">
                  Pending Review
                </span>
              </div>

              <div className="p-5 lg:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{approvalRequest.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{approvalRequest.description}</p>
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {approvalRequest.files} files
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-success-600 dark:text-success-400">+847</span>
                    <span className="text-danger-600 dark:text-danger-400">-123</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {approvalRequest.author}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-success-600 hover:bg-success-700 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Approve & Merge
                  </button>
                  <button className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Request Changes
                  </button>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <section id="security" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Security</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Built-in Security
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Security is not an afterthought. Every workflow includes threat modeling, secrets detection, and vulnerability scanning.
              </p>
            </div>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Threat Modeling", desc: "Automated threat analysis for every architecture change and new feature." },
              { title: "Secrets Detection", desc: "Prevent accidental exposure of API keys, tokens, and credentials." },
              { title: "Dependency Review", desc: "Vulnerability scanning for all dependencies and supply chain risks." },
              { title: "Prompt Protection", desc: "Guard against prompt injection and unauthorized data access." },
            ].map((item) => (
              <FadeInSection key={item.title}>
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-danger-200 dark:hover:border-danger-800 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-danger-100 dark:bg-danger-950 flex items-center justify-center text-danger-600 dark:text-danger-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Observability</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Full Observability
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Complete transparency into every agent action, token usage, and cost. Nothing happens without your knowledge.
              </p>
            </div>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Activity Timeline", desc: "Every action logged in real-time with full context and reasoning." },
              { title: "Token Tracking", desc: "Monitor token consumption across all agents and sessions." },
              { title: "Cost Estimation", desc: "Real-time cost tracking and budget management for AI usage." },
              { title: "Execution Logs", desc: "Detailed logs for every agent execution, including prompts and outputs." },
            ].map((item) => (
              <FadeInSection key={item.title}>
                <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-accent-200 dark:hover:border-accent-800 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600 dark:text-accent-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">About</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                The Future of Software Engineering
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                DevSquad AI is an open platform where specialized AI agents collaborate like a real engineering team — from requirements to production code — with human approval at every gate.
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeInSection>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-700 dark:text-primary-300 shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Our Mission</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Empower every engineering team to ship better software faster by combining AI productivity with human judgment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center text-secondary-700 dark:text-secondary-300 shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Our Values</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Transparency, auditability, and human oversight. Every AI action is logged, every change requires approval, and you stay in control.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600 dark:text-accent-400 shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Open & Extensible</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Built on open standards. Customize agents, add your own tools, and integrate with your existing workflows and infrastructure.</p>
                  </div>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection>
              <div className="p-8 lg:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { value: "10+", label: "Specialized Agents" },
                    { value: "10K+", label: "Lines of Code/Wk" },
                    { value: "99.9%", label: "Uptime" },
                    { value: "Zero", label: "Vendor Lock-in" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      <section id="blog" className="py-20 lg:py-32 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Blog</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Latest from DevSquad
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Insights, tutorials, and updates from the team building the future of AI-native engineering.
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                date: "Jul 1, 2026",
                title: "Building an AI Engineering Team: Lessons from the Trenches",
                desc: "How we designed a multi-agent system that collaborates like a real engineering team — and what we learned along the way.",
                tag: "Engineering",
                author: "DevSquad Team",
              },
              {
                date: "Jun 22, 2026",
                title: "Human-in-the-Loop AI: Why Approval Gates Matter",
                desc: "Why we believe every AI-generated change needs human review, and how we built approval gates that don't slow you down.",
                tag: "Product",
                author: "DevSquad Team",
              },
              {
                date: "Jun 8, 2026",
                title: "From Requirements to PR: A Complete AI Workflow",
                desc: "A step-by-step walkthrough of how DevSquad transforms a product requirement into a ready-to-merge pull request.",
                tag: "Tutorial",
                author: "DevSquad Team",
              },
            ].map((post) => (
              <FadeInSection key={post.title}>
                <a href="#" className="group block p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                      {post.tag}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{post.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {post.desc}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{post.author}</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </a>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="careers" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Careers</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Join the Team
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Help us build the future of AI-native software engineering. We're looking for passionate people who love solving hard problems.
              </p>
            </div>
          </FadeInSection>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { title: "Senior Frontend Engineer", href: "#", dept: "Engineering", location: "Remote / SF", type: "Full-time" },
              { title: "AI/ML Engineer", dept: "Engineering", location: "Remote / NY", type: "Full-time" },
              { title: "Developer Advocate", dept: "Marketing", location: "Remote", type: "Full-time" },
              { title: "Product Designer", dept: "Product", location: "Remote / SF", type: "Full-time" },
            ].map((job) => (
              <FadeInSection key={job.title}>
                <a href={job.href || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 lg:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 group">
                  <div className="flex-1">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <span>{job.dept}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span>{job.location}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors" aria-hidden="true">→</span>
                </a>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="status" className="py-20 lg:py-32 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Status</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                System Status
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                All systems operational. Real-time status of DevSquad AI services.
              </p>
            </div>
          </FadeInSection>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { name: "API", status: "Operational", color: "text-success-500" },
              { name: "Web App", status: "Operational", color: "text-success-500" },
              { name: "AI Agents", status: "Operational", color: "text-success-500" },
              { name: "Database", status: "Operational", color: "text-success-500" },
            ].map((service) => (
              <FadeInSection key={service.name}>
                <div className="flex items-center justify-between p-5 lg:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-base font-medium text-gray-900 dark:text-white">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${service.color} bg-current`} />
                    <span className={`text-sm font-medium ${service.color}`}>{service.status}</span>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="community" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Community</span>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Join Our Community
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Connect with fellow developers, share ideas, and get help from the DevSquad team and community.
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Twitter", href: "https://x.com", color: "hover:border-blue-400 dark:hover:border-blue-500", desc: "Follow for product updates, engineering insights, and AI research highlights." },
              { name: "GitHub", href: "https://github.com", color: "hover:border-gray-400 dark:hover:border-gray-500", desc: "Explore our open-source code, contribute to the project, and browse the documentation." },
              { name: "Discord", href: "https://discord.com", color: "hover:border-indigo-400 dark:hover:border-indigo-500", desc: "Join the conversation. Ask questions, share feedback, and connect with other users." },
            ].map((platform) => (
              <FadeInSection key={platform.name}>
                <a href={platform.href || "#"} target="_blank" rel="noopener noreferrer" className={`group block p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${platform.color} hover:shadow-lg transition-all duration-300 text-center`}>
                  <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-300 mx-auto mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-950 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-all">
                    {platform.name[0]}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{platform.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{platform.desc}</p>
                </a>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 lg:py-32 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            <FadeInSection>
              <div>
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Contact</span>
                <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  Get in Touch
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                  Have questions about DevSquad AI? Want to schedule a demo or discuss enterprise pricing? We'd love to hear from you.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary-500 shrink-0" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    <span>hello@devsquad.ai</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary-500 shrink-0" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary-500 shrink-0" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection>
              <form onSubmit={(e) => e.preventDefault()} className="p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
                    <input id="name" type="text" placeholder="Your name" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                    <input id="email" type="email" placeholder="you@company.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
                  <input id="subject" type="text" placeholder="How can we help?" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                  <textarea id="message" rows={4} placeholder="Tell us more..." className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none" />
                </div>
                <button type="submit" className="w-full px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20">
                  Send Message
                </button>
              </form>
            </FadeInSection>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to transform your engineering workflow?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Join teams that are shipping faster with AI-native engineering. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30"
              >
                Start Building Free
              </Link>
              <Link
                href="#"
                className="px-8 py-4 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
              >
                Talk to Sales
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
