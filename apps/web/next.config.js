/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    // Proxy /api/* to the backend. Locally this defaults to the dev API on
    // port 8000. In a deployed environment (e.g. Vercel) set API_BASE_URL to
    // the hosted backend URL. If it is unset in a deployed environment we skip
    // the rewrite so requests 404 quickly (the UI has mock fallbacks) instead
    // of hanging on an unreachable localhost.
    const apiBase =
      process.env.API_BASE_URL || (process.env.VERCEL ? null : 'http://localhost:8000')
    if (!apiBase) return []
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
