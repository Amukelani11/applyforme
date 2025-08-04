import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string; applicationId: string }> }
) {
  try {
    const supabase = await createClient();
    const { jobId: jobIdParam, applicationId } = await params;
    const jobId = parseInt(jobIdParam);
    const body = await request.json();
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const { reasons, customMessage, sendEmail } = body;

    if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
      return NextResponse.json({ error: 'Rejection reasons are required' }, { status: 400 });
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
      .select('id, title, company')
      .eq('id', jobId)
      .eq('recruiter_id', recruiter.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Determine application type and get application data
    let applicationData: any = null;
    let applicationType: 'candidate' | 'public' = 'candidate';
    let actualApplicationId = applicationId;

    if (applicationId.startsWith('candidate-')) {
      actualApplicationId = applicationId.replace('candidate-', '');
      const { data: candidateApp, error: candidateError } = await supabase
        .from('candidate_applications')
        .select(`
          id,
          user_id,
          status,
          users (
            full_name,
            email
          )
        `)
        .eq('id', actualApplicationId)
        .eq('job_posting_id', jobId)
        .single();

      if (candidateError) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      applicationData = candidateApp;
      applicationType = 'candidate';
    } else if (applicationId.startsWith('public-')) {
      actualApplicationId = applicationId.replace('public-', '');
      const { data: publicApp, error: publicError } = await supabase
        .from('public_applications')
        .select(`
          id,
          full_name,
          email,
          status
        `)
        .eq('id', actualApplicationId)
        .eq('job_id', jobId)
        .single();

      if (publicError) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      applicationData = publicApp;
      applicationType = 'public';
    } else {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 });
    }

    // Update application status to rejected
    let updateResult;
    if (applicationType === 'candidate') {
      const { data: result, error: updateError } = await supabase
        .from('candidate_applications')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', actualApplicationId)
        .eq('job_posting_id', jobId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      updateResult = result;
    } else {
      const { data: result, error: updateError } = await supabase
        .from('public_applications')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', actualApplicationId)
        .eq('job_id', jobId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      updateResult = result;
    }

    // Send rejection email if requested
    if (sendEmail) {
      const candidateEmail = applicationType === 'candidate' 
        ? (applicationData.users as any)?.email 
        : applicationData.email;
      
      const candidateName = applicationType === 'candidate' 
        ? (applicationData.users as any)?.full_name 
        : applicationData.full_name;

      if (candidateEmail) {
        try {
          // TODO: Implement email sending using your email service
          // This is a placeholder for the email sending logic
          console.log('Sending rejection email to:', candidateEmail);
          console.log('Job:', job.title);
          console.log('Company:', job.company);
          console.log('Reasons:', reasons);
          console.log('Custom message:', customMessage);
          
          // Example email sending (replace with your actual email service)
          // await sendRejectionEmail({
          //   to: candidateEmail,
          //   candidateName: candidateName,
          //   jobTitle: job.title,
          //   companyName: job.company,
          //   reasons: reasons,
          //   customMessage: customMessage
          // });
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError);
          // Don't fail the entire request if email fails
        }
      }
    }

    // Log the rejection for audit purposes
    await supabase
      .from('application_activity_logs')
      .insert({
        application_id: actualApplicationId,
        application_type: applicationType,
        action: 'rejected',
        performed_by: user.id,
        details: {
          reasons: reasons,
          custom_message: customMessage,
          send_email: sendEmail
        },
        created_at: new Date().toISOString()
      })
      .select();

    return NextResponse.json({
      message: 'Application rejected successfully',
      application_id: applicationId,
      status: 'rejected',
      email_sent: sendEmail
    });

  } catch (error) {
    console.error('Error rejecting application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 