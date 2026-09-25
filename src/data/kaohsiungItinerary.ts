// Kaohsiung, Taiwan — October 17–21, 2026.
// Land Oct 17 evening, leave Oct 21 afternoon. One hotel the whole stay:
// Hub Hotel Kaohsiung Yisin Branch (confirmed booking, Oct 17–21) — no hotel switch.
// Plan rules:
// - No revisiting an area/island on a later day.
// - No outdoor time in bare sun from 1 to 3 PM (stay in shade or indoors).
// - No seafood, any day.
// Day layout:
// - Day 1 (Oct 17 Sat): arrive KHH → MRT R4→R8 → short taxi to hotel → easy dinner → rest.
// - Day 2 (Oct 18 Sun): British Consulate + Cijin only (short Tunnel of Stars, then shade rest, then fort/lighthouse).
// - Day 3 (Oct 19 Mon): early HSR to CCU (Meteor Garden campus) → Minxiong turkey rice → Formosa dome + café → Liuhe dinner.
// - Day 4 (Oct 20 Tue): Amor's birthday — near-hotel walk, rest, then Pier-2 + Harbour Bridge + Yonshin Fudopia.
// - Day 5 (Oct 21 Wed): Lotus Pond before 1 PM → indoor lunch → bags → KHH by ~4 PM.

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
      "We stay at one hotel the whole trip: Hub Hotel Kaohsiung Yisin Branch (一心二路15號, near Sanduo R8). Do not go back to the same island or area on a later day. It is hot from 1 to 3. Stay in the shade or go inside. No fish or shrimp any day. Say 不要海鮮 (no seafood). Day 3 morning: fast train to Chiayi to see the Meteor Garden school. Day 4 is Amor's birthday: walk near the hotel, then Pier-2, the bridge, and dinner at Yonshin Fudopia.",
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
  title: "Rules + two things to book",
  body: [
    text(
      "Rules: (1) Do not go back to the same area later. (2) It is hot from 1 to 3 — stay in the shade or go inside. (3) No fish or shrimp. Book: Day 3 fast-train tickets (T Express app). Day 4 birthday dinner at Yonshin Fudopia on inline — it opens 30 days ahead, so book now. Backup: 掌門·棧貳庫. Ask for dishes with no fish or shrimp. Taxi: use the Uber app. Backup: call 55688 (Chiayi: 55178).",
    ),
  ],
};

const days: DaySectionData[] = [
  {
    day: 17,
    title: "DAY 1 · October 17 — Arrival",
    budgetLabel: "Arrive · no sightseeing",
    items: [
      item({
        time: "5:00 PM",
        title: "Plane leaves Manila → Kaohsiung",
        category: "hotel",
        description: [text("Plane from Manila to Kaohsiung. 5:00 to 7:00 PM. About 2 hours.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Ninoy Aquino International Airport",
        guideKey: "kh-airport-arrival",
      }),
      item({
        time: "7:00 PM",
        title: "Land at Kaohsiung Airport · ATM",
        category: "hotel",
        description: [
          text("Land at "),
          place("Kaohsiung International Airport", "airport", "Kaohsiung International Airport"),
          text(". Get your bags. Take out about NT$8,000 at the Bank of Taiwan ATM in the arrival hall (1F)."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-arrival",
      }),
      item({
        time: "7:30 PM",
        title: "MRT: Airport (R4) → Sanduo (R8)",
        category: "train",
        description: [
          text(
            "Ride the Red Line from Airport (R4) to Sanduo (R8). About 15 minutes. No change of trains. Bags are heavy — do not walk to the hotel from here.",
          ),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Sanduo Shopping District MRT Station Kaohsiung",
        guideKey: "kh-mrt-to-zuoying",
      }),
      item({
        time: "7:50 PM",
        title: "Short taxi to Hub Hotel Yisin · check in",
        category: "hotel",
        description: [
          text("Take a short taxi from Sanduo (R8) to "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(" (一心二路15號). Open Uber, or call 55688. Show the driver the address."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
        infoNotes: ["Short taxi after R8 — bags are heavy. Not a walk. Not a taxi from the airport."],
      }),
      item({
        time: "9:00 PM",
        title: "Dinner at Guanghua Night Market",
        category: "food",
        description: [
          text("Walk or take a short taxi (about 1 km) to "),
          place("Guanghua Night Market", "night market", "光華夜市 Kaohsiung"),
          text(
            " on 光華二路. Share papaya milk at 光華木瓜牛奶大王 (光華二路402號). Eat pork rib soup + rice at 徐記排骨酥 (光華二路449號, opens 8 PM, check hours). Skip fish stalls.",
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
    budgetLabel: "British Consulate + Cijin Island",
    mapImage: "/kaohsiung-maps/day2-cijijn.jpg",
    items: [
      item({
        time: "7:30 AM",
        title: "Breakfast at Hub Hotel",
        category: "food",
        description: [text("Free breakfast at the hotel. Then leave by 8.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:00 AM",
        title: "MRT to Sizihwan (O1)",
        category: "train",
        description: [
          text("Red Line to Formosa Boulevard (R10). Change to the Orange Line. Ride to "),
          place("Sizihwan (O1)", "MRT station", "Sizihwan Station Kaohsiung"),
          text(". Walk up the hill to the Consulate (about 15 min)."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Sizihwan Station Kaohsiung",
        guideKey: "kh-hamasen-railway-museum",
        infoNotes: ["Today is Consulate + Cijin only. No Pier-2. No Lotus Pond."],
      }),
      item({
        time: "9:00 AM",
        title: "British Consulate at Takao",
        category: "spot",
        description: [
          place("British Consulate at Takao", "landmark", "British Consulate at Takao"),
          text(" — opens 9 AM on Sunday. Ticket NT$99 each. Look at the harbor from the red-brick porch. Take photos."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "British Consulate at Takao",
        guideKey: "kh-british-consulate-gushan",
      }),
      item({
        time: "10:00 AM",
        title: "Ferry to Cijin Island",
        category: "bus",
        description: [
          text("Walk down to "),
          place("Gushan Ferry Pier", "ferry", "Gushan Ferry Pier Kaohsiung"),
          text(". Tap your iPASS card. NT$30 each. Short boat ride to Cijin."),
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
          text("Walk "),
          place("Cijin Old Street", "street", "Cijin Old Street Kaohsiung"),
          text(" to "),
          place("Cijin Tianhou Temple", "temple", "Cijin Tianhou Temple Kaohsiung"),
          text(". Both are near the ferry. Look inside the temple. Be quiet."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Old Street Kaohsiung",
        guideKey: "kh-cijin-old-street",
      }),
      item({
        time: "11:30 AM",
        title: "Lunch: 不一樣赤肉羹 (pork soup noodles)",
        category: "food",
        description: [
          text("Eat at "),
          place("不一樣赤肉羹", "noodle shop", "不一樣赤肉羹 旗津 廟前路56號"),
          text(" (廟前路56號, opens 10 AM). Order 赤肉羹麵 (pork soup noodles) + 肉燥飯 (pork rice). Say 不要海鮮."),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "不一樣赤肉羹 旗津 廟前路56號",
        guideKey: "kh-cijin-lunch-nonseafood",
        warnings: ["No fish or shrimp. Ask before you order."],
      }),
      item({
        time: "12:15 PM",
        title: "Beach + Rainbow Church photos (before 1 PM)",
        category: "spot",
        description: [
          place("Cijin Beach", "beach", "Cijin Beach Kaohsiung"),
          text(" — walk to the Rainbow Church (彩虹教堂) arch on the sand. Take photos. Then move to shade."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Rainbow Church Kaohsiung",
        guideKey: "kh-cijin-beach",
        warnings: ["It is hot from 1 to 3. Leave the open beach by 1 PM."],
      }),
      item({
        time: "1:00 PM",
        title: "Tunnel of Stars — short photos",
        category: "spot",
        description: [
          place("Cijin Tunnel of Stars", "tunnel", "Cijin Tunnel of Stars Kaohsiung"),
          text(" — about 10 to 20 minutes. Walk through. See the sea at the other end. Then go to shade."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cijin Tunnel of Stars Kaohsiung",
        guideKey: "kh-cijin-tunnel-of-stars",
        infoNotes: ["Short stop only. Not a 2-hour stay in the tunnel."],
      }),
      item({
        time: "1:20 PM",
        title: "Rest: mango ice at 有間冰舖 + 津樓 café",
        category: "food",
        description: [
          text("Walk back to Old Street (about 10 min). 1) Share mango ice at "),
          place("有間冰舖", "ice shop", "有間冰舖 旗津店"),
          text(
            " (廟前路103巷4號, lane by Tianhou Temple, 10 AM–9 PM). Order 芒果無雙. Backup: 大碗公冰 (廟前路78號, cash only). 2) Sit in ",
          ),
          place("津樓 Jinlou", "café", "津樓 Liquid Building Coffee 旗津"),
          text(
            " old-house café (廟前路30巷13號, opens 1 PM, check hours). Share one coffee. 3) Snack: 椪嫂蕃薯椪 sweet potato balls (通山路40號, from 1:40 PM). Walk to the hill about 3:15.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "有間冰舖 旗津店",
        guideKey: "kh-city-walk-snack",
        infoNotes: ["Stay under cover or indoors until about 3 PM."],
        warnings: ["No long walk in bare sun from 1 to 3.", "Skip fish and squid stalls."],
      }),
      item({
        time: "3:30 PM",
        title: "Cihou Fort + Kaohsiung Lighthouse",
        category: "spot",
        description: [
          place("Cihou Fort", "fort", "Cihou Fort Kaohsiung"),
          text(" (free) and "),
          place("Kaohsiung Lighthouse", "lighthouse", "Kaohsiung Lighthouse"),
          text(" (10 AM–9 PM) — same hill. Walk up. Look down at the colorful roofs. Stay for sunset, about 5:40."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Cihou Fort Kaohsiung",
        guideKey: "kh-cihou-fort",
      }),
      item({
        time: "6:30 PM",
        title: "Ferry back to Gushan",
        category: "bus",
        description: [
          text("Take the ferry back (NT$30 each). Cijin is done for this trip. Do not come back to the island later."),
        ],
        tags: [tag("Bus", "bus")],
        mapQuery: "Cijin Ferry Pier Kaohsiung",
        guideKey: "kh-ferry-back-to-gushan",
      }),
      item({
        time: "7:00 PM",
        title: "Dinner: 港園牛肉麵 (beef noodles)",
        category: "food",
        description: [
          text("Short Uber from the pier to "),
          place("港園牛肉麵", "noodle shop", "港園牛肉麵 鹽埕總店"),
          text(" (大成街55號). Order 牛肉拌麵 (dry beef noodles) + one soup to share. Closes 8 PM — go straight there."),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "港園牛肉麵 鹽埕總店",
        guideKey: "kh-gushan-dinner",
        warnings: ["No fish or shrimp.", "Closes 8 PM."],
      }),
      item({
        time: "8:15 PM",
        title: "MRT or taxi back to Hub Hotel",
        category: "hotel",
        description: [text("Yanchengpu MRT (O2) → Formosa (R10) → Sanduo (R8). Or take Uber. Sleep.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
    ],
  },
  {
    day: 19,
    title: "DAY 3 · October 19 — Meteor Garden + Formosa",
    budgetLabel: "Chiayi morning · Formosa afternoon",
    mapImage: "/kaohsiung-maps/day3-ccu-formosa.jpg",
    items: [
      item({
        time: "6:15 AM",
        title: "Coffee + bread to go",
        category: "food",
        description: [text("Take free breakfast food to go. Too early for a long sit.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "6:25 AM",
        title: "Walk to Sanduo (R8) → MRT to Zuoying (R16)",
        category: "train",
        description: [
          text("Walk about 13 minutes to Sanduo. Then ride the Red Line about 20 minutes to Zuoying."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-mrt-to-zuoying",
        infoNotes: ["No harbor or Cijin today. Those are done."],
      }),
      item({
        time: "7:10 AM",
        title: "Fast train: Zuoying → Chiayi",
        category: "train",
        description: [
          text("High Speed Rail, about 40 minutes. Book seats ahead in the T Express app. Round trip for 2 is the big cost today."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Chiayi HSR Station",
        guideKey: "kh-hsr-to-chiayi",
      }),
      item({
        time: "7:55 AM",
        title: "Taxi to National Chung Cheng University",
        category: "hotel",
        description: [
          text("Taxi from Chiayi HSR to campus, about 35 to 40 minutes. Open Uber, or call 55178. The bus does not fit our time."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-taxi-to-ccu",
      }),
      item({
        time: "8:35 AM",
        title: "Meteor Garden campus (morning only)",
        category: "spot",
        description: [
          text("Walk "),
          place("National Chung Cheng University", "university", "National Chung Cheng University"),
          text(
            " — the real Meteor Garden school. Take photos at the red-brick gym gate, the fountain square, and 寧靜湖 (Quiet Lake). Leave about 10:15.",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "National Chung Cheng University",
        guideKey: "kh-chung-cheng-university",
      }),
      item({
        time: "10:30 AM",
        title: "Early lunch: turkey rice at 在地食坊 (Minxiong)",
        category: "food",
        description: [
          text("Short taxi (about 10 min) to "),
          place("在地食坊", "turkey rice shop", "在地食坊 民雄 文化路26-10號"),
          text(
            " (文化路26-10號, across from the Minxiong town office, opens 10:30). Order 火雞肉飯 (turkey rice) + 燙青菜 (greens). Closed Sat–Sun; Monday is open.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "在地食坊 民雄 文化路26-10號",
        guideKey: "kh-campus-lunch",
        warnings: ["No fish or shrimp."],
      }),
      item({
        time: "11:15 AM",
        title: "Taxi → Chiayi HSR → Zuoying → Formosa",
        category: "train",
        description: [
          text(
            "Taxi about 25 to 35 minutes to Chiayi HSR (Uber, or call 55178). Fast train about 40 minutes to Zuoying. Red Line to Formosa Boulevard (R10). Keep moving — this part is all inside.",
          ),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Zuoying HSR Station",
        guideKey: "kh-hsr-back-to-kaohsiung",
        infoNotes: ["It is hot from 1 to 3. Train and station time is inside."],
      }),
      item({
        time: "1:30 PM",
        title: "Formosa dome + Cafe Strada",
        category: "spot",
        description: [
          place("Formosa Boulevard Station", "MRT dome", "Formosa Boulevard Station Kaohsiung"),
          text(" — stand in the middle and look up at the Dome of Light. Then walk to "),
          place("Cafe Strada 步道咖啡館", "café", "步道咖啡館 Cafe Strada 中正四路44號"),
          text(
            " (中正四路44號, Exit 1, about 2 min, 11 AM–10 PM). Share one coffee. Sit and rest. Backup: 灰咖啡 Hway Coffee (林森一路146巷2號, from 1:30 PM).",
          ),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Formosa Boulevard Station Kaohsiung",
        guideKey: "kh-city-walk-snack",
        warnings: ["No malls this afternoon. Dome + café only."],
      }),
      item({
        time: "6:00 PM",
        title: "Dinner at Liuhe Night Market",
        category: "food",
        description: [
          text("Walk to "),
          place("Liuhe Night Market", "night market", "Liuhe Night Market Kaohsiung"),
          text(
            " (next to Formosa Exit 11). Share papaya milk at 鄭老牌木瓜牛奶 (六合二路1號, from 5 PM). Pick pork or chicken food. Skip seafood stalls. Then MRT 2 stops home (R10 → R8). Sleep early.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Liuhe Night Market Kaohsiung",
        guideKey: "kh-liuhe-night-market",
        warnings: ["No fish or shrimp. Many stalls here sell seafood — say 不要海鮮."],
      }),
    ],
  },
  {
    day: 20,
    title: "DAY 4 · October 20 — Amor's Birthday",
    budgetLabel: "Near-hotel walk · Pier-2 evening 🎂",
    mapImage: "/kaohsiung-maps/day4-pier2-bridge.jpg",
    outfitTip: {
      note: "Birthday dinner outside at Yonshin Fudopia tonight. Dress a little nice for photos. Still wear shoes you can walk in.",
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
        time: "8:30 AM",
        title: "Breakfast at Hub Hotel — happy birthday, Amor!",
        category: "food",
        description: [text("Slow start at Hub Yisin. Morning stays near the hotel. Easy walk.")],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-birthday-outfit",
        infoNotes: ["No Lotus Pond or Cijin today. Those are other days."],
      }),
      item({
        time: "9:30 AM",
        title: "Morning walk: Qianzhen Phase 31 Park",
        category: "walk",
        description: [
          text("Walk about 5 to 10 minutes from the hotel to "),
          place("Qianzhen Phase 31 Park", "park", "前鎮31期公園 Kaohsiung"),
          text(" (一心路 at 光華三路). Walk slow under the trees. Take couple photos. Bring water."),
        ],
        tags: [tag("Walk / Free", "walk")],
        mapQuery: "前鎮31期公園 Kaohsiung",
        guideKey: "kh-qianzhen-park",
        infoNotes: ["The old bamboo art here is gone. It is just a calm park now."],
      }),
      item({
        time: "10:30 AM",
        title: "Kaohsiung Main Public Library",
        category: "spot",
        description: [
          place("Kaohsiung Main Public Library", "library", "Kaohsiung Main Public Library"),
          text(" — glass building. Free. Opens 10 AM (closed Mondays). Take the lift up to the rooftop garden for the view."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Kaohsiung Main Public Library",
        guideKey: "kh-central-park-kaohsiung",
      }),
      item({
        time: "11:30 AM",
        title: "85 Sky Tower — outside photo",
        category: "spot",
        description: [
          place("85 Sky Tower", "landmark", "85 Sky Tower Kaohsiung"),
          text(" — the top deck is closed. Take a photo from the street. Short stop."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "85 Sky Tower Kaohsiung",
        guideKey: "kh-85-sky-tower",
        warnings: ["Top deck (floor 74) is closed. Outside only."],
      }),
      item({
        time: "12:15 PM",
        title: "Café: OGNI Coffee",
        category: "food",
        description: [
          text("Walk to "),
          place("OGNI Coffee 每咖啡", "café", "每咖啡 OGNI COFFEE 自強三路17號"),
          text(" (自強三路17號, near 85 Sky Tower, 8 AM–10 PM). Share one coffee + one croissant. Sit and relax."),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "每咖啡 OGNI COFFEE 自強三路17號",
        guideKey: "kh-city-walk-snack",
        warnings: ["No fish or shrimp."],
      }),
      item({
        time: "1:00 PM",
        title: "Rest at the hotel (1 to 3 PM)",
        category: "hotel",
        description: [
          text("It is hot from 1 to 3. Uber back to Hub Yisin. Nap. Shower. Get ready for birthday night."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
        infoNotes: ["It is hot from 1 to 3. Rest inside."],
      }),
      item({
        time: "4:00 PM",
        title: "Pier-2 Art Center",
        category: "walk",
        description: [
          text("Short Uber to "),
          place("Pier-2 Art Center", "art district", "Pier-2 Art Center Kaohsiung"),
          text(". Walk the red-brick Dayi warehouses (大義倉庫群). Look at the wall art. Peek into small shops."),
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
          text(" — walk across at sunset. It turns only at 3 PM on weekdays, so we skip that. Lights come on at night."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Great Harbour Bridge Kaohsiung",
        guideKey: "kh-great-harbour-bridge",
      }),
      item({
        time: "7:00 PM",
        title: "Birthday dinner: Yonshin Fudopia",
        category: "food",
        description: [
          text("Eat outside at "),
          place("永心浮島 Yonshin Fudopia", "restaurant", "Yonshin Fudopia Kaohsiung"),
          text(" (蓬萊路6之6號, right by the bridge, open till midnight). Book on inline — it opens 30 days ahead. Backup: "),
          place("掌門·棧貳庫", "restaurant", "掌門精釀啤酒 棧貳庫 Kaohsiung"),
          text(" (蓬萊路17號, till 9 PM). Pick meat or veggie dishes. No cake stop."),
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
        time: "9:30 PM",
        title: "Uber back to Hub Hotel",
        category: "hotel",
        description: [text("Uber back to Hub Yisin. Harbor area is done. Do not redo it on Day 5.")],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
    ],
  },
  {
    day: 21,
    title: "DAY 5 · October 21 — Lotus Pond + Leave",
    budgetLabel: "Lotus Pond morning · airport by ~4 PM",
    mapImage: "/kaohsiung-maps/day5-lotus-airport.jpg",
    items: [
      item({
        time: "8:00 AM",
        title: "Breakfast at Hub Hotel",
        category: "food",
        description: [
          text(
            "Be at the airport by about 4:00 PM for the night plane. Morning is Lotus Pond only — short photo stops. No full walk around the pond.",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-departure-breakfast",
      }),
      item({
        time: "8:45 AM",
        title: "MRT + short taxi to Lotus Pond",
        category: "train",
        description: [
          text("Sanduo (R8) → Zuoying (R16), about 20 minutes. Then a short Uber to "),
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
          text(" — free, 8 AM–5:30 PM. Go in the dragon's mouth. Come out the tiger's mouth. Climb up for a pond view. Then "),
          place("Spring and Autumn Pavilion", "pavilion", "Spring and Autumn Pavilion Kaohsiung"),
          text(" — look at Guanyin riding the dragon."),
        ],
        tags: [tag("Tourist spot", "spot")],
        mapQuery: "Dragon and Tiger Pagodas Lotus Pond Kaohsiung",
        guideKey: "kh-dragon-tiger-pagodas",
        warnings: [
          "Finish before 1 PM. It is hot from 1 to 3.",
          "No full walk around Lotus Pond.",
        ],
      }),
      item({
        time: "12:00 PM",
        title: "Lunch: 西安麵食館 (belt noodles)",
        category: "food",
        description: [
          text("Eat inside at "),
          place("西安麵食館", "noodle shop", "西安麵食館 左營 勝利路115巷6號"),
          text(
            " (勝利路115巷6號, near Lotus Pond, 10:30 AM–8 PM, days off vary). Share one 皮帶麵 (long belt noodle). Backup: 三牛牛肉麵 (勝利路85號, beef noodles).",
          ),
        ],
        tags: [tag("Food", "food")],
        mapQuery: "西安麵食館 左營 勝利路115巷6號",
        guideKey: "kh-lotus-pond-lunch",
        warnings: ["No fish or shrimp."],
      }),
      item({
        time: "1:30 PM",
        title: "Back to Hub Yisin — get bags",
        category: "hotel",
        description: [
          text("Uber back to "),
          place("Hub Hotel Kaohsiung Yisin Branch", "hotel", "Hub Hotel Kaohsiung Yisin Branch"),
          text(". Check out if needed. Pick up your bags."),
        ],
        tags: [tag("Hotel / Taxi", "hotel")],
        mapQuery: "Hub Hotel Kaohsiung Yisin Branch",
        guideKey: "kh-hub-hotel-checkin",
      }),
      item({
        time: "3:15 PM",
        title: "MRT: Sanduo (R8) → Airport (R4)",
        category: "train",
        description: [
          text("Short Uber to Sanduo with bags. Ride the Red Line straight, about 15 to 20 minutes. Be at KHH by about 4:00 PM."),
        ],
        tags: [tag("Train / MRT / LRT", "train")],
        mapQuery: "Kaohsiung International Airport",
        guideKey: "kh-airport-departure",
      }),
      item({
        time: "4:00 PM",
        title: "At KHH — check in, then wait",
        category: "hotel",
        description: [
          text(
            "Check in for the night plane Kaohsiung → Manila (leaves ~8:00 PM, lands ~9:55 PM). Rest inside the airport. Trip is done.",
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
        "Do not go back to the same place: Cijin + Consulate on Day 2 only, harbor / Pier-2 on Day 4 only, Lotus Pond on Day 5 only.",
      ),
    ],
  },
  {
    icon: "🚕",
    description: [
      text("Taxi: open the Uber app. Backup: call 55688 (in Chiayi: 55178). Show the driver the address."),
    ],
  },
  {
    icon: "☀️",
    description: [
      text(
        "It is hot from 1 to 3. Day 2: short tunnel photos, then mango ice + café. Day 3: train + Formosa dome. Day 4: hotel nap. Day 5: noodle lunch inside.",
      ),
    ],
  },
  {
    icon: "🍜",
    description: [
      text(
        "No fish or shrimp any day. Say 不要海鮮 (bù yào hǎixiān = no seafood). Ask before you order, even at the birthday dinner.",
      ),
    ],
  },
  {
    icon: "☕",
    description: [
      text("Café stops: share one coffee and sit for the vibe. Jinlou (Day 2), Cafe Strada (Day 3), OGNI (Day 4)."),
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
