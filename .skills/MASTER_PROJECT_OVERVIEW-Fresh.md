# MASTER PROJECT OVERVIEW
## Jessie & Amor — Malaysia · Singapore Trip 2026
### Full Reverse-Engineered Documentation
> **Purpose:** This document is the single authoritative reference for every AI tool, developer, or AI coding agent working on this project. Every file, every type, every Supabase table, every sync behavior, every component, and every design decision is documented here.

---

## TABLE OF CONTENTS

1. [Project Identity & Purpose](#1-project-identity--purpose)
2. [Tech Stack](#2-tech-stack)
3. [File & Folder Structure](#3-file--folder-structure)
4. [TypeScript Types (types.ts)](#4-typescript-types-typests)
5. [Data Layer](#5-data-layer)
6. [Supabase — Full Backend Documentation](#6-supabase--full-backend-documentation)
7. [Offline Cache System](#7-offline-cache-system)
8. [Exchange Rates](#8-exchange-rates)
9. [Routing System](#9-routing-system)
10. [App.tsx — Master Orchestrator](#10-apptsx--master-orchestrator)
11. [Components — Full Reference](#11-components--full-reference)
12. [PWA & Deployment](#12-pwa--deployment)
13. [Design System & Styling](#13-design-system--styling)
14. [State Management Summary](#14-state-management-summary)
15. [Supabase Realtime — Full Channel Map](#15-supabase-realtime--full-channel-map)
16. [Auth System](#16-auth-system)
17. [Offline/Online Sync Logic — Deep Dive](#17-offlineonline-sync-logic--deep-dive)
18. [Third-Party APIs & External Services](#18-third-party-apis--external-services)
19. [Firebase (Unused/Remnant)](#19-firebase-unusedremnant)
20. [Regression Test Script](#20-regression-test-script)
21. [Known Patterns & Conventions](#21-known-patterns--conventions)

---

## 1. Project Identity & Purpose

| Field | Value |
|---|---|
| **App Name** | Jessie & Amor's Malaysia · Singapore Trip 2026 |
| **Short Name** | Jessie & Amor |
| **Trip Key** | `jessie-amor-malaysia-singapore` |
| **Trip Dates** | July 12–15, 2026 |
| **Trip Countdown Target** | July 11, 2026 00:00:00 (day before departure) |
| **Travelers** | Jessie Jayr (admin) + Amor |
| **Page Title** | `J&A Malaysia · Singapore Trip 2026` |
| **Footer Copyright** | `© 2026 Jessie & Amor. All rights reserved.` |
| **Theme Color** | `#0B3530` (dark forest green) |
| **Background Color (PWA)** | `#F8FAFC` |

**What this app is:** A fully private, collaborative, real-time travel itinerary web app (installable as a PWA) built for two specific travelers. It is NOT a generic product — all data, destinations, costs, and notes are hardcoded for a Malaysia + Singapore trip. The app supports:
- Viewing a 4-day structured daily itinerary with timeline
- Real-time collaborative budget tracking with cloud sync
- Interactive map with custom pins (Leaflet)
- Trip notes + checklist (shared, synced)
- Travel diary with photo upload
- Offline operation with localStorage fallback + sync-on-reconnect

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | React | 19.0.1 |
| **Language** | TypeScript | ~5.8.2 |
| **Build Tool** | Vite | 6.2.3 |
| **CSS** | Tailwind CSS v4 (Vite plugin) | 4.1.14 |
| **Animation** | `motion` (Framer Motion successor) | 12.23.24 |
| **Icons** | `lucide-react` | 0.546.0 |
| **Icon Font** | Tabler Icons Webfont (CDN, for itinerary items) | latest |
| **Map** | Leaflet | 1.9.4 |
| **Backend/Auth** | Supabase (`@supabase/supabase-js`) | 2.107.0 |
| **Geocoding (Map)** | Nominatim (OpenStreetMap) | free API |
| **Exchange Rates** | Frankfurter API (`api.frankfurter.dev`) | free API |
| **PWA** | `vite-plugin-pwa` | 1.3.0 |
| **Deployment** | Vercel | SPA rewrite config |
| **Dev Scripts** | `tsx` (TypeScript runner) | 4.21.0 |
| **AI/Gemini** | `@google/genai` (in deps, not actively used in UI) | 2.4.0 |

---

## 3. File & Folder Structure

```
/
├── index.html                     # SPA entry, PWA manifest link, Tabler icon CDN
├── vite.config.ts                 # Vite + React + Tailwind + PWA config
├── vercel.json                    # SPA rewrites: all paths → /index.html
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript config
├── .env.local                     # REAL Supabase credentials (DO NOT COMMIT)
├── .env.example                   # Template for env vars
├── metadata.json                  # App name/description, Gemini capability flag
├── SUPABASE_SETUP.md              # Full SQL setup guide for all tables + RLS
├── jessieandamor-b3c10-firebase-adminsdk-*.json  # Firebase service account (REMNANT — NOT USED IN CODE)
│
├── public/
│   └── pwa-icon.svg               # PWA icon (512x512, any+maskable)
│
├── scripts/
│   └── offline-sync-regression-check.ts  # Node regression tests for sync logic
│
└── src/
    ├── main.tsx                   # React root mount
    ├── App.tsx                    # Master orchestrator (83KB — entire app state)
    ├── index.css                  # Global CSS + Tailwind + custom animations
    ├── vite-env.d.ts              # Vite env type declarations
    ├── types.ts                   # All shared TypeScript types
    │
    ├── assets/
    │   └── images/
    │       ├── malaysia_singapore_hero_019e9d4d.png   # Hero banner (2.5MB)
    │       ├── batu_caves_1780754522244.png            # Day 13 image (1.15MB)
    │       ├── kl_skyline_1780754501759.png            # KL skyline (956KB)
    │       └── saloma_bridge_1780754540468.png         # Day 13 image (1MB)
    │
    ├── data/
    │   ├── itinerary.ts           # Default DayPlan[], default Expense[], exchangeRates, initialNotes
    │   ├── code1Itinerary.ts      # Rich itinerary data (2537 lines) — all types + content for UI rendering
    │   └── mapItinerary.ts        # MapItineraryData types, coordinate hints, initial map state
    │
    ├── lib/
    │   ├── supabase.ts            # Supabase client init + table name exports + tripKey
    │   ├── offlineCache.ts        # localStorage cache layer with dirty-flag tracking
    │   └── exchangeRates.ts       # Live exchange rate fetch (Frankfurter API)
    │
    └── components/
        ├── Navigation.tsx         # Top header + bottom nav + countdown + share/download modals + side drawer
        ├── Hero.tsx               # Hero image card with metadata overlay
        ├── Legend.tsx             # Color legend pills for itinerary categories
        ├── DailyItineraryView.tsx # 4-day timeline view with timeline items
        ├── BudgetSummaryHeader.tsx # Budget cards per day + live spend toggle
        ├── AlertBox.tsx           # Amber alert box (booking reminders)
        ├── TipCard.tsx            # Individual trip tip card
        ├── BudgetTab.tsx          # Full budget CRUD with voice input + filter
        ├── MapTab.tsx             # Leaflet map with custom pins + Nominatim geocoding
        ├── NotesTab.tsx           # Notes + checklist tab
        ├── DiaryTab.tsx           # Travel diary with photo upload
        ├── AuthPanel.tsx          # OAuth sign-in modal (Google/GitHub/Facebook)
        ├── DestinationInfoModal.tsx # Destination guide modal (transport, food, tips)
        └── RichText.tsx           # Renders Segment[] (text/strong/place) with Google Maps links
```

---

## 4. TypeScript Types (types.ts)

### Enums / Union Types

```typescript
type ExpenseCategory = "Transport" | "Accommodation" | "Food" | "Sightseeing" | "Other";
type PaymentMethod = "Cash" | "Debit" | "Credit Card";
type ExpenseCurrency = "RM" | "PHP" | "SGD";
type SyncStatus = "synced" | "pending";
type DiaryEntryType = "Food" | "Landmark" | "Hotel" | "Transport" | "Shopping" | "Moment" | "Other";
type ItineraryItemType = "transport" | "accommodation" | "sightseeing" | "food" | "general";
```

### Interfaces

#### `Expense`
```typescript
interface Expense {
  id: string;             // Unique string ID (e.g. "e-1", UUID, or timestamp)
  day: number;            // Trip day number: 12, 13, 14, or 15
  category: ExpenseCategory;
  item: string;           // Description of the expense
  amount: number;         // Amount in RM (Malaysian Ringgit, the base currency)
  paidWith: PaymentMethod;
  originalAmount?: number;       // If paid in non-RM currency
  originalCurrency?: ExpenseCurrency;
  createdBy?: string;            // Supabase user ID of creator
  savedByUserId?: string;        // Redundant alias for createdBy
  savedByEmail?: string;         // Email of creator
  createdAt?: string;            // ISO datetime string
  syncStatus?: SyncStatus;
}
```

#### `ItineraryItem`
```typescript
interface ItineraryItem {
  id: string;
  time: string;          // e.g. "08:00 AM"
  title: string;
  type: ItineraryItemType;
  description: string;
  estimatedCost?: string;
  costValue?: number;    // Numerical for calculations
  isCreditCard?: boolean; // Excluded from cash budget
  duration?: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  syncStatus?: SyncStatus;
}
```

#### `DayPlan`
```typescript
interface DayPlan {
  day: number;           // 12, 13, 14, 15
  dateStr: string;       // e.g. "July 12"
  title: string;
  budgetRange: string;   // e.g. "RM 130–200"
  costMin: number;
  costMax: number;
  badge: string;         // e.g. "WALK-ONLY DAY"
  items: ItineraryItem[];
  images?: { title: string; url: string; label: string }[];
}
```

#### `TravelNote`
```typescript
interface TravelNote {
  id: string;
  title: string;
  content: string;
  category: "Rule" | "Requirement" | "General";
  createdAt: string;
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  syncStatus?: SyncStatus;
}
```

#### `ChecklistItem`
```typescript
interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  syncStatus?: SyncStatus;
}
```

#### `DiaryEntry`
```typescript
interface DiaryEntry {
  id: string;
  title: string;
  description: string;
  type: DiaryEntryType;
  rating: number;           // 1–5, decimals allowed (stored as 1 decimal place)
  dateVisited: string;      // YYYY-MM-DD
  locationName: string;
  cityOrCountry?: string;
  tags: string[];
  wouldRevisit: boolean;
  photoPath?: string;       // Supabase Storage path: {tripKey}/{userId}/{entryId}-photo.jpg
  photoUrl?: string;        // Signed URL (1hr TTL) or base64 data: URL (local, pending upload)
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  createdAt: string;        // ISO datetime
  updatedAt?: string;
  syncStatus?: SyncStatus;
}
```

### Types from `code1Itinerary.ts`

```typescript
type Category = 'train' | 'bus' | 'food' | 'spot' | 'hotel' | 'walk' | 'free';
type TagVariant = 'train' | 'bus' | 'food' | 'walk' | 'spot' | 'hotel' | 'free';
type Segment = TextSegment | StrongSegment | PlaceSegment;
// TextSegment: { kind: 'text'; value: string }
// StrongSegment: { kind: 'strong'; value: string }
// PlaceSegment: { kind: 'place'; label: string; placeType?: string; mapQuery: string }
type ItineraryId = 'main' | 'partner';
```

### Types from `mapItinerary.ts`

```typescript
interface MapDestination {
  id: string; name: string; lat: number; lng: number; time: string; notes: string;
  createdBy?: string; savedByUserId?: string; savedByEmail?: string; syncStatus?: SyncStatus;
}
interface MapDay { day: number; label: string; title: string; destinations: MapDestination[]; }
interface MapItineraryData { version: number; updatedAt: string; days: MapDay[]; }
```

---

## 5. Data Layer

### `src/data/itinerary.ts`
- **`exchangeRates`** — Static fallback: `{ php: 15.5807, sgd: 0.3228 }` (1 RM = these values)
- **`defaultDayPlans`** — Array of 4 `DayPlan` objects for days 12–15 with full itinerary items and GPS coordinates
- **`defaultExpenses`** — Array of 13 seed `Expense` objects (IDs: "e-1" to "e-13") covering all 4 days
- **`initialNotes`** — 3 seed `TravelNote` objects (shared coffee rule, transport hack, bus booking tip)

### `src/data/code1Itinerary.ts` (2537 lines)
This is the **rich visual data file**. It contains:
- Full type definitions for the visual itinerary (separate from `types.ts`)
- `GUIDE_KEYS` — ~65 guide keys (typed enum) for destination-specific modal content
- `FOOD_GUIDE_KEYS` — 11 food guide keys for food area guides
- `buildGuideForItem(item)` — Function that returns a `DestinationGuide` object based on `guideKey`
- `selectedItinerary` — The currently active itinerary plan (export from `ITINERARIES_BY_ID[DEFAULT_ITINERARY_ID]`)
- Contains: hero data, legend items, budget summary cards, alert box, tip cards, day sections, footer text
- Two itinerary plans exist: `'main'` and `'partner'` (switchable by changing `DEFAULT_ITINERARY_ID`)

### `src/data/mapItinerary.ts`
- `MAP_ITINERARY_VERSION = 3` — Used to detect schema migrations
- `coordinateHints` — Array of ~55 `{ match: string[], coords }` objects for fuzzy name→lat/lng resolution
- `resolveCoordinatesFromName(name)` — Looks up coordinates from hint list by string matching
- `normalizeMapItinerary(data)` — Migrates old versions to current schema
- `buildEmptyMapItinerary()` — Returns empty `MapItineraryData`
- `buildInitialMapItinerary()` — Returns pre-populated default map data from itinerary days

---

## 6. Supabase — Full Backend Documentation

### Connection

```typescript
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;   // "https://mmkbwzpualvspgxymgna.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = hasSupabaseConfig ? createClient(supabaseUrl!, supabaseAnonKey!) : null;
```
**The client is nullable.** All Supabase operations are guarded with `if (!supabase) return`.

### Table Name Constants (configurable via env)

| Export | Default Table Name | env var |
|---|---|---|
| `supabaseExpenseTable` | `budget_expenses` | `VITE_SUPABASE_EXPENSES_TABLE` |
| `supabaseChecklistTable` | `trip_checklist_items` | `VITE_SUPABASE_CHECKLIST_TABLE` |
| `supabaseMapTable` | `trip_map_itineraries` | `VITE_SUPABASE_MAP_TABLE` |
| `supabaseNotesTable` | `trip_scratch_notes` | `VITE_SUPABASE_NOTES_TABLE` |
| `supabaseDiaryTable` | `trip_diary_entries` | `VITE_SUPABASE_DIARY_TABLE` |
| `supabaseDiaryBucket` | `trip-diary-photos` | `VITE_SUPABASE_DIARY_BUCKET` |
| `tripKey` | `jessie-amor-malaysia-singapore` | `VITE_TRIP_KEY` |

---

### Database Schema (Full SQL)

#### Table: `budget_expenses`
```sql
create table public.budget_expenses (
  id                  text primary key,
  trip_key            text not null,          -- "jessie-amor-malaysia-singapore"
  day                 integer not null,        -- 12, 13, 14, or 15
  category            text not null,          -- ExpenseCategory union
  item                text not null,          -- Description
  amount              numeric not null,       -- In RM
  paid_with           text not null,          -- "Cash" | "Debit" | "Credit Card"
  original_amount     numeric,               -- Optional original amount in foreign currency
  original_currency   text,                  -- "RM" | "PHP" | "SGD"
  saved_by_user_id    text,                  -- Supabase auth.users.id
  saved_by_email      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index budget_expenses_trip_key_idx on public.budget_expenses (trip_key);
```

**RLS Policies:** All CRUD operations require `auth.role() = 'authenticated'`. No row-level ownership restriction — any authenticated user can read/edit any expense. However, the app logic only writes/modifies rows owned by the current user (unless `isAdmin = true`).

#### Table: `trip_checklist_items`
```sql
create table public.trip_checklist_items (
  id                  text primary key,
  trip_key            text not null,
  text                text not null,
  completed           boolean not null default false,
  saved_by_user_id    text,
  saved_by_email      text,
  updated_at          timestamptz not null default now()
);
create index trip_checklist_items_trip_key_idx on public.trip_checklist_items (trip_key);
```

**RLS Policies:** All CRUD requires `auth.role() = 'authenticated'`.

#### Table: `trip_scratch_notes`
```sql
create table public.trip_scratch_notes (
  trip_key            text primary key,       -- One row per trip (upserted by trip_key)
  notes               jsonb not null,         -- Array of TravelNote objects (entire collection)
  saved_by_user_id    text,
  saved_by_email      text,
  updated_at          timestamptz not null default now()
);
```

**IMPORTANT:** This table stores all notes as a **single JSONB array** keyed by `trip_key`. It is NOT a row-per-note table. The entire notes array is serialized and stored as one record, then upserted on every change using `onConflict: "trip_key"`.

**RLS Policies:** All CRUD requires `auth.role() = 'authenticated'`.

#### Table: `trip_map_itineraries`
```sql
create table public.trip_map_itineraries (
  trip_key            text primary key,       -- One row per trip
  data                jsonb not null,         -- Full MapItineraryData object
  saved_by_user_id    text,
  saved_by_email      text,
  updated_at          timestamptz not null default now()
);
```

**IMPORTANT:** Same pattern as notes — entire `MapItineraryData` object is stored as JSONB in one row per trip. Upserted on every map change using `onConflict: "trip_key"`.

**RLS Policies:** All CRUD requires `auth.role() = 'authenticated'`.

#### Table: `trip_diary_entries`
```sql
create table public.trip_diary_entries (
  id                  text primary key,
  trip_key            text not null,
  title               text not null,
  description         text not null,
  type                text not null,          -- DiaryEntryType
  rating              integer not null check (rating between 1 and 5),  -- NOTE: stored as integer, app normalizes
  date_visited        date,
  location_name       text,
  city_or_country     text,
  tags                text[] not null default '{}',
  would_revisit       boolean not null default false,
  photo_path          text,                  -- Supabase Storage path
  saved_by_user_id    text,
  saved_by_email      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index trip_diary_entries_trip_key_idx on public.trip_diary_entries (trip_key);
create index trip_diary_entries_type_idx on public.trip_diary_entries (type);
create index trip_diary_entries_rating_idx on public.trip_diary_entries (rating);
```

**RLS Policies:** All CRUD requires `auth.role() = 'authenticated'`.

#### Table: `user_profiles` (inferred from code — NOT in SUPABASE_SETUP.md)
```sql
-- Referenced in App.tsx but SQL not included in setup guide
-- Must be created manually
create table public.user_profiles (
  id        text primary key,  -- matches auth.users.id
  is_admin  boolean
);
```
**Used to determine:** If current user is admin (`isAdmin = true`). Admin users can manage ALL expenses/diary/checklist entries regardless of ownership. Non-admins can only edit their own entries.

#### Storage Bucket: `trip-diary-photos`
```sql
insert into storage.buckets (id, name, public)
values ('trip-diary-photos', 'trip-diary-photos', false);
-- public = false → requires signed URLs
```

**Photo path format:** `{tripKey}/{userId}/{entryId}-photo.jpg`
e.g. `jessie-amor-malaysia-singapore/abc-123/entry-001-photo.jpg`

**Signed URL TTL:** 1 hour (`createSignedUrl(path, 60 * 60)`)

**Storage RLS Policies:** All operations (select, insert, update, delete) on `storage.objects` require `bucket_id = 'trip-diary-photos'` AND `auth.role() = 'authenticated'`.

---

### Supabase Queries — Full Reference

#### Read: Expenses (bootstrap on load)
```typescript
supabase
  .from("budget_expenses")
  .select("id, trip_key, day, category, item, amount, paid_with, original_amount, original_currency, saved_by_user_id, saved_by_email, created_at")
  .eq("trip_key", tripKey)
  .order("day", { ascending: true })
  .order("item", { ascending: true })
```

#### Read: Checklist (bootstrap on load)
```typescript
supabase
  .from("trip_checklist_items")
  .select("id, trip_key, text, completed, saved_by_user_id, saved_by_email")
  .eq("trip_key", tripKey)
  .order("id", { ascending: true })
```

#### Read: Notes (bootstrap on load)
```typescript
supabase
  .from("trip_scratch_notes")
  .select("trip_key, notes, saved_by_user_id, saved_by_email")
  .eq("trip_key", tripKey)
  .maybeSingle()    // returns null if no row exists, not an error
```

#### Read: Diary (bootstrap, session required)
```typescript
supabase
  .from("trip_diary_entries")
  .select("id, trip_key, title, description, type, rating, date_visited, location_name, city_or_country, tags, would_revisit, photo_path, saved_by_user_id, saved_by_email, created_at, updated_at")
  .eq("trip_key", tripKey)
  .order("created_at", { ascending: false })
  .order("id", { ascending: false })
```

#### Read: User Profile (admin check)
```typescript
supabase
  .from("user_profiles")
  .select("is_admin")
  .eq("id", session.user.id)
  .maybeSingle()
```

#### Read: Map (in MapTab component)
```typescript
supabase
  .from("trip_map_itineraries")
  .select("trip_key, data, saved_by_user_id, saved_by_email, updated_at")
  .eq("trip_key", tripKey)
  .maybeSingle()
```

#### Write: Expenses (upsert)
```typescript
supabase
  .from("budget_expenses")
  .upsert(payload, { onConflict: "id" })
// payload: SupabaseExpenseRow[] with updated_at: new Date().toISOString()
```

#### Write: Expenses (delete removed IDs)
```typescript
supabase
  .from("budget_expenses")
  .delete()
  .in("id", removedIds)
```

#### Write: Checklist (upsert)
```typescript
supabase
  .from("trip_checklist_items")
  .upsert(payload, { onConflict: "id" })
```

#### Write: Checklist (delete)
```typescript
supabase.from("trip_checklist_items").delete().in("id", removedIds)
```

#### Write: Notes (upsert — entire array)
```typescript
supabase
  .from("trip_scratch_notes")
  .upsert({ trip_key, notes: [...], saved_by_user_id, saved_by_email, updated_at }, { onConflict: "trip_key" })
```

#### Write: Diary (upsert)
```typescript
supabase
  .from("trip_diary_entries")
  .upsert(payload, { onConflict: "id" })
// includes trip_key in each row
```

#### Write: Diary (delete entries)
```typescript
supabase.from("trip_diary_entries").delete().in("id", removedIds)
```

#### Write: Map (upsert — entire object)
```typescript
supabase
  .from("trip_map_itineraries")
  .upsert({ trip_key, data: mapItineraryData, saved_by_user_id, saved_by_email, updated_at }, { onConflict: "trip_key" })
```

#### Storage: Upload diary photo
```typescript
supabase.storage
  .from("trip-diary-photos")
  .upload(photoPath, blob, { contentType: blob.type || "image/jpeg", upsert: true })
```

#### Storage: Create signed URL
```typescript
supabase.storage.from("trip-diary-photos").createSignedUrl(photoPath, 60 * 60)
```

#### Storage: Delete diary photos
```typescript
supabase.storage.from("trip-diary-photos").remove(photoPaths)
```

---

## 7. Offline Cache System

**File:** `src/lib/offlineCache.ts`

### Overview
All 5 data types (expenses, checklist, notes, map, diary) are cached in `localStorage`. This allows the app to work fully offline and sync when the connection returns.

### Cache Key Format
```typescript
makeOfflineCacheKey(tripKey, dataset)
// Returns: "offline-cache:jessie-amor-malaysia-singapore:expenses"
// Other keys: :checklist, :notes, :map, :diary
```

### Cache Schema
```typescript
type CachedDataset<T> = {
  data: T;                    // The actual data (array or object)
  syncedSignature: string;    // JSON.stringify of last synced state (for change detection)
  dirty: boolean;             // true = local changes not yet pushed to Supabase
  syncedIds?: string[];       // IDs present at last successful sync (used to detect remote deletes)
}
```

### Key Functions
- `readCachedDataset<T>(key)` → `CachedDataset<T> | null` — Reads from localStorage
- `writeCachedDataset<T>(key, snapshot)` — Writes to localStorage, dispatches custom `offline-cache-update` event
- `useCachedDataset<T>(key)` — React hook: reads + listens to storage changes
- `useOnlineStatus()` — React hook: tracks `navigator.onLine` via `online`/`offline` events

### Cross-tab Sync
When `writeCachedDataset` is called:
1. Writes to `localStorage`
2. Dispatches `CustomEvent("offline-cache-update", { detail: { key } })`

`useCachedDataset` listens to both `storage` events (cross-tab) and `offline-cache-update` events (same-tab), refreshing state when the relevant key changes.

---

## 8. Exchange Rates

**File:** `src/lib/exchangeRates.ts`

- **Base currency:** MYR (Malaysian Ringgit)
- **API:** `https://api.frankfurter.dev/v1/latest?base=MYR&symbols=PHP,SGD`
- **Fallback rates (static):** `PHP: 15.5807`, `SGD: 0.3228` (from `itinerary.ts`)
- **Fetch strategy:** `cache: "no-store"`, fires once on mount, updates React state
- **Source field:** `"live"` if API succeeded, `"fallback"` if failed or not yet loaded
- **Format helper:** `formatLiveRateLabel(rates)` → `"RM 1 = PHP 15.58 | RM 1 = SGD 0.3228"`
- Used in: `BudgetTab`, `BudgetSummaryHeader` for currency conversion display

---

## 9. Routing System

**Router type:** Manual client-side routing using `window.history.pushState` + `popstate` event. **No React Router, no routing library.**

### Routes

| Path | Component/View | Description |
|---|---|---|
| `/` | Itinerary tab | Hero + Legend + DailyItineraryView + BudgetSummaryHeader + AlertBox + Tips + Map promo |
| `/budget` | `<BudgetTab>` | Expense tracking, add/delete, voice input, filters |
| `/map` | `<MapTab>` | Leaflet interactive map with custom destinations |
| `/notes` | `<NotesTab>` | Notes + checklist |
| `/diary` | `<DiaryTab>` | Travel diary with photo upload |
| `/account` | Mobile account card (inline in App.tsx) | User info, share, print, sign out (mobile only) |

### Navigation Logic
```typescript
const navigateTo = (path: string) => {
  if (path === activeRoute) return;
  window.history.pushState({}, "", path);
  setActiveRoute(routeFromPath(path));
  window.scrollTo({ top: 0, behavior: "smooth" });
};
// popstate listener restores route on browser back/forward
```

Vercel is configured to rewrite all paths to `/index.html` (`vercel.json`), enabling direct URL access.

---

## 10. App.tsx — Master Orchestrator

App.tsx is the **single top-level component** (83KB). It owns ALL state and ALL Supabase interaction. Child components receive data + setters via props — there is no Context, no Redux, no Zustand.

### State Variables

| State | Type | Initial Value |
|---|---|---|
| `activeRoute` | `string` | from `window.location.pathname` |
| `session` | `Session \| null` | `null` |
| `authReady` | `boolean` | `!supabase` (true if no Supabase config) |
| `showAuthModal` | `boolean` | `false` |
| `authError` | `string` | `""` |
| `isAdmin` | `boolean` | `false` |
| `showLiveSpends` | `boolean` | `false` |
| `selectedGuide` | `DestinationGuide \| null` | `null` |
| `pullDistance` | `number` | `0` |
| `isRefreshing` | `boolean` | `false` |
| `expensesLoaded` | `boolean` | `!hasSupabaseConfig` |
| `checklistLoaded` | `boolean` | `!hasSupabaseConfig` |
| `notesLoaded` | `boolean` | `!hasSupabaseConfig` |
| `diaryLoaded` | `boolean` | `!hasSupabaseConfig` |
| `expenses` | `Expense[]` | from localStorage cache |
| `notes` | `TravelNote[]` | from localStorage cache |
| `checklist` | `ChecklistItem[]` | from localStorage cache |
| `diaryEntries` | `DiaryEntry[]` | from localStorage cache |
| `expenseSyncNonce` | `number` | `0` |
| `checklistSyncNonce` | `number` | `0` |
| `notesSyncNonce` | `number` | `0` |
| `diarySyncNonce` | `number` | `0` |

### Ref Variables (non-reactive, used for sync logic)

| Ref | Purpose |
|---|---|
| `expenseSignatureRef` | JSON signature of last synced expense state |
| `checklistSignatureRef` | JSON signature of last synced checklist |
| `notesSignatureRef` | JSON signature of last synced notes |
| `diarySignatureRef` | JSON signature of last synced diary |
| `expenseDirtyRef` | Is there a pending local expense change? |
| `checklistDirtyRef` | Is there a pending local checklist change? |
| `notesDirtyRef` | Is there a pending local notes change? |
| `diaryDirtyRef` | Is there a pending local diary change? |
| `expenseIdsRef` | IDs present at last sync (deletion detection) |
| `checklistIdsRef` | IDs present at last sync |
| `notesIdsRef` | IDs present at last sync |
| `diaryIdsRef` | IDs present at last sync |
| `diarySyncedEntriesRef` | Map of id→DiaryEntry at last sync (for realtime protection) |
| `diaryPhotoRetryBlockRef` | Prevents infinite retry loops for failed photo uploads |
| `expenseSyncInFlightRef` | Lock to prevent concurrent expense syncs |
| `checklistSyncInFlightRef` | Lock for checklist |
| `notesSyncInFlightRef` | Lock for notes |
| `diarySyncInFlightRef` | Lock for diary |
| `expenseSyncQueuedRef` | Queued retry for expenses |
| `checklistSyncQueuedRef` | Queued retry for checklist |
| `notesSyncQueuedRef` | Queued retry for notes |
| `diarySyncQueuedRef` | Queued retry for diary |
| `expenseSnapshotOwnerRef` | Tracks which user's snapshot is loaded (resets on user change) |
| `checklistSnapshotOwnerRef` | Same for checklist |
| `diarySnapshotOwnerRef` | Same for diary |

### Pull-to-Refresh
- Trigger distance: 84px (`PULL_REFRESH_TRIGGER`)
- Max pull distance: 108px (`PULL_REFRESH_MAX`)
- Resistance multiplier: 0.55 (friction)
- On release at threshold: `window.location.reload()` after 180ms
- Touch resistance + transform: `translate3d(0, ${pullDistance * 0.28}px, 0)` on main content
- Only active on mobile (`window.innerWidth < 768`) + at top of scroll
- Pull indicator: floating pill with `RefreshCw` (rotating based on progress) or `Loader2` (on refresh)

### `currentUser` object
```typescript
type CurrentUserInfo = { userId: string; email: string; isAdmin: boolean; };
// Derived from session: non-null only when session exists
```

### Ownership Logic
- **Expenses:** `createdBy` OR `savedByUserId` field
- **Checklist:** `createdBy` OR `savedByUserId` field  
- **Diary:** `createdBy` OR `savedByUserId` field
- **Notes:** globally owned (anyone authenticated can edit all notes)
- **Admin:** `isAdmin = true` → can read/write ALL entries regardless of owner

---

## 11. Components — Full Reference

### `Navigation.tsx`
**Props:** `activeTab`, `setActiveTab`, `session`, `isOnline`, `onOpenAuth`, `onSignOut`, `metadata`

**Features:**
- **Desktop header:** Dark forest green (`#0B3530`) with app title, online/offline dot indicator, Login/Logout button, Share, Download, Print buttons, desktop nav tabs (Itinerary/Budget/Map/Notes/Diary)
- **Mobile header:** Compact dark header with title, online dot, Share + Download icon buttons
- **Countdown timer:** Live countdown (updates every second) to July 11, 2026. Shows `{days} DAYS LEFT` + `HH:MM:SS`. Hides on scroll > 10px.
- **Bottom nav (mobile):** 5 tabs: Itinerary (`CalendarDays`), Budget (`Wallet`), Map (`Map`), Notes (`NotebookText`), + "More" (`Menu`) → opens side drawer
- **Side drawer (mobile):** Slides in from left, lists all 5 tabs including Diary, shows user avatar/initials + email + logout button at bottom. Dismissible via overlay click or Escape key.
- **Share modal:** Shows QR code placeholder + URL copy button. Uses `navigator.share` if available.
- **Download modal:** Two options — Export as JSON (metadata object) or Print/PDF via `window.print()`
- **Active tab indicator (desktop):** `border-b-2 border-[#7ec96b]` + `bg-white/12`
- **Active tab indicator (mobile bottom nav):** Text + icon turn `text-[#7ec96b]`
- **Connection dot:** `bg-emerald-400` (online) / `bg-red-500` (offline)

### `Hero.tsx`
**Props:** `hero: HeroData`

- Full-width rounded image (`malaysia_singapore_hero_019e9d4d.png`) with gradient overlay
- Floating white card (bottom-left) with: eyebrow text, title, subtitle, meta tags (badges), and a rich-text note
- Hover: subtle scale on image (`group-hover:scale-[1.01]`)
- Animation: `animate-in fade-in slide-in-from-bottom-4`

### `Legend.tsx`
**Props:** `items: LegendItem[]`

- Horizontal scrollable row of pills (colored dot + label)
- Each item: `{ label: string, color: string }` where color is a hex/css value

### `DailyItineraryView.tsx`
**Props:** `days: DaySectionData[]`, `onInfoClick?: (item) => void`

- Renders 4 day sections (July 12–15) in vertical timeline layout
- Each `TimelineItemData` is a card with: time, title, category badge (color-coded), description (`RichText`), tags, cost, optional image
- Category badge colors: `train`=blue, `bus`=amber, `food`=rose, `spot`=violet, `hotel`=emerald, `walk`=stone, `free`=sky
- "Info" button on each item triggers `onInfoClick` → opens `DestinationInfoModal`
- Day section headers show the day number, date, title, and a day badge (e.g. "TRANSIT-HEAVY DAY")
- Day 13 has images (Batu Caves, Saloma Bridge) displayed in the day header

### `BudgetSummaryHeader.tsx`
**Props:** `cards`, `expenses`, `showLiveSpends`, `setShowLiveSpends`, `exchangeRates`

- Horizontal scrollable set of budget cards per day (Day 12–15) + one total card
- Each card: label, RM budget range, PHP conversion
- **Live Spends toggle:** When enabled, each day card shows actual expenses summed from `expenses` state (Cash + Debit only, Credit Card excluded)
- Currency display: RM amount + PHP equivalent + SGD equivalent (calculated live)
- Total card shows combined budget for all days

### `BudgetTab.tsx`
**Props:** `expenses`, `setExpenses`, `isSupabaseConnected`, `isOnline`, `canEdit`, `currentUser`, `exchangeRates`

**Features:**
1. **Expense list** — Filterable by category + by day. Shows description, amount (RM + PHP conversion), payment method, sync status dot, who added it (email prefix or user ID prefix), delete button (own entries only, or admin)
2. **Add expense form** — Fields: description (text), amount + currency selector (RM/PHP/SGD), day selector (12–15), category selector, payment method selector
3. **Currency conversion on input** — If PHP or SGD entered, converts to RM using live exchange rates before storing
4. **Voice input** — Uses `window.SpeechRecognition` / `webkitSpeechRecognition`. Parses natural language:
   - Recognizes number words ("twenty", "fifty") → digits
   - Recognizes currency aliases ("ringgit"→RM, "peso"→PHP, "sing dollar"→SGD)
   - Recognizes payment aliases ("debit card"→Debit, "credit"→Credit Card)
   - Recognizes category aliases ("grab"→Transport, "hotel"→Accommodation, etc.)
   - Voice corrections: "egg dose" → "egg toast"
5. **Sync status indicators:** Green dot (synced), amber dot (pending), spinner (syncing)
6. **Filter controls:** Category dropdown + day dropdown
7. **Summary row:** Total cash spend (RM + PHP), total credit card spend

### `MapTab.tsx`
**Props:** `session`, `canEdit`, `isOnline`, `currentUser`

**Uses:** Leaflet for map rendering, Nominatim for geocoding

**Features:**
1. **Leaflet map** — Centered on KL initially, shows numbered circular markers for all destinations
2. **Days panel** — Left sidebar listing trip days with their destinations
3. **Destination list** — Per-day list of pins, each showing name, time, notes, edit/delete buttons
4. **Add destination form** — Fields: name (with autocomplete), time (30-min interval dropdown), notes, lat/lng (auto-filled from geocoding)
5. **Nominatim geocoding** — As user types in name field, searches `https://nominatim.openstreetmap.org/search?q=...&format=json&limit=5`, shows dropdown suggestions, auto-fills lat/lng on selection
6. **Coordinate hints** — ~55 hardcoded location hints (checked first before Nominatim)
7. **"Locate me" button** — Uses `navigator.geolocation.getCurrentPosition()`, shows user on map
8. **Marker icons** — Custom `L.divIcon` HTML: numbered circles, dark green when selected, white with border when unselected
9. **Map popup** — Shows stop number, name, time, notes
10. **Supabase sync** — Map is stored as a single JSONB blob per trip key. Saved on every change with debounce.
11. **Offline cache** — Map data cached in localStorage under `offline-cache:{tripKey}:map`
12. **Version migration** — `normalizeMapItinerary()` upgrades old versions to `MAP_ITINERARY_VERSION = 3`
13. **Route line** — Polyline connecting all destinations in a day in order

### `NotesTab.tsx`
**Props:** `notes`, `setNotes`, `checklist`, `setChecklist`, `isOnline`, `canEdit`, `currentUser`

**Two sections:**

**Notes section:**
- List of `TravelNote` cards with title, content, category badge (Rule=red, Requirement=amber, General=blue)
- Add form: title, content, category selector
- Delete button (own notes or admin)
- Sync status dot per note

**Checklist section:**
- List of `ChecklistItem` rows with checkbox toggle + text
- Add form: text field + submit
- Delete button (own items or admin)
- Copy all checklist text to clipboard button
- Sync status dot per item

### `DiaryTab.tsx`
**Props:** `diaryEntries`, `setDiaryEntries`, `isOnline`, `canEdit`, `currentUser`

**Features:**
1. **Diary list** — Cards showing: photo (thumbnail), title, type icon, date, location, rating (stars), tags, "Would revisit" badge
2. **Search** — Filter by title/description/tags/location (client-side, case-insensitive)
3. **Filter by type** — Dropdown: All + all DiaryEntryType values
4. **Sort** — By date (default newest first) or by rating
5. **Add/Edit form** — Fields: title, description, type, rating (1–5 star selector), date, location name, city/country, tags (comma-separated), would revisit toggle, photo upload
6. **Photo handling:**
   - User selects image file → compressed to max 1200px × 1200px, quality 0.82, as JPEG data URL
   - Stored as `photoUrl` with `data:` prefix while pending upload
   - On sync: `fetch(photoUrl)` → blob → `supabase.storage.upload()` → signed URL replaces data URL
   - `isDiaryLocalPhotoUrl(photoUrl)` = `photoUrl.startsWith("data:")`
7. **Image compression** — `compressImageFileToDataUrl(file)` uses `<canvas>` to resize/compress
8. **Sync status** per entry: pending if `syncStatus === "pending"` OR has local data: URL photo

### `AuthPanel.tsx`
**Props:** `open`, `title`, `description`, `session`, `loading`, `errorMessage`, `onClose`, `onSignIn`, `onSignOut`, `isConfigured`

- Modal overlay (z-index 5000, highest in the app)
- Dark gradient header (`#0B3530` → `#18534C`)
- Three OAuth provider buttons: Google (`G`), GitHub (`GH`), Facebook (`f`)
- Shows current user email if signed in
- Shows warning if Supabase not configured
- Disabled state if `loading` or `!isConfigured`
- Escape key closes modal

### `DestinationInfoModal.tsx`
**Props:** `guide: DestinationGuide | null`, `onClose`

- Modal with guide for a specific itinerary item
- Shows: title, summary, service/ticket info, transport steps (goHere/buyThis/tapHere/getOffHere/extra), food guide (nearby foods, suggested order, tips, price note), general steps, tips
- Escape key + body overflow lock
- Scroll within modal (`max-h-[88vh] overflow-y-auto`)

### `AlertBox.tsx`
**Props:** `alert: AlertBoxData`

- Amber-colored info box with icon
- `title` + `body` (Segment[] rendered via `RichText`)
- Typically used for booking reminders (e.g. "Book Malacca buses in advance")

### `TipCard.tsx`
**Props:** `tip: TipCardData`

- White card with emoji icon + description (Segment[] via RichText)

### `RichText.tsx`
**Props:** `segments: Segment[]`

Renders an array of text segments:
- `{ kind: "text", value }` → plain `<span>`
- `{ kind: "strong", value }` → `<strong>`
- `{ kind: "place", label, placeType?, mapQuery }` → styled `<a>` linking to Google Maps directions from "My Location" to `mapQuery`

---

## 12. PWA & Deployment

### PWA Configuration
```javascript
// vite.config.ts
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "Jessie & Amor's Malaysia Singapore",
    short_name: "Jessie & Amor",
    theme_color: "#0B3530",
    background_color: "#F8FAFC",
    display: "standalone",       // Hides browser chrome when installed
    start_url: "/",
    icons: [{ src: "/pwa-icon.svg", sizes: "512x512", purpose: "any maskable" }]
  }
})
```
- **Auto-update:** Service worker registers itself and updates automatically
- **Install prompt:** Standard browser install prompt (no custom prompt code)
- **Offline:** Service worker caches app shell; data falls back to localStorage

### Vercel Deployment
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
All routes (including `/budget`, `/map`, etc.) return `index.html` for client-side routing.

### Build Scripts
```bash
npm run dev      # vite --port=3000 --host=0.0.0.0
npm run build    # vite build
npm run preview  # vite preview
npm run lint     # tsc --noEmit
npm run test:offline-sync  # tsx scripts/offline-sync-regression-check.ts
```

### `index.html` — Key Meta Tags
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1, user-scalable=no">
<meta name="theme-color" content="#0B3530">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/pwa-icon.svg">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
```
- `viewport-fit=cover` + `env(safe-area-inset-*)` — handles iPhone notch/home bar
- `maximum-scale=1, user-scalable=no` — prevents zoom on mobile
- Tabler Icons are loaded as a webfont for itinerary icon rendering

---

## 13. Design System & Styling

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Primary dark | `#0B3530` | Nav background, buttons, headings |
| Primary mid | `#18534C` | Button hover, header gradient |
| Primary light | `#1a3328` | Mobile header |
| Accent green | `#88B04B` | Active state, countdown, eyebrow text, underline |
| Accent green light | `#7ec96b` | Countdown badge, active mobile nav |
| Background | `bg-stone-50` | App background |
| Footer | `#041D1A` | Footer background (darkest) |
| Selection | `#88B04B/35` bg, `#0b3530` text | Browser text selection highlight |

### Typography
- **Headers/Display:** `font-serif` (browser default serif)
- **Body/UI:** `font-sans` (browser default sans)
- **Monospace/Labels:** `font-mono` (browser default mono)

### Z-Index Stack (bottom to top)
| z-index | Element |
|---|---|
| 50 | Share/Download modals |
| 60 | DestinationInfoModal |
| 1100 | Mobile top header |
| 1200 | Bottom nav |
| 1350 | Side drawer overlay |
| 1600 | Pull-to-refresh indicator |
| 5000 | AuthPanel |

### Spacing & Layout
- Max content width: `max-w-7xl` with `mx-auto`
- Mobile padding: `px-4`
- Desktop padding: `px-8`
- Mobile bottom padding: `pb-[calc(8.5rem+env(safe-area-inset-bottom))]` (clears bottom nav + iPhone home bar)
- Desktop top padding: none (nav is in document flow)
- Mobile top padding: `pt-[112px]` (clears fixed mobile header)

### Print Styles
- `.no-print` class → `display: none` on print
- Navigation, auth panel, hero section, tips, map promo are all hidden on print
- Print shows: daily itinerary, budget summary, notes, checklist

### Animations
- `animate-in fade-in` — fade in on mount
- `animate-in zoom-in` — modal appear
- `slide-in-from-bottom-4` — hero card
- `slide-in-from-left-12` — side drawer
- `animate-spin` — loading spinner
- `animate-spin-slow` — Compass icon on map promo (custom in `index.css`)
- Pull-to-refresh: `cubic-bezier(0.16, 1, 0.3, 1)` spring easing

---

## 14. State Management Summary

**Pattern:** Prop-drilling from `App.tsx` down to all components. No context API, no global state library.

```
App.tsx (owns all state)
├── expenses / setExpenses → BudgetTab
├── notes / setNotes → NotesTab
├── checklist / setChecklist → NotesTab
├── diaryEntries / setDiaryEntries → DiaryTab
├── session, isOnline → Navigation, BudgetTab, MapTab, NotesTab, DiaryTab, AuthPanel
├── currentUser → BudgetTab, MapTab, NotesTab, DiaryTab
├── exchangeRates → BudgetTab, BudgetSummaryHeader
└── selectedGuide / setSelectedGuide → DestinationInfoModal
```

**Map state** is an exception — `MapTab` has its own internal state for the map itinerary, synced independently with its own Supabase channel (not through App.tsx).

---

## 15. Supabase Realtime — Full Channel Map

### Channel 1: `trip-sync-{tripKey}` = `trip-sync-jessie-amor-malaysia-singapore`
**Subscribed when:** `authReady === true` AND `isOnline === true`

| Table | Events | Filter | Behavior |
|---|---|---|---|
| `budget_expenses` | `*` (INSERT/UPDATE/DELETE) | `trip_key=eq.jessie-amor-malaysia-singapore` | If not dirty: merges/removes row in local state |
| `trip_checklist_items` | `*` | `trip_key=eq.jessie-amor-malaysia-singapore` | If not dirty: merges/removes row |
| `trip_scratch_notes` | `*` | `trip_key=eq.jessie-amor-malaysia-singapore` | If not dirty: replaces entire notes array |

**Dirty guard:** If `expenseDirtyRef.current === true` (local unsync'd changes exist), realtime updates for expenses are **completely ignored** to prevent overwriting local work.

### Channel 2: `trip-diary-sync-{tripKey}` = `trip-diary-sync-jessie-amor-malaysia-singapore`
**Subscribed when:** `authReady === true` AND `isOnline === true` AND `session !== null` (diary requires login)

| Table | Events | Filter | Behavior |
|---|---|---|---|
| `trip_diary_entries` | `*` | none (checked client-side) | Filters by `row.trip_key === tripKey`. For INSERT/UPDATE: hydrates photo URL, then merges. For DELETE: removes if not protected. |

**Diary realtime protection — `isDiaryEntryProtectedFromRealtime(entry, syncedEntry)`:**
An incoming realtime event is **ignored** for a specific entry if:
1. Entry's `syncStatus === "pending"` (local unsaved changes), OR
2. Entry has a local data URL photo (`photoUrl.startsWith("data:")`)
3. The local entry differs from the last known synced version (content mismatch guard)

This prevents overwriting local diary edits with stale realtime pushes.

### Auth Token Setup for Realtime
```typescript
// On session load:
supabase.realtime.setAuth(session?.access_token ?? "");
// On auth state change:
supabase.realtime.setAuth(nextSession?.access_token ?? "");
```
This is required for realtime channels to respect RLS policies.

### Map Channel (inside MapTab.tsx — separate channel)
MapTab manages its own realtime subscription internally (not via App.tsx), subscribing to `trip_map_itineraries` changes for the trip.

---

## 16. Auth System

**Provider:** Supabase Auth with OAuth

**Providers enabled:** Google, GitHub, Facebook

**Flow:**
1. User clicks Login → `showAuthModal = true` → `AuthPanel` opens
2. User selects provider → `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + pathname } })`
3. Browser redirects to OAuth provider → callback returns to app URL
4. `supabase.auth.getSession()` resolves the session on page load
5. `supabase.auth.onAuthStateChange()` keeps session fresh
6. On sign out: `supabase.auth.signOut()`

**Session type:** `Session` from `@supabase/supabase-js`

**User metadata fields used:**
- `user.id` → `userId` in `currentUser`
- `user.email` → `email` in `currentUser`
- `user.user_metadata.full_name` or `.name` → display name in Navigation
- `user.user_metadata.avatar_url` or `.picture` → avatar in Navigation sidebar
- `user.email.split("@")[0]` → fallback display name

**Admin check:** On session load, queries `user_profiles` table for `is_admin` flag. If `true`, user can CRUD all entries regardless of ownership.

**Auth-gated features:**
- Writing to Supabase (all sync operations require `session !== null`)
- Diary tab data loading (requires session — diary is auth-only)
- Diary realtime subscription (requires session)
- Photo upload (requires `currentSavedBy` which requires session)

---

## 17. Offline/Online Sync Logic — Deep Dive

### Core Pattern (same for expenses, checklist, diary)
1. **On mount:** Read from localStorage cache → initialize state with `syncStatus` = `"pending"` if cache was dirty, else `"synced"`
2. **On first online + authReady:** Fetch remote data → `mergeBootstrapItems()` to reconcile
3. **On state change:** `useEffect` watches state → computes signature → if different from last synced signature → mark dirty → debounced upsert after 300ms
4. **On realtime event:** If NOT dirty → apply remote change immediately
5. **On reconnect (isOnline changes):** Sync effects re-run because `isOnline` is in dependency arrays

### `mergeBootstrapItems<T>(localItems, remoteItems, syncedIds)`
Merge algorithm at bootstrap:
- Items that exist locally with `syncStatus = "pending"` → keep local version (local wins)
- Items that exist in both remote + local (synced) → use remote version
- Items only in remote → add to merged
- Items only in local (pending) → add to merged
- Items in `syncedIds` but not in local → treated as deleted locally → excluded from merged

### Signature-based Change Detection
```typescript
// Expenses: signature excludes updated_at to avoid spurious changes
const expenseSignature = (expenses) =>
  JSON.stringify(expenses.map(e => { const { updated_at, ...row } = expenseToRow(e); return row; }));
```
If `currentSignature === lastSignature` → no sync needed.

### Sync Debounce
All writes are debounced by 300ms using `window.setTimeout`. If state changes again during the 300ms, the timeout is cleared and restarted.

### In-Flight Lock Pattern
```
if (syncInFlight) { queue = true; return; }
syncInFlight = true;
// ... do sync ...
syncInFlight = false;
if (queue) { queue = false; triggerNonce++; }  // re-triggers the effect
```

### Notes Special Case
Notes are stored as a SINGLE JSONB blob. The entire `TravelNote[]` array is serialized and sent as one Supabase row every time any note changes. There is no per-note upsert.

### Photo Upload Flow (Diary)
```
1. User picks photo → compress → store as data: URL in state (syncStatus = "pending")
2. Sync effect fires → detects data: URL → isDiaryLocalPhotoUrl = true
3. fetch(photoUrl) → blob → supabase.storage.upload(photoPath, blob, { upsert: true })
4. createSignedUrl(photoPath) → signedUrl
5. Update entry: photoPath = resolved path, photoUrl = signedUrl, syncStatus = "synced"
6. Upsert diary row to Supabase
```

---

## 18. Third-Party APIs & External Services

| Service | URL | Usage | Auth |
|---|---|---|---|
| Supabase | `https://mmkbwzpualvspgxymgna.supabase.co` | Database + Auth + Storage + Realtime | Anon key |
| Frankfurter (Exchange Rates) | `https://api.frankfurter.dev/v1/latest?base=MYR&symbols=PHP,SGD` | Live MYR→PHP/SGD rates | None (free) |
| Nominatim (Geocoding) | `https://nominatim.openstreetmap.org/search` | Map pin geocoding (place name → lat/lng) | None (User-Agent required) |
| Google Maps | `https://www.google.com/maps/dir/?api=1&...` | Links in RichText `<PlaceSegment>` | None (just links) |
| Tabler Icons CDN | `https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css` | Icon webfont for itinerary | None |
| Google Genai (not active) | n/a | Package installed (`@google/genai`) but not used in current UI code | Would need GEMINI_API_KEY |

---

## 19. Firebase (Unused/Remnant)

The file `jessieandamor-b3c10-firebase-adminsdk-fbsvc-c8a892818d.json` is a Firebase Admin SDK service account credential file for project `jessieandamor-b3c10`. 

**This file is NOT used anywhere in the codebase.** No Firebase SDK is installed, no Firebase imports exist. This is a leftover artifact, likely from an earlier iteration or planning phase.

> ⚠️ **Security Note:** This file contains a real private key. It should be removed from the repository and added to `.gitignore`. The key should be revoked in the Firebase console.

---

## 20. Regression Test Script

**File:** `scripts/offline-sync-regression-check.ts`
**Run via:** `npm run test:offline-sync` (uses `tsx`)

Tests the offline sync merge logic (checklist, notes, diary) using an in-memory `Map` as a localStorage substitute. Covers scenarios like:
- Merging local pending changes with remote data
- Deletion detection via `syncedIds`
- Notes signature comparison
- Diary entry protection rules (pending status, local photo URL)

The test uses Node's `assert/strict` module. No test framework (Jest/Vitest) is used.

---

## 21. Known Patterns & Conventions

### ID Generation
- Expenses: `"e-" + Date.now()` or similar
- Notes: `"note-" + Date.now()`
- Checklist: timestamp-based string
- Diary: UUID or timestamp
- Map destinations: timestamp-based

### `createdBy` vs `savedByUserId` Redundancy
Both fields exist because the data model evolved. The app checks `createdBy ?? savedByUserId` in all ownership lookups. Both fields are set to the same value (`currentUser.userId`) on creation.

### Sync Status Dot Display Convention
- 🟢 Green (`bg-emerald-500`) = `"synced"`
- 🟡 Amber (`bg-amber-500`) = `"pending"` or `"dirty"` or `"unsynced"`
- ⚫ Slate (`bg-slate-500`) = `"syncing"` (in-progress)

### `canEdit` Prop Pattern
Most tab components receive `canEdit: Boolean(session)`. Any add/delete/edit operation inside a component is gated on `if (!canEdit) return`. This prevents mutations when not logged in.

### `currentUser.isAdmin` Usage
Admin flag: if `true`, user sees and can delete ALL entries. If `false`, user can only see their own entries' delete buttons. Read access is always global (all expenses/checklist/notes visible to all authenticated users).

### `no-print` CSS Class
Applied to navigation, hero, tip cards, map promo block, auth panels — hides them in print/PDF export. Core itinerary content (day plans, budget, notes) is print-friendly.

### Tailwind v4 Note
This project uses Tailwind CSS v4 which uses the `@tailwindcss/vite` Vite plugin instead of `postcss`. There is no `tailwind.config.js` file. All custom animations are in `src/index.css`.

### `motion` Library
`motion` (v12, the rebranded Framer Motion) is installed but usage appears limited. Most animations use Tailwind's `animate-in` utility classes (from `tailwindcss-animate` or similar plugin baked into Tailwind v4).

---

## APPENDIX: Environment Variables Reference

```bash
# Required for Supabase features (auth, sync, storage)
VITE_SUPABASE_URL="https://mmkbwzpualvspgxymgna.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_2_4KxEW5GhFn1eiW6E_2YA_lK5Cxg3b"

# Optional — defaults shown
VITE_SUPABASE_EXPENSES_TABLE="budget_expenses"
VITE_SUPABASE_CHECKLIST_TABLE="trip_checklist_items"
VITE_SUPABASE_MAP_TABLE="trip_map_itineraries"
VITE_SUPABASE_NOTES_TABLE="trip_scratch_notes"
VITE_SUPABASE_DIARY_TABLE="trip_diary_entries"
VITE_SUPABASE_DIARY_BUCKET="trip-diary-photos"
VITE_TRIP_KEY="jessie-amor-malaysia-singapore"

# For Gemini AI (package installed, feature not active)
GEMINI_API_KEY="..."
APP_URL="https://your-deployed-url.vercel.app"
```

---

*End of MASTER_PROJECT_OVERVIEW.md — Generated by reverse-engineering assets.zip*
*Last updated: June 2026*
