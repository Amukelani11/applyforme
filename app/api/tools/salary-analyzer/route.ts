import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { role, location, industry, experience } = await req.json()
    if (!role || !location || !industry || !experience) {
      return NextResponse.json({ error: 'role, location, industry, experience required' }, { status: 400 })
    }

    // Delegate to existing AI research endpoint for structured SA-focused data
    const query = `${role} in ${industry} at ${location} for ${experience} level`
    const base = req.nextUrl?.origin || process.env.NEXT_PUBLIC_BASE_URL || ''
    const url = new URL('/api/ai-research', base)
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, type: 'research', plan: { id: 'inline' } })
    })

    if (!res.ok) throw new Error(`ai-research failed: ${res.status}`)
    const data = await res.json()
    return NextResponse.json({ results: data.results })
  } catch (error) {
    console.error('Salary analyzer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


