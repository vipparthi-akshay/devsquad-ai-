import { LandingNav } from "@/components/layout/LandingNav"

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <LandingNav />
      {children}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
                  <defs>
                    <linearGradient id="footer-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                  <rect width="32" height="32" rx="8" fill="url(#footer-logo)" />
                  <path d="M8 16l6-6 4 4 6-6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 20l6-6 4 4 6-6" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  DevSquad <span className="text-primary-600">AI</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                An AI-native engineering workspace. Turn ideas into production code with specialized agents and human approval gates.
              </p>
            </div>
            {[
              { title: "Product", links: [{ name: "Features", href: "#features" }, { name: "Agents", href: "#agents" }, { name: "Workflows", href: "#workflow" }, { name: "Pricing", href: "/billing" }] },
              { title: "Resources", links: [{ name: "Documentation", href: "/docs" }, { name: "API Reference", href: "/docs#api-reference" }, { name: "GitHub", href: "#" }, { name: "Status", href: "#status" }] },
              { title: "Company", links: [{ name: "About", href: "#about" }, { name: "Blog", href: "#blog" }, { name: "Careers", href: "#careers" }, { name: "Contact", href: "#contact" }] },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{group.title}</h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} DevSquad AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Twitter", "GitHub", "Discord"].map((social) => (
                <a key={social} href="#community" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
