// Kaohsiung, Taiwan — October 17–21, 2026.
// Land Oct 17 at night, leave Oct 21 in the afternoon, so Oct 18–20 are the
// three full free days. One hotel the whole trip: Hub Hotel Kaohsiung Yisin
// Branch (confirmed booking, Oct 17–21) — no hotel switch.
// - Day 2 (Oct 18): full day at Cijin Island.
// - Day 3 (Oct 19): Meteor Garden's real filming location, National Chung
//   Cheng University, is in Chiayi (not Kaohsiung) — done as an early
//   morning round trip, then a walkable afternoon back near the hotel
//   (Qianzhen Phase 31 Park, Sanduo Shopping District, 85 Sky Tower) so
//   there's no afternoon nap.
// - Day 4 (Oct 20): Amor's birthday — kept slow and aesthetic (Lotus Pond,
//   Central Park, Pier-2, Love Pier at sunset), capped with a fancy dinner
//   and dessert.
// - No seafood, any day.

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
  meta: ["Land Oct 17 night", "Leave Oct 21 afternoon", "Hub Hotel Yisin Branch, Oct 17–21", "Oct 20 — Amor's birthday 🎂", "No seafood"],
  note: [
    text(
      "One hotel the whole trip: Hub Hotel Kaohsiung Yisin Branch. Meteor Garden's real-life campus, National Chung Cheng University, is in Chiayi — about 1.5–2h from Kaohsiung each way, done as a Day 3 morning round trip with a walkable city afternoon back near the hotel. Day 4 is Amor's birthday — kept slow with aesthetic, low-effort walks and a fancy dinner that evening. No seafood on any day.",
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
  title: "Two things to confirm before this trip",
  body: [
    text(
      "1) The Meteor Garden day trip to Chiayi (Day 3) takes ~5–6 hours round trip including the HSR and taxi legs — that's the single most expensive day of the trip. 2) Day 4 is Amor's birthday — book the fancy dinner a few days ahead, not the morning of.",
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
        time: "8:00 PM",
        title: "MRT: Airport (R4) → Sanduo Shopping District (R8)",
        category: "train",
        description: [text("Red Line, ~15 min, direct — no transfers.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Sanduo Shopping District MRT Station Kaohsiung",
        guideKey: "kh-mrt-to-zuoying",
      }),
      item({
        time: "8:20 PM",
        title: "Walk to Hub Hotel Yisin Branch, check in",
        category: "hotel",
        description: [
          text("~10 min walk from the station to "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(". First day is short, no rush."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "9:00 PM",
        title: "Dinner near the hotel",
        category: "food",
        description: [text("Easy, non-seafood dinner near Sanduo/Qianzhen — skip trekking cross-town on a tired first night.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant Qianzhen District Kaohsiung",
        guideKey: "kh-liuhe-night-market",
      }),
    ],
  },
  {
    day: 18,
    title: "DAY 2 · October 18 — Cijin Island",
    budgetLabel: "Full day, Cijin",
    items: [
      item({
        time: "7:30 AM",
        title: "Breakfast at Hub Hotel",
        category: "food",
        description: [text("Free breakfast at the hotel before heading out.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:30 AM",
        title: "MRT/taxi to Gushan Ferry Pier",
        category: "hotel",
        description: [text("~25-30 min from the hotel.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Gushan Ferry Pier Kaohsiung",
        guideKey: "kh-harbor-lunch",
      }),
      item({
        time: "9:00 AM",
        title: "Alien Art Center",
        category: "spot",
        description: [
          place("Alien Art Center", "art space", "Alien Art Center Kaohsiung"),
          text(" — right by the Gushan ferry pier, worth doing before crossing to Cijin."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Alien Art Center Kaohsiung",
        guideKey: "kh-alien-art-center",
      }),
      item({
        time: "9:45 AM",
        title: "British Consulate at Takao",
        category: "spot",
        description: [
          place("British Consulate at Takao", "landmark", "British Consulate at Takao"),
          text(" — on the Gushan/Sizihwan side overlooking the harbor mouth, not on Cijin itself. Easy to fold in here before the ferry."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "British Consulate at Takao",
        guideKey: "kh-british-consulate-gushan",
      }),
      item({
        time: "10:30 AM",
        title: "Ferry to Cijin Island",
        category: "bus",
        description: [text("Short ferry crossing from Gushan Ferry Pier to Cijin.")],
        tags: [tag("Bus", "bus")],
        mapQuery: "Gushan Ferry Pier Kaohsiung",
        guideKey: "kh-ferry-to-cijin",
      }),
      item({
        time: "10:45 AM",
        title: "Cijin Old Street",
        category: "spot",
        description: [place("Cijin Old Street", "street", "Cijin Old Street Kaohsiung")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Old Street Kaohsiung",
        guideKey: "kh-cijin-old-street",
      }),
      item({
        time: "11:45 AM",
        title: "Lunch: Cijin Old Street (non-seafood)",
        category: "food",
        description: [text("Noodles, buns, and local snack stalls along the street — plenty of non-seafood options.")],
        tags: [tag("Food", "food")],
        mapQuery: "Cijin Old Street Kaohsiung",
        guideKey: "kh-cijin-lunch-nonseafood",
      }),
      item({
        time: "1:00 PM",
        title: "Cijin Tianhou Temple",
        category: "spot",
        description: [place("Cijin Tianhou Temple", "temple", "Cijin Tianhou Temple Kaohsiung")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Tianhou Temple Kaohsiung",
        guideKey: "kh-cijin-tianhou-temple",
      }),
      item({
        time: "1:45 PM",
        title: "Cijin Beach",
        category: "spot",
        description: [place("Cijin Beach", "beach", "Cijin Beach Kaohsiung")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Beach Kaohsiung",
        guideKey: "kh-cijin-beach",
      }),
      item({
        time: "2:30 PM",
        title: "Rainbow Church",
        category: "spot",
        description: [place("Rainbow Church", "landmark", "Rainbow Church Cijin Kaohsiung")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Rainbow Church Cijin Kaohsiung",
        guideKey: "kh-rainbow-church",
      }),
      item({
        time: "3:00 PM",
        title: "Coastal Park",
        category: "spot",
        description: [place("Coastal Park", "park", "Cijin Coastal Park Kaohsiung")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Coastal Park Kaohsiung",
        guideKey: "kh-coastal-park",
      }),
      item({
        time: "3:30 PM",
        title: "Coral Reef Cliff",
        category: "spot",
        description: [place("Coral Reef Cliff", "cliff", "Cijin Coral Reef Cliff Kaohsiung")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Coral Reef Cliff Kaohsiung",
        guideKey: "kh-coral-reef-cliff",
      }),
      item({
        time: "4:00 PM",
        title: "Cijin Tunnel of Stars",
        category: "spot",
        description: [
          place("Cijin Tunnel of Stars", "tunnel", "Cijin Tunnel of Stars Kaohsiung"),
          text(" — right after, share a shaved ice or bubble tea before the hilltop climb."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Tunnel of Stars Kaohsiung",
        guideKey: "kh-cijin-tunnel-of-stars",
      }),
      item({
        time: "4:30 PM",
        title: "Mount Cihou + Kaohsiung Lighthouse",
        category: "spot",
        description: [
          place("Mount Cihou", "hill", "Mount Cihou Kaohsiung"),
          text(" up to the "),
          place("Kaohsiung Lighthouse", "lighthouse", "Kaohsiung Lighthouse"),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Kaohsiung Lighthouse",
        guideKey: "kh-cihou-lighthouse",
      }),
      item({
        time: "5:15 PM",
        title: "Cihou Fort, sunset",
        category: "spot",
        description: [
          place("Cihou Fort", "fort", "Cihou Fort Kaohsiung"),
          text(" — same hill as the lighthouse, good for sunset."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cihou Fort Kaohsiung",
        guideKey: "kh-cihou-fort",
      }),
      item({
        time: "6:45 PM",
        title: "Ferry back to Gushan",
        category: "bus",
        description: [text("Ferry back across to the mainland side for dinner.")],
        tags: [tag("Bus", "bus")],
        mapQuery: "Cijin Ferry Pier Kaohsiung",
        guideKey: "kh-ferry-back-to-gushan",
      }),
      item({
        time: "7:30 PM",
        title: "Dinner near Gushan (non-seafood)",
        category: "food",
        description: [text("Beef noodles, braised pork rice, or similar — not one of the area's usual seafood spots.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant Gushan District Kaohsiung",
        guideKey: "kh-gushan-dinner",
      }),
      item({
        time: "8:30 PM",
        title: "MRT/taxi back to Hub Hotel",
        category: "hotel",
        description: [text("Back to Sanduo/Yisin for the night.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-harbor-dinner",
      }),
    ],
  },
  {
    day: 19,
    title: "DAY 3 · October 19 — Meteor Garden University (Chiayi) + Walkable City Afternoon",
    budgetLabel: "Chiayi day trip + walkable afternoon",
    items: [
      item({
        time: "6:15 AM",
        title: "Grab coffee + bread from the hotel's free breakfast, to go",
        category: "food",
        description: [text("Share 1 coffee + 1 bread — too early to sit for the full spread before an early HSR.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "6:25 AM",
        title: "Walk to Sanduo Shopping District Station (R8)",
        category: "walk",
        description: [text("~10 min walk from Hub Hotel to the nearest MRT station.")],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Sanduo Shopping District MRT Station Kaohsiung",
        guideKey: "kh-mrt-to-zuoying",
      }),
      item({
        time: "6:40 AM",
        title: "MRT: R8 Sanduo → R16 Zuoying",
        category: "train",
        description: [text("Red Line, ~20 min, to reach Zuoying HSR Station.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-mrt-to-zuoying",
      }),
      item({
        time: "7:10 AM",
        title: "HSR: Zuoying → Chiayi",
        category: "train",
        description: [
          text("High Speed Rail, ~40 min, Standard Car NT$410/person one-way. Round trip for 2 people: NT$1,640 total."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-hsr-to-chiayi",
      }),
      item({
        time: "7:55 AM",
        title: "Taxi to National Chung Cheng University",
        category: "hotel",
        description: [text("~35-40 min from Chiayi HSR Station to the campus.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-taxi-to-ccu",
      }),
      item({
        time: "8:35 AM",
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
        time: "10:15 AM",
        title: "Lunch near campus (non-seafood)",
        category: "food",
        description: [text("Try Chiayi turkey rice — a local specialty, no seafood.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant near National Chung Cheng University Chiayi",
        guideKey: "kh-campus-lunch",
      }),
      item({
        time: "11:15 AM",
        title: "Taxi back to Chiayi HSR Station",
        category: "hotel",
        description: [text("~35-40 min return.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-taxi-back-to-hsr",
      }),
      item({
        time: "12:00 PM",
        title: "HSR: Chiayi → Zuoying",
        category: "train",
        description: [text("~40 min back to Kaohsiung.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-hsr-back-to-kaohsiung",
      }),
      item({
        time: "12:45 PM",
        title: "MRT: R16 Zuoying → R8 Sanduo",
        category: "train",
        description: [text("Red Line, ~20 min back toward the hotel.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Sanduo Shopping District MRT Station Kaohsiung",
        guideKey: "kh-mrt-back-to-sanduo",
      }),
      item({
        time: "1:15 PM",
        title: "Back at Hub Hotel — drop bags, freshen up (no nap!)",
        category: "hotel",
        description: [text("Quick stop, not a rest — the afternoon is a walkable city stretch so the day doesn't just end here.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "1:45 PM",
        title: "Walk: Qianzhen Phase 31 Park",
        category: "walk",
        description: [
          place("Qianzhen Phase 31 Park", "park", "Qianzhen Phase 31 Park Kaohsiung"),
          text(" — ~5-10 min walk from the hotel, a big urban green space, good for walking off the travel."),
        ],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Qianzhen Phase 31 Park Kaohsiung",
        guideKey: "kh-qianzhen-park",
      }),
      item({
        time: "2:30 PM",
        title: "Sanduo Shopping District",
        category: "walk",
        description: [
          text("Shin Kong Mitsukoshi + Pacific SOGO — "),
          place("Sanduo Shopping District", "shopping district", "Sanduo Shopping District Kaohsiung"),
          text(", ~10 min walk. Browse, AC break."),
        ],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Sanduo Shopping District Kaohsiung",
        guideKey: "kh-sanduo-shopping",
      }),
      item({
        time: "3:30 PM",
        title: "Coffee/snack break",
        category: "food",
        description: [text("Shared coffee or snack, non-seafood.")],
        tags: [tag("Food", "food")],
        mapQuery: "cafe Sanduo Shopping District Kaohsiung",
        guideKey: "kh-city-walk-snack",
      }),
      item({
        time: "4:00 PM",
        title: "85 Sky Tower observatory",
        category: "spot",
        description: [
          place("85 Sky Tower", "observatory", "85 Sky Tower Kaohsiung"),
          text(" — ~20 min walk or 1 MRT stop. Observation deck on floor 74, panoramic city views."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "85 Sky Tower Kaohsiung",
        guideKey: "kh-85-sky-tower",
        infoNotes: ["Observatory entry ~NT$200/person."],
      }),
      item({
        time: "6:30 PM",
        title: "Dinner near hotel (non-seafood)",
        category: "food",
        description: [text("Easy dinner back near Sanduo/Yisin.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant Qianzhen District Kaohsiung",
        guideKey: "kh-liuhe-night-market",
      }),
    ],
  },
  {
    day: 20,
    title: "DAY 4 · October 20 — Amor's Birthday: Slow Day, City Side",
    budgetLabel: "Small walks, aesthetic spots + fancy dinner 🎂",
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
        time: "8:30 AM",
        title: "Breakfast at Hub Hotel — happy birthday, Amor!",
        category: "food",
        description: [text("No alarms needed today. Slow breakfast at the hotel.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-birthday-outfit",
      }),
      item({
        time: "9:30 AM",
        title: "MRT: R8 Sanduo → R16 Zuoying",
        category: "train",
        description: [text("~20 min, unhurried start to the day.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying MRT Station Kaohsiung",
        guideKey: "kh-mrt-to-zuoying",
      }),
      item({
        time: "10:00 AM",
        title: "Taxi to Lotus Pond",
        category: "hotel",
        description: [text("~10 min taxi ride.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Lotus Pond Kaohsiung",
        guideKey: "kh-lotus-pond-taxi",
      }),
      item({
        time: "10:15 AM",
        title: "Dragon and Tiger Pagodas",
        category: "spot",
        description: [
          text("Enter through the "),
          place("Dragon and Tiger Pagodas", "pagoda", "Dragon and Tiger Pagodas Lotus Pond Kaohsiung"),
          text(" — dragon's mouth in, tiger's mouth out, for good luck. One of the most photogenic spots on the trip."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Dragon and Tiger Pagodas Lotus Pond Kaohsiung",
        guideKey: "kh-dragon-tiger-pagodas",
      }),
      item({
        time: "11:00 AM",
        title: "Spring and Autumn Pavilion + Statue of Xuantian",
        category: "spot",
        description: [
          place("Spring and Autumn Pavilion", "pavilion", "Spring and Autumn Pavilion Kaohsiung"),
          text(" and the "),
          place("Statue of Xuantian Shangdi", "statue", "Statue of Xuantian Shangdi Lotus Pond"),
          text(" nearby — no rush, just a slow walk around the pond."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Spring and Autumn Pavilion Kaohsiung",
        guideKey: "kh-spring-autumn-pavilion",
      }),
      item({
        time: "12:00 PM",
        title: "Long, unhurried lunch near Lotus Pond (non-seafood)",
        category: "food",
        description: [text("No agenda for the rest of lunch — take your time.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant Lotus Pond Kaohsiung",
        guideKey: "kh-lotus-pond-lunch",
      }),
      item({
        time: "1:30 PM",
        title: "MRT: R16 Zuoying → R9 Central Park",
        category: "train",
        description: [text("~20 min.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Central Park MRT Station Kaohsiung",
        guideKey: "kh-mrt-to-central-park",
      }),
      item({
        time: "1:50 PM",
        title: "Central Park (Kaohsiung)",
        category: "walk",
        description: [
          place("Central Park", "park", "Central Park Kaohsiung"),
          text(" — sit, walk slow, no checklist."),
        ],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Central Park Kaohsiung",
        guideKey: "kh-central-park-kaohsiung",
      }),
      item({
        time: "3:00 PM",
        title: "Coffee/snack break",
        category: "food",
        description: [text("Shared coffee or dessert, non-seafood.")],
        tags: [tag("Food", "food")],
        mapQuery: "cafe Central Park Kaohsiung",
        guideKey: "kh-city-walk-snack",
      }),
      item({
        time: "4:00 PM",
        title: "MRT to harbor area (R11 Kaohsiung Main Station)",
        category: "train",
        description: [text("~10 min.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Kaohsiung Main Station",
        guideKey: "kh-mrt-to-harbor",
      }),
      item({
        time: "4:30 PM",
        title: "Pier-2 Art Center",
        category: "walk",
        description: [
          place("Pier-2 Art Center", "art district", "Pier-2 Art Center Kaohsiung"),
          text(" — converted warehouses, murals, installations. Walk at your own pace, no fixed route."),
        ],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Pier-2 Art Center Kaohsiung",
        guideKey: "kh-pier2-art-center",
      }),
      item({
        time: "6:00 PM",
        title: "Love Pier, sunset",
        category: "spot",
        description: [place("Love Pier", "pier", "Love Pier Kaohsiung"), text(" — good sunset view of the harbor before getting ready for dinner.")],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Love Pier Kaohsiung",
        guideKey: "kh-love-pier",
      }),
      item({
        time: "7:00 PM",
        title: "Fancy Birthday Dinner (non-seafood)",
        category: "food",
        description: [
          text(
            "Reserve a nicer, non-seafood restaurant ahead of time — a hotel fine-dining room, a rooftop restaurant, or a steakhouse all work well in Kaohsiung. Book it a few days before, not the morning of.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "fine dining restaurant Kaohsiung",
        guideKey: "kh-birthday-dinner",
        warnings: ["Book this table a few days ahead — it's the birthday dinner, don't leave it to chance."],
      }),
      item({
        time: "9:00 PM",
        title: "Birthday dessert / cake",
        category: "food",
        description: [text("A dessert bar, cake shop, or night-market sweet stall to cap off the night.")],
        tags: [tag("Food", "food")],
        mapQuery: "dessert shop Kaohsiung",
        guideKey: "kh-birthday-dessert",
      }),
      item({
        time: "10:00 PM",
        title: "MRT/taxi back to Hub Hotel",
        category: "hotel",
        description: [text("Back to Sanduo/Yisin for the night.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-harbor-dinner",
      }),
    ],
  },
  {
    day: 21,
    title: "DAY 5 · October 21 — Departure",
    budgetLabel: "Morning only, afternoon flight",
    items: [
      item({
        time: "7:30 AM",
        title: "Breakfast at Hub Hotel",
        category: "food",
        description: [text("Easy breakfast, pack up before checkout.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:30 AM",
        title: "Check out, MRT: R8 Sanduo → R6 Qianzhen",
        category: "train",
        description: [text("~10 min toward the Dream Mall area.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Qianzhen MRT Station Kaohsiung",
        guideKey: "kh-mrt-back-to-sanduo",
      }),
      item({
        time: "9:00 AM",
        title: "Dream Mall — last-minute shopping",
        category: "spot",
        description: [
          place("Dream Mall", "mall", "Dream Mall Kaohsiung"),
          text(" — only ~10-15 min from the airport, good last stop before check-in."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Dream Mall Kaohsiung",
        guideKey: "kh-dream-mall",
      }),
      item({
        time: "10:30 AM",
        title: "Light lunch near Dream Mall (non-seafood)",
        category: "food",
        description: [text("Food court has plenty of non-seafood options.")],
        tags: [tag("Food", "food")],
        mapQuery: "Dream Mall Kaohsiung",
        guideKey: "kh-cijin-lunch-nonseafood",
      }),
      item({
        time: "11:30 AM",
        title: "MRT: R6 Qianzhen → R4 Kaohsiung Intl Airport",
        category: "train",
        description: [text("~10 min.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
      item({
        time: "12:00 PM",
        title: "Check-in, security, flight home",
        category: "hotel",
        description: [text("Afternoon flight home.")],
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
