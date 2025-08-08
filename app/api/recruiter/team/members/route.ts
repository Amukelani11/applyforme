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

    console.log('Team invitation request received:', { email, full_name, role, recruiterId: recruiter.id })

    if (!email || !full_name || !role) {
      console.error('Missing required fields for team invitation:', { email, full_name, role })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists in auth.users
    console.log('Checking if user exists in auth system for email:', email)
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser.users.find(u => u.email === email)

    if (userExists) {
      console.log('User found in auth system, checking if already team member:', { userId: userExists.id, email })
      // Check if user is already a team member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('recruiter_id', recruiter.id)
        .eq('user_id', userExists.id)
        .single()

      if (existingMember) {
        console.log('User is already a team member:', { userId: userExists.id, email, memberId: existingMember.id })
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 })
      }

      console.log('Adding existing user to team:', { userId: userExists.id, email, role })
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

      console.log('Team member added successfully:', { memberId: newMember.id, userId: userExists.id, email, role })

      // Send notification email to existing user that they've been added to the team
      console.log('🚀 Starting email notification process for existing user...')
      console.log('🔍 About to enter try-catch block for email sending...')
      console.log('🔍 Current email:', email)
      console.log('🔍 Current full_name:', full_name)
      console.log('🔍 Current role:', role)
      try {
        console.log('📧 Sending team addition notification email to existing user:', email)
        
        // Get recruiter and company information for the email
        const { data: recruiterInfo } = await supabase
          .from('recruiters')
          .select('company_name')
          .eq('id', recruiter.id)
          .single()

        const { data: inviterProfile } = await supabase
          .from('recruiters')
          .select('full_name')
          .eq('user_id', user.id)
          .single()

        console.log('📧 About to call EmailService.sendCustomEmail with:', {
          recipient: { email, name: full_name },
          subject: `Welcome to the team at ${recruiterInfo?.company_name || 'Your Company'}!`,
          companyName: recruiterInfo?.company_name,
          inviterName: inviterProfile?.full_name
        })
        
        // Test if EmailService is available
        console.log('🔍 EmailService available:', typeof EmailService)
        console.log('🔍 EmailService.sendCustomEmail available:', typeof EmailService.sendCustomEmail)
        
        const emailSent = await EmailService.sendCustomEmail(
          { email, name: full_name },
          `Welcome to the team at ${recruiterInfo?.company_name || 'Your Company'}!`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">🎉 Welcome to the Team!</h2>
              <p>Hi ${full_name},</p>
              <p><strong>${inviterProfile?.full_name || 'Team Admin'}</strong> has added you to the recruitment team at <strong>${recruiterInfo?.company_name || 'Your Company'}</strong>.</p>
              <p>Your role: <strong>${role}</strong></p>
              <p>You can now access the team dashboard and start collaborating with your team members.</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://applyforme.co.za'}/recruiter/dashboard" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Dashboard</a></p>
              <p>Best regards,<br>The ApplyForMe Team</p>
            </div>
          `,
          `Welcome to the team at ${recruiterInfo?.company_name || 'Your Company'}!\n\nHi ${full_name},\n\n${inviterProfile?.full_name || 'Team Admin'} has added you to the recruitment team at ${recruiterInfo?.company_name || 'Your Company'}.\n\nYour role: ${role}\n\nYou can now access the team dashboard and start collaborating with your team members.\n\nAccess Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://applyforme.co.za'}/recruiter/dashboard\n\nBest regards,\nThe ApplyForMe Team`
        )
        
        console.log('📧 EmailService.sendCustomEmail returned:', emailSent)

        if (!emailSent) {
          console.error('❌ Failed to send team addition notification email to:', email)
        } else {
          console.log('✅ Team addition notification email sent successfully to:', email)
          console.log('📧 Email details:', {
            to: email,
            inviteeName: full_name,
            inviterName: inviterProfile?.full_name || 'Team Admin',
            companyName: recruiterInfo?.company_name || 'Your Company',
            role: role
          })
        }
      } catch (emailError) {
        console.error('❌ Error sending team addition notification email to:', email, 'Error:', emailError)
        console.error('🔍 Full error details:', JSON.stringify(emailError, null, 2))
      }

      console.log('🔍 About to return success response for existing user...')
       return NextResponse.json({ 
         message: 'Team member added successfully',
         teamMember: newMember
       })

    } else {
      console.log('User not found in auth system, creating invitation for:', { email, full_name, role })
      // Create invitation
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now
      console.log('Generated invitation token:', token, 'expires:', expiresAt.toISOString())

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

      console.log('Invitation created successfully:', { invitationId: invitation.id, token, email })

      // Get recruiter and company information for the email
      console.log('Fetching company and inviter information for email...')
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

      console.log('Email data prepared:', {
        companyName: recruiterInfo?.company_name,
        inviterEmail: inviterInfo?.email,
        inviterName: inviterProfile?.full_name
      })

      // Send invitation email
      console.log('🚀 Starting invitation email process for new user...')
      console.log('🔍 About to enter try-catch block for invitation email...')
      try {
        console.log('🔍 NEXT_PUBLIC_SITE_URL value:', process.env.NEXT_PUBLIC_SITE_URL)
        const invitationUrl = `https://applyforme.co.za/team/invite/${token}`
        console.log('Preparing to send invitation email to:', email)
        console.log('Invitation URL:', invitationUrl)
        console.log('🔍 About to call EmailService.sendTeamInvitationEmail...')
        console.log('🔍 EmailService available:', typeof EmailService)
        console.log('🔍 EmailService.sendTeamInvitationEmail available:', typeof EmailService.sendTeamInvitationEmail)
        
        console.log('🔍 EmailService.sendTeamInvitationEmail parameters:', {
           inviteeName: full_name,
           inviterName: inviterProfile?.full_name || 'Team Admin',
           companyName: recruiterInfo?.company_name || 'Your Company',
           role: role,
           invitationUrl: invitationUrl,
           expiresAt: expiresAt.toISOString(),
           recipientEmail: email
         })
         
         const emailSent = await EmailService.sendTeamInvitationEmail({
           inviteeName: full_name,
           inviterName: inviterProfile?.full_name || 'Team Admin',
           companyName: recruiterInfo?.company_name || 'Your Company',
           role: role,
           invitationUrl: invitationUrl,
           expiresAt: expiresAt.toISOString()
         }, email)
         
         console.log('🔍 EmailService.sendTeamInvitationEmail returned:', emailSent)

        if (!emailSent) {
          console.error('Failed to send invitation email to:', email)
          // Don't fail the request, just log the error
        } else {
          console.log('✅ Team invitation email sent successfully to:', email)
          console.log('📧 Email details:', {
            to: email,
            inviteeName: full_name,
            inviterName: inviterProfile?.full_name || 'Team Admin',
            companyName: recruiterInfo?.company_name || 'Your Company',
            role: role,
            invitationUrl: invitationUrl
          })
        }
      } catch (emailError) {
        console.error('❌ Error sending invitation email to:', email, 'Error:', emailError)
        // Don't fail the request, just log the error
      }

      console.log('🎉 Team invitation process completed successfully for:', email)
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