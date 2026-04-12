import { NextResponse } from 'next/server'
import { getRoles } from '@/lib/airtable'
export const revalidate = 300
export async function GET() {
  try {
    const roles = await getRoles()
    return NextResponse.json({ roles, count: roles.length })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}
