# MASTER PROJECT OVERVIEW
## Jessie & Amor's Malaysia and Singapore Trip 2026
### Current Codebase Reference

> Purpose: this document is meant to give an AI a dense, at-a-glance map of the whole project.
> It is intentionally oversized. It is not a marketing summary.
> It should reflect the current code, not an old snapshot.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [Current Stack](#2-current-stack)
3. [Repo Layout](#3-repo-layout)
4. [Types and Data Model](#4-types-and-data-model)
5. [Data Files](#5-data-files)
6. [Supabase and Sync](#6-supabase-and-sync)
7. [Offline Cache](#7-offline-cache)
8. [App State and Routes](#8-app-state-and-routes)
9. [Component Reference](#9-component-reference)
10. [Map, Diary, Budget, Settings Behaviors](#10-map-diary-budget-settings-behaviors)
11. [PWA and Deployment](#11-pwa-and-deployment)
12. [Scripts and Verification](#12-scripts-and-verification)
13. [External Services](#13-external-services)
14. [Current Notes](#14-current-notes)

---

## 1. Project Identity

This is a private travel planning app for two travelers:

- Jessie Jay Q. Rubi
- Rizza Amor L. Caguco

The app is built around a fixed Malaysia and Singapore trip and is not a generic itinerary product. It mixes:

- daily itinerary viewing
- budget tracking
- map pin management
- notes and checklist management
- travel diary entries with photos
- auth-gated cloud sync
- offline first local caching
- PWA install support

Current title and branding used in the UI:

- App title: `J&A Malaysia and Singapore Trip 2026`
- Trip key: `jessie-amor-malaysia-singapore`
- Countdown target: July 11, 2026 00:00:00
- Theme color: `#0B3530`
- Background color: `#F8FAFC`

The app is focused on the specific trip timeline and travel experience, so a lot of the content is hardcoded or preauthored in the repo rather than fetched from a CMS.

---

## 2. Current Stack

| Layer | Current Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Bundler | Vite 6 |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Animation | `motion` |
| Icons | `lucide-react` |
| Map | Leaflet |
| Backend | Supabase |
| PDF generation | `jspdf` |
| PWA | `vite-plugin-pwa` |
| CLI scripting | `tsx` |
| Extra libs | `html2pdf.js`, `dotenv`, `express`, `@google/genai` |

Main things to know:

- `@google/genai` is installed but not active in the UI.
- `motion` is installed, but much of the visible motion still comes from Tailwind animation classes and component-level transitions.
- The app uses a SPA routing model, not a server routing model.
- The repo currently uses `react-example` as the package name in `package.json`, even though the app branding is Jessie and Amor themed.

---

## 3. Repo Layout

### Root

```text
/
├── index.html
├── vite.config.ts
├── vercel.json
├── package.json
├── tsconfig.json
├── README.md
├── SUPABASE_SETUP.md
├── metadata.json
├── .env.example
├── .env.local
├── src.zip
├── public/
├── scripts/
├── src/
├── dist/
├── dev-dist/
└── assets/
```

### Current `src/`

```text
src/
├── App.tsx
├── main.tsx
├── index.css
├── types.ts
├── vite-env.d.ts
├── assets/
│   ├── images/
│   │   ├── malaysia_singapore_hero_019e9d4d.png
│   │   ├── batu_caves_1780754522244.png
│   │   ├── kl_skyline_1780754501759.png
│   │   └── saloma_bridge_1780754540468.png
│   └── app-icons/
├── components/
│   ├── AlertBox.tsx
│   ├── AuthPanel.tsx
│   ├── BudgetSummaryHeader.tsx
│   ├── BudgetTab.tsx
│   ├── DailyItineraryView.tsx
│   ├── DestinationInfoModal.tsx
│   ├── DiaryTab.tsx
│   ├── Hero.tsx
│   ├── Legend.tsx
│   ├── MapTab.tsx
│   ├── Navigation.tsx
│   ├── NotesTab.tsx
│   ├── RichText.tsx
│   ├── SettingsModal.tsx
│   └── TipCard.tsx
├── data/
│   ├── itinerary.ts
│   ├── code1Itinerary.ts
│   └── mapItinerary.ts
└── lib/
    ├── supabase.ts
    ├── offlineCache.ts
    └── exchangeRates.ts
```

### Current scripts

```text
scripts/
├── gen-days.cjs
├── map-update.sql
├── migrate-map.sql
├── new-days-output.txt
└── offline-sync-regression-check.ts
```

---

## 4. Types and Data Model

The canonical shared types live in `src/types.ts`.

### Current type unions

```ts
type ExpenseCategory = "Transport" | "Accommodation" | "Food" | "Sightseeing" | "Other";
type PaymentMethod = "Cash" | "Debit" | "Credit Card";
type ExpenseCurrency = string;
type SyncStatus = "synced" | "pending";
type DiaryEntryType = "Food" | "Landmark" | "Hotel" | "Transport" | "Shopping" | "Moment" | "Other";
type ItineraryItemType = "transport" | "accommodation" | "sightseeing" | "food" | "general";
```

Important correction:

- `ExpenseCurrency` is currently `string`, not a closed union.
- That matters because the budget UI and live exchange-rate hook now support more than the old fixed list.

### Current interfaces

#### `Expense`

```ts
interface Expense {
  id: string;
  day: number;
  category: ExpenseCategory;
  item: string;
  amount: number;
  paidWith: PaymentMethod;
  originalAmount?: number;
  originalCurrency?: ExpenseCurrency;
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  createdAt?: string;
  syncStatus?: SyncStatus;
}
```

Notes:

- `createdBy` and `savedByUserId` are both used in ownership logic.
- `amount` is stored in RM as the base budget currency.

#### `ItineraryItem`

```ts
interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  type: ItineraryItemType;
  description: string;
  estimatedCost?: string;
  costValue?: number;
  isCreditCard?: boolean;
  duration?: string;
  location?: { lat: number; lng: number; name: string; };
  syncStatus?: SyncStatus;
}
```

#### `DayPlan`

```ts
interface DayPlan {
  day: number;
  dateStr: string;
  title: string;
  budgetRange: string;
  costMin: number;
  costMax: number;
  badge: string;
  items: ItineraryItem[];
  images?: { title: string; url: string; label: string }[];
}
```

#### `TravelNote`

```ts
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

```ts
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

```ts
interface DiaryEntry {
  id: string;
  title: string;
  description: string;
  type: DiaryEntryType;
  rating: number;
  dateVisited: string;
  locationName: string;
  cityOrCountry?: string;
  tags: string[];
  wouldRevisit: boolean;
  photoPath?: string;
  photoUrl?: string;
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  createdAt: string;
  updatedAt?: string;
  syncStatus?: SyncStatus;
}
```

#### User settings

The code now has first-class trip settings.

```ts
interface CurrentUserInfo {
  userId: string;
  email: string;
  isAdmin: boolean;
}

interface UserTripSettings {
  id: string;
  userId: string;
  tripKey: string;
  baseCurrency: string;
  currencies: string[];
  travelDates: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

The settings model is important because it now drives:

- preferred display currencies
- travel date expansion
- day labels in the budget and map views

### Settings row mapping

`src/types.ts` also contains:

```ts
interface UserTripSettingsRow {
  id: string;
  user_id: string;
  trip_key: string;
  base_currency: string;
  currencies: string[];
  travel_dates: string[];
  created_at?: string;
  updated_at: string;
}
```

Helper functions:

- `settingsToRow(settings)`
- `rowToSettings(row)`

Those are used to translate between the app object shape and the Supabase row shape.

### Map types

`src/data/mapItinerary.ts` defines:

```ts
interface MapDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  time: string;
  notes: string;
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  syncStatus?: SyncStatus;
}

interface MapDay {
  day: number;
  label: string;
  title: string;
  destinations: MapDestination[];
}

interface MapItineraryData {
  version: number;
  updatedAt: string;
  days: MapDay[];
}

type MapDestinationRow = {
  id: string;
  trip_key: string;
  day: number;
  name: string;
  lat: number;
  lng: number;
  time: string;
  notes: string;
  created_by: string | null;
  saved_by_user_id: string | null;
  saved_by_email: string | null;
  created_at: string;
  updated_at: string;
};
```

---

## 5. Data Files

### `src/data/itinerary.ts`

This file contains the older structured itinerary seed data and static fallback exchange rates.

Current notable exports:

- `exchangeRates`
- `exchangeRate`
- `defaultDayPlans`
- `defaultExpenses`

Current fallback rates in the file:

- `1 RM = 15.1449 PHP`
- `1 RM = 0.31601 SGD`

The day plan seeds are still present here and cover the older budget itinerary structure.

### `src/data/code1Itinerary.ts`

This is the main visual itinerary bundle used by `App.tsx`.

Current notable exports:

- `Category`
- `TagVariant`
- `Segment`
- `BudgetCard`
- `LegendItem`
- `TimelineItemData`
- `DaySectionData`
- `HeroData`
- `TipCardData`
- `AlertBoxData`
- `FoodSuggestion`
- `FoodGuide`
- `DestinationGuide`
- `GuideKey`
- `FoodGuideKey`
- `ItineraryId`
- `ItineraryPlan`
- `destinationGuides`
- `selectedItinerary`
- `itinerary`

Important detail:

- `selectedItinerary` is what `App.tsx` uses.
- There are two itinerary plans in the file: `main` and `partner`.
- The current app surfaces the selected itinerary's `hero`, `legend`, `days`, `budgetSummary`, `alert`, `tips`, and `footer`.
- The itinerary covers days 11 to 16 in the current visual data.

### `src/data/mapItinerary.ts`

Current important exports:

- `MAP_ITINERARY_VERSION`
- `resolveCoordinatesFromName(name)`
- `destinationToRow(dest, tripKey, day)`
- `rowToDestination(row)`
- `groupDestinationsByDay(destinations, dayGetter?)`
- `buildInitialMapItinerary()`
- `buildEmptyMapItinerary()`
- `normalizeMapItinerary(raw)`

The file does three jobs:

- stores the map itinerary schema
- converts between local map state and Supabase rows
- resolves coordinates using fuzzy name matching and fallback coordinates

Map itinerary labels currently cover days 11 through 16 and match the trip flow:

- day 11: arrival day
- day 12: Chinatown, KLCC and dinner
- day 13: Batu Caves, Genting and Jalan Alor
- day 14: Melaka day trip
- day 15: KL to Singapore travel day
- day 16: Singapore city day and departure

Coordinate hints are hardcoded for the major points of interest, so the map can plot destinations even when a row does not yet have precise coordinates.

---

## 6. Supabase and Sync

The Supabase client lives in `src/lib/supabase.ts`.

### Current exports

```ts
export const supabaseExpenseTable = VITE_SUPABASE_EXPENSES_TABLE || "budget_expenses";
export const supabaseChecklistTable = VITE_SUPABASE_CHECKLIST_TABLE || "trip_checklist_items";
export const supabaseMapTable = VITE_SUPABASE_MAP_TABLE || "trip_map_itineraries";
export const supabaseMapDestinationsTable = VITE_SUPABASE_MAP_DESTINATIONS_TABLE || "trip_map_destinations";
export const supabaseNotesTable = VITE_SUPABASE_NOTES_TABLE || "trip_scratch_notes";
export const supabaseDiaryTable = VITE_SUPABASE_DIARY_TABLE || "trip_diary_entries";
export const supabaseDiaryBucket = VITE_SUPABASE_DIARY_BUCKET || "trip-diary-photos";
export const supabaseBudgetSettingsTable = VITE_SUPABASE_BUDGET_SETTINGS_TABLE || "trip_settings";
export const supabaseSettingsTable = VITE_SUPABASE_SETTINGS_TABLE || "user_trip_settings";
export const tripKey = VITE_TRIP_KEY || "jessie-amor-malaysia-singapore";
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = hasSupabaseConfig ? createClient(...) : null;
```

### Current table set

| Purpose | Table or Bucket |
|---|---|
| Expenses | `budget_expenses` |
| Checklist | `trip_checklist_items` |
| Notes | `trip_scratch_notes` |
| Diary | `trip_diary_entries` |
| Map destinations | `trip_map_destinations` |
| Legacy map itinerary table | `trip_map_itineraries` |
| Per-user budget settings | `trip_settings` |
| Per-user trip settings | `user_trip_settings` |
| Diary photo storage | `trip-diary-photos` |

### Important architecture detail

- `supabase` is nullable.
- Every feature checks `if (!supabase)` or equivalent before trying to read or write cloud data.
- Offline and unauthenticated behavior still works from local cache and local state.

### Realtime channels in `App.tsx`

Current channel names:

- `trip-sync-{tripKey}`
- `trip-diary-sync-{tripKey}`
- `trip-map-sync-{tripKey}` inside `MapTab`

High-level behavior:

- expenses, checklist, and notes are synced on the main trip channel
- diary is synced on its own channel because it is auth-gated and photo-aware
- map destinations have their own channel inside the map tab

Dirty-guard behavior:

- local pending state protects against realtime overwriting local edits
- the app keeps `syncedSignature`, `dirty`, and `syncedIds` in local cache snapshots

### Current sync model pattern

The app uses a repeated pattern for each dataset:

1. Read from localStorage cache on mount.
2. Mark cached items as pending or synced depending on dirty state.
3. Bootstrap from Supabase if online and authenticated.
4. Merge remote rows with local pending state.
5. Debounce writes to avoid thrashing.
6. Ignore realtime events while local state is dirty.
7. Persist updated cache snapshots back to localStorage.

This pattern exists for:

- expenses
- checklist items
- notes
- diary entries
- map data

### Notes storage shape

Notes are stored as one JSONB payload per trip row rather than one row per note. The app serializes the full `TravelNote[]` array on each update.

### Diary storage shape

Diary entries include photo support:

- local photos are compressed to a data URL first
- then uploaded to Supabase Storage
- then replaced with a signed URL
- then the row is upserted

---

## 7. Offline Cache

`src/lib/offlineCache.ts` provides the local persistence layer.

### Current export surface

```ts
type CachedDataset<T> = {
  data: T;
  syncedSignature: string;
  dirty: boolean;
  syncedIds?: string[];
};

makeOfflineCacheKey(tripKey, dataset)
readCachedDataset(key)
writeCachedDataset(key, snapshot)
useCachedDataset(key)
useOnlineStatus()
```

### What it does

- Stores serialized dataset snapshots in localStorage.
- Keeps a `dirty` flag so the app knows whether local changes are pending sync.
- Keeps `syncedSignature` so unchanged datasets do not keep re-syncing.
- Keeps optional `syncedIds` to help detect deletions.
- Emits a custom `offline-cache-update` event so multiple parts of the app can refresh in the same browser tab.

This is one of the key reasons the app still works well when offline or when auth is not ready yet.

---

## 8. App State and Routes

`src/App.tsx` is still the central orchestrator.

### What App currently owns

- auth session state
- current user state
- admin flag
- route state
- settings state
- expenses
- notes
- checklist
- diary entries
- selected home day
- selected destination guide
- budget cap state
- pull-to-refresh state
- online/offline state
- sync loading flags
- realtime and cache snapshots

### Current routes

The router is client-side and path-driven.

Current paths:

- `/` main itinerary home
- `/budget`
- `/map`
- `/notes`
- `/diary`
- `/account`
- `/settings`

### Home page coupling

Two home-page widgets now share the same selected day:

- `DailyItineraryView`
- `BudgetSummaryHeader`

That selected day is held in parent state as `selectedHomeDay`.

### Budget page coupling

The budget page now uses `userSettings.travelDates` when available, so the date chips and the expense form can stay in sync with the configured trip dates instead of assuming only a fixed July 12 to July 15 range.

### Settings state

The settings modal is now a first-class surface.

Important behavior:

- It expands a start and end date into a full `travelDates` array.
- It writes per-user settings using the settings rows.
- It controls base currency and up to two extra display currencies.
- It is used both for first setup and for later editing.

### Local budget cap

`App.tsx` also keeps a local budget cap in PHP for the settings route.

Important note:

- this cap is separate from the trip settings rows
- it is still shown in the `/settings` view as a local control

---

## 9. Component Reference

### `Navigation.tsx`

Current job:

- top header
- bottom nav
- route switching
- online status display
- countdown
- share modal
- download modal
- more drawer
- print
- immigration PDF generation via `jsPDF`

Important details:

- the countdown target is July 11, 2026
- the nav includes Itinerary, Budget, Map, Notes, and Diary tabs
- the more drawer exposes settings and account actions

### `Hero.tsx`

Renders the itinerary hero banner and the top visual entry point on the home route.

### `Legend.tsx`

Renders the color legend for the itinerary categories.

### `DailyItineraryView.tsx`

Renders the day-by-day itinerary timeline.

Important:

- receives `selectedMobileDay`
- can notify the parent when the day changes

### `BudgetSummaryHeader.tsx`

Shows budget cards across configured travel dates.

Current behavior:

- can derive day labels from `userSettings.travelDates`
- can fall back to the fixed July 12 to July 15 cards
- shows target and calculated active spend together
- formats values using live exchange rates

### `AlertBox.tsx`

Renders the itinerary alert callout.

### `TipCard.tsx`

Renders the individual trip tip cards.

### `BudgetTab.tsx`

Budget management surface with:

- create expense
- edit expense
- delete expense
- filter by category
- filter by owner
- voice input
- day selection synced to configured travel dates
- live exchange-rate display
- budget cap alert handling

The tab uses the currently selected `userSettings` if present, otherwise it falls back to default currencies and dates.

### `MapTab.tsx`

Current features:

- Leaflet map rendering
- custom destination pins
- destination CRUD
- Nominatim search and reverse geocoding
- current user location tracking
- day grouping
- offline cache for map state
- Supabase sync

Important current behaviors:

- visible day labels can be remapped from `userSettings.travelDates`
- saved destination rows are not rewritten just because visible labels change
- realtime updates are ignored when local map state is dirty

### `NotesTab.tsx`

Handles:

- trip notes
- checklist management
- local and cloud sync

### `DiaryTab.tsx`

Handles:

- travel diary entries
- image compression before upload
- reverse geocoding for location display
- star ratings
- tags
- photo attachment workflow

### `AuthPanel.tsx`

OAuth sign-in modal for:

- Google
- GitHub
- Facebook

### `SettingsModal.tsx`

Current first-class settings surface.

It manages:

- base currency
- extra display currencies
- start date
- end date
- expanded travel dates

Important logic:

- dates are expanded using UTC-safe parsing so day boundaries do not shift incorrectly
- the modal can be used for first setup
- the modal can also be reopened later from the app

### `DestinationInfoModal.tsx`

Shows destination-specific guidance pulled from itinerary guide data.

### `RichText.tsx`

Renders segment arrays used by itinerary content:

- text
- strong text
- place links

Place links point to Google Maps directions queries.

---

## 10. Map, Diary, Budget, Settings Behaviors

This section captures the important current behavior without pretending the app is simpler than it is.

### Budget summary and day selection

- `DailyItineraryView` and `BudgetSummaryHeader` share one selected day on the home route.
- `BudgetSummaryHeader` now derives its date pills from `userSettings.travelDates` when available.
- If a configured travel date has no target card yet, the UI can still show a placeholder such as `No target set`.

### Budget page date synchronization

- the top expense form date selector and the lower transaction registry chips mirror each other
- travel dates come from the user settings if available
- the budget page can show days that have no transactions yet

### Settings travel date expansion

- start and end dates are expanded into a full inclusive list
- the resulting dates are stored as `UserTripSettings.travelDates`
- the code intentionally avoids the old UTC shift bug

### Map label remapping

- map destination rows stay in their saved form
- visible labels can remap based on configured travel dates
- this keeps the UI flexible without rewriting persisted rows

### Mobile layout

Current main mobile bottom padding in `App.tsx`:

```css
pb-[calc(6rem+env(safe-area-inset-bottom,0px))]
```

This is the current value in the app shell.

### Auth-gated features

Cloud sync and diary upload are auth-aware.

Auth-related features include:

- cloud writes
- diary loading
- diary realtime sync
- photo upload
- admin ownership checks

### Current admin pattern

`currentUser.isAdmin` is used to loosen ownership restrictions for some actions.

General pattern:

- authenticated users can read the shared trip data
- ownership checks control edit/delete surface visibility
- admins can override ownership in relevant places

---

## 11. PWA and Deployment

### `vite.config.ts`

Current Vite config includes:

- React plugin
- Tailwind Vite plugin
- PWA plugin
- alias `@` to the repo root
- HMR behavior controlled by `DISABLE_HMR`

### PWA manifest

Current manifest settings include:

- name: `Jessie & Amor's Malaysia Singapore`
- short name: `Jessie & Amor`
- theme color: `#0B3530`
- background color: `#F8FAFC`
- standalone display
- app icons for 192 and 512

### PWA assets included

Current included assets include:

- `favicon.png`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `day12-kl-skyline.png`
- `day13-batu-caves.png`
- `day13-saloma-bridge.png`

### Runtime caching

Current PWA runtime caching includes:

- Tabler icon font from jsDelivr
- OpenStreetMap tiles

### `index.html`

Important current head metadata:

- viewport meta with `viewport-fit=cover`
- theme color meta
- favicon link
- apple touch icon link
- manifest link
- Tabler Icons CDN stylesheet

### Deployment

The project is configured as a SPA, so client routes should resolve to `index.html`.

`vercel.json` contains rewrite behavior for this.

---

## 12. Scripts and Verification

### package scripts

Current scripts in `package.json`:

```json
{
  "dev": "vite --port=3000 --host=0.0.0.0",
  "build": "vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist server.js",
  "lint": "tsc --noEmit",
  "test:offline-sync": "tsx scripts/offline-sync-regression-check.ts"
}
```

### Regression script

`scripts/offline-sync-regression-check.ts` is the current offline sync regression script.

It covers:

- merge behavior for pending local items vs remote items
- deletion tracking
- notes signature behavior
- diary protection behavior

### Practical verification targets

When checking this repo, the useful commands are:

- `npm run lint`
- `npm run test:offline-sync`
- `npm run build`

---

## 13. External Services

### Supabase

Used for:

- auth
- database rows
- storage
- realtime channels

### Frankfurter exchange rates

Current hook:

- `src/lib/exchangeRates.ts`
- `useLiveExchangeRates(additionalSymbols)`

Behavior:

- fetches live exchange rates from Frankfurter
- stores a cached snapshot in localStorage
- falls back to static rates if the request fails

Current exchange-rate snapshot shape:

```ts
type ExchangeRates = {
  rates: Record<string, number>;
  php: number;
  sgd: number;
  updatedAt?: string;
  source: "live" | "cached" | "fallback";
};
```

### Nominatim

Used by the map and diary features for geocoding.

- map search: forward geocoding
- diary: reverse geocoding

### Google Maps

Used for place links in rich itinerary text.

### jsDelivr Tabler icon font

Used for the icon webfont loaded in the app shell.

---

## 14. Current Notes

This section captures the current corrections that matter most when reading the code.

### Current architecture corrections

- `SettingsModal.tsx` is a first-class surface now.
- `UserTripSettings` is part of the current shared model.
- `src/lib/supabase.ts` exports `supabaseBudgetSettingsTable` and `supabaseSettingsTable`.
- `ExpenseCurrency` is `string`.
- `selectedHomeDay` is shared between the home itinerary and the budget summary.

### Budget UI corrections

- `BudgetSummaryHeader.tsx` now renders target and calculated active amounts in the same card.
- It can render configured travel dates that do not yet have a target budget card.
- `/budget` synchronizes the top date selector and the lower registry date chips.
- `BudgetTab.tsx` builds day options from `userSettings.travelDates` when available.

### Settings and date handling corrections

- `SettingsModal.tsx` expands travel dates from the selected start and end dates.
- The travel date expansion logic is UTC-safe.
- `MapTab.tsx` remaps labels from `userSettings.travelDates` without rewriting saved destination rows.

### Map and mobile corrections

- Map syncing is still separate from the main trip sync in `App.tsx`.
- The current mobile app shell padding is `pb-[calc(6rem+env(safe-area-inset-bottom,0px))]`.

### Current verification status in the repo

- The repo includes a TypeScript no-emit lint script.
- The repo includes an offline sync regression script.

---

## Quick Mental Model

If you need the shortest possible current mental model of the app, use this:

- `App.tsx` owns the shell, auth, routes, settings, budget cap, and synced datasets.
- `code1Itinerary.ts` owns the main visual itinerary content.
- `mapItinerary.ts` owns map schema, coordinate resolution, and map row conversion.
- `types.ts` owns the current shared data contracts.
- `supabase.ts` owns env-backed table names and the nullable client.
- `offlineCache.ts` owns localStorage snapshot sync support.
- `Navigation.tsx` owns the shell UI and trip-level actions.
- `SettingsModal.tsx` is the current trip preferences surface.
- `BudgetTab.tsx`, `MapTab.tsx`, `NotesTab.tsx`, and `DiaryTab.tsx` are the main workspace tabs.

---

*Last updated after a code cross-check against the current repo tree and source files.*
