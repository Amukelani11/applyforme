import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Create a new team conversation and add members
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    let { data: { user }, error: authError } = await supabase.auth.getUser()

    // Fallback to session if getUser fails
    if (authError || !user) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = session.user
    }
    console.log('[team/conversations] POST user:', user.id)

    const body = await request.json()
    const participants: string[] = Array.isArray(body?.participants) ? body.participants : []
    const name: string | null = body?.name || null
    console.log('[team/conversations] Payload participants:', participants)
    console.log('[team/conversations] Payload name:', name)

    if (participants.length === 0) {
      return NextResponse.json({ error: 'No participants provided' }, { status: 400 })
    }

    // Resolve recruiter context for creator
    let recruiterId: string | null = null
    const { data: ownerRecruiter } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (ownerRecruiter?.id) {
      recruiterId = ownerRecruiter.id
      console.log('[team/conversations] Owner recruiter found:', recruiterId)
    } else {
      const { data: membership } = await supabase
        .from('team_members')
        .select('recruiter_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
      recruiterId = membership?.recruiter_id || null
      console.log('[team/conversations] Membership recruiter resolved:', recruiterId)
    }

    if (!recruiterId) {
      return NextResponse.json({ error: 'Recruiter context not found' }, { status: 403 })
    }

    // Server-side authorization check (mirrors RLS policy)
    let isAuthorized = false
    if (ownerRecruiter?.id === recruiterId) {
      isAuthorized = true
    } else {
      const { data: activeMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('recruiter_id', recruiterId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
      isAuthorized = !!activeMember
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('[team/conversations] Using recruiterId:', recruiterId)
    // Create conversation via SECURITY DEFINER function to avoid RLS insert blocks
    const { data: createdIdRow, error: fnError } = await supabase
      .rpc('create_team_conversation', { _participants: participants, _name: name || null })

    if (fnError || !createdIdRow) {
      console.error('[team/conversations] RPC error:', fnError)
      return NextResponse.json({ error: fnError?.message || 'Failed to create conversation' }, { status: 500 })
    }
    console.log('[team/conversations] Conversation created with id:', createdIdRow)
    return NextResponse.json({ id: createdIdRow as unknown as string })
  } catch (error: any) {
    console.error('[team/conversations] Uncaught error:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

// Optionally, fetch the conversation with members/messages
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Ensure the requester is a member
    const { data: membership } = await supabase
      .from('team_conversation_members')
      .select('id')
      .eq('conversation_id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: conversation, error } = await supabase
      .from('team_conversations')
      .select('id, conversation_name, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error || !conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ conversation })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}


