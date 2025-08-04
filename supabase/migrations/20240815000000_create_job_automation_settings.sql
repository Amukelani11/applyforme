-- Create job automation settings table
CREATE TABLE IF NOT EXISTS public.job_automation_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id BIGINT REFERENCES public.job_postings(id) ON DELETE CASCADE,
  auto_reject_enabled BOOLEAN DEFAULT false,
  auto_reject_threshold INTEGER DEFAULT 60 CHECK (auto_reject_threshold >= 0 AND auto_reject_threshold <= 100),
  auto_shortlist_enabled BOOLEAN DEFAULT false,
  auto_shortlist_threshold INTEGER DEFAULT 80 CHECK (auto_shortlist_threshold >= 0 AND auto_shortlist_threshold <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_automation_settings_job_id ON public.job_automation_settings(job_id);

-- Enable RLS
ALTER TABLE public.job_automation_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Recruiters can view their own job automation settings" ON public.job_automation_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_postings jp
      JOIN public.recruiters r ON jp.recruiter_id = r.id
      WHERE jp.id = job_automation_settings.job_id
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can insert their own job automation settings" ON public.job_automation_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings jp
      JOIN public.recruiters r ON jp.recruiter_id = r.id
      WHERE jp.id = job_automation_settings.job_id
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update their own job automation settings" ON public.job_automation_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings jp
      JOIN public.recruiters r ON jp.recruiter_id = r.id
      WHERE jp.id = job_automation_settings.job_id
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can delete their own job automation settings" ON public.job_automation_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings jp
      JOIN public.recruiters r ON jp.recruiter_id = r.id
      WHERE jp.id = job_automation_settings.job_id
      AND r.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_automation_settings_updated_at 
  BEFORE UPDATE ON public.job_automation_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 