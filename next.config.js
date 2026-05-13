/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.rayland.com' },
      { protocol: 'https', hostname: 'dl.airtable.com' },
      { protocol: 'https', hostname: 'utfs.io' },           // UploadThing CDN
      { protocol: 'https', hostname: '*.ufs.sh' },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      '@anthropic-ai/sdk',
      'airtable',
      'pdf-parse',
    ],
  },

  async headers() {
    return [
      { source: '/(.*)', headers: [{ key: 'X-DNS-Prefetch-Control', value: 'on' }] },
      { source: '/_next/static/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ]
  },
}
module.exports = nextConfig
