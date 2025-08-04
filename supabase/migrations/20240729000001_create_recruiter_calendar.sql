-- Table to store events for recruiters
CREATE TABLE public.recruiter_events (
    id BIGSERIAL PRIMARY KEY,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('interview', 'deadline', 'reminder', 'custom')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    job_posting_id BIGINT REFERENCES public.job_postings(id) ON DELETE CASCADE,
    candidate_application_id BIGINT REFERENCES public.candidate_applications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policy for the events table
ALTER TABLE public.recruiter_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can manage their own events"
ON public.recruiter_events
FOR ALL
USING (recruiter_id IN (SELECT id FROM public.recruiters WHERE user_id = auth.uid()));

-- Index for faster lookups
CREATE INDEX idx_recruiter_events_recruiter_id_start_time ON public.recruiter_events(recruiter_id, start_time);

-- Trigger to update 'updated_at' timestamp
CREATE TRIGGER handle_recruiter_events_updated_at
BEFORE UPDATE ON public.recruiter_events
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 