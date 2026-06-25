# Budget Tab — Complete Trace

Full data flow, state, mutations, sync, and rendering for the `/budget` page.

---

## Bug Fix — Photo Visible in Supabase Storage But Not in Expense List

### Root cause

Three overlapping issues created a timing window where the photo badge disappeared on reload or another device:

1. **Expense marked "synced" before `receipt_path` saved to DB.** `expenseSignature` (used to decide "synced") only looks at DB columns — `receiptUrl` is not a DB column so it's invisible to the check. The first upsert fires at 300ms (with `receipt_path = null`), completes, sees matching signatures, marks expense "synced" and writes the localStorage cache — all before the receipt upload to Storage finishes.

2. **`mergeBootstrapItems` always prefers the remote row when local is "synced".** On every page load, if the local expense is "synced", the remote DB row wins. `rowToExpense` never sets `receiptUrl` (it's not a DB column). So if `receipt_path` in the DB was still `null` (second upsert hadn't run), the merged expense has `receiptPath = undefined` and `receiptUrl = undefined` → badge never renders.

3. **`rowToExpense` does not restore `receiptUrl`.** `receiptUrl` is not stored in the database — only `receiptPath` is. Every bootstrap load loses the in-memory signed URL.

### The bug window

```
1. Photo attached → receiptUrl = "data:...", receiptPath = undefined, syncStatus = "pending"
2. First upsert fires (300ms) → DB: receipt_path = null
3. Photo uploads to Storage → FILE APPEARS IN SUPABASE ← "seen in Supabase"
4. First upsert setExpenses callback → signatures match (both receipt_path: null)
   → expense marked "synced", cache written with receiptPath = undefined
                                ↑ BUG WINDOW STARTS HERE
5. Upload setExpenses → receiptPath = storagePath, syncStatus = "pending"
6. Second upsert → DB: receipt_path = storagePath  ← BUG WINDOW ENDS

If page is reloaded between step 4 and 6:
  - DB has receipt_path = null
  - Cache has syncStatus = "synced", receiptPath = undefined
  - mergeBootstrapItems: local is "synced" → remote wins → receiptPath = undefined
  - Badge condition: tx.receiptUrl || tx.receiptPath = undefined → BADGE MISSING
```

### Fixes applied

**Fix 1 — `mergeBootstrapItems` (`App.tsx` line ~372):**
When a local synced item has `receiptPath` that the remote row is missing, rescue the local receipt data and mark the item `"pending"` so a sync re-fires and saves `receipt_path` to the DB.

**Fix 2 — Upsert `setExpenses` callback (`App.tsx` line ~1251):**
Do not mark an expense `"synced"` if it still has a `data:` URL in `receiptUrl`. This keeps the expense `"pending"` (preventing the cache from being written with no `receiptPath`) until the receipt upload completes and the second upsert correctly saves `receipt_path`.

---

## Files Involved

| File | Role |
|------|------|
| `src/components/BudgetTab.tsx` | All budget UI, form state, 4 mutation paths |
| `src/App.tsx` | State owner, all Supabase sync, auth session |
| `src/components/BudgetSummaryHeader.tsx` | Home page `/` budget widget (read-only) |
| `src/components/SettingsModal.tsx` | Budget cap input + travel dates setup |
| `src/components/Navigation.tsx` | Receives `expenses` prop but never uses it (dead prop) |
| `src/components/AuthPanel.tsx` | Pure OAuth UI modal — Google / GitHub / Facebook |
| `src/components/ErrorBoundary.tsx` | Crash boundary, shows reload UI |
| `src/main.tsx` | Entry point: StrictMode → ErrorBoundary → App, Ionic iOS mode, SW registration |
| `src/types.ts` | All TypeScript interfaces |
| `src/lib/supabase.ts` | Supabase client + all table/bucket name exports |
| `src/lib/exchangeRates.ts` | Rate fetch, cache, fallback chain |
| `src/lib/offlineCache.ts` | localStorage cache read/write helpers |
| `src/data/itinerary.ts` | Static fallback exchange rates + 13 default seed expenses |
| `src/data/code1Itinerary.ts` | Hardcoded per-day budget targets (`budgetSummary` array) |

---

## Supabase Tables and Buckets

All names configurable via env vars (defaults shown):

| Name | Env var | Default |
|------|---------|---------|
| Expenses table | `VITE_SUPABASE_EXPENSES_TABLE` | `budget_expenses` |
| Budget settings table | `VITE_SUPABASE_BUDGET_SETTINGS_TABLE` | `trip_settings` |
| User settings table | `VITE_SUPABASE_SETTINGS_TABLE` | `user_trip_settings` |
| Receipt bucket | `VITE_SUPABASE_RECEIPT_BUCKET` | `trip-receipt-photos` |
| Trip key | `VITE_TRIP_KEY` | `jessie-amor-malaysia-singapore` |

`supabase` client is `null` if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing — app degrades gracefully to local-only mode.

---

## TypeScript Types (src/types.ts)

```ts
interface Expense {
  id: string;
  day: number;                   // e.g. 12, 13, 14, 15
  category: ExpenseCategory;     // "Transport" | "Accommodation" | "Food" | "Sightseeing" | "Other"
  item: string;                  // description
  amount: number;                // always in MYR
  paidWith: PaymentMethod;       // "Cash" | "Debit" | "Credit Card"
  originalAmount?: number;       // amount in original currency before conversion
  originalCurrency?: string;     // e.g. "PHP", "SGD" — any string accepted
  receiptPath?: string;          // Supabase Storage path (after upload)
  receiptUrl?: string;           // data: URL (before upload) OR signed URL (after)
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  createdAt?: string;
  syncStatus?: "synced" | "pending";
}

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
  currencies: string[];          // up to 2 additional beyond base
  travelDates: string[];         // ISO date strings
}
```

---

## Authentication Flow

1. `AuthPanel.tsx` renders OAuth buttons (Google / GitHub / Facebook) — pure UI, no mutations.
2. User clicks provider → App.tsx calls `supabase.auth.signInWithOAuth({ provider })` → browser redirects.
3. On return, `onAuthStateChange` fires → `session` state set in App.tsx.
4. App.tsx queries `user_profiles` table for `is_admin` flag → builds `currentUser: CurrentUserInfo`.
5. `canEdit={Boolean(session)}` passed as prop to BudgetTab — **false when signed out, gates all writes**.
6. `currentUser` also passed to BudgetTab for ownership checks.

Sign-out: `supabase.auth.signOut()` → `session` → null → `canEdit` → false.

---

## State Initialization (Cold Start)

**App.tsx on mount:**

1. `initialExpenseItems` — read immediately from localStorage key `ja-budget-cache` (type `CachedDataset<Expense[]>`).
2. `budgetCapPhp` — read immediately from localStorage, then overwritten by Supabase query on auth.
3. After auth resolves, `mergeBootstrapItems()` reconciles local cache vs Supabase remote:
   - Local rows with `syncStatus: "pending"` WIN over remote (local changes not yet uploaded).
   - Rows present in `syncedIds` but absent locally are treated as deleted — excluded from merge result.
   - Remote rows not in local cache are added.
4. Result set becomes the live `expenses: Expense[]` state.

**Default seed data (`src/data/itinerary.ts`):**
13 pre-seeded sample expenses for days 12–15 used as app scaffold on first load before any real data exists.

---

## BudgetTab State Variables

```ts
// Form state
editingId: string | null          // null = add mode, string = edit mode
desc: string                      // expense description
amountText: string                // raw input string for amount
amountCurrency: string            // currency code for amountText
day: number                       // selected day (12–15)
category: ExpenseCategory
paidWith: PaymentMethod

// Receipt draft
draftReceiptUrl: string           // data: URL of photo in form (not yet saved)
draftReceiptChanged: boolean      // true if user changed photo during edit
receiptError: string

// Card-level receipt (no form)
cardReceiptInputRef               // hidden <input type="file"> ref
receiptTargetIdRef                // ref holding the expense id being photo-attached
loadingReceiptId: string | null   // shows spinner on card during signed URL fetch
receiptBusy: boolean              // prevents duplicate uploads

// Filters
filterCategory: string            // "" = all categories
ownerFilter: "all" | "mine"       // controls which expenses show + which total toward cash/card spent
selectedRegistryDate: string      // filter by date in registry

// Receipt viewer
viewingReceipt: string | null     // URL currently shown in full-screen viewer
```

**State NOT reset by `resetForm()`:**
`day`, `category`, `paidWith`, `amountCurrency` — these persist between submissions.

**State reset by `resetForm()`:**
`editingId`, `desc`, `amountText`, `draftReceiptUrl`, `draftReceiptChanged`, `receiptError`.

---

## Four Mutation Paths

### 1. Add Expense (`submitExpense()` — editingId is null)

```
User fills form → submitExpense()
  → validates: desc required, amount > 0
  → converts amount to MYR via exchange rates
  → builds new Expense {
      id: crypto.randomUUID(),
      day, category, item: desc, amount (MYR),
      paidWith, originalAmount, originalCurrency,
      receiptUrl: draftReceiptUrl (data: URL or undefined),
      createdBy: currentUser.email,
      savedByUserId: currentUser.userId,
      savedByEmail: currentUser.email,
      syncStatus: "pending"
    }
  → prepended to expenses[] via setExpenses([newExpense, ...prev])
  → resetForm()
```

### 2. Edit Expense (`submitExpense()` — editingId is set)

```
startEdit(tx) called:
  → loads tx fields into form state
  → restores originalAmount/originalCurrency (not MYR converted values)
  → if tx.receiptPath but no tx.receiptUrl: fetches 1-hour signed URL → sets draftReceiptUrl

User edits → submitExpense()
  → validates same as add
  → map() over expenses[], replaces matching id in-place:
      updated = { ...existingExpense, ...formFields, syncStatus: "pending" }
      receipt: if draftReceiptChanged → new draftReceiptUrl, else keep existing
  → setExpenses(mapped result)
  → resetForm()
```

**Note:** Edit NEVER creates a new row — always replaces in-place by id.

**Guards:** requires `canManageExpense(tx)` AND `canEdit`.

### 3. Delete Expense (`deleteTransaction(tx)`)

```
deleteTransaction(tx):
  → filter() expenses[] to exclude tx.id
  → setExpenses(filtered)
  → NO confirmation dialog
```

**Guards:** requires `canManageExpense(tx)` ONLY — does NOT require `canEdit`.
This means admins can delete even if Supabase is not configured.

### 4. Card Photo Attach (`triggerCardReceipt` + `handleCardReceiptChange`)

```
User taps camera icon on expense card:
  → triggerCardReceipt(expenseId)
      → receiptTargetIdRef.current = expenseId
      → cardReceiptInputRef.current.click()  ← triggers file picker

User picks photo:
  → handleCardReceiptChange(file)
      → compresses image via Canvas (max 1200px, quality 0.82) → data: URL
      → map() over expenses[], replaces matching receiptTargetIdRef id:
          { ...expense, receiptUrl: dataUrl, receiptPath: undefined, syncStatus: "pending" }
      → setExpenses(mapped result)
```

**Key difference from edit path:** no form opened, no editingId set. Photo attached directly to card.

**Guards:** requires `canManageExpense(expense)` AND `canEdit`.

---

## Permission Model

```ts
canEdit = Boolean(session)         // from App.tsx prop — false when signed out

canManageExpense(e: Expense) =
  currentUser?.isAdmin ||
  (currentUser && e.savedByUserId === currentUser.userId)
```

| Action | canEdit required | canManageExpense required |
|--------|-----------------|--------------------------|
| Add expense | YES | N/A (always own) |
| Edit expense | YES | YES |
| Delete expense | NO | YES |
| Card photo attach | YES | YES |

---

## Supabase Sync Pipeline (App.tsx)

### Expense Upsert Effect

Trigger: `expenses[]` changes + online + authed.
Debounce: 300ms.

```
1. Compute expenseSignature() = JSON.stringify(expenses excluding updated_at)
2. Compare to expenseSignatureRef.current
3. If shouldRealignToManagedState (no pending, no removals, no dirty, signature changed):
     → just update refs, skip Supabase call (e.g. realtime echo)
4. Filter to "managed" expenses: own rows OR admin
5. Build removedIds = ids in expenseIdsRef but not in current expenses[]
6. Upsert remaining managed expenses to budget_expenses table
7. Delete removedIds from budget_expenses table
8. For each deleted id: if expenseReceiptPathsRef has path → delete from trip-receipt-photos bucket
9. Update expenseIdsRef, expenseSignatureRef, expenseDirtyRef = false
10. Write expenses[] to localStorage ja-budget-cache
```

`expenseReceiptPathsRef` — never drops entries, so just-deleted expenses still have their Storage path available for cleanup.

### Receipt Upload Effect

Trigger: independent of expense upsert, runs when `online + authed + any expense has data:// receiptUrl`.
Runs sequentially (one at a time via `receiptBusy` flag).

```
1. Find first expense where receiptUrl starts with "data://"
2. Convert data: URL to Blob
3. Upload to trip-receipt-photos/{userId}/{expenseId}.jpg
4. Get 365-day signed URL from Supabase Storage
5. Update expense in state: receiptUrl = signedUrl, receiptPath = storagePath, syncStatus = "pending"
   (marking pending again triggers the upsert effect to save the path to DB)
```

### Budget Cap Sync

Three entry points all call `setBudgetCapPhp()`:
1. `/settings` route inline input
2. `SettingsModal` component (`onBudgetCapChange` prop)
3. Direct `setBudgetCapPhp()` call

On change:
```
→ Write to localStorage immediately (instant UI)
→ 500ms debounce → upsert to trip_settings table
    { trip_key, user_id, budget_cap_php: value }
    conflict resolution: trip_key + user_id
```

### Realtime Subscriptions

Channel: `trip-sync-{tripKey}` on `postgres_changes` for `budget_expenses`.

```
On DELETE event:
  → if expenseDirtyRef.current: skip (local edits in flight)
  → filter deleted id out of expenses[]

On INSERT or UPDATE event:
  → if expenseDirtyRef.current: skip
  → merge row into expenses[] (replace by id if exists, else append)

Always:
  → forceSyncStatus = "synced" on merged rows
```

---

## Receipt Viewing

```
openReceipt(expense):
  if expense.receiptUrl:
    → setViewingReceipt(receiptUrl)  ← show immediately
  else if expense.receiptPath:
    → setLoadingReceiptId(expense.id)  ← show spinner on card
    → getReceiptSignedUrl(receiptPath) ← 1-hour signed URL from Supabase
    → setViewingReceipt(signedUrl)
    → setLoadingReceiptId(null)
```

Viewer: full-screen modal overlay. Click outside → close (`setViewingReceipt(null)`).

---

## Exchange Rates (src/lib/exchangeRates.ts)

**Fetch source:** `https://api.frankfurter.dev/v1/latest?base=PHP&symbols=MYR,...`

**Normalization:** all rates converted to MYR base internally:
```
normalizedRates[code] = symbolPerBase / myrPerBase
```

**Fallback chain:**
1. Live API fetch (on mount, on `window.online`, every 30 minutes)
2. `ja-exchange-rates` localStorage cache
3. Static fallback from `itinerary.ts`: `{ php: 15.1449, sgd: 0.31601 }`

**Used in BudgetTab:** `useLiveExchangeRates()` hook → converts `originalAmount` in `originalCurrency` → MYR `amount` on submit.

---

## Offline Cache (src/lib/offlineCache.ts)

**localStorage key:** `ja-budget-cache`

**Structure:**
```ts
CachedDataset<Expense[]> = {
  data: Expense[],
  syncedSignature: string,   // JSON.stringify of last synced state
  dirty: boolean,
  syncedIds?: string[]       // ids known to exist in Supabase
}
```

**Read:** `readCachedDataset("ja-budget-cache")` on cold start.
**Write:** `writeCachedDataset("ja-budget-cache", snapshot)` after every successful sync.
**Cross-component reactivity:** `writeCachedDataset` dispatches `offline-cache-update` CustomEvent.

---

## Filtering and Display

### ownerFilter

`"all"` — show all expenses, all count toward totals.
`"mine"` — show only own expenses, only own count toward totals.

Affects:
- `visibleTransactions` (what renders in registry)
- `cashSpent` and `cardSpent` totals in summary header

### visibleTransactions

```
expenses[]
  → filter by filterCategory (if set)
  → filter by ownerFilter
  → filter by selectedRegistryDate (if set)
```

### filteredGroupedTransactions

```
visibleTransactions
  → group by date label (day number → "Day 12 · Jul 12" etc.)
  → sort groups newest day first
  → within group: order preserved (newest first since added by prepend)
```

### Summary Totals

```
cashSpent  = sum of (amount where paidWith === "Cash" || "Debit") for visible expenses
cardSpent  = sum of (amount where paidWith === "Credit Card") for visible expenses
totalSpent = cashSpent + cardSpent
remaining  = budgetCapPhp - totalSpent (shown in header)
```

---

## Budget Summary Header (src/components/BudgetSummaryHeader.tsx)

Shown on home page `/`, NOT on `/budget`. Read-only.

- **Target per day:** from hardcoded `budgetSummary` array in `code1Itinerary.ts`
- **Actual per day:** `getDayTotal(dayNum)` — Cash + Debit only from live `expenses[]`
- **`totalCashActual` / `totalCardActual`** — grand totals all days
- **`estimatedTotalRange`** — sums min/max from `parseAmountRange()` across all budget cards
- Does NOT filter by ownerFilter — always shows all expenses

---

## Settings Modal (src/components/SettingsModal.tsx)

- **Budget cap input** → `onBudgetCapChange` prop → `setBudgetCapPhp` in App.tsx
- **Currency picker** — base currency + up to 2 additional; saved to `user_trip_settings` table
- **Travel date range picker** → expanded to array of ISO dates → `travelDates` in `user_trip_settings`
- On save: upserts to `user_trip_settings`, navigates to `/budget` if currently on `/settings` route

---

## Navigation (src/components/Navigation.tsx)

Renders top header (mobile + desktop) and bottom tab bar.

- Accepts `expenses?: Expense[]` prop — **this prop is never used anywhere in the component**. Dead prop.
- Tab bar routes: `/` (Itinerary), `/budget` (Budget), `/map` (Map), `/diary` (Diary), `/notes` (Notes)
- Contains: countdown timer to trip date (July 11 2026), share modal, immigration PDF download (jsPDF), settings link (when authed), sign in / sign out buttons
- Auth actions in Navigation call `onOpenAuth()` / `onSignOut()` callbacks — handled by App.tsx

---

## Service Worker

Registered in `main.tsx` via `registerSW({ immediate: true })` (Vite PWA plugin).
Enables offline asset caching. Does NOT cache Supabase API responses.

Pull-to-refresh (`IonRefresher`): calls `handleIonRefresh` in App.tsx which does **`window.location.reload()`** after 600ms — full page reload, not a soft data refresh.

---

## Voice Input

In BudgetTab, Web Speech API (`SpeechRecognition`) parses transcript to form fields:
- Detects amount + currency code (e.g. "fifty ringgit" → amount: 50, currency: MYR)
- Detects category keywords → sets `category`
- Detects payment keywords → sets `paidWith`
- Detects day references → sets `day`
- Remainder of transcript → sets `desc`

---

## Image Compression

Applied in both the form receipt picker and the card receipt picker:

```
File → Canvas drawImage → canvas.toDataURL("image/jpeg", 0.82)
Max dimensions: 1200 × 1200px (maintains aspect ratio)
Output: data: URL stored in receiptUrl until upload effect runs
```

---

## Full Data Flow Summary

```
User action (add/edit/delete/photo)
  ↓
BudgetTab local state update (setExpenses)
  ↓
App.tsx expenses[] state updates (lifted state)
  ↓
localStorage ja-budget-cache written immediately
  ↓
300ms debounce expires
  ↓
Supabase upsert/delete (budget_expenses table)
  ↓
If new data: URL in receiptUrl:
  Receipt upload effect → trip-receipt-photos bucket → 365-day signed URL
  → marks expense pending again → triggers upsert with receiptPath
  ↓
Realtime channel broadcasts change to other sessions
  ↓
Other sessions receive postgres_changes event
  → if not dirty: merge into expenses[]
  → mark syncStatus "synced"
```
