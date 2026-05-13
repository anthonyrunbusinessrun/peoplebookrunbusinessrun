import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Edge Middleware — request-level protection layer.
 * Acts as the Nginx equivalent for this Railway deployment:
 *   - Blocks obviously malicious requests early (before they hit DB)
 *   - Adds security headers on all responses
 *   - Sets cache headers on static/cacheable routes
 *   - Blocks bot spam on the apply endpoint
 *
 * For true load balancing across multiple instances:
 *   Add a Railway "TCP Proxy" or Cloudflare in front.
 */

const BLOCKED_PATHS = [
  '/wp-admin', '/wp-login', '/.env', '/phpMyAdmin',
  '/admin.php', '/xmlrpc.php', '/.git',
]

// Simple bot UA patterns to block (don't process their requests)
const BOT_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /masscan/i, /zgrab/i, /nmap/i,
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ua = req.headers.get('user-agent') ?? ''

  // Block probe paths immediately
  if (BLOCKED_PATHS.some(p => pathname.startsWith(p))) {
    return new NextResponse(null, { status: 404 })
  }

  // Block known scanner UAs
  if (BOT_UA_PATTERNS.some(p => p.test(ua))) {
    return new NextResponse(null, { status: 403 })
  }

  const res = NextResponse.next()

  // ── Security headers ──────────────────────────────────────────────────────
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // ── Cache control ─────────────────────────────────────────────────────────
  // Static assets — long cache
  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/public/')) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return res
  }

  // API routes — never cache, prevent stale data
  if (pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    // Prevent response buffering on Railway's proxy (important for SSE streaming)
    if (pathname.startsWith('/api/birdy/chat')) {
      res.headers.set('X-Accel-Buffering', 'no')
    }
    return res
  }

  // HTML pages — short cache, allow revalidation
  res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')

  return res
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and image optimization
    '/((?!_next/image|favicon|apple-icon|raylandlogo|nav-stripes).*)',
  ],
}
