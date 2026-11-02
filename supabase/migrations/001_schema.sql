-- ==============================================================================
-- Migration: 001_schema.sql
-- Description: Core Schema for VoiceCoach AI (Profiles, Sessions, Turns, Reports, Logs)
-- ==============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'interview_type') then
    create type interview_type as enum ('behavioral','technical','hr_situational','mixed');
  end if;
  if not exists (select 1 from pg_type where typname = 'difficulty_level') then
    create type difficulty_level as enum ('easy','standard','challenging');
  end if;
  if not exists (select 1 from pg_type where typname = 'experience_level') then
    create type experience_level as enum ('student','fresher','0_1_years','1_3_years');
  end if;
  if not exists (select 1 from pg_type where typname = 'session_status') then
    create type session_status as enum ('created','in_progress','completed','abandoned');
  end if;
  if not exists (select 1 from pg_type where typname = 'turn_kind') then
    create type turn_kind as enum ('main','follow_up');
  end if;
end $$;

-- Shared updated_at trigger function
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  target_role_domain text,
  target_role_title text check (char_length(target_role_title) <= 80),
  experience_level experience_level not null default 'fresher',
  native_language text not null default 'English',
  feedback_language text not null default 'English',
  onboarding_completed boolean not null default false,
  save_audio_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Interview sessions
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_domain text not null,
  role_title text not null check (char_length(role_title) between 2 and 80),
  interview_type interview_type not null,
  difficulty difficulty_level not null default 'standard',
  question_count int not null check (question_count between 3 and 10),
  job_description text check (char_length(job_description) <= 4000),
  feedback_language text not null default 'English',
  enable_follow_ups boolean not null default true,
  silence_auto_stop_seconds int not null default 4 check (silence_auto_stop_seconds between 2 and 8),
  save_audio boolean not null default false,
  status session_status not null default 'created',
  current_main_index int not null default 0,
  question_plan jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_created on public.interview_sessions(user_id, created_at desc);

drop trigger if exists trg_sessions_updated on public.interview_sessions;
create trigger trg_sessions_updated before update on public.interview_sessions
  for each row execute function set_updated_at();

-- Turns (one row per question/answer pair)
create table if not exists public.interview_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  turn_index int not null,
  kind turn_kind not null default 'main',
  parent_turn_id uuid references public.interview_turns(id) on delete set null,
  question_text text not null,
  question_topic text,
  transcript text,
  duration_seconds numeric(6,2),
  word_count int,
  words_per_minute numeric(6,2),
  filler_total int,
  filler_breakdown jsonb not null default '{}'::jsonb,
  scores jsonb,            -- {clarity, pacing, confidence_tone, structure, relevance, vocabulary_grammar, overall}
  feedback jsonb,          -- full validated AI turn analysis
  audio_path text,         -- only populated when save_audio = true
  created_at timestamptz not null default now(),
  unique (session_id, turn_index)
);

create index if not exists idx_turns_session on public.interview_turns(session_id, turn_index);
create index if not exists idx_turns_user on public.interview_turns(user_id);

-- Final reports
create table if not exists public.session_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  overall_score int not null check (overall_score between 0 and 100),
  category_scores jsonb not null,
  report jsonb not null,   -- full validated AI report
  avg_wpm numeric(6,2),
  total_fillers int,
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_user_created on public.session_reports(user_id, created_at desc);

-- Rate-limit / usage audit (server writes via service role)
create table if not exists public.ai_usage_log (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null,
  model text,
  input_audio_seconds numeric(6,2),
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_usage_user_time on public.ai_usage_log(user_id, created_at desc);

