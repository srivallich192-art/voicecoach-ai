-- ==============================================================================
-- Migration: 002_rls_and_storage.sql
-- Description: Row Level Security (RLS) & Audio Storage Bucket Configuration
-- ==============================================================================

-- Enable Row Level Security on all core tables
alter table public.profiles enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_turns enable row level security;
alter table public.session_reports enable row level security;
alter table public.ai_usage_log enable row level security;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Interview Sessions Policies
-- ------------------------------------------------------------------------------
drop policy if exists "sessions_select_own" on public.interview_sessions;
create policy "sessions_select_own" on public.interview_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.interview_sessions;
create policy "sessions_insert_own" on public.interview_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.interview_sessions;
create policy "sessions_update_own" on public.interview_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "sessions_delete_own" on public.interview_sessions;
create policy "sessions_delete_own" on public.interview_sessions
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Interview Turns Policies
-- ------------------------------------------------------------------------------
drop policy if exists "turns_select_own" on public.interview_turns;
create policy "turns_select_own" on public.interview_turns
  for select using (auth.uid() = user_id);

drop policy if exists "turns_insert_own" on public.interview_turns;
create policy "turns_insert_own" on public.interview_turns
  for insert with check (auth.uid() = user_id);

drop policy if exists "turns_update_own" on public.interview_turns;
create policy "turns_update_own" on public.interview_turns
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "turns_delete_own" on public.interview_turns;
create policy "turns_delete_own" on public.interview_turns
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- Session Reports Policies
-- ------------------------------------------------------------------------------
drop policy if exists "reports_select_own" on public.session_reports;
create policy "reports_select_own" on public.session_reports
  for select using (auth.uid() = user_id);

drop policy if exists "reports_insert_own" on public.session_reports;
create policy "reports_insert_own" on public.session_reports
  for insert with check (auth.uid() = user_id);

drop policy if exists "reports_delete_own" on public.session_reports;
create policy "reports_delete_own" on public.session_reports
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- AI Usage Log: Deny direct client operations (service role bypasses RLS)
-- ------------------------------------------------------------------------------
-- No client policies created; default deny for anon/authenticated roles.

-- ------------------------------------------------------------------------------
-- Storage: Private Bucket for optional interview audio recordings
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('interview-audio', 'interview-audio', false)
on conflict (id) do update set public = false;

drop policy if exists "audio_select_own" on storage.objects;
create policy "audio_select_own" on storage.objects
  for select
  using (bucket_id = 'interview-audio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "audio_delete_own" on storage.objects;
create policy "audio_delete_own" on storage.objects
  for delete
  using (bucket_id = 'interview-audio' and (storage.foldername(name))[1] = auth.uid()::text);

