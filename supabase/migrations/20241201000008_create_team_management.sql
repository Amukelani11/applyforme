-- Fix team management RLS policies
-- Drop existing problematic policies and create clean ones

-- Drop all existing policies on team_members
DROP POLICY IF EXISTS "Team members can view their own team" ON public.team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.team_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.team_members;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.team_members;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.team_members;

-- Drop all existing policies on team_member_permissions
DROP POLICY IF EXISTS "Team members can view permissions for their team" ON public.team_member_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.team_member_permissions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.team_member_permissions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.team_member_permissions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.team_member_permissions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.team_member_permissions;

-- Drop all existing policies on team_invitations
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.team_invitations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.team_invitations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.team_invitations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.team_invitations;

-- Drop all existing policies on team_activity_log
DROP POLICY IF EXISTS "Team members can view activity for their team" ON public.team_activity_log;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.team_activity_log;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.team_activity_log;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.team_activity_log;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.team_activity_log;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.team_activity_log;

-- Create simple, clean policies for team_members
CREATE POLICY "team_members_select" ON public.team_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "team_members_insert" ON public.team_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "team_members_update" ON public.team_members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "team_members_delete" ON public.team_members
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create simple, clean policies for team_member_permissions
CREATE POLICY "team_member_permissions_select" ON public.team_member_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "team_member_permissions_insert" ON public.team_member_permissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "team_member_permissions_update" ON public.team_member_permissions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "team_member_permissions_delete" ON public.team_member_permissions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create simple, clean policies for team_invitations
CREATE POLICY "team_invitations_select" ON public.team_invitations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "team_invitations_insert" ON public.team_invitations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "team_invitations_update" ON public.team_invitations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "team_invitations_delete" ON public.team_invitations
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create simple, clean policies for team_activity_log
CREATE POLICY "team_activity_log_select" ON public.team_activity_log
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "team_activity_log_insert" ON public.team_activity_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "team_activity_log_update" ON public.team_activity_log
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "team_activity_log_delete" ON public.team_activity_log
    FOR DELETE USING (auth.role() = 'authenticated');

SELECT 'Team management RLS policies fixed successfully!' as status; 