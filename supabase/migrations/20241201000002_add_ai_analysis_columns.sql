-- Add ai_analysis column to candidate_applications table
ALTER TABLE public.candidate_applications
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS ai_analysis_updated_at TIMESTAMPTZ;

-- Add ai_analysis column to public_applications table
ALTER TABLE public.public_applications
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS ai_analysis_updated_at TIMESTAMPTZ;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_applications_ai_analysis ON public.candidate_applications(ai_analysis_updated_at);
CREATE INDEX IF NOT EXISTS idx_public_applications_ai_analysis ON public.public_applications(ai_analysis_updated_at);

-- Add trigger to update ai_analysis_updated_at when ai_analysis changes
CREATE OR REPLACE FUNCTION public.update_ai_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_analysis IS DISTINCT FROM OLD.ai_analysis THEN
    NEW.ai_analysis_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
DROP TRIGGER IF EXISTS update_candidate_ai_analysis_timestamp ON public.candidate_applications;
CREATE TRIGGER update_candidate_ai_analysis_timestamp
  BEFORE UPDATE ON public.candidate_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_analysis_timestamp();

DROP TRIGGER IF EXISTS update_public_ai_analysis_timestamp ON public.public_applications;
CREATE TRIGGER update_public_ai_analysis_timestamp
  BEFORE UPDATE ON public.public_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_analysis_timestamp(); 