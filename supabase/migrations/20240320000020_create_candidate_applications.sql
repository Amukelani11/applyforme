-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own applications" ON candidate_applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON candidate_applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON candidate_applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their jobs" ON candidate_applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their job postings" ON candidate_applications;
DROP POLICY IF EXISTS "Recruiters can update application status" ON candidate_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON candidate_applications;

-- Create candidate_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS candidate_applications (
    id BIGSERIAL PRIMARY KEY,
    job_posting_id BIGINT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cv_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected', 'interviewed', 'hired')),
    recruiter_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_applications_user_id ON candidate_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_applications_job_posting_id ON candidate_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_candidate_applications_status ON candidate_applications(status);

-- Add RLS policies
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view their own applications" ON candidate_applications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert their own applications" ON candidate_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recruiters can view applications for their job postings
CREATE POLICY "Recruiters can view applications for their job postings" ON candidate_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM job_postings jp 
            JOIN recruiters r ON jp.recruiter_id = r.id 
            WHERE jp.id = candidate_applications.job_posting_id 
            AND r.user_id = auth.uid()
        )
    );

-- Recruiters can update applications for their job postings
CREATE POLICY "Recruiters can update applications for their job postings" ON candidate_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM job_postings jp 
            JOIN recruiters r ON jp.recruiter_id = r.id 
            WHERE jp.id = candidate_applications.job_posting_id 
            AND r.user_id = auth.uid()
        )
    );

-- Admins can view all applications
CREATE POLICY "Admins can view all applications" ON candidate_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );
