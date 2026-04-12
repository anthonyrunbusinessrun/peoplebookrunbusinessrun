import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({
    status: 'ok', app: 'PeopleBook',
    org: 'Ray Land Inc.', ts: new Date().toISOString()
  })
}
