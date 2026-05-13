/**
 * middleware.ts
 * Next.js Edge Middleware — runs at the CDN edge before any route handler.
 *
 * Responsibilities:
 *   1. Block scanner/probe paths (wp-admin, .env, etc.) — no DB hit at all
 *   2. Block known malicious user-agents
 *   3. Add security headers to every response
 *   4. Set cache-control correctly per route type
 *   5. Pass SSE headers through for /api/birdy/chat
 *
 * NOTE: For network-level rate limiting, deploy the nginx service in Railway
 * (see nginx/ directory). This middleware handles app-level protection.
 */

import { NextRequest, NextResponse } from 'next/server'

// Paths to block immediately — never pass to Next.js
const BLOCKED_PATHS = [
  '/wp-admin', '/wp-login', '/.env', '/phpMyAdmin',
  '/admin.php', '/xmlrpc.php', '/.git', '/config.php',
  '/eval-stdin.php', '/vendor/', '/composer.json',
]

// Scanner user-agents
const BAD_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /masscan/i, /zgrab/i, /nmap/i,
  /python-requests\/[0-1]/i, /go-http-client\/1\.[01]$/i,
]

// Paths that get strict no-cache
const API_PATHS_NO_CACHE = ['/api/']

// Paths that get long-lived immutable caching
const STATIC_PATHS = ['/_next/static/', '/favicon', '/apple-icon', '/public/']

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl
  const ua = req.headers.get('user-agent') ?? ''

  // ── Block probe paths ───────────────────────────────────────────────────
  if (BLOCKED_PATHS.some(p => pathname.startsWith(p))) {
    return new NextResponse(null, { status: 404 })
  }

  // ── Block scanner user-agents ───────────────────────────────────────────
  if (BAD_UA_PATTERNS.some(p => p.test(ua))) {
    return new NextResponse(null, { status: 403 })
  }

  const res = NextResponse.next()

  // ── Security headers (on every response) ───────────────────────────────
  res.headers.set('X-Content-Type-Options',  'nosniff')
  res.headers.set('X-Frame-Options',         'SAMEORIGIN')
  res.headers.set('X-XSS-Protection',        '1; mode=block')
  res.headers.set('Referrer-Policy',         'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy',      'camera=(), microphone=(), geolocation=()')

  // ── Cache-Control by route ──────────────────────────────────────────────

  // Static assets — aggressive long cache
  if (STATIC_PATHS.some(p => pathname.startsWith(p))) {
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return res
  }

  // API routes — never cache
  if (API_PATHS_NO_CACHE.some(p => pathname.startsWith(p))) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

    // SSE stream — must not buffer
    if (pathname.startsWith('/api/birdy/chat')) {
      res.headers.set('X-Accel-Buffering', 'no')
      res.headers.set('Connection',        'keep-alive')
    }

    return res
  }

  // Pages — short public cache (ISR pages have their own revalidate setting)
  res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=30')

  return res
}

export const config = {
  matcher: [
    // Run on all paths EXCEPT Next.js internals and static files
    '/((?!_next/image|_next/webpack-hmr|__nextjs_original-stack-frame).*)',
  ],
}
