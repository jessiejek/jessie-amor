import { DayPlan, Expense } from "../types";

export const exchangeRate = 13.56; // 1 RM = 13.56 PHP

export const defaultDayPlans: DayPlan[] = [
  {
    day: 12,
    dateStr: "July 12",
    title: "Arrival + Chinatown easy day",
    budgetRange: "RM 130–200",
    costMin: 130,
    costMax: 200,
    badge: "WALK-ONLY DAY",
    items: [
      {
        id: "12-1",
        time: "01:30 AM",
        title: "Arrive KLIA (airport)",
        type: "transport",
        description: "Clear immigration, get baggage, and catch a Grab to the hotel. A smooth start to your journey.",
        estimatedCost: "Credit Card (Excluded from cash)",
        costValue: 65,
        isCreditCard: true,
        location: { lat: 2.7456, lng: 101.7072, name: "Kuala Lumpur International Airport (KLIA)" }
      },
      {
        id: "12-2",
        time: "03:00 AM",
        title: "Check in Travelodge (hotel)",
        type: "accommodation",
        description: "Check-in at Travelodge KL City Centre. Leave your luggage or catch a few more hours of rest.",
        estimatedCost: "Pre-paid Credit Card",
        costValue: 0,
        isCreditCard: true,
        location: { lat: 3.1432, lng: 101.6983, name: "Travelodge KL City Centre" }
      },
      {
        id: "12-3",
        time: "08:00 AM",
        title: "Breakfast near Chinatown",
        type: "food",
        description: "Begin exploring the historic walking area. Remember the 1 shared coffee rule!",
        estimatedCost: "RM 20–30 (for 2)",
        costValue: 25,
        location: { lat: 3.1418, lng: 101.6972, name: "Chinatown Kuala Lumpur" }
      },
      {
        id: "12-4",
        time: "12:00 PM",
        title: "Petaling Street Market Walk",
        type: "sightseeing",
        description: "Explore the bustling street market, look at lanterns, and take photos of heritage shophouses.",
        estimatedCost: "RM 30 (Optional Shopping)",
        costValue: 30,
        location: { lat: 3.1436, lng: 101.6981, name: "Petaling Street (Chinatown)" }
      },
      {
        id: "12-5",
        time: "03:30 PM",
        title: "Sri Maha Mariamman Temple",
        type: "sightseeing",
        description: "Visit the oldest Hindu temple in Kuala Lumpur featuring a gorgeous, colorful Gopuram tower.",
        estimatedCost: "Free",
        costValue: 0,
        location: { lat: 3.1433, lng: 101.6965, name: "Sri Maha Mariamman Temple" }
      },
      {
        id: "12-6",
        time: "07:00 PM",
        title: "Jalan Alor Street Food",
        type: "food",
        description: "At Jalan Alor, stick to grilled skewers and local satay. Avoid the overpriced seafood platters.",
        estimatedCost: "RM 40-60 (for 2)",
        costValue: 50,
        location: { lat: 3.1456, lng: 101.7088, name: "Jalan Alor Food Street" }
      }
    ]
  },
  {
    day: 13,
    dateStr: "July 13",
    title: "Batu Caves + KLCC + Saloma Bridge",
    budgetRange: "RM 165–265",
    costMin: 165,
    costMax: 265,
    badge: "TRANSIT-HEAVY DAY",
    images: [
      {
        title: "Batu Caves Shrine",
        url: "/src/assets/images/batu_caves_1780754522244.png",
        label: "MORNING ASCENT"
      },
      {
        title: "Saloma Link Bridge",
        url: "/src/assets/images/saloma_bridge_1780754540468.png",
        label: "NIGHT ILLUMINATION"
      }
    ],
    items: [
      {
        id: "13-1",
        time: "08:30 AM",
        title: "KTM Komuter to Batu Caves",
        type: "transport",
        description: "Take the train from KL Sentral for high-speed local rail transit.",
        estimatedCost: "RM 5.20",
        costValue: 5.2,
        duration: "29 mins travel",
        location: { lat: 3.1344, lng: 101.6865, name: "KL Sentral Station" }
      },
      {
        id: "13-2",
        time: "09:30 AM",
        title: "Batu Caves Shrine",
        type: "sightseeing",
        description: "Climb the iconic 272 colorful, rainbow-painted stairs guarded by the grand golden statue of Lord Murugan. Meet local cheeky macaques!",
        estimatedCost: "Free Entry",
        costValue: 0,
        location: { lat: 3.2379, lng: 101.6840, name: "Batu Caves" }
      },
      {
        id: "13-3",
        time: "11:30 AM",
        title: "Lunch: Local Delicacies",
        type: "food",
        description: "Savor local Roti Canai, teh tarik, and rich Madras style curry near Temple Cave bazaar.",
        estimatedCost: "RM 35–55 (Roti & Curry)",
        costValue: 45,
        location: { lat: 3.2365, lng: 101.6852, name: "Lotus Restaurant Batu Caves" }
      },
      {
        id: "13-4",
        time: "02:30 PM",
        title: "KLCC Park & Twin Towers Photo Tour",
        type: "sightseeing",
        description: "Relax in the pristine urban sanctuary of KLCC park. Photograph the towers at broad daylight, enjoy the massive splash pool and water fountains.",
        estimatedCost: "Free",
        costValue: 0,
        location: { lat: 3.1556, lng: 101.7115, name: "KLCC Park" }
      },
      {
        id: "13-5",
        time: "05:00 PM",
        title: "Teatime & Shopping at Suria KLCC",
        type: "food",
        description: "Have a cold drinks rest inside the luxury shopping mall to escape the late afternoon humdity.",
        estimatedCost: "RM 25",
        costValue: 25,
        location: { lat: 3.1578, lng: 101.7119, name: "Suria KLCC" }
      },
      {
        id: "13-6",
        time: "08:00 PM",
        title: "Saloma Link Bridge",
        type: "sightseeing",
        description: "Marvel at the glowing futuristic architecture. The shell-like bridge lights up beautifully in emerald green and sapphire blue colors.",
        estimatedCost: "Free",
        costValue: 0,
        location: { lat: 3.1598, lng: 101.7067, name: "Saloma Link Bridge" }
      }
    ]
  },
  {
    day: 14,
    dateStr: "July 14",
    title: "DIY Malacca Day Trip",
    budgetRange: "RM 280–393",
    costMin: 280,
    costMax: 393,
    badge: "THE HISTORIC EXCURSION",
    items: [
      {
        id: "14-1",
        time: "08:00 AM",
        title: "Bus: TBS → Melaka Sentral",
        type: "transport",
        description: "A comfortable 2-hour travel. Ensure you book in advance to secure the best seats for the scenic route.",
        estimatedCost: "RM 40-56 Round Trip",
        costValue: 48,
        location: { lat: 3.0768, lng: 101.7107, name: "Terminal Bersepadu Selatan (TBS)" }
      },
      {
        id: "14-2",
        time: "10:50 AM",
        title: "Dutch Square / Red Square",
        type: "sightseeing",
        description: "Christ Church, Stadthuys, and the Clock Tower. This is the heart of Malacca's UNESCO heritage site.",
        estimatedCost: "Free",
        costValue: 0,
        location: { lat: 2.1944, lng: 102.2492, name: "Dutch Square Malacca" }
      },
      {
        id: "14-3",
        time: "12:15 PM",
        title: "Nyonya Lunch near Jonker",
        type: "food",
        description: "Taste unique Baba-Nyonya Peranakan foods like chicken rice balls and laksa.",
        estimatedCost: "RM 40-60",
        costValue: 50,
        location: { lat: 2.1950, lng: 102.2475, name: "Jonker Street" }
      },
      {
        id: "14-4",
        time: "03:15 PM",
        title: "Cendol / Cold Drinks",
        type: "food",
        description: "A vital stop to cool down. Try the famous Malacca Cendol with rich Gula Melaka syrup.",
        estimatedCost: "RM 20-35 for 2",
        costValue: 28,
        location: { lat: 2.1956, lng: 102.2462, name: "Christina's Famous Cendol Malacca" }
      },
      {
        id: "14-5",
        time: "05:00 PM",
        title: "Malacca River Walk & Ruins",
        type: "sightseeing",
        description: "Walk alongside murals of Malacca river and head to A Famosa Portuguese fort, climbing up to St. Paul's Church ruins.",
        estimatedCost: "Free",
        costValue: 0,
        location: { lat: 2.1925, lng: 102.2497, name: "A Famosa Fort" }
      }
    ]
  },
  {
    day: 15,
    dateStr: "July 15",
    title: "Departure + Souvenirs Hunt",
    budgetRange: "RM 140–210",
    costMin: 140,
    costMax: 210,
    badge: "DEPARTURE DAY",
    items: [
      {
        id: "15-1",
        time: "09:00 AM",
        title: "Breakfast: Local Kaya Toast",
        type: "food",
        description: "Crispy toast with coconut-egg jam, soft-boiled eggs, and a glass of hot local white coffee.",
        estimatedCost: "RM 20",
        costValue: 20,
        location: { lat: 3.1431, lng: 101.6980, name: "Local Heritage Toast House" }
      },
      {
        id: "15-2",
        time: "11:00 AM",
        title: "Central Market Souvenir Shopping",
        type: "sightseeing",
        description: "Shop for batik printings, woodcarvings, local snacks, and white coffee packs inside the historic landmark building.",
        estimatedCost: "RM 60 (Optional shopping)",
        costValue: 60,
        location: { lat: 3.1451, lng: 101.6953, name: "Central Market Kuala Lumpur" }
      },
      {
        id: "15-3",
        time: "03:00 PM",
        title: "Grab ride back to KLIA",
        type: "transport",
        description: "Smooth ride back to the terminal. Grab ride fits baggage.",
        estimatedCost: "Credit Card (Excluded from cash)",
        costValue: 65,
        isCreditCard: true,
        location: { lat: 2.7456, lng: 101.7072, name: "Kuala Lumpur International Airport" }
      }
    ]
  }
];

export const defaultExpenses: Expense[] = [
  // Day 12
  { id: "e-1", day: 12, category: "Transport", item: "Airport Grab ride to Hotel", amount: 65, paidWith: "Credit Card" },
  { id: "e-2", day: 12, category: "Food", item: "Breakfast in Chinatown", amount: 25, paidWith: "Cash" },
  { id: "e-3", day: 12, category: "Sightseeing", item: "Optional shopping Petaling St.", amount: 30, paidWith: "Cash" },
  { id: "e-4", day: 12, category: "Food", item: "Jalan Alor Satay and Skewers", amount: 50, paidWith: "Cash" },

  // Day 13
  { id: "e-5", day: 13, category: "Transport", item: "KTM rail fare to Batu Caves", amount: 5.2, paidWith: "Cash" },
  { id: "e-6", day: 13, category: "Food", item: "Lunch at Batu Caves (Curry/Roti)", amount: 45, paidWith: "Cash" },
  { id: "e-7", day: 13, category: "Food", item: "Suria KLCC teatime desserts", amount: 25, paidWith: "Cash" },

  // Day 14
  { id: "e-8", day: 14, category: "Transport", item: "Bus ticket TBS <> Melaka Sentral", amount: 48, paidWith: "Cash" },
  { id: "e-9", day: 14, category: "Food", item: "Nyonya lunch at Jonker Street", amount: 50, paidWith: "Cash" },
  { id: "e-10", day: 14, category: "Food", item: "Authentic Malacca Cendol dessert", amount: 28, paidWith: "Cash" },

  // Day 15
  { id: "e-11", day: 15, category: "Food", item: "Kaya toast and local coffee breakfast", amount: 20, paidWith: "Cash" },
  { id: "e-12", day: 15, category: "Sightseeing", item: "Souvenirs from Central Market", amount: 60, paidWith: "Cash" },
  { id: "e-13", day: 15, category: "Transport", item: "Airport Grab ride back", amount: 65, paidWith: "Credit Card" }
];

export const initialNotes = [
  { id: "n-1", title: "Shared Coffee Policy", content: "Remember: 1 shared coffee, not 2. Standard rule to save budget and taste more varieties!", category: "Rule", createdAt: "2026-06-06T14:00:00Z" },
  { id: "n-2", title: "Transport Hack", content: "Airport Grab on July 12 and July 15 is paid by credit card. This is excluded from our cash budget (~RM 1,000 cash). Buy Touch 'n Go cards at KL Sentral for subway/bus lines.", category: "Requirement", createdAt: "2026-06-06T14:01:00Z" },
  { id: "n-3", title: "Bus Services", content: "Book Malacca buses in advance at BusOnlineTicket.com. Weekend slots (especially Sunday mornings) load up very fast. Target the 8:00 AM slots to maximize day trips.", category: "General", createdAt: "2026-06-06T14:02:00Z" }
];
