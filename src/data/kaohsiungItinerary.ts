// Kaohsiung, Taiwan — October 17–21, 2026.
// Land Oct 17 evening, leave Oct 21 afternoon. One hotel the whole stay:
// Hub Hotel Kaohsiung Yisin Branch (confirmed booking, Oct 17–21) — no hotel switch.
// Revised plan rules:
// - No revisiting an area/island on a later day.
// - Camera-worthy stops only.
// - No bare-sun outdoor ~1–3 PM (shade/cover or move indoors).
// - No seafood, any day.
// Day layout:
// - Day 1 (Oct 17 Sat): arrive KHH → MRT Sanduo → Hub Yisin → easy dinner → rest. No sightseeing.
// - Day 2 (Oct 18 Sun): British Consulate + Cijin only (Star Tunnel covers the 1–3 heat window).
// - Day 3 (Oct 19 Mon): early HSR to CCU (Meteor Garden campus) morning only → Formosa Boulevard + café.
// - Day 4 (Oct 20 Tue): Amor's birthday — near-hotel aesthetic walk, heat rest, then Pier-2 + Harbour Bridge + Yonshin Fudopia.
// - Day 5 (Oct 21 Wed): Lotus Pond highlights before 1pm → indoor lunch → bags → KHH by ~4pm.

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
  meta: [
    "MNL–KHH: Oct 17, 5:00–7:00 PM",
    "KHH–MNL: Oct 21, 8:00–9:55 PM",
    "Hub Hotel Yisin Branch, Oct 17–21",
    "Oct 20 — Amor's birthday 🎂",
    "No seafood",
  ],
  note: [
    text(
      "One hotel the whole trip: Hub Hotel Kaohsiung Yisin Branch. Plan rules: no revisiting an area/island on a later day, camera-worthy stops only, and no bare-sun outdoor time ~1–3 PM (use shade/cover or go indoors). Meteor Garden's real campus (National Chung Cheng University) is a Day 3 morning HSR round trip to Chiayi. Day 4 is Amor's birthday — light aesthetic walks near the hotel, then Pier-2 + Great Harbour Bridge and outdoor dinner at Yonshin Fudopia. No seafood on any day.",
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
  title: "Plan rules + two things to confirm",
  body: [
    text(
      "Rules: (1) no revisiting an area/island later in the trip, (2) camera-worthy stops only, (3) no bare-sun outdoor ~1–3 PM — shade, cover, or indoors. Confirm: Day 3 Chiayi HSR tickets ahead of time; Day 4 birthday dinner at 永心浮島 Yonshin Fudopia (backup 掌門·棧貳庫) — book a few days ahead, and confirm the menu is non-seafood.",
    ),
  ],
};

const days: DaySectionData[] = [
  {
    day: 17,
    title: "DAY 1 · October 17 — Arrival",
    budgetLabel: "Arrival night · no sightseeing",
    items: [
      item({
        time: "5:00 PM",
        title: "Flight departs MNL → KHH",
        category: "hotel",
        description: [text("MNL–KHH, 5:00–7:00 PM, ~2h flight.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Ninoy Aquino International Airport",
        guideKey: "kh-airport-arrival",
      }),
      item({
        time: "7:00 PM",
        title: "Land at Kaohsiung International Airport",
        category: "hotel",
        description: [
          text("Arrive at "),
          place("Kaohsiung International Airport", "airport", "Kaohsiung International Airport"),
          text(", clear immigration, collect bags. Arrival window ~5–7 PM — keep tonight easy."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-arrival",
      }),
      item({
        time: "7:30 PM",
        title: "MRT: Airport (R4) → Sanduo Shopping District (R8)",
        category: "train",
        description: [text("Red Line, ~15 min, direct — no transfers.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Sanduo Shopping District MRT Station Kaohsiung",
        guideKey: "kh-mrt-to-zuoying",
      }),
      item({
        time: "7:50 PM",
        title: "Walk to Hub Hotel Yisin Branch, check in",
        category: "hotel",
        description: [
          text("~10 min walk from the station to "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(". Home base for the whole stay — no hotel switch."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "9:00 PM",
        title: "Easy dinner near the hotel (styled café OK)",
        category: "food",
        description: [
          text(
            "Non-seafood dinner within a short walk of Hub Yisin / Sanduo — a quiet styled café is fine. No sightseeing tonight; rest after the flight.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "cafe near Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-liuhe-night-market",
        infoNotes: ["No sightseeing on Day 1 — save energy for Cijin tomorrow."],
      }),
    ],
  },
  {
    day: 18,
    title: "DAY 2 · October 18 — Consulate + Cijin only",
    budgetLabel: "British Consulate + Cijin Island",
    mapImage: "/kaohsiung-maps/day2-cijijn.jpg",
    items: [
      item({
        time: "7:30 AM",
        title: "Breakfast at Hub Hotel",
        category: "food",
        description: [text("Free breakfast at the hotel before heading to Hamasen.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:00 AM",
        title: "MRT toward Hamasen / Gushan",
        category: "train",
        description: [
          text("From Sanduo toward "),
          place("Hamasen", "district", "Hamasen Station Kaohsiung"),
          text(" / Gushan — aim to be near the Consulate early while light is good for photos."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Hamasen Station Kaohsiung",
        guideKey: "kh-hamasen-railway-museum",
        infoNotes: ["Today is Consulate + Cijin only — no Alien Art, Pier-2, or Lotus Pond."],
      }),
      item({
        time: "8:45 AM",
        title: "British Consulate at Takao (camera stop)",
        category: "spot",
        description: [
          place("British Consulate at Takao", "landmark", "British Consulate at Takao"),
          text(" — hilltop view over the harbor mouth. Camera-worthy; do this before the ferry."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "British Consulate at Takao",
        guideKey: "kh-british-consulate-gushan",
      }),
      item({
        time: "10:00 AM",
        title: "Gushan Ferry → Cijin Island",
        category: "bus",
        description: [
          text("Short crossing from "),
          place("Gushan Ferry Pier", "ferry", "Gushan Ferry Pier Kaohsiung"),
          text(" to Cijin."),
        ],
        tags: [tag("Bus", "bus")],
        mapQuery: "Gushan Ferry Pier Kaohsiung",
        guideKey: "kh-ferry-to-cijin",
      }),
      item({
        time: "10:20 AM",
        title: "Cijin Old Street + Tianhou Temple",
        category: "spot",
        description: [
          place("Cijin Old Street", "street", "Cijin Old Street Kaohsiung"),
          text(" and "),
          place("Cijin Tianhou Temple", "temple", "Cijin Tianhou Temple Kaohsiung"),
          text(" — walkable pair right off the ferry."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Old Street Kaohsiung",
        guideKey: "kh-cijin-old-street",
      }),
      item({
        time: "11:30 AM",
        title: "Non-seafood lunch under awnings",
        category: "food",
        description: [
          text(
            "Noodles, buns, shaved ice, or similar along Old Street — stay under awnings. Confirm no seafood.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Cijin Old Street Kaohsiung",
        guideKey: "kh-cijin-lunch-nonseafood",
        warnings: ["No seafood — pick clearly non-seafood stalls."],
      }),
      item({
        time: "12:15 PM",
        title: "Golden shell / shore (before 1 PM)",
        category: "spot",
        description: [
          place("Cijin Beach / golden shell shore", "beach", "Cijin Beach Kaohsiung"),
          text(" — finish the open-sun shoreline photos before 1 PM."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Beach Kaohsiung",
        guideKey: "kh-cijin-beach",
        warnings: ["Bare-sun outdoor ends by ~1 PM — move to Star Tunnel for the heat window."],
      }),
      item({
        time: "1:00 PM",
        title: "Star Tunnel (covered, 1–3 PM heat window)",
        category: "spot",
        description: [
          place("Cijin Tunnel of Stars", "tunnel", "Cijin Tunnel of Stars Kaohsiung"),
          text(" — covered walk for the hottest hours. Stay in shade/cover until ~3 PM."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Tunnel of Stars Kaohsiung",
        guideKey: "kh-cijin-tunnel-of-stars",
        infoNotes: ["1–3 PM rule: covered / shade only — Star Tunnel fits."],
      }),
      item({
        time: "3:30 PM",
        title: "Cihou Fort + Kaohsiung Lighthouse (sunset)",
        category: "spot",
        description: [
          place("Cihou Fort", "fort", "Cihou Fort Kaohsiung"),
          text(" and "),
          place("Kaohsiung Lighthouse", "lighthouse", "Kaohsiung Lighthouse"),
          text(" — same hill; hang for golden hour / sunset views."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cihou Fort Kaohsiung",
        guideKey: "kh-cihou-fort",
      }),
      item({
        time: "6:30 PM",
        title: "Ferry back to Gushan",
        category: "bus",
        description: [text("Ferry back to the mainland side for dinner. Cijin done for the trip — no island revisit later.")],
        tags: [tag("Bus", "bus")],
        mapQuery: "Cijin Ferry Pier Kaohsiung",
        guideKey: "kh-ferry-back-to-gushan",
      }),
      item({
        time: "7:15 PM",
        title: "Dinner near Gushan (non-seafood)",
        category: "food",
        description: [text("Beef noodles, braised pork rice, or similar near Gushan — not the usual seafood spots.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant Gushan District Kaohsiung",
        guideKey: "kh-gushan-dinner",
      }),
      item({
        time: "8:30 PM",
        title: "MRT/taxi back to Hub Hotel Yisin",
        category: "hotel",
        description: [text("Back to Sanduo/Yisin for the night.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
    ],
  },
  {
    day: 19,
    title: "DAY 3 · October 19 — CCU Meteor Garden + Formosa Boulevard",
    budgetLabel: "Chiayi morning · Formosa afternoon",
    mapImage: "/kaohsiung-maps/day3-ccu-formosa.jpg",
    items: [
      item({
        time: "6:15 AM",
        title: "Coffee + bread to go from hotel breakfast",
        category: "food",
        description: [text("Grab free breakfast items to go — too early for a long sit before the HSR.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "6:25 AM",
        title: "Walk to Sanduo (R8) → MRT to Zuoying (R16)",
        category: "train",
        description: [text("~10 min walk to Sanduo, then Red Line ~20 min to Zuoying HSR.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-mrt-to-zuoying",
        infoNotes: ["No harbor / Cijin today — those are done."],
      }),
      item({
        time: "7:10 AM",
        title: "HSR: Zuoying → Chiayi",
        category: "train",
        description: [
          text("High Speed Rail, ~40 min. Book Standard Car ahead — round trip for 2 is the biggest day cost."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-hsr-to-chiayi",
      }),
      item({
        time: "7:55 AM",
        title: "Taxi to National Chung Cheng University",
        category: "hotel",
        description: [text("~35–40 min from Chiayi HSR to campus.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-taxi-to-ccu",
      }),
      item({
        time: "8:35 AM",
        title: "CCU Meteor Garden campus (morning only)",
        category: "spot",
        description: [
          text("The real "),
          place("National Chung Cheng University", "university", "National Chung Cheng University"),
          text(
            " — stood in for Ying De University in Meteor Garden (2001). Lakeside path and banyan lanes — morning photos only, then head back.",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-chung-cheng-university",
      }),
      item({
        time: "10:30 AM",
        title: "Taxi → Chiayi HSR → Zuoying",
        category: "train",
        description: [text("Taxi ~35–40 min back to Chiayi HSR, then HSR ~40 min to Zuoying. Keep moving so afternoon stays in Kaohsiung.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-hsr-back-to-kaohsiung",
      }),
      item({
        time: "12:30 PM",
        title: "Indoor lunch (non-seafood)",
        category: "food",
        description: [
          text(
            "After MRT back toward Formosa / city — sit for an indoor, AC lunch. Avoid bare-sun outdoor meal in the 1–3 heat window.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant near Formosa Boulevard Station Kaohsiung",
        guideKey: "kh-campus-lunch",
        infoNotes: ["1–3 PM: stay indoors / under cover."],
      }),
      item({
        time: "2:00 PM",
        title: "Formosa Boulevard dome + styled café",
        category: "spot",
        description: [
          place("Formosa Boulevard Station", "MRT dome", "Formosa Boulevard Station Kaohsiung"),
          text(
            " — the Dome of Light (camera-worthy, covered). Then a nearby styled café. No malls — skip Shin Kong / SOGO shopping runs.",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Formosa Boulevard Station Kaohsiung",
        guideKey: "kh-city-walk-snack",
        warnings: ["No malls this afternoon — dome + café only."],
      }),
      item({
        time: "6:30 PM",
        title: "Light dinner near Hub Hotel Yisin",
        category: "food",
        description: [text("Easy non-seafood dinner near Sanduo/Yisin. Early night after the Chiayi run.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant Qianzhen District Kaohsiung",
        guideKey: "kh-liuhe-night-market",
      }),
    ],
  },
  {
    day: 20,
    title: "DAY 4 · October 20 — Amor's Birthday",
    budgetLabel: "Near-hotel walk · Pier-2 evening 🎂",
    mapImage: "/kaohsiung-maps/day4-pier2-bridge.jpg",
    outfitTip: {
      note: "Birthday dinner outdoors at Yonshin Fudopia tonight — dress a little nicer for photos, still walkable for the daytime art walk.",
      wear: {
        male: ["Collared shirt or smart casual top for dinner", "Comfortable shoes for Pier-2 / bridge"],
        female: ["Outfit you'd want in birthday photos", "Comfortable shoes for Pier-2 / bridge"],
      },
      avoid: {
        male: ["Flip-flops at dinner"],
        female: ["Flip-flops at dinner"],
      },
    },
    items: [
      item({
        time: "8:30 AM",
        title: "Breakfast at Hub Hotel — happy birthday, Amor!",
        category: "food",
        description: [text("Slow start at Hub Yisin. Daytime stays near the hotel for a light aesthetic walk.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-birthday-outfit",
        infoNotes: ["No Lotus Pond or Cijin today — those belong to other days."],
      }),
      item({
        time: "9:30 AM",
        title: "Bamboo Raft / Labor Park art walk",
        category: "walk",
        description: [
          text("From Hub Yisin, walk toward "),
          place("Labor Park / Bamboo Raft art", "park", "Labor Park Kaohsiung Bamboo Raft"),
          text(" — open-air art pieces, camera-worthy, low effort."),
        ],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Labor Park Kaohsiung",
        guideKey: "kh-qianzhen-park",
      }),
      item({
        time: "10:30 AM",
        title: "Kaohsiung Main Public Library",
        category: "spot",
        description: [
          place("Kaohsiung Main Public Library", "library", "Kaohsiung Main Public Library"),
          text(" — glass architecture, good interior/exterior photos."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Kaohsiung Main Public Library",
        guideKey: "kh-central-park-kaohsiung",
      }),
      item({
        time: "11:30 AM",
        title: "85 Sky Tower — exterior only",
        category: "spot",
        description: [
          place("85 Sky Tower", "landmark", "85 Sky Tower Kaohsiung"),
          text(" — street-level exterior photos only. Skip the observatory today."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "85 Sky Tower Kaohsiung",
        guideKey: "kh-85-sky-tower",
        warnings: ["Exterior only — no observatory ticket today."],
      }),
      item({
        time: "12:15 PM",
        title: "Styled café (OGNI etc.)",
        category: "food",
        description: [
          text("Brunch/coffee at a styled café near the walk — "),
          place("OGNI", "cafe", "OGNI Kaohsiung"),
          text(" or similar. Non-seafood."),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "OGNI Kaohsiung",
        guideKey: "kh-city-walk-snack",
      }),
      item({
        time: "1:00 PM",
        title: "Heat window rest / indoor (1–3 PM)",
        category: "hotel",
        description: [
          text(
            "Back to Hub Yisin or stay in AC — no bare-sun outdoor for the 1–3 PM heat window. Freshen up for the birthday evening.",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
        infoNotes: ["1–3 PM rule: rest / indoor only."],
      }),
      item({
        time: "4:00 PM",
        title: "Pier-2 Art Center",
        category: "walk",
        description: [
          place("Pier-2 Art Center", "art district", "Pier-2 Art Center Kaohsiung"),
          text(" — warehouses, murals, installations. Unhurried birthday walk."),
        ],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Pier-2 Art Center Kaohsiung",
        guideKey: "kh-pier2-art-center",
      }),
      item({
        time: "5:30 PM",
        title: "Great Harbour Bridge",
        category: "spot",
        description: [
          place("Great Harbour Bridge", "landmark", "Great Harbour Bridge Kaohsiung"),
          text(" — walk the span for harbor views before dinner."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Great Harbour Bridge Kaohsiung",
        guideKey: "kh-great-harbour-bridge",
      }),
      item({
        time: "7:00 PM",
        title: "Birthday dinner: 永心浮島 Yonshin Fudopia",
        category: "food",
        description: [
          text("Outdoor dinner at "),
          place("永心浮島 Yonshin Fudopia", "restaurant", "Yonshin Fudopia Kaohsiung"),
          text(". Backup: "),
          place("掌門·棧貳庫", "restaurant", "掌門精釀啤酒 棧貳庫 Kaohsiung"),
          text(". Confirm non-seafood menu when booking. No separate cake stop."),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Yonshin Fudopia Kaohsiung",
        guideKey: "kh-birthday-dinner",
        warnings: [
          "Book a few days ahead — birthday dinner.",
          "Confirm no seafood on the ordered dishes.",
          "No cake stop tonight.",
        ],
      }),
      item({
        time: "9:30 PM",
        title: "MRT/taxi back to Hub Hotel Yisin",
        category: "hotel",
        description: [text("Back to Sanduo/Yisin. Harbor area done for the trip — no redo on Day 5.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
    ],
  },
  {
    day: 21,
    title: "DAY 5 · October 21 — Lotus Pond + Departure",
    budgetLabel: "Lotus Pond morning · KHH by ~4 PM",
    mapImage: "/kaohsiung-maps/day5-lotus-airport.jpg",
    items: [
      item({
        time: "8:00 AM",
        title: "Breakfast at Hub Hotel",
        category: "food",
        description: [
          text(
            "At KHH by ~4:00 PM for the evening flight. Morning is Lotus Pond highlights only — no full pond loop, no harbor redo.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:45 AM",
        title: "MRT/taxi to Lotus Pond",
        category: "train",
        description: [
          text("Sanduo → Zuoying (~20 min MRT), then short taxi/walk to "),
          place("Lotus Pond", "pond", "Lotus Pond Kaohsiung"),
          text("."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Lotus Pond Kaohsiung",
        guideKey: "kh-lotus-pond-taxi",
      }),
      item({
        time: "9:30 AM",
        title: "Dragon & Tiger Pagodas + Spring & Autumn Pavilion",
        category: "spot",
        description: [
          place("Dragon and Tiger Pagodas", "pagoda", "Dragon and Tiger Pagodas Lotus Pond Kaohsiung"),
          text(" and "),
          place("Spring and Autumn Pavilion", "pavilion", "Spring and Autumn Pavilion Kaohsiung"),
          text(" — camera highlights only, finish before 1 PM. No full loop around the pond."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Dragon and Tiger Pagodas Lotus Pond Kaohsiung",
        guideKey: "kh-dragon-tiger-pagodas",
        warnings: ["Before 1 PM — no bare-sun linger into the heat window.", "No full Lotus Pond loop."],
      }),
      item({
        time: "12:00 PM",
        title: "Indoor lunch (non-seafood)",
        category: "food",
        description: [text("Indoor / AC lunch near Zuoying or on the way back — stay out of bare sun 1–3 PM.")],
        tags: [tag("Food", "food")],
        mapQuery: "restaurant Zuoying Kaohsiung",
        guideKey: "kh-lotus-pond-lunch",
      }),
      item({
        time: "1:30 PM",
        title: "Back to Hub Yisin — collect bags",
        category: "hotel",
        description: [
          text("Return to "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(", check out if not already, collect luggage."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "3:15 PM",
        title: "MRT: R8 Sanduo → R4 Kaohsiung Intl Airport",
        category: "train",
        description: [text("Red Line direct, ~15–20 min. Aim to be at KHH by ~4:00 PM.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
      item({
        time: "4:00 PM",
        title: "At KHH — check-in, immigration, security",
        category: "hotel",
        description: [
          text(
            "Buffer before the evening flight KHH → MNL (depart ~8:00 PM, arrive ~9:55 PM). Relax airside — no harbor redo, trip's sightseeing is done.",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
    ],
  },
];

const tips: TipCardData[] = [
  {
    icon: "🗺️",
    description: [
      text(
        "No area revisit: Cijin + Consulate on Day 2 only, harbor/Pier-2 on Day 4 only, Lotus Pond on Day 5 only — don't circle back.",
      ),
    ],
  },
  {
    icon: "📷",
    description: [
      text(
        "Camera-worthy stops only — Consulate, Cijin shore/tunnel/fort, CCU campus, Formosa dome, library/85 exterior, Pier-2 + bridge, Lotus pagodas.",
      ),
    ],
  },
  {
    icon: "☀️",
    description: [
      text(
        "No bare-sun outdoor ~1–3 PM. Day 2 uses Star Tunnel (covered); Days 3–5 use indoor lunch, café, or hotel rest in that window.",
      ),
    ],
  },
  {
    icon: "🍜",
    description: [
      text(
        "No seafood any day — including Cijin stalls and birthday dinner at Yonshin Fudopia; confirm before ordering.",
      ),
    ],
  },
];

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
