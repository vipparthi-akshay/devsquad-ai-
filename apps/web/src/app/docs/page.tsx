import Link from "next/link"

const sections = [
  {
    title: "Getting Started",
    items: [
      { name: "Overview", content: "DevSquad AI is an AI-native engineering workspace that helps you turn ideas into production code. Create projects, define requirements, and let specialized AI agents handle the implementation while you review and approve every step." },
      { name: "Quick Start", content: "1. Create an account\n2. Create a new project\n3. Define your requirements\n4. Run the demo workflow\n5. Review and approve generated code" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { name: "Projects", content: "Projects are the top-level container for your work. Each project has requirements, architecture, tasks, and workflows associated with it." },
      { name: "Agents", content: "Specialized AI agents handle different aspects of development: Product Manager, System Architect, Frontend/Backend Engineers, Security Engineer, QA Engineer, and more." },
      { name: "Workflows", content: "Workflows orchestrate multiple agents to complete complex tasks. The demo workflow walks through requirements, architecture, implementation, review, and testing." },
      { name: "Approvals", content: "Human-in-the-loop approval gates ensure you review and approve AI-generated code before it's applied. Each approval shows the proposed changes and affected files." },
    ],
  },
  {
    title: "API Reference",
    id: "api-reference",
    items: [
      { name: "Authentication", content: "All API requests require a JWT token in the Authorization header. Tokens are obtained via the /api/v1/auth/login endpoint using your email and password." },
      { name: "Projects API", content: "Create, list, and manage projects. POST /api/v1/projects to create, GET /api/v1/projects to list, GET /api/v1/projects/{id} to retrieve details." },
      { name: "Requirements API", content: "Manage project requirements. POST /api/v1/requirements to create, GET /api/v1/requirements?project_id=xxx to list, PATCH /api/v1/requirements/{id} to update." },
      { name: "Workflows API", content: "Orchestrate and monitor workflows. POST /api/v1/workflows to start, GET /api/v1/workflows?project_id=xxx to list, PATCH /api/v1/workflows/{id}/status to update status." },
      { name: "Approvals API", content: "Review and approve changes. GET /api/v1/approvals?project_id=xxx to list pending approvals, POST /api/v1/approvals/{id}/act to approve or reject." },
    ],
  },
  {
    title: "Features",
    items: [
      { name: "Requirements Studio", content: "Define project requirements using natural language. The AI analyzes your input and generates structured requirements with personas, user journeys, and acceptance criteria." },
      { name: "Architecture Studio", content: "Automatically generate system architecture including component models, API boundaries, data flow diagrams, and deployment models." },
      { name: "Task Backlog", content: "View and manage generated tasks organized by epics and stories. Each task includes acceptance criteria, priority, and estimated effort." },
      { name: "Code Review", content: "Review AI-generated code changes with diff views, inline comments, and quality checks before approval." },
      { name: "Security Center", content: "Automated security analysis of generated code, identifying vulnerabilities and suggesting fixes." },
      { name: "Testing Center", content: "AI-generated test plans and test cases covering unit, integration, and end-to-end testing." },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/landing" className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
          Documentation
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Learn how to use DevSquad AI to accelerate your development workflow.
        </p>

        <div className="mt-12 space-y-12">
          {sections.map((section) => (
            <section key={section.title} id={section.id}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.items.map((item) => (
                  <div key={item.name} className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
