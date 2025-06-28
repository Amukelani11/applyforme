// This file contains both the Server Component for data fetching
// and the Client Component for interactivity.

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, MapPin, DollarSign, Calendar, CheckCircle } from "lucide-react"
import { PublicApplicationForm } from "../../_components/public-application-form"
import React, { useState } from "react"


// 1. --- DATA FETCHING (SERVER-SIDE) ---
// This happens on the server only.
async function getJobDetails(companySlug: string, jobSlugWithId: string) {
    const supabase = createServerComponentClient({ cookies })
    const jobId = jobSlugWithId.split("-").pop()

    if (!jobId || isNaN(Number(jobId))) {
        return null
    }

    const { data: job, error } = await supabase
        .from("job_postings")
        .select(`
            id, title, location, job_type, contract_term, salary_range, salary_type, job_description, application_deadline, public_application_count,
            recruiter:recruiters ( company_name, company_slug )
        `)
        .eq("id", Number(jobId))
        .eq("allow_public_applications", true)
        // Note: Supabase TS types might not understand the join syntax for filtering perfectly.
        // This is a common Supabase pattern.
        .eq("recruiters.company_slug", companySlug)
        .single()

    if (error || !job) {
        console.error("Error fetching public job:", error?.message)
        return null
    }
    
    // The query returns the recruiter as an object because of .single(), not an array.
    // We cast to the correct type to help TypeScript.
    const typedJob = job as any as {
        id: number;
        title: string;
        location: string;
        job_type: string;
        contract_term: string;
        salary_range: string;
        salary_type: string;
        job_description: string | null;
        application_deadline: string | null;
        public_application_count: number;
        recruiter: { // Not an array
            company_name: string | null;
            company_slug: string | null;
        } | null;
    };
    
    const limitReached = typedJob.public_application_count >= 5;

    return { ...typedJob, limitReached };
}

// Define the type for the props the client component will receive.
// This must be serializable.
type PublicJobViewProps = {
  job: NonNullable<Awaited<ReturnType<typeof getJobDetails>>>
}


// 2. --- SERVER COMPONENT (DEFAULT EXPORT) ---
// This is the main component for the page. It fetches data and passes
// it to the client component.
export default async function PublicJobPage({ params }: { params: { companySlug: string; jobSlugWithId: string }}) {
  const job = await getJobDetails(params.companySlug, params.jobSlugWithId)

  if (!job) {
    notFound()
  }

  return <PublicJobView job={job} />
}


// 3. --- CLIENT COMPONENT ---
// This component handles all user interaction (state, forms).
'use client'
function PublicJobView({ job }: PublicJobViewProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { limitReached, recruiter, application_deadline } = job;

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  const formattedDeadline = application_deadline
    ? new Date(application_deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not specified';
    
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h1>
            <p className="text-gray-600">
                Your application for the {job.title} position has been successfully sent to {recruiter?.company_name || 'the recruiter'}.
            </p>
        </div>
      </div>
    );
  }

  if (limitReached) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Applications Closed</h1>
                <p className="text-gray-600">
                    This job is no longer accepting public applications. Thank you for your interest.
                </p>
            </div>
         </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Job Details Section */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{job.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{recruiter?.company_name}</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="secondary" className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location}</Badge>
                <Badge variant="secondary" className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.job_type}</Badge>
                <Badge variant="secondary" className="flex items-center gap-2"><Clock className="w-4 h-4" /> {job.contract_term}</Badge>
                <Badge variant="secondary" className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> {job.salary_range} ({job.salary_type})</Badge>
            </div>

            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: job.job_description || '' }} />
            
             <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Application Deadline
                </h3>
                <p className="text-gray-600 mt-2">{formattedDeadline}</p>
            </div>
        </div>

        {/* Application Form Section */}
        <div className="md:col-span-1">
          <PublicApplicationForm jobId={job.id} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
} 