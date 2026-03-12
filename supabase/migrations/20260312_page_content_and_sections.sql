-- ============================================================
-- MIGRATION: page_content + page_sections tables
-- Run this once in your Supabase SQL Editor
-- ============================================================

-- 1. PAGE CONTENT TABLE (editable text for each page section)
create table if not exists public.page_content (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.page_content enable row level security;

drop policy if exists "page_content_public_read" on public.page_content;
create policy "page_content_public_read"
  on public.page_content for select
  using (true);

drop policy if exists "page_content_auth_write" on public.page_content;
create policy "page_content_auth_write"
  on public.page_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed default content values
insert into public.page_content (key, value) values
  ('hero_subtitle',       'Mustafa Vision'),
  ('hero_title_line1',    'Light'),
  ('hero_title_line2',    'Motion'),
  ('hero_description',    'Capturing the raw frequency of live performance and the silent narrative of the streets.'),
  ('about_badge',         'The Artist'),
  ('about_title_line1',   'THE EYE BEHIND'),
  ('about_title_line2',   'THE LENS.'),
  ('about_bio_1',         '23-year-old concert and street photographer based in the heart of the music scene. I live for the chaos of a mosh pit, the quiet intensity of a backstage moment, and everything in between.'),
  ('about_bio_2',         'My work is about capturing energy you can feel—the sweat, the lights, the raw emotion that makes live music unforgettable.'),
  ('contact_badge',       'Get In Touch'),
  ('contact_title_line1', 'LET''S CREATE'),
  ('contact_title_line2', 'SOMETHING RAW.'),
  ('contact_description', 'Available for concert coverage, editorial shoots, and creative collaborations. Drop a line—let''s make it happen.'),
  ('contact_instagram_url', 'https://www.instagram.com/mustafavision?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==')
on conflict (key) do nothing;


-- 2. PAGE SECTIONS TABLE (controls order of sections on the page)
create table if not exists public.page_sections (
  id           uuid primary key default gen_random_uuid(),
  section_key  text not null unique,
  label        text not null,
  sort_order   integer not null default 0,
  visible      boolean not null default true
);

alter table public.page_sections enable row level security;

drop policy if exists "page_sections_public_read" on public.page_sections;
create policy "page_sections_public_read"
  on public.page_sections for select
  using (true);

drop policy if exists "page_sections_auth_write" on public.page_sections;
create policy "page_sections_auth_write"
  on public.page_sections for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed default section order
insert into public.page_sections (section_key, label, sort_order) values
  ('gallery', 'Gallery', 1),
  ('about',   'About',   2),
  ('contact', 'Contact', 3)
on conflict (section_key) do nothing;
