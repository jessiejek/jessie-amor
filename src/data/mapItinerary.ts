import { defaultDayPlans } from "./itinerary";
import type { ItineraryItem } from "../types";

export interface MapDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  time: string;
  notes: string;
}

export interface MapDay {
  day: number;
  label: string;
  title: string;
  destinations: MapDestination[];
}

export interface MapItineraryData {
  version: 1;
  updatedAt: string;
  days: MapDay[];
}

type Coordinates = { lat: number; lng: number };

const asciiText = (value: string) =>
  value
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u2022/g, "|")
    .replace(/\u00b7/g, "|")
    .replace(/\u2026/g, "...")
    .replace(/≈/g, "~")
    .replace(/₱/g, "PHP")
    .replace(/S\$/g, "SGD")
    .replace(/\s+/g, " ")
    .trim();

const coordinateHints: Array<{ match: string[]; coords: Coordinates }> = [
  { match: ["klia", "kuala lumpur international airport"], coords: { lat: 2.7456, lng: 101.7072 } },
  { match: ["travelodge", "kl city centre"], coords: { lat: 3.1432, lng: 101.6983 } },
  { match: ["chinatown"], coords: { lat: 3.1418, lng: 101.6972 } },
  { match: ["petaling street"], coords: { lat: 3.1436, lng: 101.6981 } },
  { match: ["sri maha mariamman temple"], coords: { lat: 3.1433, lng: 101.6965 } },
  { match: ["jalan alor"], coords: { lat: 3.1456, lng: 101.7088 } },
  { match: ["kl sentral"], coords: { lat: 3.1344, lng: 101.6865 } },
  { match: ["batu caves"], coords: { lat: 3.2379, lng: 101.684 } },
  { match: ["lotus restaurant"], coords: { lat: 3.2365, lng: 101.6852 } },
  { match: ["klcc park"], coords: { lat: 3.1556, lng: 101.7115 } },
  { match: ["suria klcc"], coords: { lat: 3.1578, lng: 101.7119 } },
  { match: ["saloma link"], coords: { lat: 3.1598, lng: 101.7067 } },
  { match: ["tbs", "terminal bersepadu selatan"], coords: { lat: 3.0768, lng: 101.7107 } },
  { match: ["dutch square", "stadthuys"], coords: { lat: 2.1944, lng: 102.2492 } },
  { match: ["jonker"], coords: { lat: 2.195, lng: 102.2475 } },
  { match: ["cendol"], coords: { lat: 2.1956, lng: 102.2462 } },
  { match: ["famosa", "a famosa"], coords: { lat: 2.1925, lng: 102.2497 } },
  { match: ["central market"], coords: { lat: 3.1451, lng: 101.6953 } },
  { match: ["local heritage toast"], coords: { lat: 3.1431, lng: 101.698 } },
];

export const resolveCoordinatesFromName = (name: string): Coordinates => {
  const normalized = name.toLowerCase();
  const hint = coordinateHints.find(({ match }) => match.some((needle) => normalized.includes(needle)));
  return hint?.coords ?? { lat: 3.139, lng: 101.6869 };
};

const buildNotes = (item: ItineraryItem) => {
  const parts = [asciiText(item.description.trim())];
  if (item.duration) parts.push(`Duration: ${item.duration}`);
  if (item.estimatedCost) parts.push(`Estimated cost: ${item.estimatedCost}`);
  if (item.isCreditCard) parts.push("Paid by card.");
  return asciiText(parts.join(" "));
};

const deriveDestinationName = (item: ItineraryItem) => item.location?.name || item.title;

const normalizeDestination = (item: ItineraryItem): MapDestination => {
  const coords = item.location ?? resolveCoordinatesFromName(deriveDestinationName(item));
  return {
    id: item.id,
    name: asciiText(deriveDestinationName(item)),
    lat: coords.lat,
    lng: coords.lng,
    time: item.time,
    notes: buildNotes(item),
  };
};

export const buildInitialMapItinerary = (): MapItineraryData => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  days: [
    {
      day: 11,
      label: "July 11",
      title: "Arrival day",
      destinations: [],
    },
    ...defaultDayPlans.map((plan) => ({
      day: plan.day,
      label: plan.dateStr,
      title: plan.title,
      destinations: plan.items.map(normalizeDestination),
    })),
    {
      day: 16,
      label: "July 16",
      title: "Departure day",
      destinations: [],
    },
  ],
});

const hasValidDays = (value: unknown): value is MapItineraryData =>
  Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray((value as MapItineraryData).days),
  );

const toNumber = (value: unknown, fallback: number) => {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeMapItinerary = (raw: unknown): MapItineraryData => {
  if (!hasValidDays(raw)) return buildInitialMapItinerary();

  const days = raw.days
    .filter((day) => day && typeof day === "object")
    .map((day) => ({
      day: Number((day as MapDay).day),
      label: asciiText(String((day as MapDay).label || `July ${(day as MapDay).day}`)),
      title: asciiText(String((day as MapDay).title || `Day ${(day as MapDay).day}`)),
      destinations: Array.isArray((day as MapDay).destinations)
        ? (day as MapDay).destinations
            .filter((destination) => destination && typeof destination === "object")
            .map((destination, index) => {
              const name = asciiText(String(destination.name || `Destination ${index + 1}`));
              const inferred = resolveCoordinatesFromName(name);
              const lat = toNumber(destination.lat, inferred.lat);
              const lng = toNumber(destination.lng, inferred.lng);
              return {
                id: String(destination.id || `dest-${day.day}-${index + 1}`),
                name,
                lat,
                lng,
                time: asciiText(String(destination.time || "09:00 AM")),
                notes: asciiText(String(destination.notes || "")),
              };
            })
        : [],
    }))
    .sort((a, b) => a.day - b.day);

  const dayMap = new Map(days.map((day) => [day.day, day] as const));
  const orderedDays: MapDay[] = [];
  for (let dayNumber = 11; dayNumber <= 16; dayNumber += 1) {
    const existing = dayMap.get(dayNumber);
    if (existing) {
      orderedDays.push(existing);
      continue;
    }
    orderedDays.push({
      day: dayNumber,
      label: `July ${dayNumber}`,
      title: dayNumber === 11 ? "Arrival day" : dayNumber === 16 ? "Departure day" : `July ${dayNumber}`,
      destinations: [],
    });
  }

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    days: orderedDays,
  };
};
