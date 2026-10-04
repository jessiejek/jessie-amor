/**
 * Kaohsiung-only Destination GUIDE content.
 * Looked up first by buildGuideForItem for kh-* guideKeys.
 * MY/SG guides stay in code1Itinerary fallback / GUIDES_BY_KEY.
 */
import type { DestinationGuide, GuideKey } from "./code1Itinerary";

const img = (name: string) => `/kaohsiung-places/${name}`;

function guide(
  partial: DestinationGuide & { title: string; summary: string; steps: string[]; tips: string[] }
): DestinationGuide {
  return partial;
}

/** Meaningful landmark + food stops (~24). Hotel / breakfast / pure transit stay short. */
export const KAOHSIUNG_GUIDES: Partial<Record<GuideKey, DestinationGuide>> = {
  "kh-airport-arrival": guide({
    title: "Arrive KHH · ATM + MRT to Hub",
    image: img("khh-airport.webp"),
    summary:
      "Kaohsiung International Airport (KHH) is your soft landing. Get NT$ cash from an ATM, ride the Red Line MRT from R4 Airport to R8 Sanduo Shopping District, then a short taxi to Hub Hotel Yisin.",
    service: "Kaohsiung MRT Red Line (R4 → R8)",
    ticket: "Single-journey token or EasyCard / iPASS at the airport MRT gate.",
    whereToBuy: ["MRT ticket machines at R4 Kaohsiung International Airport", "Airport ATM near arrivals for NT$ cash"],
    steps: [
      "Clear immigration and pick up bags at KHH arrivals.",
      "Find an ATM and withdraw enough NT$ for a few days (cash is handy for small food shops).",
      "Follow signs to the MRT (R4). Buy a token or tap EasyCard / iPASS.",
      "Ride Red Line toward Gangshan South / Ciaotou; get off at R8 Sanduo Shopping District.",
      "Exit toward a taxi stand or Uber pick-up and go to Hub Hotel Yisin Branch.",
    ],
    tips: [
      "Keep passports and boarding passes together until you are in the hotel lobby.",
      "R4 → R8 is one line — no transfer. Watch the station map once so you know Sanduo.",
    ],
  }),

  "kh-airport-departure": guide({
    title: "Leave for KHH · evening flight",
    image: img("khh-airport.webp"),
    summary:
      "Reverse of arrival: Red Line from R8 Sanduo back to R4 Airport, then check-in and security for your Manila flight. Buffer time matters more than a last snack run.",
    service: "Kaohsiung MRT Red Line (R8 → R4)",
    ticket: "Token or EasyCard / iPASS.",
    whereToBuy: ["R8 Sanduo MRT ticket machines", "Hotel desk can confirm Uber timing if you skip MRT"],
    steps: [
      "Check out of Hub with bags packed and passports ready.",
      "MRT R8 → R4, or Uber straight to KHH if you are tired or running late.",
      "Allow time for check-in, security, and immigration before the evening departure.",
      "Buy water or a small snack after security if needed — keep liquids rules in mind before the gate.",
    ],
    tips: [
      "Aim to be at the terminal with a clear buffer before the posted departure.",
      "Screenshot your booking and e-ticket offline in case airport Wi-Fi is slow.",
    ],
  }),

  "kh-hub-hotel-checkin": guide({
    title: "Hub Hotel Yisin Branch",
    summary:
      "Your home base for the whole Kaohsiung stay (Oct 17–21). Check in, drop bags, and use the lobby desk for maps, laundry questions, or a backup dinner tip on 一心二路.",
    steps: [
      "Walk into the lobby with your booking name ready.",
      "Check in, get keys, and ask where breakfast is served.",
      "Drop bags, shower, and reset before any evening walk.",
      "Save the hotel pin in Maps for Uber returns later in the trip.",
    ],
    tips: [
      "One hotel the whole trip — no mid-stay transfer.",
      "Ask the desk for a non-seafood dinner idea if 深夜蓋飯食堂 is closed.",
    ],
  }),

  "kh-departure-breakfast": guide({
    title: "Breakfast at Hub Hotel",
    summary:
      "Hotel breakfast is included / prepaid. Eat here so mornings stay cheap and calm before outbound days (Cijin, Chiayi, birthday, Lotus Pond).",
    steps: [
      "Go down at the breakfast time the desk confirmed.",
      "Eat enough for walking — fruit, carbs, and something light.",
      "Fill a bottle of water before you leave.",
      "Head out with sunscreen and EasyCard ready.",
    ],
    tips: ["No need to buy a cafe breakfast on transit-heavy mornings.", "Share one coffee later if you still want a cafe stop."],
  }),

  "kh-liuhe-night-market": guide({
    title: "深夜蓋飯食堂 (near Hub)",
    summary:
      "Day-1 dinner walk near Hub: 蓋飯 (cover rice) at 崑明街55號. Comfort food after the flight — confirm it is open Saturday; if not, ask the hotel desk for a non-seafood fallback on 一心二路.",
    steps: [
      "Walk from Hub toward 崑明街55號 (Maps pin: 深夜蓋飯食堂).",
      "If closed, turn back to the desk fallback on 一心二路 instead of wandering far.",
      "Order cover rice / simple set without seafood — say 不要海鮮.",
      "Share one drink, eat, and walk home early.",
    ],
    tips: [
      "This is a nearby walk dinner, not Liuhe Night Market itself (key reused for the stop).",
      "Keep the order simple — you just landed.",
    ],
  }),

  "kh-british-consulate-gushan": guide({
    title: "British Consulate at Takao",
    image: img("british-consulate.webp"),
    summary:
      "A hilltop heritage site overlooking Sizihwan and the harbor mouth. You get red-brick colonial architecture, bay views, and a calm photo stop before the Cijin ferry — not a long museum day.",
    ticket: "Paid entry to the cultural park (check current ticket price at the gate).",
    whereToBuy: ["Ticket booth at the Former British Consulate at Takao entrance"],
    steps: [
      "From Sizihwan / Gushan area, follow signs up to the consulate park.",
      "Buy tickets, walk the residence and grounds slowly.",
      "Take harbor and brick-arch photos from the terraces.",
      "Walk back down toward Gushan Ferry Pier for Cijin.",
    ],
    tips: [
      "Wear shoes with grip — the hillside paths can be warm and a little steep.",
      "Morning light is kinder for photos and less harsh than midday.",
    ],
  }),

  "kh-hamasen-railway-museum": guide({
    title: "MRT to Sizihwan (O1)",
    image: img("sizihwan.webp"),
    summary:
      "Orange Line ride out to O1 Sizihwan — the gateway for the British Consulate and the Gushan–Cijin ferry. Short transit step with a big bay payoff.",
    service: "Kaohsiung MRT Orange Line to O1 Sizihwan",
    ticket: "EasyCard / iPASS or single token.",
    whereToBuy: ["Any MRT station ticket machine"],
    steps: [
      "From Hub / Sanduo area, connect to Orange Line toward Sizihwan.",
      "Ride to O1 Sizihwan and exit toward the bay / ferry signs.",
      "Walk or short-hop toward the British Consulate, then Gushan Ferry Pier.",
    ],
    tips: ["O1 is the end of the Orange Line — hard to overshoot.", "Keep water; the walk after the station is sunny."],
  }),

  "kh-ferry-to-cijin": guide({
    title: "Ferry to Cijin Island",
    image: img("cijin-ferry.webp"),
    summary:
      "The short public ferry from Gushan Pier to Cijin. You get a cheap harbor crossing, skyline views, and an easy island day without needing a car.",
    service: "Gushan–Cijin public ferry",
    ticket: "Cheap one-way cash fare at the pier (exact change helps).",
    whereToBuy: ["Gushan Ferry Pier ticket window"],
    steps: [
      "Walk to Gushan Ferry Pier after the consulate.",
      "Buy a one-way ticket and wait for the next boat.",
      "Ride across — photos of the harbor from the deck if it is not too crowded.",
      "Disembark on Cijin and walk straight into Old Street.",
    ],
    tips: ["Ferries run frequently in the day — no need to rush the first boat.", "Hold the railing if the deck is wet."],
  }),

  "kh-ferry-back-to-gushan": guide({
    title: "Ferry back to Gushan",
    image: img("cijin-ferry.webp"),
    summary:
      "Same ferry in reverse after Cihou Fort sunset. You get a cool evening crossing, then Uber toward 港園牛肉麵 and home to Hub.",
    service: "Cijin–Gushan public ferry",
    ticket: "One-way pier ticket (cash).",
    whereToBuy: ["Cijin ferry ticket window near the pier"],
    steps: [
      "Walk down from Cihou Fort toward the Cijin ferry pier.",
      "Buy the return ticket and board the next boat to Gushan.",
      "On Gushan side, call Uber to 港園牛肉麵 (or walk if you prefer).",
    ],
    tips: ["Do not cut sunset so close that you miss the last practical ferry — check the board.", "Have Uber ready so you are not standing hungry at the pier."],
  }),

  "kh-cijin-old-street": guide({
    title: "Cijin Old Street + Tianhou Temple",
    image: img("cijin-old-street.webp"),
    summary:
      "The island’s main walking spine: snack stalls, souvenir shops, and the historic Tianhou (Mazu) Temple. You get street energy plus a temple courtyard pause — say 不要海鮮 at any food stall.",
    steps: [
      "From the ferry, walk into Cijin Old Street and take it slow.",
      "Duck into Tianhou Temple for incense, courtyard photos, and shade.",
      "Browse snacks that are clearly non-seafood; share portions.",
      "Continue toward lunch, café, or Rainbow Church as timed in the day plan.",
    ],
    tips: [
      "Temple doors may ask for modest dress — cover shoulders if needed.",
      "Midday heat is real; use shade stretches between stops.",
    ],
  }),

  "kh-cijin-lunch-nonseafood": guide({
    title: "Lunch on Cijin (non-seafood)",
    image: img("cijin-island.webp"),
    summary:
      "Cijin is famous for seafood — you are skipping it. Pick a noodle, rice, or vegetarian-leaning shop and say 不要海鮮 so the kitchen keeps fish/shellfish off the plate.",
    steps: [
      "Choose a busy lunch shop with rice / noodles / fried items that are not seafood-first.",
      "Say 不要海鮮 clearly when ordering.",
      "Share plates and one drink to stay on budget.",
      "Rest in shade before the afternoon Rainbow Church / fort walk.",
    ],
    tips: ["If a menu is all seafood, walk to the next shop — Old Street has options.", "Keep lunch medium so you still want 港園 later."],
  }),

  "kh-cijin-beach": guide({
    title: "Rainbow Church · quick photo",
    image: img("rainbow-church.webp"),
    summary:
      "The colorful Rainbow Church arch is Cijin's postcard photo. Quick 20–30 min stop only — no beach time (we have better beaches in PH), then straight up to Cihou Fort.",
    steps: [
      "Walk to the Rainbow Church installation and take couple photos under the colored arches.",
      "Stay on marked paths; keep valuables zipped if it is windy.",
      "Head straight to the path up to Cihou Fort and the lighthouse — more time there before sunset.",
    ],
    tips: ["Rainbow Church is an art installation — quick stop, not a long visit.", "Sunscreen and a hat — the arch area has little shade."],
  }),

  "kh-cihou-fort": guide({
    title: "Cihou Fort · sunset",
    image: img("cihou-fort.webp"),
    summary:
      "Qing-era hillside fort at the tip of Cijin with harbor-mouth views. You get golden-hour walls, cannons, and one of Kaohsiung’s best free sunset lookouts (~5:32 PM in your plan).",
    steps: [
      "Follow signs up from Rainbow Church toward Cihou Fort.",
      "Walk the walls and find a safe open viewpoint facing the harbor mouth.",
      "Stay for sunset light, then walk down carefully before dark.",
      "Head to the Cijin ferry for the ride back to Gushan.",
    ],
    tips: ["Shoes with grip — stone steps can be uneven.", "Leave enough time after sunset to reach the ferry without rushing."],
  }),

  "kh-gushan-dinner": guide({
    title: "港園牛肉麵 (Gushan)",
    image: img("beef-noodle.webp"),
    summary:
      "Classic Kaohsiung beef noodle stop after Cijin. You get a rich bowl, air-con rest, and an easy Uber home to Hub — still say 不要海鮮 if ordering sides.",
    steps: [
      "Uber from Gushan ferry area to 港園牛肉麵.",
      "Order beef noodle (or a clear non-seafood bowl) and share if portions are large.",
      "Eat, pay, then Uber back to Hub Hotel Yisin.",
    ],
    tips: ["This is the Day-2 dinner lock — no Pier-2 tonight.", "Photo is a dish example of Taiwanese beef noodle, not necessarily this shop’s plating."],
  }),

  "kh-mrt-to-zuoying": guide({
    title: "MRT to Zuoying HSR",
    summary:
      "Red Line from the Hub area up to R16 Zuoying / HSR. Pure transit so you can catch the Chiayi high-speed train for Meteor Garden day.",
    service: "Kaohsiung MRT Red Line → R16 Zuoying",
    ticket: "EasyCard / iPASS or token.",
    whereToBuy: ["R8 Sanduo or nearest Red Line station"],
    steps: [
      "Board Red Line toward Gangshan South / Ciaotou.",
      "Get off at R16 Zuoying and follow signs to the HSR (THSR) hall.",
      "Have HSR tickets ready before the gate.",
    ],
    tips: ["Zuoying combines TRA / HSR / MRT — follow the green HSR deer signs.", "Full HSR fare today — no B1G1 assumption."],
  }),

  "kh-hsr-to-chiayi": guide({
    title: "HSR Zuoying → Chiayi",
    summary:
      "Taiwan High Speed Rail north to Chiayi. You get a fast, reserved-seat ride out of Kaohsiung so the Meteor Garden campus morning still fits.",
    service: "THSR Zuoying → Chiayi (full fare)",
    ticket: "Reserved HSR ticket (buy ahead on the app / kiosk / counter).",
    whereToBuy: ["THSR app / website", "Zuoying HSR ticket machines or counters"],
    steps: [
      "At Zuoying HSR, check your car and seat on the ticket.",
      "Pass the gate, wait on the correct platform, board your car.",
      "Ride to Chiayi HSR; keep bags in the overhead or at your feet.",
      "Exit toward the taxi rank for the CCU ride.",
    ],
    tips: ["Full fare for both of you — budget already assumes that.", "Save the return ticket QR offline."],
  }),

  "kh-hsr-back-to-kaohsiung": guide({
    title: "HSR Chiayi → Zuoying",
    summary:
      "Return high-speed ride after turkey rice. Same full-fare rules — then MRT back to Hub for rest and a light dinner nearby.",
    service: "THSR Chiayi → Zuoying (full fare)",
    ticket: "Reserved HSR ticket.",
    whereToBuy: ["Chiayi HSR machines / counters", "THSR app"],
    steps: [
      "From Minxiong / CCU taxi, arrive Chiayi HSR with buffer.",
      "Board your reserved train south to Zuoying.",
      "Transfer to MRT Red Line toward Sanduo / Hub.",
    ],
    tips: ["Do not cut the return train close after lunch.", "Hotel rest is part of the Day-3 lock — protect energy for birthday tomorrow."],
  }),

  "kh-taxi-to-ccu": guide({
    title: "Taxi to 國立中正大學",
    summary:
      "Taxi from Chiayi HSR to National Chung Cheng University (CCU). You get a direct ride into the Meteor Garden campus without decoding local buses.",
    service: "Taxi / Uber from Chiayi HSR",
    ticket: "Meter or app fare (cash or card depending on the car).",
    whereToBuy: ["Chiayi HSR taxi rank", "Uber app"],
    steps: [
      "Show the driver 國立中正大學 or the Maps pin.",
      "Ride to campus and ask to be dropped near the landmark library / main square area.",
      "Start the photo walk from the open plaza.",
    ],
    tips: ["Save the HSR pin for the return taxi after lunch.", "Campus is large — pick 2–3 photo spots, not every building."],
  }),

  "kh-chung-cheng-university": guide({
    title: "Meteor Garden · CCU campus",
    image: img("ccu-campus.webp"),
    summary:
      "National Chung Cheng University in Minxiong — the campus that fans know from Meteor Garden. You get wide plazas, library approaches, and tree-lined walks for couple photos, not a class tour.",
    steps: [
      "Enter campus and walk toward the main library square / open lawns.",
      "Take the iconic wide-angle couple shots first while energy is high.",
      "Wander a shaded path for candid photos; stay respectful of students.",
      "When done, taxi toward Minxiong turkey rice.",
    ],
    tips: [
      "You are visitors — keep noise down near classrooms.",
      "Midday sun is strong; use shade and refill water.",
    ],
  }),

  "kh-campus-lunch": guide({
    title: "Chiayi turkey rice (Minxiong)",
    image: img("turkey-rice.webp"),
    summary:
      "嘉義火雞肉飯 — shredded turkey over rice with savory sauce. You get the Chiayi classic bowl after CCU, then taxi back to Chiayi HSR. No seafood sides.",
    steps: [
      "Taxi from CCU to a recommended Minxiong / Chiayi turkey-rice shop.",
      "Order turkey rice (火雞肉飯); add a simple side if hungry.",
      "Eat, pay, then taxi straight to Chiayi HSR for the southbound train.",
    ],
    tips: ["Portions are usually one-bowl-friendly — easy to share extras.", "Dish photo is a generic turkey-rice example for the GUIDE modal."],
  }),

  "kh-birthday-outfit": guide({
    title: "Birthday morning · outfit + breakfast",
    summary:
      "Amor’s birthday lock day starts soft: Hub breakfast, then dress for Library + OGNI photos. Keep the morning unhurried before Pier-2 sunset.",
    steps: [
      "Breakfast at Hub together.",
      "Put on the planned birthday outfit and check Maps pins for Library → OGNI.",
      "Leave with charger, EasyCard, and a light layer for evening harbor wind.",
    ],
    tips: ["Protect energy — rest block is scheduled before Pier-2.", "One shared coffee later at OGNI fits the budget rule."],
  }),

  "kh-central-park-kaohsiung": guide({
    title: "Kaohsiung Main Public Library",
    image: img("main-library.webp"),
    summary:
      "The green Main Public Library near Central Park — a modern landmark with a rooftop garden. You get architectural photos, shade, and a calm birthday-morning vibe before coffee.",
    steps: [
      "MRT or short ride to the Main Public Library / Central Park area.",
      "Walk the exterior and go up to the rooftop garden if open.",
      "Take birthday photos with the green facade and skyline peeks.",
      "Continue to OGNI Coffee for pastry + shared coffee.",
    ],
    tips: ["Check rooftop hours at the entrance if gates look closed.", "Keep bags light — you will rest at the hotel after this block."],
  }),

  "kh-85-sky-tower": guide({
    title: "85 Sky Tower (street photo)",
    image: img("85-sky-tower.webp"),
    summary:
      "Optional street-level photo of Kaohsiung’s 85-story tower. You get the skyline icon without buying an observatory ticket — keep it short if energy is for Pier-2 later.",
    steps: [
      "Walk or short hop to a sidewalk angle with a clear tower view.",
      "Take a few exterior shots, then move on.",
      "Do not linger if heat or crowds build — Library / OGNI matter more today.",
    ],
    tips: ["Optional stop — skip freely if tired.", "Observatory is not required for the birthday plan."],
  }),

  "kh-city-walk-snack": guide({
    title: "Café / light snack stop",
    summary:
      "Shared-coffee rule stop (OGNI on birthday morning, or a Cijin aesthetic café / light dinner near Hub). You get a pastry, one cup between two, and a sit-down reset.",
    steps: [
      "Walk into the planned café and check the pastry case.",
      "Order one coffee to share plus one pastry (or two small bites).",
      "Sit, cool down, and save Maps for the next Uber / walk.",
    ],
    tips: ["One shared coffee — not two full-price cups.", "Say 不要海鮮 if ordering savory food."],
  }),

  "kh-pier2-art-center": guide({
    title: "Pier-2 Art Center",
    image: img("pier2.webp"),
    summary:
      "Warehouse art district by the harbor — murals, installations, and open plazas. You get birthday-evening photos and an easy stroll from Dayi toward the Great Harbour Bridge for sunset.",
    steps: [
      "Uber to Pier-2 (Dayi / warehouse zone as pinned).",
      "Walk the outdoor art, take murals and couple shots.",
      "Follow signs / Maps toward the Great Harbour Bridge viewpoint for sunset timing.",
      "After bridge photos, head to Yonshin Fudopia for birthday dinner.",
    ],
    tips: ["Day-4 only for Pier-2 — Day-2 stayed on Cijin.", "Wear comfortable shoes; the district is spread out."],
  }),

  "kh-great-harbour-bridge": guide({
    title: "Great Harbour Bridge sunset",
    image: img("harbour-bridge.webp"),
    summary:
      "Kaohsiung’s landmark rotating pedestrian bridge over the harbor. You get golden-hour skyline reflections and a birthday-worthy photo finale before dinner.",
    steps: [
      "Walk from Pier-2 Dayi toward the bridge entrance.",
      "Time arrival for late-afternoon / sunset light.",
      "Walk onto the bridge for harbor and skyline shots.",
      "Continue to Yonshin Fudopia when light fades.",
    ],
    tips: ["Wind can pick up on the span — secure hats and phones.", "If the bridge is closed for an event, shoot from the Pier-2 waterfront instead."],
  }),

  "kh-birthday-dinner": guide({
    title: "Yonshin Fudopia (birthday dinner)",
    summary:
      "Birthday dinner lock after Pier-2 / bridge. Sit-down meal to celebrate Amor — confirm reservation or waitlist, order non-seafood, then Uber home to Hub.",
    steps: [
      "Arrive at Yonshin Fudopia from the harbor area (Uber if needed).",
      "Order a birthday-worthy meal without seafood (不要海鮮).",
      "Enjoy the night, then Uber back to Hub Hotel Yisin.",
    ],
    tips: ["Protect the reservation time — bridge photos can run long.", "Keep dessert optional if the main meal is already rich."],
  }),

  "kh-lotus-pond-taxi": guide({
    title: "To Lotus Pond",
    image: img("lotus-pond.webp"),
    summary:
      "Morning transfer to Lotus Pond (MRT + short walk/Uber, or Uber direct). You get temple pagodas on the water without another island day.",
    steps: [
      "Leave Hub after breakfast with EasyCard / Uber ready.",
      "Ride to the Lotus Pond area (Zuoying side) and start at Dragon & Tiger Pagodas.",
      "Keep the loop tight so lunch and airport timing still work.",
    ],
    tips: ["Morning is cooler and better for pagoda photos.", "This is Day-5 only — no revisit later."],
  }),

  "kh-dragon-tiger-pagodas": guide({
    title: "Dragon & Tiger Pagodas + Spring & Autumn",
    image: img("dragon-tiger-pagodas.webp"),
    summary:
      "Lotus Pond’s famous twin pagodas (enter the dragon, exit the tiger) plus the nearby Spring & Autumn Pavilions. You get colorful temple architecture, lake views, and the classic Kaohsiung postcard set.",
    steps: [
      "Walk the pier to Dragon & Tiger Pagodas; enter through the dragon mouth if open.",
      "Climb carefully, take lake photos, exit via the tiger.",
      "Continue to Spring & Autumn Pavilions for the second set of pavilion shots.",
      "Loop the waterfront briefly, then head to a nearby non-seafood lunch.",
    ],
    tips: [
      "Steps inside can be steep and crowded — one person at a time on narrow bits.",
      "Modest clothing is polite around active worship areas.",
    ],
  }),

  "kh-lotus-pond-lunch": guide({
    title: "Lunch near Lotus Pond",
    image: img("lotus-pond.webp"),
    summary:
      "Simple sit-down lunch after the pagodas before bags and airport. Keep it non-seafood and not too heavy for the evening flight.",
    steps: [
      "Pick a nearby restaurant or noodle shop (不要海鮮).",
      "Eat, pay, then Uber back to Hub for bags.",
      "Continue MRT R8 → R4 for KHH.",
    ],
    tips: ["Do not discover a far new district — stay near the pond.", "Leave buffer for check-out and airport security."],
  }),
};
