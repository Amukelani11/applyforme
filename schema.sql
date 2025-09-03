-- Talio Platform Complete Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Pricing Plans Table
create table public.pricing_plans (
  id text primary key check (id in ('basic', 'premium', 'pro')),
  name text not null,
  description text,
  initial_price numeric not null,
  regular_price numeric not null,
  initial_period_months integer not null default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Plan Features Table
create table public.plan_features (
  id bigserial primary key,
  plan_id text references public.pricing_plans(id) on delete cascade,
  feature_name text not null,
  feature_value text not null,
  feature_type text not null check (feature_type in ('application_limit', 'ai_improvements', 'recruiter_exposure', 'job_alerts', 'early_access', 'performance_report')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Users Table
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  subscription_status text default 'trial',
  subscription_plan text references public.pricing_plans(id),
  trial_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Subscriptions Table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  plan_id text references public.pricing_plans(id) not null,
  status text not null check (status in ('pending', 'active', 'cancelled', 'failed')),
  amount numeric not null,
  currency text not null default 'ZAR',
  payment_id text,
  payment_date timestamp with time zone,
  trial_end timestamp with time zone,
  initial_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Usage Tracking Table
create table public.usage_tracking (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade,
  feature_type text not null check (feature_type in ('application_limit', 'ai_improvements', 'recruiter_exposure', 'job_alerts', 'early_access', 'performance_report')),
  usage_count integer not null default 0,
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Applications Table
create table public.applications (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade,
  job_title text not null,
  company text not null,
  status text not null check (status in ('applied', 'interviewed', 'rejected', 'accepted')),
  applied_date timestamptz default now(),
  notes text,
  salary_range text,
  location text,
  contact_name text,
  contact_email text,
  next_steps text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Documents Table
create table public.documents (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('cv', 'cover_letter', 'certificate', 'other')),
  url text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Certifications Table
create table public.certifications (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  issuer text not null,
  date_obtained timestamptz not null,
  expiry_date timestamptz,
  credential_id text,
  credential_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.certifications enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.plan_features enable row level security;
alter table public.usage_tracking enable row level security;

-- Functions

-- 1. Handle New User
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, subscription_status, trial_end)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'trial',
    (now() + interval '14 days')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Handle Subscription Status Change
create or replace function public.handle_subscription_status_change()
returns trigger as $$
begin
  -- If subscription becomes active, update user's subscription status
  if new.status = 'active' and old.status != 'active' then
    update public.users
    set subscription_status = new.plan,
        trial_end = null,
        updated_at = now()
    where id = new.user_id;
  end if;

  -- If subscription is cancelled or failed, update user's subscription status
  if new.status in ('cancelled', 'failed') and old.status not in ('cancelled', 'failed') then
    update public.users
    set subscription_status = null,
        updated_at = now()
    where id = new.user_id;
  end if;

  return new;
end;
$$ language plpgsql;

-- 3. Handle Updated At
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 4. Update User Profile Completion
create or replace function public.update_user_profile_completion_on_document_insert()
returns trigger as $$
begin
  -- Update user profile completion logic here if needed
  return new;
end;
$$ language plpgsql;

-- 5. Update User Profile Completion on Certification
create or replace function public.update_user_profile_completion_on_certification_insert()
returns trigger as $$
begin
  -- Update user profile completion logic here if needed
  return new;
end;
$$ language plpgsql;

-- RLS Policies

-- 1. Users Table Policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Service role can insert users" on public.users
  for insert with check (true);

-- 2. Subscriptions Table Policies
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can create their own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Service role can manage all subscriptions"
  on public.subscriptions for all
  using (true);

-- 3. Applications Table Policies
create policy "Users can view their own applications" on public.applications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own applications" on public.applications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own applications" on public.applications
  for update using (auth.uid() = user_id);

create policy "Users can delete their own applications" on public.applications
  for delete using (auth.uid() = user_id);

-- 4. Documents Table Policies
create policy "Users can view their own documents" on public.documents
  for select using (auth.uid() = user_id);

create policy "Users can insert their own documents" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own documents" on public.documents
  for update using (auth.uid() = user_id);

create policy "Users can delete their own documents" on public.documents
  for delete using (auth.uid() = user_id);

-- 5. Certifications Table Policies
create policy "Users can view their own certifications" on public.certifications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own certifications" on public.certifications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own certifications" on public.certifications
  for update using (auth.uid() = user_id);

create policy "Users can delete their own certifications" on public.certifications
  for delete using (auth.uid() = user_id);

-- 6. Pricing Plans Table Policies
create policy "Anyone can view pricing plans"
  on public.pricing_plans for select
  using (true);

-- 7. Plan Features Table Policies
create policy "Anyone can view plan features"
  on public.plan_features for select
  using (true);

-- 8. Usage Tracking Table Policies
create policy "Users can view their own usage"
  on public.usage_tracking for select
  using (auth.uid() = user_id);

create policy "Service role can manage usage tracking"
  on public.usage_tracking for all
  using (true);

-- Triggers

-- 1. New User Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- 2. Subscription Status Change Trigger
create trigger handle_subscription_status_change
  after update on public.subscriptions
  for each row
  execute function public.handle_subscription_status_change();

-- 3. Updated At Triggers
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

create trigger handle_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();

create trigger handle_applications_updated_at
  before update on public.applications
  for each row
  execute function public.handle_updated_at();

create trigger handle_documents_updated_at
  before update on public.documents
  for each row
  execute function public.handle_updated_at();

create trigger handle_certifications_updated_at
  before update on public.certifications
  for each row
  execute function public.handle_updated_at();

-- 4. Profile Completion Triggers
create trigger update_user_profile_completion_after_document_insert
  after insert on public.documents
  for each row
  execute procedure public.update_user_profile_completion_on_document_insert();

create trigger update_user_profile_completion_after_certification_insert
  after insert on public.certifications
  for each row
  execute procedure public.update_user_profile_completion_on_certification_insert();

-- Create indexes for better performance
create index idx_users_email on public.users(email);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_applications_user_id on public.applications(user_id);
create index idx_documents_user_id on public.documents(user_id);
create index idx_certifications_user_id on public.certifications(user_id);
create index idx_applications_status on public.applications(status);
create index idx_subscriptions_status on public.subscriptions(status);

-- Insert default pricing plans
insert into public.pricing_plans (id, name, description, initial_price, regular_price, initial_period_months) values
  ('basic', 'Basic Plan', 'Essential features for job seekers', 49.00, 99.00, 3),
  ('premium', 'Premium Plan', 'Advanced features for serious job seekers', 99.00, 149.00, 3),
  ('pro', 'Pro Plan', 'Complete solution for professional job seekers', 149.00, 249.00, 3);

-- Insert plan features
insert into public.plan_features (plan_id, feature_name, feature_value, feature_type) values
  -- Basic Plan Features
  ('basic', 'Job Applications', '5 per week', 'application_limit'),
  ('basic', 'AI CV Improvements', '1 per month', 'ai_improvements'),
  ('basic', 'Recruiter Exposure', 'Limited', 'recruiter_exposure'),
  
  -- Premium Plan Features
  ('premium', 'Job Applications', '10 per day', 'application_limit'),
  ('premium', 'AI CV Improvements', '10 per month', 'ai_improvements'),
  ('premium', 'Recruiter Exposure', 'Priority', 'recruiter_exposure'),
  ('premium', 'Job Match Alerts', 'Enabled', 'job_alerts'),
  
  -- Pro Plan Features
  ('pro', 'Job Applications', 'Unlimited', 'application_limit'),
  ('pro', 'AI CV Improvements', 'Unlimited', 'ai_improvements'),
  ('pro', 'Recruiter Exposure', 'Top Priority', 'recruiter_exposure'),
  ('pro', 'Job Match Alerts', 'Enabled', 'job_alerts'),
  ('pro', 'Early Access', 'Enabled', 'early_access'),
  ('pro', 'Performance Report', 'Monthly', 'performance_report');

-- Function to check usage limits
create or replace function public.check_usage_limit(
  p_user_id uuid,
  p_feature_type text,
  p_plan_id text
)
returns boolean as $$
declare
  v_limit text;
  v_usage integer;
  v_period_start timestamptz;
  v_period_end timestamptz;
begin
  -- Get the feature limit for the user's plan
  select feature_value into v_limit
  from public.plan_features
  where plan_id = p_plan_id
  and feature_type = p_feature_type;

  -- Get current period
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  -- Get current usage
  select coalesce(sum(usage_count), 0) into v_usage
  from public.usage_tracking
  where user_id = p_user_id
  and feature_type = p_feature_type
  and period_start = v_period_start
  and period_end = v_period_end;

  -- Check if usage is within limits
  if v_limit = 'Unlimited' then
    return true;
  elsif v_limit like '% per day' then
    return v_usage < cast(split_part(v_limit, ' ', 1) as integer);
  elsif v_limit like '% per week' then
    return v_usage < cast(split_part(v_limit, ' ', 1) as integer);
  elsif v_limit like '% per month' then
    return v_usage < cast(split_part(v_limit, ' ', 1) as integer);
  else
    return false;
  end if;
end;
$$ language plpgsql security definer;

-- Function to track usage
create or replace function public.track_feature_usage(
  p_user_id uuid,
  p_feature_type text
)
returns void as $$
declare
  v_plan_id text;
  v_period_start timestamptz;
  v_period_end timestamptz;
begin
  -- Get user's current plan
  select subscription_plan into v_plan_id
  from public.users
  where id = p_user_id;

  -- Get current period
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  -- Insert or update usage tracking
  insert into public.usage_tracking (user_id, feature_type, usage_count, period_start, period_end)
  values (p_user_id, p_feature_type, 1, v_period_start, v_period_end)
  on conflict (user_id, feature_type, period_start)
  do update set usage_count = usage_tracking.usage_count + 1;
end;
$$ language plpgsql security definer; 