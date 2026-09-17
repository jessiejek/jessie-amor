# Fix Plan — Codebase Review Findings (2026-09-17)

Source: code review covering wiring, warnings/faults, and offline functionality
across `src/App.tsx`, `src/components/MapTab.tsx`, `src/components/BudgetTab.tsx`,
`src/components/DiaryTab.tsx`, `src/lib/offlineCache.ts`, `src/lib/supabase.ts`,
`vite.config.ts`, and `src/utils/generateImmigrationPdf.ts`.

Three concrete issues were found. Ordered by priority (build-breaking first).

---

## 1. Fix the broken build — `tsc --noEmit` fails (P0)

**File:** [src/utils/generateImmigrationPdf.ts:76](src/utils/generateImmigrationPdf.ts:76) and [:193](src/utils/generateImmigrationPdf.ts:193)

**Problem:** Both call sites use `doc.internal.getNumberOfPages()`, but in the
installed jsPDF version (`jspdf@4.2.1`, pulled in transitively via
`html2pdf.js`), `getNumberOfPages()` is a method on the `jsPDF` instance
itself, not on `.internal`. `npm run lint` (`tsc --noEmit`) currently fails
with `TS2339` at both lines.

**Fix:**
```diff
- const totalPages = doc.internal.getNumberOfPages();
+ const totalPages = doc.getNumberOfPages();
```
Apply at both line 76 and line 193.

**Verify:**
```bash
npx tsc --noEmit
```
Should exit clean. Then manually exercise the PDF export (Settings → PDF
editor → generate) for both trip profiles (Malaysia/Singapore and Kaohsiung)
and confirm the page-number footer ("Page X of Y") renders correctly on a
multi-page document.

---

## 2. Diary photo upload can silently fail on iOS Safari/PWA (P1)

**File:** [src/App.tsx:1781](src/App.tsx:1781)

**Problem:** The diary sync effect uploads a locally-attached photo with:
```ts
const response = await fetch(entry.photoUrl); // photoUrl is a data: URL
const blob = await response.blob();
```
The codebase already documents, at [src/App.tsx:353-354](src/App.tsx:353),
that `fetch()` on a `data:` URL silently fails on iOS Safari/PWA for images
larger than ~1–2 MB (WKWebView limitation) — that's exactly why
`dataUrlToBlob()` was written. But `dataUrlToBlob()` is only used for expense
receipts ([src/App.tsx:1432](src/App.tsx:1432)); the diary path never adopted
it. Net effect: a large diary photo can get stuck "pending" forever on iOS
PWA installs, while an identically-sized receipt photo uploads fine.

**Fix:** Replace the `fetch()` call in the diary upload path with the
existing `dataUrlToBlob()` helper, matching the receipt-upload pattern:
```diff
- const response = await fetch(entry.photoUrl);
- const blob = await response.blob();
+ const blob = dataUrlToBlob(entry.photoUrl);
```
`dataUrlToBlob` is already defined at module scope in the same file
([src/App.tsx:355](src/App.tsx:355)), so no new import is needed — just
reuse it here instead of `fetch`.

**Verify:**
1. On an iOS device (or Safari with WKWebView-equivalent constraints),
   install the app as a PWA, go offline, add a diary entry with a photo
   larger than ~2 MB, then reconnect.
2. Confirm the entry's sync dot moves from "pending" to "synced" and the
   photo persists after a reload (i.e. it actually made it to Supabase
   Storage, not just cleared from the local dirty flag).
3. Re-run the existing regression suite to confirm no regressions in the
   already-passing cases:
   ```bash
   npx tsx scripts/offline-sync-regression-check.ts
   ```
   (This script tests the cache/dirty-flag state machine, not the network
   call itself, so it won't catch this bug directly — the manual device test
   above is the real verification. Consider adding a unit test around
   `dataUrlToBlob` usage if this path gets refactored further.)

---

## 3. Remove dead code — unused `mapCache` (P2, cleanup)

**File:** [src/App.tsx:489](src/App.tsx:489)

**Problem:**
```ts
const mapCache = useCachedDataset<MapItineraryData>(mapCacheKey);
```
This value is never read anywhere else in `App.tsx`. Map data caching is
actually handled independently inside `MapTab.tsx` itself
([src/components/MapTab.tsx:80-113](src/components/MapTab.tsx:80)), so this
line in `App.tsx` is leftover/dead. It's not caught by `tsc` because
`tsconfig.json` has no `noUnusedLocals`/`noUnusedParameters` flags set.

**Fix:** Delete the line. Confirm first that no other code depends on the
`storage`/`offline-cache-update` event side effects that `useCachedDataset`
subscribes to (it doesn't — those listeners only call `setSnapshot`
internally and have no external effect once the returned value is unused).
```diff
-  const mapCache = useCachedDataset<MapItineraryData>(mapCacheKey);
```
Also remove `useCachedDataset` from the `./lib/offlineCache` import in
`App.tsx` if this was its only use there (check first — `readCachedDataset`
and `writeCachedDataset` are still used directly).

**Verify:**
```bash
npx tsc --noEmit
```
And do a quick smoke test of the Map tab (add/edit/delete a destination,
reload) to confirm nothing regresses — this removal should be a no-op for
runtime behavior.

---

## Optional follow-up (not a confirmed bug, noted for awareness)

**Inconsistent image-decode robustness:** `BudgetTab.tsx`'s
`compressReceiptToDataUrl` has an `<img>`-element fallback for browsers
without `createImageBitmap({ imageOrientation })` support
([src/components/BudgetTab.tsx:28-40](src/components/BudgetTab.tsx:28)).
`DiaryTab.tsx`'s `compressImageFileToDataUrl` has no such fallback
([src/components/DiaryTab.tsx:41-46](src/components/DiaryTab.tsx:41)) and
will throw on older browsers/WebViews that lack the option. Not required to
fix immediately, but if it's worth doing, port the same fallback loop from
`BudgetTab.tsx` into `DiaryTab.tsx` for consistency.

---

## Suggested order of work

1. Fix #1 (PDF page count) — 2-line change, unblocks `npm run lint`/CI.
2. Fix #2 (diary photo upload) — 1-line change, but needs device-level
   verification since it's an iOS-specific failure mode.
3. Fix #3 (dead `mapCache`) — trivial cleanup, do alongside #1/#2 in the same
   PR since it's zero-risk.
4. Optional: diary image-decode fallback, as a separate small follow-up.

After all three fixes, re-run:
```bash
npx tsc --noEmit
npx tsx scripts/offline-sync-regression-check.ts
```
both should pass clean before considering this done.
