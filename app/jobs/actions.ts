'use server'

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { EmailService } from '@/lib/email-service';

const workExperienceSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  duration: z.string().optional(),
  currently_working: z.boolean().optional(),
}).refine(data => data.currently_working || (data.duration && data.duration.length > 0), {
    message: "Duration is required unless you are currently working here.",
    path: ["duration"],
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  duration: z.string().min(1, 'Duration is required'),
  qualification_file_path: z.string().optional(),
});

const applicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  coverLetter: z.string().optional(),
  cv_path: z.string().min(1, "CV is required."),
  workExperience: z.array(workExperienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  customFields: z.record(z.any()).optional(),
});

type ApplicationData = z.infer<typeof applicationSchema>;

export async function createSignedUploadUrl(jobId: number, fileName: string, applicantEmail: string) {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const filePath = `public-applications/${jobId}/${applicantEmail}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUploadUrl(filePath);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }
    
    return { ...data, success: true };

  } catch (error) {
    console.error('Error creating signed URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function detailedApply(jobId: number, applicationData: ApplicationData) {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fullName = `${applicationData.firstName} ${applicationData.lastName}`;

    console.log('Application data to submit:', {
      job_id: jobId,
      full_name: fullName,
      email: applicationData.email,
      phone_number: applicationData.phoneNumber,
      cover_letter: applicationData.coverLetter || '',
      cv_path: applicationData.cv_path,
      work_experience: applicationData.workExperience || [],
      education: applicationData.education || [],
    });

    // Use the atomic RPC function that handles both increment and insert
    const { error: rpcError } = await supabaseAdmin.rpc('increment_public_app_count_and_insert_detailed', {
      p_job_id: jobId,
      p_full_name: fullName,
      p_email: applicationData.email,
      p_cv_path: applicationData.cv_path,
      p_phone_number: applicationData.phoneNumber,
      p_cover_letter: applicationData.coverLetter || '',
      p_work_experience: JSON.stringify(applicationData.workExperience || []),
      p_education: JSON.stringify(applicationData.education || [])
    });

    if (rpcError) {
      console.error('RPC function error:', JSON.stringify(rpcError, null, 2));
      throw new Error(`Failed to save application: ${rpcError.message}`);
    }

    // Get the application ID for custom fields insertion
    const { data: insertedApplication, error: appError } = await supabaseAdmin
      .from('public_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('email', applicationData.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Handle custom fields if they exist
    if (applicationData.customFields && Object.keys(applicationData.customFields).length > 0 && insertedApplication) {
      const { error: customFieldsError } = await supabaseAdmin.rpc('insert_custom_field_responses', {
        p_application_id: insertedApplication.id,
        p_custom_fields: applicationData.customFields
      });

      if (customFieldsError) {
        console.error('Error inserting custom field responses:', customFieldsError);
      }
    }

    // --- Recruiter Notification ---
    // 1. Fetch job posting to get recruiter_id and job details
    const { data: job, error: jobError } = await supabaseAdmin
      .from('job_postings')
      .select('id, title, company, recruiter_id, location, job_type, salary_range, created_at')
      .eq('id', jobId)
      .single();

    if (!job || jobError) {
      console.error('Could not fetch job posting for recruiter notification:', jobError);
      return { success: true };
    }

    // 2. Get recruiter info
    const recruiter = await EmailService.getRecruiterInfo(job.recruiter_id);
    if (!recruiter) {
      console.error('Could not fetch recruiter info for notification');
      return { success: true };
    }

    // 3. Build ApplicationData for email template
    const applicationEmailData = {
      id: 0, // Not needed for email
      candidate_name: fullName,
      candidate_email: applicationData.email,
      job_title: job.title,
      company: job.company,
      applied_date: new Date().toISOString(),
      cv_url: applicationData.cv_path || '',
    };

    // 4. Send notification
    await EmailService.sendApplicationAlert(applicationEmailData, recruiter);
    // --- End Recruiter Notification ---
    
    return { success: true };
  } catch (error) {
    console.error('Error in detailedApply:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

export async function fastApply(jobId: number, userId: string) {
    const supabase = await createClient();

    try {
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('cv_path, first_name, last_name, phone_number, email')
            .eq('id', userId)
            .single();

        if (profileError || !userProfile) {
            throw new Error('Could not retrieve user profile.');
        }

        if (!userProfile.cv_path) {
            throw new Error('Your profile is incomplete. Please upload a CV before using fast apply.');
        }

        const applicationData = {
            job_id: jobId,
            user_id: userId,
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
            email: userProfile.email,
            phone_number: userProfile.phone_number,
            cv_path: userProfile.cv_path,
        };

        const { error: applicationError } = await supabase
            .from('detailed_applications')
            .insert(applicationData);
        
        if (applicationError) {
            throw new Error(`Failed to submit application: ${applicationError.message}`);
        }
        
        return { success: true };

    } catch (error) {
        console.error("Error during fast apply:", error);
        return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." };
    }
}