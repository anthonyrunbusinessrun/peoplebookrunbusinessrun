/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
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

  serverExternalPackages: [
    '@prisma/client',
    '@anthropic-ai/sdk',
    'airtable',
    'pdf-parse',
  ],

  async headers() {
    return [
      { source: '/(.*)', headers: [{ key: 'X-DNS-Prefetch-Control', value: 'on' }] },
    ]
  },
}
module.exports = nextConfig
