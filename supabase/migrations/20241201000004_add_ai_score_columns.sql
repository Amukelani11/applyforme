-- Add ai_score column to candidate_applications table
ALTER TABLE public.candidate_applications
ADD COLUMN IF NOT EXISTS ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100);

-- Add ai_score column to public_applications table
ALTER TABLE public.public_applications
ADD COLUMN IF NOT EXISTS ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100);

-- Add phone column to public_applications table (if it doesn't exist)
ALTER TABLE public.public_applications
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_applications_ai_score ON public.candidate_applications(ai_score);
CREATE INDEX IF NOT EXISTS idx_public_applications_ai_score ON public.public_applications(ai_score);

-- Create function to calculate AI score from analysis
CREATE OR REPLACE FUNCTION public.calculate_ai_score(analysis JSONB)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  total_weight INTEGER := 0;
  current_weight INTEGER;
  current_score INTEGER;
BEGIN
  -- Check if analysis exists
  IF analysis IS NULL THEN
    RETURN NULL;
  END IF;

  -- First, try to extract the direct score from the analysis
  IF analysis->>'score' IS NOT NULL THEN
    -- Handle case where score might be a number or a JSON object
    BEGIN
      RETURN (analysis->>'score')::INTEGER;
    EXCEPTION
      WHEN OTHERS THEN
        -- If score is not a simple integer, try to extract from nested structure
        IF analysis->'score'->>'value' IS NOT NULL THEN
          RETURN (analysis->'score'->>'value')::INTEGER;
        END IF;
    END;
  END IF;

  -- Calculate score based on different factors in the analysis
  -- This is a simplified scoring algorithm - adjust based on your AI analysis structure
  
  -- Experience match (weight: 30%)
  IF analysis->>'experience_match' IS NOT NULL THEN
    BEGIN
      current_score := (analysis->>'experience_match')::INTEGER;
      current_weight := 30;
      score := score + (current_score * current_weight);
      total_weight := total_weight + current_weight;
    EXCEPTION
      WHEN OTHERS THEN
        -- Skip this factor if it's not a valid integer
        NULL;
    END;
  END IF;

  -- Skills match (weight: 25%)
  IF analysis->>'skills_match' IS NOT NULL THEN
    BEGIN
      current_score := (analysis->>'skills_match')::INTEGER;
      current_weight := 25;
      score := score + (current_score * current_weight);
      total_weight := total_weight + current_weight;
    EXCEPTION
      WHEN OTHERS THEN
        -- Skip this factor if it's not a valid integer
        NULL;
    END;
  END IF;

  -- Education match (weight: 20%)
  IF analysis->>'education_match' IS NOT NULL THEN
    BEGIN
      current_score := (analysis->>'education_match')::INTEGER;
      current_weight := 20;
      score := score + (current_score * current_weight);
      total_weight := total_weight + current_weight;
    EXCEPTION
      WHEN OTHERS THEN
        -- Skip this factor if it's not a valid integer
        NULL;
    END;
  END IF;

  -- Overall fit (weight: 25%)
  IF analysis->>'overall_fit' IS NOT NULL THEN
    BEGIN
      current_score := (analysis->>'overall_fit')::INTEGER;
      current_weight := 25;
      score := score + (current_score * current_weight);
      total_weight := total_weight + current_weight;
    EXCEPTION
      WHEN OTHERS THEN
        -- Skip this factor if it's not a valid integer
        NULL;
    END;
  END IF;

  -- Return weighted average
  IF total_weight > 0 THEN
    RETURN (score / total_weight);
  END IF;

  -- Default score if no analysis data
  RETURN 50;
END;
$$ LANGUAGE plpgsql;

-- Create function to update AI scores for existing applications
CREATE OR REPLACE FUNCTION public.update_ai_scores()
RETURNS VOID AS $$
BEGIN
  -- Update candidate applications
  UPDATE public.candidate_applications 
  SET ai_score = public.calculate_ai_score(ai_analysis)
  WHERE ai_analysis IS NOT NULL AND ai_score IS NULL;

  -- Update public applications
  UPDATE public.public_applications 
  SET ai_score = public.calculate_ai_score(ai_analysis)
  WHERE ai_analysis IS NOT NULL AND ai_score IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update AI score when analysis changes
CREATE OR REPLACE FUNCTION public.update_ai_score_from_analysis()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_analysis IS DISTINCT FROM OLD.ai_analysis THEN
    NEW.ai_score = public.calculate_ai_score(NEW.ai_analysis);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
DROP TRIGGER IF EXISTS update_candidate_ai_score ON public.candidate_applications;
CREATE TRIGGER update_candidate_ai_score
  BEFORE UPDATE ON public.candidate_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_score_from_analysis();

DROP TRIGGER IF EXISTS update_public_ai_score ON public.public_applications;
CREATE TRIGGER update_public_ai_score
  BEFORE UPDATE ON public.public_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_score_from_analysis();

-- Update existing applications with AI scores
SELECT public.update_ai_scores(); 