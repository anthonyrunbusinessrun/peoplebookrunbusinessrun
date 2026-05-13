/**
 * app/api/webhook/airtable/route.ts
 * Receives Airtable change notifications and invalidates the roles cache
 * so Birdy picks up new roles within seconds instead of waiting for TTL.
 *
 * Set this URL in Airtable → Automations → Run script or Send webhook.
 * URL: https://your-app.railway.app/api/webhook/airtable
 *
 * Optionally protect with AIRTABLE_WEBHOOK_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server'
import { invalidateRolesCache } from '@/lib/airtable'

export async function POST(req: NextRequest) {
  // Optional secret validation
  const secret = process.env.AIRTABLE_WEBHOOK_SECRET
  if (secret) {
    const incomingSecret = req.headers.get('x-airtable-secret') ??
                           req.nextUrl.searchParams.get('secret')
    if (incomingSecret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  invalidateRolesCache()
  console.log('[webhook/airtable] Roles cache invalidated')

  return NextResponse.json({ ok: true, message: 'Roles cache cleared' })
}

// Also support GET for easy manual testing
export async function GET(req: NextRequest) {
  const secret = process.env.AIRTABLE_WEBHOOK_SECRET
  if (secret) {
    const incomingSecret = req.nextUrl.searchParams.get('secret')
    if (incomingSecret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  invalidateRolesCache()
  return NextResponse.json({ ok: true, message: 'Roles cache cleared' })
}
