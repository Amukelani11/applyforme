import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { DetailedApplicationForm } from '../../../_components/detailed-application-form';
import { slugify } from '@/lib/utils';

async function getJobHeaderData(companySlug: string, jobSlugWithId: string) {
    const supabase = await createClient();
    const jobId = jobSlugWithId.split('-').pop();
    
    if (!jobId || isNaN(Number(jobId))) {
        return null;
    }

    const { data: job, error } = await supabase
        .from('job_postings')
        .select('id, title, recruiter:recruiters!inner(company_name, company_slug)')
        .eq('id', Number(jobId))
        .eq('recruiters.company_slug', companySlug)
        .single();

    if (error || !job) {
        return null;
    }

    const typedJob = job as any;

    return {
        id: typedJob.id,
        title: typedJob.title,
        recruiter: typedJob.recruiter
    }
}

export default async function ApplyPage({ params: { companySlug, jobSlugWithId } }: { params: { companySlug: string, jobSlugWithId: string } }) {
    const job = await getJobHeaderData(companySlug, jobSlugWithId);

    if (!job) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Apply for {job.title}</h1>
                    <p className="text-xl text-gray-600">at {job.recruiter?.company_name || 'a great company'}</p>
                </div>
                <DetailedApplicationForm job={job} />
            </div>
        </div>
    );
} 