const fs = require('fs');
const O = "'";
const esc = s => s.replace(/'/g, "\\'");

const T = (v) => ({ kind: 'text', value: v });
const S = (v) => ({ kind: 'strong', value: v });
const P = (label, pt, mq) => ({ kind: 'place', label, placeType: pt, mapQuery: mq });
const tag = (l, v) => ({ label: l, variant: v });

const days = [
  {
    day: 11, title: 'FLIGHT DAY \u00B7 July 11', budgetLabel: 'Travel Day',
    items: [
      { time: '11:55 AM', id: 'day11-flight-mnl', title: 'Flight to Manila', category: 'train',
        desc: [T('Depart for Manila.')], tags: [tag('Transit', 'train')], mapQuery: 'NAIA Manila', guideKey: 'flight-departs' },
      { time: '8:05 PM', id: 'day11-flight-kl', title: 'Flight to Kuala Lumpur', category: 'train',
        desc: [T('Depart Manila, arrive KLIA at 12:10 AM July 12.')], tags: [tag('Transit', 'train')], mapQuery: 'KLIA', guideKey: 'arrive-klia' },
    ],
  },
  {
    day: 12, title: 'DAY 1 \u00B7 July 12', budgetLabel: 'WAKE UP TIME: 8:30 AM',
    images: [
      { title: 'Kuala Lumpur Skyline', url: '/src/assets/images/kl_skyline_1780754501759.png', label: 'CITY VIEW' },
    ],
    items: [
      { time: '9:30 AM', id: 'day12-brunch', title: 'Late Morning Brunch in Chinatown', category: 'food',
        desc: [T('Wake up refreshed, step out of Travelodge, and head straight to a nearby aesthetic cafe or a heritage coffee shop around Jalan Sultan for a hearty brunch and a cold iced drink.')],
        tags: [tag('Food', 'food')], mapQuery: 'Chinatown Kuala Lumpur', guideKey: 'breakfast-near-chinatown', foodGuideKey: 'chinatown-breakfast' },
      { time: '10:45 AM', id: 'day12-kwai-chai-hong', title: 'Kwai Chai Hong Hidden Lanes', category: 'spot',
        desc: [T('Wander the beautifully restored brick alleyways right behind Petaling Street to see the creative murals, interactive setups, and minimalist-style storefronts.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Kwai Chai Hong Kuala Lumpur', guideKey: 'kwai-chai-hong' },
      { time: '12:00 PM', id: 'day12-petaling', title: 'Jalan Petaling Street Walk', category: 'spot',
        desc: [T('Stroll through the high-energy stalls under the green canopy roof to experience the sights and sounds of the local market rows.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Petaling Street', guideKey: 'petaling-street' },
      { time: '1:00 PM', id: 'day12-rexkl', title: 'REXKL BookXcess Maze', category: 'spot',
        desc: [T('Step into the raw, industrial layout of REXKL to explore the complex, towering multi-level maze of floor-to-ceiling bookshelves.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'REXKL Kuala Lumpur', guideKey: 'rexkl-bookxcess-maze' },
      { time: '2:00 PM', id: 'day12-central-market', title: 'Central Market & Kasturi Walk', category: 'spot',
        desc: [T('Walk right over to Kasturi Walk under its giant traditional kite roof, then step into the air-conditioned aisles of Central Market. Browsing now ensures all the local artisanal booths and boutique souvenir shops are fully open and active.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Central Market Kuala Lumpur', guideKey: 'central-market' },
      { time: '3:00 PM', id: 'day12-merdeka', title: 'Merdeka Square & River of Life', category: 'spot',
        desc: [T('Take a late afternoon walk across the open grass of Merdeka Square to admire the copper domes of the Sultan Abdul Samad Building, and view the historic convergence at the Jamek Mosque riverbank.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Merdeka Square Kuala Lumpur', guideKey: 'merdeka-square-river-of-life' },
      { time: '4:00 PM', id: 'day12-transit-towers', title: 'Transit to the Towers', category: 'train',
        desc: [T('Drop bags at Travelodge; walk behind the hotel into Pasar Seni LRT Station. Tap in and board the Kelana Jaya Line heading toward Gombak. Direct 4-stop rail run underneath the city traffic. Arrive at KLCC and follow signs to the lower ground concourse check-in.')],
        tags: [tag('LRT', 'train')], mapQuery: 'Pasar Seni LRT Station', guideKey: 'lrt-to-klcc' },
      { time: '4:30 PM', id: 'day12-twin-towers', title: 'Petronas Twin Towers Indoor Tour', category: 'spot',
        desc: [T('Ascend the high-speed elevators to the iconic SkyBridge connecting the two towers, then continue up to the 86th Floor Observation Deck. At this time, you get brilliant, clear afternoon light to map out the city layout, which transitions beautifully toward golden hour.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Petronas Twin Towers', guideKey: 'petronas-twin-towers-klcc' },
      { time: '6:15 PM', id: 'day12-klcc-park', title: 'KLCC Park & The Transition to Night', category: 'spot',
        desc: [T('Step outside into the cooler evening air. Walk the clean footpaths of KLCC Park to capture exterior photos of the steel structures. You will get to watch them completely transition into their glowing, illuminated night state. At 07:30 PM, secure a spot by the water to watch the musical Lake Symphony fountain show kick off.')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'KLCC Park', guideKey: 'klcc-park-suria-klcc' },
      { time: '7:45 PM', id: 'day12-transit-back', title: 'Transit back to Chinatown', category: 'train',
        desc: [T('Take the direct Kelana Jaya Line train 4 stops from KLCC straight back to Pasar Seni.')],
        tags: [tag('LRT', 'train')], mapQuery: 'KLCC Station', guideKey: 'lrt-back-to-pasar-seni' },
      { time: '8:15 PM', id: 'day12-dinner', title: 'Relaxed Dinner', category: 'food',
        desc: [T('Sit down for a fantastic local dinner at a lively evening spot in Chinatown to celebrate a perfect, stress-free first day in the city.')],
        tags: [tag('Food', 'food')], mapQuery: 'Chinatown Kuala Lumpur', guideKey: 'dinner-in-chinatown', foodGuideKey: 'chinatown-dinner' },
    ],
  },
  {
    day: 13, title: 'DAY 2 \u00B7 July 13', budgetLabel: 'WAKE UP TIME: 4:30 AM',
    images: [
      { title: 'Batu Caves Shrine', url: '/src/assets/images/batu_caves_1780754522244.png', label: 'MORNING ASCENT' },
      { title: 'Saloma Link Bridge', url: '/src/assets/images/saloma_bridge_1780754540468.png', label: 'NIGHT ILLUMINATION' },
    ],
    items: [
      { time: '5:30 AM', id: 'day13-breakfast', title: 'Light breakfast', category: 'food',
        desc: [T('Step out of Travelodge to Restoran Yusoof Dan Zakhir right next door. Grab a quick, hot Roti Canai and Teh Tarik to fuel up.')],
        tags: [tag('Food', 'food')], mapQuery: 'Restoran Yusoof Dan Zakhir Kuala Lumpur', guideKey: 'restoran-yusoof-dan-zakhir', foodGuideKey: 'simple-hotel-breakfast' },
      { time: '5:50 AM', id: 'day13-walk-pasar-seni', title: 'Walk to Pasar Seni LRT Station', category: 'walk',
        desc: [T('Walk right behind your hotel into Pasar Seni LRT Station. Take the Kelana Jaya Line 1 stop to KL Sentral (approx. 3 minutes).')],
        tags: [tag('Walk', 'walk')], mapQuery: 'Pasar Seni LRT Station', guideKey: 'lrt-to-kl-sentral' },
      { time: '6:00 AM', id: 'day13-transfer-ktm', title: 'Transfer to KTM Komuter', category: 'train',
        desc: [T('Tap out of the LRT gates at KL Sentral and follow the blue overhead signs pointing to the KTM Komuter departure gates. Buy a cash token or tap your Touch n Go card at the turnstiles for the Batu Caves Line.')],
        tags: [tag('Train', 'train')], mapQuery: 'KL Sentral Station', guideKey: 'lrt-pasar-seni-to-kl-sentral' },
      { time: '6:15 AM', id: 'day13-board-train', title: 'Board the Train', category: 'train',
        desc: [T('Walk down to the platform and locate the train. Keep an eye out for the Ladies-Only coaches (marked with bright pink platform and window stickers) if you want a quieter, highly comfortable ride.')],
        tags: [tag('Train', 'train')], mapQuery: 'KL Sentral Station', guideKey: 'ktm-komuter-to-batu-caves' },
      { time: '6:25 AM', id: 'day13-catch-train', title: 'Catch the early train', category: 'train',
        desc: [T('Board the early morning KTM Komuter train. The train ride is a direct, peaceful 32-minute journey that cuts straight through the northern suburbs of the city.')],
        tags: [tag('Train', 'train')], mapQuery: 'KL Sentral Station', guideKey: 'ktm-komuter-to-batu-caves' },
      { time: '7:00 AM', id: 'day13-arrive-batu', title: 'Arrive at Batu Caves', category: 'spot',
        desc: [T('Step off the train at the Batu Caves KTM Station. The temple gates and the giant golden statue are located just a short 2-minute flat walk right outside the station exit. Climb the 272 colorful steps, meet the cheeky macaques, and explore the towering cave temples.')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'Batu Caves', guideKey: 'batu-caves' },
      { time: '8:30 AM', id: 'day13-genting', title: 'Go to Genting Island', category: 'bus',
        desc: [T('Option A: Order a direct Grab car right from the Batu Caves lot straight to the Awana SkyCentral cable car station (approx. 35-45 mins). Option B: Take a 10-minute Grab to Gombak LRT Station and hop on a pre-booked express bus heading up the mountain.')],
        tags: [tag('Grab', 'bus')], mapQuery: 'Awana SkyCentral', guideKey: 'awana-skyway' },
      { time: '9:30 AM', id: 'day13-cable-car', title: 'Cable Car & Misty Mountain Temple', category: 'spot',
        desc: [T('Board the Awana SkyWay cable car. Use the free midway stop to hop off at Chin Swee Station. Walk the peaceful, misty terraces of the Chin Swee Caves Temple and take photos by its iconic 9-story pagoda.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Chin Swee Caves Temple', guideKey: 'chin-swee-caves-temple' },
      { time: '11:00 AM', id: 'day13-peak', title: 'Peak Exploration & SkyAvenue Lunch', category: 'food',
        desc: [T('Ride the cable car to the peak inside SkyAvenue Mall. Grab a beautiful lunch at an aesthetic cafe, check out the futuristic indoor neon tracks of Skytropolis, or ride back down one stop for an open-air retail walk at the Genting Highlands Premium Outlets. Celebrate Anniversary at a cute Cafe or eat Steak!')],
        tags: [tag('Food', 'food')], mapQuery: 'SkyAvenue Mall', guideKey: 'skyavenue-mall', foodGuideKey: 'melaka-jonker-lunch' },
      { time: '4:30 PM', id: 'day13-return-kl', title: 'Return to Kuala Lumpur & Refresh', category: 'bus',
        desc: [T('Take the cable car back down to the base and grab an express bus or a Grab car straight back to Travelodge to quickly drop off any mountain gear, freshen up, and prepare for your night out.')],
        tags: [tag('Grab', 'bus')], mapQuery: 'Travelodge Kuala Lumpur City Centre', guideKey: 'genting-island-transfer' },
      { time: '5:45 PM', id: 'day13-rest', title: 'Rest', category: 'hotel',
        desc: [T('Rest.')], tags: [tag('Rest', 'hotel')], mapQuery: 'Travelodge Kuala Lumpur City Centre', guideKey: 'check-in' },
      { time: '7:00 PM', id: 'day13-jalan-alor', title: 'Jalan Alor Night Market', category: 'food',
        desc: [T('A quick Grab or MRT ride down to Bukit Bintang Station. The 500-meter stretch is in full swing by now under a canopy of glowing red lanterns. It is loud, high-energy, and smells amazing. Sit down at one of the busy, plastic-table stalls for an incredible street seafood dinner. Do not miss the famous Wong Ah Wah grilled chicken wings, sizzling satay skewers, or a refreshing plate of local coconut ice cream.')],
        tags: [tag('Food', 'food')], mapQuery: 'Jalan Alor Kuala Lumpur', guideKey: 'jalan-alor', foodGuideKey: 'jalan-alor-dinner' },
      { time: '9:00 PM', id: 'day13-return-mrt', title: 'Return to Pasar Seni via MRT', category: 'train',
        desc: [T('Return to Pasar Seni via MRT for a well-deserved, deep sleep.')],
        tags: [tag('MRT', 'train')], mapQuery: 'Bukit Bintang MRT Station', guideKey: 'mrt-back-to-pasar-seni' },
    ],
  },
  {
    day: 14, title: 'DAY 3 \u00B7 July 14', budgetLabel: 'WAKE UP TIME: 4:30 AM',
    items: [
      { time: '6:00 AM', id: 'day14-breakfast', title: 'Quick Morning Breakfast', category: 'food',
        desc: [T('Keep it fast, light, and cheap near Travelodge / Pasar Seni.')],
        tags: [tag('Food', 'food')], mapQuery: 'Travelodge Kuala Lumpur City Centre', guideKey: 'simple-breakfast-near-hotel', foodGuideKey: 'simple-hotel-breakfast' },
      { time: '6:15 AM', id: 'day14-transit-melaka', title: 'Transit to Melaka', category: 'bus',
        desc: [T('Walk behind your hotel into Pasar Seni Station. Take the rail link down to Terminal Bersepadu Selatan (TBS) and board your morning express bus straight down to Melaka (approx. 2 hours).')],
        tags: [tag('Bus', 'bus')], mapQuery: 'Terminal Bersepadu Selatan (TBS)', guideKey: 'bus-to-melaka-sentral' },
      { time: '9:30 AM', id: 'day14-dutch-square', title: 'The Historic Red Core & Sultanate Palace', category: 'spot',
        desc: [T('Explore Dutch Square, walk up St Paul\'s Hill, and tour the striking wooden architecture of the Melaka Sultanate Palace Museum.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Dutch Square Malacca', guideKey: 'dutch-square-red-square' },
      { time: '11:30 AM', id: 'day14-jonker-lunch', title: 'Jonker Street & Peranakan Lunch', category: 'food',
        desc: [T('Cross the river into the historic townhouse lanes of Jonker Street. Sit down at a heritage cafe for traditional Melaka chicken rice balls or an authentic Nyonya lunch. Afterward, tour the beautifully preserved Baba & Nyonya Heritage Museum to see the stunning inner courtyards and antique collections of an old affluent estate.')],
        tags: [tag('Food', 'food')], mapQuery: 'Jonker Street Malacca', guideKey: 'lunch-near-jonker-dutch-square', foodGuideKey: 'melaka-jonker-lunch' },
      { time: '1:30 PM', id: 'day14-maritime-museum', title: 'Maritime Museum', category: 'spot',
        desc: [T('Exploration Walk back toward the river mouth to explore the Maritime Museum, uniquely housed entirely inside a massive, towering replica of the historic Portuguese ship Flor de la Mar.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Maritime Museum Melaka', guideKey: 'maritime-museum' },
      { time: '2:30 PM', id: 'day14-river-cruise', title: 'The Melaka River Cruise', category: 'spot',
        desc: [T('Step right onto the boat at the Melaka River Cruise Jetty located directly adjacent to the ship museum. This 45-minute round-trip boat ride provides a beautiful, breezy break from walking. You will glide up the clean river layout, passing underneath historic old bridges, spotting the traditional wooden houses of Kampung Morten, and taking in the sweeping, massive street-art murals that tell the story of the city\'s ancient trade roots.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Melaka River Cruise Jetty', guideKey: 'melaka-river-cruise' },
      { time: '3:30 PM', id: 'day14-river-walk', title: 'Riverside Walk & Coffee Break', category: 'food',
        desc: [T('Step off the boat and take a slow stroll along the clean, tree-shaded wooden boardwalks. Find a small, hidden riverside cafe to enjoy an ice-cold local drink or a signature Nyonya Cendol (shaved ice dessert with palm sugar and coconut milk) right next to the water.')],
        tags: [tag('Food', 'food')], mapQuery: 'Melaka River Walk', guideKey: 'melaka-river-walk', foodGuideKey: 'melaka-cendol' },
      { time: '5:00 PM', id: 'day14-straits-mosque', title: 'Golden Hour at the Floating Mosque', category: 'spot',
        desc: [T('Take a quick 10-minute Grab car over to the Melaka Straits Mosque on Malacca Island. Walking the perimeter platforms right as the late afternoon sun casts a warm glow over its gold-and-blue dome over the sea is the ultimate grand finale to your sightseeing.')],
        tags: [tag('Spot', 'spot')], mapQuery: 'Melaka Straits Mosque', guideKey: 'melaka-straits-mosque' },
      { time: '5:30 PM', id: 'day14-transit-sentral', title: 'Transit to Melaka Sentral', category: 'bus',
        desc: [T('Take your comfortable express bus transit from Melaka Sentral back to TBS terminal in KL, then hop onto the rail straight back to Pasar Seni Station.')],
        tags: [tag('Bus', 'bus')], mapQuery: 'Melaka Sentral', guideKey: 'bus-to-tbs' },
      { time: '6:30 PM', id: 'day14-return-bus', title: 'Return Bus to Kuala Lumpur', category: 'bus',
        desc: [T('Board your evening express bus for a smooth, air-conditioned ride back to the TBS terminal in KL, then catch the rail link straight back to Pasar Seni Station.')],
        tags: [tag('Bus', 'bus')], mapQuery: 'Melaka Sentral', guideKey: 'bus-to-tbs' },
      { time: '8:30 PM', id: 'day14-late-dinner', title: 'Relaxed Late Dinner', category: 'food',
        desc: [T('Sit down for a comforting, easy late-night dinner right near the hotel to unwind from the travel day.')],
        tags: [tag('Food', 'food')], mapQuery: 'Travelodge Kuala Lumpur City Centre', guideKey: 'early-dinner-in-malacca', foodGuideKey: 'melaka-early-dinner' },
      { time: '9:00 PM', id: 'day14-final-pack', title: 'Final Pack', category: 'hotel',
        desc: [T('Head up to your room at Travelodge to smoothly pack your things, double-check your passports, and get a great night\'s rest before your flight to Singapore the next morning!')],
        tags: [tag('Hotel', 'hotel')], mapQuery: 'Travelodge Kuala Lumpur City Centre', guideKey: 'check-out-travelodge' },
    ],
  },
  {
    day: 15, title: 'DAY 4 \u00B7 July 15 \u2014 KL to Singapore', budgetLabel: 'WAKE UP TIME: 4:00 AM',
    items: [
      { time: '3:15 AM', id: 'day15-wake-up', title: 'Wake up', category: 'hotel',
        desc: [T('Wake up, final packing, check passports.')],
        tags: [tag('Hotel', 'hotel')], mapQuery: 'Travelodge Kuala Lumpur City Centre', guideKey: 'wake-up' },
      { time: '3:45 AM', id: 'day15-check-out', title: 'Check out Travelodge', category: 'hotel',
        desc: [T('Check out of the Travelodge front desk. Walk right out the back door and straight into Pasar Seni LRT Station.')],
        tags: [tag('Hotel', 'hotel')], mapQuery: 'Travelodge Kuala Lumpur City Centre', guideKey: 'check-out-travelodge' },
      { time: '4:00 AM', id: 'day15-grab-klia', title: 'Transit to KLIA', category: 'train',
        desc: [T('Option 1 VIA TRAIN: 1-stop LRT to KL Sentral, then KLIA Ekspres (33 mins) to KLIA Terminal 1. Option 2 VIA GRAB: direct car from Travelodge to KLIA (approx. 50-60 mins).')],
        tags: [tag('Transit', 'train')], mapQuery: 'Kuala Lumpur International Airport (KLIA)', guideKey: 'grab-to-klia' },
      { time: '6:13 AM', id: 'day15-arrive-klia', title: 'Arrive at KLIA', category: 'train',
        desc: [T('Arrive at KLIA, clear the airport flow, and get ready for the flight to Singapore.')],
        tags: [tag('Transit', 'train')], mapQuery: 'Kuala Lumpur International Airport (KLIA)', guideKey: 'klia-check-in' },
      { time: '8:00 AM', id: 'day15-flight-sg', title: 'Flight KL to Singapore', category: 'train',
        desc: [T('Board flight from KLIA to Singapore Changi Airport. Approx. 1 hour flight.')],
        tags: [tag('Transit', 'train')], mapQuery: 'Changi Airport', guideKey: 'flight-departs' },
      { time: '11:00 AM', id: 'day15-land-sg', title: 'Land & Transit to Hotel', category: 'train',
        desc: [T('Touch down at Changi Airport. Take the green East-West Line MRT train 6 stops directly to Paya Lebar MRT Station. Head straight to Hotel Classic by Venue to drop off your day packs.')],
        tags: [tag('MRT', 'train')], mapQuery: 'Paya Lebar MRT Station', guideKey: 'klia-transit-back-to-kl-sentral' },
      { time: '12:15 PM', id: 'day15-geylang-lunch', title: 'Hawker Lunch at Geylang Serai', category: 'food',
        desc: [T('Walk 3 minutes from your hotel to the Geylang Serai Market & Food Centre for a cheap, authentic plate of Nasi Padang or Mee Rebus.')],
        tags: [tag('Food', 'food')], mapQuery: 'Geylang Serai Market & Food Centre', guideKey: 'breakfast-near-hotel', foodGuideKey: 'chinatown-lunch' },
      { time: '1:15 PM', id: 'day15-little-india', title: 'The Vibrant Sights of Little India', category: 'spot',
        desc: [T('Take the MRT from Paya Lebar to Little India MRT Station. Step out into a burst of color and fragrance. Walk down Serangoon Road to admire the intensely detailed, multi-colored carvings on the roof of the Sri Veeramakaliamman Temple. Walk over to the House of Tan Teng Niah, the last surviving Chinese villa in Little India, painted in a striking, vibrant rainbow of colors.')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'Little India Singapore', guideKey: 'a-famosa-porta-de-santiago' },
      { time: '3:00 PM', id: 'day15-haji-lane', title: 'Haji Lane & Sultan Mosque', category: 'spot',
        desc: [T('Take a quick 1-stop MRT ride or walk over to Kampong Glam. Stroll down Haji Lane to see its massive graffiti murals, and walk out to Bussorah Street to frame a gorgeous photo of the golden domes of the Sultan Mosque.')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'Haji Lane Singapore', guideKey: 'harmony-street-jonker-street' },
      { time: '5:00 PM', id: 'day15-gardens-bay', title: 'Gardens by the Bay Outdoor Loop', category: 'spot',
        desc: [T('Head down to the Gardens via MRT. Skip the expensive indoor ticketed domes and explore the massive outdoor themed landscapes, dragonfly lake boardwalks, and the towering Supertree Grove completely for free.')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'Gardens by the Bay', guideKey: 'klcc-park-suria-klcc' },
      { time: '7:45 PM', id: 'day15-garden-rhapsody', title: 'Garden Rhapsody Light Show', category: 'spot',
        desc: [T('Secure a spot on the open-air benches right beneath the giant illuminated Supertrees to watch them dance to a dramatic symphony of lights and music.')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'Supertree Grove', guideKey: 'saloma-bridge' },
      { time: '8:30 PM', id: 'day15-helix-bridge', title: 'Helix Bridge to Spectra Light Show', category: 'walk',
        desc: [T('Cross the beautifully lit geometric arches of the Helix Bridge over to the Marina Bay Sands waterfront to catch the 09:00 PM Spectra Laser & Water Show.')],
        tags: [tag('Walk', 'walk'), tag('Free', 'free')], mapQuery: 'Helix Bridge Singapore', guideKey: 'klcc-to-bukit-bintang-walkway' },
      { time: '9:15 PM', id: 'day15-late-dinner', title: 'Late Dinner & Return to Hotel', category: 'food',
        desc: [T('Grab cheap satay skewers at Makansutra Gluttons Bay right by the water, then take a direct MRT or Grab straight back to Hotel Classic by Venue.')],
        tags: [tag('Food', 'food')], mapQuery: 'Makansutra Gluttons Bay', guideKey: 'dinner-in-chinatown', foodGuideKey: 'jalan-alor-dinner' },
    ],
  },
  {
    day: 16, title: 'DAY 5 \u00B7 July 16 \u2014 Singapore City & Departure', budgetLabel: 'WAKE UP TIME: 5:00 AM',
    items: [
      { time: '5:00 AM', id: 'day16-wake-up', title: 'Morning Prep Only', category: 'hotel',
        desc: [T('Wake up early while the air is crisp. Give yourself a relaxed 30 minutes to wash up, get dressed in your walking clothes, and lace up your shoes. No need to touch your suitcases yet, as you will return to pack later.')],
        tags: [tag('Hotel', 'hotel')], mapQuery: 'Hotel Classic by Venue', guideKey: 'wake-up' },
      { time: '5:30 AM', id: 'day16-transit-mrt', title: 'Early Morning Transit to Downtown', category: 'train',
        desc: [T('Walk directly from the hotel to Paya Lebar MRT Station. Board the very first eastbound green line train heading towards downtown. Ride it 6 stops straight to Raffles Place Station.')],
        tags: [tag('MRT', 'train')], mapQuery: 'Paya Lebar MRT Station', guideKey: 'lrt-to-klcc' },
      { time: '6:00 AM', id: 'day16-merlion', title: 'Merlion Sunrise Experience', category: 'spot',
        desc: [T('Walk out onto the completely empty waterfront boardwalk at Merlion Park. At this hour, the sky will transition from deep indigo to warm golden hues right over Marina Bay Sands. You will have the iconic concrete Merlion statue entirely to yourselves for pristine, crowd-free photos.')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'Merlion Park Singapore', guideKey: 'river-of-life-masjid-jamek-area' },
      { time: '7:15 AM', id: 'day16-kaya-breakfast', title: 'Traditional Kaya Toast Breakfast', category: 'food',
        desc: [T('Walk right off the boardwalk to a nearby local coffee branch like Ya Kun Kaya Toast or Toast Box right in the Raffles Place financial core. Enjoy hot charcoal toast slathered with coconut jam and thick slabs of cold butter, soft-boiled eggs, and a strong cup of hot Kopi or Teh.')],
        tags: [tag('Food', 'food')], mapQuery: 'Raffles Place Singapore', guideKey: 'breakfast-near-chinatown', foodGuideKey: 'chinatown-breakfast' },
      { time: '8:00 AM', id: 'day16-return-hotel', title: 'Rail Transit Back to Hotel', category: 'train',
        desc: [T('Hop back onto the green MRT line at Raffles Place Station and take the direct train back to Paya Lebar Station.')],
        tags: [tag('MRT', 'train')], mapQuery: 'Raffles Place Singapore', guideKey: 'lrt-back-to-pasar-seni' },
      { time: '8:30 AM', id: 'day16-freshen-up', title: 'Freshen Up & Pack Things', category: 'hotel',
        desc: [T('Go back up to your room at Hotel Classic. Use this dedicated 1-hour block to take a relaxing shower, brush your teeth, change out of your walking clothes, do a final sweep for chargers, and zip up your suitcases. Check out completely at the front desk and leave your heavy bags for free with the lobby concierge.')],
        tags: [tag('Hotel', 'hotel')], mapQuery: 'Hotel Classic by Venue', guideKey: 'check-in' },
      { time: '9:30 AM', id: 'day16-joo-chiat', title: 'Joo Chiat Historical Shophouse Roam', category: 'spot',
        desc: [T('Walk 5 minutes from the lobby over to Koon Seng Road. This famous strip features a row of 1920s heritage shophouses adorned with intricate geometric tiles, floral motifs, and ornate pillars. The bright morning light will hit the pastel pink, mint, and yellow facades beautifully. Wander past the classic corner architecture along Joo Chiat Road. Swing by Kim Choo Kueh Chang to look at traditional Nyonya crafts.')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'Koon Seng Road Singapore', guideKey: 'kwai-chai-hong' },
      { time: '11:00 AM', id: 'day16-checkout', title: 'Official Hotel Checkout', category: 'hotel',
        desc: [T('Head back up to your room, grab your zipped suitcases, and officially check out at the front desk well before the noon deadline. Leave your heavy bags for free with the hotel lobby concierge so you can travel hands-free.')],
        tags: [tag('Hotel', 'hotel')], mapQuery: 'Hotel Classic by Venue', guideKey: 'check-out-travelodge' },
      { time: '11:30 AM', id: 'day16-chinatown-sg', title: 'Chinatown Heritage Murals & Tooth Relic Temple', category: 'spot',
        desc: [T('Take the direct Downtown MRT line straight from your hotel area into Chinatown Station. Explore the magnificent, multi-story architecture of the Buddha Tooth Relic Temple (ensure shoulders and knees are covered). Take a slow stroll down Sago Street and Mohamed Ali Lane to spot the hand-painted heritage street murals. Keep an eye out for the traditional Ice Cream Uncles parked under the awnings!')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'Chinatown Singapore', guideKey: 'merdeka-square-river-of-life' },
      { time: '1:00 PM', id: 'day16-hawker-lunch', title: 'Pre-Airport Hawker Lunch', category: 'food',
        desc: [T('Head straight into the bustling Chinatown Complex Food Centre for a cheap, fast, and intensely flavorful final local meal.')],
        tags: [tag('Food', 'food')], mapQuery: 'Chinatown Complex Food Centre Singapore', guideKey: 'lunch-in-chinatown', foodGuideKey: 'chinatown-lunch' },
      { time: '2:00 PM', id: 'day16-airport-run', title: 'Collect Suitcases & Airport Run', category: 'train',
        desc: [T('Take the direct MRT from Chinatown back to Paya Lebar Station and walk into the hotel lobby to collect your stored luggage. Walk right back to the platform turnstiles and catch the green East-West Line train heading directly east toward Changi Airport.')],
        tags: [tag('MRT', 'train')], mapQuery: 'Changi Airport', guideKey: 'klia-transit-back-to-kl-sentral' },
      { time: '3:00 PM', id: 'day16-jewel', title: 'Jewel Changi Rain Vortex Grand Finale', category: 'spot',
        desc: [T('Step off the train at Changi Airport station, tap out your card, and follow the terminal signs straight into the central glass dome. Spend your final 1.5 hours walking the terraced indoor rainforest pathways and watching the spectacular HSBC Rain Vortex indoor waterfall cascade seven stories down from the vaulted glass ceiling. It is completely free and makes for the ultimate farewell photos.')],
        tags: [tag('Spot', 'spot'), tag('Free', 'free')], mapQuery: 'Jewel Changi Airport', guideKey: 'batu-caves' },
      { time: '4:30 PM', id: 'day16-departure', title: 'Flight Check-In & Departure', category: 'train',
        desc: [T('Walk right out of the central dome over to your departure terminal row to drop your bags, clear immigration smoothly, and easily stroll to your gate for your flight out!')],
        tags: [tag('Transit', 'train')], mapQuery: 'Changi Airport', guideKey: 'flight-departs' },
    ],
  },
];

function stringify(v) {
  if (typeof v === 'object' && v !== null && v.kind) {
    if (v.kind === 'text') return 'text(' + O + esc(v.value) + O + ')';
    if (v.kind === 'strong') return 'strong(' + O + esc(v.value) + O + ')';
    if (v.kind === 'place') return 'place(' + O + esc(v.label) + O + ', ' + (v.placeType ? O + v.placeType + O : 'undefined') + ', ' + O + esc(v.mapQuery) + O + ')';
  }
  if (typeof v === 'object' && v !== null && v.label && v.variant) {
    return 'tag(' + O + v.label + O + ', ' + O + v.variant + O + ')';
  }
  return JSON.stringify(v);
}

let out = '';
for (const day of days) {
  out += '    {\n';
  out += '      day: ' + day.day + ',\n';
  out += '      title: ' + O + day.title + O + ',\n';
  out += '      budgetLabel: ' + O + day.budgetLabel + O + ',\n';
  if (day.images) {
    out += '      images: [\n';
    for (const img of day.images) {
      out += '        { title: ' + O + img.title + O + ', url: ' + O + img.url + O + ', label: ' + O + img.label + O + ' },\n';
    }
    out += '      ],\n';
  }
  out += '      items: [\n';
  for (const item of day.items) {
    out += '        {\n';
    out += '          time: ' + O + item.time + O + ',\n';
    out += '          id: ' + O + item.id + O + ',\n';
    out += '          guideKey: ' + O + item.guideKey + O + ',\n';
    out += '          title: ' + O + esc(item.title) + O + ',\n';
    out += '          category: ' + O + item.category + O + ',\n';
    out += '          description: [\n';
    for (const d of item.desc) {
      out += '            ' + stringify(d) + ',\n';
    }
    out += '          ],\n';
    out += '          tags: [\n';
    for (const t of item.tags) {
      out += '            ' + stringify(t) + ',\n';
    }
    out += '          ],\n';
    out += '          mapQuery: ' + O + esc(item.mapQuery) + O + ',\n';
    if (item.foodGuideKey) out += '          foodGuideKey: ' + O + item.foodGuideKey + O + ',\n';
    out += '        },\n';
  }
  out += '      ],\n';
  out += '    },\n';
}
fs.writeFileSync('D:/PROJECT AI/malaysia-singapore-trip-itinerary/scripts/new-days-output.txt', out);
console.log('Done. ' + days.reduce((s,d) => s + d.items.length, 0) + ' items across ' + days.length + ' days');
