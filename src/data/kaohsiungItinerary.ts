// Kaohsiung, Taiwan — October 17–21, 2026 (Day 0–4). Hub Hotel Yisin.
// Rule: Day 1–3 starts at Shijia (R7 · Red Line); Sanduo (R8) only Day 0 arrival + Day 4 airport.
// Day 2 NCCU non-negotiable. Food: 1 main + 2–3 sides shared. Hotel breakfast free.

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
import { KAOHSIUNG_GUIDES } from "./kaohsiungGuides";

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
  bullets: Segment[][];
  tags: ItemTag[];
  mapQuery: string;
  guideKey: GuideKey;
  warnings?: string[];
  infoNotes?: string[];
}): TimelineItemData => {
  itemCounter += 1;
  const bullets = input.bullets;
  const guideImage = KAOHSIUNG_GUIDES[input.guideKey]?.image;
  return {
    id: `kh-${itemCounter}`,
    time: input.time,
    title: input.title,
    category: input.category,
    description: bullets.flat(),
    bullets,
    tags: input.tags,
    mapQuery: input.mapQuery,
    image: guideImage,
    guideKey: input.guideKey,
    warnings: input.warnings,
    infoNotes: input.infoNotes,
  };
};

const HUB = "Hub Hotel Kaohsiung Yisin Branch";
const R7 = "Shijia (R7 · Red Line)";
const R8 = "Sanduo Shopping District (R8 · Red Line)";
const SHARE = "Food: 1 main + 2–3 sides, shared between 2";

const hero: HeroData = {
  eyebrow: "Travel Itinerary",
  title: "J&A Kaohsiung Trip 2026",
  subtitle: "October 17–21 · Kaohsiung, Taiwan",
  meta: [
    "MNL–KHH: Oct 17 evening",
    "KHH–MNL: Oct 21, ~8:00 PM",
    "Hub Hotel Yisin Branch, Oct 17–21",
    "Oct 20 — Amor's birthday 🎂",
    "Hotel breakfast free · 1 main + 2–3 sides shared",
    "Trip budget ~NT$8,200 for 2 · carry NT$12,000",
  ],
  note: [
    text(
      `One hotel: ${HUB} (一心二路15號). Nearest metro is ${R7} (~600–700 m walk) — use it for every Day 1–3 start. With bags (arrival + departure) always **taxi**. Day 2 National Chung Cheng University (NCCU) is NON-NEGOTIABLE. One café per day max. Food model: 1 main + 2–3 sides, shared. Hotel breakfast free.`,
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

// NT$ for 2 pax. Flights / hotel / breakfast = 0.
const budgetSummary: BudgetCard[] = [
  { label: "October 17", amount: "NT$ 640", php: "Day 0 · arrival" },
  { label: "October 18", amount: "NT$ 1,798", php: "Day 1 · Totoro + Consulate + Cijin" },
  { label: "October 19", amount: "NT$ 3,400", php: "Day 2 · NCCU" },
  { label: "October 20", amount: "NT$ 1,310", php: "Day 3 · Amor's birthday (one café)" },
  { label: "October 21", amount: "NT$ 1,050", php: "Day 4 · Lotus + fly" },
  { label: "Total for 2", amount: "~NT$ 8,200", php: "Share-food model", featured: true },
  { label: "Recommended cash", amount: "NT$ 12,000", php: "~NT$3,000 buffer", featured: true },
];

const alert: AlertBoxData = {
  title: "Rules",
  body: [
    text(
      `(1) Day 1–3 starts: walk to ${R7} — not Sanduo. (2) With bags = **taxi** (arrival + airport departure). (3) Day 2 NCCU non-negotiable. (4) **HSR** Zuoying → Chiayi = Klook BOGO (G02TAIWAN) ONE leg only; return Chiayi → Zuoying normal fare. (5) **HSR** ticket: same-day later train can be changed at Zuoying counter ≥30 min before departure (same stations, one change). (6) One café per day. (7) ${SHARE}.`,
    ),
  ],
};

const days: DaySectionData[] = [
  {
    day: 17,
    title: "DAY 0 · October 17 — Arrival",
    budgetLabel: "NT$ 640",
    items: [
      item({
        time: "Evening",
        title: "1. Land KHH",
        category: "hotel",
        bullets: [[text("Land at "), place("Kaohsiung International Airport", "airport", "Kaohsiung International Airport"), text(" · collect bags · ATM")]],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-arrival",
      }),
      item({
        time: "After landing",
        title: `2. **MRT Airport (R4 · Red Line)** → ${R8}`,
        category: "train",
        bullets: [[text("**Red Line** northbound (toward Gangshan) ~15 min · ×2 NT$90")]],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Sanduo Shopping District Station Kaohsiung",
        guideKey: "kh-airport-arrival",
        infoNotes: ["Sanduo only because of bags (short taxi to Hub). Every other day starts at **Shijia (R7 · Red Line)**. Uber ONLY if too tired — otherwise walk / **MRT** / **Light Rail** / **bus** / **ferry**."],
      }),
      item({
        time: "~10 min",
        title: "3. **Taxi** Sanduo → Hub Hotel Yisin (with bags)",
        category: "hotel",
        bullets: [[text("With bags: **taxi** from **Sanduo Shopping District (R8 · Red Line)** exit to "), place(HUB, "hotel", HUB), text(" (一心二路15號) · ~5 min · ~NT$100–150")], [text("Do NOT walk with luggage. Backup: short **city bus** toward 一心路 if you prefer.")]],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: HUB,
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "Check-in",
        title: "4. Check in · hotel pantry if hungry",
        category: "hotel",
        bullets: [[text("Hotel prepaid (NT$0)")]],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: HUB,
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "Dinner",
        title: "5. Dinner — **Liu Jia Beef Noodle (劉家牛肉麵)** near Hub",
        category: "food",
        bullets: [[text("Go to **Liu Jia Beef Noodle (劉家牛肉麵)** — beef noodle shop near Sanduo / Hub Yisin (一心路). Short walk after you drop bags. Show the shop name (劉家牛肉麵) to staff/Google Maps.")], [text("Order: 1 big beef noodle bowl + side dishes, shared · NT$400")], [text("If closed/too tired: ask Hub desk for a sit-down spot on 一心路")]],
        tags: [tag("Food", "food")],
        mapQuery: "劉家牛肉麵 Kaohsiung Lingya",
        guideKey: "kh-city-walk-snack",
      }),
      item({
        time: "Night",
        title: "6. Sleep",
        category: "hotel",
        bullets: [[text("No coffee, no bought water today")]],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: HUB,
        guideKey: "kh-hub-hotel-checkin",
      }),
    ],
  },
  {
    day: 18,
    title: "DAY 1 · October 18 — Totoro Tunnel + Consulate + Cijin",
    budgetLabel: "NT$ 1,798",
    mapImage: "/kaohsiung-maps/day2-cijijn.jpg",
    items: [
      item({
        time: "7:30–8:30 AM",
        title: "1. Breakfast — free (hotel)",
        category: "food",
        bullets: [[text("Hotel breakfast NT$0")]],
        tags: [tag("Food", "food")],
        mapQuery: HUB,
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:30–9:00 AM",
        title: `2. **MRT** ${R7} → **Aozihdi (R13 · Red Line)**`,
        category: "train",
        bullets: [
          [text(`Walk ~8–10 min (~600–700 m) from Hub to ${R7} — NOT Sanduo`)],
          [text("**Red Line** northbound (toward Gangshan) · ONE train, no change · get off at **Aozihdi (R13 · Red Line)**")],
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Aozihdi Station R13 Kaohsiung",
        guideKey: "kh-hamasen-railway-museum",
      }),
      item({
        time: "9:00–9:20 AM",
        title: "3. **Light Rail** **Heart of Love River (C24 · Light Rail)** → **Kaohsiung Museum of Fine Arts (C21 · Light Rail)**",
        category: "train",
        bullets: [
          [text("At **Aozihdi (R13 · Red Line)** follow signs to the **Light Rail** stop **愛河之心 Heart of Love River (C24 · Light Rail)** (same transfer station)")],
          [text("Ride west 3 stops (C23 → C22) · get off at **美術館 Kaohsiung Museum of Fine Arts (C21 · Light Rail)** · EasyCard NT$30 × 2 = NT$60")],
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Kaohsiung Light Rail Museum of Fine Arts Station C21",
        guideKey: "kh-pier2-art-center",
      }),
      item({
        time: "9:20–10:00 AM",
        title: "4. Totoro Tunnel (龍貓隧道) — photos",
        category: "spot",
        bullets: [
          [place("Totoro Tunnel", "landmark", "龍貓隧道 Totoro Tunnel Kaohsiung"), text(" · green tree tunnel the **Light Rail** passes through · free")],
          [text("Best photo: at the round green \"Mikan\" (蜜柑) sign inside **美術館 Kaohsiung Museum of Fine Arts (C21 · Light Rail)** station")],
          [text("Museum of Fine Arts is right beside this station — take outside photos here too (free).")],
          [text("Do NOT step on the tracks. When the warning light turns on, step back.")],
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "龍貓隧道 Totoro Tunnel Kaohsiung",
        guideKey: "kh-central-park-kaohsiung",
      }),
      item({
        time: "10:00–10:30 AM",
        title: "5. **Light Rail** continue south → **Hamasen (C14 · Light Rail)**",
        category: "train",
        bullets: [[text("Board the **Light Rail** going south (C21A → C20 → … → C15) · same direction, no going back · get off at **哈瑪星 Hamasen (C14 · Light Rail)** · NT$30 × 2 = NT$60 · then walk uphill to the Consulate")]],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Hamasen Light Rail Station C14",
        guideKey: "kh-british-consulate-gushan",
      }),
      item({
        time: "10:45 AM–12:00 PM",
        title: "5. British Consulate at Takao",
        category: "spot",
        bullets: [[place("British Consulate at Takao", "landmark", "British Consulate at Takao"), text(" · walk uphill ~10–15 min from **Hamasen (C14 · Light Rail)**")], [text("Tickets NT$99 × 2 = NT$198 (pay at gate) · No. 20 Lianhai Rd")]],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "British Consulate at Takao",
        guideKey: "kh-british-consulate-gushan",
      }),
      item({
        time: "12:15 PM",
        title: "6. **Ferry** Gushan → Cijin",
        category: "train",
        bullets: [[text("Gushan **Ferry** Pier → Cijin · straight from Consulate (no café detour) · EasyCard")]],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Gushan Ferry Pier",
        guideKey: "kh-ferry-to-cijin",
      }),
      item({
        time: "12:45–1:45 PM",
        title: "7. Lunch on Cijin",
        category: "food",
        bullets: [[text(`${SHARE} · NT$340 · say 不要海鮮`)]],
        tags: [tag("Food", "food")],
        mapQuery: "Cijin Old Street",
        guideKey: "kh-cijin-lunch-nonseafood",
      }),
      item({
        time: "2:00–3:30 PM",
        title: "8. 老街小巷咖啡簡餐 (Old Street Alley Café) — only café today",
        category: "food",
        bullets: [
          [text("Cijin Old Street lane · 廟前路60巷7號 · ~3–5 min walk from Cijin **ferry** pier, near Tianhou Temple")],
          [text("1 main + 2 drinks, shared · NT$500 · open 11:30–19:30 (Sun OK)")],
        ],
        tags: [tag("Food", "food")],
        mapQuery: "老街小巷咖啡簡餐 旗津 廟前路60巷7號",
        guideKey: "kh-cijin-old-street",
      }),
      item({
        time: "Late afternoon",
        title: "9. **Ferry** Cijin → Gushan",
        category: "train",
        bullets: [[text("**Ferry** RT ×2 NT$80 total")]],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Gushan Ferry Pier",
        guideKey: "kh-ferry-back-to-gushan",
      }),
      item({
        time: "Evening",
        title: "10. Dinner — **Cijin Old Street (旗津廟前路)** street stalls",
        category: "food",
        bullets: [[text("旗津老街 / 廟前路 by 旗津天后宮 (Cijin Tianhou Temple), 2–3 min walk from **Cijin Ferry Pier** — street-food stalls — order **oyster omelette (蚵仔煎)** and **milkfish (虱目魚)** soup/belly. Eat here BEFORE the **ferry** back.")], [text("Suggestion: pick stalls on Miaoqian Rd; skip pricey live-seafood restaurants (pay by weight).")], [text(`${SHARE} · NT$400`)]],
        tags: [tag("Food", "food")],
        mapQuery: "Cijin Old Street Miaoqian Road Kaohsiung",
        guideKey: "kh-gushan-dinner",
      }),
      item({
        time: "Night",
        title: `11. Back to Hub — **MRT** get off ${R7}`,
        category: "hotel",
        bullets: [[text("Metro/EasyCard hops for the day ×2 NT$160 · walk to Consulate NT$0")]],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: HUB,
        guideKey: "kh-hub-hotel-checkin",
      }),
    ],
  },
  {
    day: 19,
    title: "DAY 3 · October 19 — Meteor Garden LOCKED",
    budgetLabel: "NT$ 3,400",
    mapImage: "/kaohsiung-maps/day3-ccu-formosa.jpg",
    items: [
      item({
        time: "Morning",
        title: "1. Breakfast — free (hotel)",
        category: "food",
        bullets: [[text("Leave hotel whenever ready — **HSR** train time is flexible (see step 3)")]],
        tags: [tag("Food", "food")],
        mapQuery: HUB,
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "Leave hotel",
        title: `2. **MRT** ${R7} → **Zuoying (R16 · Red Line)**`,
        category: "train",
        bullets: [[text(`Walk ~8–10 min to ${R7} (not Sanduo) · **Red Line** northbound ~20 min · ×2 NT$120 RT`)]],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-mrt-to-zuoying",
      }),
      item({
        time: "Flexible",
        title: "3. **HSR** Zuoying → Chiayi ×2 — Klook BOGO",
        category: "train",
        bullets: [
          [text("Klook G02TAIWAN BOGO, one leg only · ~NT$340 (₱670) for 2")],
          [text("Late? Change to a later same-day train at the Zuoying counter ≥30 min before departure (same stations, one change)")],
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-hsr-to-chiayi",
      }),
      item({
        time: "After HSR",
        title: "4. **Bus** Chiayi **HSR** → NCCU",
        category: "bus",
        bullets: [[text("NT$600")]],
        tags: [tag("Bus", "bus"), tag("Hotel / Taxi", "hotel")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-taxi-to-ccu",
      }),
      item({
        time: "Midday",
        title: "5. National Chung Cheng University campus",
        category: "spot",
        bullets: [[place("National Chung Cheng University", "campus", "National Chung Cheng University")]],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-chung-cheng-university",
      }),
      item({
        time: "Lunch",
        title: "6. Lunch on campus",
        category: "food",
        bullets: [[text(`${SHARE} · NT$340`)]],
        tags: [tag("Food", "food")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-campus-lunch",
      }),
      item({
        time: "Afternoon",
        title: "7. Campus snacks",
        category: "food",
        bullets: [[text("1 main + 2 small, shared · NT$160")]],
        tags: [tag("Food", "food")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-campus-lunch",
      }),
      item({
        time: "Afternoon",
        title: "8. **Bus** NCCU → Chiayi **HSR**",
        category: "bus",
        bullets: [[text("NT$600 (RT total NT$1,200)")]],
        tags: [tag("Bus", "bus"), tag("Hotel / Taxi", "hotel")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-taxi-to-ccu",
      }),
      item({
        time: "Afternoon",
        title: "9. **HSR** Chiayi → Zuoying ×2 — normal fare",
        category: "train",
        bullets: [[text("~NT$900 for 2 (no promo on this leg)")]],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-hsr-back-to-kaohsiung",
      }),
      item({
        time: "Evening",
        title: `10. **MRT Zuoying (R16)** → ${R7} → Hub`,
        category: "train",
        bullets: [[text("**Red Line** southbound · walk ~8–10 min to Hub (included in NT$120 RT)")]],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: HUB,
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "Dinner",
        title: "11. Dinner near Hub",
        category: "food",
        bullets: [[text(`${SHARE} · NT$340`)]],
        tags: [tag("Food", "food")],
        mapQuery: HUB,
        guideKey: "kh-city-walk-snack",
      }),
    ],
  },
  {
    day: 20,
    title: "DAY 4 · October 20 — Amor birthday LOCKED",
    budgetLabel: "NT$ 1,310",
    mapImage: "/kaohsiung-maps/day4-pier2-bridge.jpg",
    items: [
      item({
        time: "Morning",
        title: "1. Breakfast — free (hotel) · happy birthday, Amor!",
        category: "food",
        bullets: [[text("Hotel breakfast NT$0")]],
        tags: [tag("Food", "food")],
        mapQuery: HUB,
        guideKey: "kh-birthday-outfit",
      }),
      item({
        time: "Morning",
        title: "2. Kaohsiung Main Public Library + rooftop",
        category: "spot",
        bullets: [
          [place("Kaohsiung Main Public Library", "library", "Kaohsiung Main Public Library")],
          [text("Walk from Hub (~20 min) or **MRT** from **Shijia (R7 · Red Line)**")],
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Kaohsiung Main Public Library",
        guideKey: "kh-central-park-kaohsiung",
      }),
      item({
        time: "Late morning",
        title: "3. ONE café — OGNI or NOW & THEN (not both)",
        category: "food",
        bullets: [[text("1 main + 2 drinks, shared · NT$500")]],
        tags: [tag("Food", "food")],
        mapQuery: "OGNI Coffee Kaohsiung",
        guideKey: "kh-city-walk-snack",
      }),
      item({
        time: "1:00 PM",
        title: "4. **Light Rail** **Glory Pier (C10 · Light Rail)** → **駁二大義 Pier-2 Dayi (C12 · Light Rail)**",
        category: "train",
        bullets: [
          [text("Walk from the Library to the **Light Rail** stop **光榮碼頭 Glory Pier (C10 · Light Rail)** — the stop beside the library · EasyCard NT$30 × 2 = NT$60")],
          [text("Ride 2 stops · get off at **駁二大義 Pier-2 Dayi (C12 · Light Rail)**")],
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Kaohsiung Light Rail Glory Pier Station",
        guideKey: "kh-pier2-art-center",
      }),
      item({
        time: "1:30 PM",
        title: "5. Pier-2 Art Center + snacks",
        category: "spot",
        bullets: [[place("Pier-2 Art Center", "landmark", "Pier-2 Art Center"), text(" · walk around, photos · free · 1 main + 2 small, shared · NT$160")]],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Pier-2 Art Center",
        guideKey: "kh-pier2-art-center",
      }),
      item({
        time: "Sunset",
        title: "6. Great Harbour Bridge sunset",
        category: "spot",
        bullets: [[place("Great Harbor Bridge", "bridge", "Kaohsiung Great Harbor Bridge"), text(" · free")]],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Kaohsiung Great Harbor Bridge",
        guideKey: "kh-great-harbour-bridge",
      }),
      item({
        time: "Dinner",
        title: "7. Birthday dinner: Yonshin Fudopia (or street food to save)",
        category: "food",
        bullets: [[text(`${SHARE} · NT$460`)]],
        tags: [tag("Food", "food")],
        mapQuery: "Yonshin Fudopia Kaohsiung",
        guideKey: "kh-birthday-dinner",
      }),
      item({
        time: "Night",
        title: "8. **Light Rail** + **MRT** back to Hub",
        category: "hotel",
        bullets: [[text("**Light Rail** from **駁二大義 Pier-2 Dayi (C12 · Light Rail)** going south (C11 → C10 → … → C4) · get off at **凱旋 Kaisyuan (C3 · Light Rail)** · change to **MRT** **Kaisyuan (R6 · Red Line)** · **Red Line** northbound ONE stop to **Shijia (R7 · Red Line)** · walk ~8–10 min to Hub · ~NT$120 for 2")]],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: HUB,
        guideKey: "kh-hub-hotel-checkin",
      }),
    ],
  },
  {
    day: 21,
    title: "DAY 5 · October 21 — Lotus Pond + fly ~8 PM",
    budgetLabel: "NT$ 1,050",
    mapImage: "/kaohsiung-maps/day5-lotus-airport.jpg",
    items: [
      item({
        time: "Morning",
        title: "1. Breakfast — free (hotel)",
        category: "food",
        bullets: [[text("Pack bags before heading out")]],
        tags: [tag("Food", "food")],
        mapQuery: HUB,
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "Morning",
        title: "2. **MRT Shijia (R7 · Red Line)** → **Zuoying (R16 · Red Line)** → walk Lotus Pond",
        category: "hotel",
        bullets: [[text("Walk to **Shijia (R7 · Red Line)** · **Red Line** northbound ~20 min · walk ~15 min to pagodas · ×2 RT NT$120")]],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Dragon and Tiger Pagodas Lotus Pond Kaohsiung",
        guideKey: "kh-lotus-pond-taxi",
      }),
      item({
        time: "Morning",
        title: "3. Dragon & Tiger Pagodas + Spring & Autumn Pavilion",
        category: "spot",
        bullets: [[text("Free · short photo stops")]],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Dragon and Tiger Pagodas Lotus Pond Kaohsiung",
        guideKey: "kh-dragon-tiger-pagodas",
      }),
      item({
        time: "Lunch",
        title: "4. Lunch near Lotus Pond",
        category: "food",
        bullets: [[text(`${SHARE} · NT$340`)]],
        tags: [tag("Food", "food")],
        mapQuery: "Lotus Pond Kaohsiung",
        guideKey: "kh-lotus-pond-lunch",
      }),
      item({
        time: "Early afternoon",
        title: "5. Back to Hub · checkout · bags",
        category: "hotel",
        bullets: [[text("**MRT Zuoying (R16 · Red Line)** → **Shijia (R7 · Red Line)** · walk to Hub (incl. in NT$120)")]],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: HUB,
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "~2:00–3:00 PM",
        title: "6. **Taxi** Hub Hotel → **Kaohsiung International Airport** (with bags)",
        category: "hotel",
        bullets: [[text("You have bags. Ask the Hub front desk: \"Taxi to airport, please\" (小港機場). They call a **taxi** for you.")], [text("Ride ~15–20 min · ~NT$250–350 · pay the driver (cash ok). Be at the airport by ~4 PM.")], [text("Do NOT walk to Sanduo. Do NOT take the **MRT** with luggage.")]],
        tags: [tag("Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
      item({
        time: "~4:00 PM",
        title: "7. Airport snacks + small buys",
        category: "food",
        bullets: [[text("1 main + 2 small, shared NT$160 · small buys NT$80")]],
        tags: [tag("Food", "food")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
      item({
        time: "~8:00 PM",
        title: "8. Flight KHH → MNL",
        category: "hotel",
        bullets: [[text("Prepaid · NT$0")]],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
    ],
  },
];

const tips: TipCardData[] = [
  { icon: "🚇", description: [text(`Day 1–3: always walk to ${R7}. With bags = **taxi** to/from airport.`)] },
  { icon: "🚄", description: [text("Day 2: **HSR** Zuoying → Chiayi BOGO (one leg) ~NT$340; Chiayi → Zuoying normal ~NT$900. **Bus** Chiayi–NCCU RT NT$1,200.")] },
  { icon: "🍜", description: [text(`${SHARE}. Hotel breakfast free. Say 不要海鮮.`)] },
  { icon: "💵", description: [text("Trip ~NT$8,200 for 2. Carry NT$12,000.")] },
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
