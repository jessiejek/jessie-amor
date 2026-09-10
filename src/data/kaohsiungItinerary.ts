// Kaohsiung, Taiwan — October 17–21, 2026.
// The itinerary is intentionally left blank: five empty day sections that the
// travellers fill in-app. Budget, Map, Diary and Notes work exactly like the
// Malaysia - Singapore trip, backed by their own Supabase trip_key.

import type {
  AlertBoxData,
  BudgetCard,
  DaySectionData,
  HeroData,
  ItineraryPlan,
  LegendItem,
  Segment,
  TipCardData,
} from "./code1Itinerary";

const text = (value: string): Segment => ({ kind: "text", value });

const hero: HeroData = {
  eyebrow: "Travel Itinerary",
  title: "J&A Kaohsiung Trip 2026",
  subtitle: "October 17–21 · Kaohsiung, Taiwan",
  meta: [],
  note: [],
};

const legend: LegendItem[] = [
  { label: "Train / MRT / LRT", color: "#378ADD" },
  { label: "Bus", color: "#BA7517" },
  { label: "Food", color: "#1D9E75" },
  { label: "Tourist spot", color: "#7F77DD" },
  { label: "Walk / Free", color: "#888780" },
  { label: "Hotel / Taxi", color: "#D4537E" },
];

const budgetSummary: BudgetCard[] = [];

const tips: TipCardData[] = [];

const alert: AlertBoxData = {
  title: "Itinerary not planned yet",
  body: [
    text(
      "This trip's day-by-day plan is still empty. Use Budget, Map, Diary and Notes now, and add the daily schedule here later.",
    ),
  ],
};

// Oct 17–21. Day numbers are the calendar date so the itinerary, budget and
// map tabs all key off the same value.
const days: DaySectionData[] = [17, 18, 19, 20, 21].map((day, index) => ({
  day,
  title: `DAY ${index + 1} · October ${day}`,
  budgetLabel: "To be planned",
  items: [],
}));

export const kaohsiungPlan: ItineraryPlan = {
  id: "partner",
  label: "Kaohsiung",
  description: "Kaohsiung, Taiwan — October 17–21, 2026",
  hero,
  budgetSummary,
  legend,
  days,
  alert,
  tips,
  footer: "J&A Kaohsiung Trip 2026",
};
