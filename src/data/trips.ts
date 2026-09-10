// Central registry of the trips this app can show.
// Each trip is a self-contained "travel vlog": its own itinerary content and
// its own Supabase trip_key, so budget / notes / diary / map rows never mix.
// All trips share the same Supabase database and tables.

export type TripSlug = "mysg" | "khaoshiong";

export interface TripDef {
  slug: TripSlug;
  /** URL prefix the trip is mounted under, e.g. "/mysg". */
  routeBase: string;
  /** Supabase trip_key used to partition every synced dataset. */
  tripKey: string;
  /** Short name for menus and the picker card. */
  name: string;
  /** Longer headline used in the picker. */
  headline: string;
  dateLabel: string;
  location: string;
  /** Accent colour for the picker card. */
  accent: string;
  emoji: string;
  /** Default map centre [lat, lng] before any destinations exist. */
  mapCenter: [number, number];
  /** Example place name for the map search box. */
  mapPlaceholder: string;
}

// Keep the Malaysia - Singapore key exactly as it has always been so existing
// Supabase data keeps loading. Honour an explicit VITE_TRIP_KEY override too.
const MYSG_KEY =
  (import.meta.env.VITE_TRIP_KEY as string | undefined) ||
  "jessie-amor-malaysia-singapore";

export const TRIPS: Record<TripSlug, TripDef> = {
  mysg: {
    slug: "mysg",
    routeBase: "/mysg",
    tripKey: MYSG_KEY,
    name: "Malaysia · Singapore",
    headline: "J&A Malaysia · Singapore Trip 2026",
    dateLabel: "July 11–16, 2026",
    location: "Kuala Lumpur · Malacca · Singapore",
    accent: "#0B3530",
    emoji: "🇲🇾",
    mapCenter: [3.139, 101.6869],
    mapPlaceholder: "Central Market Kuala Lumpur",
  },
  khaoshiong: {
    slug: "khaoshiong",
    routeBase: "/khaoshiong",
    tripKey: "jessie-amor-kaohsiung",
    name: "Kaohsiung",
    headline: "J&A Kaohsiung Trip 2026",
    dateLabel: "October 17–21, 2026",
    location: "Kaohsiung, Taiwan",
    accent: "#1D4E89",
    emoji: "🇹🇼",
    mapCenter: [22.6273, 120.3014],
    mapPlaceholder: "Kaohsiung Main Station",
  },
};

export const TRIP_LIST: TripDef[] = [TRIPS.mysg, TRIPS.khaoshiong];

export function tripSlugFromPath(pathname: string): TripSlug | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (seg === "mysg" || seg === "khaoshiong") return seg;
  return null;
}
