# Supabase Setup

This app uses Supabase for:

- Social login
- Shared trip budget sync
- Shared trip checklist sync
- Shared trip map sync
- Shared trip scratch notes sync

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
  updated_at timestamptz not null default now()
);

create index if not exists budget_expenses_trip_key_idx
  on public.budget_expenses (trip_key);

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
  updated_at timestamptz not null default now()
);

create index if not exists trip_checklist_items_trip_key_idx
  on public.trip_checklist_items (trip_key);

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
  updated_at timestamptz not null default now()
);

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

create table if not exists public.trip_scratch_notes (
  trip_key text primary key,
  notes jsonb not null,
  updated_at timestamptz not null default now()
);

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
```

## 4) Notes

- The app uses `VITE_TRIP_KEY` so both travelers sync to the same trip record.
- Budget, checklist, map, and scratch notes data still fall back to local storage if Supabase is not configured.
- If you add more trip sections later, reuse the same `trip_key` pattern.
