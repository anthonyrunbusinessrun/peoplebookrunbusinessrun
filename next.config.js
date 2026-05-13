/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.rayland.com' },
      { protocol: 'https', hostname: 'dl.airtable.com' },
    ],
  },

  // Disable source maps in production — reduces build time and memory on Railway
  productionBrowserSourceMaps: false,

  // Built-in gzip (nginx does this too when deployed; having both is fine — nginx wins)
  compress: true,

  // Standalone output — smallest possible Docker image for Railway
  // Remove this line if NOT using the Dockerfile build (Nixpacks builds don't need it)
  // output: 'standalone',

  experimental: {
    // Keep Prisma and Anthropic SDK out of the Edge runtime bundle
    serverComponentsExternalPackages: [
      '@prisma/client',
      '@anthropic-ai/sdk',
      'airtable',
    ],
    // Optimise CSS — reduces CSS bundle size
    optimizeCss: true,
  },

  // Headers for security and performance (middleware handles per-request,
  // these are applied at build time via Next.js routing)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      // Long cache for Next.js build chunks
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
