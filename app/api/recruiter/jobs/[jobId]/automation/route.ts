import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = await createClient();
    const jobId = parseInt(params.jobId);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }
    const body = await request.json();

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

    // Check if automation settings exist
    const { data: existingSettings } = await supabase
      .from('job_automation_settings')
      .select('*')
      .eq('job_id', jobId)
      .single();

    const automationData = {
      job_id: jobId,
      auto_reject_enabled: body.auto_reject_enabled || false,
      auto_reject_threshold: body.auto_reject_threshold || 60,
      auto_shortlist_enabled: body.auto_shortlist_enabled || false,
      auto_shortlist_threshold: body.auto_shortlist_threshold || 80,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('job_automation_settings')
        .update(automationData)
        .eq('job_id', jobId)
        .select()
        .single();
    } else {
      // Create new settings
      result = await supabase
        .from('job_automation_settings')
        .insert(automationData)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error updating automation settings:', result.error);
      return NextResponse.json(
        { error: 'Failed to update automation settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Automation settings updated successfully',
      settings: result.data
    });

  } catch (error) {
    console.error('Error updating automation settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 