-- Create collaboration features for applyforme
-- This migration adds team collaboration capabilities

-- 1. Shared Notes & Comments on Candidate Profiles
CREATE TABLE IF NOT EXISTS public.candidate_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL,
    application_type TEXT NOT NULL CHECK (application_type IN ('candidate', 'public')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'screening', 'interview', 'reference_check', 'offer')),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Internal Candidate Rating System
CREATE TABLE IF NOT EXISTS public.candidate_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL,
    application_type TEXT NOT NULL CHECK (application_type IN ('candidate', 'public')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    rating_type TEXT DEFAULT 'overall' CHECK (rating_type IN ('overall', 'technical', 'cultural_fit', 'experience', 'communication')),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(application_id, application_type, user_id, rating_type)
);

-- 3. Candidate Assignment & Workflow Ownership
CREATE TABLE IF NOT EXISTS public.candidate_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL,
    application_type TEXT NOT NULL CHECK (application_type IN ('candidate', 'public')),
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('screening', 'interview', 'reference_check', 'offer_negotiation', 'onboarding')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'reassigned')),
    due_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Custom Interview Feedback Forms
CREATE TABLE IF NOT EXISTS public.interview_feedback_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    form_name TEXT NOT NULL,
    form_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interview_feedback_form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES public.interview_feedback_forms(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'rating', 'checkbox', 'radio', 'select')),
    field_label TEXT NOT NULL,
    field_required BOOLEAN DEFAULT false,
    field_options JSONB, -- For select, radio, checkbox options
    field_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interview_feedback_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES public.interview_feedback_forms(id) ON DELETE CASCADE,
    application_id UUID NOT NULL,
    application_type TEXT NOT NULL CHECK (application_type IN ('candidate', 'public')),
    interviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interview_date TIMESTAMPTZ,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    recommendation TEXT CHECK (recommendation IN ('strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire')),
    feedback_data JSONB NOT NULL, -- Stores all form field responses
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Activity Log / Audit Trail
CREATE TABLE IF NOT EXISTS public.candidate_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL,
    application_type TEXT NOT NULL CHECK (application_type IN ('candidate', 'public')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'viewed', 'commented', 'rated', 'assigned', 'status_changed', 
        'interview_scheduled', 'feedback_submitted', 'note_added', 
        'shortlisted', 'rejected', 'hired', 'withdrawn'
    )),
    action_details JSONB, -- Flexible storage for action-specific data
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. In-Platform Team Messaging (Internal Chat)
CREATE TABLE IF NOT EXISTS public.team_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    conversation_name TEXT,
    conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'candidate_specific', 'job_specific')),
    related_application_id UUID,
    related_application_type TEXT CHECK (related_application_type IN ('candidate', 'public')),
    related_job_id BIGINT REFERENCES public.job_postings(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_conversation_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.team_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.team_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.team_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_notes_application ON public.candidate_notes(application_id, application_type);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_recruiter ON public.candidate_notes(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_ratings_application ON public.candidate_ratings(application_id, application_type);
CREATE INDEX IF NOT EXISTS idx_candidate_ratings_user ON public.candidate_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_assignments_application ON public.candidate_assignments(application_id, application_type);
CREATE INDEX IF NOT EXISTS idx_candidate_assignments_assigned_to ON public.candidate_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_responses_application ON public.interview_feedback_responses(application_id, application_type);
CREATE INDEX IF NOT EXISTS idx_candidate_activity_log_application ON public.candidate_activity_log(application_id, application_type);
CREATE INDEX IF NOT EXISTS idx_candidate_activity_log_user ON public.candidate_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_team_conversations_recruiter ON public.team_conversations(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_conversation ON public.team_messages(conversation_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_candidate_notes_updated_at BEFORE UPDATE ON public.candidate_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_ratings_updated_at BEFORE UPDATE ON public.candidate_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_assignments_updated_at BEFORE UPDATE ON public.candidate_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_feedback_forms_updated_at BEFORE UPDATE ON public.interview_feedback_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_feedback_responses_updated_at BEFORE UPDATE ON public.interview_feedback_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_conversations_updated_at BEFORE UPDATE ON public.team_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for candidate_notes
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can view notes for their applications" ON public.candidate_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.job_postings jp
            JOIN public.recruiters r ON jp.recruiter_id = r.id
            WHERE (jp.id = (
                CASE 
                    WHEN candidate_notes.application_type = 'candidate' THEN 
                        (SELECT job_posting_id FROM public.candidate_applications WHERE id::text = candidate_notes.application_id::text)
                    WHEN candidate_notes.application_type = 'public' THEN 
                        (SELECT job_id FROM public.public_applications WHERE id::text = candidate_notes.application_id::text)
                END
            ))
            AND r.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can insert notes for their applications" ON public.candidate_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.recruiters r
            WHERE r.id = candidate_notes.recruiter_id
            AND r.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can update their own notes" ON public.candidate_notes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.recruiters r
            WHERE r.id = candidate_notes.recruiter_id
            AND r.user_id = auth.uid()
        )
    );

-- RLS Policies for candidate_ratings
ALTER TABLE public.candidate_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can view ratings for their applications" ON public.candidate_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.job_postings jp
            JOIN public.recruiters r ON jp.recruiter_id = r.id
            WHERE (jp.id = (
                CASE 
                    WHEN candidate_ratings.application_type = 'candidate' THEN 
                        (SELECT job_posting_id FROM public.candidate_applications WHERE id::text = candidate_ratings.application_id::text)
                    WHEN candidate_ratings.application_type = 'public' THEN 
                        (SELECT job_id FROM public.public_applications WHERE id::text = candidate_ratings.application_id::text)
                END
            ))
            AND r.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can insert ratings for their applications" ON public.candidate_ratings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.recruiters r
            WHERE r.id = candidate_ratings.recruiter_id
            AND r.user_id = auth.uid()
        )
    );

-- RLS Policies for candidate_assignments
ALTER TABLE public.candidate_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view assignments" ON public.candidate_assignments
    FOR SELECT USING (
        assigned_to = auth.uid() OR assigned_by = auth.uid()
    );

CREATE POLICY "Recruiters can create assignments" ON public.candidate_assignments
    FOR INSERT WITH CHECK (
        assigned_by = auth.uid()
    );

-- RLS Policies for interview_feedback_forms
ALTER TABLE public.interview_feedback_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can manage their feedback forms" ON public.interview_feedback_forms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.recruiters r
            WHERE r.id = interview_feedback_forms.recruiter_id
            AND r.user_id = auth.uid()
        )
    );

-- RLS Policies for team_conversations
ALTER TABLE public.team_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view conversations they're part of" ON public.team_conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_conversation_members tcm
            WHERE tcm.conversation_id = team_conversations.id
            AND tcm.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can create conversations" ON public.team_conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.recruiters r
            WHERE r.id = team_conversations.recruiter_id
            AND r.user_id = auth.uid()
        )
    );

-- RLS Policies for team_messages
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view messages in their conversations" ON public.team_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_conversation_members tcm
            WHERE tcm.conversation_id = team_messages.conversation_id
            AND tcm.user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can send messages" ON public.team_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
    );

-- Grant necessary permissions
GRANT ALL ON public.candidate_notes TO authenticated;
GRANT ALL ON public.candidate_ratings TO authenticated;
GRANT ALL ON public.candidate_assignments TO authenticated;
GRANT ALL ON public.interview_feedback_forms TO authenticated;
GRANT ALL ON public.interview_feedback_form_fields TO authenticated;
GRANT ALL ON public.interview_feedback_responses TO authenticated;
GRANT ALL ON public.candidate_activity_log TO authenticated;
GRANT ALL ON public.team_conversations TO authenticated;
GRANT ALL ON public.team_conversation_members TO authenticated;
GRANT ALL ON public.team_messages TO authenticated;

SELECT 'Collaboration features migration completed successfully!' as status; 