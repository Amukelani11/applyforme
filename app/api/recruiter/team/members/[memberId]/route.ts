import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const { full_name, role, status } = body

    // Update team member
    const { data: updatedMember, error: updateError } = await supabase
      .from('team_members')
      .update({
        role: role || undefined,
        status: status || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('recruiter_id', recruiter.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating team member:', updateError)
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
    }

    // If full_name is provided, update the user profile
    if (full_name) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ full_name })
        .eq('id', updatedMember.user_id)

      if (userUpdateError) {
        console.error('Error updating user profile:', userUpdateError)
        // Don't fail the request, just log the error
      }
    }

    // Log activity
    await supabase
      .from('team_activity_log')
      .insert({
        recruiter_id: recruiter.id,
        user_id: user.id,
        action_type: 'role_changed',
        action_details: {
          member_id: memberId,
          old_role: updatedMember.role,
          new_role: role,
          old_status: updatedMember.status,
          new_status: status
        }
      })

    return NextResponse.json({ 
      message: 'Team member updated successfully',
      teamMember: updatedMember
    })

  } catch (error) {
    console.error('Error in team member update route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Get the member to be removed
    const { data: memberToRemove, error: getError } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .eq('recruiter_id', recruiter.id)
      .single()

    if (getError || !memberToRemove) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Prevent removing the last admin
    if (memberToRemove.role === 'admin') {
      const { count: adminCount, error: countError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('recruiter_id', recruiter.id)
        .eq('role', 'admin')
        .eq('status', 'active')

      if (countError) {
        console.error('Error counting admins:', countError)
        return NextResponse.json({ error: 'Failed to verify admin count' }, { status: 500 })
      }

      if (adminCount && adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 })
      }
    }

    // Remove team member
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('recruiter_id', recruiter.id)

    if (deleteError) {
      console.error('Error removing team member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('team_activity_log')
      .insert({
        recruiter_id: recruiter.id,
        user_id: user.id,
        action_type: 'member_removed',
        action_details: {
          removed_member_id: memberToRemove.user_id,
          removed_member_role: memberToRemove.role
        }
      })

    return NextResponse.json({ 
      message: 'Team member removed successfully'
    })

  } catch (error) {
    console.error('Error in team member delete route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 