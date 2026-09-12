// Kaohsiung, Taiwan — October 17–21, 2026.
// Land Oct 17 at night, leave Oct 21 in the afternoon, so Oct 18–20 are the
// three full free days.
// - Day 2 (Oct 18): Meteor Garden's real filming location, National Chung
//   Cheng University, is in Chiayi (not Kaohsiung) — done as an early
//   morning round trip, then an easy harbor-district city walk back in
//   Kaohsiung that afternoon/evening.
// - Day 3 (Oct 19): half day at Cijin Island, then a hotel switch to
//   Zuoying and Lotus Pond for the rest of the afternoon/evening.
// - Day 4 (Oct 20): Amor's birthday — kept deliberately light, with a
//   fancy dinner in the evening.

import type {
  AlertBoxData,
  BudgetCard,
  Category,
  DaySectionData,
  HeroData,
  ItemTag,
  ItineraryPlan,
  LegendItem,
  PlaceSegment,
  Segment,
  TagVariant,
  TextSegment,
  TimelineItemData,
  TipCardData,
  GuideKey,
} from "./code1Itinerary";

const text = (value: string): TextSegment => ({ kind: "text", value });
const place = (label: string, placeType: string | undefined, mapQuery: string): PlaceSegment => ({
  kind: "place",
  label,
  placeType,
  mapQuery,
});
const tag = (label: string, variant: TagVariant): ItemTag => ({ label, variant });

let itemCounter = 0;
const item = (input: {
  time: string;
  title: string;
  category: Category;
  description: Segment[];
  tags: ItemTag[];
  mapQuery: string;
  guideKey: GuideKey;
  warnings?: string[];
  infoNotes?: string[];
}): TimelineItemData => {
  itemCounter += 1;
  return {
    id: `kh-${itemCounter}`,
    time: input.time,
    title: input.title,
    category: input.category,
    description: input.description,
    tags: input.tags,
    mapQuery: input.mapQuery,
    guideKey: input.guideKey,
    warnings: input.warnings,
    infoNotes: input.infoNotes,
  };
};

const hero: HeroData = {
  eyebrow: "Travel Itinerary",
  title: "J&A Kaohsiung Trip 2026",
  subtitle: "October 17–21 · Kaohsiung, Taiwan",
  meta: ["Land Oct 17 night", "Leave Oct 21 afternoon", "Oct 20 — Amor's birthday 🎂"],
  note: [
    text(
      "Meteor Garden's real-life campus, National Chung Cheng University, is in Chiayi — about 1.5–2h from Kaohsiung each way. It's built into Day 2's morning, with an easy city walk back in Kaohsiung that afternoon/evening. Day 3 splits between Cijin Island and Lotus Pond. Day 4 is kept light for Amor's birthday, with a fancy dinner that evening.",
    ),
  ],
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

const alert: AlertBoxData = {
  title: "Three things to confirm before this trip",
  body: [
    text(
      "1) The Meteor Garden day trip to Chiayi takes ~5–6 hours round trip — Day 2's city walk back in Kaohsiung is kept short on purpose. 2) Day 3 packs Cijin Island (half day) and Lotus Pond into one day, with a hotel switch to Kindness Hotel near Zuoying in between — confirm the check-in time so the order doesn't slip. 3) Day 4 is Amor's birthday — book the fancy dinner a few days ahead so there's no scrambling for a table that night.",
    ),
  ],
};

const days: DaySectionData[] = [
  {
    day: 17,
    title: "DAY 1 · October 17 — Arrival",
    budgetLabel: "Arrival night",
    items: [
      item({
        time: "7:30 PM",
        title: "Land at Kaohsiung International Airport",
        category: "hotel",
        description: [
          text("Arrive at "),
          place("Kaohsiung International Airport", "airport", "Kaohsiung International Airport"),
          text(", clear immigration, collect bags."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-arrival",
      }),
      item({
        time: "8:15 PM",
        title: "Taxi/MRT to hotel, check in",
        category: "hotel",
        description: [text("Head straight to the hotel and settle in — first day is short, no rush.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "hotel Kaohsiung",
        guideKey: "kh-hotel-checkin",
      }),
      item({
        time: "9:15 PM",
        title: "Easy dinner: Liuhe Night Market",
        category: "food",
        description: [
          text("Optional light dinner at "),
          place("Liuhe Night Market", "night market", "Liuhe Night Market Kaohsiung"),
          text(", walkable from Kaohsiung Main Station. Skip if too tired after the flight."),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Liuhe Night Market Kaohsiung",
        guideKey: "kh-liuhe-night-market",
      }),
    ],
  },
  {
    day: 18,
    title: "DAY 2 · October 18 — Meteor Garden (AM) + City Walk (PM)",
    budgetLabel: "Chiayi day trip + evening city walk",
    items: [
      item({
        time: "7:00 AM",
        title: "HSR: Zuoying → Chiayi",
        category: "train",
        description: [
          text("High Speed Rail from "),
          place("Zuoying HSR Station", "station", "Zuoying HSR Station"),
          text(" to "),
          place("Chiayi HSR Station", "station", "Chiayi HSR Station"),
          text(" (~40 min)."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-hsr-to-chiayi",
      }),
      item({
        time: "7:50 AM",
        title: "Taxi to National Chung Cheng University",
        category: "hotel",
        description: [text("Taxi from Chiayi HSR Station to the campus (~35–40 min).")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-taxi-to-ccu",
      }),
      item({
        time: "8:30 AM – 10:30 AM",
        title: "National Chung Cheng University (Meteor Garden campus)",
        category: "spot",
        description: [
          text("The real "),
          place("National Chung Cheng University", "university", "National Chung Cheng University"),
          text(
            " — stood in for Ying De University in Meteor Garden (2001). Walk the lakeside path and banyan-lined lanes used in the show.",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-chung-cheng-university",
      }),
      item({
        time: "10:45 AM",
        title: "Taxi back to Chiayi HSR Station",
        category: "hotel",
        description: [text("Return taxi to the HSR station (~35–40 min).")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-taxi-back-to-hsr",
      }),
      item({
        time: "11:30 AM",
        title: "HSR: Chiayi → Zuoying",
        category: "train",
        description: [text("Back to Kaohsiung, arriving early afternoon.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-hsr-back-to-kaohsiung",
      }),
      item({
        time: "1:00 PM",
        title: "Lunch near the harbor",
        category: "food",
        description: [text("Casual lunch before the Pier-2 city walk.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant near Pier-2 Art Center Kaohsiung",
        guideKey: "kh-harbor-lunch",
      }),
      item({
        time: "2:30 PM",
        title: "City walk: Pier-2 Art Center",
        category: "walk",
        description: [
          place("Pier-2 Art Center", "art district", "Pier-2 Art Center Kaohsiung"),
          text(" — converted warehouses, murals, and installations along the water. No fixed route, just wander at an easy pace after the Chiayi trip."),
        ],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Pier-2 Art Center Kaohsiung",
        guideKey: "kh-pier2-art-center",
      }),
      item({
        time: "5:30 PM",
        title: "Love Pier at sunset",
        category: "spot",
        description: [place("Love Pier", "pier", "Love Pier Kaohsiung"), text(" — good sunset/night view of the harbor, a short walk from Pier-2.")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Love Pier Kaohsiung",
        guideKey: "kh-love-pier",
      }),
      item({
        time: "6:30 PM",
        title: "Dinner near the harbor",
        category: "food",
        description: [text("Dinner around the Pier-2 / Yancheng area before heading back to the hotel.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant Yancheng District Kaohsiung",
        guideKey: "kh-harbor-dinner",
      }),
    ],
  },
  {
    day: 19,
    title: "DAY 3 · October 19 — Cijin Island (half day) + Lotus Pond",
    budgetLabel: "Cijin morning, Lotus Pond evening",
    items: [
      item({
        time: "9:00 AM",
        title: "Alien Art Center",
        category: "spot",
        description: [
          place("Alien Art Center", "art space", "Alien Art Center Kaohsiung"),
          text(" — near the Gushan ferry pier, worth doing right before crossing to Cijin."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Alien Art Center Kaohsiung",
        guideKey: "kh-alien-art-center",
      }),
      item({
        time: "10:00 AM",
        title: "Ferry to Cijin Island",
        category: "bus",
        description: [text("Short ferry crossing from Gushan Ferry Pier to Cijin.")],
        tags: [tag("Bus", "bus")],
        mapQuery: "Gushan Ferry Pier Kaohsiung",
        guideKey: "kh-ferry-to-cijin",
      }),
      item({
        time: "10:30 AM",
        title: "Cijin Old Street",
        category: "spot",
        description: [place("Cijin Old Street", "street", "Cijin Old Street Kaohsiung")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Old Street Kaohsiung",
        guideKey: "kh-cijin-old-street",
      }),
      item({
        time: "11:30 AM",
        title: "Lunch: Cihou Seafood Market",
        category: "food",
        description: [place("Cihou Seafood Market", "market", "Cihou Seafood Market Kaohsiung")],
        tags: [tag("Food", "food")],
        mapQuery: "Cihou Seafood Market Kaohsiung",
        guideKey: "kh-cihou-seafood-lunch",
      }),
      item({
        time: "12:45 PM",
        title: "Cijin Tianhou Temple",
        category: "spot",
        description: [place("Cijin Tianhou Temple", "temple", "Cijin Tianhou Temple Kaohsiung")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Tianhou Temple Kaohsiung",
        guideKey: "kh-cijin-tianhou-temple",
      }),
      item({
        time: "1:30 PM",
        title: "Cijin Beach",
        category: "spot",
        description: [place("Cijin Beach", "beach", "Cijin Beach Kaohsiung")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Beach Kaohsiung",
        guideKey: "kh-cijin-beach",
      }),
      item({
        time: "2:15 PM",
        title: "Rainbow Church",
        category: "spot",
        description: [
          place("Rainbow Church", "landmark", "Rainbow Church Cijin Kaohsiung"),
          text(" — last stop on Cijin before heading back; skip the rest of the island to keep this a half day."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Rainbow Church Cijin Kaohsiung",
        guideKey: "kh-rainbow-church",
      }),
      item({
        time: "3:00 PM",
        title: "Ferry back to Gushan",
        category: "bus",
        description: [text("Ferry back across to the mainland side.")],
        tags: [tag("Bus", "bus")],
        mapQuery: "Cijin Ferry Pier Kaohsiung",
        guideKey: "kh-ferry-back-to-gushan",
      }),
      item({
        time: "3:45 PM",
        title: "Check out, transfer to Kindness Hotel",
        category: "hotel",
        description: [text("Move to "), place("Kindness Hotel", "hotel", "Kindness Hotel Kaohsiung Zuoying"), text(", closer to Zuoying — drop bags before Lotus Pond.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kindness Hotel Kaohsiung Zuoying",
        guideKey: "kh-transfer-kindness-hotel",
      }),
      item({
        time: "4:45 PM",
        title: "Lotus Pond: Dragon and Tiger Pagodas",
        category: "spot",
        description: [
          text("Enter through the "),
          place("Dragon and Tiger Pagodas", "pagoda", "Dragon and Tiger Pagodas Lotus Pond Kaohsiung"),
          text(" — dragon's mouth in, tiger's mouth out, for good luck."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Dragon and Tiger Pagodas Lotus Pond Kaohsiung",
        guideKey: "kh-dragon-tiger-pagodas",
      }),
      item({
        time: "5:30 PM",
        title: "Spring and Autumn Pavilion + Statue of Xuantian",
        category: "spot",
        description: [
          place("Spring and Autumn Pavilion", "pavilion", "Spring and Autumn Pavilion Kaohsiung"),
          text(" and the "),
          place("Statue of Xuantian Shangdi", "statue", "Statue of Xuantian Shangdi Lotus Pond"),
          text(" nearby."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Spring and Autumn Pavilion Kaohsiung",
        guideKey: "kh-spring-autumn-pavilion",
      }),
      item({
        time: "6:15 PM",
        title: "LRT Green Tunnel",
        category: "spot",
        description: [
          place("LRT Green Tunnel", "photo spot", "Kaohsiung LRT Green Tunnel"),
          text(" — the banyan-canopy stretch of the light rail line, good for dusk photos on the way to dinner."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Kaohsiung LRT Green Tunnel",
        guideKey: "kh-lrt-green-tunnel",
      }),
      item({
        time: "7:00 PM",
        title: "Dinner: Ruifeng Night Market",
        category: "food",
        description: [place("Ruifeng Night Market", "night market", "Ruifeng Night Market Kaohsiung")],
        tags: [tag("Food", "food")],
        mapQuery: "Ruifeng Night Market Kaohsiung",
        guideKey: "kh-ruifeng-night-market",
      }),
    ],
  },
  {
    day: 20,
    title: "DAY 4 · October 20 — Amor's Birthday: Relax Day",
    budgetLabel: "Relax day + fancy dinner 🎂",
    outfitTip: {
      note: "It's the birthday dinner tonight — dress a little nicer than the rest of the trip for it.",
      wear: {
        male: ["Collared shirt or smart casual top for dinner", "Comfortable clothes the rest of the day"],
        female: ["A dress or an outfit you'd want in the birthday photos", "Comfortable clothes the rest of the day"],
      },
      avoid: {
        male: ["Flip-flops or beach sandals at dinner"],
        female: ["Flip-flops or beach sandals at dinner"],
      },
    },
    items: [
      item({
        time: "9:30 AM",
        title: "Slow morning — happy birthday, Amor!",
        category: "free",
        description: [text("No alarms, no itinerary. Sleep in and take breakfast slow — this day is intentionally empty.")],
        tags: [tag("Walk / Free", "free")],
        mapQuery: "breakfast near hotel Kaohsiung",
        guideKey: "kh-birthday-breakfast",
      }),
      item({
        time: "11:00 AM",
        title: "Relax time: spa, hotel pool, or a slow café",
        category: "free",
        description: [text("Whatever \"relax\" means to the two of you today — hotel amenities, a nearby spa, or just a café with nowhere to be.")],
        tags: [tag("Walk / Free", "free")],
        mapQuery: "cafe near hotel Kaohsiung",
        guideKey: "kh-birthday-relax",
      }),
      item({
        time: "1:30 PM",
        title: "Optional: 85 Sky Tower observatory",
        category: "spot",
        description: [
          place("85 Sky Tower", "observatory", "85 Sky Tower Kaohsiung"),
          text(" — indoor, low-effort, great harbor views. Easy to skip if the day is running slower than planned."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "85 Sky Tower Kaohsiung",
        guideKey: "kh-85-sky-tower",
      }),
      item({
        time: "4:00 PM",
        title: "Get ready at the hotel",
        category: "hotel",
        description: [text("Head back, rest, and get changed for the birthday dinner.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "hotel Kaohsiung",
        guideKey: "kh-birthday-get-ready",
        infoNotes: ["Confirm the dinner reservation is still on before leaving the hotel."],
      }),
      item({
        time: "6:30 PM",
        title: "Fancy Birthday Dinner",
        category: "food",
        description: [
          text(
            "Reserve a nicer restaurant ahead of time — a hotel fine-dining room, a rooftop restaurant, or a steakhouse all work well in Kaohsiung. Pick one and book it a few days before, not the morning of.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "fine dining restaurant Kaohsiung",
        guideKey: "kh-birthday-dinner",
        warnings: ["Book this table a few days ahead — it's the birthday dinner, don't leave it to chance."],
      }),
      item({
        time: "8:30 PM",
        title: "Birthday dessert / cake",
        category: "food",
        description: [text("A dessert bar, cake shop, or night-market sweet stall to cap off the night.")],
        tags: [tag("Food", "food")],
        mapQuery: "dessert shop Kaohsiung",
        guideKey: "kh-birthday-dessert",
      }),
    ],
  },
  {
    day: 21,
    title: "DAY 5 · October 21 — Departure",
    budgetLabel: "Morning only, afternoon flight",
    items: [
      item({
        time: "8:00 AM",
        title: "Breakfast near the hotel",
        category: "food",
        description: [text("Easy breakfast, pack up before checkout.")],
        tags: [tag("Food", "food")],
        mapQuery: "breakfast near hotel Kaohsiung",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "9:15 AM",
        title: "Central Park (Kaohsiung)",
        category: "spot",
        description: [
          place("Central Park", "park", "Central Park Kaohsiung"),
          text(" — near the main station, easy stroll for last-minute souvenirs nearby."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Central Park Kaohsiung",
        guideKey: "kh-central-park-kaohsiung",
      }),
      item({
        time: "10:45 AM",
        title: "Dream Mall",
        category: "spot",
        description: [
          place("Dream Mall", "mall", "Dream Mall Kaohsiung"),
          text(" — only ~10–15 min from the airport, good last stop before check-in."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Dream Mall Kaohsiung",
        guideKey: "kh-dream-mall",
      }),
      item({
        time: "12:30 PM",
        title: "Head to Kaohsiung International Airport",
        category: "hotel",
        description: [text("Taxi/MRT to the airport for the afternoon flight home.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
    ],
  },
];

const tips: TipCardData[] = [];

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
