-- Add document fields to certifications table
ALTER TABLE public.certifications
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS document_name TEXT;

-- Update RLS policies to allow document updates
CREATE POLICY "Users can update their own certification documents"
    ON public.certifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 