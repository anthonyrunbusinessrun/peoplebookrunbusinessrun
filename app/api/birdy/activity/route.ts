import { NextRequest, NextResponse } from 'next/server'
import { getRecentActivity, getUsageStats } from '@/lib/birdy/usage-logger'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  const [activity, stats] = await Promise.allSettled([
    getRecentActivity(sessionId, 30),
    getUsageStats(sessionId),
  ])

  return NextResponse.json({
    activity: activity.status === 'fulfilled' ? activity.value : [],
    stats:    stats.status    === 'fulfilled' ? stats.value    : null,
  })
}
