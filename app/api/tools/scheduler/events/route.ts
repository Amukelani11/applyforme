import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: recruiter } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!recruiter) return NextResponse.json({ events: [] })

    const { data: events, error } = await supabase
      .from('recruiter_events')
      .select('*')
      .eq('recruiter_id', recruiter.id)
      .order('start_time', { ascending: true })

    if (error) throw error
    return NextResponse.json({ events: events || [] })
  } catch (error) {
    console.error('List events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, notes, event_type, start_time, end_time, job_posting_id, candidate_application_id } = body || {}
    if (!title || !event_type || !start_time) {
      return NextResponse.json({ error: 'title, event_type, start_time required' }, { status: 400 })
    }

    const { data: recruiter, error: rErr } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (rErr) throw rErr
    if (!recruiter) return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('recruiter_events')
      .insert({
        recruiter_id: recruiter.id,
        title,
        notes: notes || null,
        event_type,
        start_time,
        end_time: end_time || null,
        job_posting_id: job_posting_id || null,
        candidate_application_id: candidate_application_id || null
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ event: data })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


