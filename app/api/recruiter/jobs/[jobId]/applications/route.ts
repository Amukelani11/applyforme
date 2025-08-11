import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId: jobIdParam } = await params;
    const jobId = parseInt(jobIdParam);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a recruiter and owns this job
    const { data: recruiterData } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!recruiterData) {
      return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 });
    }

    // Verify job ownership
    const { data: jobData } = await supabase
      .from('job_postings')
      .select('id, title, company')
      .eq('id', jobId)
      .eq('recruiter_id', recruiterData.id)
      .single();

    if (!jobData) {
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
    }

    // Fetch candidate applications
    const { data: candidateApps, error: candidateAppsError } = await supabase
      .from('candidate_applications')
      .select(`
        *,
        user:users(
          full_name,
          email
        )
      `)
      .eq('job_posting_id', jobId)
      .order('created_at', { ascending: false });

    if (candidateAppsError) {
      console.error('Error fetching candidate applications:', candidateAppsError);
      return NextResponse.json({ error: 'Failed to fetch candidate applications' }, { status: 500 });
    }

    // Fetch public applications
    const { data: publicApps, error: publicAppsError } = await supabase
      .from('public_applications')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (publicAppsError) {
      console.error('Error fetching public applications:', publicAppsError);
      return NextResponse.json({ error: 'Failed to fetch public applications' }, { status: 500 });
    }

    // Format public applications to match candidate application structure
    const formattedPublicApps = (publicApps || []).map((app: any) => ({
      ...app,
      id: `public-${app.id}`,
      candidate_name: app.full_name || app.name,
      candidate_email: app.email,
      status: 'new',
      ai_score: 0,
      is_public: true,
      is_read: app.is_read || false,
      user: {
        full_name: app.full_name || app.name,
        email: app.email
      }
    }));

    // Combine and sort all applications
    const allApplications = [...(candidateApps || []), ...formattedPublicApps];
    allApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Count applications by status
    const applicationsByStatus = {
      new: allApplications.filter(app => app.status === 'new').length,
      shortlisted: allApplications.filter(app => app.status === 'shortlisted').length,
      rejected: allApplications.filter(app => app.status === 'rejected').length,
      interviewed: allApplications.filter(app => app.status === 'interviewed').length
    };

    return NextResponse.json({
      applications: allApplications,
      total: allApplications.length,
      candidate_count: candidateApps?.length || 0,
      public_count: publicApps?.length || 0,
      applications_by_status: applicationsByStatus,
      job: { id: jobData.id, title: jobData.title, company: (jobData as any).company || null }
    });

  } catch (error) {
    console.error('Error in applications route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 