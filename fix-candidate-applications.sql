-- Fix candidate_applications table policies
-- Run this SQL in your Supabase SQL editor

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own applications" ON candidate_applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON candidate_applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON candidate_applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their jobs" ON candidate_applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their job postings" ON candidate_applications;
DROP POLICY IF EXISTS "Recruiters can update application status" ON candidate_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON candidate_applications;

-- Enable RLS
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

-- Add sample job postings if they don't exist
INSERT INTO job_postings (title, company, location, job_type, salary_range, description, requirements, benefits, is_active, recruiter_id) 
SELECT * FROM (VALUES
    ('Senior Software Developer', 'TechCorp Solutions', 'Cape Town, South Africa', 'full-time', 'R80,000 - R120,000', 'We are looking for an experienced software developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.', '5+ years experience in software development, proficiency in JavaScript/TypeScript, React, Node.js, experience with databases (PostgreSQL, MongoDB), strong problem-solving skills', 'Competitive salary, health insurance, flexible working hours, remote work options, professional development budget', true, (SELECT id FROM recruiters LIMIT 1)),
    ('Marketing Manager', 'Digital Marketing Pro', 'Johannesburg, South Africa', 'full-time', 'R60,000 - R90,000', 'Lead our marketing team and develop comprehensive marketing strategies to drive business growth and brand awareness.', '3+ years marketing experience, experience with digital marketing tools, strong analytical skills, excellent communication abilities', 'Performance bonuses, health benefits, flexible schedule, career growth opportunities', true, (SELECT id FROM recruiters LIMIT 1)),
    ('Data Analyst', 'Analytics Solutions', 'Durban, South Africa', 'full-time', 'R50,000 - R75,000', 'Analyze complex data sets to provide insights that drive business decisions and improve operational efficiency.', '2+ years data analysis experience, proficiency in SQL, Python, Excel, experience with data visualization tools', 'Competitive salary, learning opportunities, modern office environment, team events', true, (SELECT id FROM recruiters LIMIT 1)),
    ('UX/UI Designer', 'Creative Design Studio', 'Pretoria, South Africa', 'full-time', 'R55,000 - R85,000', 'Create beautiful and functional user interfaces that provide exceptional user experiences across web and mobile platforms.', '3+ years UX/UI design experience, proficiency in Figma, Adobe Creative Suite, strong portfolio, user-centered design approach', 'Creative environment, flexible hours, health insurance, professional development', true, (SELECT id FROM recruiters LIMIT 1)),
    ('Sales Representative', 'Global Sales Inc', 'Port Elizabeth, South Africa', 'full-time', 'R40,000 - R70,000', 'Build relationships with clients and drive sales growth through effective communication and product knowledge.', '2+ years sales experience, excellent communication skills, target-driven, customer service oriented', 'Commission structure, car allowance, health benefits, performance incentives', true, (SELECT id FROM recruiters LIMIT 1))
) AS v(title, company, location, job_type, salary_range, description, requirements, benefits, is_active, recruiter_id)
WHERE NOT EXISTS (
    SELECT 1 FROM job_postings WHERE title = v.title AND company = v.company
);

-- Verify the setup
SELECT 'Policies created successfully' as status;
SELECT COUNT(*) as job_postings_count FROM job_postings WHERE is_active = true;
