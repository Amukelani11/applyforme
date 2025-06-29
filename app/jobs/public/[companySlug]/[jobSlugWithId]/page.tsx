// This file contains both the Server Component for data fetching
// and the Client Component for interactivity.

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PublicJobView } from "../../_components/public-job-view"
import { slugify } from "@/lib/utils"


// 1. --- DATA FETCHING (SERVER-SIDE) ---
// This happens on the server only.
async function getPageData(companySlug: string, jobSlugWithId: string) {
    const supabase = await createClient()
    const jobId = jobSlugWithId.split("-").pop()

    if (!jobId || isNaN(Number(jobId))) {
        return { job: null, userProfile: null };
    }

    // Fetch job details
    const { data: job, error: jobError } = await supabase
        .from("job_postings")
        .select(`
            id, title, location, job_type, contract_term, salary_range, salary_type, description, requirements, benefits, application_deadline, public_application_count,
            recruiter:recruiters ( company_name, company_slug )
        `)
        .eq("id", Number(jobId))
        .eq("allow_public_applications", true)
        .eq("recruiters.company_slug", companySlug)
        .single()

    if (jobError || !job) {
        console.error("Error fetching public job:", jobError?.message)
        return { job: null, userProfile: null };
    }
    
    const typedJob = job as any as {
        id: number;
        title: string;
        location: string;
        job_type: string;
        contract_term: string;
        salary_range: string;
        salary_type: string;
        description: string | null;
        requirements: string | null;
        benefits: string | null;
        application_deadline: string | null;
        public_application_count: number;
        recruiter: {
            company_name: string | null;
            company_slug: string | null;
        } | null;
    };
    
    const limitReached = typedJob.public_application_count >= 5;
    const jobWithLimit = { 
        ...typedJob, 
        job_slug: slugify(typedJob.title),
        limitReached 
    };

    // Check for logged-in user and completed profile
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return { job: jobWithLimit, userProfile: null };
    }
    
    const { data: cvDocument, error: cvError } = await supabase
        .from('documents')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('type', 'cv')
        .limit(1)
        .single();
        
    const userProfile = {
        isLoggedIn: true,
        isProfileComplete: !!cvDocument,
        userId: session.user.id,
    }

    return { job: jobWithLimit, userProfile };
}


// 2. --- SERVER COMPONENT (DEFAULT EXPORT) ---
// This is the main component for the page. It fetches data and passes
// it to the client component.
export default async function PublicJobPage({ params }: { params: { companySlug: string; jobSlugWithId: string }}) {
  const { job, userProfile } = await getPageData(params.companySlug, params.jobSlugWithId)

  if (!job) {
    notFound()
  }

  return <PublicJobView job={job} userProfile={userProfile} />
} 