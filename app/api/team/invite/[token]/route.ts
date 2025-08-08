import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    console.log('🔍 Looking for invitation with token:', token)
    const admin = createAdminClient()

    // Fetch the invitation using service role to bypass RLS for public access
    const { data: invitation, error } = await admin
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !invitation) {
      console.error('Error fetching invitation:', error)
      console.log('🔍 No invitation found for token:', token)
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    console.log('🔍 Found invitation:', invitation)

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 })
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.json({ error: 'Invitation has already been accepted' }, { status: 409 })
    }

    // Fetch recruiter and inviter details separately to avoid brittle joins
    const [{ data: recruiter }, { data: inviterUser }] = await Promise.all([
      admin
        .from('recruiters')
        .select('id, company_name')
        .eq('id', invitation.recruiter_id)
        .single(),
      admin
        .from('users')
        .select('id, full_name, email')
        .eq('id', invitation.invited_by)
        .single(),
    ])

    const responseInvitation = {
      id: invitation.id,
      email: invitation.email,
      full_name: invitation.full_name,
      role: invitation.role,
      expires_at: invitation.expires_at,
      accepted_at: invitation.accepted_at,
      created_at: invitation.created_at,
      recruiter: recruiter
        ? {
            id: recruiter.id,
            company_name: recruiter.company_name,
            // Keeping shape compatible with UI (not currently used for recruiter.user)
            user: inviterUser
              ? { full_name: inviterUser.full_name, email: inviterUser.email }
              : null,
          }
        : null,
      invited_by: inviterUser
        ? { id: inviterUser.id, full_name: inviterUser.full_name, email: inviterUser.email }
        : null,
    }

    return NextResponse.json({ invitation: responseInvitation })

  } catch (error) {
    console.error('Error in team invite route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 