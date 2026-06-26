# SYSTEM_TRUTH.md

> Single source of truth for the J&A Malaysia·Singapore Trip 2026 app.
> Audience: a developer who will never read the code. Every claim here is traced to actual executed code.
> Generated 2026-06-26. Re-audit when any `src/` file changes significantly.

---

## System Overview

A React 19 + Ionic 8 SPA (PWA) for a two-person trip to Malaysia and Singapore. It is a single-user-pair app — there is one fixed `tripKey` (`jessie-amor-malaysia-singapore`), all data is scoped to it, and "admin" vs. "user" is the only role distinction. The app works offline first; all five main data sets (expenses, checklist, notes, diary, map) are cached in `localStorage` and sync to Supabase Postgres when online and signed in. A service worker (VitePWA `autoUpdate`) caches all static assets.

**Tech Stack**
- React 19, TypeScript, Vite, Ionic 8 (iOS mode forced via `setupIonicReact({ mode: "ios" })`), react-router-dom v5
- Supabase JS v2 (Postgres + Realtime + Storage)
- Leaflet (map rendering)
- `@google/genai` package present in `package.json` but not imported anywhere in source
- `html2pdf.js` present in `package.json` but not used — PDF generation uses `jsPDF` directly
- Service worker: VitePWA, `registerType: "autoUpdate"`, registered immediately on boot

**Build / PWA config (`vite.config.ts`)**
- SW caches: `**/*.{js,css,html,woff2,ico,webp,png}` up to 4 MB per file
- OSM tile runtime cache: `StaleWhileRevalidate`, name `map-tiles`, 50 entries max, 7-day TTL
- Manual chunks: `vendor-react` (react + react-dom), `vendor-ionic` (@ionic/react + router + ionicons), `vendor-leaflet`, `vendor-supabase`
- PWA manifest: name `"Jessie & Amor's Malaysia Singapore"`, short name `"Jessie & Amor"`, `theme_color: "#0B3530"`, `background_color: "#F8FAFC"`, `display: "standalone"`, `start_url: "/"`
- Dev server: HMR and file watching disabled when `DISABLE_HMR=true` (used by AI Studio to prevent flicker during agent edits)
- `@` alias resolves to project root (`path.resolve(__dirname, '.')`) but no source files actually use `@/` imports — all imports are relative

**Entry Point**: `src/main.tsx` → `setupIonicReact({ mode: "ios", swipeBackEnabled: false })` → `registerSW({ immediate: true })` → `React.StrictMode` → `<ErrorBoundary>` → `<App>` → `<IonReactRouter>` → `<AppShell>` (all state and effects live here)

---

## Supabase Configuration

All values are env vars with fallback defaults:

| Export | Env Var | Default |
|--------|---------|---------|
| `supabaseExpenseTable` | `VITE_SUPABASE_EXPENSES_TABLE` | `budget_expenses` |
| `supabaseChecklistTable` | `VITE_SUPABASE_CHECKLIST_TABLE` | `trip_checklist_items` |
| `supabaseMapTable` | `VITE_SUPABASE_MAP_TABLE` | `trip_map_itineraries` (unused in code) |
| `supabaseMapDestinationsTable` | `VITE_SUPABASE_MAP_DESTINATIONS_TABLE` | `trip_map_destinations` |
| `supabaseNotesTable` | `VITE_SUPABASE_NOTES_TABLE` | `trip_scratch_notes` |
| `supabaseDiaryTable` | `VITE_SUPABASE_DIARY_TABLE` | `trip_diary_entries` |
| `supabaseDiaryBucket` | `VITE_SUPABASE_DIARY_BUCKET` | `trip-diary-photos` |
| `supabaseReceiptBucket` | `VITE_SUPABASE_RECEIPT_BUCKET` | `trip-receipt-photos` |
| `supabaseBudgetSettingsTable` | `VITE_SUPABASE_BUDGET_SETTINGS_TABLE` | `trip_settings` |
| `supabaseSettingsTable` | `VITE_SUPABASE_SETTINGS_TABLE` | `user_trip_settings` |
| `tripKey` | `VITE_TRIP_KEY` | `jessie-amor-malaysia-singapore` |

`supabase` client is `null` when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing. Every effect that calls Supabase checks `if (!supabase)` before proceeding.

---

## Data Types (`src/types.ts`)

### `Expense`
```
id, day (number), category (Transport|Accommodation|Food|Sightseeing|Other),
item (string), amount (number, stored in MYR), paidWith (Cash|Debit|Credit Card),
originalAmount? (number, what user typed), originalCurrency? (string),
receiptPath? (Supabase Storage path), receiptUrl? (data: URL pre-upload, signed URL post-upload),
createdBy?, savedByUserId?, savedByEmail?, createdAt? (ISO string), syncStatus?
```
`amount` is always in MYR regardless of the input currency.

### `DiaryEntry`
```
id, title, description, type (Food|Landmark|Hotel|Transport|Shopping|Moment|Other),
rating (1–5 decimal), dateVisited (YYYY-MM-DD), locationName, cityOrCountry?,
tags (string[]), wouldRevisit (boolean), photoPath?, photoUrl?,
createdBy?, savedByUserId?, savedByEmail?, createdAt (ISO), updatedAt? (ISO), syncStatus?
```

### `TravelNote`
```
id, title, content, category (Rule|Requirement|General), createdAt (ISO),
createdBy?, savedByUserId?, savedByEmail?, syncStatus?
```
Notes are stored as a **single JSON array** in `trip_scratch_notes` — one row per `trip_key`, not one row per note. The entire notes array is upserted on every change.

### `ChecklistItem`
```
id, text, completed (boolean), createdBy?, savedByUserId?, savedByEmail?, syncStatus?
```
Each checklist item is its own row in `trip_checklist_items`.

### `UserTripSettings`
```
id, userId, tripKey, baseCurrency (string), currencies (string[]),
travelDates (YYYY-MM-DD[]), createdAt?, updatedAt?
```
One row per `(user_id, trip_key)` in `user_trip_settings`.

---

## Global State (AppShell in `src/App.tsx`)

All cross-tab state lives here and is passed as props to tab components.

### Auth State
- `session`: Supabase `Session | null`
- `authReady`: `boolean` — true once `getSession()` resolves (or if no Supabase config)
- `isAdmin`: `boolean` — loaded from `user_profiles.is_admin` after session changes
- `showAuthModal`, `authError`

### Data State
- `expenses`: `Expense[]`
- `notes`: `TravelNote[]`
- `checklist`: `ChecklistItem[]`
- `diaryEntries`: `DiaryEntry[]`
- `expensesLoaded`, `checklistLoaded`, `notesLoaded`, `diaryLoaded`: gates that prevent sync before bootstrap

### Settings State
- `userSettings`: `UserTripSettings | null`
- `settingsLoaded`: becomes true after user settings query resolves
- `isFirstSetup`: true if user has no settings row yet → forces `SettingsModal` open
- `showSettingsModal`
- `budgetCapPhp`: number, persisted to `localStorage` keyed by `ja-budget-cap:{tripKey}:{userId}` and also synced to `trip_settings` table

### UI State
- `selectedHomeDay`: day number shown on home tab
- `selectedGuide`: `DestinationGuide | null` for info modal
- `showScrollTop`: floating scroll-to-top button visibility
- `isIosStandalonePwa`: set once on mount by checking `navigator.standalone` + UA + touch points
- `screenSize`: `"small"` (< 768 px) | `"large"`
- `showLiveSpends`: toggle on home tab budget summary

### Exchange Rates
- `exchangeRates`: from `useLiveExchangeRates()` — fetches from `api.frankfurter.dev`, caches in `localStorage` under `ja-exchange-rates`, refreshes every 30 minutes while online. Falls back to static rates from `src/data/itinerary.ts`.

**`ExchangeRates` type** (`src/lib/exchangeRates.ts`):
```ts
{ rates: Record<string, number>, php: number, sgd: number,
  updatedAt?: string, source: "live" | "cached" | "fallback" }
```
- `rates`: per-MYR rates (e.g. `rates["PHP"] = 15.14` means RM 1 = PHP 15.14)
- `php` / `sgd`: convenience shortcuts for PHP and SGD rates (same as `rates["PHP"]` / `rates["SGD"]`)
- `source`: used by UI to color the rate label (green=live, amber=cached, gray=fallback)

**`staticExchangeRates`** (exported from `exchangeRates.ts`): constant using fallback values from `itinerary.ts` with `source: "fallback"`.

**`formatLiveRateLabel(rates)`** (exported from `exchangeRates.ts`): returns `"RM 1 = PHP X.XX | RM 1 = SGD X.XXXX"`.

**`fetchExchangeRates(baseCurrency, additionalSymbols)`**: GET `api.frankfurter.dev/v1/latest?base=PHP&symbols=MYR,...`, normalizes all values to per-MYR. Has `cancelled` ref guard against stale responses.

---

## Offline Cache (`src/lib/offlineCache.ts`)

Each dataset is stored in `localStorage` as JSON under the key `offline-cache:{tripKey}:{dataset}`:

```ts
{ data: T, syncedSignature: string, dirty: boolean, syncedIds?: string[] }
```

- `dirty: true` means local state has unsynced changes
- `syncedSignature`: JSON fingerprint of the last successfully synced state (excludes `updated_at`)
- `syncedIds`: list of IDs that were present in the last successful remote response (used to detect remote deletions)

`writeCachedDataset` also fires a custom `offline-cache-update` window event so that `useCachedDataset` can refresh reactively within the same tab.

---

## Sync Engine (all in AppShell)

The app uses a **signature-diff** approach: state changes only sync when `currentSignature !== savedSignature`. This prevents unnecessary round-trips. All sync effects have a **300ms debounce** via `window.setTimeout`.

### Expense Sync
**Dependencies**: `[expenses, expensesLoaded, authReady, session, isOnline, currentUser, expenseSyncNonce]`

**Managed scope**: if `currentUser.isAdmin`, all expenses; otherwise only expenses where `createdBy === currentUser.userId` or `savedByUserId === currentUser.userId`.

**Flow**:
1. Compute `managedExpenses` and their signature
2. If signature unchanged and no removals: do nothing
3. If `expenseSyncInFlightRef.current` is true: set `expenseSyncQueuedRef.current = true`, return
4. Wait 300ms, then:
   a. **Upsert** all managed expenses to `budget_expenses` (onConflict: "id")
   b. **Delete** any removed IDs from `budget_expenses`
   c. **Storage delete**: for each removed ID, look up path in `expenseReceiptPathsRef.current`, call `supabase.storage.from(receiptBucket).remove(paths)`
   d. On success: mark expenses "synced" (except any still uploading a receipt — `isLocalReceiptUrl(expense.receiptUrl)` check)
5. If another change arrived during in-flight: increment `expenseSyncNonce` to re-trigger

**Receipt Upload (separate effect)**:
**Dependencies**: `[expenses, authReady, session, isOnline, currentUser]`

Finds expenses where `receiptUrl.startsWith("data:")` and current user owns them. Uploads all in parallel:
1. Convert data: URL → Blob via `dataUrlToBlob` (uses `atob`, bypasses `fetch()` which fails on iOS for large payloads)
2. `supabase.storage.from(receiptBucket).upload(path, blob, { upsert: true })`
3. `supabase.storage.from(receiptBucket).createSignedUrl(path, 365 days)`
4. On success: `setExpenses` with `receiptPath`, `receiptUrl` (signed URL), `syncStatus: "pending"`
5. No `cancelled` flag — React 18 `setExpenses` with functional updater is safe after re-render.
6. `receiptUploadInFlightRef.current` prevents double-starts but does NOT prevent re-running after re-render; the `if (pending.length === 0) return` early-exit handles that.

**Receipt path tracking (separate effect)**:
Runs on every `expenses` change. Populates `expenseReceiptPathsRef.current[id] = receiptPath` for every expense with a path. Never clears entries — deleted expenses still have their path available for Storage cleanup.

### Checklist Sync
Same pattern as expenses but simpler — no receipt photos, no admin-scope difference (admin sees all).

### Notes Sync
Same pattern but the entire `notes` array is serialized into a single JSON column on one row (`trip_key` is the conflict key). `notesPayload()` strips `syncStatus` before writing.

### Diary Sync
Most complex. In addition to text upsert/delete, it handles photo uploads:
1. For each diary entry with `photoUrl.startsWith("data:")`:
   a. `fetch(entry.photoUrl)` → blob (NOTE: uses `fetch`, not `dataUrlToBlob` — different from budget receipts)
   b. Upload to `trip-diary-photos` bucket
   c. Get 365-day signed URL
2. Upsert all entries to `trip_diary_entries`
3. Delete removed entries; also delete photos from Storage using `diarySyncedEntriesRef.current[id].photoPath`
4. Photo retry-block: `diaryPhotoRetryBlockRef` stores the last failed photo signature — if nothing changed except a photo that already failed, it skips retry to prevent a tight loop. Cleared on `isOnline` or `session` change.

### Map Sync
Map sync is **inside MapTab**, not AppShell. It has its own `mapDirtyRef`, debounced 300ms. Upserts destinations individually (one `supabase.from(table).upsert()` call per destination, not batch), then deletes from `pendingDeleteIdsRef`.

**Map destinations are stored as individual rows**, unlike notes which are one JSON blob.

---

## Realtime

A single Supabase Realtime channel `trip-sync-{tripKey}` subscribes to `postgres_changes` on three tables: `budget_expenses`, `trip_checklist_items`, `trip_scratch_notes`. Subscribed after initial data load in the same `bootstrap` async function.

A separate channel `trip-diary-sync-{tripKey}` subscribes to `trip_diary_entries` (no `trip_key` filter — listens to all rows, but filters `row.trip_key !== tripKey` in the handler).

**Realtime guards**:
- `expenseDirtyRef.current === true` → Realtime events for expenses are silently dropped
- `checklistDirtyRef.current === true` → dropped for checklist
- `notesDirtyRef.current === true` → dropped for notes
- Diary uses `isDiaryEntryProtectedFromRealtime(entry, syncedEntry)` → returns true if `entry.syncStatus === "pending"` OR `isDiaryLocalPhotoUrl(entry.photoUrl)` OR the entry's signature differs from the last synced snapshot

**Expense Realtime race condition handling** (three layers):
1. If `existing.receiptPath && !incoming.receiptPath` → preserve local receipt data, keep `syncStatus: "pending"`
2. If `isLocalReceiptUrl(existing.receiptUrl) && !expense.receiptPath` → preserve data: URL in merged result
3. `rowToExpense` normalizes `created_at` via `new Date(row.created_at).toISOString()` to prevent `+00:00` vs `Z` format mismatches from causing false signature differences

---

## Route List

| Route | Component(s) | Auth Required | Notes |
|-------|--------------|---------------|-------|
| `/` | Home (inline in AppShell) | No | Itinerary, hero, budget summary, tips |
| `/budget` | BudgetTab | No (read-only if no session) | Expense add/edit/delete, receipt photos |
| `/map` | MapTab | No (read-only if no session) | Leaflet map, destinations |
| `/notes` | NotesTab | No (read-only) | Checklist + scratch notes |
| `/diary` | DiaryTab | No (read-only) | Diary entries with photos |
| `/account` | Inline card | No | User info card (mobile only) |
| `/settings` | Inline form + SettingsModal | No (form non-functional if no session) | Budget cap, SettingsModal auto-opens |
| `*` | — | — | Redirects to `/` |

Navigation is via `history.push()` (react-router-dom v5). Tab clicks call `navigateTo()` which either scrolls to top (same route) or pushes a new history entry.

The bottom `IonTabBar` has 5 buttons: Itinerary, Budget, Map, Diary, More. "More" dispatches a custom `open-more-drawer` window event; Navigation listens for it and opens the `IonModal` drawer.

---

## Route: `/` — Daily Itinerary (Home)

**Purpose**: Trip overview — hero, day-by-day itinerary, budget summary, tips, map teaser.

**Entry**: Default route; redirect target for all unknown paths.

**Layout**:
1. `<Hero>` — static hero image + trip title from `itinerary.hero`
2. `<Legend>` — static legend items
3. `<DailyItineraryView>` — day selector + timeline items
4. `<BudgetSummaryHeader>` — estimated vs. live spend cards
5. `<AlertBox>` — static alert from itinerary data
6. Trip Tips section — `<TipCard>` components from `itinerary.tips`
7. Pro-Traveler Insights — three hardcoded cards (Touch 'n Go, Advance Booking, Street Food)
8. Map teaser card — clicking calls `navigateTo("/map")`

**State read**: `expenses`, `exchangeRates`, `userSettings`, `selectedHomeDay`, `showLiveSpends`

**No API calls on this route.** Data is static from `src/data/code1Itinerary.ts` plus live `expenses` state.

**Itinerary data source**: `selectedItinerary` from `src/data/code1Itinerary.ts`. This is a `buildGuideForItem` / `selectedItinerary` export that is hardcoded — trip dates July 12–16, 2026, KL + Malacca + Singapore. No runtime configuration changes what itinerary is displayed.

---

## Route: `/budget` — Budget Tab

**Purpose**: Add, edit, delete personal expenses; view category breakdown; attach and view receipt photos.

**Props received from AppShell**: `expenses`, `setExpenses`, `isSupabaseConnected`, `isOnline`, `canEdit` (= `Boolean(session)`), `currentUser`, `exchangeRates`, `budgetCapPhp`, `userSettings`, `getReceiptSignedUrl`

### Local State (BudgetTab)
- `desc`, `amountText`, `amountCurrency`, `day`, `category`, `paidWith` — form fields
- `editingId`: `string | null` — if set, form is editing an existing expense
- `draftReceiptUrl`: `string` — data: URL for form receipt preview
- `draftReceiptChanged`: `boolean` — whether user picked a new photo this edit session
- `receiptError`, `receiptBusy`
- `viewingReceipt`: `string | null` — URL shown in full-screen viewer
- `viewerImageLoaded`: `boolean` — false until viewer `<img>` fires `onLoad` or `onError`
- `loadingReceiptId`: ID of the expense whose signed URL is currently being fetched
- `filterCategory`: `"All"` | category string
- `ownerFilter`: `"all"` | `"mine"` — defaults to `"mine"`
- `selectedRegistryDate`: day label string or `"All"`
- `isListening`: voice recognition active
- `speechError`
- `dismissedOverBudget`

### Currency Display
- `amountCurrency` defaults to `currencyOptions[0]` (from `userSettings.currencies`, fallback `["MYR", "PHP", "SGD"]`)
- All amounts stored in MYR. `convertToRm(value, currency)` divides by `exchangeRates.rates[currency]`
- `primaryDisplayCurrency`: `userSettings.baseCurrency ?? selectedDisplayCurrencies[0] ?? "PHP"`
- `secondaryDisplayCurrencies`: remaining selected currencies excluding primary

### Day Options
Derived from `userSettings.travelDates` (YYYY-MM-DD strings). Each date is parsed as `new Date("{date}T00:00:00")` (local time). The day number is `getDate()` of that local date. Falls back to hardcoded `[12, 13, 14, 15]` for July if no settings.

### Calculations
- `cashSpent` = sum of `ownerExpenses` where `paidWith === "Cash"` or `paidWith === "Debit"`
- `cardSpent` = sum where `paidWith === "Credit Card"`
- `myCashSpent` = same as cashSpent but always filtered to `currentUser.userId` (not affected by `ownerFilter`)
- `budgetCapRm` = `budgetCapPhp / exchangeRates.php`
- `isOverBudget` = `budgetCapRm > 0 && myCashSpent > budgetCapRm && !dismissedOverBudget`

### Adding an Expense
1. Form submit → `e.preventDefault()`
2. Validates: `desc.trim()`, `amountText`, `parseFloat(amountText) > 0`
3. If `editingId`: updates expense in place, only touches `receiptUrl`/`receiptPath` if `draftReceiptChanged === true`
4. If new: creates expense with `id: "exp-" + Date.now()`, `createdAt: new Date().toISOString()`, `syncStatus: "pending"`
5. `resetForm()` clears all form state

### Receipt Photo Flow (budget form)
1. User taps "Snap or attach photo" → hidden `<input type="file" accept="image/*">`
2. `handleDraftReceiptChange` → `compressReceiptToDataUrl(file)`:
   - Tries `createImageBitmap(file, { imageOrientation: "from-image" })` (EXIF-aware)
   - Falls back to `createImageBitmap(file)` (no options)
   - Falls back to `<img>` + `URL.createObjectURL`
   - Canvas: max 1600px on longest side, `toDataURL("image/jpeg", 0.8)`
3. `draftReceiptUrl` = resulting data: URL. `draftReceiptChanged = true`
4. On form submit: expense created with `receiptUrl = draftReceiptUrl`
5. AppShell upload effect picks up `isLocalReceiptUrl(expense.receiptUrl)` → uploads to Storage

### Receipt Photo Flow (card-level "Add/Replace Photo" button)
- Hidden `<input ref={cardReceiptInputRef}>` shared across all cards
- `triggerCardReceipt(id)` stores target ID in `receiptTargetIdRef` and calls `.click()`
- `handleCardReceiptChange` → compress → `setExpenses` with `receiptUrl: dataUrl, syncStatus: "pending"`
- Same upload flow as above

### Viewing a Receipt
- If `tx.receiptUrl` is set (data: or signed URL already in memory): `setViewingReceipt(tx.receiptUrl)` immediately
- If only `tx.receiptPath`: calls `getReceiptSignedUrl(path)` (1-hour signed URL from AppShell) → sets `loadingReceiptId` during fetch → sets `viewingReceipt` on success, sets `receiptError` on failure
- Viewer modal: `createPortal(<div ...>, document.body)` — rendered outside Ionic scroll context
- Shows `IonSpinner` until `onLoad` / `onError` fires (`viewerImageLoaded` state)
- Clicking backdrop or X button: `setViewingReceipt(null)`
- Clicking image: `e.stopPropagation()` (does not close modal)

### Voice Input
Uses `window.SpeechRecognition` or `window.webkitSpeechRecognition`. `lang: "en-US"`, not interim. On result, `parseTranscriptToForm(transcript)`:
- Finds first number → `amountText`
- Detects currency aliases (e.g., "ringgit" → "MYR") → `amountCurrency`
- Detects payment aliases → `paidWith`
- Detects category aliases → `category`
- Detects day number (e.g., "july 14", or "today") → `day`
- Strips all matched tokens → remainder → `desc`

**No API calls in BudgetTab itself.** All sync is in AppShell.

---

## Route: `/map` — Map Tab

**Purpose**: Interactive Leaflet map of trip destinations. Add/edit/delete stops per day.

**Props from AppShell**: `session`, `canEdit`, `isOnline`, `userSettings`, `currentUser`

### Local State (MapTab)
- `itineraryData`: `MapItineraryData` — days array, each with a destinations array
- `selectedDay`: current day number (initial: first day from cache or build)
- `selectedDestinationId`: which marker/card is "active"
- `draft`: add-form fields `{ name, time, notes, lat, lng }`
- `userLocation`: GPS position or null
- `isLocating`, `isTrackingLocation`, `isTrackingPaused`, `locationError`
- `suggestions`: Nominatim autocomplete results
- `isSearching`, `activeSuggestionIndex`
- `mapLoaded`: true once remote data loaded (or no Supabase)

### Initial Data
- Reads `localStorage` cache (`offline-cache:{tripKey}:map`)
- If remote data available and not dirty: overwrites with remote rows
- `buildInitialMapItinerary()` returns hardcoded day structure when no cache

### Local Session Subscription (MapTab)
MapTab receives `session` as a prop but also **manages its own Supabase auth subscription** internally. It calls `supabase.auth.getSession()` on mount and listens to `onAuthStateChange` via its own local `session` state. This means MapTab's Supabase calls always use fresh session data independent of the prop value.

### Map Rendering (Leaflet)
- Container: `<div ref={mapContainerRef}>` — Leaflet attaches here; initialized with `preferCanvas: true`, `scrollWheelZoom: true`, `zoomControl: true`, initial center `[3.139, 101.6869]` (KL), zoom level 12
- Tiles: OpenStreetMap `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, `StaleWhileRevalidate` cache via service worker (7 days, 50 entries max)
- Markers: `L.divIcon` 40×40px, numbered `<span class="ja-map-marker-num">`, adds `ja-map-marker-selected` class when active
- Route: `L.polyline` dashed line, `color: "#0B3530"`, `weight: 4`, `opacity: 0.85`, `dashArray: "8 10"`
- User location: `L.divIcon` with `ja-map-user-marker` (pulse + dot), accuracy circle `fillOpacity: 0.08`, `opacity: 0.35`
- On day change: fits map to all destination bounds (`map.fitBounds`) with `padding: [36, 36]`; single destination → `setView(pt, 14)`; `map.invalidateSize()` after 50ms
- On selection change: `map.panTo(marker.getLatLng(), { animate: true, duration: 0.55 })` → `marker.openPopup()`

### Adding a Destination
1. Form submit: if `draft.lat` + `draft.lng` parseable as finite numbers → use them
2. Otherwise: `lookupPlaces(name)` via Nominatim → use first result
3. Falls back to `resolveCoordinatesFromName(name)` (hardcoded KL fallback coordinates)
4. Adds to `itineraryData` with `syncStatus: "pending"`, `id: "dest-${Date.now()}-${random 4-char base-36 suffix}"`

### Autocomplete
- Fires 300ms after `draft.name` changes (if ≥ 3 chars)
- Aborts previous request via `AbortController`
- GET `https://nominatim.openstreetmap.org/search?q=...&format=json&limit=5`
- Keyboard: ArrowDown/Up navigates, Enter selects

### Location Tracking
- `handleLocateMe`: one-shot `getCurrentPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 })`, pans map on success
- `startLocationTracking`: `watchPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 })`, updates marker via haversine filter: accepts update only if ≥25m from last position OR >30s elapsed
- Pauses on `document.hidden` (tab hidden), sets `isTrackingPaused = true`
- Does NOT auto-resume when tab becomes visible — user must tap "Track me" again

### Sync (inside MapTab)
| Call | Method | Table | Trigger | Payload |
|------|--------|-------|---------|---------|
| Load | SELECT * | `trip_map_destinations` | On mount (if online) | filter: `trip_key=eq.{tripKey}` |
| Upsert | UPSERT | `trip_map_destinations` | 300ms after `itineraryData` changes (if online, signed in) | One call per pending destination |
| Delete | DELETE | `trip_map_destinations` | Same trigger | `id=eq.{id}` per pending delete |

Realtime: `postgres_changes` on `trip_map_destinations`, filter `trip_key=eq.{tripKey}`. Handles INSERT, UPDATE, DELETE. Skipped if `mapDirtyRef.current`.

**Known issue**: `supabaseMapTable` (`trip_map_itineraries`) is defined in `supabase.ts` but never queried anywhere in the code. It is dead.

---

## Route: `/notes` — Notes Tab

**Purpose**: Trip checklist and scratch notes.

**Props from AppShell**: `notes`, `setNotes`, `checklist`, `setChecklist`, `isOnline`, `canEdit`, `currentUser`

### Local State (NotesTab)
- `noteTitle`, `noteContent`, `noteCategory` — add note form
- `newCheckItem` — add checklist item input
- `ownerFilter`: `"all"` | `"mine"` (defaults `"mine"`)

### Adding a Note
`handleAddNote`: title + content both required. Creates `{ id: "note-" + Date.now(), ... }` and prepends to `notes` array via `setNotes`. `syncStatus: "pending"`.

### Adding a Checklist Item
`handleAddCheckItem`: text required. Creates `{ id: "check-" + Date.now(), completed: false, ... }` and appends to `checklist`.

### Toggling a Checklist Item
`handleToggleCheck`: only works if `canManageEntry(item)` → requires `currentUser.isAdmin` or `item.createdBy/savedByUserId === currentUser.userId`. Flips `completed`, sets `syncStatus: "pending"`.

### Deleting
Notes: `canManageEntry(target)` check. Checklist items: same check. `setNotes`/`setChecklist` with filter.

### Display
- `ownerNotes`/`ownerChecklist`: filtered by `ownerFilter`. `"mine"` → only items where `createdBy` or `savedByUserId` matches `currentUser.userId`
- Notes displayed as cards with category color badge
- Checklist items with `IonCheckbox` (disabled if not owner)

**No API calls in NotesTab.** All sync in AppShell.

---

## Route: `/diary` — Diary Tab

**Purpose**: Travel diary with photos, ratings, geolocation.

**Props from AppShell**: `diaryEntries`, `setDiaryEntries`, `isOnline`, `canEdit`, `currentUser`

### Local State (DiaryTab)
- `form`: `DiaryFormState` — all form fields including `photoUrl` (data: URL), `photoChanged`
- `editingId`: string | null
- `searchTerm`, `filterType`, `filterRating`, `ownerFilter`
- `photoError`, `locationLookupError`, `isLocating`
- `fieldErrors`, `shakingFields` — validation state

### Form Validation (on submit)
Required: `title`, `dateVisited`, `locationName`, `description`. All four must be non-empty. Errors cause field shake animation (600ms CSS class) and auto-scroll to first failing field.

### Photo Compression (DiaryTab — different from BudgetTab)
`compressImageFileToDataUrl`: calls `createImageBitmap(file, { imageOrientation: "from-image" })` **without fallback**. If this throws (older iOS/Safari), the error propagates to `photoError`. No 3-tier fallback.

### Rating Input
Drag/pointer gesture on a 5-star track (`ratingTrackRef`). Pointer capture for smooth drag. Keyboard: ArrowLeft/Right ±0.1, Home=1, End=5. Rating clamped 1–5, stored as `Math.round(value * 10) / 10`.

### Geolocation (Diary)
`handleLocateMe`: `getCurrentPosition` (one-shot, not continuous). On success → `reverseGeocodeLocation(lat, lng)`:
- GET `https://nominatim.openstreetmap.org/reverse?lat=...&lon=...&format=json&addressdetails=1`
- Parses `display_name` (first 3 comma-parts) → `locationName`
- Parses `address.city/town/state` + `address.country` → `cityOrCountry`

### Submitting a Diary Entry
`handleSubmit`:
- If editing: updates existing entry with new form data, preserves `photoPath` from existing, uses `form.photoChanged ? form.photoUrl : existing.photoUrl` for photo
- If new: `id: "diary-" + Date.now()`, `createdAt: new Date().toISOString()`
- Tags: split `tagsText` on commas, trim, filter empty
- `syncStatus: "pending"` always

### Filtering
```
filteredEntries = diaryEntries
  .filter(type, rating, ownerFilter, searchTerm)
  .sort(by createdAt desc, then id desc)
```
Search matches against: `title + description + locationName + cityOrCountry + tags.join(" ")`.

### Display
- Grid of entry cards
- Photo displayed with `loading="lazy"`
- If no photo: placeholder with camera icon
- Rating: 5-star display (whole stars only in list view)
- Would-revisit chip: green if true, neutral if false
- Admin and own-entry actions: edit pencil, delete trash

### Would-Revisit Chip
"Would revisit" chip displays `"Would revisit"` (true) or `"One and done"` (false).

### Empty States
- Zero entries total: `"No memories yet. Add your first travel diary entry."`
- Filters exclude all: `"No memories match your current filters."`

**No API calls in DiaryTab.** All sync (including photo upload) is in AppShell.

---

## Route: `/account` — Mobile Account Card

A simple inline card rendered directly in AppShell, shown at `/account` route.

- **Signed in**: Shows "Jessie Jayr" hardcoded name, session email, Share/Print/Log out buttons
- **Not signed in**: Shows "Not signed in" + "Log in" button → `setShowAuthModal(true)`

**The name "Jessie Jayr" is hardcoded in the JSX.** It does not come from the user profile.

---

## Route: `/settings` — Settings Page

An inline `<div>` with a budget cap number input. When navigated to, `settingsRouteHandledRef.current` triggers `setShowSettingsModal(true)` (once per navigation, guarded by ref). The `SettingsModal` opens over the page.

**Budget cap input on this page** is independent of the one in `SettingsModal` — both call `setBudgetCapPhp` which is in AppShell. When `budgetCapPhp > 0`, the page shows a live PHP-to-RM conversion label with a colored source badge: `"live rate"` (live), `"cached rate"` (cached), `"static rate"` (fallback), driven by `exchangeRates.source`.

### Budget Cap Sync
| Call | Method | Table | Trigger | Payload |
|------|--------|-------|---------|---------|
| Load | SELECT `budget_cap` | `trip_settings` | On `authReady + session` change | filter `trip_key`, `user_id` |
| Save | UPSERT | `trip_settings` | 500ms after `budgetCapPhp` changes | `{ trip_key, user_id, budget_cap }` |

Also mirrors to `localStorage` key `ja-budget-cap:{tripKey}:{userId}`.

---

## Modals (global, rendered from AppShell)

### AuthPanel (`src/components/AuthPanel.tsx`)
`IonModal`, `--width: min(420px, calc(100vw - 32px))`, `--border-radius: 18px`.

- **Not signed in**: Three provider buttons (Google, GitHub, Facebook). Each calls `handleSignIn(provider)`:
  - `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + pathname } })`
  - OAuth redirect — page navigates away and returns
- **Signed in**: Shows email, "Budget + checklist sync is active.", Sign out button
- If `isConfigured === false` (no Supabase env vars): shows warning card, all provider buttons disabled
- `loading === true`: shows spinner, hides content

### SettingsModal (`src/components/SettingsModal.tsx`)
`IonModal`, full-page (`ja-settings-fullpage` class).

- **Opens when**: first login (forced, cannot close), navigating to `/settings`, clicking Settings in nav
- **Cannot close if `isFirstSetup === true`**: `backdropDismiss={false}`, no X button, `onDidDismiss` no-ops
- **Opens only when `settingsLoaded === true`**: `open={showSettingsModal && settingsLoaded}` — prevents the modal appearing before the user's settings row has been fetched from Supabase.
- **Form**:
  - Base currency: IonSelect from 10 options (MYR, SGD, PHP, USD, EUR, JPY, AUD, GBP, IDR, THB)
  - Additional currencies: checkbox list, max 2 additional (enforced — selecting 3rd does nothing)
  - Travel dates: start + end date inputs → `expandDateRange` generates every date in range using **UTC math** (`parseIsoDateToUtc` → `Date.UTC(y, m-1, d)`, `formatUtcDateToIso` → zero-padded ISO string) to avoid DST off-by-one errors
  - Budget cap: number input, calls `onBudgetCapChange` immediately on change (auto-saved)
- **Validation**: start date required, end date required, end ≥ start, ≥ 1 additional currency
- **On save**: calls `handleSaveSettings(incoming)` in AppShell:
  - `supabase.from(supabaseSettingsTable).upsert(settingsToRow(nextSettings), { onConflict: "user_id,trip_key" })`
  - On success: `setUserSettings`, close modal, if active route is `/settings` → navigate to `/budget`

### DestinationInfoModal
Opens from home tab when clicking an info icon on itinerary items. Displays `DestinationGuide` built from `buildGuideForItem(item)`. Static data only.

### Navigation Modals (in Navigation component)
- **More Drawer**: slides in from left, `translateX(-100%)` → `translateX(0)`, contains all nav items + Settings + user card
- **Share Modal**: shows URL input + copy button. Copy uses `navigator.clipboard.writeText`. No QR code is actually generated — the QR grid is a decorative CSS div pattern.
- **Download Modal**: single button → `handleImmigrationDoc()` → generates PDF with `jsPDF` from hardcoded trip data and `TRAVELER_1 = "Jessie Jay Q. Rubi"` / `TRAVELER_2 = "Rizza Amor L. Caguco"` constants from `src/data/code1Itinerary.ts`

---

## Navigation Component (`src/components/Navigation.tsx`)

Renders two headers (mobile + desktop, toggled by `screenSize`). `screenSize < 768` → mobile.

### Countdown
- Target: `new Date(2026, 6, 11, 0, 0, 0, 0)` (July 11, 2026 local time)
- Updates every 1 second via `setInterval`, clears when `days === hours === minutes === seconds === 0`
- If today is July 11, 2026 local: shows "Holiday mode / Enjoy your holiday" instead of countdown
- "Today" check: `isHolidayDisplayDate(currentDate)` — date updates once per midnight via `setTimeout`

### Nav Heights
Measures `.ja-nav-mobile` and `.ja-nav-desktop-bar` heights and sets CSS vars `--ja-nav-height-mobile` / `--ja-nav-height-desktop`. Uses `ResizeObserver` if available.

### Desktop Nav
Shows all 5 nav items (Itinerary, Budget, Map, Diary, Notes) as tab buttons.
Shows Settings button only if `session && onOpenSettings`.
Login/Logout button based on `session`.

### Mobile Nav
Top bar only (Login/Settings NOT shown here). Bottom `IonTabBar` in AppShell handles mobile tabs.
"More" tab button dispatches `open-more-drawer` event.

---

## API Calls Summary

### Supabase Auth
| Action | Call | Trigger |
|--------|------|---------|
| Get session | `supabase.auth.getSession()` | On mount |
| Sign in | `supabase.auth.signInWithOAuth({ provider, redirectTo })` | Auth modal provider click |
| Sign out | `supabase.auth.signOut()` | Sign out button |
| Listen | `supabase.auth.onAuthStateChange(...)` | On mount, cleaned up on unmount |

### Supabase Database
| Table | Operation | Trigger | Payload |
|-------|-----------|---------|---------|
| `user_profiles` | SELECT `is_admin` WHERE `id=session.user.id` | Session changes | — |
| `user_trip_settings` | SELECT `*` WHERE `user_id, trip_key` | Session + authReady changes | — |
| `user_trip_settings` | UPSERT | Settings form save | Full settings row |
| `budget_expenses` | SELECT (multiple columns) WHERE `trip_key`, ORDER `day`, `item` | On bootstrap | — |
| `budget_expenses` | UPSERT | 300ms after expense state changes | All managed expenses |
| `budget_expenses` | DELETE IN | Same trigger | Removed expense IDs |
| `trip_checklist_items` | SELECT WHERE `trip_key`, ORDER `id` | On bootstrap | — |
| `trip_checklist_items` | UPSERT | 300ms after checklist state changes | All managed items |
| `trip_checklist_items` | DELETE IN | Same trigger | Removed item IDs |
| `trip_scratch_notes` | SELECT `trip_key, notes, saved_by_*` WHERE `trip_key` MAYBYSINGLE | On bootstrap | — |
| `trip_scratch_notes` | UPSERT | 300ms after notes state changes | `{ trip_key, notes[], saved_by_*, updated_at }` |
| `trip_diary_entries` | SELECT (all columns) WHERE `trip_key`, ORDER `created_at desc, id desc` | On session + bootstrap | — |
| `trip_diary_entries` | UPSERT | 300ms after diary state changes | All managed entries |
| `trip_diary_entries` | DELETE IN | Same trigger | Removed entry IDs |
| `trip_map_destinations` | SELECT `*` WHERE `trip_key` | MapTab mount (if online) | — |
| `trip_map_destinations` | UPSERT | 300ms after map state changes | One call per pending destination |
| `trip_map_destinations` | DELETE `id=eq.{id}` | Same trigger | One call per pending delete |
| `trip_settings` | SELECT `budget_cap` WHERE `trip_key, user_id` | Session + authReady changes | — |
| `trip_settings` | UPSERT | 500ms after `budgetCapPhp` changes | `{ trip_key, user_id, budget_cap }` |

### Supabase Storage
| Bucket | Operation | Trigger | Path format |
|--------|-----------|---------|-------------|
| `trip-receipt-photos` | UPLOAD (upsert) | When expense has `receiptUrl.startsWith("data:")` | `{tripKey}/{userId}/{expenseId}-receipt.jpg` |
| `trip-receipt-photos` | CREATE_SIGNED_URL (365 days) | After upload | Same path |
| `trip-receipt-photos` | CREATE_SIGNED_URL (1 hour) | When user taps "View photo" on expense with only `receiptPath` | Same path |
| `trip-receipt-photos` | REMOVE | When expense with `receiptPath` is deleted | Paths from `expenseReceiptPathsRef.current` |
| `trip-diary-photos` | UPLOAD (upsert) | When diary entry has `photoUrl.startsWith("data:")` | `{tripKey}/{userId}/{entryId}-photo.jpg` |
| `trip-diary-photos` | CREATE_SIGNED_URL (365 days) | After upload + on bootstrap per entry with `photo_path` | Same path |
| `trip-diary-photos` | REMOVE | When diary entry with `photoPath` is deleted | From `diarySyncedEntriesRef.current[id].photoPath` |

### External APIs
| Service | URL | Trigger | Purpose |
|---------|-----|---------|---------|
| Frankfurter | `https://api.frankfurter.dev/v1/latest?base=PHP&symbols=MYR,...` | On mount + online event + every 30 min | Exchange rates |
| Nominatim search | `https://nominatim.openstreetmap.org/search?q=...&format=json&limit=5` | 300ms after map name input ≥ 3 chars | Map destination autocomplete |
| Nominatim reverse | `https://nominatim.openstreetmap.org/reverse?lat=...&lon=...&format=json&addressdetails=1` | On "Locate Me" in DiaryTab | Reverse geocode GPS position |
| OpenStreetMap tiles | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Map render | Map tiles (StaleWhileRevalidate, 7 days) |

---

## Error Handling

| Location | What happens |
|----------|--------------|
| `ErrorBoundary` | Catches React render errors. Shows "Something went wrong" card with error message and Reload button. |
| Auth fail | `authError` state → shown in `AuthPanel` |
| Supabase load fail | `console.warn`, data falls back to local cache |
| Supabase sync fail | `console.warn`, `syncStatus` stays `"pending"`, retried next time effect runs |
| Receipt upload fail | `console.warn`, expense stays with `receiptUrl = "data:..."`, retried on next `expenses` change |
| Diary photo upload fail | `console.warn`, entry stays `syncStatus: "pending"`, retry blocked by `diaryPhotoRetryBlockRef` until online/session changes |
| Map sync fail | `console.warn`, map state stays `"pending"`, retried on next `itineraryData` change |
| Image compression fail | `receiptError` or `photoError` state shown in UI |
| Nominatim fail | Falls back to `resolveCoordinatesFromName` (hardcoded KL coords for known names, otherwise KL center) |
| Geolocation denied | `locationError` state shown in UI |
| Exchange rate fetch fail | Silent, keeps previous rates (cached or static) |

---

## Known Issues / Suspicious Code

1. **`supabaseMapTable` (`trip_map_itineraries`) is never queried.** It is exported from `supabase.ts` but no component imports or uses it. Dead export.

2. **`@google/genai` in `package.json`** is not imported in any source file. Dead dependency.

3. **`html2pdf.js` in `package.json`** is not imported anywhere. PDF is generated via `jsPDF` directly in Navigation.tsx. Dead dependency.

4. **Diary photo upload uses `fetch(entry.photoUrl)`** — not `dataUrlToBlob`. On iOS Safari/WKWebView, `fetch(dataUrl)` silently fails for large payloads (>~1–2 MB). Budget receipt upload was fixed to use `dataUrlToBlob` (atob-based), but diary still uses `fetch`. Large diary photos may silently fail to upload on iOS.

5. **Diary `compressImageFileToDataUrl` has no fallback.** It calls `createImageBitmap(file, { imageOrientation: "from-image" })` directly. On older iOS Safari that doesn't support the `imageOrientation` option, this throws and the photo cannot be attached. Budget tab's `loadDrawable` has a 3-tier fallback; diary does not.

6. **Account card has hardcoded name "Jessie Jayr"** — does not read from session/profile.

7. **Notes deletion is "soft" locally only.** Because notes are stored as a single JSON array (not individual rows), deleting a note sets the local array to exclude it, then the whole array is upserted. There is no per-note DELETE call. If a note was added by another user and this user's local copy doesn't have it, it will be wiped on next upsert (for admins) or preserved (for non-admins who don't own it). This is architecturally inconsistent with expenses and checklist items.

8. **`expenseSyncNonce` vs. cleanup**: the expense sync effect's cleanup calls `window.clearTimeout(timeout)` and sets `expenseSyncInFlightRef.current = false`. If the timeout fires after unmount but before the async completes, `expenseSyncInFlightRef` would be reset while the async is mid-flight. This is unlikely in practice but could cause a double-sync.

9. **Share modal QR placeholder**: The "QR code" shown in the Share modal is decorative CSS. No actual QR code is generated.

10. **`TRAVELER_1` / `TRAVELER_2` in immigration PDF**: These are constants exported from `src/data/code1Itinerary.ts` — they are hardcoded strings and appear in the generated PDF regardless of who is signed in.

11. **Map sync marks `saveMapSnapshot(itineraryData, false)` using the captured-at-schedule-time `itineraryData`** (not the state at resolution time). If state changed during the 300ms debounce, the snapshot may be stale.

12. **`destinationGuides` export is dead.** It is exported from `code1Itinerary.ts` as `Record<string, DestinationGuide>` keyed by place name, but no other file imports it. The actual guide-building function `buildGuideForItem` uses `GUIDES_BY_KEY` (built internally from `buildFallbackGuideForItem`), not `destinationGuides`.

13. **`vite-env.d.ts` only declares 8 of the 11 env vars** used in `supabase.ts`. Missing from the TS declaration: `VITE_SUPABASE_MAP_DESTINATIONS_TABLE`, `VITE_SUPABASE_RECEIPT_BUCKET`, `VITE_SUPABASE_BUDGET_SETTINGS_TABLE`, `VITE_SUPABASE_SETTINGS_TABLE`. They still work at runtime via `import.meta.env` but TypeScript will not autocomplete or type-check them.

---

## Offline Behavior

| Dataset | Offline read | Offline write | Online recovery |
|---------|-------------|---------------|-----------------|
| Expenses | From localStorage | Allowed, `syncStatus: "pending"` | Sync effect fires when `isOnline` changes |
| Checklist | From localStorage | Allowed | Same |
| Notes | From localStorage | Allowed | Same |
| Diary | From localStorage | Allowed (text), photos stay as data: URLs | Same; photos upload when online |
| Map | From localStorage | Allowed | Same |
| Exchange rates | From localStorage (`ja-exchange-rates`) | N/A | Refreshed on `online` event |
| Budget cap | From localStorage (`ja-budget-cap:...`) | Allowed | Synced to DB when auth+online |
| Auth | No offline auth | Cannot sign in/out | Existing session token used if still valid |

Pull-to-refresh (`IonRefresher`) calls `window.location.reload()` after 600ms — full page reload, not a data re-fetch.

---

## App.tsx Inline Helpers

These small functions live directly inside `AppShell` (not in separate files):

### `normalizeTipIcon(icon: string): string`
Fixes garbled multi-byte unicode sequences caused by incorrect UTF-8→Latin-1 encoding of emoji in the static itinerary data. Maps corrupted byte sequences back to correct emoji. Examples: `"ðŸ'³"` → `"💳"`, `"ðŸ—"ï¸"` → `"🗓️"`, `"ðŸ"±"` → `"📱"`, `"ðŸ¦€"` → `"🦀"`. Applied to `itinerary.tips` before rendering `<TipCard>` components.

### `hashString(value: string): number`
djb2-style hash: `hash = (hash << 5) - hash + charCodeAt(i); hash |= 0` (force 32-bit int). Returns a signed 32-bit integer. Used by `diaryPhotoRetryBlockRef` to compare photo payload signatures across sync cycles (prevents infinite retry on a persistently-failing photo upload).

### `applySyncStatus(items, syncStatus)` vs `forceSyncStatus(items, syncStatus)`
Both set the `syncStatus` field on an array of sync-tracked objects:
- `applySyncStatus`: sets `item.syncStatus = item.syncStatus ?? syncStatus` — only fills in if `undefined`. Safe to call on freshly-loaded items without overwriting already-pending ones.
- `forceSyncStatus`: always overwrites `syncStatus` regardless of current value. Used when marking all items `"synced"` after a successful upsert.

### `handleShareTrip()`
Tries `navigator.share({ title, text, url: window.location.href })` first (mobile native share sheet). Falls back to `navigator.clipboard.writeText(window.location.href)` on desktop or if share throws.

### `isIosStandalonePwa` detection
Checks `navigator.standalone === true` OR `window.matchMedia("(display-mode: standalone)").matches`, AND (`/iPad|iPhone|iPod/.test(navigator.userAgent)` OR `navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1`). If true, adds `ios-standalone-pwa` class to `document.documentElement`. Used for iOS-specific CSS adjustments.

---

## Utilities and Helpers

### `src/utils/keyboardClass.ts` — `installKeyboardClass()`
Called once on AppShell mount. Compares `window.innerHeight` vs `window.visualViewport.height`:
- If the difference is > 120px → soft keyboard is likely open → adds `keyboard-open` class to `<html>`
- Otherwise → removes `keyboard-open`
- Triggers on `visualViewport` resize/scroll events and 250ms after `orientationchange`
- Returns a cleanup function (removes listeners)
- No-ops if `visualViewport` is not available (older browsers)

CSS can use `.keyboard-open` to hide fixed-position UI that would be obscured by the keyboard.

---

### `src/components/RichText.tsx` — `<RichText segments={...}>`
Renders a `Segment[]` array from `src/data/code1Itinerary.ts`. Used for itinerary item descriptions on the home tab.

Three segment kinds:
| `kind` | Renders as |
|--------|------------|
| `"text"` | `<span>{value}</span>` |
| `"strong"` | `<strong>{value}</strong>` |
| `"place"` | `<a href="https://www.google.com/maps/dir/?api=1&origin=My+Location&destination={encodeURIComponent(segment.mapQuery)}&travelmode=driving" target="_blank">` with `segment.label` + optional `segment.placeType` badge |

`"place"` segments open Google Maps directions (from current location to `mapQuery`) in a new tab. `rel="noopener noreferrer"` is set.

---

### `src/data/mapItinerary.ts` — Map Types, Serializers, and Helpers

**Types** (not in `src/types.ts` — all map-specific types live here):
- `MapDestination`: `{ id, name, lat, lng, time, notes, createdBy?, savedByUserId?, savedByEmail?, syncStatus? }`
- `MapDestinationRow`: database row shape with `trip_key`, `day`, snake_case fields
- `MapDay`: `{ day (number), label (string), title (string), destinations: MapDestination[] }`
- `MapItineraryData`: `{ version (number), updatedAt (ISO string), days: MapDay[] }`

**`MAP_ITINERARY_VERSION = 3`** — bumped when the default itinerary structure changes. `normalizeMapItinerary` uses this as a schema version check.

**`destinationToRow(dest, tripKey, day)`** — serializes `MapDestination` to DB row. Sets `created_at` and `updated_at` to `new Date().toISOString()` at call time (not from the object).

**`rowToDestination(row)`** — deserializes DB row. Always sets `syncStatus: "synced"`.

**`groupDestinationsByDay(destinations, dayGetter?)`** — groups flat destination array into `MapDay[]` for days 11–16 (hardcoded range). Missing days get empty `destinations: []`. Labels and titles are hardcoded per day number.

**`asciiText(value)`** — normalizes unicode characters to ASCII equivalents before storing destination names and notes:
- `–`/`—` → `-`, `'`/`'` → `'`, `•`/`·` → `|`, `…` → `...`, `≈` → `~`, `₱` → `PHP`, `S$` → `SGD`, collapses whitespace

**`resolveCoordinatesFromName(name)`** — hardcoded lookup table of 50+ named places → `{ lat, lng }`. Falls back to `{ lat: 3.139, lng: 101.6869 }` (KL city center). Used when Nominatim doesn't return results or as a pre-geocoding seed. Covers all itinerary stops in KL, Melaka, Genting, and Singapore.

**`buildInitialMapItinerary()`** — returns `MAP_ITINERARY_VERSION: 3` with all 6 days fully pre-populated with the hardcoded trip itinerary (July 11–16). This is the "seed" shown to new users before any remote data loads or when no remote data exists. The hardcoded content matches `src/data/code1Itinerary.ts` but as plain ASCII strings.

**`buildEmptyMapItinerary()`** — returns 6 days (July 11–16) each with `destinations: []`. Used in the add-destination flow's "no existing day" edge case.

**`normalizeMapItinerary(raw)`** — validates and sanitizes any value from localStorage or a JSON parse:
- If not a valid `MapItineraryData` shape → returns `buildInitialMapItinerary()`
- Filters out invalid days/destinations
- Runs `asciiText` on all string fields
- Fills in missing days 11–16 with empty destinations
- Resolves missing `lat`/`lng` via `resolveCoordinatesFromName`
- Always outputs exactly 6 days in order (11–16)

---

## Static Data (`src/data/code1Itinerary.ts`)

2981-line file. Single source of all UI content for the home tab. Never fetched — it is bundled.

**Exported constants**:
- `TRAVELER_1 = "Jessie Jay Q. Rubi"` — used in immigration PDF
- `TRAVELER_2 = "Rizza Amor L. Caguco"` — used in immigration PDF
- `DEFAULT_ITINERARY_ID: ItineraryId = 'main'`
- `selectedItinerary = ITINERARIES_BY_ID[DEFAULT_ITINERARY_ID]` — the active itinerary
- `ITINERARIES_BY_ID`: `{ main: ItineraryPlan, partner: ItineraryPlan }` — `'partner'` has identical content to `'main'`; it is a placeholder, not a different itinerary
- Convenience re-exports: `hero`, `budgetSummary`, `legend`, `days`, `alert`, `tips`, `footer` (duplicated as `currentHero`, `currentBudgetSummary`, etc. — same values)
- `destinationGuides: Record<string, DestinationGuide>` — keyed by **place name** (e.g. `"KLIA"`, `"Batu Caves"`), NOT by `GuideKey`. **Dead export** — not imported anywhere outside this file. Not used by `buildGuideForItem`.
- `buildGuideForItem(item: TimelineItemData): DestinationGuide` — looks up `GUIDES_BY_KEY[item.guideKey]`, then calls `attachFoodGuide`. `GUIDES_BY_KEY` is built at module load time by calling `buildFallbackGuideForItem(item)` for every item in `currentItinerary.days`. NOT from `destinationGuides`.

**Internal guide-building pipeline**:
- `buildFallbackGuideForItem(item)`: giant `switch(item.guideKey)` covering all 63 `GuideKey` values, calling `genericPlaceGuide` for each case. `default` branch handles unknown keys by category (`train/bus` → transit guide, `spot` → photo guide, `food` → meal guide, `hotel` → hotel guide).
- `genericPlaceGuide(item, summary, ...args)`: overloaded — first arg shape determines whether args are `[steps, tips]` or `[service, ticket, whereToBuy, steps, tips]`. Calls `buildTransportGuide` and `attachFoodGuide` internally.
- `buildTransportGuide(item, service?, ticket?, whereToBuy?)`: generates `DestinationGuide.transport` section for transport-category or transit-titled items. Extracts `PlaceSegment` labels from `item.description` to fill `goHere`/`getOffHere`.
- `attachFoodGuide(guide, item)`: merges `FOOD_GUIDES_BY_KEY[item.foodGuideKey]` into guide only when `item.category === 'food'` and `item.foodGuideKey` is set.

**Actual itinerary content (from `currentItinerary`)**:
- `hero.eyebrow = "Travel Itinerary"`, `hero.title = "J&A Malaysia · Singapore Trip 2026"`, `hero.subtitle = "July 11–14 · Malaysia & Singapore"`, `hero.meta = []`, `hero.note = []` — no meta chips or note paragraph rendered
- `budgetSummary`: 6 cards — July 12 (RM 130–200), July 13 (RM 165–265), July 14 (RM 280–393), July 15 (RM 25–45), "Total for 2" (RM 600–903, `featured: true`), "Recommended cash" (RM 1,000, `featured: true`)
- `legend`: 6 items — Train/LRT/MRT (#378ADD), Bus (#BA7517), Food (#1D9E75), Tourist spot (#7F77DD), Walk/Free (#888780), Hotel/Grab (#D4537E)
- `alert.title = "📌 Fact-check note · bus fare correction"` (corrects original itinerary's bus fare estimate)
- `tips`: 6 entries. The emoji icons are garbled UTF-8 at source (`"ðŸ'³"` etc.) — `normalizeTipIcon` in App.tsx fixes these before render
- `days`: 6 days — day 11 (Flight Day · July 11), day 12 (DAY 1 · July 12), day 13 (DAY 2 · July 13), day 14 (DAY 3 · July 14), day 15 (DAY 4 · July 15 KL→Singapore), day 16 (DAY 5 · July 16 Singapore & Departure)
- `footer = "J&A Malaysia · Singapore Trip 2026"`

**`ItineraryPlan` type**:
```ts
{ id: "main" | "partner", label, description?, hero: HeroData, budgetSummary: BudgetCard[],
  legend: LegendItem[], days: DaySectionData[], alert: AlertBoxData, tips: TipCardData[], footer: string }
```

**`TimelineItemData` type**:
```ts
{ id, time, title, category: Category, description: Segment[], tags: ItemTag[],
  cost?, mapQuery, image?, guideKey: GuideKey, foodGuideKey?: FoodGuideKey }
```
`category` is one of: `train | bus | food | spot | hotel | walk | free`

**`DaySectionData` type**:
```ts
{ day: 11 | 12 | 13 | 14 | 15 | 16, title, budgetLabel, items: TimelineItemData[],
  images?: { title, url, label }[] }
```

**`BudgetCard` type**:
```ts
{ label: string, amount: string (e.g. "RM 130–200"), php: string, featured?: boolean }
```
`amount` is a human-readable range string — `BudgetSummaryHeader.parseAmountRange` extracts numbers from it.

**`DestinationGuide` type**:
```ts
{ title, summary, service?, ticket?, whereToBuy?: string[],
  transport?: { goHere: string[], buyThis: string[], tapHere: string[], getOffHere: string[], extra?: string[] },
  foodGuide?: FoodGuide, steps: string[], tips: string[] }
```

**`GuideKey`** — union of 60+ string literals (one per itinerary stop). **`FoodGuideKey`** — union of 11 food-context keys. Both are `keyof typeof GUIDE_KEYS` / `FOOD_GUIDE_KEYS`.

---

## Static Data (`src/data/itinerary.ts`) — Partially Dead

**`exchangeRates = { php: 15.1449, sgd: 0.31601 }`** (1 RM = N units) — imported by `src/lib/exchangeRates.ts` as `fallbackRates`. Used when the live Frankfurter API fails or is offline. This is the only live import from this file.

**`defaultDayPlans: DayPlan[]`** — exported but **never imported anywhere**. Dead data. The active itinerary content comes from `code1Itinerary.ts`.

---

## Additional Types (`src/types.ts` — complete)

Types already documented above: `Expense`, `TravelNote`, `ChecklistItem`, `DiaryEntry`, `UserTripSettings`, `UserTripSettingsRow`, `settingsToRow`, `rowToSettings`.

**Also in `types.ts`** (not documented above):

**`CurrentUserInfo`**:
```ts
{ userId: string, email: string, isAdmin: boolean }
```
Passed as `currentUser` prop to all tab components.

**`ItineraryItem`** (legacy):
```ts
{ id, time, title, type: "transport"|"accommodation"|"sightseeing"|"food"|"general",
  description: string, estimatedCost?, costValue?, isCreditCard?, duration?,
  location?: { lat, lng, name }, syncStatus? }
```
Used by `itinerary.ts` and `mapItinerary.ts` (`buildNotes` / `normalizeDestination`). Not used anywhere else. **Dead for display purposes** — `code1Itinerary.ts` uses its own `TimelineItemData` type.

**`DayPlan`** (legacy):
```ts
{ day, dateStr, title, budgetRange, costMin, costMax, badge, items: ItineraryItem[], images? }
```
Only instantiated in `itinerary.ts` `defaultDayPlans`. Never imported for rendering. Dead.

---

## Home Tab Components (thin wrappers — all static)

### `<Hero hero={HeroData}>`
Renders: hero image (`malaysia_singapore_hero.webp` from assets), dark overlay, info card with `eyebrow` + `title` + `subtitle`, horizontal chips from `meta[]`, and a `<RichText>` note paragraph. No interactivity.

### `<Legend items={LegendItem[]}>`
Renders a row of `IonChip` components, each with a colored dot (`backgroundColor: item.color`) and a label. Purely decorative legend for the itinerary categories.

### `<AlertBox alert={AlertBoxData}>`
Renders an `IonCard` with an info icon, a title, and a `<RichText>` body. Used for the "Important notices" card on the home tab.

### `<TipCard tip={TipCardData}>`
Renders an `IonCard` with an emoji icon (`tip.icon`) and a `<RichText>` description. Used for travel tips on the home tab.

---

## `<BudgetSummaryHeader>` (Home Tab)

**Props**: `cards: BudgetCard[]`, `expenses: Expense[]`, `showLiveSpends`, `setShowLiveSpends`, `exchangeRates`, `userSettings?`, `selectedMobileDay?`, `onSelectedMobileDayChange?`

**Purpose**: Shows estimated budget targets (from static itinerary data) side-by-side with live actual spend (from `expenses` state).

**`parseAmountRange(value: string)`**: Extracts all numbers from a string like `"RM 130–200"` → `{ min: 130, max: 200 }`. If one number → `min === max`. Used to parse `BudgetCard.amount`.

**Day cards**: Derived from `userSettings.travelDates` → `{ value: date.getDate(), label: "July 12" }`. Falls back to hardcoded July 12–15 if no settings. A `BudgetCard` is matched to each day by label (case-insensitive, ignoring non-`/[A-Za-z]+ \d{1,2}/` cards).

**Each day card shows**:
- "Target": formatted `BudgetCard.amount` range in primary currency + secondary currencies
- "Calculated Active": sum of Cash+Debit expenses for that day, in all display currencies

**Totals row** (below day cards):
- `totalCashActual` = all `expenses` where `paidWith === "Cash"` or `"Debit"` (NO owner filter — includes all users)
- `totalCardActual` = all `expenses` where `paidWith === "Credit Card"` (NO owner filter)

**Currency conversion**: `formatCurrencyFromMyr(amount, code)` → multiplies by `exchangeRates.rates[code]`. MYR: formats with `en-MY` locale. Others: `en-US`.

**Layout**:
- Mobile: day selector buttons + single day card (controlled by `selectedMobileDay` / internal state)
- Desktop: CSS grid of all day cards

---

## `<DailyItineraryView>` (Home Tab)

**Props**: `days: DaySectionData[]`, `onInfoClick?`, `selectedMobileDay?`, `onSelectedMobileDayChange?`

**Category to display mapping** (`CATEGORY_META`):
| Category | Icon (lucide-react) | Chip background |
|----------|---------------------|-----------------|
| `train` | `<Train>` | `#eff6ff` |
| `bus` | `<Bus>` | `#fffbeb` |
| `food` | `<Utensils>` | `#fff1f2` |
| `spot` | `<Camera>` | `#f5f3ff` |
| `hotel` | `<Bed>` | `#ecfdf5` |
| `walk` | `<Footprints>` | `#fafaf9` |
| `free` | `<MapPin>` | `#f0f9ff` |

**Item titles are Google Maps links**: `getMapsUrl(item.mapQuery)` → `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination={encoded}&travelmode=driving`. Opens in new tab.

**Day tab badge logic** (`getMobileDayBadge`): if `splitDayTitle(day.title).label` matches `/flight day/i` → `"Flight Day"`. Otherwise → `"Day {index}"` (1-based, not the day number).

**`splitDayTitle(title)`**: splits on `·` (after normalizing ` - ` and `. ` to ` · `), returns `{ label: beforeDot, date: afterDot }`.

**Layout**:
- Mobile: day selector row of buttons → single `<article>` for active day (`ja-itinerary-article-mobile`)
- Desktop: all days as `<article>` elements side-by-side (`ja-itinerary-article-desktop`)

**Per-item layout**: category chip + time chip → title link → `<RichText>` description → tag chips → optional cost box → optional "Guide" button (if `onInfoClick` is provided) → "Open in Maps" link.

---

## `<DestinationInfoModal>` (Home Tab)

Opens when user taps "Guide" on an itinerary item. Receives `guide: DestinationGuide | null`.

**Sections rendered** (conditional):
1. Summary card — `guide.summary`
2. Info grid (if any): Service / Ticket / Where to buy
3. Transport checklist (if `guide.transport`): four `GuideCard` sub-components (Go here, Buy this, Tap here, Get off here) + optional Extra notes card
4. Food guide (if `guide.foodGuide`): area note, `nearbyFoods[]` cards, suggested order for two, tips list, price note
5. Steps list (numbered) — always present
6. Remember list (bullet) — always present

`GuideCard` is a private component inside this file. Renders a titled card with bulleted string list. `fullWidth` prop spans both columns in the transport grid.

---

## `<ErrorBoundary>` (Root)

Class component wrapping the entire app. On any uncaught React render error:
- `getDerivedStateFromError` sets `hasError: true`
- `componentDidCatch` logs to `console.error("App crashed:", error, info.componentStack)`
- Renders `.ja-error-boundary-card` with: emoji 😿, "Something went wrong" heading, "Your saved data is safe on this device — reloading usually fixes it." message, error message in `<pre>`, "Reload app" button → `window.location.reload()`
- Does NOT clear state — user must reload
