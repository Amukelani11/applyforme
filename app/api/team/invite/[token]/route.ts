import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Get invitation details
    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        recruiter:recruiters(
          id,
          company_name,
          user:users(full_name, email)
        ),
        invited_by:users!invited_by(full_name, email)
      `)
      .eq('token', token)
      .single()

    if (error) {
      console.error('Error fetching invitation:', error)
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 })
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.json({ error: 'Invitation has already been accepted' }, { status: 409 })
    }

    return NextResponse.json({ invitation })

  } catch (error) {
    console.error('Error in team invite route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 