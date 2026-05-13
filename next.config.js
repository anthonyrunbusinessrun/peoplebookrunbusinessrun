/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.rayland.com', 'dl.airtable.com'],
  },
  // Reduce memory pressure on Railway — disable source maps in production
  productionBrowserSourceMaps: false,
  // Compress responses
  compress: true,
  // Increase max body size for file uploads (already handled by uploadthing, but be explicit)
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@anthropic-ai/sdk'],
  },
}
module.exports = nextConfig
