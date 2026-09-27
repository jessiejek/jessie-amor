// Kaohsiung, Taiwan — October 17–21, 2026.
// Land Oct 17 evening, leave Oct 21 evening. One hotel the whole stay:
// Hub Hotel Kaohsiung Yisin Branch (confirmed booking, Oct 17–21) — no hotel switch.
// Plan rules (finalized, 2 pax, NT$):
// - Flights / hotel / hotel breakfast = 0 (prepaid or included).
// - No seafood any day. Say 不要海鮮.
// - Share coffee (one cup between two). Breakfast at hotel.
// - No revisiting an area/island on a later day.
// - Shade / indoors 1–3 PM when possible.
// Day layout (LOCKED where noted):
// - Day 1 (Oct 17 Sat): arrive KHH → ATM + MRT R4→R8 + taxi Hub → check-in → walk dinner 深夜蓋飯食堂 (崑明街55號; confirm open Sat; else desk fallback on 一心二路).
// - Day 2 (Oct 18 Sun): Consulate + Cijin only (Tunnel optional/skip). No Pier-2. 港園 dinner → home.
// - Day 3 (Oct 19 Mon) LOCKED: HSR FULL (no B1G1) → CCU Meteor Garden → Minxiong turkey rice → hotel rest → light dinner near Hub. NO Formosa. NO Liuhe.
// - Day 4 (Oct 20 Tue) LOCKED Amor birthday: Library + OGNI → rest → Pier-2 Dayi → Harbour Bridge sunset → Yonshin.
// - Day 5 (Oct 21 Wed): Lotus Pond morning → lunch → bags → KHH → evening flight.

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
    "MNL–KHH: Oct 17, ~5:00–7:00 PM",
    "KHH–MNL: Oct 21, ~8:00 PM",
    "Hub Hotel Yisin Branch, Oct 17–21",
    "Oct 20 — Amor's birthday 🎂",
    "No seafood · share coffee · hotel breakfast",
    "Trip budget ~NT$7,800–11,200 · cash NT$10–12k",
  ],
  note: [
    text(
      "We stay at one hotel the whole trip: Hub Hotel Kaohsiung Yisin Branch (一心二路15號, near Sanduo R8). Flights, hotel, and hotel breakfast are already paid (count as 0). Two people, all cash figures in NT$. Do not go back to the same island or area on a later day. No fish or shrimp — say 不要海鮮. Share coffee (one cup). Day 3 is LOCKED: full-price HSR to Chiayi for Meteor Garden campus, then turkey rice, then rest + light dinner near the Hub — no Formosa dome, no Liuhe. Day 4 is Amor's birthday (LOCKED): library + OGNI, rest, Pier-2 Dayi → Harbour Bridge sunset, Yonshin Fudopia.",
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

// Day targets match tripDayCards labels ("October 17" …). Amounts are NT$ for 2 pax.
// Flights / hotel / breakfast = 0 and are not in these ranges.
const budgetSummary: BudgetCard[] = [
  { label: "October 17", amount: "NT$ 500–800", php: "PHP ~1,000–1,600" },
  { label: "October 18", amount: "NT$ 1,500–2,200", php: "PHP ~3,000–4,400" },
  { label: "October 19", amount: "NT$ 2,930–3,670", php: "PHP ~5,860–7,340" },
  { label: "October 20", amount: "NT$ 2,200–3,300", php: "PHP ~4,400–6,600" },
  { label: "October 21", amount: "NT$ 700–1,200", php: "PHP ~1,400–2,400" },
  { label: "Total for 2", amount: "NT$ 7,800–11,200", php: "PHP ~15,600–22,400 · mid ~9,500", featured: true },
  { label: "Recommended cash", amount: "NT$ 10,000–12,000", php: "PHP ~20,000–24,000", featured: true },
];

const alert: AlertBoxData = {
  title: "Rules + Day 3 / Day 4 LOCKED",
  body: [
    text(
      "Rules: (1) No revisit same area later. (2) Hot 1–3 — shade or indoors. (3) No seafood — 不要海鮮. (4) Share coffee. (5) Breakfast at Hub. Book: Day 3 HSR on T Express — FULL fare NT$410×2 each way (RT NT$1,640). Do NOT budget B1G1. Day 4 Yonshin Fudopia on inline (opens 30 days ahead). Backup: 掌門·棧貳庫. Taxi: Uber. Backup call 55688 (Chiayi: 55178). Day 3: NO Formosa, NO Liuhe. Day 2: NO Pier-2; Tunnel of Stars optional/skip.",
    ),
  ],
};

const days: DaySectionData[] = [
  {
    day: 17,
    title: "DAY 1 · October 17 — Arrival",
    budgetLabel: "NT$ 500–800 · arrive · no sightseeing",
    items: [
      item({
        time: "5:00–7:00 PM",
        title: "Flight Manila → Kaohsiung",
        category: "hotel",
        description: [
          text(
            "• Fly Manila (MNL) → Kaohsiung (KHH), ~2 hours\n• Flights already paid — NT$0 in trip cash\n• Keep passports, boarding passes, and a charged phone ready for arrival",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Ninoy Aquino International Airport",
        guideKey: "kh-airport-arrival",
      }),
      item({
        time: "7:00–7:50 PM",
        title: "Land KHH · ATM + MRT R4→R8 + taxi Hub",
        category: "hotel",
        description: [
          text("• Land at "),
          place("Kaohsiung International Airport", "airport", "Kaohsiung International Airport"),
          text(
            " (KHH)\n• Collect bags\n• Bank of Taiwan ATM in arrivals — withdraw ~NT$10,000–12,000 for the trip\n• Follow signs to MRT Red Line at Airport Terminal (R4)\n• Buy tickets or tap EasyCard / iPASS\n• Red Line northbound (toward Gangshan / Ciaotou) → Sanduo Shopping District (R8), ~15 min\n• Short taxi (~3–5 min) to ",
          ),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(
            " (一心二路15號 / No. 15 Yixin 2nd Rd) — show driver the Chinese address\n• Do not walk with heavy bags; do not taxi all the way from the airport\n• MRT + short taxi ~NT$150–250 for 2",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel"), tag("Train / MRT / LRT", "train")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-airport-arrival",
        infoNotes: [
          "Short taxi after R8 — bags are heavy. Not a walk from the station with luggage. Not a long taxi from the airport.",
        ],
      }),
      item({
        time: "8:00–9:00 PM",
        title: "Check in · Hub Hotel Yisin",
        category: "hotel",
        description: [
          text("• Check in at "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(
            " (一心二路15號, near Sanduo R8)\n• Hotel is prepaid (NT$0)\n• Drop bags, freshen up, settle in before dinner\n• Ask front desk for a paper map or Wi-Fi password if needed",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "9:00–10:30 PM",
        title: "Dinner: 深夜蓋飯食堂 (near Hub)",
        category: "food",
        description: [
          text("• From Hub Hotel, walk ~10–12 min to "),
          place("深夜蓋飯食堂", "restaurant", "深夜蓋飯食堂 崑明街55號"),
          text(
            " at 崑明街55號 (open Maps for the Chinese name)\n• Order rice bowls / pasta — meat or veg only; say 不要海鮮\n• Confirm Saturday hours on Google or Instagram before you leave\n• If closed, ask the Hub desk for the nearest non-seafood spot on 一心二路\n• Dinner ~NT$350–550 for 2\n• No long night-market walk tonight",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "深夜蓋飯食堂 崑明街55號",
        guideKey: "kh-liuhe-night-market",
        infoNotes: [
          "Prefer this nearby walk dinner — not the far Guanghua night-market walk on Day 1.",
          "No sightseeing tonight. Save energy for Cijin tomorrow.",
        ],
        warnings: ["No fish or shrimp. Say 不要海鮮.", "Confirm open Saturday via Google/IG before walking over."],
      }),
    ],
  },
  {
    day: 18,
    title: "DAY 2 · October 18 — Consulate + Cijin",
    budgetLabel: "NT$ 1,500–2,200 · Consulate + Cijin only",
    mapImage: "/kaohsiung-maps/day2-cijijn.jpg",
    items: [
      item({
        time: "7:30–8:30 AM",
        title: "Breakfast at Hub Hotel",
        category: "food",
        description: [
          text(
            "• Eat the included hotel breakfast at Hub (NT$0)\n• Leave the lobby by ~8:30 so you reach the Consulate soon after it opens",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:30–9:00 AM",
        title: "MRT to Sizihwan (O1)",
        category: "train",
        description: [
          text(
            "• From Hub Hotel, walk ~12 min (~850 m) along Yixin 2nd Rd to Sanduo Shopping District MRT (R8), or short taxi (~3 min, flag-fall)\n• Buy tickets or tap EasyCard / iPASS\n• Red Line northbound (toward Gangshan / Ciaotou) → Formosa Boulevard (R10)\n• Transfer inside paid area to Orange Line toward Sizihwan (O1), last stop\n• Exit toward university / seaside, then walk ~10–15 min uphill to ",
          ),
          place("British Consulate at Takao", "landmark", "British Consulate at Takao"),
          text(
            " (open Maps and follow walking directions)\n• Alternative: Uber Hub → Consulate (~15–25 min, ~NT$180–280 for 2)\n• MRT option ~NT$60–100 for 2",
          ),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Sizihwan Station Kaohsiung",
        guideKey: "kh-hamasen-railway-museum",
        infoNotes: [
          "Today is Consulate + Cijin only. No Pier-2. No Lotus Pond. Tunnel of Stars optional/skip.",
        ],
      }),
      item({
        time: "9:00–10:00 AM",
        title: "British Consulate at Takao",
        category: "spot",
        description: [
          text("• Arrive at "),
          place("British Consulate at Takao", "landmark", "British Consulate at Takao"),
          text(
            " (opens 9 AM Sunday)\n• Buy tickets at the entrance — NT$99 each (NT$198 for 2)\n• Walk the red-brick porch for harbor views and photos\n• Keep it to about an hour so you still catch the morning ferry to Cijin",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "British Consulate at Takao",
        guideKey: "kh-british-consulate-gushan",
      }),
      item({
        time: "10:00–10:30 AM",
        title: "Ferry to Cijin Island",
        category: "bus",
        description: [
          text("• Walk downhill from the Consulate area to "),
          place("Gushan Ferry Pier", "ferry", "Gushan Ferry Pier Kaohsiung"),
          text(
            " (open Maps if unsure of the pier entrance)\n• Tap EasyCard / iPASS at the gate — NT$30 each (~NT$60 for 2)\n• Board the short public ferry to Cijin Island; boats run frequently",
          ),
        ],
        tags: [tag("Bus", "bus")],
        mapQuery: "Gushan Ferry Pier Kaohsiung",
        guideKey: "kh-ferry-to-cijin",
      }),
      item({
        time: "10:30–11:30 AM",
        title: "Cijin Old Street + Tianhou Temple",
        category: "spot",
        description: [
          text("• From the Cijin ferry exit, walk straight onto "),
          place("Cijin Old Street", "street", "Cijin Old Street Kaohsiung"),
          text("\n• Continue a short way to "),
          place("Cijin Tianhou Temple", "temple", "Cijin Tianhou Temple Kaohsiung"),
          text(
            " near the ferry — both are close together\n• Step inside the temple for a quiet look, then continue along Old Street for photos",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Old Street Kaohsiung",
        guideKey: "kh-cijin-old-street",
      }),
      item({
        time: "11:30 AM–12:30 PM",
        title: "Lunch on Cijin (non-seafood)",
        category: "food",
        description: [
          text("• Eat near Old Street — for example "),
          place("不一樣赤肉羹", "noodle shop", "不一樣赤肉羹 旗津 廟前路56號"),
          text(
            " at 廟前路56號 (open Maps for the Chinese name)\n• Order pork soup noodles and/or pork rice\n• Say 不要海鮮 before ordering; skip fish/squid stalls\n• Lunch ~NT$250–400 for 2",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "不一樣赤肉羹 旗津 廟前路56號",
        guideKey: "kh-cijin-lunch-nonseafood",
        warnings: ["No fish or shrimp. Ask before you order."],
      }),
      item({
        time: "12:30–2:30 PM",
        title: "Aesthetic café · share coffee",
        category: "food",
        description: [
          text(
            "• Stay indoors or in shade through the hot 1–3 PM window\n• Share one coffee (~NT$150–280)\n• Try ",
          ),
          place("津樓 Jinlou", "café", "津樓 Liquid Building Coffee 旗津"),
          text(
            " at 廟前路30巷13號 (often opens ~1 PM — confirm on Maps) or another aesthetic café on Old Street\n• Optional mango ice at 有間冰舖 nearby\n• Tunnel of Stars is optional/skip — not required today",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "津樓 Liquid Building Coffee 旗津",
        guideKey: "kh-city-walk-snack",
        infoNotes: ["Stay under cover or indoors until ~3 PM. Share one coffee only."],
        warnings: ["No long walk in bare sun from 1 to 3.", "Skip fish and squid stalls."],
      }),
      item({
        time: "2:30–3:30 PM",
        title: "Shade stroll",
        category: "walk",
        description: [
          text(
            "• Easy shade walk near Old Street and covered lanes\n• Keep water with you\n• Soft transition toward the beach / Rainbow Church side — no rush, no full island loop",
          ),
        ],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Cijin Old Street Kaohsiung",
        guideKey: "kh-cijin-old-street",
      }),
      item({
        time: "3:30–4:30 PM",
        title: "Rainbow Church + beach",
        category: "spot",
        description: [
          text("• Open Maps for "),
          place("Cijin Rainbow Church", "landmark", "Cijin Rainbow Church Kaohsiung"),
          text(" and walk there from Old Street\n• Photo stop at the colorful arch on "),
          place("Cijin Beach", "beach", "Cijin Beach Kaohsiung"),
          text("\n• Keep moving toward the fort hill — do not linger too long in full sun"),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Rainbow Church Kaohsiung",
        guideKey: "kh-cijin-beach",
      }),
      item({
        time: "4:30–5:45 PM",
        title: "Cihou Fort · sunset (~5:32 PM)",
        category: "spot",
        description: [
          text("• Walk uphill to "),
          place("Cihou Fort", "fort", "Cihou Fort Kaohsiung"),
          text(
            " (free entry)\n• Climb for sunset — about 5:32 PM in mid-October\n• Optional stop at ",
          ),
          place("Kaohsiung Lighthouse", "lighthouse", "Kaohsiung Lighthouse"),
          text(" on the same hill if energy allows\n• Start down before dark"),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cihou Fort Kaohsiung",
        guideKey: "kh-cihou-fort",
      }),
      item({
        time: "6:00–6:20 PM",
        title: "Ferry back to Gushan",
        category: "bus",
        description: [
          text("• Walk back to the Cijin ferry pier (open Maps for "),
          place("Cijin Ferry Pier", "ferry", "Cijin Ferry Pier Kaohsiung"),
          text(
            ")\n• Tap EasyCard / iPASS again — ~NT$60 for 2\n• Short boat back to Gushan\n• Cijin is done for this trip — do not return on a later day",
          ),
        ],
        tags: [tag("Bus", "bus")],
        mapQuery: "Cijin Ferry Pier Kaohsiung",
        guideKey: "kh-ferry-back-to-gushan",
      }),
      item({
        time: "6:30–7:45 PM",
        title: "Uber → 港園牛肉麵 → home",
        category: "food",
        description: [
          text("• From Gushan Ferry Pier, order Uber to "),
          place("港園牛肉麵", "noodle shop", "港園牛肉麵 鹽埕總店"),
          text(
            " at 大成街55號 (show the driver the Chinese name)\n• Order 牛肉拌麵 plus one soup to share\n• Closes 8:00 PM — go straight from the pier, no detours\n• After dinner, Uber back to Hub Hotel Yisin\n• Dinner + both Ubers ~NT$470–750 for 2",
          ),
        ],
        tags: [tag("Food", "food"), tag("Hotel / Taxi", "hotel")],
        mapQuery: "港園牛肉麵 鹽埕總店",
        guideKey: "kh-gushan-dinner",
        warnings: ["No fish or shrimp.", "Closes 8:00 PM — leave the pier promptly."],
      }),
    ],
  },
  {
    day: 19,
    title: "DAY 3 · October 19 — Meteor Garden LOCKED",
    budgetLabel: "NT$ 2,930–3,670 · HSR FULL · no Formosa · no Liuhe",
    mapImage: "/kaohsiung-maps/day3-ccu-formosa.jpg",
    items: [
      item({
        time: "7:00–8:00 AM",
        title: "Breakfast at Hub Hotel",
        category: "food",
        description: [
          text(
            "• Hotel breakfast included (NT$0)\n• Finish and leave the lobby by ~8:00 so you reach Zuoying HSR with time to spare",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:00–8:25 AM",
        title: "MRT R8 → Zuoying R16",
        category: "train",
        description: [
          text(
            "• From Hub Hotel, walk ~12 min to Sanduo Shopping District MRT (R8), or short taxi with bags if needed\n• Tap EasyCard / iPASS\n• Red Line northbound (toward Gangshan / Ciaotou) → Zuoying (R16), ~20 min\n• Follow station signs for HSR / Taiwan High Speed Rail (same complex)\n• MRT ~NT$40–80 for 2",
          ),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-mrt-to-zuoying",
        infoNotes: ["LOCKED day. No harbor / Cijin / Formosa / Liuhe today."],
      }),
      item({
        time: "8:30–9:15 AM",
        title: "HSR Zuoying → Chiayi (FULL fare)",
        category: "train",
        description: [
          text(
            "• At Zuoying HSR, board the reserved High Speed Rail train to Chiayi HSR Station (~40–45 min)\n• Book ahead on T Express\n• FULL fare NT$410 × 2 = NT$820 this leg — do NOT assume B1G1; budget full price\n• Round-trip HSR for the day = NT$1,640",
          ),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-hsr-to-chiayi",
        warnings: ["No B1G1 in the budget. Pay full fare."],
      }),
      item({
        time: "9:20–10:00 AM",
        title: "Taxi HSR → 國立中正大學",
        category: "hotel",
        description: [
          text("• From Chiayi HSR Station taxi stand or Uber, go to "),
          place("National Chung Cheng University", "university", "National Chung Cheng University"),
          text(
            " (~35–40 min)\n• Show the driver 國立中正大學\n• Backup phone taxi: call 55178\n• Cost ~NT$350–500 for this leg",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-taxi-to-ccu",
      }),
      item({
        time: "10:00 AM–12:00 PM",
        title: "Meteor Garden campus photos",
        category: "spot",
        description: [
          text("• Walk the open campus of "),
          place("National Chung Cheng University", "university", "National Chung Cheng University"),
          text(
            " — the real Meteor Garden school\n• Photo stops: red-brick gym gate, fountain square, 寧靜湖 (Quiet Lake)\n• Stay polite around students/classes\n• Leave by ~12:00 for lunch",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-chung-cheng-university",
      }),
      item({
        time: "12:00–12:30 PM",
        title: "Taxi → turkey rice (Minxiong)",
        category: "hotel",
        description: [
          text(
            "• From CCU, short taxi (~10 min) to the Minxiong turkey-rice area\n• Destination: 在地食坊, 文化路26-10號 (open Maps)\n• Uber or local taxi ~NT$150–250",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "在地食坊 民雄 文化路26-10號",
        guideKey: "kh-campus-lunch",
      }),
      item({
        time: "12:30–1:30 PM",
        title: "Lunch: turkey rice",
        category: "food",
        description: [
          text("• Eat at "),
          place("在地食坊", "turkey rice shop", "在地食坊 民雄 文化路26-10號"),
          text(
            " (文化路26-10號, across from Minxiong town office; Monday open)\n• Order 火雞肉飯 + 燙青菜\n• Lunch ~NT$250–400 for 2\n• Say 不要海鮮",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "在地食坊 民雄 文化路26-10號",
        guideKey: "kh-campus-lunch",
        warnings: ["No fish or shrimp."],
      }),
      item({
        time: "1:30–2:15 PM",
        title: "Taxi → Chiayi HSR",
        category: "hotel",
        description: [
          text(
            "• From the restaurant, taxi back to Chiayi HSR Station (~25–35 min)\n• Uber or call 55178\n• ~NT$350–500\n• Today’s three named taxis — CCU / lunch / HSR — total ~NT$850–1,250",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-hsr-back-to-kaohsiung",
      }),
      item({
        time: "2:30–3:15 PM",
        title: "HSR Chiayi → Zuoying (FULL fare)",
        category: "train",
        description: [
          text(
            "• Board return HSR Chiayi → Zuoying\n• FULL fare NT$410 × 2 = NT$820\n• Combined HSR round trip for the day = NT$1,640\n• Sit, rest, and hydrate on the ~40–45 min ride",
          ),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-hsr-back-to-kaohsiung",
        warnings: ["No B1G1."],
      }),
      item({
        time: "3:15–4:00 PM",
        title: "MRT back to Hub",
        category: "train",
        description: [
          text(
            "• At Zuoying, follow signs to the MRT Red Line (R16)\n• Red Line southbound (toward Siaogang) → Sanduo Shopping District (R8), ~20 min\n• Walk ~12 min or short taxi to Hub Hotel\n• Do NOT get off at Formosa Boulevard — go straight home and rest\n• MRT ~NT$40–80 for 2",
          ),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
        infoNotes: ["NO Formosa Boulevard stop. Go home and rest."],
      }),
      item({
        time: "4:00–7:00 PM",
        title: "Hotel rest",
        category: "hotel",
        description: [
          text(
            "• Rest at Hub Yisin\n• Shower, nap, and recharge after the Chiayi run\n• Stay indoors through the hot afternoon",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "7:00–8:30 PM",
        title: "Light dinner near Hub",
        category: "food",
        description: [
          text(
            "• Easy dinner within a short walk of Hub / Sanduo — noodles, rice, or simple café food on 一心二路 or nearby\n• Ask the desk if you want a specific non-seafood suggestion\n• ~NT$150–300 for 2\n• NO Formosa Boulevard stop, NO Liuhe Night Market tonight",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-city-walk-snack",
        warnings: ["No fish or shrimp.", "No Liuhe. No Formosa."],
      }),
    ],
  },
  {
    day: 20,
    title: "DAY 4 · October 20 — Slow birthday Amor LOCKED",
    budgetLabel: "NT$ 2,200–3,300 · Library · Pier-2 · Yonshin 🎂",
    mapImage: "/kaohsiung-maps/day4-pier2-bridge.jpg",
    outfitTip: {
      note: "Birthday dinner at Yonshin Fudopia tonight. Dress a little nice for photos. Still wear shoes you can walk in at Pier-2.",
      wear: {
        male: ["Nice shirt for dinner", "Comfortable shoes for Pier-2 / bridge"],
        female: ["Outfit you want in birthday photos", "Comfortable shoes for Pier-2 / bridge"],
      },
      avoid: {
        male: ["Flip-flops at dinner"],
        female: ["Flip-flops at dinner"],
      },
    },
    items: [
      item({
        time: "8:00–9:30 AM",
        title: "Breakfast at Hub Hotel — happy birthday, Amor!",
        category: "food",
        description: [
          text(
            "• Slow hotel breakfast (NT$0)\n• Easy morning — no Lotus Pond or Cijin today\n• Leave when ready for the library (~10 AM open)",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-birthday-outfit",
        infoNotes: ["LOCKED birthday day. No Lotus Pond or Cijin."],
      }),
      item({
        time: "10:00–11:30 AM",
        title: "Main Public Library + rooftop",
        category: "spot",
        description: [
          text("• From Hub, open Maps for "),
          place("Kaohsiung Main Public Library", "library", "Kaohsiung Main Public Library"),
          text(
            " and walk or take a short Uber (~10–20 min depending on traffic)\n• Glass building, free entry\n• Opens 10 AM (closed Mondays — today is Tuesday)\n• Take the lift to the rooftop garden for the city view, then continue toward 85 / OGNI",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Kaohsiung Main Public Library",
        guideKey: "kh-central-park-kaohsiung",
      }),
      item({
        time: "11:30 AM–12:00 PM",
        title: "85 Sky Tower — street photo (optional)",
        category: "spot",
        description: [
          text("• Short optional stop at "),
          place("85 Sky Tower", "landmark", "85 Sky Tower Kaohsiung"),
          text(
            " for a street-level photo only\n• The top deck (floor 74) is closed — do not queue for the observation deck\n• Keep this brief before coffee",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "85 Sky Tower Kaohsiung",
        guideKey: "kh-85-sky-tower",
        warnings: ["Top deck (floor 74) is closed. Outside only."],
      }),
      item({
        time: "12:00–1:30 PM",
        title: "OGNI Coffee + pastry",
        category: "food",
        description: [
          text("• Walk from 85 to "),
          place("OGNI Coffee 每咖啡", "café", "每咖啡 OGNI COFFEE 自強三路17號"),
          text(
            " at 自強三路17號 (open Maps)\n• Share one coffee + one pastry between you\n• ~NT$200–350\n• Say 不要海鮮 if anything savory looks fishy",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "每咖啡 OGNI COFFEE 自強三路17號",
        guideKey: "kh-city-walk-snack",
        warnings: ["No fish or shrimp.", "Share coffee."],
      }),
      item({
        time: "1:30–4:00 PM",
        title: "Hotel rest",
        category: "hotel",
        description: [
          text(
            "• Return to Hub Yisin (walk + MRT via R8, or Uber)\n• Nap, shower, and get ready for birthday night\n• Stay indoors through the hot 1–3 PM window",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
        infoNotes: ["Hot 1–3 — rest inside."],
      }),
      item({
        time: "4:30 PM",
        title: "Uber to Pier-2",
        category: "hotel",
        description: [
          text("• From Hub Hotel, order Uber to "),
          place("Pier-2 Art Center", "art district", "Pier-2 Art Center Kaohsiung"),
          text(
            " (棧貳庫 / Pier-2)\n• Ride ~15–25 min depending on traffic\n• ~NT$100–180 for 2\n• Drop near the Dayi warehouse area if the app offers a pin",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Pier-2 Art Center Kaohsiung",
        guideKey: "kh-pier2-art-center",
      }),
      item({
        time: "4:30–5:45 PM",
        title: "Pier-2 Dayi → Great Harbour Bridge sunset",
        category: "walk",
        description: [
          text("• Walk the Dayi warehouses (大義倉庫群) at "),
          place("Pier-2 Art Center", "art district", "Pier-2 Art Center Kaohsiung"),
          text("\n• Continue on foot to "),
          place("Great Harbour Bridge", "landmark", "Great Harbour Bridge Kaohsiung"),
          text(
            " for sunset photos\n• Bridge weekday turn is 3 PM — you skip that; enjoy the walk and later lights instead\n• Keep an eye on time for the 7 PM dinner booking",
          ),
        ],
        tags: [tag("Walk / Free", "walk"), tag("Tourist spot", "spot")],
        mapQuery: "Great Harbour Bridge Kaohsiung",
        guideKey: "kh-great-harbour-bridge",
      }),
      item({
        time: "7:00–9:00 PM",
        title: "Birthday dinner: Yonshin Fudopia",
        category: "food",
        description: [
          text("• Walk or short Uber from the bridge to "),
          place("永心浮島 Yonshin Fudopia", "restaurant", "Yonshin Fudopia Kaohsiung"),
          text(
            " at 蓬萊路6之6號 (by the bridge — open Maps)\n• Book on inline (opens 30 days ahead)\n• Order meat / veg only — say 不要海鮮\n• ~NT$1,800–2,600 for 2\n• Backup if needed: ",
          ),
          place("掌門·棧貳庫", "restaurant", "掌門精釀啤酒 棧貳庫 Kaohsiung"),
          text("."),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Yonshin Fudopia Kaohsiung",
        guideKey: "kh-birthday-dinner",
        warnings: [
          "Book ahead on inline — birthday dinner.",
          "No fish or shrimp on the dishes you order.",
          "No cake stop tonight.",
        ],
      }),
      item({
        time: "~9:30 PM",
        title: "Uber home to Hub",
        category: "hotel",
        description: [
          text(
            "• From Yonshin / Pier-2, Uber back to Hub Hotel Yisin (~15–25 min)\n• ~NT$100–180 for 2\n• Harbor / Pier-2 is done for this trip — do not redo on Day 5",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
    ],
  },
  {
    day: 21,
    title: "DAY 5 · October 21 — Lotus + fly",
    budgetLabel: "NT$ 700–1,200 · Lotus morning · airport evening",
    mapImage: "/kaohsiung-maps/day5-lotus-airport.jpg",
    items: [
      item({
        time: "7:00–8:00 AM",
        title: "Breakfast at Hub Hotel",
        category: "food",
        description: [
          text(
            "• Hotel breakfast (NT$0)\n• Morning is Lotus Pond only — short photo stops at the pagodas, not a full loop\n• Evening flight ~8:00 PM — leave bags organized before you head out",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:00–8:40 AM",
        title: "MRT / Uber to Lotus Pond",
        category: "train",
        description: [
          text(
            "• Option A: Walk to Sanduo (R8), Red Line northbound → Zuoying (R16), then short Uber to the pagoda side of ",
          ),
          place("Lotus Pond", "pond", "Lotus Pond Kaohsiung"),
          text(
            "\n• Option B: Uber direct Hub → Dragon & Tiger Pagodas (~25–40 min)\n• Combined transport ~NT$150–250 for 2\n• Open Maps for Dragon and Tiger Pagodas as the drop pin",
          ),
        ],
        tags: [tag("Train / MRT / LRT", "train"), tag("Hotel / Taxi", "hotel")],
        mapQuery: "Lotus Pond Kaohsiung",
        guideKey: "kh-lotus-pond-taxi",
      }),
      item({
        time: "8:40–10:30 AM",
        title: "Dragon & Tiger Pagodas + Spring & Autumn Pavilion",
        category: "spot",
        description: [
          text("• At "),
          place("Dragon and Tiger Pagodas", "pagoda", "Dragon and Tiger Pagodas Lotus Pond Kaohsiung"),
          text(
            " (free): enter through the dragon’s mouth and exit through the tiger’s\n• Then walk a short way to ",
          ),
          place("Spring and Autumn Pavilion", "pavilion", "Spring and Autumn Pavilion Kaohsiung"),
          text(
            " for photos\n• Short stops only — finish before late-morning heat\n• No full walk around Lotus Pond",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Dragon and Tiger Pagodas Lotus Pond Kaohsiung",
        guideKey: "kh-dragon-tiger-pagodas",
        warnings: ["Finish before the heat builds.", "No full walk around Lotus Pond."],
      }),
      item({
        time: "10:30–11:30 AM",
        title: "Lunch near Lotus Pond",
        category: "food",
        description: [
          text("• Indoor lunch near the pond — e.g. "),
          place("西安麵食館", "noodle shop", "西安麵食館 左營 勝利路115巷6號"),
          text(
            " (belt noodles) or 三牛牛肉麵\n• Open Maps for the Chinese name\n• ~NT$250–400 for 2\n• Say 不要海鮮",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "西安麵食館 左營 勝利路115巷6號",
        guideKey: "kh-lotus-pond-lunch",
        warnings: ["No fish or shrimp."],
      }),
      item({
        time: "11:30 AM–12:30 PM",
        title: "Uber Hub · get bags",
        category: "hotel",
        description: [
          text("• Uber from lunch back to "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(
            "\n• Check out if not already done\n• Pick up bags and confirm you have passports + tickets\n• ~NT$150–250",
          ),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "~2:00 PM",
        title: "MRT R8 → R4 Airport",
        category: "train",
        description: [
          text(
            "• With bags, walk or short taxi from Hub to Sanduo Shopping District MRT (R8)\n• Tap EasyCard / iPASS\n• Red Line southbound (toward Siaogang / Airport) → Kaohsiung International Airport (R4), ~15–20 min\n• Follow station signs into the terminal\n• Aim to be at KHH by ~4:00 PM for the ~8:00 PM flight\n• MRT ~NT$40–80 for 2",
          ),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
      item({
        time: "~4:00 PM",
        title: "At KHH · snacks + wait",
        category: "food",
        description: [
          text(
            "• Check in for the evening Manila flight\n• Drop bags and clear security with time to spare\n• Airport snacks / drinks ~NT$100–200 for 2\n• Rest inside air-conditioning until boarding",
          ),
        ],
        tags: [tag("Food", "food"), tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
      item({
        time: "~8:00 PM",
        title: "Flight Kaohsiung → Manila",
        category: "hotel",
        description: [
          text(
            "• KHH → MNL evening flight (prepaid — NT$0 in trip cash)\n• Trip done\n• Keep boarding passes and arrival cards handy",
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
        "No revisit: Cijin + Consulate Day 2 only, Pier-2 / harbor Day 4 only, Lotus Pond Day 5 only. Day 3 = Chiayi campus only.",
      ),
    ],
  },
  {
    icon: "🚄",
    description: [
      text(
        "Day 3 HSR is FULL fare (NT$410 × 2 each way = NT$1,640 RT). Do not put B1G1 in the budget. Taxis ×3 ~NT$850–1,250.",
      ),
    ],
  },
  {
    icon: "🚕",
    description: [
      text("Taxi: Uber app. Backup call 55688 (Chiayi: 55178). Show the driver the address."),
    ],
  },
  {
    icon: "☀️",
    description: [
      text(
        "Hot 1–3: Day 2 café shade; Day 3 hotel rest after HSR; Day 4 hotel nap; Day 5 lunch indoors then bags.",
      ),
    ],
  },
  {
    icon: "🍜",
    description: [
      text(
        "No seafood any day. Say 不要海鮮. Share coffee. Breakfast at Hub (NT$0). Flights + hotel prepaid (NT$0).",
      ),
    ],
  },
  {
    icon: "💵",
    description: [
      text(
        "Trip cash target ~NT$7,800–11,200 (mid ~9,500). Bring NT$10–12k cash. Day 4 Yonshin is the big dinner.",
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
