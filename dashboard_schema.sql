-- Dashboard tables

-- 1. applications table
create table public.applications (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade,
  job_title text not null,
  company text not null,
  status text not null, -- 'applied', 'interviewed', 'rejected', 'accepted'
  created_at timestamptz default now()
);

-- 2. documents table
create table public.documents (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  type text not null, -- 'cv', 'cover_letter', etc.
  url text not null,
  created_at timestamptz default now()
);

-- 3. certifications table
create table public.certifications (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  issuer text not null,
  date_obtained timestamptz not null,
  created_at timestamptz default now()
);

-- 4. Enable RLS for dashboard tables
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.certifications enable row level security;

-- 5. RLS Policies for applications
create policy "Users can view their own applications" on public.applications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own applications" on public.applications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own applications" on public.applications
  for update using (auth.uid() = user_id);

create policy "Users can delete their own applications" on public.applications
  for delete using (auth.uid() = user_id);

-- 6. RLS Policies for documents
create policy "Users can view their own documents" on public.documents
  for select using (auth.uid() = user_id);

create policy "Users can insert their own documents" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own documents" on public.documents
  for update using (auth.uid() = user_id);

create policy "Users can delete their own documents" on public.documents
  for delete using (auth.uid() = user_id);

-- 7. RLS Policies for certifications
create policy "Users can view their own certifications" on public.certifications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own certifications" on public.certifications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own certifications" on public.certifications
  for update using (auth.uid() = user_id);

create policy "Users can delete their own certifications" on public.certifications
  for delete using (auth.uid() = user_id);

-- 8. Trigger to update user profile completion on document insert
create or replace function public.update_user_profile_completion_on_document_insert()
returns trigger as $$
begin
  -- Update user profile completion logic here if needed
  return new;
end;
$$ language plpgsql;

create trigger update_user_profile_completion_after_document_insert
after insert on public.documents
for each row
execute procedure public.update_user_profile_completion_on_document_insert();

-- 9. Trigger to update user profile completion on certification insert
create or replace function public.update_user_profile_completion_on_certification_insert()
returns trigger as $$
begin
  -- Update user profile completion logic here if needed
  return new;
end;
$$ language plpgsql;

create trigger update_user_profile_completion_after_certification_insert
after insert on public.certifications
for each row
execute procedure public.update_user_profile_completion_on_certification_insert(); 