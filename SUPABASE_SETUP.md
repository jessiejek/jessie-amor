# Supabase Setup

This app uses Supabase for:

- Social login
- Shared trip budget sync
- Shared trip checklist sync
- Shared trip map sync
- Shared trip scratch notes sync
- Shared trip diary sync

## 1) Enable Auth Providers

In the Supabase dashboard, enable whichever OAuth providers you want to support:

- Google
- GitHub
- Facebook

Use the provider client IDs and secrets from each provider's developer console.

## 2) Set Environment Variables

Add these to your local `.env` file:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_SUPABASE_EXPENSES_TABLE="budget_expenses"
VITE_SUPABASE_CHECKLIST_TABLE="trip_checklist_items"
VITE_SUPABASE_MAP_TABLE="trip_map_itineraries"
VITE_SUPABASE_NOTES_TABLE="trip_scratch_notes"
VITE_SUPABASE_DIARY_TABLE="trip_diary_entries"
VITE_SUPABASE_DIARY_BUCKET="trip-diary-photos"
VITE_TRIP_KEY="jessie-amor-malaysia-singapore"
```

## 3) Create the tables

Run this in the Supabase SQL editor:

```sql
create table if not exists public.budget_expenses (
  id text primary key,
  trip_key text not null,
  day integer not null,
  category text not null,
  item text not null,
  amount numeric not null,
  paid_with text not null,
  original_amount numeric,
  original_currency text,
  saved_by_user_id text,
  saved_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budget_expenses_trip_key_idx
  on public.budget_expenses (trip_key);

alter table public.budget_expenses add column if not exists saved_by_user_id text;
alter table public.budget_expenses add column if not exists saved_by_email text;
alter table public.budget_expenses add column if not exists created_at timestamptz not null default now();

alter table public.budget_expenses enable row level security;

create policy "Authenticated users can read expenses"
  on public.budget_expenses
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can write expenses"
  on public.budget_expenses
  for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update expenses"
  on public.budget_expenses
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete expenses"
  on public.budget_expenses
  for delete
  using (auth.role() = 'authenticated');

create table if not exists public.trip_checklist_items (
  id text primary key,
  trip_key text not null,
  text text not null,
  completed boolean not null default false,
  saved_by_user_id text,
  saved_by_email text,
  updated_at timestamptz not null default now()
);

create index if not exists trip_checklist_items_trip_key_idx
  on public.trip_checklist_items (trip_key);

alter table public.trip_checklist_items add column if not exists saved_by_user_id text;
alter table public.trip_checklist_items add column if not exists saved_by_email text;

alter table public.trip_checklist_items enable row level security;

create policy "Authenticated users can read checklist items"
  on public.trip_checklist_items
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can write checklist items"
  on public.trip_checklist_items
  for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update checklist items"
  on public.trip_checklist_items
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete checklist items"
  on public.trip_checklist_items
  for delete
  using (auth.role() = 'authenticated');

create table if not exists public.trip_map_itineraries (
  trip_key text primary key,
  data jsonb not null,
  saved_by_user_id text,
  saved_by_email text,
  updated_at timestamptz not null default now()
);

alter table public.trip_map_itineraries add column if not exists saved_by_user_id text;
alter table public.trip_map_itineraries add column if not exists saved_by_email text;

alter table public.trip_map_itineraries enable row level security;

create policy "Authenticated users can read map itineraries"
  on public.trip_map_itineraries
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can write map itineraries"
  on public.trip_map_itineraries
  for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update map itineraries"
  on public.trip_map_itineraries
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete map itineraries"
  on public.trip_map_itineraries
  for delete
  using (auth.role() = 'authenticated');

-- DEPRECATED: The old trip_map_itineraries table above stored the entire map as a single JSONB blob.
-- The new per-destination table below is the current approach. Migrate data accordingly.

create table if not exists public.trip_map_destinations (
  id                text primary key,
  trip_key          text not null,
  day               integer not null,
  name              text not null,
  lat               numeric not null,
  lng               numeric not null,
  time              text not null default '09:00 AM',
  notes             text not null default '',
  created_by        text,
  saved_by_user_id  text,
  saved_by_email    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists trip_map_destinations_trip_key_idx
  on public.trip_map_destinations (trip_key);

create index if not exists trip_map_destinations_day_idx
  on public.trip_map_destinations (day);

alter table public.trip_map_destinations enable row level security;

create policy "Authenticated users can read map destinations"
  on public.trip_map_destinations
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert map destinations"
  on public.trip_map_destinations
  for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update map destinations"
  on public.trip_map_destinations
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete map destinations"
  on public.trip_map_destinations
  for delete
  using (auth.role() = 'authenticated');

create table if not exists public.trip_scratch_notes (
  trip_key text primary key,
  notes jsonb not null,
  saved_by_user_id text,
  saved_by_email text,
  updated_at timestamptz not null default now()
);

alter table public.trip_scratch_notes add column if not exists saved_by_user_id text;
alter table public.trip_scratch_notes add column if not exists saved_by_email text;

alter table public.trip_scratch_notes enable row level security;

create policy "Authenticated users can read scratch notes"
  on public.trip_scratch_notes
  for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can write scratch notes"
  on public.trip_scratch_notes
  for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update scratch notes"
  on public.trip_scratch_notes
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete scratch notes"
  on public.trip_scratch_notes
  for delete
  using (auth.role() = 'authenticated');

-- Diary bucket and table
insert into storage.buckets (id, name, public)
values ('trip-diary-photos', 'trip-diary-photos', false)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

create table if not exists public.trip_diary_entries (
  id text primary key,
  trip_key text not null,
  title text not null,
  description text not null,
  type text not null,
  rating integer not null check (rating between 1 and 5),
  date_visited date,
  location_name text,
  city_or_country text,
  tags text[] not null default '{}',
  would_revisit boolean not null default false,
  photo_path text,
  saved_by_user_id text,
  saved_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trip_diary_entries_trip_key_idx
  on public.trip_diary_entries (trip_key);

create index if not exists trip_diary_entries_type_idx
  on public.trip_diary_entries (type);

create index if not exists trip_diary_entries_rating_idx
  on public.trip_diary_entries (rating);

alter table public.trip_diary_entries enable row level security;

drop policy if exists "Authenticated users can read diary entries" on public.trip_diary_entries;
create policy "Authenticated users can read diary entries"
  on public.trip_diary_entries
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can write diary entries" on public.trip_diary_entries;
create policy "Authenticated users can write diary entries"
  on public.trip_diary_entries
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update diary entries" on public.trip_diary_entries;
create policy "Authenticated users can update diary entries"
  on public.trip_diary_entries
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete diary entries" on public.trip_diary_entries;
create policy "Authenticated users can delete diary entries"
  on public.trip_diary_entries
  for delete
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can read diary photos" on storage.objects;
create policy "Authenticated users can read diary photos"
  on storage.objects
  for select
  using (bucket_id = 'trip-diary-photos' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can upload diary photos" on storage.objects;
create policy "Authenticated users can upload diary photos"
  on storage.objects
  for insert
  with check (bucket_id = 'trip-diary-photos' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update diary photos" on storage.objects;
create policy "Authenticated users can update diary photos"
  on storage.objects
  for update
  using (bucket_id = 'trip-diary-photos' and auth.role() = 'authenticated')
  with check (bucket_id = 'trip-diary-photos' and auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete diary photos" on storage.objects;
create policy "Authenticated users can delete diary photos"
  on storage.objects
  for delete
  using (bucket_id = 'trip-diary-photos' and auth.role() = 'authenticated');
```

## 5) Notes

- The app uses `VITE_TRIP_KEY` so both travelers sync to the same trip record.
- Budget, checklist, map, and scratch notes now cache locally in the browser. When a signed-in device is online, those changes sync to Supabase automatically.
- Diary entries sync the same way, with private photo uploads stored in the `trip-diary-photos` bucket using signed URLs.
- If you add more trip sections later, reuse the same `trip_key` pattern.
