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
// - Day 1 (Oct 17 Sat): arrive KHH → ATM + MRT R4→R8 + taxi Hub → check-in → Guanghua NM dinner.
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
        description: [text("Plane MNL → KHH. About 2 hours. Flights already paid (NT$0 in trip cash).")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Ninoy Aquino International Airport",
        guideKey: "kh-airport-arrival",
      }),
      item({
        time: "7:00–7:50 PM",
        title: "Land KHH · ATM + MRT R4→R8 + taxi Hub",
        category: "hotel",
        description: [
          text("Land at "),
          place("Kaohsiung International Airport", "airport", "Kaohsiung International Airport"),
          text(". Bags + Bank of Taiwan ATM — withdraw about NT$10,000–12,000 cash for the trip. Red Line Airport (R4) → Sanduo (R8), ~15 min. Short taxi to "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(" (一心二路15號). MRT + taxi together ~NT$150–250."),
        ],
        tags: [tag("Hotel / Taxi", "hotel"), tag("Train / MRT / LRT", "train")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-airport-arrival",
        infoNotes: ["Short taxi after R8 — bags are heavy. Not a walk. Not a taxi from the airport."],
      }),
      item({
        time: "8:00–9:00 PM",
        title: "Check in · Hub Hotel Yisin",
        category: "hotel",
        description: [
          text("Check in at "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(". Hotel prepaid (NT$0). Settle in before dinner."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "9:00–10:30 PM",
        title: "Dinner at Guanghua Night Market",
        category: "food",
        description: [
          text("Walk or short taxi (~1 km) to "),
          place("Guanghua Night Market", "night market", "光華夜市 Kaohsiung"),
          text(
            " on 光華二路. Share papaya milk at 光華木瓜牛奶大王 (光華二路402號). Pork rib soup + rice at 徐記排骨酥 (光華二路449號, opens 8 PM). Dinner ~NT$350–550. Skip seafood stalls.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "光華夜市 Kaohsiung",
        guideKey: "kh-liuhe-night-market",
        infoNotes: ["No sightseeing on Day 1. Save energy for Cijin tomorrow."],
        warnings: ["No fish or shrimp. Say 不要海鮮."],
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
        description: [text("Hotel breakfast included (NT$0). Leave by ~8:30.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:30–9:00 AM",
        title: "MRT to Sizihwan (O1)",
        category: "train",
        description: [
          text("Red Line → Formosa Boulevard (R10), change to Orange Line → "),
          place("Sizihwan (O1)", "MRT station", "Sizihwan Station Kaohsiung"),
          text(". Walk up to the Consulate (~15 min). MRT ~NT$60–100 for 2."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Sizihwan Station Kaohsiung",
        guideKey: "kh-hamasen-railway-museum",
        infoNotes: ["Today is Consulate + Cijin only. No Pier-2. No Lotus Pond. Tunnel of Stars optional/skip."],
      }),
      item({
        time: "9:00–10:00 AM",
        title: "British Consulate at Takao",
        category: "spot",
        description: [
          place("British Consulate at Takao", "landmark", "British Consulate at Takao"),
          text(" — opens 9 AM Sunday. Ticket NT$99 each (NT$198 for 2). Harbor view from the red-brick porch. Photos."),
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
          text("Walk down to "),
          place("Gushan Ferry Pier", "ferry", "Gushan Ferry Pier Kaohsiung"),
          text(". Tap iPASS. NT$30 each (~NT$60 for 2). Short boat to Cijin."),
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
          text("Walk "),
          place("Cijin Old Street", "street", "Cijin Old Street Kaohsiung"),
          text(" to "),
          place("Cijin Tianhou Temple", "temple", "Cijin Tianhou Temple Kaohsiung"),
          text(". Both near the ferry. Quiet inside the temple."),
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
          text("Eat near Old Street — e.g. "),
          place("不一樣赤肉羹", "noodle shop", "不一樣赤肉羹 旗津 廟前路56號"),
          text(" (廟前路56號). Pork soup noodles + pork rice. Say 不要海鮮. Lunch ~NT$250–400."),
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
          text("Sit indoors / shade. Share one coffee (~NT$150–280). Try "),
          place("津樓 Jinlou", "café", "津樓 Liquid Building Coffee 旗津"),
          text(" (廟前路30巷13號, opens ~1 PM) or another aesthetic café on Old Street. Optional mango ice at 有間冰舖. Tunnel of Stars is optional/skip — not required."),
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
        description: [text("Easy shade walk near Old Street / covered paths. Keep water. Soft transition toward the beach side.")],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "Cijin Old Street Kaohsiung",
        guideKey: "kh-cijin-old-street",
      }),
      item({
        time: "3:30–4:30 PM",
        title: "Rainbow Church + beach",
        category: "spot",
        description: [
          place("Cijin Rainbow Church", "landmark", "Cijin Rainbow Church Kaohsiung"),
          text(" arch on "),
          place("Cijin Beach", "beach", "Cijin Beach Kaohsiung"),
          text(". Photos, then keep moving toward the fort hill."),
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
          place("Cihou Fort", "fort", "Cihou Fort Kaohsiung"),
          text(" (free). Climb for sunset — about 5:32 PM in mid-October. Optional "),
          place("Kaohsiung Lighthouse", "lighthouse", "Kaohsiung Lighthouse"),
          text(" same hill if energy allows."),
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
          text("Ferry back (~NT$60 for 2). Cijin is done for this trip — do not return later."),
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
          text("Uber from the pier to "),
          place("港園牛肉麵", "noodle shop", "港園牛肉麵 鹽埕總店"),
          text(" (大成街55號). Order 牛肉拌麵 + one soup to share. Closes 8:00 PM — go straight. Then Uber back to Hub. Dinner + Ubers ~NT$470–750."),
        ],
        tags: [tag("Food", "food"), tag("Hotel / Taxi", "hotel")],
        mapQuery: "港園牛肉麵 鹽埕總店",
        guideKey: "kh-gushan-dinner",
        warnings: ["No fish or shrimp.", "Closes 8:00 PM."],
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
        description: [text("Hotel breakfast included (NT$0). Leave ~8:00 for Sanduo.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:00–8:25 AM",
        title: "MRT R8 → Zuoying R16",
        category: "train",
        description: [
          text("Sanduo (R8) Red Line → Zuoying (R16), ~20 min. MRT ~NT$40–80 for 2."),
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
            "High Speed Rail ~40–45 min. Book T Express ahead. FULL fare NT$410 × 2 = NT$820 this leg. Do NOT assume B1G1 — budget full price. Round trip HSR = NT$1,640.",
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
          text("Taxi Chiayi HSR → "),
          place("National Chung Cheng University", "university", "National Chung Cheng University"),
          text(" (~35–40 min). Uber or call 55178. ~NT$350–500."),
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
          text("Walk "),
          place("National Chung Cheng University", "university", "National Chung Cheng University"),
          text(
            " — the real Meteor Garden school. Photos at the red-brick gym gate, fountain square, and 寧靜湖 (Quiet Lake). Leave ~12:00.",
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
          text("Short taxi (~10 min) to Minxiong turkey-rice area. ~NT$150–250."),
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
          text("Eat at "),
          place("在地食坊", "turkey rice shop", "在地食坊 民雄 文化路26-10號"),
          text(
            " (文化路26-10號, across from Minxiong town office; Mon open). Order 火雞肉飯 + 燙青菜. Lunch ~NT$250–400. Say 不要海鮮.",
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
          text("Taxi back to Chiayi HSR (~25–35 min). Uber or 55178. ~NT$350–500. (Taxis ×3 today total ~NT$850–1,250.)"),
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
          text("Return HSR FULL fare NT$410 × 2 = NT$820. Combined HSR RT NT$1,640."),
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
        description: [text("Zuoying (R16) → Sanduo (R8) → short walk/taxi to Hub. No Formosa stop.")],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
        infoNotes: ["NO Formosa Boulevard stop. Go home and rest."],
      }),
      item({
        time: "4:00–7:00 PM",
        title: "Hotel rest",
        category: "hotel",
        description: [text("Rest at Hub Yisin. Shower, nap, recharge after the Chiayi run.")],
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
            "Easy dinner near Sanduo / Hub — noodles, rice, or simple café food. ~NT$150–300. NO Formosa, NO Liuhe Night Market tonight.",
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
        description: [text("Slow hotel breakfast (NT$0). Easy morning. No Lotus Pond or Cijin today.")],
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
          place("Kaohsiung Main Public Library", "library", "Kaohsiung Main Public Library"),
          text(" — glass building, free. Opens 10 AM (closed Mondays — today is Tuesday). Lift to rooftop garden for the view."),
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
          place("85 Sky Tower", "landmark", "85 Sky Tower Kaohsiung"),
          text(" — top deck closed. Optional street photo only. Short stop."),
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
          text("Walk to "),
          place("OGNI Coffee 每咖啡", "café", "每咖啡 OGNI COFFEE 自強三路17號"),
          text(" (自強三路17號, near 85). Share one coffee + one pastry. ~NT$200–350."),
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
        description: [text("Back to Hub Yisin. Nap, shower, get ready for birthday night.")],
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
          text("Uber to "),
          place("Pier-2 Art Center", "art district", "Pier-2 Art Center Kaohsiung"),
          text(". ~NT$100–180."),
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
          text("Walk Dayi warehouses (大義倉庫群) at "),
          place("Pier-2 Art Center", "art district", "Pier-2 Art Center Kaohsiung"),
          text(", then "),
          place("Great Harbour Bridge", "landmark", "Great Harbour Bridge Kaohsiung"),
          text(" for sunset. Bridge weekday turn is 3 PM — we skip that; lights later."),
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
          text("Dinner at "),
          place("永心浮島 Yonshin Fudopia", "restaurant", "Yonshin Fudopia Kaohsiung"),
          text(" (蓬萊路6之6號, by the bridge). Book on inline (opens 30 days ahead). Meat / veg only — 不要海鮮. ~NT$1,800–2,600. Backup: "),
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
        description: [text("Uber back to Hub Yisin. ~NT$100–180. Harbor / Pier-2 done — do not redo on Day 5.")],
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
            "Hotel breakfast (NT$0). Morning is Lotus Pond only — short photo stops. Evening flight ~8:00 PM.",
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
          text("Sanduo (R8) → Zuoying (R16) then short Uber, or Uber direct to "),
          place("Lotus Pond", "pond", "Lotus Pond Kaohsiung"),
          text(". ~NT$150–250."),
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
          place("Dragon and Tiger Pagodas", "pagoda", "Dragon and Tiger Pagodas Lotus Pond Kaohsiung"),
          text(" — free. In the dragon's mouth, out the tiger's. Then "),
          place("Spring and Autumn Pavilion", "pavilion", "Spring and Autumn Pavilion Kaohsiung"),
          text(". Short stops only — no full pond loop."),
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
          text("Indoor lunch — e.g. "),
          place("西安麵食館", "noodle shop", "西安麵食館 左營 勝利路115巷6號"),
          text(" belt noodles, or 三牛牛肉麵. ~NT$250–400. Say 不要海鮮."),
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
          text("Uber to "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(". Check out if needed. Pick up bags. ~NT$150–250."),
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
          text("Uber/walk to Sanduo with bags. Red Line R8 → Airport R4 (~15–20 min). MRT ~NT$40–80 for 2."),
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
          text("Check in for the evening flight. Airport snacks ~NT$100–200. Rest inside."),
        ],
        tags: [tag("Food", "food"), tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
      item({
        time: "~8:00 PM",
        title: "Flight Kaohsiung → Manila",
        category: "hotel",
        description: [text("KHH → MNL evening flight (prepaid, NT$0 in trip cash). Trip done.")],
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
