-- Fix the AI score calculation function to handle the actual JSON structure
-- Run this in your Supabase SQL editor

-- Drop the existing function and recreate it
DROP FUNCTION IF EXISTS public.calculate_ai_score(JSONB);

-- Create a simpler function that handles the actual JSON structure
CREATE OR REPLACE FUNCTION public.calculate_ai_score(analysis JSONB)
RETURNS INTEGER AS $$
DECLARE
  score_value INTEGER;
BEGIN
  -- Check if analysis exists
  IF analysis IS NULL THEN
    RETURN NULL;
  END IF;

  -- Try to extract score from the analysis
  -- Based on the error, the score field contains a JSON object with a "score" property
  IF analysis->'score' IS NOT NULL THEN
    -- Try to get the score value from the JSON object
    IF analysis->'score'->>'score' IS NOT NULL THEN
      BEGIN
        score_value := (analysis->'score'->>'score')::INTEGER;
        RETURN score_value;
      EXCEPTION
        WHEN OTHERS THEN
          -- If that fails, try other possible structures
          NULL;
      END;
    END IF;
    
    -- Try direct score extraction
    IF analysis->>'score' IS NOT NULL THEN
      BEGIN
        score_value := (analysis->>'score')::INTEGER;
        RETURN score_value;
      EXCEPTION
        WHEN OTHERS THEN
          -- If that fails, return default
          NULL;
      END;
    END IF;
  END IF;

  -- If no score found, calculate based on matched skills vs missing skills
  IF analysis->'matched_skills' IS NOT NULL AND analysis->'missing_skills' IS NOT NULL THEN
    DECLARE
      matched_count INTEGER;
      missing_count INTEGER;
      total_count INTEGER;
    BEGIN
      matched_count := jsonb_array_length(analysis->'matched_skills');
      missing_count := jsonb_array_length(analysis->'missing_skills');
      total_count := matched_count + missing_count;
      
      IF total_count > 0 THEN
        score_value := (matched_count * 100) / total_count;
        RETURN score_value;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        NULL;
    END;
  END IF;

  -- Default score if no analysis data
  RETURN 50;
END;
$$ LANGUAGE plpgsql;

-- Update existing applications with AI scores
UPDATE public.candidate_applications 
SET ai_score = public.calculate_ai_score(ai_analysis)
WHERE ai_analysis IS NOT NULL AND ai_score IS NULL;

UPDATE public.public_applications 
SET ai_score = public.calculate_ai_score(ai_analysis)
WHERE ai_analysis IS NOT NULL AND ai_score IS NULL;

-- Verify the function works
SELECT 'AI score function updated successfully!' as status; 