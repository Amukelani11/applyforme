-- Add company column to work_experience table
ALTER TABLE work_experience
ADD COLUMN company TEXT;

-- Update existing records to have a default company name
UPDATE work_experience
SET company = 'Previous Employer'
WHERE company IS NULL;

-- Make company column required
ALTER TABLE work_experience
ALTER COLUMN company SET NOT NULL; 