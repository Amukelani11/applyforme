import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createClient();
    const { jobId: jobIdParam } = await params;
    const jobId = parseInt(jobIdParam);
    
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

    // Get job data
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .eq('recruiter_id', recruiter.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Get analytics data
    const analytics = await getJobAnalytics(supabase, jobId);

    // Get automation settings
    const { data: automationSettings } = await supabase
      .from('job_automation_settings')
      .select('*')
      .eq('job_id', jobId)
      .single();

    // Generate public link if not exists
    let publicLink = job.public_link;
    if (!publicLink && job.allow_public_applications) {
      publicLink = `${process.env.NEXT_PUBLIC_APP_URL}/jobs/public/${job.company_slug}/${job.slug_with_id}`;
    }

    return NextResponse.json({
      job: {
        ...job,
        public_link: publicLink
      },
      analytics,
      automation: automationSettings || {
        auto_reject_enabled: false,
        auto_reject_threshold: 60,
        auto_shortlist_enabled: false,
        auto_shortlist_threshold: 80
      }
    });

  } catch (error) {
    console.error('Error fetching job overview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getJobAnalytics(supabase: any, jobId: number) {
  try {
    // Get total applications (both candidate and public)
    const { count: candidateApplications } = await supabase
      .from('candidate_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_posting_id', jobId);

    const { count: publicApplications } = await supabase
      .from('public_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    const totalApplications = (candidateApplications || 0) + (publicApplications || 0);

    // Get applications by status
    const { data: candidateStatus } = await supabase
      .from('candidate_applications')
      .select('status')
      .eq('job_posting_id', jobId);

    const { data: publicStatus } = await supabase
      .from('public_applications')
      .select('status')
      .eq('job_id', jobId);

    const allStatuses = [...(candidateStatus || []), ...(publicStatus || [])];
    const applicationsByStatus = {
      new: allStatuses.filter(app => app.status === 'new' || !app.status).length,
      shortlisted: allStatuses.filter(app => app.status === 'shortlisted').length,
      rejected: allStatuses.filter(app => app.status === 'rejected').length,
      interviewed: allStatuses.filter(app => app.status === 'interviewed').length
    };

    // Mock data for views and trends (in a real app, you'd track this)
    const totalViews = Math.floor(totalApplications * 8.5); // Mock conversion rate
    const conversionRate = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

    // Mock trend data (last 7 days)
    const viewsTrend = Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 20);
    const applicationsTrend = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10) + 2);

    // Mock top skills (in a real app, you'd analyze CVs)
    const topSkills = [
      'JavaScript', 'React', 'TypeScript', 'Node.js', 'Python',
      'SQL', 'AWS', 'Docker', 'Git', 'REST APIs'
    ].slice(0, Math.floor(Math.random() * 5) + 3);

    return {
      total_applications: totalApplications,
      total_views: totalViews,
      conversion_rate: conversionRate,
      applications_by_status: applicationsByStatus,
      views_trend: viewsTrend,
      applications_trend: applicationsTrend,
      top_skills: topSkills
    };

  } catch (error) {
    console.error('Error calculating analytics:', error);
    return {
      total_applications: 0,
      total_views: 0,
      conversion_rate: 0,
      applications_by_status: { new: 0, shortlisted: 0, rejected: 0, interviewed: 0 },
      views_trend: [],
      applications_trend: [],
      top_skills: []
    };
  }
} 