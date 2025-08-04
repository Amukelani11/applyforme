-- Create talent pools table
CREATE TABLE IF NOT EXISTS public.talent_pools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1', -- Default purple color
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create talent pool members table
CREATE TABLE IF NOT EXISTS public.talent_pool_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pool_id UUID REFERENCES public.talent_pools(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  candidate_location TEXT,
  application_id UUID, -- Can be either candidate_applications or public_applications
  application_type TEXT CHECK (application_type IN ('candidate', 'public')),
  job_title TEXT,
  company_name TEXT,
  added_notes TEXT,
  added_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_talent_pools_recruiter_id ON public.talent_pools(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_pool_id ON public.talent_pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_candidate_email ON public.talent_pool_members(candidate_email);

-- Enable RLS
ALTER TABLE public.talent_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pool_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for talent_pools
CREATE POLICY "Recruiters can view their own talent pools" ON public.talent_pools
  FOR SELECT USING (
    recruiter_id IN (
      SELECT id FROM public.recruiters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can create their own talent pools" ON public.talent_pools
  FOR INSERT WITH CHECK (
    recruiter_id IN (
      SELECT id FROM public.recruiters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can update their own talent pools" ON public.talent_pools
  FOR UPDATE USING (
    recruiter_id IN (
      SELECT id FROM public.recruiters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can delete their own talent pools" ON public.talent_pools
  FOR DELETE USING (
    recruiter_id IN (
      SELECT id FROM public.recruiters WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for talent_pool_members
CREATE POLICY "Recruiters can view members of their talent pools" ON public.talent_pool_members
  FOR SELECT USING (
    pool_id IN (
      SELECT id FROM public.talent_pools WHERE recruiter_id IN (
        SELECT id FROM public.recruiters WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Recruiters can add members to their talent pools" ON public.talent_pool_members
  FOR INSERT WITH CHECK (
    pool_id IN (
      SELECT id FROM public.talent_pools WHERE recruiter_id IN (
        SELECT id FROM public.recruiters WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Recruiters can update members of their talent pools" ON public.talent_pool_members
  FOR UPDATE USING (
    pool_id IN (
      SELECT id FROM public.talent_pools WHERE recruiter_id IN (
        SELECT id FROM public.recruiters WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Recruiters can remove members from their talent pools" ON public.talent_pool_members
  FOR DELETE USING (
    pool_id IN (
      SELECT id FROM public.talent_pools WHERE recruiter_id IN (
        SELECT id FROM public.recruiters WHERE user_id = auth.uid()
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_talent_pools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_talent_pools_updated_at
  BEFORE UPDATE ON public.talent_pools
  FOR EACH ROW
  EXECUTE FUNCTION update_talent_pools_updated_at(); 