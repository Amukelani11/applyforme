import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = await createClient();
    const jobId = parseInt(params.jobId);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
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
      .select('id, title')
      .eq('id', jobId)
      .eq('recruiter_id', recruiter.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Delete the job (this will cascade to related records due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', jobId)
      .eq('recruiter_id', recruiter.id);

    if (deleteError) {
      console.error('Error deleting job:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Job deleted successfully',
      deletedJob: { id: jobId, title: job.title }
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 