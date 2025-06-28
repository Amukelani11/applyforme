-- Create users table if it doesn't exist
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  full_name text,
  subscription_status text not null default 'trial',
  trial_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow admin select" on public.users;
drop policy if exists "Allow select for authenticated users" on public.users;
drop policy if exists "Service role can insert users" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can view their own profile" on public.users;

-- Create new policies
create policy "Enable read access for authenticated users"
  on public.users for select
  using (auth.uid() = id);

create policy "Enable update for users based on id"
  on public.users for update
  using (auth.uid() = id);

create policy "Enable insert for service role"
  on public.users for insert
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Drop existing function and trigger if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create function to handle new user creation
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

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 