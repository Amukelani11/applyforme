import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email-service';

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

    // Determine application type and get application data (including any stored AI analysis)
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
          ai_analysis,
          ai_analysis_updated_at,
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
          status,
          ai_analysis,
          ai_analysis_updated_at
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

    // Send rejection email with AI improvement report if requested
    if (sendEmail) {
      const candidateEmail = applicationType === 'candidate' 
        ? (applicationData.users as any)?.email 
        : applicationData.email;
      
      const candidateName = applicationType === 'candidate' 
        ? (applicationData.users as any)?.full_name 
        : applicationData.full_name;

      if (candidateEmail) {
        try {
          // Build improvement insights from stored AI analysis if available
          const analysis = applicationData.ai_analysis || null;
          const insights: string[] = [];
          const improvements: string[] = [];
          let skillsMatch = '';

          if (analysis) {
            if (Array.isArray(analysis.key_insights)) {
              insights.push(...analysis.key_insights.slice(0, 5));
            }
            if (analysis.skills_match) {
              const score = analysis.skills_match.score ?? null;
              const missing = Array.isArray(analysis.skills_match.missing_skills)
                ? analysis.skills_match.missing_skills.slice(0, 5)
                : [];
              skillsMatch = typeof score === 'number' ? `${score}%` : '';
              if (missing.length > 0) {
                improvements.push(`Build or demonstrate skills in: ${missing.join(', ')}`);
              }
            }
            if (Array.isArray(analysis.concerns) && analysis.concerns.length > 0) {
              improvements.push(...analysis.concerns.map((c: string) => `Address: ${c}`));
            }
            if (Array.isArray(analysis.next_steps) && analysis.next_steps.length > 0) {
              improvements.push(...analysis.next_steps.map((s: string) => `Next step: ${s}`));
            }
            if (Array.isArray(analysis.strengths) && analysis.strengths.length > 0) {
              insights.push(...analysis.strengths.map((s: string) => `Strength: ${s}`));
            }
          }

          // Always include recruiter-provided reasons
          const reasonItems = (reasons || []).map((r: string) => `<li>• ${r}</li>`).join('');
          const insightItems = insights.map((r: string) => `<li>• ${r}</li>`).join('');
          const improvementItems = improvements.map((r: string) => `<li>• ${r}</li>`).join('');

          const reportHtml = `
            <!doctype html>
            <html>
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Application Feedback Report</title>
                <style>
                  body { font-family: Arial, sans-serif; color:#111827; padding:24px; }
                  .header { background:#f3e8ff; border:1px solid #e9d5ff; padding:16px; border-radius:10px; margin-bottom:20px; }
                  h1 { margin:0 0 6px 0; font-size:20px; }
                  h2 { margin-top:24px; font-size:16px; }
                  .badge { display:inline-block; padding:4px 10px; background:#ede9fe; color:#6d28d9; border-radius:999px; font-size:12px; }
                  ul { margin:8px 0 0 18px; }
                  .muted { color:#6b7280; font-size:13px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Feedback on your application</h1>
                  <div class="muted">${job.company} — ${job.title}</div>
                </div>

                <p>Hi ${candidateName || 'there'},</p>
                <p>Thank you for applying. Unfortunately, this application was not successful. Please don’t lose hope — here is a personalized summary to help you improve for future opportunities.</p>

                ${skillsMatch ? `<p><span class="badge">AI Skills Match: ${skillsMatch}</span></p>` : ''}

                <h2>Reasons for this outcome</h2>
                <ul>${reasonItems || '<li>• Not specified</li>'}</ul>

                ${insightItems ? `<h2>Key insights observed</h2><ul>${insightItems}</ul>` : ''}

                ${improvementItems ? `<h2>How to improve</h2><ul>${improvementItems}</ul>` : ''}

                <p class="muted">We appreciate your interest. You can reply to this email if you have questions.</p>
              </body>
            </html>
          `;

          // Upload report HTML to storage for a shareable link
          const admin = createAdminClient();
          const reportPath = `rejection-reports/${applicationType}/${actualApplicationId}-${Date.now()}.html`;
          const { error: uploadErr } = await admin.storage
            .from('documents')
            .upload(reportPath, new Blob([reportHtml], { type: 'text/html' }), { upsert: false });

          let reportUrl: string | null = null;
          if (!uploadErr) {
            const { data: pub } = admin.storage.from('documents').getPublicUrl(reportPath);
            reportUrl = pub?.publicUrl || null;
          }

          const subject = `Your application to ${job.company} (${job.title})`;
          const htmlBody = `
            <div style="font-family:Arial,sans-serif;color:#111827">
              <p>Hi ${candidateName || 'there'},</p>
              <p>Thank you for applying to <strong>${job.title}</strong> at <strong>${job.company}</strong>. This time we won’t be progressing your application.</p>
              <p>Please don’t lose hope — we’ve prepared a brief feedback report to help you improve your chances next time.</p>
              ${reportUrl ? `<p><a href="${reportUrl}" style="display:inline-block;background:#8b5cf6;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">View your feedback report</a></p>` : ''}
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
              <p style="font-size:13px;color:#6b7280">You’re receiving this message because you applied for ${job.title}.</p>
            </div>
          `;

          await EmailService.sendCustomEmail(
            { email: candidateEmail, name: candidateName || 'Candidate' },
            subject,
            htmlBody
          );
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