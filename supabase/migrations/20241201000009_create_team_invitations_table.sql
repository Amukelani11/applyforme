-- Create team_invitations table for team invitation system
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'recruiter', 'hiring_manager', 'interviewer')),
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'recruiter', 'hiring_manager', 'interviewer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recruiter_id, user_id)
);

-- Create team_activity_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('member_joined', 'member_left', 'role_changed', 'invitation_sent', 'invitation_accepted')),
    action_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_recruiter_id ON public.team_invitations(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_members_recruiter_id ON public.team_members(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_log_recruiter_id ON public.team_activity_log(recruiter_id);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "team_invitations_select" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_insert" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_update" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_delete" ON public.team_invitations;

DROP POLICY IF EXISTS "team_members_select" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete" ON public.team_members;

DROP POLICY IF EXISTS "team_activity_log_select" ON public.team_activity_log;
DROP POLICY IF EXISTS "team_activity_log_insert" ON public.team_activity_log;
DROP POLICY IF EXISTS "team_activity_log_update" ON public.team_activity_log;
DROP POLICY IF EXISTS "team_activity_log_delete" ON public.team_activity_log;

-- Create RLS policies for team_invitations
CREATE POLICY "team_invitations_select" ON public.team_invitations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "team_invitations_insert" ON public.team_invitations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "team_invitations_update" ON public.team_invitations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "team_invitations_delete" ON public.team_invitations
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for team_members
CREATE POLICY "team_members_select" ON public.team_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "team_members_insert" ON public.team_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "team_members_update" ON public.team_members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "team_members_delete" ON public.team_members
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for team_activity_log
CREATE POLICY "team_activity_log_select" ON public.team_activity_log
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "team_activity_log_insert" ON public.team_activity_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "team_activity_log_update" ON public.team_activity_log
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "team_activity_log_delete" ON public.team_activity_log
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_team_invitations_updated_at ON public.team_invitations;
CREATE TRIGGER update_team_invitations_updated_at
    BEFORE UPDATE ON public.team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Team invitations table created successfully!' as status;
