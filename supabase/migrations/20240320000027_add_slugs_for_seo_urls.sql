-- Enable the unaccent extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Function to create a URL-friendly slug from a text string
CREATE OR REPLACE FUNCTION public.slugify(v_text TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  -- 1. Trim and lower case
  v_text := lower(trim(v_text));
  -- 2. Remove accents
  v_text := unaccent(v_text);
  -- 3. Replace non-alphanumeric characters with a hyphen
  v_text := regexp_replace(v_text, '[^a-z0-9]+', '-', 'g');
  -- 4. Trim consecutive hyphens
  v_text := regexp_replace(v_text, '(-){2,}', '-', 'g');
  -- 5. Remove leading and trailing hyphens
  v_text := trim(both '-' from v_text);
  RETURN v_text;
END;
$$;

-- Add company_slug column to recruiters table
ALTER TABLE public.recruiters
ADD COLUMN IF NOT EXISTS company_slug TEXT;

-- Generate slugs for existing recruiters
UPDATE public.recruiters
SET company_slug = slugify(company_name)
WHERE company_name IS NOT NULL AND company_slug IS NULL;

-- Add a unique constraint to prevent duplicate slugs
-- Note: This might fail if different company names produce the same slug.
-- This should be handled in the application logic by appending a unique identifier if a conflict occurs.
ALTER TABLE public.recruiters
ADD CONSTRAINT recruiters_company_slug_key UNIQUE (company_slug); 