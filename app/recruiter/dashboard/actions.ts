"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"

export async function updateRecruiterProfile(userId: string, formData: FormData) {
  const companyName = formData.get("companyName") as string
  const companyWebsite = formData.get("companyWebsite") as string

  if (!userId) {
    return { success: false, error: "User not found" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("recruiters")
    .update({
      company_name: companyName,
      company_website: companyWebsite,
    })
    .eq("user_id", userId)

  if (error) {
    console.error("Error updating recruiter profile:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/recruiter/dashboard/settings")
  return { success: true }
}

export async function updateJob(jobId: string, formData: FormData) {
  const {
    job_title,
    job_description,
    location,
    salary_range,
    contract_term,
    salary_type,
    application_deadline,
    is_public,
    public_application_limit,
  } = Object.fromEntries(formData.entries())

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("job_postings")
    .update({
      job_title,
      job_description,
      location,
      salary_range,
      contract_term,
      salary_type,
      application_deadline: application_deadline || null,
      is_public: is_public === "on",
      public_application_limit: public_application_limit
        ? parseInt(public_application_limit as string, 10)
        : null,
    })
    .eq("id", jobId)
    .select("share_id, company_slug, job_slug")
    .single()

  if (error) {
    console.error("Error updating job:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/recruiter/jobs/${jobId}/edit`)
  revalidatePath(`/recruiter/dashboard`)

  return { success: true, updatedJob: data }
}

export async function updateJobSharing(jobId: number, allowPublic: boolean) {
  const supabase = await createClient()
  try {
    let publicShareId: string | null = null;

    // If enabling public applications, ensure a share ID exists
    if (allowPublic) {
      const { data: existingJob, error: fetchError } = await supabase
        .from('job_postings')
        .select('public_share_id')
        .eq('id', jobId)
        .single();

      if (fetchError) throw fetchError;

      if (existingJob && !existingJob.public_share_id) {
        publicShareId = nanoid(12); // Generate a new ID
      } else if (existingJob) {
        publicShareId = existingJob.public_share_id;
      }
    }

    const updateData: { allow_public_applications: boolean; public_share_id?: string } = {
      allow_public_applications: allowPublic,
    };

    if (publicShareId) {
      updateData.public_share_id = publicShareId;
    }

    const { data, error } = await supabase
      .from("job_postings")
      .update(updateData)
      .eq("id", jobId)
      .select("id, public_share_id, allow_public_applications, public_application_count")
      .single()

    if (error) {
      console.error("Error updating job sharing:", error)
      return { error: error.message }
    }

    revalidatePath("/recruiter/dashboard")
    revalidatePath(`/recruiter/jobs/${jobId}/edit`)

    return { data }
  } catch (error: any) {
    console.error("Error in updateJobSharing:", error)
    return { error: "An unexpected error occurred." }
  }
}

export async function bulkUpdateJobStatus(jobIds: number[], isActive: boolean) {
  'use server'
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: recruiter, error: recruiterError } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    if (recruiterError) throw recruiterError;

    const { data, error } = await supabase
      .from('job_postings')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .in('id', jobIds)
      .eq('recruiter_id', recruiter.id)
      .select('id, is_active');

    if (error) throw error;
    
    revalidatePath('/recruiter/dashboard');
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function bulkDeleteJobs(jobIds: number[]) {
    'use server'
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: recruiter, error: recruiterError } = await supabase
            .from('recruiters')
            .select('id')
            .eq('user_id', user.id)
            .single();
        
        if (recruiterError) throw recruiterError;

        const { error } = await supabase
            .from('job_postings')
            .delete()
            .in('id', jobIds)
            .eq('recruiter_id', recruiter.id)

        if (error) throw error;
        
        revalidatePath('/recruiter/dashboard');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
  }
} 