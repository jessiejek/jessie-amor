// Resolves which trip is active from the URL, once, at module load.
// Switching trips is a full-page navigation from the picker, so this stays
// constant for the life of the page and can be imported like a plain value.

import { TRIPS, tripSlugFromPath, type TripDef, type TripSlug } from "../data/trips";

export const activeTripSlug: TripSlug | null =
  typeof window !== "undefined" ? tripSlugFromPath(window.location.pathname) : null;

export const activeTrip: TripDef | null = activeTripSlug ? TRIPS[activeTripSlug] : null;

/**
 * Default per-day budget/filter chips for the active trip, used when the user
 * has not configured custom travel dates in Settings.
 */
export const tripDayCards: { value: number; label: string }[] =
  activeTripSlug === "khaoshiong"
    ? [17, 18, 19, 20, 21].map((d) => ({ value: d, label: `October ${d}` }))
    : [12, 13, 14, 15].map((d) => ({ value: d, label: `July ${d}` }));

