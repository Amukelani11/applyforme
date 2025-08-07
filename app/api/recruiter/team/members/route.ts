import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { EmailService } from '@/lib/email-service'

// Add a simple health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        status: 'unauthenticated',
        error: authError?.message || 'No user found'
      }, { status: 401 })
    }
    
    return NextResponse.json({ 
      status: 'authenticated',
      userId: user.id
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    
    // Add debugging for authentication
    console.log('Team members API: Attempting to get user...')
    let { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // If primary authentication fails, try to get session
    if (authError || !user) {
      console.log('Team members API: Primary auth failed, trying session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Team members API: Session error:', sessionError)
        return NextResponse.json({ error: 'Unauthorized - Session error' }, { status: 401 })
      }
      
      if (!session?.user) {
        console.error('Team members API: No session user found')
        return NextResponse.json({ error: 'Unauthorized - No session user' }, { status: 401 })
      }
      
      user = session.user
      console.log('Team members API: User authenticated via session:', user.id)
    } else {
      console.log('Team members API: User authenticated via getUser:', user.id)
    }

    // Get recruiter profile
    const { data: recruiter, error: recruiterError } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (recruiterError) {
      console.error('Team members API: Recruiter error:', recruiterError)
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })
    }
    
    if (!recruiter) {
      console.error('Team members API: No recruiter found for user:', user.id)
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })
    }

    console.log('Team members API: Recruiter found:', recruiter.id)

    // Get team members without foreign key joins
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .eq('recruiter_id', recruiter.id)
      .order('created_at', { ascending: false })

    if (teamError) {
      console.error('Error fetching team members:', teamError)
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }

    // Get user details for all team members
    if (teamMembers && teamMembers.length > 0) {
      const userIds = [...new Set([
        ...teamMembers.map(tm => tm.user_id),
        ...teamMembers.filter(tm => tm.invited_by).map(tm => tm.invited_by)
      ])]

      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const userMap = new Map()
      users.users.forEach(u => userMap.set(u.id, u))

      // Enhance team members with user details
      const enhancedTeamMembers = teamMembers.map(member => ({
        ...member,
        user: userMap.get(member.user_id) ? {
          id: userMap.get(member.user_id)?.id,
          email: userMap.get(member.user_id)?.email,
          created_at: userMap.get(member.user_id)?.created_at
        } : null,
        invited_by_user: member.invited_by && userMap.get(member.invited_by) ? {
          id: userMap.get(member.invited_by)?.id,
          email: userMap.get(member.invited_by)?.email,
          created_at: userMap.get(member.invited_by)?.created_at
        } : null
      }))

      return NextResponse.json({ teamMembers: enhancedTeamMembers })
    }

    return NextResponse.json({ teamMembers: teamMembers || [] })

  } catch (error) {
    console.error('Error in team members route:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    
    // Add debugging for authentication
    console.log('Team members POST API: Attempting to get user...')
    let { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // If primary authentication fails, try to get session
    if (authError || !user) {
      console.log('Team members POST API: Primary auth failed, trying session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Team members POST API: Session error:', sessionError)
        return NextResponse.json({ error: 'Unauthorized - Session error' }, { status: 401 })
      }
      
      if (!session?.user) {
        console.error('Team members POST API: No session user found')
        return NextResponse.json({ error: 'Unauthorized - No session user' }, { status: 401 })
      }
      
      user = session.user
      console.log('Team members POST API: User authenticated via session:', user.id)
    } else {
      console.log('Team members POST API: User authenticated via getUser:', user.id)
    }

    // Get recruiter profile
    const { data: recruiter, error: recruiterError } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (recruiterError || !recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })
    }

    // Check if user is admin
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('recruiter_id', recruiter.id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !teamMember || teamMember.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email, full_name, role } = body

    if (!email || !full_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists in auth.users
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser.users.find(u => u.email === email)

    if (userExists) {
      // Check if user is already a team member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('recruiter_id', recruiter.id)
        .eq('user_id', userExists.id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 })
      }

      // Add existing user to team
      const { data: newMember, error: insertError } = await supabase
        .from('team_members')
        .insert({
          recruiter_id: recruiter.id,
          user_id: userExists.id,
          role,
          status: 'active',
          invited_by: user.id,
          joined_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error adding team member:', insertError)
        return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Team member added successfully',
        teamMember: newMember
      })

    } else {
      // Create invitation
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

      const { data: invitation, error: inviteError } = await supabase
        .from('team_invitations')
        .insert({
          recruiter_id: recruiter.id,
          email,
          full_name,
          role,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (inviteError) {
        console.error('Error creating invitation:', inviteError)
        return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
      }

      // Get recruiter and company information for the email
      const { data: recruiterInfo } = await supabase
        .from('recruiters')
        .select('company_name')
        .eq('id', recruiter.id)
        .single()

      const { data: inviterInfo } = await supabase
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single()

      // Get inviter's name from recruiter profile
      const { data: inviterProfile } = await supabase
        .from('recruiters')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      // Send invitation email
      try {
        const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://applyforme.co.za'}/team/invite/${token}`
        
        const emailSent = await EmailService.sendTeamInvitationEmail({
          inviteeName: full_name,
          inviterName: inviterProfile?.full_name || 'Team Admin',
          companyName: recruiterInfo?.company_name || 'Your Company',
          role: role,
          invitationUrl: invitationUrl,
          expiresAt: expiresAt.toISOString()
        }, email)

        if (!emailSent) {
          console.error('Failed to send invitation email')
          // Don't fail the request, just log the error
        } else {
          console.log('Team invitation email sent successfully to:', email)
        }
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({ 
        message: 'Invitation created and email sent successfully',
        invitation
      })
    }

  } catch (error) {
    console.error('Error in team members route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 