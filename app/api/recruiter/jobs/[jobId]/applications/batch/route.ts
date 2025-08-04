import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient();
    const { jobId: jobIdParam } = await params;
    const jobId = parseInt(jobIdParam);
    const body = await request.json();
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const { applicationIds, action } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: 'No applications selected' }, { status: 400 });
    }

    if (!action || !['shortlisted', 'rejected', 'interview', 'offer', 'hired', 'withdrawn'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recruiter profile
    const { data: recruiter, error: recruiterError } = await supabase
      .from('recruiters')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (recruiterError || !recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    // Verify job belongs to recruiter
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('id')
      .eq('id', jobId)
      .eq('recruiter_id', recruiter.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Separate candidate and public application IDs
    const candidateIds = applicationIds
      .filter((id: string) => id.startsWith('candidate-'))
      .map((id: string) => id.replace('candidate-', ''));
    
    const publicIds = applicationIds
      .filter((id: string) => id.startsWith('public-'))
      .map((id: string) => id.replace('public-', ''));

    let updateResults: any[] = [];

    // Update candidate applications
    if (candidateIds.length > 0) {
      const { data: candidateResult, error: candidateError } = await supabase
        .from('candidate_applications')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .in('id', candidateIds)
        .eq('job_posting_id', jobId)
        .select();

      if (candidateError) {
        console.error('Error updating candidate applications:', candidateError);
      } else {
        updateResults.push(...(candidateResult || []));
      }
    }

    // Update public applications
    if (publicIds.length > 0) {
      const { data: publicResult, error: publicError } = await supabase
        .from('public_applications')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .in('id', publicIds)
        .eq('job_id', jobId)
        .select();

      if (publicError) {
        console.error('Error updating public applications:', publicError);
      } else {
        updateResults.push(...(publicResult || []));
      }
    }

    // If action is reject, send rejection emails
    if (action === 'rejected') {
      // TODO: Implement rejection email sending
      console.log('Sending rejection emails for:', applicationIds);
    }

    return NextResponse.json({
      message: `Successfully updated ${updateResults.length} applications to ${action}`,
      updated_count: updateResults.length,
      action: action
    });

  } catch (error) {
    console.error('Error performing batch action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 