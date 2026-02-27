-- ============================================================
-- MIGRATION: categories + videos tables
-- Run this once in your Supabase SQL Editor
-- ============================================================

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  value        text not null unique,          -- e.g. 'concerts'
  label        text not null,                 -- e.g. 'Concerts'
  subtitle     text not null default '',      -- e.g. 'SWIPE TO EXPLORE NOISE.'
  icon         text not null default 'Camera', -- lucide icon name
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- RLS for categories
alter table public.categories enable row level security;

create policy "categories_public_read"
  on public.categories for select
  using (true);

create policy "categories_auth_write"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed default categories (matching existing photos)
insert into public.categories (value, label, subtitle, icon, sort_order) values
  ('concerts', 'Concerts',  'SWIPE TO EXPLORE NOISE.',        'Music',    1),
  ('street',   'Street',    'UNSCRIPTED URBAN REALITY.',       'Camera',   2),
  ('edits',    'Edits',     'THE ART OF COLORS.',              'Edit',     3),
  ('events',   'Events',    'CAPTURED MOMENTS & MEMORIES.',    'Calendar', 4)
on conflict (value) do nothing;


-- 2. VIDEOS TABLE
create table if not exists public.videos (
  id             uuid primary key default gen_random_uuid(),
  title          text,
  video_url      text not null,
  thumbnail_url  text,
  section        text,                    -- matches categories.value
  category       text,
  sort_order     integer default 0,
  created_at     timestamptz not null default now()
);

-- RLS for videos
alter table public.videos enable row level security;

create policy "videos_public_read"
  on public.videos for select
  using (true);

create policy "videos_auth_write"
  on public.videos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
