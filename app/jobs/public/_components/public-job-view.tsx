'use client'

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, MapPin, DollarSign, Calendar, CheckCircle, FileText, Star, Zap, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fastApply } from "../../actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"

type UserProfile = {
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  userId: string;
} | null;

type PublicJobViewProps = {
  job: {
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
    limitReached: boolean;
    job_slug: string;
    recruiter: {
        company_name: string | null;
        company_slug: string | null;
    } | null;
  };
  userProfile: UserProfile;
}

export function PublicJobView({ job, userProfile }: PublicJobViewProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { limitReached, recruiter, application_deadline } = job;

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  const handleFastApply = async () => {
    if (!userProfile?.userId) return;
    setIsSubmitting(true);
    
    const result = await fastApply(job.id, userProfile.userId);
    
    if (result.success) {
      setIsSuccess(true);
      toast({ title: "Application Submitted!", description: "Your profile has been sent to the recruiter." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    
    setIsSubmitting(false);
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

            <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: job.description || '' }} />
            
            {job.requirements && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><FileText className="w-6 h-6 mr-3 text-purple-600" />Requirements</h3>
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: job.requirements }} />
              </div>
            )}

            {job.benefits && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><Star className="w-6 h-6 mr-3 text-yellow-500" />Benefits</h3>
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: job.benefits }} />
              </div>
            )}

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
          {userProfile?.isLoggedIn && userProfile?.isProfileComplete ? (
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">You're ready to apply!</h3>
              <p className="text-gray-600 text-sm mb-6">
                Your profile is complete. Apply instantly with your saved CV and details.
              </p>
              <Button onClick={handleFastApply} className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-2" />
                )}
                Apply with your Profile
              </Button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Apply Now</h3>
              <p className="text-gray-600 text-sm mb-6">
                Submit a detailed application to stand out from the crowd.
              </p>
              <Button asChild className="w-full">
                <Link href={`/jobs/public/apply/${job.recruiter?.company_slug}/${job.job_slug}-${job.id}`}>
                    <FileText className="w-4 h-4 mr-2"/>
                    Apply Now
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 