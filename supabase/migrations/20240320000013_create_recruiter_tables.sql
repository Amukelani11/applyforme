-- Create recruiters table
CREATE TABLE IF NOT EXISTS public.recruiters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_website TEXT,
    company_description TEXT,
    industry TEXT,
    location TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create job postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
    id BIGSERIAL PRIMARY KEY,
    recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
    salary_range TEXT,
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    application_deadline TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create candidate applications table
CREATE TABLE IF NOT EXISTS public.candidate_applications (
    id BIGSERIAL PRIMARY KEY,
    job_posting_id BIGINT REFERENCES public.job_postings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cv_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'interviewed', 'rejected', 'hired')),
    recruiter_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recruiters_user_id ON public.recruiters(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_recruiter_id ON public.job_postings(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_applications_job_posting_id ON public.candidate_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_candidate_applications_user_id ON public.candidate_applications(user_id);

-- Enable RLS
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recruiters
CREATE POLICY "Recruiters can view their own profile"
    ON public.recruiters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can update their own profile"
    ON public.recruiters FOR UPDATE
    USING (auth.uid() = user_id);

-- Create RLS policies for job postings
CREATE POLICY "Anyone can view active job postings"
    ON public.job_postings FOR SELECT
    USING (is_active = true);

CREATE POLICY "Recruiters can view their own job postings"
    ON public.job_postings FOR SELECT
    USING (recruiter_id IN (
        SELECT id FROM public.recruiters WHERE user_id = auth.uid()
    ));

CREATE POLICY "Recruiters can create job postings"
    ON public.job_postings FOR INSERT
    WITH CHECK (recruiter_id IN (
        SELECT id FROM public.recruiters WHERE user_id = auth.uid()
    ));

CREATE POLICY "Recruiters can update their own job postings"
    ON public.job_postings FOR UPDATE
    USING (recruiter_id IN (
        SELECT id FROM public.recruiters WHERE user_id = auth.uid()
    ));

-- Create RLS policies for candidate applications
CREATE POLICY "Recruiters can view applications for their jobs"
    ON public.candidate_applications FOR SELECT
    USING (job_posting_id IN (
        SELECT id FROM public.job_postings WHERE recruiter_id IN (
            SELECT id FROM public.recruiters WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can view their own applications"
    ON public.candidate_applications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Recruiters can update application status"
    ON public.candidate_applications FOR UPDATE
    USING (job_posting_id IN (
        SELECT id FROM public.job_postings WHERE recruiter_id IN (
            SELECT id FROM public.recruiters WHERE user_id = auth.uid()
        )
    ));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recruiters_updated_at
    BEFORE UPDATE ON public.recruiters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at
    BEFORE UPDATE ON public.job_postings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_applications_updated_at
    BEFORE UPDATE ON public.candidate_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add UNIQUE constraint to user_id in recruiters table to enforce one-to-one relationship
ALTER TABLE public.recruiters
ADD CONSTRAINT recruiters_user_id_key UNIQUE (user_id); 