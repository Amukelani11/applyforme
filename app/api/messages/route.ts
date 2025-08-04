import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { createCookieHandler } from '@/lib/supabase/cookie-handler';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get('applicationId');

  if (!applicationId) {
    return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
  }

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
    // Find the conversation for this application
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('application_id', applicationId)
      .single();

    if (convError && convError.code !== 'PGRST116') {
      console.error('Error finding conversation:', convError);
      return NextResponse.json({ error: 'Could not find conversation' }, { status: 500 });
    }

    if (!conversation) {
      return NextResponse.json({ messages: [] });
    }

    // Fetch all messages for this conversation with sender information
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
  const { applicationId, content, parentId } = await request.json();

  if (!applicationId || !content) {
    return NextResponse.json({ error: 'Missing applicationId or content' }, { status: 400 });
  }

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

  // 1. Find or create the conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('application_id', applicationId)
    .single();

  let conversationId = conversation?.id;

  if (convError && convError.code !== 'PGRST116') { // PGRST116: 'exact one row not found'
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
  }

  if (!conversationId) {
    return NextResponse.json({ error: 'Conversation ID not found' }, { status: 500 });
  }

  // 2. Insert the message
  const messageData: any = {
    conversation_id: conversationId,
    sender_id: sender.id,
    content,
  };

  // Add parent_id if this is a reply
  if (parentId) {
    messageData.parent_id = parentId;
  }

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