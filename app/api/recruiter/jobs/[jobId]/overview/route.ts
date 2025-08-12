import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

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

    // Get job data (including recruiter company_slug for public link generation)
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('*, view_count, recruiter:recruiters ( company_slug )')
      .eq('id', jobId)
      .eq('recruiter_id', recruiter.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Get analytics data
    const baseAnalytics = await getJobAnalytics(supabase, jobId);

    // Use actual view_count from the job record for total views and compute conversion
    const actualViews = (job as any)?.view_count ?? 0;
    const totalApplications = baseAnalytics.total_applications || 0;
    const computedConversion = actualViews > 0 ? (totalApplications / actualViews) * 100 : 0;
    const analytics = {
      ...baseAnalytics,
      total_views: actualViews,
      conversion_rate: computedConversion,
    };

    // Get automation settings
    const { data: automationSettings } = await supabase
      .from('job_automation_settings')
      .select('*')
      .eq('job_id', jobId)
      .single();

    // Generate public link if not exists (use recruiter.company_slug and computed job slug)
    let publicLink = (job as any).public_link as string | undefined;
    if (!publicLink && job.allow_public_applications) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
      const companySlug = (job as any)?.recruiter?.company_slug || slugify((job as any).company || '') || 'company';
      const jobSlugWithId = `${slugify((job as any).title || '')}-${job.id}`;
      publicLink = `${baseUrl}/jobs/public/${companySlug}/${jobSlugWithId}`;
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