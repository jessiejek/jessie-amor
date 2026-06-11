# Tailwind Removal Audit — Phase 5A

> Generated: Wed 2026-06-10 05:42 PDT  
> Project: J&A Malaysia · Singapore Trip 2026

## Status

**Phase 5A Tailwind audit status: PASS** ✅

All three checks passed:
- `npm run build` ✅ PASS
- `npm run lint` ✅ PASS
- `npm run test:offline-sync` ✅ PASS (13/13)

---

## Files scanned

| File | className usages | Ionic conversion |
|------|:-:|:--|
| `src/App.tsx` | 101 | Shell (Phase 1) |
| `src/components/Navigation.tsx` | 92 | Shell (Phase 2D) |
| `src/components/AuthPanel.tsx` | 23 | Ionic (Phase 2A) |
| `src/components/SettingsModal.tsx` | 44 | Ionic (Phase 2C) |
| `src/components/DestinationInfoModal.tsx` | 57 | Ionic (Phase 2B) |
| `src/components/AlertBox.tsx` | 8 | Partially Ionic (Phase 3A) |
| `src/components/TipCard.tsx` | 3 | Ionic (Phase 3A) |
| `src/components/Legend.tsx` | 5 | Partially Ionic (Phase 3A) |
| `src/components/Hero.tsx` | 15 | Partially Ionic (Phase 3B) |
| `src/components/BudgetSummaryHeader.tsx` | 30 | Partially Ionic (Phase 3C) |
| `src/components/DailyItineraryView.tsx` | 51 | Partially Ionic (Phase 3D) |
| `src/components/NotesTab.tsx` | 50 | Ionic shell (Phase 4A) |
| `src/components/BudgetTab.tsx` | 105 | Ionic shell (Phase 4B) |
| `src/components/DiaryTab.tsx` | 144 | Ionic shell (Phase 4C) |
| `src/components/MapTab.tsx` | 81 | Ionic shell (Phase 4D) |
| `src/components/RichText.tsx` | 4 | Not converted |
| **Total** | **~812** | |

## Remaining Tailwind usage summary

**~676 unique Tailwind classes** across 16 files + `index.css`.

## Tailwind class categories found

### Layout / Spacing (214 unique)
Mostly safe to move to CSS. Patterns:
- **Flexbox:** `flex`, `flex-1`, `flex-col`, `flex-wrap`, `inline-flex`
- **Grid:** `grid`, `grid-cols-*`, `col-span-*`, `gap-*`
- **Spacing:** `p-*`, `m-*`, `px-*`, `py-*`, `mt-*`, `mb-*`, `space-y-*`
- **Sizing:** `w-*`, `h-*`, `min-w-*`, `max-w-*`, `aspect-*`
- **Positioning:** `absolute`, `relative`, `fixed`, `sticky`, `inset-*`, `top-*`, `left-*`, `z-*`
- **Overflow:** `overflow-hidden`, `overflow-x-auto`, `overflow-y-auto`, `truncate`
- **Other:** `hidden`, `block`, `object-cover`, `pointer-events-none`, `sr-only`

**Verdict:** These are the bulk of remaining Tailwind. Each maps 1:1 to a CSS property. Easy to move.

### Color / Brand (158 unique)
Includes both Tailwind color palette (`bg-stone-100`, `text-stone-600`, `border-amber-200`) and arbitrary values (`bg-[#0B3530]`, `text-[#88B04B]`, `shadow-[0_10px_30px_rgba(...)]`).

**Verdict:** Custom brand colors can become CSS variables (`--ja-bg-primary`, `--ja-text-body`, etc.). Tailwind palette colors like `stone-100`, `amber-50`, `rose-200` need explicit hex equivalents.

### Typography (41 unique)
- **Font families:** `font-sans`, `font-serif`, `font-mono`
- **Weights:** `font-bold`, `font-semibold`, `font-medium`, `font-black`, `font-extrabold`
- **Sizes:** `text-sm`, `text-xs`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, plus arbitrary `text-[10px]` through `text-[38px]`
- **Tracking/Leading:** `tracking-*`, `leading-*`
- **Other:** `uppercase`, `underline`, `whitespace-nowrap`, `line-clamp-*`

**Verdict:** Some map to existing CSS already defined in `@theme` block. Others are arbitrary/mixed.

### Responsive (56 unique)
All `sm:`, `md:`, `lg:`, `xl:` prefixed variants. Every responsive class is one of the above categories with a breakpoint.

**Verdict:** Need media queries in CSS. The breakpoints are already known (sm: 640px, md: 768px, lg: 1024px, xl: 1280px).

### Animation / State (27 unique)
- **Transitions:** `transition-all`, `transition-colors`, `transition-shadow`, `transition-transform`
- **Animations:** `animate-in`, `animate-spin`, `animate-ping`, `animate-spin-slow`
- **Duration/Easing:** `duration-150`, `duration-300`, `duration-500`, `duration-700`
- **Hover/Focus:** `hover:bg-*`, `hover:text-*`, `hover:border-*`, `focus:border-*`, `group-hover:scale-*`

**Verdict:** Easy to convert to CSS. The `animate-in` and `fade-in` classes may already have CSS equivalents from existing animation libraries.

### Arbitrary (1 unique)
`[background-size:16px_16px]` — easy CSS conversion.

## Files safe to clean first

| Priority | File | Reason |
|:--------:|------|--------|
| 1 | `TipCard.tsx` | Only 3 className usages, fully Ionic |
| 2 | `AlertBox.tsx` | 8 usages, mostly Ionic |
| 3 | `Legend.tsx` | 5 usages, simple component |
| 4 | `RichText.tsx` | 4 usages, tiny component |
| 5 | `AuthPanel.tsx` | 23 usages, fully Ionic wrapper |
| 6 | `Hero.tsx` | 15 usages, mostly layout classes |
| 7 | `BudgetSummaryHeader.tsx` | 30 usages, mostly layout classes |
| 8 | `DailyItineraryView.tsx` | 51 usages, many `ja-` custom classes already |
| 9 | `SettingsModal.tsx` | 44 usages, fully Ionic wrapper |

## Files risky to clean later

| Risk | File | Reason |
|:----:|------|--------|
| High | `App.tsx` | 101 usages, the parent orchestrator — last to touch |
| High | `Navigation.tsx` | 92 usages, many inline Tailwind for complex layouts |
| High | `DiaryTab.tsx` | 144 usages — largest file, many complex layout/state classes |
| High | `BudgetTab.tsx` | 105 usages — budget-pill, budget-transaction-card CSS classes mixed with Tailwind |
| High | `DestinationInfoModal.tsx` | 57 usages, many inline layout/typography classes |

## Whether Tailwind infrastructure is still required

| Component | Currently required? | After removal? |
|-----------|:------------------:|:--------------:|
| `@import "tailwindcss"` in index.css | Yes — provides `@theme` font definitions and base resets | No — replace `@theme` with plain CSS custom properties |
| `@tailwindcss/vite` in vite.config.ts | Yes — compiles Tailwind CSS | No — remove entirely |
| `tailwindcss` in package.json | Yes — peer dep for `@tailwindcss/vite` | No — remove |
| `@tailwindcss/vite` in package.json | Yes | No — remove |

## Recommended phased removal plan

### Phase 5B — Low-hanging fruit
Files: `TipCard.tsx`, `AlertBox.tsx`, `Legend.tsx`, `RichText.tsx`, `AuthPanel.tsx`, `Hero.tsx`
- Replace all `className` with new `ja-*` CSS classes
- Move simple layout/spacing to CSS
- Remove all Tailwind from these files

### Phase 5C — Medium complexity
Files: `BudgetSummaryHeader.tsx`, `SettingsModal.tsx`, `DailyItineraryView.tsx`, `NotesTab.tsx`
- Convert layout/spacing/typography classes to `ja-*` CSS
- Replace `text-*` font sizes with custom CSS classes
- Replace `bg-*`/`text-*`/`border-*` Tailwind colors with CSS variables

### Phase 5D — BudgetTab (high Tailwind + custom budget CSS)
- The `budget-page`, `budget-transaction-card`, `budget-pill-*` CSS classes are already in index.css
- Remove `className` Tailwind classes from JSX only
- Keep the existing `.budget-*` CSS untouched

### Phase 5E — DiaryTab (largest file, 144 usages)
- Convert spacing/layout classes to component-specific CSS
- Replace responsive classes with media queries
- Replace arbitrary color values with CSS variables
- Keep complex rating/star interaction classes

### Phase 5F — MapTab + DestinationInfoModal
- MapTab: 81 usages, many layout/spacing
- DestinationInfoModal: 57 usages, many typography/layout

### Phase 5G — Navigation + App.tsx (last, highest risk)
- Navigation: 92 usages with inline Tailwind for desktop/mobile headers
- App.tsx: 101 usages, part of the shell — needs careful validation

### Phase 5H — Remove Tailwind infrastructure
- Remove `@import "tailwindcss"` from `index.css`
- Remove `tailwindcss()` from `vite.config.ts`
- Remove `@tailwindcss/vite` and `tailwindcss` packages from `package.json`
- Run `npm install` to clean up
- Verify build/lint/test all pass

## Can Tailwind be removed now?

**Executed in Phase 5H (June 10, 2026).** All planned phases completed successfully.

## Final Tailwind status

| Item | Status |
|------|:-----:|
| `@import "tailwindcss"` in index.css | Removed (replaced with `:root` CSS variables) |
| `@tailwindcss/vite` plugin import | Removed |
| `@tailwindcss/vite` plugin usage | Removed |
| `tailwindcss` package | Uninstalled |
| `@tailwindcss/vite` package | Uninstalled |
| TSX Tailwind utility classes | **0** across all `src/**/*.tsx` |
| `npm run build` | **PASS** ✅ |
| `npm run lint` | **PASS** ✅ |
| `npm run test:offline-sync` | **PASS** ✅ (13/13) |

## What was preserved

- All Ionic CSS imports and component styling
- `VitePWA` plugin with all PWA/manifest/workbox config
- React plugin
- Semantic `ja-*` CSS classes (converted from Tailwind)
- `budget-*`, `hero-*`, `legend-*` CSS classes
- Leaflet container CSS rules
- Safe-area/PWA/mobile viewport CSS (`env(safe-area-inset-*)`)
- `no-print` print media query
- All app behavior unchanged

---

_End of audit report. Tailwind fully removed._
