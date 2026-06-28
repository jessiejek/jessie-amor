export const TRAVELER_1 = "Jessie Jay Q. Rubi";
export const TRAVELER_2 = "Rizza Amor L. Caguco";

export type Category = 'train' | 'bus' | 'food' | 'spot' | 'hotel' | 'walk' | 'free';
export type TagVariant = 'train' | 'bus' | 'food' | 'walk' | 'spot' | 'hotel' | 'free';

export type TextSegment = {
  kind: 'text';
  value: string;
};

export type StrongSegment = {
  kind: 'strong';
  value: string;
};

export type PlaceSegment = {
  kind: 'place';
  label: string;
  placeType?: string;
  mapQuery: string;
};

export type Segment = TextSegment | StrongSegment | PlaceSegment;

export type ItemTag = {
  label: string;
  variant: TagVariant;
};

export type BudgetCard = {
  label: string;
  amount: string;
  php: string;
  featured?: boolean;
};

export type LegendItem = {
  label: string;
  color: string;
};

export type TimelineItemData = {
  id: string;
  time: string;
  title: string;
  category: Category;
  description: Segment[];
  tags: ItemTag[];
  cost?: string;
  mapQuery: string;
  image?: string;
  guideKey: GuideKey;
  foodGuideKey?: FoodGuideKey;
};

export type DaySectionData = {
  day: 11 | 12 | 13 | 14 | 15 | 16;
  title: string;
  budgetLabel: string;
  outfitTip?: {
    wear: { male: string[]; female: string[] };
    avoid: { male: string[]; female: string[] };
  };
  items: TimelineItemData[];
  images?: {
    title: string;
    url: string;
    label: string;
  }[];
};

export type HeroData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  meta: string[];
  note: Segment[];
};

export type TipCardData = {
  icon: string;
  description: Segment[];
};

export type AlertBoxData = {
  title: string;
  body: Segment[];
};

export type FoodSuggestion = {
  name: string;
  description: string;
  estimatedPrice: string;
};

export type FoodGuide = {
  areaNote: string;
  nearbyFoods: FoodSuggestion[];
  suggestedOrderForTwo: string;
  tips: string[];
  priceNote: string;
};

export type DestinationGuide = {
  title: string;
  summary: string;
  service?: string;
  ticket?: string;
  whereToBuy?: string[];
  transport?: {
    goHere: string[];
    buyThis: string[];
    tapHere: string[];
    getOffHere: string[];
    extra?: string[];
  };
  foodGuide?: FoodGuide;
  steps: string[];
  tips: string[];
};

const GUIDE_KEYS = {
  'a-famosa-porta-de-santiago': true,
  'airport-breakfast': true,
  'arrive-klia': true,
  'batu-caves': true,
  'breakfast-near-chinatown': true,
  'breakfast-near-hotel': true,
  'bus-to-melaka-sentral': true,
  'bus-to-tbs': true,
  'cendol-cold-drinks': true,
  'central-market': true,
  'check-in': true,
  'check-out-travelodge': true,
  'dinner-in-chinatown': true,
  'dutch-square-red-square': true,
  'early-dinner-in-malacca': true,
  'flight-departs': true,
  'grab-back-to-melaka-sentral': true,
  'grab-to-dutch-square': true,
  'grab-to-klia': true,
  'harmony-street-jonker-street': true,
  'jalan-alor': true,
  'klcc-park-suria-klcc': true,
  'klcc-to-bukit-bintang-walkway': true,
  'klia-check-in': true,
  'klia-transit-back-to-kl-sentral': true,
  'klia-transit-to-bandar-tasik-selatan': true,
  'ktm-komuter-return': true,
  'ktm-komuter-to-batu-caves': true,
  'kwai-chai-hong': true,
  'melaka-river-cruise': true,
  'merdeka-square-river-of-life': true,
  'melaka-sultanate-palace': true,
  'melaka-straits-mosque': true,
  'maritime-museum': true,
  'baba-nyonya-heritage-museum': true,
  'chin-swee-caves-temple': true,
  'genting-highlands-premium-outlets': true,
  'genting-island-transfer': true,
  'restoran-yusoof-dan-zakhir': true,
  'rexkl-bookxcess-maze': true,
  'skyavenue-mall': true,
  'skytropolis': true,
  'awana-skyway': true,
  'lrt-back-to-pasar-seni': true,
  'lrt-pasar-seni-to-kl-sentral': true,
  'lrt-to-kl-sentral': true,
  'lrt-to-klcc': true,
  'lunch-in-chinatown': true,
  'lunch-near-batu-caves': true,
  'lunch-near-jonker-dutch-square': true,
  'melaka-river-walk': true,
  'mrt-back-to-pasar-seni': true,
  'petaling-street': true,
  'petronas-twin-towers-klcc': true,
  'river-of-life-masjid-jamek-area': true,
  'saloma-bridge': true,
  'simple-breakfast-near-hotel': true,
  'st-pauls-hill': true,
  'wake-up': true,
  'walk-to-tbs': true,
} as const;

const FOOD_GUIDE_KEYS = {
  'batu-caves-lunch': true,
  'chinatown-breakfast': true,
  'chinatown-dinner': true,
  'chinatown-lunch': true,
  'hotel-breakfast': true,
  'jalan-alor-dinner': true,
  'klia-breakfast': true,
  'melaka-cendol': true,
  'melaka-early-dinner': true,
  'melaka-jonker-lunch': true,
  'simple-hotel-breakfast': true,
} as const;

export type GuideKey = keyof typeof GUIDE_KEYS;
export type FoodGuideKey = keyof typeof FOOD_GUIDE_KEYS;

export type ItineraryId = 'main' | 'partner';

export type ItineraryPlan = {
  id: ItineraryId;
  label: string;
  description?: string;
  hero: HeroData;
  budgetSummary: BudgetCard[];
  legend: LegendItem[];
  days: DaySectionData[];
  alert: AlertBoxData;
  tips: TipCardData[];
  footer: string;
};

const text = (value: string): TextSegment => ({ kind: 'text', value });
const strong = (value: string): StrongSegment => ({ kind: 'strong', value });
const place = (label: string, placeType: string | undefined, mapQuery: string): PlaceSegment => ({
  kind: 'place',
  label,
  placeType,
  mapQuery,
});
const tag = (label: string, variant: TagVariant): ItemTag => ({ label, variant });

const FOOD_GUIDES_BY_KEY: Record<FoodGuideKey, FoodGuide> = {
  'chinatown-breakfast': {
    areaNote:
      'You are eating around Chinatown / Petaling Street near Travelodge, Pasar Seni, and Central Market. Best choice: simple kopitiam or hawker food, not a fancy café.',
    nearbyFoods: [
      {
        name: 'Kaya butter toast',
        description: 'Light Malaysian kopitiam breakfast. Good if you want something safe and easy.',
        estimatedPrice: 'RM 5–13',
      },
      {
        name: 'Chee cheong fun',
        description: 'Steamed rice noodle rolls with sweet sauce or curry sauce. Good light breakfast.',
        estimatedPrice: 'RM 5–8',
      },
      {
        name: 'Wantan mee',
        description: 'Dry egg noodles with wantan and roast/BBQ meat. Filling but still budget-friendly.',
        estimatedPrice: 'RM 8–13',
      },
      {
        name: 'Nasi lemak bungkus',
        description: 'Small wrapped nasi lemak with sambal, egg, anchovies, and peanuts.',
        estimatedPrice: 'RM 4–8',
      },
      {
        name: 'Kopi / teh tarik',
        description: 'Local coffee or milk tea. Follow the itinerary rule: one shared coffee if budgeting.',
        estimatedPrice: 'RM 2.50–6',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: 1 kaya toast set + 1 chee cheong fun or wantan mee + 1 shared kopi/teh = around RM 18–30.',
    tips: [
      'Choose a stall/shop with visible menu prices.',
      'For breakfast, do not over-order because lunch is also in Chinatown.',
      'Ask “spicy?”??? before ordering curry or laksa.',
      'Use small cash for hawker stalls.',
      'If following the budget, share one coffee instead of buying two drinks.',
    ],
    priceNote:
      'Prices are rough estimates. Hawker stalls can be cheaper; cafés and air-conditioned shops can be higher.',
  },
  'hotel-breakfast': {
    areaNote:
      'Travelodge is beside the Pasar Seni / Central Market / Chinatown area, so breakfast should be quick and walkable.',
    nearbyFoods: [
      {
        name: 'Kaya butter toast',
        description: 'Fast kopitiam breakfast. Easy before Batu Caves.',
        estimatedPrice: 'RM 5–13',
      },
      {
        name: 'Roti canai',
        description: 'Flatbread with curry. Cheap, filling, and common in Malaysian breakfast spots.',
        estimatedPrice: 'RM 2.50–6',
      },
      {
        name: 'Nasi lemak bungkus',
        description: 'Small packed rice meal. Good if you need more energy before the train ride.',
        estimatedPrice: 'RM 4–8',
      },
      {
        name: 'Half-boiled eggs',
        description: 'Simple kopitiam protein, usually paired with toast.',
        estimatedPrice: 'RM 4–7',
      },
      {
        name: 'Kopi / teh tarik',
        description: 'Local coffee or milk tea. Keep it to one shared drink for budget control.',
        estimatedPrice: 'RM 2.50–6',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: 2 light breakfast items + 1 shared coffee/tea = around RM 18–32.',
    tips: [
      'Eat light because Batu Caves includes stairs and walking.',
      'Pick food that can be served quickly.',
      'Avoid café brunch if the goal is to keep the day budget low.',
      'Bring water before leaving for the train.',
    ],
    priceNote:
      'Prices vary by stall. Chain cafés can cost more than hawker/kopitiam stalls.',
  },
  'simple-hotel-breakfast': {
    areaNote:
      'This is an early Malacca day-trip breakfast. Keep it fast, light, and cheap near Travelodge / Pasar Seni.',
    nearbyFoods: [
      {
        name: 'Roti canai',
        description: 'Quick flatbread with curry. Good before a long travel day.',
        estimatedPrice: 'RM 2.50–6',
      },
      {
        name: 'Kaya toast',
        description: 'Safe and light breakfast if you do not want a heavy meal.',
        estimatedPrice: 'RM 5–13',
      },
      {
        name: 'Nasi lemak bungkus',
        description: 'Small rice pack. More filling if you are worried about getting hungry on the bus.',
        estimatedPrice: 'RM 4–8',
      },
      {
        name: 'Vadai / curry puff',
        description: 'Small fried snack. Good as backup food for the bus terminal.',
        estimatedPrice: 'RM 1–3 each',
      },
      {
        name: 'Kopi / teh tarik',
        description: 'One shared hot drink is enough to follow the budget.',
        estimatedPrice: 'RM 2.50–6',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: 2 roti/kaya/nasi lemak items + 1 shared hot drink = around RM 15–28.',
    tips: [
      'Do not sit too long because the Malacca transfer has multiple steps.',
      'Buy only easy food; avoid messy meals before the bus ride.',
      'Bring bottled water for the trip.',
      'Keep small cash ready.',
    ],
    priceNote:
      'Early morning availability varies by shop. These are rough budget estimates.',
  },
  'chinatown-lunch': {
    areaNote:
      'This is the best Chinatown meal window because Madras Lane / Petaling Street food is strongest from morning to afternoon.',
    nearbyFoods: [
      {
        name: 'Curry laksa',
        description: 'Coconut curry noodle soup with tofu puffs and noodles. Classic Madras Lane-style Chinatown food.',
        estimatedPrice: 'RM 10–15',
      },
      {
        name: 'Yong tau foo',
        description: 'Stuffed tofu and vegetables, served fried or in soup. Good for sharing.',
        estimatedPrice: 'RM 10–18',
      },
      {
        name: 'Chee cheong fun',
        description: 'Soft rice noodle rolls with sauce. Good light add-on.',
        estimatedPrice: 'RM 5–8',
      },
      {
        name: 'Wantan mee',
        description: 'Dry noodles with dumplings and roast/BBQ meat.',
        estimatedPrice: 'RM 8–13',
      },
      {
        name: 'Air mata kucing',
        description: 'Sweet longan winter melon drink, popular around Chinatown/Petaling Street.',
        estimatedPrice: 'RM 2–5',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: 1 curry laksa + 1 wantan mee or yong tau foo plate + 1 shared drink = around RM 30–48.',
    tips: [
      'Madras Lane-style stalls are better earlier in the day than late night.',
      'If there is no visible menu price, ask first before sitting.',
      'Curry laksa can be spicy and rich; share if unsure.',
      'Prioritize one proper meal each, not too many snacks.',
    ],
    priceNote:
      'Prices are rough estimates for hawker/kopitiam food. Tourist-facing shops may charge more.',
  },
  'chinatown-dinner': {
    areaNote:
      'Chinatown dinner is better for cooked dishes, noodles, roast meats, claypot rice, and simple shared food.',
    nearbyFoods: [
      {
        name: 'Claypot chicken rice',
        description: 'Rice cooked in a claypot with chicken and sausage. Good filling dinner.',
        estimatedPrice: 'RM 10–18',
      },
      {
        name: 'KL Hokkien mee',
        description: 'Dark soy wok-fried noodles with smoky flavor. Good for sharing.',
        estimatedPrice: 'RM 12–20',
      },
      {
        name: 'Roast chicken / roast duck rice',
        description: 'Simple rice meal from roast meat stalls.',
        estimatedPrice: 'RM 10–18',
      },
      {
        name: 'Wantan mee',
        description: 'Safe noodle option if you want something not too heavy.',
        estimatedPrice: 'RM 8–13',
      },
      {
        name: 'Air mata kucing / herbal tea',
        description: 'Cheap local drink option instead of expensive café drinks.',
        estimatedPrice: 'RM 2–5',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: 1 claypot chicken rice or Hokkien mee + 1 roast meat rice/noodle + 1 shared drink = around RM 45–70.',
    tips: [
      'Dinner crowds can be heavier, so walk first and compare menus.',
      'Avoid seafood-heavy tourist sets if you want to stay in budget.',
      'Order shared dishes only if you know the final price.',
      'Keep phones and wallets secure in the crowd.',
    ],
    priceNote:
      'Prices are rough estimates. Seafood and tourist set meals can quickly exceed the planned budget.',
  },
  'batu-caves-lunch': {
    areaNote:
      'The practical food choice near Batu Caves is simple Indian vegetarian food around the temple area. Rani Vilas-style pricing is a good budget anchor.',
    nearbyFoods: [
      {
        name: 'Vegetarian set meal',
        description: 'Rice with vegetarian sides/curries. Filling lunch after the Batu Caves climb.',
        estimatedPrice: 'From RM 12',
      },
      {
        name: 'Thosai',
        description: 'Thin fermented crepe served with curry/chutney. Light and cheap.',
        estimatedPrice: 'RM 4–6.50',
      },
      {
        name: 'Masala thosai',
        description: 'Thosai filled with spiced potato. Better if you want a more filling option.',
        estimatedPrice: 'RM 6',
      },
      {
        name: 'Roti canai',
        description: 'Flatbread with curry. Cheap add-on or light meal.',
        estimatedPrice: 'RM 2.50–8',
      },
      {
        name: 'Vadai / samosa / karipap',
        description: 'Small snacks if you only need something quick.',
        estimatedPrice: 'RM 1–2.50 each',
      },
      {
        name: 'Teh / limau / Bru coffee',
        description: 'Simple drink options after the hot temple walk.',
        estimatedPrice: 'RM 2–5',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: 1 vegetarian set meal + 1 masala thosai or roti canai + 2 simple drinks = around RM 26–38. Add vadai if still hungry.',
    tips: [
      'Eat after climbing, not before, unless you need energy.',
      'Vegetarian food is common near the temple area.',
      'Ask if the curry is spicy.',
      'Do not over-order because you still need to travel back to KLCC.',
      'Buy water before leaving the area.',
    ],
    priceNote:
      'Rani Vilas delivery menu prices were used as a conservative price anchor; in-person prices may vary.',
  },
  'jalan-alor-dinner': {
    areaNote:
      'Jalan Alor is a famous Bukit Bintang food street. It is good for dinner, but it can become expensive if you order seafood, crab, prawns, or tourist combo sets.',
    nearbyFoods: [
      {
        name: 'Grilled chicken wings',
        description: 'One of the classic Jalan Alor items. Smoky, shareable, and safer than seafood for budget control.',
        estimatedPrice: 'Around RM 20 per order',
      },
      {
        name: 'Satay skewers',
        description: 'Grilled meat skewers with peanut sauce. Good shared side.',
        estimatedPrice: 'Around RM 16 for 10 pieces',
      },
      {
        name: 'Char kway teow',
        description: 'Stir-fried flat noodles. Good as one main dish.',
        estimatedPrice: 'Around RM 10–15',
      },
      {
        name: 'Fried rice / fried noodles',
        description: 'Simple filling option if you want to avoid seafood pricing.',
        estimatedPrice: 'RM 10–20',
      },
      {
        name: 'Coconut ice cream / mango dessert',
        description: 'Good dessert if there is still room in the budget.',
        estimatedPrice: 'RM 8–15',
      },
      {
        name: 'Seafood dishes',
        description: 'Available, but not recommended for this budget because seafood can be market-priced.',
        estimatedPrice: 'RM 22–40+ depending on item',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: grilled chicken wings + 1 char kway teow/fried noodles + 10 satay + water or one shared dessert = around RM 55–85.',
    tips: [
      'Read the menu before sitting.',
      'Avoid crab, prawns, large seafood platters, and “recommended sets” if not priced clearly.',
      'Order one round first. Add more only if still hungry.',
      'Water or one shared drink keeps the total lower.',
      'Keep the budget target visible: RM 60–90 for 2.',
    ],
    priceNote:
      'Recent guides show many Jalan Alor dishes around RM 10–40, with seafood often higher or market-priced.',
  },
  'melaka-jonker-lunch': {
    areaNote:
      'This is the old-town Melaka food zone near Dutch Square and Jonker Street. Best choices are chicken rice balls, Nyonya laksa, cendol, and simple local dishes.',
    nearbyFoods: [
      {
        name: 'Chicken rice balls',
        description: 'Melaka specialty: chicken rice served with rice shaped into balls.',
        estimatedPrice: 'RM 30–45 for 2 depending on portion',
      },
      {
        name: 'Nyonya laksa',
        description: 'Peranakan-style spicy coconut noodle soup. Good sit-down lunch.',
        estimatedPrice: 'RM 10–18',
      },
      {
        name: 'Asam laksa',
        description: 'Tangy fish-based noodle soup. Good if you like sour/spicy flavors.',
        estimatedPrice: 'RM 10–18',
      },
      {
        name: 'Cendol',
        description: 'Shaved ice dessert with coconut milk and gula Melaka.',
        estimatedPrice: 'RM 4–8',
      },
      {
        name: 'Nyonya kuih / pineapple tart',
        description: 'Small local sweets/snacks. Better as dessert or takeaway.',
        estimatedPrice: 'RM 3–10',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: chicken rice balls for 2 or 2 noodle bowls + 1 shared cendol/drink = around RM 38–58.',
    tips: [
      'Eat lunch first before buying random Jonker snacks.',
      'Chicken rice ball shops can queue; choose a cleaner/available shop if you are short on time.',
      'Cendol is good after lunch, but do not buy too many desserts before the river walk.',
      'Check if the shop accepts cash only.',
    ],
    priceNote:
      'Prices are rough estimates based on recent Melaka food guides and older published meal-price examples.',
  },
  'melaka-cendol': {
    areaNote:
      'This is a planned cooling break in the Jonker Street / Melaka old-town area. Keep it short and cheap.',
    nearbyFoods: [
      {
        name: 'Classic cendol',
        description: 'Shaved ice, coconut milk, pandan jelly, red beans, and gula Melaka.',
        estimatedPrice: 'RM 4–6',
      },
      {
        name: 'Nyonya cendol',
        description: 'Cendol variant with stronger Peranakan-style gula Melaka flavor.',
        estimatedPrice: 'RM 4–8',
      },
      {
        name: 'Durian cendol',
        description: 'Richer cendol with durian. Only buy if both people like durian.',
        estimatedPrice: 'RM 8–15',
      },
      {
        name: 'Air mata kucing / herbal drink',
        description: 'Light local drink if you do not want dessert.',
        estimatedPrice: 'RM 2–5',
      },
      {
        name: 'Coconut shake / fresh coconut',
        description: 'Refreshing option on a hot afternoon.',
        estimatedPrice: 'RM 6–10',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: 2 classic cendol, or 1 cendol + 1 coconut/herbal drink = around RM 10–22.',
    tips: [
      'This is a snack break, not a full meal.',
      'Classic cendol is usually the safest budget choice.',
      'Durian cendol costs more and is not for everyone.',
      'Sit down briefly, cool off, then continue walking.',
    ],
    priceNote:
      'Jonker-area cendol guides list common cendol around RM 4–8, with special/durian versions higher.',
  },
  'melaka-early-dinner': {
    areaNote:
      'This is the final Melaka meal before returning to Melaka Sentral. Choose filling but fast food. Do not risk a long queue.',
    nearbyFoods: [
      {
        name: 'Chicken rice balls',
        description: 'Safe Melaka specialty if you did not eat it at lunch.',
        estimatedPrice: 'RM 30–45 for 2 depending on portion',
      },
      {
        name: 'Nyonya laksa / asam laksa',
        description: 'Good one-bowl dinner before the bus ride.',
        estimatedPrice: 'RM 10–18 each',
      },
      {
        name: 'Fried noodles / Hokkien mee',
        description: 'Simple filling dinner option.',
        estimatedPrice: 'RM 12–20',
      },
      {
        name: 'Satay celup',
        description: 'Melaka specialty skewers dipped in satay sauce. Fun but can take longer and cost more if you order many sticks.',
        estimatedPrice: 'RM 1.35+ per skewer, sauce/setup can be extra depending on shop',
      },
      {
        name: 'Nyonya dish with rice',
        description: 'Good if you find a casual Peranakan shop and prices are clear.',
        estimatedPrice: 'RM 13–25 per dish',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: 2 simple mains + 1 shared drink = around RM 45–70. Skip satay celup if queue is long or if the return bus time is close.',
    tips: [
      'Leave enough time to Grab back to Melaka Sentral.',
      'Avoid any restaurant with a long queue after 5:30 PM.',
      'Ask for the bill early if service is slow.',
      'Do not order messy seafood before a bus ride.',
      'Set an alarm for the time you need to leave Jonker.',
    ],
    priceNote:
      'Prices are rough estimates. Satay celup can exceed budget if you order many skewers.',
  },
  'klia-breakfast': {
    areaNote:
      'KLIA food is more expensive than street food. Keep this as a light breakfast/snack, not a full restaurant meal.',
    nearbyFoods: [
      {
        name: 'Kaya toast / toast set',
        description: 'Easy airport breakfast. Good if you only need something light before boarding.',
        estimatedPrice: 'RM 8–15',
      },
      {
        name: 'Nasi lemak',
        description: 'Filling Malaysian airport meal. Can be much higher inside cafés.',
        estimatedPrice: 'RM 15–35',
      },
      {
        name: 'Chicken rice / rice meal',
        description: 'Simple full meal if you are already hungry before the flight.',
        estimatedPrice: 'RM 15–30',
      },
      {
        name: 'Coffee / teh tarik / white coffee',
        description: 'Airport café drinks are usually higher than kopitiam prices.',
        estimatedPrice: 'RM 8–12',
      },
      {
        name: 'Bun / pastry / sandwich',
        description: 'Fastest option if boarding time is close.',
        estimatedPrice: 'RM 8–18',
      },
      {
        name: 'Bottled water',
        description: 'Buy water if allowed before boarding or after security depending on airport rules.',
        estimatedPrice: 'RM 3–6',
      },
    ],
    suggestedOrderForTwo:
      'Budget order for 2: 2 light snacks/toast items + 1 shared drink or water = around RM 25–45. A full sit-down café meal for 2 can exceed RM 60.',
    tips: [
      'Eat before immigration/security if there are better food choices landside.',
      'Do not order a full meal if boarding time is close.',
      'Airport meals cost more, so keep it simple.',
      'Check the gate and walking time before sitting down.',
      'Water is more important than coffee before a flight.',
    ],
    priceNote:
      'Airport prices vary heavily by terminal, outlet, and whether you are before or after immigration.',
  },
};

const currentItinerary = {
  hero: {
    eyebrow: 'Travel Itinerary',
    title: "J&A Malaysia · Singapore Trip 2026",
    subtitle: 'July 11–14 · Malaysia & Singapore',
    meta: [],
    note: [],
  } satisfies HeroData,
  budgetSummary: [
    { label: 'July 12', amount: 'RM 130–200', php: 'PHP 2,023–3,111' },
    { label: 'July 13', amount: 'RM 165–265', php: 'PHP 2,567–4,123' },
    { label: 'July 14', amount: 'RM 280–393', php: 'PHP 4,356–6,113' },
    { label: 'July 15', amount: 'RM 25–45', php: 'PHP 389–700' },
    { label: 'Total for 2', amount: 'RM 600–903', php: 'PHP 9,334–14,047', featured: true },
    { label: 'Recommended cash', amount: 'RM 1,000', php: '~PHP 15,560', featured: true },
  ] satisfies BudgetCard[],
  legend: [
    { label: 'Train / LRT / MRT', color: '#378ADD' },
    { label: 'Bus', color: '#BA7517' },
    { label: 'Food', color: '#1D9E75' },
    { label: 'Tourist spot', color: '#7F77DD' },
    { label: 'Walk / Free', color: '#888780' },
    { label: 'Hotel / Grab', color: '#D4537E' },
  ] satisfies LegendItem[],
  days: [
    {
      day: 11,
      title: 'FLIGHT DAY · July 11',
      budgetLabel: 'Travel Day',
      outfitTip: {
        wear: {
          male: ['Sweatpants or joggers', 'Plain t-shirt', 'Light jacket', '👞 Closed shoes today — travel shoes for the flight'],
          female: ['Loose co-ord set or jogger pants', 'Cardigan or light hoodie', '👞 Closed shoes today — travel shoes for the flight'],
        },
        avoid: {
          male: ['Jeans — too stiff and hot for hours on a plane, you\'ll regret it by hour 3'],
          female: ['Tight clothes or bodycon — you\'ll be sitting for hours, circulation suffers on long flights'],
        },
      },
      items: [
        {
          time: '11:55 AM',
          id: 'day11-flight-mnl',
          guideKey: 'flight-departs',
          title: 'Flight to Manila',
          category: 'train',
          description: [
            text('Depart for Manila.'),
          ],
          tags: [
            tag('Transit', 'train'),
          ],
          mapQuery: 'NAIA Manila',
        },
        {
          time: '8:05 PM',
          id: 'day11-flight-kl',
          guideKey: 'arrive-klia',
          title: 'Flight to Kuala Lumpur',
          category: 'train',
          description: [
            text('Depart Manila, arrive KLIA at 12:10 AM July 12.'),
          ],
          tags: [
            tag('Transit', 'train'),
          ],
          mapQuery: 'KLIA',
        },
      ],
    },
    {
      day: 12,
      title: 'DAY 1 · July 12',
      budgetLabel: 'WAKE UP TIME: 8:30 AM',
      outfitTip: {
        wear: {
          male: ['Chinos or lightweight trousers', 'Polo or collared shirt', '👟 Birkenstocks today — long flat city walk, no tricky terrain'],
          female: ['Linen pants or light sundress', 'Breathable top', '👟 Birkenstocks today — long flat city walk, no tricky terrain', 'Small crossbody bag'],
        },
        avoid: {
          male: ['Sleeveless shirts or tank tops — Petronas observation deck has a smart casual dress code, you\'ll be turned away at the entrance'],
          female: ['Tight or heavy fabric — KL heat and humidity will make it unbearable by mid-afternoon', 'Large backpack in crowded streets — Petaling Street is packed, easy target for bag snatching'],
        },
      },
images: [
      { title: 'Kuala Lumpur Skyline', url: '/day12-kl-skyline.webp', label: 'CITY VIEW' },
    ],
      items: [
        {
          time: '9:30 AM',
          id: 'day12-brunch',
          guideKey: 'breakfast-near-chinatown',
          title: 'Late Morning Brunch in Chinatown',
          category: 'food',
          description: [
            text('Wake up refreshed, step out of Travelodge, and head straight to a nearby aesthetic cafe or a heritage coffee shop around Jalan Sultan for a hearty brunch and a cold iced drink.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Chinatown Kuala Lumpur',
          foodGuideKey: 'chinatown-breakfast',
        },
        {
          time: '10:45 AM',
          id: 'day12-kwai-chai-hong',
          guideKey: 'kwai-chai-hong',
          title: 'Kwai Chai Hong Hidden Lanes',
          category: 'spot',
          description: [
            text('Wander the beautifully restored brick alleyways right behind Petaling Street to see the creative murals, interactive setups, and minimalist-style storefronts.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Kwai Chai Hong Kuala Lumpur',
        },
        {
          time: '12:00 PM',
          id: 'day12-petaling',
          guideKey: 'petaling-street',
          title: 'Jalan Petaling Street Walk',
          category: 'spot',
          description: [
            text('Stroll through the high-energy stalls under the green canopy roof to experience the sights and sounds of the local market rows.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Petaling Street',
        },
        {
          time: '1:00 PM',
          id: 'day12-rexkl',
          guideKey: 'rexkl-bookxcess-maze',
          title: 'REXKL BookXcess Maze',
          category: 'spot',
          description: [
            text('Step into the raw, industrial layout of REXKL to explore the complex, towering multi-level maze of floor-to-ceiling bookshelves.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'REXKL Kuala Lumpur',
        },
        {
          time: '2:00 PM',
          id: 'day12-central-market',
          guideKey: 'central-market',
          title: 'Central Market & Kasturi Walk',
          category: 'spot',
          description: [
            text('Walk right over to Kasturi Walk under its giant traditional kite roof, then step into the air-conditioned aisles of Central Market. Browsing now ensures all the local artisanal booths and boutique souvenir shops are fully open and active.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Central Market Kuala Lumpur',
        },
        {
          time: '3:00 PM',
          id: 'day12-merdeka',
          guideKey: 'merdeka-square-river-of-life',
          title: 'Merdeka Square & River of Life',
          category: 'spot',
          description: [
            text('Take a late afternoon walk across the open grass of Merdeka Square to admire the copper domes of the Sultan Abdul Samad Building, and view the historic convergence at the Jamek Mosque riverbank.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Merdeka Square Kuala Lumpur',
        },
        {
          time: '4:00 PM',
          id: 'day12-transit-towers',
          guideKey: 'lrt-to-klcc',
          title: 'Transit to the Towers',
          category: 'train',
          description: [
            text('Drop bags at Travelodge; walk behind the hotel into Pasar Seni LRT Station. Tap in and board the Kelana Jaya Line heading toward Gombak. Direct 4-stop rail run underneath the city traffic. Arrive at KLCC and follow signs to the lower ground concourse check-in.'),
          ],
          tags: [
            tag('LRT', 'train'),
          ],
          mapQuery: 'Pasar Seni LRT Station',
        },
        {
          time: '4:30 PM',
          id: 'day12-twin-towers',
          guideKey: 'petronas-twin-towers-klcc',
          title: 'Petronas Twin Towers Indoor Tour',
          category: 'spot',
          description: [
            text('Ascend the high-speed elevators to the iconic SkyBridge connecting the two towers, then continue up to the 86th Floor Observation Deck. At this time, you get brilliant, clear afternoon light to map out the city layout, which transitions beautifully toward golden hour.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Petronas Twin Towers',
        },
        {
          time: '6:15 PM',
          id: 'day12-klcc-park',
          guideKey: 'klcc-park-suria-klcc',
          title: 'KLCC Park & The Transition to Night',
          category: 'spot',
          description: [
            text('Step outside into the cooler evening air. Walk the clean footpaths of KLCC Park to capture exterior photos of the steel structures. You will get to watch them completely transition into their glowing, illuminated night state. At 07:30 PM, secure a spot by the water to watch the musical Lake Symphony fountain show kick off.'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'KLCC Park',
        },
        {
          time: '7:45 PM',
          id: 'day12-transit-back',
          guideKey: 'lrt-back-to-pasar-seni',
          title: 'Transit back to Chinatown',
          category: 'train',
          description: [
            text('Take the direct Kelana Jaya Line train 4 stops from KLCC straight back to Pasar Seni.'),
          ],
          tags: [
            tag('LRT', 'train'),
          ],
          mapQuery: 'KLCC Station',
        },
        {
          time: '8:15 PM',
          id: 'day12-dinner',
          guideKey: 'dinner-in-chinatown',
          title: 'Relaxed Dinner',
          category: 'food',
          description: [
            text('Sit down for a fantastic local dinner at a lively evening spot in Chinatown to celebrate a perfect, stress-free first day in the city.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Chinatown Kuala Lumpur',
          foodGuideKey: 'chinatown-dinner',
        },
      ],
    },
    {
      day: 13,
      title: 'DAY 2 · July 13',
      budgetLabel: 'WAKE UP TIME: 4:30 AM',
      outfitTip: {
        wear: {
          male: ['Long pants', 'T-shirt with sleeves', '👞 Wear your closed shoes today — 272 steep steps at Batu Caves, stone gets wet and slippery', 'Light jacket in bag for Genting'],
          female: ['Loose pants or midi skirt (knee-length or longer)', 'Top covering shoulders', '👞 Wear your closed shoes today — 272 steep steps at Batu Caves, stone gets wet and slippery', 'Light jacket in bag for Genting'],
        },
        avoid: {
          male: ['Shorts — you will be stopped at the Batu Caves and Chin Swee entrance and asked to wrap a sarong', 'Sleeveless or tank tops — temples require covered shoulders, you\'ll be turned away', 'White clothing — cave dust and pigeon droppings on the steps will ruin it', 'Birkenstocks — the 272 steps are steep and the stone gets wet, your closed shoes are the call today'],
          female: ['Short skirts or mini dresses — you will be stopped at the temple entrance and given a sarong to wrap', 'Sleeveless tops — temples require covered shoulders or you\'ll be turned away', 'White clothing — cave dust and pigeon droppings on the steps will ruin it', 'Birkenstocks — the 272 steps are steep and the stone gets wet, your closed shoes are the call today'],
        },
      },
images: [
      { title: 'Batu Caves Shrine', url: '/day13-batu-caves.webp', label: 'MORNING ASCENT' },
      { title: 'Saloma Link Bridge', url: '/day13-saloma-bridge.webp', label: 'NIGHT ILLUMINATION' },
    ],
      items: [
        {
          time: '5:30 AM',
          id: 'day13-breakfast',
          guideKey: 'restoran-yusoof-dan-zakhir',
          title: 'Light breakfast',
          category: 'food',
          description: [
            text('Step out of Travelodge to Restoran Yusoof Dan Zakhir right next door. Grab a quick, hot Roti Canai and Teh Tarik to fuel up.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Restoran Yusoof Dan Zakhir Kuala Lumpur',
          foodGuideKey: 'simple-hotel-breakfast',
        },
        {
          time: '5:50 AM',
          id: 'day13-walk-pasar-seni',
          guideKey: 'lrt-to-kl-sentral',
          title: 'Walk to Pasar Seni LRT Station',
          category: 'walk',
          description: [
            text('Walk right behind your hotel into Pasar Seni LRT Station. Take the Kelana Jaya Line 1 stop to KL Sentral (approx. 3 minutes).'),
          ],
          tags: [
            tag('Walk', 'walk'),
          ],
          mapQuery: 'Pasar Seni LRT Station',
        },
        {
          time: '6:00 AM',
          id: 'day13-transfer-ktm',
          guideKey: 'lrt-pasar-seni-to-kl-sentral',
          title: 'Transfer to KTM Komuter',
          category: 'train',
          description: [
            text('Tap out of the LRT gates at KL Sentral and follow the blue overhead signs pointing to the KTM Komuter departure gates. Buy a cash token or tap your Touch n Go card at the turnstiles for the Batu Caves Line.'),
          ],
          tags: [
            tag('Train', 'train'),
          ],
          mapQuery: 'KL Sentral Station',
        },
        {
          time: '6:15 AM',
          id: 'day13-board-train',
          guideKey: 'ktm-komuter-to-batu-caves',
          title: 'Board the Train',
          category: 'train',
          description: [
            text('Walk down to the platform and locate the train. Keep an eye out for the Ladies-Only coaches (marked with bright pink platform and window stickers) if you want a quieter, highly comfortable ride.'),
          ],
          tags: [
            tag('Train', 'train'),
          ],
          mapQuery: 'KL Sentral Station',
        },
        {
          time: '6:25 AM',
          id: 'day13-catch-train',
          guideKey: 'ktm-komuter-to-batu-caves',
          title: 'Catch the early train',
          category: 'train',
          description: [
            text('Board the early morning KTM Komuter train. The train ride is a direct, peaceful 32-minute journey that cuts straight through the northern suburbs of the city.'),
          ],
          tags: [
            tag('Train', 'train'),
          ],
          mapQuery: 'KL Sentral Station',
        },
        {
          time: '7:00 AM',
          id: 'day13-arrive-batu',
          guideKey: 'batu-caves',
          title: 'Arrive at Batu Caves',
          category: 'spot',
          description: [
            text('Step off the train at the Batu Caves KTM Station. The temple gates and the giant golden statue are located just a short 2-minute flat walk right outside the station exit. Climb the 272 colorful steps, meet the cheeky macaques, and explore the towering cave temples.'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Batu Caves',
        },
        {
          time: '8:30 AM',
          id: 'day13-genting',
          guideKey: 'awana-skyway',
          title: 'Go to Genting Island',
          category: 'bus',
          description: [
            text('Option A: Order a direct Grab car right from the Batu Caves lot straight to the Awana SkyCentral cable car station (approx. 35-45 mins). Option B: Take a 10-minute Grab to Gombak LRT Station and hop on a pre-booked express bus heading up the mountain.'),
          ],
          tags: [
            tag('Grab', 'bus'),
          ],
          mapQuery: 'Awana SkyCentral',
        },
        {
          time: '9:30 AM',
          id: 'day13-cable-car',
          guideKey: 'chin-swee-caves-temple',
          title: 'Cable Car & Misty Mountain Temple',
          category: 'spot',
          description: [
            text('Board the Awana SkyWay cable car. Use the free midway stop to hop off at Chin Swee Station. Walk the peaceful, misty terraces of the Chin Swee Caves Temple and take photos by its iconic 9-story pagoda.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Chin Swee Caves Temple',
        },
        {
          time: '11:00 AM',
          id: 'day13-peak',
          guideKey: 'skyavenue-mall',
          title: 'Peak Exploration & SkyAvenue Lunch',
          category: 'food',
          description: [
            text('Ride the cable car to the peak inside SkyAvenue Mall. Grab a beautiful lunch at an aesthetic cafe, check out the futuristic indoor neon tracks of Skytropolis, or ride back down one stop for an open-air retail walk at the Genting Highlands Premium Outlets. Celebrate Anniversary at a cute Cafe or eat Steak!'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'SkyAvenue Mall',
          foodGuideKey: 'melaka-jonker-lunch',
        },
        {
          time: '4:30 PM',
          id: 'day13-return-kl',
          guideKey: 'genting-island-transfer',
          title: 'Return to Kuala Lumpur & Refresh',
          category: 'bus',
          description: [
            text('Take the cable car back down to the base and grab an express bus or a Grab car straight back to Travelodge to quickly drop off any mountain gear, freshen up, and prepare for your night out.'),
          ],
          tags: [
            tag('Grab', 'bus'),
          ],
          mapQuery: 'Travelodge Kuala Lumpur City Centre',
        },
        {
          time: '5:45 PM',
          id: 'day13-rest',
          guideKey: 'check-in',
          title: 'Rest',
          category: 'hotel',
          description: [
            text('Rest.'),
          ],
          tags: [
            tag('Rest', 'hotel'),
          ],
          mapQuery: 'Travelodge Kuala Lumpur City Centre',
        },
        {
          time: '7:00 PM',
          id: 'day13-jalan-alor',
          guideKey: 'jalan-alor',
          title: 'Jalan Alor Night Market',
          category: 'food',
          description: [
            text('A quick Grab or MRT ride down to Bukit Bintang Station. The 500-meter stretch is in full swing by now under a canopy of glowing red lanterns. It is loud, high-energy, and smells amazing. Sit down at one of the busy, plastic-table stalls for an incredible street seafood dinner. Do not miss the famous Wong Ah Wah grilled chicken wings, sizzling satay skewers, or a refreshing plate of local coconut ice cream.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Jalan Alor Kuala Lumpur',
          foodGuideKey: 'jalan-alor-dinner',
        },
        {
          time: '9:00 PM',
          id: 'day13-return-mrt',
          guideKey: 'mrt-back-to-pasar-seni',
          title: 'Return to Pasar Seni via MRT',
          category: 'train',
          description: [
            text('Return to Pasar Seni via MRT for a well-deserved, deep sleep.'),
          ],
          tags: [
            tag('MRT', 'train'),
          ],
          mapQuery: 'Bukit Bintang MRT Station',
        },
      ],
    },
    {
      day: 14,
      title: 'DAY 3 · July 14',
      budgetLabel: 'WAKE UP TIME: 4:30 AM',
      outfitTip: {
        wear: {
          male: ['Long pants', 'T-shirt or light button-up', '👟 Birkenstocks today — cobblestone streets all day, and easy slip-off at the mosque', 'Hat or cap for the sun'],
          female: ['Maxi skirt or loose pants', 'Top covering shoulders', 'Light scarf for hair at the mosque', '👟 Birkenstocks today — cobblestone streets and easy slip-off at the mosque entrance', 'Hat or small umbrella'],
        },
        avoid: {
          male: ['Shorts — you will be refused entry to the Melaka Straits Mosque, no exceptions', 'Sleeveless tops — mosque requires covered shoulders, staff will stop you at the gate'],
          female: ['Short skirts or shorts — you will be refused entry to the mosque', 'Sleeveless tops — mosque requires covered shoulders', 'Bare hair inside the mosque — bring a light scarf or they\'ll hand you one at the entrance'],
        },
      },
      items: [
        {
          time: '6:00 AM',
          id: 'day14-breakfast',
          guideKey: 'simple-breakfast-near-hotel',
          title: 'Quick Morning Breakfast',
          category: 'food',
          description: [
            text('Keep it fast, light, and cheap near Travelodge / Pasar Seni.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Travelodge Kuala Lumpur City Centre',
          foodGuideKey: 'simple-hotel-breakfast',
        },
        {
          time: '6:15 AM',
          id: 'day14-transit-melaka',
          guideKey: 'bus-to-melaka-sentral',
          title: 'Transit to Melaka',
          category: 'bus',
          description: [
            text('Walk behind your hotel into Pasar Seni Station. Take the rail link down to Terminal Bersepadu Selatan (TBS) and board your morning express bus straight down to Melaka (approx. 2 hours).'),
          ],
          tags: [
            tag('Bus', 'bus'),
          ],
          mapQuery: 'Terminal Bersepadu Selatan (TBS)',
        },
        {
          time: '9:30 AM',
          id: 'day14-dutch-square',
          guideKey: 'dutch-square-red-square',
          title: 'The Historic Red Core & Sultanate Palace',
          category: 'spot',
          description: [
            text('Explore Dutch Square, walk up St Paul\'s Hill, and tour the striking wooden architecture of the Melaka Sultanate Palace Museum.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Dutch Square Malacca',
        },
        {
          time: '11:30 AM',
          id: 'day14-jonker-lunch',
          guideKey: 'lunch-near-jonker-dutch-square',
          title: 'Jonker Street & Peranakan Lunch',
          category: 'food',
          description: [
            text('Cross the river into the historic townhouse lanes of Jonker Street. Sit down at a heritage cafe for traditional Melaka chicken rice balls or an authentic Nyonya lunch. Afterward, tour the beautifully preserved Baba & Nyonya Heritage Museum to see the stunning inner courtyards and antique collections of an old affluent estate.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Jonker Street Malacca',
          foodGuideKey: 'melaka-jonker-lunch',
        },
        {
          time: '1:30 PM',
          id: 'day14-maritime-museum',
          guideKey: 'maritime-museum',
          title: 'Maritime Museum',
          category: 'spot',
          description: [
            text('Exploration Walk back toward the river mouth to explore the Maritime Museum, uniquely housed entirely inside a massive, towering replica of the historic Portuguese ship Flor de la Mar.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Maritime Museum Melaka',
        },
        {
          time: '2:30 PM',
          id: 'day14-river-cruise',
          guideKey: 'melaka-river-cruise',
          title: 'The Melaka River Cruise',
          category: 'spot',
          description: [
            text('Step right onto the boat at the Melaka River Cruise Jetty located directly adjacent to the ship museum. This 45-minute round-trip boat ride provides a beautiful, breezy break from walking. You will glide up the clean river layout, passing underneath historic old bridges, spotting the traditional wooden houses of Kampung Morten, and taking in the sweeping, massive street-art murals that tell the story of the city\'s ancient trade roots.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Melaka River Cruise Jetty',
        },
        {
          time: '3:30 PM',
          id: 'day14-river-walk',
          guideKey: 'melaka-river-walk',
          title: 'Riverside Walk & Coffee Break',
          category: 'food',
          description: [
            text('Step off the boat and take a slow stroll along the clean, tree-shaded wooden boardwalks. Find a small, hidden riverside cafe to enjoy an ice-cold local drink or a signature Nyonya Cendol (shaved ice dessert with palm sugar and coconut milk) right next to the water.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Melaka River Walk',
          foodGuideKey: 'melaka-cendol',
        },
        {
          time: '5:00 PM',
          id: 'day14-straits-mosque',
          guideKey: 'melaka-straits-mosque',
          title: 'Golden Hour at the Floating Mosque',
          category: 'spot',
          description: [
            text('Take a quick 10-minute Grab car over to the Melaka Straits Mosque on Malacca Island. Walking the perimeter platforms right as the late afternoon sun casts a warm glow over its gold-and-blue dome over the sea is the ultimate grand finale to your sightseeing.'),
          ],
          tags: [
            tag('Spot', 'spot'),
          ],
          mapQuery: 'Melaka Straits Mosque',
        },
        {
          time: '5:30 PM',
          id: 'day14-transit-sentral',
          guideKey: 'bus-to-tbs',
          title: 'Transit to Melaka Sentral',
          category: 'bus',
          description: [
            text('Take your comfortable express bus transit from Melaka Sentral back to TBS terminal in KL, then hop onto the rail straight back to Pasar Seni Station.'),
          ],
          tags: [
            tag('Bus', 'bus'),
          ],
          mapQuery: 'Melaka Sentral',
        },
        {
          time: '6:30 PM',
          id: 'day14-return-bus',
          guideKey: 'bus-to-tbs',
          title: 'Return Bus to Kuala Lumpur',
          category: 'bus',
          description: [
            text('Board your evening express bus for a smooth, air-conditioned ride back to the TBS terminal in KL, then catch the rail link straight back to Pasar Seni Station.'),
          ],
          tags: [
            tag('Bus', 'bus'),
          ],
          mapQuery: 'Melaka Sentral',
        },
        {
          time: '8:30 PM',
          id: 'day14-late-dinner',
          guideKey: 'early-dinner-in-malacca',
          title: 'Relaxed Late Dinner',
          category: 'food',
          description: [
            text('Sit down for a comforting, easy late-night dinner right near the hotel to unwind from the travel day.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Travelodge Kuala Lumpur City Centre',
          foodGuideKey: 'melaka-early-dinner',
        },
        {
          time: '9:00 PM',
          id: 'day14-final-pack',
          guideKey: 'check-out-travelodge',
          title: 'Final Pack',
          category: 'hotel',
          description: [
            text('Head up to your room at Travelodge to smoothly pack your things, double-check your passports, and get a great night\'s rest before your flight to Singapore the next morning!'),
          ],
          tags: [
            tag('Hotel', 'hotel'),
          ],
          mapQuery: 'Travelodge Kuala Lumpur City Centre',
        },
      ],
    },
    {
      day: 15,
      title: 'DAY 4 · July 15 — KL to Singapore',
      budgetLabel: 'WAKE UP TIME: 4:00 AM',
      outfitTip: {
        wear: {
          male: ['Long pants', 'Collared or sleeved shirt', '👟 Birkenstocks today — you remove shoes at the Hindu temple, slip-off is ideal', 'Light jacket for evening at Gardens by the Bay'],
          female: ['Maxi dress or wide-leg pants + sleeved top', 'Light scarf for hair at Sultan Mosque', '👟 Birkenstocks today — you remove shoes at the Hindu temple, slip-off is ideal'],
        },
        avoid: {
          male: ['Shorts — you\'ll be turned away at both Sri Veeramakaliamman Temple and Sultan Mosque', 'Sleeveless tops — both the Hindu temple and mosque require covered shoulders'],
          female: ['Short skirts or shorts — refused entry at both the Hindu temple and Sultan Mosque', 'Sleeveless tops — both require covered shoulders, no exceptions', 'Bare hair inside Sultan Mosque — a scarf is provided at the entrance but bring your own to be safe'],
        },
      },
      items: [
        {
          time: '3:15 AM',
          id: 'day15-wake-up',
          guideKey: 'wake-up',
          title: 'Wake up',
          category: 'hotel',
          description: [
            text('Wake up, final packing, check passports.'),
          ],
          tags: [
            tag('Hotel', 'hotel'),
          ],
          mapQuery: 'Travelodge Kuala Lumpur City Centre',
        },
        {
          time: '3:45 AM',
          id: 'day15-check-out',
          guideKey: 'check-out-travelodge',
          title: 'Check out Travelodge',
          category: 'hotel',
          description: [
            text('Check out of the Travelodge front desk. Walk right out the back door and straight into Pasar Seni LRT Station.'),
          ],
          tags: [
            tag('Hotel', 'hotel'),
          ],
          mapQuery: 'Travelodge Kuala Lumpur City Centre',
        },
        {
          time: '4:00 AM',
          id: 'day15-grab-klia',
          guideKey: 'grab-to-klia',
          title: 'Transit to KLIA',
          category: 'train',
          description: [
            text('Option 1 VIA TRAIN: 1-stop LRT to KL Sentral, then KLIA Ekspres (33 mins) to KLIA Terminal 1. Option 2 VIA GRAB: direct car from Travelodge to KLIA (approx. 50-60 mins).'),
          ],
          tags: [
            tag('Transit', 'train'),
          ],
          mapQuery: 'Kuala Lumpur International Airport (KLIA)',
        },
        {
          time: '6:13 AM',
          id: 'day15-arrive-klia',
          guideKey: 'klia-check-in',
          title: 'Arrive at KLIA',
          category: 'train',
          description: [
            text('Arrive at KLIA, clear the airport flow, and get ready for the flight to Singapore.'),
          ],
          tags: [
            tag('Transit', 'train'),
          ],
          mapQuery: 'Kuala Lumpur International Airport (KLIA)',
        },
        {
          time: '8:00 AM',
          id: 'day15-flight-sg',
          guideKey: 'flight-departs',
          title: 'Flight KL to Singapore',
          category: 'train',
          description: [
            text('Board flight from KLIA to Singapore Changi Airport. Approx. 1 hour flight.'),
          ],
          tags: [
            tag('Transit', 'train'),
          ],
          mapQuery: 'Changi Airport',
        },
        {
          time: '11:00 AM',
          id: 'day15-land-sg',
          guideKey: 'klia-transit-back-to-kl-sentral',
          title: 'Land & Transit to Hotel',
          category: 'train',
          description: [
            text('Touch down at Changi Airport. Take the green East-West Line MRT train 6 stops directly to Paya Lebar MRT Station. Head straight to Hotel Classic by Venue to drop off your day packs.'),
          ],
          tags: [
            tag('MRT', 'train'),
          ],
          mapQuery: 'Paya Lebar MRT Station',
        },
        {
          time: '12:15 PM',
          id: 'day15-geylang-lunch',
          guideKey: 'breakfast-near-hotel',
          title: 'Hawker Lunch at Geylang Serai',
          category: 'food',
          description: [
            text('Walk 3 minutes from your hotel to the Geylang Serai Market & Food Centre for a cheap, authentic plate of Nasi Padang or Mee Rebus.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Geylang Serai Market & Food Centre',
          foodGuideKey: 'chinatown-lunch',
        },
        {
          time: '1:15 PM',
          id: 'day15-little-india',
          guideKey: 'a-famosa-porta-de-santiago',
          title: 'The Vibrant Sights of Little India',
          category: 'spot',
          description: [
            text('Take the MRT from Paya Lebar to Little India MRT Station. Step out into a burst of color and fragrance. Walk down Serangoon Road to admire the intensely detailed, multi-colored carvings on the roof of the Sri Veeramakaliamman Temple. Walk over to the House of Tan Teng Niah, the last surviving Chinese villa in Little India, painted in a striking, vibrant rainbow of colors.'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Little India Singapore',
        },
        {
          time: '3:00 PM',
          id: 'day15-haji-lane',
          guideKey: 'harmony-street-jonker-street',
          title: 'Haji Lane & Sultan Mosque',
          category: 'spot',
          description: [
            text('Take a quick 1-stop MRT ride or walk over to Kampong Glam. Stroll down Haji Lane to see its massive graffiti murals, and walk out to Bussorah Street to frame a gorgeous photo of the golden domes of the Sultan Mosque.'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Haji Lane Singapore',
        },
        {
          time: '5:00 PM',
          id: 'day15-gardens-bay',
          guideKey: 'klcc-park-suria-klcc',
          title: 'Gardens by the Bay Outdoor Loop',
          category: 'spot',
          description: [
            text('Head down to the Gardens via MRT. Skip the expensive indoor ticketed domes and explore the massive outdoor themed landscapes, dragonfly lake boardwalks, and the towering Supertree Grove completely for free.'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Gardens by the Bay',
        },
        {
          time: '7:45 PM',
          id: 'day15-garden-rhapsody',
          guideKey: 'saloma-bridge',
          title: 'Garden Rhapsody Light Show',
          category: 'spot',
          description: [
            text('Secure a spot on the open-air benches right beneath the giant illuminated Supertrees to watch them dance to a dramatic symphony of lights and music.'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Supertree Grove',
        },
        {
          time: '8:30 PM',
          id: 'day15-helix-bridge',
          guideKey: 'klcc-to-bukit-bintang-walkway',
          title: 'Helix Bridge to Spectra Light Show',
          category: 'walk',
          description: [
            text('Cross the beautifully lit geometric arches of the Helix Bridge over to the Marina Bay Sands waterfront to catch the 09:00 PM Spectra Laser & Water Show.'),
          ],
          tags: [
            tag('Walk', 'walk'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Helix Bridge Singapore',
        },
        {
          time: '9:15 PM',
          id: 'day15-late-dinner',
          guideKey: 'dinner-in-chinatown',
          title: 'Late Dinner & Return to Hotel',
          category: 'food',
          description: [
            text('Grab cheap satay skewers at Makansutra Gluttons Bay right by the water, then take a direct MRT or Grab straight back to Hotel Classic by Venue.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Makansutra Gluttons Bay',
          foodGuideKey: 'jalan-alor-dinner',
        },
      ],
    },
    {
      day: 16,
      title: 'DAY 5 · July 16 — Singapore City & Departure',
      budgetLabel: 'WAKE UP TIME: 5:00 AM',
      outfitTip: {
        wear: {
          male: ['Long pants', 'T-shirt or collared shirt', '👟 Birkenstocks for the morning — easy slip-off at Buddha Tooth Relic Temple', 'Light jacket for airport and flight'],
          female: ['Pants or midi skirt covering knees', 'Top covering shoulders', '👟 Birkenstocks for the morning — easy slip-off at Buddha Tooth Relic Temple', 'Light jacket for airport and flight'],
        },
        avoid: {
          male: ['Shorts — Buddha Tooth Relic Temple requires knees covered, you\'ll be stopped at the door', 'Sleeveless tops — temple requires covered shoulders', 'Heavy or bulky clothes — you\'re changing into travel clothes at 8:30 AM anyway, no point layering up now'],
          female: ['Short skirts or shorts — Buddha Tooth Relic Temple will turn you away or hand you a wrap', 'Sleeveless tops — temple requires covered shoulders'],
        },
      },
      items: [
        {
          time: '5:00 AM',
          id: 'day16-wake-up',
          guideKey: 'wake-up',
          title: 'Morning Prep Only',
          category: 'hotel',
          description: [
            text('Wake up early while the air is crisp. Give yourself a relaxed 30 minutes to wash up, get dressed in your walking clothes, and lace up your shoes. No need to touch your suitcases yet, as you will return to pack later.'),
          ],
          tags: [
            tag('Hotel', 'hotel'),
          ],
          mapQuery: 'Hotel Classic by Venue',
        },
        {
          time: '5:30 AM',
          id: 'day16-transit-mrt',
          guideKey: 'lrt-to-klcc',
          title: 'Early Morning Transit to Downtown',
          category: 'train',
          description: [
            text('Walk directly from the hotel to Paya Lebar MRT Station. Board the very first eastbound green line train heading towards downtown. Ride it 6 stops straight to Raffles Place Station.'),
          ],
          tags: [
            tag('MRT', 'train'),
          ],
          mapQuery: 'Paya Lebar MRT Station',
        },
        {
          time: '6:00 AM',
          id: 'day16-merlion',
          guideKey: 'river-of-life-masjid-jamek-area',
          title: 'Merlion Sunrise Experience',
          category: 'spot',
          description: [
            text('Walk out onto the completely empty waterfront boardwalk at Merlion Park. At this hour, the sky will transition from deep indigo to warm golden hues right over Marina Bay Sands. You will have the iconic concrete Merlion statue entirely to yourselves for pristine, crowd-free photos.'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Merlion Park Singapore',
        },
        {
          time: '7:15 AM',
          id: 'day16-kaya-breakfast',
          guideKey: 'breakfast-near-chinatown',
          title: 'Traditional Kaya Toast Breakfast',
          category: 'food',
          description: [
            text('Walk right off the boardwalk to a nearby local coffee branch like Ya Kun Kaya Toast or Toast Box right in the Raffles Place financial core. Enjoy hot charcoal toast slathered with coconut jam and thick slabs of cold butter, soft-boiled eggs, and a strong cup of hot Kopi or Teh.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Raffles Place Singapore',
          foodGuideKey: 'chinatown-breakfast',
        },
        {
          time: '8:00 AM',
          id: 'day16-return-hotel',
          guideKey: 'lrt-back-to-pasar-seni',
          title: 'Rail Transit Back to Hotel',
          category: 'train',
          description: [
            text('Hop back onto the green MRT line at Raffles Place Station and take the direct train back to Paya Lebar Station.'),
          ],
          tags: [
            tag('MRT', 'train'),
          ],
          mapQuery: 'Raffles Place Singapore',
        },
        {
          time: '8:30 AM',
          id: 'day16-freshen-up',
          guideKey: 'check-in',
          title: 'Freshen Up & Pack Things',
          category: 'hotel',
          description: [
            text('Go back up to your room at Hotel Classic. Use this dedicated 1-hour block to take a relaxing shower, brush your teeth, change out of your walking clothes, do a final sweep for chargers, and zip up your suitcases. Check out completely at the front desk and leave your heavy bags for free with the lobby concierge.'),
          ],
          tags: [
            tag('Hotel', 'hotel'),
          ],
          mapQuery: 'Hotel Classic by Venue',
        },
        {
          time: '9:30 AM',
          id: 'day16-joo-chiat',
          guideKey: 'kwai-chai-hong',
          title: 'Joo Chiat Historical Shophouse Roam',
          category: 'spot',
          description: [
            text('Walk 5 minutes from the lobby over to Koon Seng Road. This famous strip features a row of 1920s heritage shophouses adorned with intricate geometric tiles, floral motifs, and ornate pillars. The bright morning light will hit the pastel pink, mint, and yellow facades beautifully. Wander past the classic corner architecture along Joo Chiat Road. Swing by Kim Choo Kueh Chang to look at traditional Nyonya crafts.'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Koon Seng Road Singapore',
        },
        {
          time: '11:00 AM',
          id: 'day16-checkout',
          guideKey: 'check-out-travelodge',
          title: 'Official Hotel Checkout',
          category: 'hotel',
          description: [
            text('Head back up to your room, grab your zipped suitcases, and officially check out at the front desk well before the noon deadline. Leave your heavy bags for free with the hotel lobby concierge so you can travel hands-free.'),
          ],
          tags: [
            tag('Hotel', 'hotel'),
          ],
          mapQuery: 'Hotel Classic by Venue',
        },
        {
          time: '11:30 AM',
          id: 'day16-chinatown-sg',
          guideKey: 'merdeka-square-river-of-life',
          title: 'Chinatown Heritage Murals & Tooth Relic Temple',
          category: 'spot',
          description: [
            text('Take the direct Downtown MRT line straight from your hotel area into Chinatown Station. Explore the magnificent, multi-story architecture of the Buddha Tooth Relic Temple (ensure shoulders and knees are covered). Take a slow stroll down Sago Street and Mohamed Ali Lane to spot the hand-painted heritage street murals. Keep an eye out for the traditional Ice Cream Uncles parked under the awnings!'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Chinatown Singapore',
        },
        {
          time: '1:00 PM',
          id: 'day16-hawker-lunch',
          guideKey: 'lunch-in-chinatown',
          title: 'Pre-Airport Hawker Lunch',
          category: 'food',
          description: [
            text('Head straight into the bustling Chinatown Complex Food Centre for a cheap, fast, and intensely flavorful final local meal.'),
          ],
          tags: [
            tag('Food', 'food'),
          ],
          mapQuery: 'Chinatown Complex Food Centre Singapore',
          foodGuideKey: 'chinatown-lunch',
        },
        {
          time: '2:00 PM',
          id: 'day16-airport-run',
          guideKey: 'klia-transit-back-to-kl-sentral',
          title: 'Collect Suitcases & Airport Run',
          category: 'train',
          description: [
            text('Take the direct MRT from Chinatown back to Paya Lebar Station and walk into the hotel lobby to collect your stored luggage. Walk right back to the platform turnstiles and catch the green East-West Line train heading directly east toward Changi Airport.'),
          ],
          tags: [
            tag('MRT', 'train'),
          ],
          mapQuery: 'Changi Airport',
        },
        {
          time: '3:00 PM',
          id: 'day16-jewel',
          guideKey: 'batu-caves',
          title: 'Jewel Changi Rain Vortex Grand Finale',
          category: 'spot',
          description: [
            text('Step off the train at Changi Airport station, tap out your card, and follow the terminal signs straight into the central glass dome. Spend your final 1.5 hours walking the terraced indoor rainforest pathways and watching the spectacular HSBC Rain Vortex indoor waterfall cascade seven stories down from the vaulted glass ceiling. It is completely free and makes for the ultimate farewell photos.'),
          ],
          tags: [
            tag('Spot', 'spot'),
            tag('Free', 'free'),
          ],
          mapQuery: 'Jewel Changi Airport',
        },
        {
          time: '4:30 PM',
          id: 'day16-departure',
          guideKey: 'flight-departs',
          title: 'Flight Check-In & Departure',
          category: 'train',
          description: [
            text('Walk right out of the central dome over to your departure terminal row to drop your bags, clear immigration smoothly, and easily stroll to your gate for your flight out!'),
          ],
          tags: [
            tag('Transit', 'train'),
          ],
          mapQuery: 'Changi Airport',
        },
      ],
    },

  ] satisfies DaySectionData[],
  alert: {
    title: '📌 Fact-check note · bus fare correction',
    body: [
      text('The original itinerary listed RM 64–72 for the KL ↔ Malacca round trip bus for 2. Actual fares start from RM 10/person one-way · expect '),
      strong('RM 40–56 for 2 round trip'),
      text(' depending on operator. Book in advance on BusOnlineTicket.com or Easybook.com.'),
    ],
  } satisfies AlertBoxData,
  tips: [
    {
      icon: '💳',
      description: [
        text("Get a "),
        strong("Touch 'n Go card"),
        text(' at any train station on arrival · discounts on LRT/MRT and faster boarding.'),
      ],
    },
    {
      icon: '🗓️',
      description: [
        strong('Book the Malacca bus in advance'),
        text(' · July 14 is a Sunday and buses fill up fast.'),
      ],
    },
    {
      icon: '⏰',
      description: [
        text('KTM Komuter to Batu Caves runs ~every '),
        strong('30 minutes'),
        text(' · check the schedule before leaving.'),
      ],
    },
    {
      icon: '📱',
      description: [
        text('Download the '),
        strong('KLIA Ekspres app'),
        text(' for 10% off KLIA Transit tickets (saves RM 1.20).'),
      ],
    },
    {
      icon: '🦀',
      description: [
        text('At Jalan Alor: '),
        strong('avoid seafood platters, crab, and big tourist sets'),
        text(' to stay on budget.'),
      ],
    },
    {
      icon: '⏰',
      description: [
        text('Coffee rule: '),
        strong('1 shared coffee only'),
        text(' · not 2 separate orders · per the budget.'),
      ],
    },
  ] satisfies TipCardData[],
  footer: "J&A Malaysia · Singapore Trip 2026",
};

export const destinationGuides: Record<string, DestinationGuide> = {
  KLIA: {
    title: 'KLIA',
    summary: 'This is the airport. You land here first, then go out to get your bag and call your ride.',
    steps: [
      'Walk out of the plane and follow the signs that say Arrival or Baggage Claim.',
      'Pick up your bag from the baggage belt.',
      'Find the Grab pick-up area or the taxi area.',
      'Show the driver your hotel name if they ask.',
      'Sit down and relax during the ride to the hotel.',
    ],
    tips: ['Keep your passport in your hand.', 'Do not rush. Follow the arrows on the wall.'],
  },
  'Travelodge Kuala Lumpur City Centre': {
    title: 'Travelodge Kuala Lumpur City Centre',
    summary: 'This is your hotel. You come here to check in, rest, or leave your luggage.',
    steps: [
      'Go to the front desk and say your name.',
      'Show your booking if the staff asks.',
      'Take your room key.',
      'If the room is not ready, leave your luggage at the desk.',
      'Come back later and go to your room.',
    ],
    tips: ['Keep your room key in your pocket.', 'Ask the staff if you need help.'],
  },
  'Chinatown, Kuala Lumpur': {
    title: 'Chinatown, Kuala Lumpur',
    summary: 'This is the food and walking area near your hotel.',
    steps: [
      'Walk out from the hotel and follow the road signs for Chinatown.',
      'Look for small shops, street stalls, and lots of people walking.',
      'Choose a place with food you like.',
      'Eat slowly and keep your wallet ready.',
      'Walk around a little after you finish.',
    ],
    tips: ['Stay close to the main street.', 'Share one coffee, like the itinerary says.'],
  },
  'Central Market Kuala Lumpur': {
    title: 'Central Market Kuala Lumpur',
    summary: 'This is a nearby market with shops and souvenirs.',
    steps: [
      'Walk there from the hotel area.',
      'Go inside the building through the main entrance.',
      'Look at the shops and stalls one by one.',
      'Buy only if you really want something.',
    ],
    tips: ['It is a short and easy walk.', 'Great for a quick stop and photos.'],
  },
  'Petaling Street Kuala Lumpur': {
    title: 'Petaling Street Kuala Lumpur',
    summary: 'This is the famous street market area.',
    steps: [
      'Walk to the street with the big market signs.',
      'Go slowly because there are many people and many stalls.',
      'Look left and right for snacks, bags, and souvenirs.',
      'Take photos, then keep walking if you are not buying anything.',
    ],
    tips: ['Hold your things close.', 'Do not stop in the middle of the walkway.'],
  },
  'Kwai Chai Hong Kuala Lumpur': {
    title: 'Kwai Chai Hong Kuala Lumpur',
    summary: 'This is a small photo spot with murals and a nice lane.',
    steps: [
      'Walk into the lane near Chinatown.',
      'Look for painted walls and cute old-style buildings.',
      'Take a few photos.',
      'Walk out the same way you came in.',
    ],
    tips: ['Best for a short photo stop.', 'No need to spend money here.'],
  },
  'Masjid Jamek, Kuala Lumpur': {
    title: 'River of Life / Masjid Jamek area',
    summary: 'This is a walking and photo area near the river and mosque.',
    steps: [
      'Walk toward the river area.',
      'Follow the path near the water.',
      'Take photos and enjoy the view.',
      'If you feel tired, sit for a few minutes.',
    ],
    tips: ['Go slowly and enjoy the scenery.', 'Great before dinner or sunset.'],
  },
  'Pasar Seni LRT Station': {
    title: 'Pasar Seni LRT Station',
    summary: 'This is the small LRT stop near your hotel. From here, you ride to KL Sentral first.',
    steps: [
      'Leave the hotel and walk to Pasar Seni station.',
      'Look for the entrance sign that says LRT or rail station.',
      'Go through the gate using your Touch ’n Go card or ticket.',
      'Find the sign for the train going to KL Sentral.',
      'Wait on the platform and stand behind the line.',
      'When the train arrives, let people get off first.',
      'Get on, find a seat, and hold your bag close.',
      'Listen for KL Sentral, then get off when the train stops there.',
    ],
    tips: [
      'If you feel lost, read the big sign boards above you.',
      'If you still feel unsure, ask the station staff: “KL Sentral?”??',
    ],
  },
  'KL Sentral Station': {
    title: 'KL Sentral Station',
    summary: 'This is the big main station. You change trains here and look for the next line.',
    steps: [
      'Walk into the big station and stop for a second.',
      'Look up at the signs and find the words you need.',
      'Read the board that shows train lines and platforms.',
      'Follow the arrows slowly, one sign at a time.',
      'Check the platform number before you go down or up.',
      'If you are changing trains, do not rush.',
      'Stand in the right waiting area before the train comes.',
      'If you are unsure, ask the staff to point to Batu Caves.',
    ],
    tips: [
      'This station is big, so do not hurry.',
      'Keep your phone and ticket ready before you walk in.',
    ],
  },
  'Batu Caves': {
    title: 'Batu Caves',
    summary: 'This is the temple spot with the big colorful stairs.',
    steps: [
      'Get off the train and walk out of the station.',
      'Follow the crowd toward the tall temple stairs.',
      'Buy water before you start climbing.',
      'Walk up the stairs slowly, one step at a time.',
      'Take a break at the top if you need one.',
      'Walk down carefully when you finish.',
    ],
    tips: ['Wear comfortable shoes.', 'Move slowly because the stairs are steep.'],
  },
  KLCC: {
    title: 'KLCC',
    summary: 'This is the Petronas tower area.',
    steps: [
      'Get off the train at KLCC.',
      'Follow the signs to the tower area.',
      'Walk outside first and take the photo you want.',
      'If you are tired, sit in the park or the mall.',
    ],
    tips: ['Stay close to the main tower area.', 'Good place for a short rest.'],
  },
  'Suria KLCC': {
    title: 'Suria KLCC',
    summary: 'This is the mall under the towers.',
    steps: [
      'Walk into the mall entrance.',
      'Find water, snacks, or a place to sit.',
      'Use the restroom if needed.',
      'Go back out when you are ready.',
    ],
    tips: ['Easy place to rest.', 'Good for air-con and snacks.'],
  },
  'Saloma Link Bridge': {
    title: 'Saloma Bridge',
    summary: 'This is the bright pedestrian bridge for photos.',
    steps: [
      'Walk to the bridge entrance.',
      'Go up the bridge slowly.',
      'Take your photos in the middle or side of the bridge.',
      'Walk back down after you finish.',
    ],
    tips: ['Best when the lights are on.', 'Great for a night photo stop.'],
  },
  'Pavilion Kuala Lumpur': {
    title: 'Pavilion Kuala Lumpur',
    summary: 'This is a big mall in Bukit Bintang.',
    steps: [
      'Follow the walkway signs toward Pavilion.',
      'Enter through the mall door.',
      'Use it as a safe place to rest and cool down.',
      'Walk back out when you are ready for dinner or the next stop.',
    ],
    tips: ['Easy to find from the walkway.', 'Good meeting point.'],
  },
  'Jalan Alor Kuala Lumpur': {
    title: 'Jalan Alor',
    summary: 'This is the food street for dinner.',
    steps: [
      'Walk into the food street.',
      'Look at the menus first before sitting down.',
      'Choose simple food you know you will like.',
      'Ask for the bill when you are done.',
    ],
    tips: ['Avoid big seafood sets if you want to save money.', 'Choose shared dishes.'],
  },
  'Bukit Bintang MRT Station': {
    title: 'Bukit Bintang MRT Station',
    summary: 'This is the train stop for going back toward Chinatown.',
    steps: [
      'Find the station entrance.',
      'Go down to the gates.',
      'Check the train direction.',
      'Ride back to Pasar Seni.',
    ],
    tips: ['Look for the platform sign before boarding.', 'Keep your card ready.'],
  },
  'Bandar Tasik Selatan Station': {
    title: 'Bandar Tasik Selatan Station',
    summary: 'This is the station beside the bus terminal.',
    steps: [
      'Get off the train and follow signs to the bus terminal.',
      'Walk through the covered path to TBS.',
      'Look for your bus gate.',
      'Wait at the right gate until boarding starts.',
    ],
    tips: ['Do not go to the wrong terminal.', 'Check your ticket before entering the gate.'],
  },
  'TBS Terminal Bersepadu Selatan': {
    title: 'TBS / Terminal Bersepadu Selatan',
    summary: 'This is the main bus terminal in Kuala Lumpur.',
    steps: [
      'Walk to the bus terminal entrance.',
      'Find your bus company counter or gate number.',
      'Show your ticket if someone asks.',
      'Wait until the bus is ready, then get on.',
    ],
    tips: ['Arrive early.', 'Keep your ticket on your phone.'],
  },
  MelakaSentral: {
    title: 'Melaka Sentral',
    summary: 'This is the bus terminal in Malacca.',
    steps: [
      'Get off the bus and walk out to the taxi or Grab area.',
      'Show your destination to the driver.',
      'Go to Dutch Square first if that is your stop.',
      'Come back here later for the return bus.',
    ],
    tips: ['This is the main bus stop in Malacca.', 'Keep your return time in mind.'],
  },
  'Dutch Square Malacca': {
    title: 'Dutch Square / Red Square',
    summary: 'This is the famous red building photo area.',
    steps: [
      'Walk into the square area.',
      'Look at the red buildings and the clock tower.',
      'Take photos in front of the square.',
      'Move around carefully because it can be busy.',
    ],
    tips: ['Good for a first Malacca photo stop.', 'You do not need to buy a ticket.'],
  },
  "St. Paul's Hill Malacca": {
    title: "St. Paul's Hill",
    summary: 'This is the hill with ruins and a view.',
    steps: [
      'Walk up the hill slowly.',
      'Use the railing if needed.',
      'Look at the old ruins and the view.',
      'Go back down the same way.',
    ],
    tips: ['Go slow because it is a climb.', 'Wear comfy shoes.'],
  },
  'A Famosa Malacca': {
    title: 'A Famosa / Porta de Santiago',
    summary: 'This is a quick photo stop near the old fort.',
    steps: [
      'Walk to the fort area.',
      'Take a photo in front of the stone arch.',
      'Read the sign if you want, then move on.',
      'Keep going to the next stop.',
    ],
    tips: ['This is a short stop.', 'Good if you like history photos.'],
  },
  'Jonker Street Malacca': {
    title: 'Jonker Street / Jonker area',
    summary: 'This is the famous walking and food area in Malacca.',
    steps: [
      'Walk along the street slowly.',
      'Look for food stalls, souvenirs, and drinks.',
      'Choose what you want before you buy.',
      'Eat, rest, and walk around a little more.',
    ],
    tips: ['Nice for food and evening walking.', 'Keep an eye on the crowd.'],
  },
  'Melaka River Walk': {
    title: 'Melaka River Walk',
    summary: 'This is the riverside walking area.',
    steps: [
      'Walk to the river path.',
      'Stand by the rail and look at the water.',
      'Take some photos.',
      'Walk back when you are ready.',
    ],
    tips: ['Good for a calm break.', 'Nice in the late afternoon.'],
  },
};

type GuideInput = {
  title: string;
  summary: string;
  service?: string;
  ticket?: string;
  whereToBuy?: string[];
  transport?: {
    goHere: string[];
    buyThis: string[];
    tapHere: string[];
    getOffHere: string[];
    extra?: string[];
  };
  steps: string[];
  tips: string[];
};

function makeGuide(input: GuideInput): DestinationGuide {
  return input;
}

function attachFoodGuide(guide: DestinationGuide, item: TimelineItemData): DestinationGuide {
  if (item.category !== 'food' || !item.foodGuideKey) {
    return guide;
  }

  const foodGuide = FOOD_GUIDES_BY_KEY[item.foodGuideKey];

  if (!foodGuide) {
    return guide;
  }

  return {
    ...guide,
    foodGuide,
  };
}

export function buildGuideForItem(item: TimelineItemData): DestinationGuide {
  const keyedGuide = GUIDES_BY_KEY[item.guideKey];
  const baseGuide = keyedGuide ?? buildFallbackGuideForItem(item);

  return attachFoodGuide(baseGuide, item);
}

function isTransportishItem(item: TimelineItemData) {
  const title = item.title.toLowerCase();
  return (
    item.category === 'train' ||
    item.category === 'bus' ||
    title.includes('grab') ||
    title.includes('lrt') ||
    title.includes('ktm') ||
    title.includes('mrt') ||
    title.includes('klia transit') ||
    title.includes('walk to') ||
    title.includes('to kl sentral') ||
    title.includes('to klcc') ||
    title.includes('to tbs') ||
    title.includes('to melaka sentral') ||
    title.includes('back to') ||
    title.includes('airport')
  );
}

function extractPlaceLabels(item: TimelineItemData) {
  return item.description.filter((segment): segment is PlaceSegment => segment.kind === 'place');
}

function buildTransportGuide(
  item: TimelineItemData,
  service?: string,
  ticket?: string,
  whereToBuy?: string[]
): DestinationGuide['transport'] | undefined {
  if (!isTransportishItem(item)) {
    return undefined;
  }

  const places = extractPlaceLabels(item);
  const origin = places[0];
  const destination = places[1] ?? places[0];
  const title = item.title.toLowerCase();

  const originLabel = origin
    ? `${origin.label}${origin.placeType ? ` ${origin.placeType}` : ''}`
    : 'the starting point';
  const destinationLabel = destination
    ? `${destination.label}${destination.placeType ? ` ${destination.placeType}` : ''}`
    : 'the destination';

  const goHere = [
    `Go to ${originLabel}.`,
    title.includes('grab')
      ? 'Stand at the ride pick-up point and check the car plate before you get in.'
      : 'Follow the station or terminal signs until you reach the right gate or platform.',
  ];

  const buyThis = [
    ticket ? ticket : 'Use the ticket or card method shown in the itinerary.',
    whereToBuy?.length
      ? `Buy or top up here: ${whereToBuy.join(', ')}.`
      : 'If you already have a valid card or e-ticket, use that instead of buying again.',
  ];

  const tapHere = [
    title.includes('grab') || item.category === 'bus'
      ? 'For Grab or a coach, show the driver or staff your booking on your phone.'
      : 'Tap your ticket, token, or card at the station gate before boarding.',
    title.includes('grab')
      ? 'Check the car plate, then open the door and get in.'
      : 'Wait behind the line and let people get off first.',
  ];

  const getOffHere = [
    `Get off at ${destinationLabel}.`,
    'Follow the exit signs, then look for the next step in the itinerary.',
  ];

  const extra = [
    service ? `Service: ${service}` : undefined,
    item.cost ? `Cost note: ${item.cost}` : undefined,
  ].filter((value): value is string => Boolean(value));

  return {
    goHere,
    buyThis,
    tapHere,
    getOffHere,
    extra: extra.length ? extra : undefined,
  };
}

function genericPlaceGuide(item: TimelineItemData, summary: string, steps: string[], tips: string[]): DestinationGuide;
function genericPlaceGuide(
  item: TimelineItemData,
  summary: string,
  steps: string[],
  tips: string[],
  service: string,
  ticket: string,
  whereToBuy: string[]
): DestinationGuide;
function genericPlaceGuide(
  item: TimelineItemData,
  summary: string,
  service: string,
  ticket: string,
  whereToBuy: string[],
  steps: string[],
  tips: string[]
): DestinationGuide;
function genericPlaceGuide(item: TimelineItemData, summary: string, ...args: unknown[]): DestinationGuide {
  let service: string | undefined;
  let ticket: string | undefined;
  let whereToBuy: string[] | undefined;
  let steps: string[];
  let tips: string[];

  if (Array.isArray(args[0])) {
    steps = args[0] as string[];
    tips = args[1] as string[];
    service = args[2] as string | undefined;
    ticket = args[3] as string | undefined;
    whereToBuy = args[4] as string[] | undefined;
  } else {
    service = args[0] as string | undefined;
    ticket = args[1] as string | undefined;
    whereToBuy = args[2] as string[] | undefined;
    steps = args[3] as string[];
    tips = args[4] as string[];
  }

  const transportGuide = buildTransportGuide(item, service, ticket, whereToBuy);

  return attachFoodGuide(
    makeGuide({
      title: item.title,
      summary,
      ...(service ? { service } : {}),
      ...(ticket ? { ticket } : {}),
      ...(whereToBuy ? { whereToBuy } : {}),
      ...(transportGuide ? { transport: transportGuide } : {}),
      steps,
      tips,
    }),
    item
  );
}

function buildFallbackGuideForItem(item: TimelineItemData): DestinationGuide {
  const title = item.title;
  const query = item.mapQuery ?? title;

  switch (item.guideKey) {
    case 'arrive-klia':
      return genericPlaceGuide(
        item,
        'You are at the airport. This step is about getting out, finding your bag, and getting to the car.',
        [
          'Walk out of the plane and follow the signs that say Arrival or Baggage Claim.',
          'Pick up your bag from the luggage belt.',
          'Look for the Grab pick-up point or taxi line.',
          'Show the driver your hotel name if they ask.',
          'Sit down, breathe, and let the ride do the work.',
        ],
        ['Keep your passport in your hand.', 'Do not rush. Follow the arrows on the walls.']
      );

    case 'check-in':
      return genericPlaceGuide(
        item,
        'This is your hotel check-in stop. You are just going inside, saying your name, and resting.',
        [
          'Walk to the front desk with your bags.',
          'Say your name and tell the staff you have a booking.',
          'Show your booking if they ask.',
          'Take the room key or ask where to leave your luggage.',
          'Go rest once they tell you the room is ready.',
        ],
        ['Keep your room key safe.', 'Ask the staff if you need help with bags or directions.']
      );

    case 'breakfast-near-chinatown':
    case 'lunch-in-chinatown':
    case 'dinner-in-chinatown':
      return genericPlaceGuide(
        item,
        'This is the Chinatown food area. You walk in, choose a stall or shop, order simple food, and eat slowly.',
        [
          'Walk toward Chinatown and look for the busy food lanes.',
          'Read the menu before you sit down.',
          'Pick simple dishes you already know you will like.',
          'Ask for one shared coffee if you want to follow the budget.',
          'Pay when you finish, then keep walking or head to the next stop.',
        ],
        ['Chinatown is busy, so stay close to each other.', 'Keep your wallet and phone inside a safe pocket.']
      );

    case 'central-market':
      return genericPlaceGuide(
        item,
        'Central Market is a short walk and a simple stop for culture, art, and souvenirs.',
        [
          'Walk to Central Market from the hotel area.',
          'Use the main entrance and go inside.',
          'Walk slowly through the stalls and look at the items.',
          'Buy only if you really want something.',
          'Come out the same way or continue to the next nearby stop.',
        ],
        ['The market is a good short stop.', 'The official site lists daily hours from 10.00am to 10.00pm.']
      );

    case 'petaling-street':
      return genericPlaceGuide(
        item,
        'Petaling Street is the Chinatown market street. This is a walking-and-looking stop, not a speed run.',
        [
          'Walk into the street slowly because there are many people and stalls.',
          'Look left and right for snacks, bags, and souvenirs.',
          'Take photos, then move aside so other people can walk by.',
          'If you buy snacks, keep the receipt or change in one pocket.',
          'Leave when you are ready and head back toward Chinatown or Central Market.',
        ],
        ['Hold your things close.', 'The street is crowded, so do not stop in the middle of the walkway.']
      );

    case 'kwai-chai-hong':
      return genericPlaceGuide(
        item,
        'Kwai Chai Hong is a small mural lane in KL Chinatown. It is for a short photo walk.',
        [
          'Head to Pasar Seni Station and follow the sign to Exit A toward Jalan Panggung.',
          'Walk behind the shophouses until you reach the mural lane.',
          'Take a few photos and look around for the old-style lane details.',
          'Walk back out the same way when you are finished.',
        ],
        ['The official site points you to Pasar Seni Station Exit A.', 'A short visit is enough here.']
      );

    case 'rexkl-bookxcess-maze':
      return genericPlaceGuide(
        item,
        'REXKL is an industrial-style creative space with BookXcess and a maze-like interior. It is great for browsing, photos, and a slower mid-day stop.',
        [
          'Walk to the REXKL entrance and look for the main creative space signs.',
          'Go inside and follow the stacked shelves, murals, and open lanes.',
          'Take photos, browse the books, and explore the maze-like levels at your own pace.',
          'Leave when you are ready and head back toward Central Market or Merdeka Square.',
        ],
        ['This is a short explore-and-look stop.', 'Watch your step on stairs or level changes.']
      );

    case 'merdeka-square-river-of-life':
      return genericPlaceGuide(
        item,
        'This is the historic city core around Merdeka Square and the River of Life. It is best for a calm walk, architecture photos, and a quick history break.',
        [
          'Walk toward Merdeka Square and look for the open plaza and historic buildings.',
          'Take your photos of the square and the surrounding architecture.',
          'Continue toward the River of Life / Masjid Jamek area if you still have energy.',
          'Pause for a few minutes, then head to your LRT transfer to KLCC.',
        ],
        ['This is a good mid-afternoon walk.', 'Stay on the main paths and keep your pace easy.']
      );

    case 'river-of-life-masjid-jamek-area':
      return genericPlaceGuide(
        item,
        'This is the river and mosque area near the old city center. It is best for a calm walk and photos.',
        [
          'Walk toward Masjid Jamek and the river area.',
          'Stay on the outside walking path unless you are going into the mosque area.',
          'Look at the river and the old buildings around it.',
          'Take photos, then sit down for a minute if you feel tired.',
        ],
        ['This is more of a walk-and-look stop.', 'Keep the mood calm and unhurried.']
      );

    case 'lrt-pasar-seni-to-kl-sentral':
      return genericPlaceGuide(
        item,
        'This is a short city train ride. You board at Pasar Seni, ride one stop, and get off at KL Sentral.',
        [
          'Leave the hotel and walk to Pasar Seni station.',
          'Go through the gate with your card or ticket.',
          'Check the signs and find the train going to KL Sentral.',
          'Wait behind the line until the train stops.',
          'Let people get off first, then get on.',
          'Sit down or hold the rail and keep your bag close.',
          'Listen for KL Sentral and get off when the train stops there.',
          'Follow the signs inside KL Sentral to your next train or exit.',
        ],
        ['If you feel lost, read the big signs above you.', 'Ask station staff if you need help.'],
        'Rapid KL LRT, Kelana Jaya Line',
        'Use a Single Journey Token if you do not already have a Touch ’n Go / MyRapid card or MyKad. Buy it at the station TVM or counter before you enter.',
        ['Rapid KL station TVM', 'Rapid KL customer service counter', 'Your Touch ’n Go / MyRapid card or MyKad at the gate']
      );

    case 'ktm-komuter-to-batu-caves':
    case 'ktm-komuter-return':
      return genericPlaceGuide(
        item,
        'This is the KTM train ride to or from Batu Caves. It is a simple station-to-station trip.',
        [
          'Start at KL Sentral and find the KTM Komuter line.',
          'Check the board for Batu Caves before you tap in.',
          'Wait on the correct platform and let the train arrive first.',
          'Get on and keep your phone or ticket ready in case staff checks.',
          'Listen for Batu Caves, then get off and follow the crowd.',
          'For the return trip, do the same steps in reverse and head back to KL Sentral.',
        ],
        ['The ride is short but the station can be busy.', 'Do not panic if you need to read the signs twice.'],
        'KTM Komuter Batu Caves line',
        'Buy at the KTMB counter, Ticket Vending Machine, or KTMB online/mobile ticketing before travel. Keep the ticket or QR code ready.',
        ['KTMB ticket counter', 'KTMB Ticket Vending Machine (TVM)', 'KTMB online / mobile ticketing']
      );

    case 'batu-caves':
      return genericPlaceGuide(
        item,
        'This is the temple stop with the famous colorful stairs. Take it one step at a time.',
        [
          'Get off the train and follow the crowd toward the temple entrance.',
          'Look up and find the big colorful stairs.',
          'Buy water first if you think you will need it.',
          'Walk up slowly, one step at a time, and take breaks if needed.',
          'Take photos at the top, then walk down carefully.',
          'After you finish, go back to the station the same way you came.',
        ],
        ['The official travel site describes the 272 steps.', 'Wear comfortable shoes because the stairs are steep.']
      );

    case 'lunch-near-batu-caves':
      return genericPlaceGuide(
        item,
        'This is a simple food stop near Batu Caves. Keep it easy and budget-friendly.',
        [
          'Leave the temple area and walk to the nearby food shops.',
          'Choose roti, thosai, vegetarian rice, or curry if you want a safe simple meal.',
          'Sit down, order, eat slowly, and refill water if needed.',
          'Pay, then head back to the station when you are ready.',
        ],
        ['This is a quick rest before the next train.', 'Do not over-order.']
      );

    case 'lrt-to-klcc':
      return genericPlaceGuide(
        item,
        'This is the train ride from KL Sentral to the KLCC area.',
        'Rapid KL LRT',
        'Use the station token or your Touch ’n Go / MyRapid card or MyKad. Buy the token at the station TVM or counter if needed.',
        ['Rapid KL station TVM', 'Rapid KL customer service counter', 'Your Touch ’n Go / MyRapid card or MyKad at the gate'],
        [
          'At KL Sentral, look for the LRT platform going to KLCC.',
          'Check the station board before you tap in.',
          'Wait for the train, let others exit first, then board.',
          'Ride until KLCC station.',
          'Get off and follow the signs to the towers or the mall.',
        ],
        ['If the station feels big, stop and read the signs again.', 'Keep your next stop name in mind.']
      );

    case 'petronas-twin-towers-klcc':
      return genericPlaceGuide(
        item,
        'This is the tower area. You can take photos outside or go inside only if you have a ticket.',
        [
          'Walk out of KLCC station and follow the signs to the towers.',
          'Take your outside photo first.',
          'If you have a ticket, arrive 15 minutes early for your visit time.',
          'Bring only what is allowed and follow the staff instructions.',
          'After the photos or visit, rest in the mall or park nearby.',
        ],
        ['The official visit page says ticketed visitors should arrive 15 minutes early.', 'Outside photos are the easiest option.']
      );

    case 'klcc-park-suria-klcc':
      return genericPlaceGuide(
        item,
        'This is your rest stop by the towers. It is good for water, snacks, and sitting down.',
        [
          'Walk into the mall or park area.',
          'Look for water, snacks, and a place to sit.',
          'Use the restroom if you need it.',
          'Rest a little before the next walk or train.',
        ],
        ['This is a good break point.', 'Stay near each other in the mall.']
      );

    case 'saloma-bridge':
      return genericPlaceGuide(
        item,
        'This is a photo bridge with lights and a nice city view.',
        [
          'Walk to the bridge entrance.',
          'Go up slowly and stop in the middle for photos.',
          'Take your pictures, then cross to the other side if you want.',
          'Walk back down when you are finished.',
        ],
        ['The bridge is best at sunset or night.', 'Keep an eye on the walking flow.']
      );

    case 'klcc-to-bukit-bintang-walkway':
      return genericPlaceGuide(
        item,
        'This is the covered city walk between KLCC and Bukit Bintang.',
        [
          'Find the covered walkway signs near KLCC.',
          'Stay on the path and keep walking until you reach Pavilion.',
          'Use it like a straight, safe walking route between the two areas.',
          'If you get tired, stop and rest at a mall entrance before continuing.',
        ],
        ['This is a walking path, not a sightseeing stop.', 'Keep following the covered route signs.']
      );

    case 'jalan-alor':
      return genericPlaceGuide(
        item,
        'This is the famous food street in Bukit Bintang. Go in hungry, but keep the budget simple.',
        [
          'Walk into Jalan Alor and look at the menus before you sit down.',
          'Choose simple dishes you can share.',
          'Order water or one shared drink if you want to save money.',
          'Eat slowly, then ask for the bill when you are done.',
          'Walk back toward Bukit Bintang after dinner.',
        ],
        ['The street is near Bukit Bintang.', 'Avoid big seafood platters and tourist combo sets if you want to stay on budget.']
      );

    case 'mrt-back-to-pasar-seni':
      return genericPlaceGuide(
        item,
        'This is your short return train ride back to the hotel area.',
        'Rapid KL MRT',
        'Use a Single Journey Token or your Touch ’n Go / MyRapid card or MyKad. Buy the token at the station TVM or counter if you do not already have one.',
        ['Rapid KL station TVM', 'Rapid KL customer service counter', 'Your Touch ’n Go / MyRapid card or MyKad at the gate'],
        [
          'Find the MRT platform that goes back toward Pasar Seni.',
          'Tap in, wait behind the line, and let the train stop fully.',
          'Board, keep your bag close, and watch the station names.',
          'Get off at Pasar Seni and walk back to the hotel.',
        ],
        ['It is a quick ride, so stay alert for the stop name.', 'Do not rush when leaving the station.']
      );

    case 'lrt-to-kl-sentral':
      return genericPlaceGuide(
        item,
        'This is the morning train from Pasar Seni to KL Sentral before you continue to Malacca.',
        'Rapid KL LRT, Kelana Jaya Line',
        'Use a Single Journey Token or tap your Touch ’n Go / MyRapid card or MyKad. Buy the token at the station TVM or counter before boarding.',
        ['Rapid KL station TVM', 'Rapid KL customer service counter', 'Your Touch ’n Go / MyRapid card or MyKad at the gate'],
        [
          'Leave the hotel early and walk to Pasar Seni station.',
          'Tap in with your card or ticket.',
          'Find the train going to KL Sentral and wait on the right platform.',
          'Ride one stop and get off at KL Sentral.',
          'Follow the signs to the next train or transfer area.',
        ],
        ['This is just the first part of the Malacca day trip.', 'Check the board before boarding so you do not take the wrong train.']
      );

    case 'klia-transit-to-bandar-tasik-selatan':
      return genericPlaceGuide(
        item,
        'This is the train ride that gets you from KL Sentral to the bus terminal connection point.',
        'KLIA Transit',
        'Buy online through the KLIA Ekspres website or app, or buy it at the counter or self-service kiosk. You can also tap a contactless card at the gate if supported.',
        ['KLIA Ekspres website or app', 'KLIA Transit ticket counter', 'Self-service kiosk', 'Contactless card at the gate'],
        [
          'At KL Sentral, look for the KLIA Transit signs.',
          'Tap in and go to the correct platform.',
          'Get on the train and sit or stand safely.',
          'Listen for Bandar Tasik Selatan, then get off there.',
          'Follow the signs to the bus terminal connector walkway.',
        ],
        ['Stay calm in the big station.', 'Read the signs twice if you need to.']
      );

    case 'walk-to-tbs':
      return genericPlaceGuide(
        item,
        'This is the short walking transfer from the station to the bus terminal.',
        [
          'Walk out of Bandar Tasik Selatan station.',
          'Follow the covered signs that point to TBS.',
          'Keep walking until you reach the bus terminal gates.',
          'Find your bus gate or counter and wait there.',
        ],
        ['This is a short covered walk.', 'Do not go to a random gate. Check your ticket.']
      );

    case 'bus-to-melaka-sentral':
      return genericPlaceGuide(
        item,
        'This is the long bus ride to Malacca.',
        'Intercity coach from TBS to Melaka Sentral',
        'Book the ticket online before travel if you can, or buy it from the bus operator counter at the terminal. Keep the e-ticket or printed ticket ready before boarding.',
        ['Bus operator website/app', 'Bus operator counter at TBS', 'Your e-ticket on your phone'],
        [
          'Find the correct bus gate at TBS.',
          'Show your ticket if the staff asks.',
          'Board the bus and sit down for the ride.',
          'Keep your phone charged and your bag close.',
          'Get off at Melaka Sentral when the bus arrives.',
        ],
        ['Book early if possible.', 'Make sure you are waiting at the right gate.']
      );

    case 'grab-to-dutch-square':
      return genericPlaceGuide(
        item,
        'This is the short car ride from the bus terminal into the old city area.',
        [
          'Meet the Grab or taxi at Melaka Sentral.',
          'Show the driver Dutch Square or your hotel/stop name.',
          'Sit back for the short ride into the heritage area.',
          'Get out near Dutch Square and start walking from there.',
        ],
        ['Keep the destination name ready on your phone.', 'The old city area is close, so the ride is short.']
      );

    case 'dutch-square-red-square':
      return genericPlaceGuide(
        item,
        'This is the famous red square in Melaka. It is a simple photo stop right in the old town.',
        [
          'Walk into the square and look for the red buildings.',
          'Take photos in front of the clock tower and church area.',
          'Move slowly because this area can get busy.',
          'When you are done, walk to the next old-town stop.',
        ],
        ['Tourism Malaysia notes Dutch Square is right opposite Jonker Street.', 'It is only a short walk from the main old-town area.']
      );

    case 'st-pauls-hill':
      return genericPlaceGuide(
        item,
        'This is a hill stop with ruins and a view. Walk slowly and take breaks.',
        [
          'Walk toward the hill entrance.',
          'Climb carefully and hold the rail if you need it.',
          'Look at the ruins and the view from the top.',
          'Take photos and then walk back down slowly.',
        ],
        ['It is a short climb, but still a climb.', 'Wear shoes you can walk in.']
      );

    case 'a-famosa-porta-de-santiago':
      return genericPlaceGuide(
        item,
        'This is a quick historical photo stop in Melaka.',
        [
          'Walk to the stone arch or fort area.',
          'Take a quick photo.',
          'Read the sign if you want the history.',
          'Move on to the next stop when you are ready.',
        ],
        ['This is a short photo-and-go stop.', 'You do not need a long visit here.']
      );

    case 'lunch-near-jonker-dutch-square':
      return genericPlaceGuide(
        item,
        'This is your lunch stop in the old-town area. Keep it simple, local, and easy.',
        [
          'Walk from Dutch Square toward the Jonker area.',
          'Pick a clean-looking shop or stall with food you recognize.',
          'Order something simple, then sit and eat slowly.',
          'Drink water, pay, and get ready for the next walk.',
        ],
        ['Jonker is a good place to try local food.', 'Choose the meal first, then the snacks.']
      );

    case 'harmony-street-jonker-street':
      return genericPlaceGuide(
        item,
        'This is the walking heritage area. Go slowly and look around at the shops and buildings.',
        [
          'Walk along the street and look at the temples, mosque, and shops.',
          'Stop for photos when it is safe to do so.',
          'Keep to one side so people can pass.',
          'Move on when you are done exploring.',
        ],
        ['This is a heritage walk, not a rush.', 'Stay aware of people and traffic.']
      );

    case 'cendol-cold-drinks':
      return genericPlaceGuide(
        item,
        'This is a short snack break. Buy something cold and sit for a bit.',
        [
          'Find a cendol or drink stall.',
          'Order one simple drink or dessert to share if you want.',
          'Sit down and cool off.',
          'Finish, pay, and keep walking.',
        ],
        ['This is a tiny rest stop.', 'Do not over-order.']
      );

    case 'melaka-river-walk':
      return genericPlaceGuide(
        item,
        'This is a calm riverside walk. You are here to see the water and take photos.',
        [
          'Walk to the river path.',
          'Stay on the walking path beside the water.',
          'Take photos and enjoy the view.',
          'Walk back when you are ready to eat or return.',
        ],
        ['Good for a slow break.', 'Nice in the late afternoon.']
      );

    case 'early-dinner-in-malacca':
      return genericPlaceGuide(
        item,
        'This is your last Melaka meal before the return trip. Keep it filling but not heavy.',
        [
          'Sit down at a food place in the old-town area.',
          'Choose a simple dinner that is easy to finish.',
          'Pay and leave with enough time to reach the bus terminal.',
          'Do not eat too slowly or you might feel rushed later.',
        ],
        ['Keep an eye on the return schedule.', 'Dinner should be simple, not a long event.']
      );

    case 'grab-back-to-melaka-sentral':
      return genericPlaceGuide(
        item,
        'This is the short ride back to the bus terminal after dinner.',
        [
          'Call the Grab or taxi when you are ready to leave.',
          'Show Melaka Sentral to the driver.',
          'Get in and ride back to the terminal.',
          'Get out at the terminal and go straight to your bus gate.',
        ],
        ['Leave enough time for the bus.', 'Do not forget your bag on the car seat.']
      );

    case 'bus-to-tbs':
      return genericPlaceGuide(
        item,
        'This is the return bus ride from Melaka back to Kuala Lumpur.',
        [
          'Go to your bus gate at Melaka Sentral.',
          'Show your ticket and board when staff says it is time.',
          'Sit down for the ride back to TBS.',
          'Keep your bag close and your phone charged.',
          'Get off at TBS when the bus arrives.',
        ],
        ['This is the same trip in reverse.', 'Stay near your gate so you do not miss the bus.']
      );

    case 'klia-transit-back-to-kl-sentral':
      return genericPlaceGuide(
        item,
        'This is the train ride from the airport-area connection back to KL Sentral.',
        'KLIA Transit',
        'Use the same ticket method you used for the outward ride, or buy a new one at the counter, kiosk, or app. If you are using a contactless card, tap at the gate before boarding.',
        ['KLIA Ekspres website or app', 'KLIA Transit ticket counter', 'Self-service kiosk', 'Contactless card at the gate'],
        [
          'Find the KLIA Transit platform at Bandar Tasik Selatan.',
          'Tap in and board the train heading to KL Sentral.',
          'Sit down or hold a pole, then listen for KL Sentral.',
          'Get off at KL Sentral and follow the signs to your next ride or exit.',
        ],
        ['This is a transfer ride, so stay alert.', 'Watch the station names as the train moves.']
      );

    case 'lrt-back-to-pasar-seni':
      return genericPlaceGuide(
        item,
        'This is the last short ride home to the hotel area.',
        'Rapid KL LRT',
        'Use a Single Journey Token or your Touch ’n Go / MyRapid card or MyKad. Buy the token at the station TVM or counter if you do not already have one.',
        ['Rapid KL station TVM', 'Rapid KL customer service counter', 'Your Touch ’n Go / MyRapid card or MyKad at the gate'],
        [
          'At KL Sentral, find the LRT platform for Pasar Seni.',
          'Tap in or use your ticket as required.',
          'Ride one stop and get off at Pasar Seni.',
          'Walk back to the hotel slowly after a long day.',
        ],
        ['This is a short final hop.', 'Be careful with your bags if you are tired.']
      );

    case 'wake-up':
      return genericPlaceGuide(
        item,
        'This is your very early start. Keep it quiet, simple, and calm.',
        [
          'Wake up and sit on the bed for a moment.',
          'Check your passport, phone, wallet, and flight details.',
          'Put the important things in one small bag.',
          'Get ready to leave the room.',
        ],
        ['Do not forget your passport.', 'Double-check the flight time before you move.']
      );

    case 'check-out-travelodge':
      return genericPlaceGuide(
        item,
        'This is the hotel checkout step. You are leaving the room and going to the lobby.',
        [
          'Pack your things and look under the bed one more time.',
          'Take your bags to the front desk.',
          'Tell the staff you are checking out.',
          'Leave the key and ask if you need a taxi or Grab help.',
        ],
        ['Do a final room check.', 'Keep your passport and phone with you.']
      );

    case 'grab-to-klia':
      return genericPlaceGuide(
        item,
        'This is the airport ride. Get in the car and let it take you to KLIA.',
        [
          'Meet the Grab at the hotel entrance.',
          'Show the driver KLIA if needed.',
          'Sit down and keep your bags beside you.',
          'Ride to the airport and get out at the right terminal.',
        ],
        ['This ride is paid by card, not cash.', 'Check the terminal before you leave the car.']
      );

    case 'klia-check-in':
      return genericPlaceGuide(
        item,
        'This is the airport process before your flight.',
        [
          'Enter the airport and go to your airline counter.',
          'Show your passport and booking.',
          'Drop your bag if needed.',
          'Go through immigration and security.',
          'Find your gate and wait there.',
        ],
        ['Do not rush.', 'Keep your passport and boarding pass in your hand.']
      );

    case 'airport-breakfast':
      return genericPlaceGuide(
        item,
        'This is a final food stop before the flight. Eat something easy and do not overthink it.',
        [
          'Find a café or snack shop in the airport.',
          'Choose something simple that is easy to eat quickly.',
          'Eat, drink water, and check the boarding time again.',
          'Walk to the gate after you finish.',
        ],
        ['Do not buy too much.', 'Leave enough time to reach your gate.']
      );

    case 'flight-departs':
      return genericPlaceGuide(
        item,
        'This is the end of the trip. You are boarding and flying out.',
        [
          'Walk to your gate and listen for boarding calls.',
          'Show your boarding pass and passport when asked.',
          'Get on the plane and find your seat.',
          'Sit down, buckle up, and get ready for takeoff.',
        ],
        ['Keep your passport accessible.', 'Follow the gate staff instructions exactly.']
      );

    case 'restoran-yusoof-dan-zakhir':
      return genericPlaceGuide(
        item,
        'Restoran Yusoof Dan Zakhir is right next door to Travelodge. This is the easiest breakfast stop on the trip — walk out, order, and eat.',
        [
          'Walk out of the Travelodge entrance and turn to the restaurant next door.',
          'Sit at any open table and order Roti Canai and Teh Tarik.',
          'Eat quickly but without rushing — the food comes fast.',
          'Pay at the counter when you finish.',
          'Head back to collect bags and start the day.',
        ],
        ['This is a very short walk. No transport needed.', 'Teh Tarik is hot — let it cool a little before drinking.']
      );

    case 'awana-skyway':
      return genericPlaceGuide(
        item,
        'This is the transfer from Batu Caves up to Genting. You are getting a Grab or bus to the Awana SkyCentral cable car base.',
        'Grab Car or Pre-Booked Express Bus',
        'Option A: Book a Grab car directly from the Batu Caves lot to Awana SkyCentral (35–45 mins). Option B: Take a short Grab to Gombak LRT, then board a pre-booked Genting express bus.',
        ['Grab app (book from Batu Caves lot)', 'Genting Highlands express bus (pre-booked online)', 'Gombak LRT if taking the bus option'],
        [
          'From the Batu Caves lot, open Grab and set destination to Awana SkyCentral.',
          'For the bus option, take a quick Grab to Gombak LRT first, then walk to the Genting bus platform.',
          'Show your pre-booked bus ticket on your phone if using that option.',
          'The ride up is winding — sit back and enjoy the mountain view.',
          'Arrive at Awana SkyCentral and head inside to find the SkyWay cable car entrance.',
        ],
        ['Book the express bus in advance online — it sells out on weekends.', 'The mountain road is curvy; skip heavy meals right before the ride.']
      );

    case 'chin-swee-caves-temple':
      return genericPlaceGuide(
        item,
        'Chin Swee Caves Temple sits on the misty mountain slopes midway up Genting. It is a peaceful stop with a 9-story pagoda, cave shrines, and sweeping views — board the SkyWay and hop off at Chin Swee Station.',
        [
          'Board the Awana SkyWay cable car at Awana SkyCentral.',
          'Get off at the midway Chin Swee Station stop — do not ride to the top yet.',
          'Walk up the terraced steps slowly and look at the cave shrines.',
          'Find the 9-story pagoda for the best mountain view photos.',
          'After exploring, walk back to the station and board the next cable car going to the peak.',
        ],
        ['The temple is cool and misty — a light jacket helps.', 'The ride from Awana to Chin Swee takes about 10 minutes.']
      );

    case 'skyavenue-mall':
      return genericPlaceGuide(
        item,
        'SkyAvenue Mall sits at the Genting peak. This is your lunch and explore stop — a modern indoor mall with cafes, a food court, neon lights, and Skytropolis indoor rides below.',
        [
          'Ride the cable car all the way to the top station at SkyAvenue.',
          'Walk inside and explore the mall level by level.',
          'Choose lunch at a café or restaurant — aim for something simple to stay on budget.',
          'After eating, check out the Skytropolis funhouse or Premium Outlets if you have time.',
          'When you are ready to go down, head back to the cable car entrance.',
        ],
        ['The mall is busy near midday — go to the food court if the cafes have long waits.', 'Keep a close eye on bags inside the mall.']
      );

    case 'genting-island-transfer':
      return genericPlaceGuide(
        item,
        'This is the trip back down from Genting to Kuala Lumpur. You are taking the cable car to the base, then a bus or Grab back to the hotel.',
        'Express Bus or Grab Car',
        'Book a Grab or board the Genting express bus at the Awana SkyCentral bus terminal. Bus tickets can be purchased at the counter if not pre-booked.',
        ['Awana SkyCentral bus terminal counter', 'Grab app (book from Awana SkyCentral drop-off)', 'Pre-booked return bus ticket if you bought a round trip'],
        [
          'Take the SkyWay cable car back down to Awana SkyCentral.',
          'Head to the bus terminal or Grab pick-up point at the base.',
          'Board the express bus or get into the Grab car heading back to KL.',
          'The ride back to KL takes about 45–60 minutes depending on traffic.',
          'Drop off at Travelodge to freshen up before the evening.',
        ],
        ['The last express bus back to KL departs before 10 PM — do not cut it close.', 'Grab back is easier than the bus if you are very tired.']
      );

    case 'simple-breakfast-near-hotel':
      return genericPlaceGuide(
        item,
        'This is a quick, light breakfast near Travelodge before a long Malacca day. Keep it fast and easy.',
        [
          'Walk out of the hotel and look for any nearby mamak stall or kopitiam.',
          'Order something small — roti, toast, or a pastry with coffee or tea.',
          'Eat quickly and avoid anything too heavy before the long travel day.',
          'Head back to the hotel to collect your bag before the bus.',
        ],
        ['Keep the meal light — you will eat properly in Malacca.', 'The hotel lobby may have a simple breakfast option too.']
      );

    case 'maritime-museum':
      return genericPlaceGuide(
        item,
        'The Maritime Museum is housed inside a massive replica of the Portuguese ship Flor de la Mar. Walk inside the ship and explore Malacca\'s seafaring history.',
        [
          'Walk from Dutch Square along the river toward the river mouth.',
          'Look for the giant wooden ship replica — it is hard to miss.',
          'Buy a ticket at the entrance (there are two buildings — start with the ship).',
          'Walk through the ship exhibits slowly and read the history panels.',
          'Exit and check the second museum building next door if time allows.',
        ],
        ['The ship museum is the more interesting of the two buildings — start there.', 'Bring water because the walk from Dutch Square in the heat can be tiring.']
      );

    case 'melaka-river-cruise':
      return genericPlaceGuide(
        item,
        'The Melaka River Cruise is a 45-minute boat ride from the jetty next to the ship museum. You glide past old bridges, Kampung Morten houses, and massive river-wall murals.',
        [
          'Walk from the Maritime Museum to the River Cruise jetty right next door.',
          'Buy a ticket at the jetty counter — the boat runs regularly.',
          'Board the boat and sit on the side for the best view.',
          'Watch for the murals, old bridges, and the wooden kampung houses along the bank.',
          'The boat returns to the same jetty after the round trip.',
        ],
        ['The cruise is a great rest after all the walking — sit and enjoy.', 'The murals are especially vivid so have your camera ready.']
      );

    case 'melaka-straits-mosque':
      return genericPlaceGuide(
        item,
        'The Melaka Straits Mosque sits on an island and appears to float over the sea at high tide. Golden hour here is one of the best moments of the whole trip.',
        [
          'Book a Grab from the river cruise jetty to Melaka Straits Mosque on Malacca Island.',
          'Walk the perimeter path around the mosque slowly.',
          'Take photos with the gold-and-blue dome against the sky and sea.',
          'Stay until the late afternoon light turns warm if you can.',
          'Book a Grab back to the bus terminal when you are ready to leave.',
        ],
        ['Non-Muslim visitors can walk the outside perimeter — dress modestly.', 'The light is best from 4:30 PM onward, so do not rush here too early.']
      );

    case 'breakfast-near-hotel':
      return genericPlaceGuide(
        item,
        'Geylang Serai Market & Food Centre is a 3-minute walk from your Singapore hotel. It is cheap, authentic, and exactly the kind of hawker lunch the whole trip needs.',
        [
          'Walk 3 minutes from the hotel toward Geylang Serai Market.',
          'Look for the food centre building and go inside.',
          'Pick a stall — Nasi Padang or Mee Rebus are both easy, fast, and budget-friendly.',
          'Pay at the stall, find a table, and eat without rushing.',
          'Head back to the hotel or to the next stop when you finish.',
        ],
        ['Geylang Serai is a Malay hawker market — the food is halal and familiar.', 'Eat well here because afternoon activities can be long.']
      );

    default: {
      const placeLabel = item.mapQuery ?? query;
      const friendlyTitle = title;

      if (item.category === 'train' || item.category === 'bus') {
        return genericPlaceGuide(
          item,
          `This is a travel transfer step for ${friendlyTitle}.`,
          item.category === 'bus' ? 'Coach or local bus service' : 'Train service',
          item.category === 'bus'
            ? 'Check the ticket or e-ticket method in the itinerary and keep it ready before boarding.'
            : 'Use the ticket or card method shown in the itinerary for this rail service.',
          item.category === 'bus'
            ? ['Bus operator website/app', 'Bus terminal counter', 'Your e-ticket on your phone']
            : ['Station ticket vending machine', 'Station ticket counter', 'Your Touch ’n Go / travel card or ticket'],
          [
            'Look at the signs and find the correct line or gate.',
            'Wait in the right place before boarding.',
            'Let people exit first, then get on.',
            'Keep your bag close and watch for the stop you need.',
            'Get off carefully and follow the next signs.',
          ],
          ['Read the board twice if needed.', 'Travel steps are easier when you go slowly.']
        );
      }

      if (item.category === 'spot') {
        return genericPlaceGuide(
          item,
          `This is a photo-and-look stop at ${friendlyTitle}.`,
          [
            'Walk to the spot and look around first.',
            'Take photos where it is safe.',
            'Do not rush. Enjoy the view for a minute.',
            'Leave when you are ready for the next stop.',
          ],
          [`Search on Google Maps for ${placeLabel} if you want the exact pin.`, 'This is usually a short visit.']
        );
      }

      if (item.category === 'food') {
        return genericPlaceGuide(
          item,
          `This is a meal stop at ${friendlyTitle}.`,
          [
            'Find a table or stall and look at the menu.',
            'Choose simple food that fits the budget.',
            'Eat slowly, then pay and leave.',
            'If it is hot, buy one drink to share.',
          ],
          ['Keep the order simple.', 'Share food if that helps the budget.']
        );
      }

      if (item.category === 'hotel') {
        return genericPlaceGuide(
          item,
          `This is a hotel or ride step for ${friendlyTitle}.`,
          [
            'Go to the hotel desk or your ride pick-up point.',
            'Show the name or booking when needed.',
            'Check in, check out, or get into the car.',
            'Keep your important items with you.',
          ],
          ['Do not leave passport or wallet behind.', 'Ask for help if the desk or driver needs more details.']
        );
      }

      return genericPlaceGuide(
        item,
        `This is a simple stop at ${friendlyTitle}.`,
        [
          'Follow the map pin and arrive at the place.',
          'Look around and do the simple thing planned for that stop.',
          'Take a break if you need one.',
          'Move on to the next stop when you are ready.',
        ],
        [`Use ${placeLabel} in Google Maps if you need exact directions.`, 'Keep it slow and easy.']
      );
    }
  }
}

const GUIDES_BY_KEY: Record<GuideKey, DestinationGuide> = Object.fromEntries(
  currentItinerary.days.flatMap((day) =>
    day.items.map((item) => {
      return [item.guideKey, buildFallbackGuideForItem(item)] as const;
    })
  )
) as Record<GuideKey, DestinationGuide>;

export const hero = currentItinerary.hero;
export const budgetSummary = currentItinerary.budgetSummary;
export const legend = currentItinerary.legend;
export const days = currentItinerary.days;
export const alert = currentItinerary.alert;
export const tips = currentItinerary.tips;
export const footer = currentItinerary.footer;

export const currentHero = currentItinerary.hero;
export const currentBudgetSummary = currentItinerary.budgetSummary;
export const currentLegend = currentItinerary.legend;
export const currentDays = currentItinerary.days;
export const currentAlert = currentItinerary.alert;
export const currentTips = currentItinerary.tips;
export const currentFooter = currentItinerary.footer;

export const ITINERARIES_BY_ID = {
  main: {
    id: 'main',
    label: 'Main itinerary',
    description: 'Current Kuala Lumpur, Malacca, Singapore plan',
    hero: currentHero,
    budgetSummary: currentBudgetSummary,
    legend: currentLegend,
    days: currentDays,
    alert: currentAlert,
    tips: currentTips,
    footer: currentFooter,
  },
  partner: {
    id: 'partner',
    label: 'Partner itinerary',
    description: 'Placeholder itinerary for future replacement',
    hero: currentHero,
    budgetSummary: currentBudgetSummary,
    legend: currentLegend,
    days: currentDays,
    alert: currentAlert,
    tips: currentTips,
    footer: currentFooter,
  },
} satisfies Record<ItineraryId, ItineraryPlan>;

export const DEFAULT_ITINERARY_ID: ItineraryId = 'main';
export const selectedItinerary = ITINERARIES_BY_ID[DEFAULT_ITINERARY_ID];
export const itinerary = selectedItinerary;

