-- ==============================================================================
-- AirAware AI: Complete Supabase Database Schema & RLS Policies
-- Apply directly via the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  age_group text not null default 'Adult' check (age_group in ('Child', 'Teen', 'Adult', 'Senior Citizen')),
  health_conditions jsonb not null default '["No Known Condition"]'::jsonb,
  occupation text not null default 'Indoor Worker',
  activity_level text not null default 'Mostly Indoors',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Users can select their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Advisory History Table
create table if not exists public.advisory_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  location_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  temperature double precision,
  apparent_temperature double precision,
  humidity double precision,
  wind_speed double precision,
  uv_index double precision,
  precipitation double precision,
  aqi integer,
  pm25 double precision,
  pm10 double precision,
  no2 double precision,
  o3 double precision,
  co double precision,
  so2 double precision,
  pollution_risk text,
  heat_risk text,
  uv_risk text,
  overall_risk text,
  advisory jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_advisory_history_user_created 
  on public.advisory_history (user_id, created_at desc);

create index if not exists idx_advisory_history_location 
  on public.advisory_history (location_name);

alter table public.advisory_history enable row level security;

create policy "Users can select their own advisory history"
  on public.advisory_history for select using (auth.uid() = user_id);

create policy "Users can insert their own advisory history"
  on public.advisory_history for insert with check (auth.uid() = user_id);

create policy "Users can delete their own advisory history"
  on public.advisory_history for delete using (auth.uid() = user_id);
