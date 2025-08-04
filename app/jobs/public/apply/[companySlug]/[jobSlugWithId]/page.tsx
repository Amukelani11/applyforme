import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { DetailedApplicationForm } from '../../../_components/detailed-application-form';
import { PublicJobView } from '../../../_components/public-job-view';
import { slugify } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

// Public Header Component (same as in public job view)
const PublicHeader = () => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/applyforme.svg"
              alt="ApplyForMe"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 font-medium">
                <LogIn className="h-4 w-4 mr-2" />
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[#c084fc] hover:bg-[#a855f7] text-white font-medium shadow-sm hover:shadow-md transition-all duration-200">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

async function getJobHeaderData(companySlug: string, jobSlugWithId: string) {
    try {
        const supabase = await createClient();
        const jobId = jobSlugWithId.split('-').pop();
        
        if (!jobId || isNaN(Number(jobId))) {
            console.error('Invalid job ID extracted from slug:', jobSlugWithId);
            return null;
        }

        console.log('DEBUG: Fetching job with ID:', jobId, 'and company slug:', companySlug);

        // Just fetch the job - we already have the company slug from the URL
        const { data: job, error: jobError } = await supabase
            .from("job_postings")
            .select(`id, title, allow_public_applications`)
            .eq("id", Number(jobId))
            .eq("allow_public_applications", true)
            .single()

        console.log('DEBUG: Supabase job query error:', jobError);
        console.log('DEBUG: Raw job data from DB:', JSON.stringify(job, null, 2));

        if (jobError || !job) {
            console.error("Error fetching public job for application:", jobError?.message)
            return null;
        }

        // Use the company slug from the URL as the company name (capitalized)
        const companyName = companySlug.charAt(0).toUpperCase() + companySlug.slice(1);
        
        console.log('DEBUG: Using company name from URL slug:', companyName);

        return {
            id: job.id,
            title: job.title,
            recruiter: {
                company_name: companyName,
                company_slug: companySlug
            }
        }
    } catch (error) {
        console.error('Unexpected error in getJobHeaderData:', error);
        return null;
    }
}

export default async function ApplyPage({ params }: { params: { companySlug: string, jobSlugWithId: string } }) {
    const { companySlug, jobSlugWithId } = await params;
    const job = await getJobHeaderData(companySlug, jobSlugWithId);

    if (!job) {
        notFound();
    }

    // Debug what we have
    console.log('Job data in ApplyPage:', JSON.stringify(job, null, 2));
    console.log('Company name from recruiter:', job.recruiter?.company_name);

    return (
        <>
            <PublicHeader />
            <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Apply for {job.title}</h1>
                        <p className="text-xl text-gray-600">{job.recruiter?.company_name || 'a great company'}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                        <DetailedApplicationForm job={job} />
                    </div>
                </div>
            </div>
        </>
    );
} 