import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { context, rating, comment, recruiter_id, role, metadata } = body || {}
    if (!context) return NextResponse.json({ error: 'Missing context' }, { status: 400 })

    const { error } = await supabase.from('user_feedback').insert({
      user_id: user.id,
      recruiter_id: recruiter_id || null,
      role: role || null,
      context,
      rating: typeof rating === 'number' ? rating : null,
      comment: comment?.toString()?.slice(0, 2000) || null,
      metadata: metadata || null,
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}


