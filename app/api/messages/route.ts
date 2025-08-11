import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { createCookieHandler } from '@/lib/supabase/cookie-handler';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationIdRaw = searchParams.get('applicationId');
  const applicationTypeParam = searchParams.get('type');

  if (!applicationIdRaw) {
    return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
  }
  const isPublic = applicationIdRaw.startsWith('public-') || applicationTypeParam === 'public';
  const applicationId = isPublic ? applicationIdRaw.replace(/^public-/, '') : applicationIdRaw;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: createCookieHandler(),
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (isPublic) {
      // Use candidate_notes for public applications
      const { data: notes, error: notesError } = await supabase
        .from('candidate_notes')
        .select(`
          id,
          note_text,
          created_at,
          user:users!candidate_notes_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('application_id', applicationId)
        .eq('application_type', 'public')
        .order('created_at', { ascending: true })
      if (notesError) {
        console.error('Error fetching notes:', notesError)
        return NextResponse.json({ error: 'Could not fetch notes' }, { status: 500 })
      }
      const mapped = (notes || []).map(n => ({
        id: n.id,
        content: n.note_text,
        created_at: n.created_at,
        parent_id: null,
        sender: n.user || null
      }))
      return NextResponse.json({ messages: mapped })
    }

    // Candidate applications: use conversations/messages
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (convError) {
      console.error('Error finding conversation:', convError);
      return NextResponse.json({ error: 'Could not find conversation' }, { status: 500 });
    }

    if (!conversation) {
      return NextResponse.json({ messages: [] });
    }

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Could not fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });

  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { applicationId: applicationIdRaw, content, parentId, type, conversationId: selectedConversationId } = await request.json();

  if (!applicationIdRaw || !content) {
    return NextResponse.json({ error: 'Missing applicationId or content' }, { status: 400 });
  }
  const isPublic = typeof type === 'string' ? type === 'public' : (typeof applicationIdRaw === 'string' && applicationIdRaw.startsWith('public-'));
  const applicationId = isPublic ? String(applicationIdRaw).replace(/^public-/, '') : String(applicationIdRaw);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: createCookieHandler(),
    }
  );

  const { data: { user: sender }, error: authError } = await supabase.auth.getUser();

  if (authError || !sender) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Public applications: store note in candidate_notes instead of conversations
  if (isPublic) {
    try {
      // Resolve recruiter_id for the sender
      const { data: recruiter } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', sender.id)
        .maybeSingle()
      const recruiterId = recruiter?.id || null

      const { data: note, error: noteError } = await supabase
        .from('candidate_notes')
        .insert({
          application_id: applicationId,
          application_type: 'public',
          user_id: sender.id,
          recruiter_id: recruiterId,
          note_text: content,
          note_type: 'general',
          is_private: false
        })
        .select('id, created_at')
        .maybeSingle()

      if (noteError) {
        console.error('Error adding public note:', noteError)
        return NextResponse.json({ error: 'Could not add note' }, { status: 500 })
      }

      // Optionally also mirror into a selected team conversation if provided
      if (selectedConversationId) {
        await supabase.from('team_messages').insert({
          conversation_id: selectedConversationId,
          sender_id: sender.id,
          message_text: content,
          message_type: 'text'
        })
      }

      return NextResponse.json({
        success: true,
        message: {
          id: note?.id,
          content,
          created_at: note?.created_at,
          sender: { id: sender.id, full_name: sender.user_metadata?.full_name || null, email: sender.email }
        }
      })
    } catch (e) {
      console.error('public note failure:', e)
      return NextResponse.json({ error: 'Could not add note' }, { status: 500 })
    }
  }

  // Candidate applications: conversations/messages flow
  // 1. Find or create the conversation
  let conversationId = selectedConversationId || null
  if (!conversationId) {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('application_id', applicationId)
      .maybeSingle();
    if (convError) {
      console.error('Error finding conversation:', convError);
      return NextResponse.json({ error: 'Could not find conversation' }, { status: 500 });
    }
    if (!conversation) {
      const { data: newConversation, error: newConvError } = await supabase
        .from('conversations')
        .insert({ application_id: applicationId })
        .select('id')
        .single();
      if (newConvError) {
        console.error('Error creating conversation:', newConvError);
        return NextResponse.json({ error: 'Could not create conversation' }, { status: 500 });
      }
      conversationId = newConversation.id;
    } else {
      conversationId = conversation.id
    }
  }

  // 2. Insert the message
  const messageData: any = {
    conversation_id: conversationId,
    sender_id: sender.id,
    content,
  };

  if (parentId) messageData.parent_id = parentId;

  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert(messageData)
    .select(`
      *,
      sender:users!messages_sender_id_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .single();

  if (messageError) {
    console.error('Error sending message:', messageError);
    return NextResponse.json({ error: 'Could not send message' }, { status: 500 });
  }

  // 3. Send email notification to team members (if this is a team message)
  try {
    // Get the application and job details
    const { data: appData, error: appError } = await supabase
      .from('candidate_applications')
      .select(`
        *,
        job_postings!candidate_applications_job_posting_id_fkey(
          *,
          recruiter:recruiters!job_postings_recruiter_id_fkey(
            *,
            user:users!recruiters_user_id_fkey(*)
          )
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError) {
      // Try public applications table
       const { data: publicAppData, error: publicAppError } = await supabase
        .from('public_applications')
        .select(`
          *,
          job_postings!public_applications_job_id_fkey(
            *,
            recruiter:recruiters!job_postings_recruiter_id_fkey(
              *,
              user:users!recruiters_user_id_fkey(*)
            )
          )
        `)
        .eq('id', applicationId)
        .single();

      if (publicAppError) {
        console.error('Could not find application for notification:', appError, publicAppError);
      } else {
        // Send notification to recruiter
        const recruiter = publicAppData.job_postings.recruiter.user;
        const job = publicAppData.job_postings;
        
        await EmailService.sendTeamMessageNotification({
          senderName: sender.user_metadata?.full_name || sender.email || 'Team Member',
          jobTitle: job.title,
          candidateName: publicAppData.full_name || 'Candidate',
          messageContent: content,
          applicationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/recruiter/jobs/${job.id}/applications/${applicationId}`,
          applicationId: applicationId
        }, { name: recruiter.full_name || 'Recruiter', email: recruiter.email });
      }
    } else {
      // Send notification to recruiter
      const recruiter = appData.job_postings.recruiter.user;
      const job = appData.job_postings;
      
      await EmailService.sendTeamMessageNotification({
        senderName: sender.user_metadata?.full_name || sender.email || 'Team Member',
        jobTitle: job.title,
        candidateName: appData.candidate?.full_name || 'Candidate',
        messageContent: content,
        applicationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/recruiter/jobs/${job.id}/applications/${applicationId}`,
        applicationId: applicationId
      }, { name: recruiter.full_name || 'Recruiter', email: recruiter.email });
    }

  } catch (emailError) {
    console.error('Failed to send notification email:', emailError);
    // Do not fail the request if email fails, but log it.
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Message sent successfully',
    messageData: message,
    sender: message.sender
  });
} 