import type { ItineraryItem } from "../types";
import type { SyncStatus } from "../types";

export interface MapDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  time: string;
  notes: string;
  createdBy?: string;
  savedByUserId?: string;
  savedByEmail?: string;
  syncStatus?: SyncStatus;
}

export type MapDestinationRow = {
  id: string;
  trip_key: string;
  day: number;
  name: string;
  lat: number;
  lng: number;
  time: string;
  notes: string;
  created_by: string | null;
  saved_by_user_id: string | null;
  saved_by_email: string | null;
  created_at: string;
  updated_at: string;
};

export interface MapDay {
  day: number;
  label: string;
  title: string;
  destinations: MapDestination[];
}

export interface MapItineraryData {
  version: number;
  updatedAt: string;
  days: MapDay[];
}

export const destinationToRow = (dest: MapDestination, tripKey: string, day: number): MapDestinationRow => ({
  id: dest.id,
  trip_key: tripKey,
  day,
  name: dest.name,
  lat: dest.lat,
  lng: dest.lng,
  time: dest.time,
  notes: dest.notes,
  created_by: dest.createdBy ?? dest.savedByUserId ?? null,
  saved_by_user_id: dest.savedByUserId ?? dest.createdBy ?? null,
  saved_by_email: dest.savedByEmail ?? null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const rowToDestination = (row: MapDestinationRow): MapDestination => ({
  id: row.id,
  name: row.name,
  lat: row.lat,
  lng: row.lng,
  time: row.time,
  notes: row.notes,
  createdBy: row.created_by ?? undefined,
  savedByUserId: row.saved_by_user_id ?? undefined,
  savedByEmail: row.saved_by_email ?? undefined,
  syncStatus: "synced",
});

export const groupDestinationsByDay = (destinations: MapDestination[], dayGetter?: (d: MapDestination) => number): MapDay[] => {
  const dayMap = new Map<number, MapDestination[]>();
  for (const dest of destinations) {
    const day = dayGetter ? dayGetter(dest) : 12;
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day)!.push(dest);
  }
  const labels: Record<number, string> = {
    11: "July 11", 12: "July 12", 13: "July 13", 14: "July 14", 15: "July 15", 16: "July 16",
  };
  const titles: Record<number, string> = {
    11: "Arrival day", 12: "Chinatown, KLCC and dinner", 13: "Batu Caves, Genting and Jalan Alor",
    14: "Melaka day trip", 15: "KL to Singapore travel day", 16: "Singapore city day and departure",
  };
  const days: MapDay[] = [];
  for (let d = 11; d <= 16; d++) {
    days.push({
      day: d,
      label: labels[d] || `July ${d}`,
      title: titles[d] || `Day ${d}`,
      destinations: dayMap.get(d) || [],
    });
  }
  return days;
};

type Coordinates = { lat: number; lng: number };

export const MAP_ITINERARY_VERSION = 3;

const asciiText = (value: string) =>
  value
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u2022/g, "|")
    .replace(/\u00b7/g, "|")
    .replace(/\u2026/g, "...")
    .replace(/≈/g, "~")
    .replace(/₱/g, "PHP")
    .replace(/S\$/g, "SGD")
    .replace(/\s+/g, " ")
    .trim();

const coordinateHints: Array<{ match: string[]; coords: Coordinates }> = [
  { match: ["klia", "kuala lumpur international airport"], coords: { lat: 2.7456, lng: 101.7072 } },
  { match: ["travelodge", "kl city centre"], coords: { lat: 3.1439720747976154, lng: 101.6955623684415 } },
  { match: ["chinatown"], coords: { lat: 3.1418, lng: 101.6972 } },
  { match: ["kwai chai hong"], coords: { lat: 3.1429, lng: 101.6983 } },
  { match: ["petaling street"], coords: { lat: 3.1436, lng: 101.6981 } },
  { match: ["sri maha mariamman temple"], coords: { lat: 3.1433, lng: 101.6965 } },
  { match: ["rexkl"], coords: { lat: 3.1439, lng: 101.6988 } },
  { match: ["merdeka square"], coords: { lat: 3.1485, lng: 101.6944 } },
  { match: ["pasar seni"], coords: { lat: 3.1319, lng: 101.6957 } },
  { match: ["jalan alor"], coords: { lat: 3.1456, lng: 101.7088 } },
  { match: ["kl sentral"], coords: { lat: 3.1344, lng: 101.6865 } },
  { match: ["batu caves"], coords: { lat: 3.2379, lng: 101.684 } },
  { match: ["lotus restaurant"], coords: { lat: 3.2365, lng: 101.6852 } },
  { match: ["klcc park"], coords: { lat: 3.1556, lng: 101.7115 } },
  { match: ["suria klcc"], coords: { lat: 3.1578, lng: 101.7119 } },
  { match: ["saloma link"], coords: { lat: 3.1598, lng: 101.7067 } },
  { match: ["tbs", "terminal bersepadu selatan"], coords: { lat: 3.0768, lng: 101.7107 } },
  { match: ["dutch square", "stadthuys"], coords: { lat: 2.1944, lng: 102.2492 } },
  { match: ["jonker"], coords: { lat: 2.195, lng: 102.2475 } },
  { match: ["cendol"], coords: { lat: 2.1956, lng: 102.2462 } },
  { match: ["famosa", "a famosa"], coords: { lat: 2.1925, lng: 102.2497 } },
  { match: ["baba nyonya", "baba & nyonya"], coords: { lat: 2.1952, lng: 102.2472 } },
  { match: ["maritime museum"], coords: { lat: 2.1896, lng: 102.2479 } },
  { match: ["melaka river cruise jetty"], coords: { lat: 2.1907, lng: 102.2484 } },
  { match: ["melaka river walk"], coords: { lat: 2.1919, lng: 102.2491 } },
  { match: ["melaka straits mosque"], coords: { lat: 2.2054, lng: 102.2365 } },
  { match: ["restoran yusoof dan zakhir"], coords: { lat: 3.1432, lng: 101.6983 } },
  { match: ["awana skycentral"], coords: { lat: 3.4338, lng: 101.7934 } },
  { match: ["chin swee"], coords: { lat: 3.4237, lng: 101.7785 } },
  { match: ["skyavenue"], coords: { lat: 3.4217, lng: 101.7939 } },
  { match: ["skytropolis"], coords: { lat: 3.4217, lng: 101.7939 } },
  { match: ["premium outlets"], coords: { lat: 3.429, lng: 101.7948 } },
  { match: ["central market"], coords: { lat: 3.1451, lng: 101.6953 } },
  { match: ["local heritage toast"], coords: { lat: 3.1431, lng: 101.698 } },
  { match: ["paya lebar"], coords: { lat: 1.3184, lng: 103.8931 } },
  { match: ["hotel classic by venue"], coords: { lat: 1.314, lng: 103.8976 } },
  { match: ["geylang serai"], coords: { lat: 1.3178, lng: 103.8971 } },
  { match: ["little india"], coords: { lat: 1.306, lng: 103.8498 } },
  { match: ["sri veeramakaliamman temple"], coords: { lat: 1.3072, lng: 103.8514 } },
  { match: ["tan teng niah"], coords: { lat: 1.3078, lng: 103.8518 } },
  { match: ["haji lane"], coords: { lat: 1.3008, lng: 103.8596 } },
  { match: ["sultan mosque"], coords: { lat: 1.3014, lng: 103.8607 } },
  { match: ["gardens by the bay"], coords: { lat: 1.2816, lng: 103.8636 } },
  { match: ["merlion park"], coords: { lat: 1.2868, lng: 103.8545 } },
  { match: ["raffles place"], coords: { lat: 1.2839, lng: 103.8515 } },
  { match: ["joo chiat"], coords: { lat: 1.314, lng: 103.8976 } },
  { match: ["koon seng road"], coords: { lat: 1.3116, lng: 103.9021 } },
  { match: ["chinatown singapore"], coords: { lat: 1.2834, lng: 103.8437 } },
  { match: ["chinatown complex"], coords: { lat: 1.2819, lng: 103.8428 } },
  { match: ["chinatown heritage murals"], coords: { lat: 1.2834, lng: 103.8437 } },
  { match: ["jewel"], coords: { lat: 1.3602, lng: 103.9891 } },
  { match: ["changi airport"], coords: { lat: 1.3644, lng: 103.9915 } },
];

export const resolveCoordinatesFromName = (name: string): Coordinates => {
  const normalized = name.toLowerCase();
  const hint = coordinateHints.find(({ match }) => match.some((needle) => normalized.includes(needle)));
  return hint?.coords ?? { lat: 3.139, lng: 101.6869 };
};

const buildNotes = (item: ItineraryItem) => {
  const parts = [asciiText(item.description.trim())];
  if (item.duration) parts.push(`Duration: ${item.duration}`);
  if (item.estimatedCost) parts.push(`Estimated cost: ${item.estimatedCost}`);
  if (item.isCreditCard) parts.push("Paid by card.");
  return asciiText(parts.join(" "));
};

const deriveDestinationName = (item: ItineraryItem) => item.location?.name || item.title;

const normalizeDestination = (item: ItineraryItem): MapDestination => {
  const coords = item.location ?? resolveCoordinatesFromName(deriveDestinationName(item));
  return {
    id: item.id,
    name: asciiText(deriveDestinationName(item)),
    lat: coords.lat,
    lng: coords.lng,
    time: item.time,
    notes: buildNotes(item),
  };
};

export const buildInitialMapItinerary = (): MapItineraryData => ({
  version: MAP_ITINERARY_VERSION,
  updatedAt: new Date().toISOString(),
  days: [
    { day: 11, label: "July 11", title: "Arrival day", destinations: [] },
    {
      day: 12,
      label: "July 12",
      title: "Chinatown, KLCC and dinner",
      destinations: [
        { id: "12-1", name: "Kuala Lumpur International Airport (KLIA)", lat: 2.7456, lng: 101.7072, time: "01:30 AM", notes: "Clear immigration, get baggage, and catch a Grab to the hotel. A smooth start to your journey." },
        { id: "12-2", name: "Travelodge KL City Centre", lat: 3.1439720747976154, lng: 101.6955623684415, time: "03:00 AM", notes: "Check-in at Travelodge KL City Centre. Leave your luggage or catch a few more hours of rest." },
        { id: "12-3", name: "Chinatown Kuala Lumpur", lat: 3.1418, lng: 101.6972, time: "08:00 AM", notes: "Begin exploring the historic walking area. Remember the 1 shared coffee rule!" },
        { id: "12-4", name: "Kwai Chai Hong Kuala Lumpur", lat: 3.1429, lng: 101.6983, time: "10:45 AM", notes: "Wander the beautifully restored brick alleyways right behind Petaling Street to see the creative murals, interactive setups, and minimalist-style storefronts." },
        { id: "12-5", name: "Petaling Street (Chinatown)", lat: 3.1436, lng: 101.6981, time: "12:00 PM", notes: "Stroll through the high-energy stalls under the green canopy roof to experience the sights and sounds of the local market rows." },
        { id: "12-6", name: "REXKL Kuala Lumpur", lat: 3.1439, lng: 101.6988, time: "01:00 PM", notes: "Step into the raw, industrial layout of REXKL to explore the complex, towering multi-level maze of floor-to-ceiling bookshelves." },
        { id: "12-7", name: "Central Market Kuala Lumpur", lat: 3.1451, lng: 101.6953, time: "02:00 PM", notes: "Walk right over to Kasturi Walk under its giant traditional kite roof, then step into the air-conditioned aisles of Central Market. Browsing now ensures all the local artisanal booths and boutique souvenir shops are fully open and active." },
        { id: "12-8", name: "Merdeka Square Kuala Lumpur", lat: 3.1485, lng: 101.6944, time: "03:00 PM", notes: "Take a late afternoon walk across the open grass of Merdeka Square to admire the copper domes of the Sultan Abdul Samad Building, and view the historic convergence at the Jamek Mosque riverbank." },
        { id: "12-9", name: "Pasar Seni LRT Station", lat: 3.1319, lng: 101.6957, time: "04:00 PM", notes: "Drop bags at Travelodge; walk behind the hotel into Pasar Seni LRT Station. Tap in and board the Kelana Jaya Line heading toward Gombak. Direct 4-stop rail run underneath the city traffic. Arrive at KLCC and follow signs to the lower ground concourse check-in." },
        { id: "12-10", name: "Petronas Twin Towers", lat: 3.1578, lng: 101.7119, time: "04:30 PM", notes: "Ascend the high-speed elevators to the iconic SkyBridge connecting the two towers, then continue up to the 86th Floor Observation Deck. At this time, you get brilliant, clear afternoon light to map out the city layout, which transitions beautifully toward golden hour." },
        { id: "12-11", name: "KLCC Park", lat: 3.1556, lng: 101.7115, time: "06:15 PM", notes: "Step outside into the cooler evening air. Walk the clean footpaths of KLCC Park to capture exterior photos of the steel structures. You will get to watch them completely transition into their glowing, illuminated night state. At 07:30 PM, secure a spot by the water to watch the musical Lake Symphony fountain show kick off." },
        { id: "12-12", name: "KLCC Station", lat: 3.1575, lng: 101.7119, time: "07:45 PM", notes: "Take the direct Kelana Jaya Line train 4 stops from KLCC straight back to Pasar Seni." },
        { id: "12-13", name: "Chinatown Kuala Lumpur", lat: 3.1418, lng: 101.6972, time: "08:15 PM", notes: "Sit down for a fantastic local dinner at a lively evening spot in Chinatown to celebrate a perfect, stress-free first day in the city." },
      ],
    },
    {
      day: 13,
      label: "July 13",
      title: "Batu Caves, Genting and Jalan Alor",
      destinations: [
        { id: "13-1", name: "Restoran Yusoof Dan Zakhir Kuala Lumpur", lat: 3.1432, lng: 101.6983, time: "05:30 AM", notes: "Step out of Travelodge to Restoran Yusoof Dan Zakhir right next door. Grab a quick, hot Roti Canai and Teh Tarik to fuel up." },
        { id: "13-2", name: "Pasar Seni LRT Station", lat: 3.1319, lng: 101.6957, time: "05:50 AM", notes: "Walk right behind your hotel into Pasar Seni LRT Station. Take the Kelana Jaya Line 1 stop to KL Sentral (approx. 3 minutes)." },
        { id: "13-3", name: "KL Sentral Station", lat: 3.1344, lng: 101.6865, time: "06:00 AM", notes: "Tap out of the LRT gates at KL Sentral and follow the blue overhead signs pointing to the KTM Komuter departure gates. Buy a cash token or tap your Touch 'n Go card at the turnstiles for the Batu Caves Line." },
        { id: "13-4", name: "KL Sentral Station", lat: 3.1344, lng: 101.6865, time: "06:15 AM", notes: "Walk down to the platform and locate the train. Keep an eye out for the Ladies-Only coaches if you want a quieter ride." },
        { id: "13-5", name: "KL Sentral Station", lat: 3.1344, lng: 101.6865, time: "06:25 AM", notes: "Board the early morning KTM Komuter train. The train ride is a direct, peaceful 32-minute journey that cuts straight through the northern suburbs of the city." },
        { id: "13-6", name: "Batu Caves", lat: 3.2379, lng: 101.684, time: "07:00 AM", notes: "Step off the train at the Batu Caves KTM Station. The temple gates and the giant golden statue are located just a short 2-minute flat walk right outside the station exit." },
        { id: "13-7", name: "Awana SkyCentral", lat: 3.4338, lng: 101.7934, time: "08:30 AM", notes: "Option A: Order a direct Grab car right from the Batu Caves lot straight to the Awana SkyCentral cable car station. Option B: Take a 10-minute Grab to Gombak LRT Station and hop on a pre-booked express bus heading up the mountain." },
        { id: "13-8", name: "Chin Swee Caves Temple", lat: 3.4237, lng: 101.7785, time: "09:30 AM", notes: "Board the Awana SkyWay cable car. Use the free midway stop to hop off at Chin Swee Station. Walk the peaceful, misty terraces of the Chin Swee Caves Temple and take photos by its iconic 9-story pagoda." },
        { id: "13-9", name: "SkyAvenue Mall", lat: 3.4217, lng: 101.7939, time: "11:00 AM", notes: "Ride the cable car to the peak inside SkyAvenue Mall. Grab a beautiful lunch at an aesthetic cafe, check out the futuristic indoor neon tracks of Skytropolis, or ride back down one stop for an open-air retail walk at the Genting Highlands Premium Outlets." },
        { id: "13-10", name: "Travelodge KL City Centre", lat: 3.1439720747976154, lng: 101.6955623684415, time: "04:30 PM", notes: "Take the cable car back down to the base and grab an express bus or a Grab car straight back to Travelodge to quickly drop off any mountain gear, freshen up, and prepare for your night out." },
        { id: "13-11", name: "Travelodge KL City Centre", lat: 3.1439720747976154, lng: 101.6955623684415, time: "05:45 PM", notes: "Rest." },
        { id: "13-12", name: "Jalan Alor Kuala Lumpur", lat: 3.1456, lng: 101.7088, time: "07:00 PM", notes: "How to get there: A quick Grab or MRT ride down to Bukit Bintang Station. The Experience: The 500-meter stretch is in full swing by now under a canopy of glowing red lanterns. It is loud, high-energy, and smells amazing. Sit down at one of the busy, plastic-table stalls for an incredible street seafood dinner." },
        { id: "13-13", name: "Bukit Bintang MRT Station", lat: 3.1492, lng: 101.7143, time: "09:00 PM", notes: "Return to Pasar Seni via MRT for a well-deserved, deep sleep." },
      ],
    },
    {
      day: 14,
      label: "July 14",
      title: "Melaka day trip",
      destinations: [
        { id: "14-1", name: "Travelodge KL City Centre", lat: 3.1439720747976154, lng: 101.6955623684415, time: "04:30 AM", notes: "Wake up and get ready for the Melaka day trip." },
        { id: "14-2", name: "Travelodge KL City Centre", lat: 3.1439720747976154, lng: 101.6955623684415, time: "06:00 AM", notes: "Quick Morning Breakfast." },
        { id: "14-3", name: "Terminal Bersepadu Selatan (TBS)", lat: 3.0768, lng: 101.7107, time: "06:15 AM", notes: "Walk behind your hotel into Pasar Seni Station. Take the rail link down to Terminal Bersepadu Selatan (TBS) and board your morning express bus straight down to Melaka (approx. 2 hours)." },
        { id: "14-4", name: "Dutch Square Malacca", lat: 2.1944, lng: 102.2492, time: "09:30 AM", notes: "Explore Dutch Square, walk up St. Paul's Hill, and tour the striking wooden architecture of the Melaka Sultanate Palace Museum." },
        { id: "14-5", name: "Jonker Street", lat: 2.195, lng: 102.2475, time: "01:30 PM", notes: "Cross the river into the historic townhouse lanes of Jonker Street. Sit down at a heritage cafe for traditional Melaka chicken rice balls or an authentic Nyonya lunch. Afterward, tour the beautifully preserved Baba & Nyonya Heritage Museum to see the stunning inner courtyards and antique collections of an old affluent estate." },
        { id: "14-6", name: "Maritime Museum Melaka", lat: 2.1896, lng: 102.2479, time: "01:30 PM", notes: "Exploration walk back toward the river mouth to explore the Maritime Museum, uniquely housed entirely inside a massive, towering replica of the historic Portuguese ship Flor de la Mar." },
        { id: "14-7", name: "Melaka River Cruise Jetty", lat: 2.1907, lng: 102.2484, time: "02:30 PM", notes: "Step right onto the boat at the Melaka River Cruise Jetty located directly adjacent to the ship museum. This 45-minute round-trip boat ride provides a beautiful, breezy break from walking." },
        { id: "14-8", name: "Melaka River Walk", lat: 2.1919, lng: 102.2491, time: "03:30 PM", notes: "Step off the boat and take a slow stroll along the clean, tree-shaded wooden boardwalks. Find a small, hidden riverside cafe to enjoy an ice-cold local drink or a signature Nyonya Cendol right next to the water." },
        { id: "14-9", name: "Melaka Straits Mosque", lat: 2.2054, lng: 102.2365, time: "05:00 PM", notes: "Take a quick 10-minute Grab car over to the Melaka Straits Mosque on Malacca Island. Walking the perimeter platforms right as the late afternoon sun casts a warm glow over its gold-and-blue dome over the sea is the ultimate grand finale to your sightseeing." },
        { id: "14-10", name: "Melaka Sentral", lat: 2.2509, lng: 102.2861, time: "05:30 PM", notes: "Take your comfortable express bus transit from Melaka Sentral back to TBS terminal in KL, then hop onto the rail straight back to Pasar Seni Station." },
        { id: "14-11", name: "Melaka Sentral", lat: 2.2509, lng: 102.2861, time: "06:30 PM", notes: "Board your evening express bus for a smooth, air-conditioned ride back to the TBS terminal in KL, then catch the rail link straight back to Pasar Seni Station." },
        { id: "14-12", name: "Travelodge KL City Centre", lat: 3.1439720747976154, lng: 101.6955623684415, time: "08:30 PM", notes: "Sit down for a comforting, easy late-night dinner right near the hotel to unwind from the travel day." },
        { id: "14-13", name: "Travelodge KL City Centre", lat: 3.1439720747976154, lng: 101.6955623684415, time: "09:00 PM", notes: "Head up to your room at Travelodge to smoothly pack your things, double-check your passports, and get a great night's rest before your flight to Singapore the next morning!" },
      ],
    },
    {
      day: 15,
      label: "July 15",
      title: "KL to Singapore travel day",
      destinations: [
        { id: "15-1", name: "Travelodge KL City Centre", lat: 3.1439720747976154, lng: 101.6955623684415, time: "04:00 AM", notes: "Wake up and get ready for the KL to Singapore leg. Keep your passport, phone, and charger together before you leave." },
        { id: "15-2", name: "Kuala Lumpur International Airport (KLIA)", lat: 2.7456, lng: 101.7072, time: "06:13 AM", notes: "Arrive at KLIA, clear the airport flow, and get ready for the flight to Singapore." },
        { id: "15-3", name: "Hotel Classic by Venue", lat: 1.314, lng: 103.8976, time: "11:00 AM", notes: "Land at Changi Airport, head to your Singapore hotel, and drop off your day packs before lunch." },
        { id: "15-4", name: "Geylang Serai Market & Food Centre", lat: 1.3178, lng: 103.8971, time: "12:15 PM", notes: "Walk 3 minutes from the hotel area for a cheap, authentic hawker lunch like Nasi Padang or Mee Rebus." },
        { id: "15-5", name: "Sri Veeramakaliamman Temple", lat: 1.3072, lng: 103.8514, time: "01:15 PM", notes: "Head into Little India and see the colorful temple facades and detailed street life." },
        { id: "15-6", name: "House of Tan Teng Niah", lat: 1.3078, lng: 103.8518, time: "01:45 PM", notes: "Stop for photos at the bright, rainbow-painted heritage villa in Little India." },
        { id: "15-7", name: "Haji Lane", lat: 1.3008, lng: 103.8596, time: "03:00 PM", notes: "Stroll the mural-filled lane and continue toward Kampong Glam for the Sultan Mosque area." },
        { id: "15-8", name: "Sultan Mosque", lat: 1.3014, lng: 103.8607, time: "03:30 PM", notes: "Capture a photo of the golden dome from Bussorah Street and the surrounding heritage enclave." },
        { id: "15-9", name: "Gardens by the Bay", lat: 1.2816, lng: 103.8636, time: "05:00 PM", notes: "Explore the outdoor gardens and Supertree Grove without paying for the indoor domes." },
        { id: "15-10", name: "Supertree Grove", lat: 1.2816, lng: 103.8636, time: "07:45 PM", notes: "Settle in for the Garden Rhapsody light show under the illuminated trees." },
        { id: "15-11", name: "Helix Bridge", lat: 1.2883, lng: 103.8588, time: "08:30 PM", notes: "Walk across the lit pedestrian bridge toward Marina Bay for the Spectra light show." },
        { id: "15-12", name: "Marina Bay Sands Waterfront", lat: 1.2834, lng: 103.8595, time: "09:00 PM", notes: "Watch the Spectra laser and water show, then grab a late dinner nearby before returning to Joo Chiat." },
      ],
    },
    {
      day: 16,
      label: "July 16",
      title: "Singapore city day and departure",
      destinations: [
        { id: "16-1", name: "Hotel Classic by Venue", lat: 1.314, lng: 103.8976, time: "05:00 AM", notes: "Wake up at the hotel, get ready, and keep your bags organized before heading out for sunrise." },
        { id: "16-2", name: "Merlion Park", lat: 1.2868, lng: 103.8545, time: "06:00 AM", notes: "Leave the hotel early and catch the sunrise over Marina Bay for a quiet, crowd-free photo stop." },
        { id: "16-3", name: "Raffles Place", lat: 1.2839, lng: 103.8515, time: "07:15 AM", notes: "Head downtown for kaya toast breakfast at a nearby cafe or branch in the financial core." },
        { id: "16-4", name: "Hotel Classic by Venue", lat: 1.314, lng: 103.8976, time: "08:30 AM", notes: "Return to the hotel to freshen up, pack your bags, and prepare for checkout." },
        { id: "16-5", name: "Koon Seng Road", lat: 1.3116, lng: 103.9021, time: "09:30 AM", notes: "Walk the Joo Chiat shophouse streets and enjoy the colorful heritage facades." },
        { id: "16-6", name: "Chinatown Heritage Murals", lat: 1.2834, lng: 103.8437, time: "11:30 AM", notes: "Explore Chinatown, walk Sago Street and Mohamed Ali Lane, and stop at the Buddha Tooth Relic Temple area." },
        { id: "16-7", name: "Chinatown Complex Food Centre", lat: 1.2819, lng: 103.8428, time: "01:00 PM", notes: "Have a quick, cheap pre-airport hawker lunch before heading back for the luggage run." },
        { id: "16-8", name: "Hotel Classic by Venue", lat: 1.314, lng: 103.8976, time: "02:00 PM", notes: "Collect your suitcases from the hotel and get ready for the airport transfer." },
        { id: "16-9", name: "Changi Airport", lat: 1.3644, lng: 103.9915, time: "03:00 PM", notes: "Ride east on the MRT to Changi Airport and walk into Jewel." },
        { id: "16-10", name: "Jewel Changi", lat: 1.3602, lng: 103.9891, time: "03:00 PM", notes: "Spend time at the Rain Vortex and the indoor rainforest paths before flight check-in." },
        { id: "16-11", name: "Changi Airport", lat: 1.3644, lng: 103.9915, time: "04:30 PM", notes: "Drop your bags, clear immigration, and head to your gate for departure." },
      ],
    },
  ],
});

export const buildEmptyMapItinerary = (): MapItineraryData => ({
  version: MAP_ITINERARY_VERSION,
  updatedAt: new Date().toISOString(),
  days: Array.from({ length: 6 }, (_, index) => {
    const day = index + 11;
    return {
      day,
      label: `July ${day}`,
      title:
        day === 11
          ? "Arrival day"
          : day === 15
            ? "KL to Singapore travel day"
            : day === 16
              ? "Singapore city day and departure"
              : `July ${day}`,
      destinations: [],
    };
  }),
});

const hasValidDays = (value: unknown): value is MapItineraryData =>
  Boolean(
    value &&
      typeof value === "object" &&
      Array.isArray((value as MapItineraryData).days),
  );

const toNumber = (value: unknown, fallback: number) => {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeMapItinerary = (raw: unknown): MapItineraryData => {
  if (!hasValidDays(raw)) return buildInitialMapItinerary();

  const days = raw.days
    .filter((day) => day && typeof day === "object")
    .map((day) => ({
      day: Number((day as MapDay).day),
      label: asciiText(String((day as MapDay).label || `July ${(day as MapDay).day}`)),
      title: asciiText(String((day as MapDay).title || `Day ${(day as MapDay).day}`)),
      destinations: Array.isArray((day as MapDay).destinations)
        ? (day as MapDay).destinations
            .filter((destination) => destination && typeof destination === "object")
            .map((destination, index) => {
              const name = asciiText(String(destination.name || `Destination ${index + 1}`));
              const inferred = resolveCoordinatesFromName(name);
              const lat = toNumber(destination.lat, inferred.lat);
              const lng = toNumber(destination.lng, inferred.lng);
              return {
                id: String(destination.id || `dest-${day.day}-${index + 1}`),
                name,
                lat,
                lng,
                time: asciiText(String(destination.time || "09:00 AM")),
                notes: asciiText(String(destination.notes || "")),
                createdBy: typeof destination.createdBy === "string" ? destination.createdBy : undefined,
                savedByUserId: typeof destination.savedByUserId === "string" ? destination.savedByUserId : undefined,
                savedByEmail: typeof destination.savedByEmail === "string" ? destination.savedByEmail : undefined,
              };
            })
        : [],
    }))
    .sort((a, b) => a.day - b.day);

  const dayMap = new Map(days.map((day) => [day.day, day] as const));
  const orderedDays: MapDay[] = [];
  for (let dayNumber = 11; dayNumber <= 16; dayNumber += 1) {
    const existing = dayMap.get(dayNumber);
    if (existing) {
      orderedDays.push(existing);
      continue;
    }
    orderedDays.push({
      day: dayNumber,
      label: `July ${dayNumber}`,
      title:
        dayNumber === 11
          ? "Arrival day"
          : dayNumber === 15
            ? "KL to Singapore travel day"
            : dayNumber === 16
              ? "Singapore city day and departure"
              : `July ${dayNumber}`,
      destinations: [],
    });
  }

  return {
    version: MAP_ITINERARY_VERSION,
    updatedAt: new Date().toISOString(),
    days: orderedDays,
  };
};
