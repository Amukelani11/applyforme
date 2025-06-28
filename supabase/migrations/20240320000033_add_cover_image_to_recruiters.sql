-- Add cover_image_url to recruiters table
ALTER TABLE public.recruiters
ADD COLUMN IF NOT EXISTS cover_image_url TEXT; 