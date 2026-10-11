# map+ (Map+ page)

Taiwan transit companion page inside jessie-amor. Route: **`/map-plus`**
(also reachable from the "Map+" item in the nav / More drawer).
All UI text is English; Chinese names are shown as a small secondary label
(useful for matching the sign on the bus / stop).

## What it does
- Leaflet map of Taiwan (OpenStreetMap tiles).
- Toggleable overlays:
  - **Kaohsiung Metro** Red Line (R3 Siaogang → RK1 Gangshan) + Orange Line (O1 → OT1)
  - **Taipei Metro Red Line** (R28 Tamsui → R02 Xiangshan)
  - **Taiwan HSR** (Nangang → Zuoying, 12 stations)
  - **Kaohsiung buses (hotel area)** — real routes from OpenStreetMap that stop
    within ~700 m of Hub Hotel Yisin / MRT Shijia (R7) / MRT Sanduo (R8):
    | No. | Name | Outbound (往程) |
    | --- | --- | --- |
    | 100 | Department Store Trunk Line 百貨幹線 | Ruifeng → Bo'ai Rd (Hanshin Arena) |
    | 70A | Sanduo Trunk Line 三多幹線 | Qianzhen → Chengcing Lake |
    | 205 | Zhonghua Trunk Line 中華幹線 | Jiachang → Dream Mall / Sankuaicuo |
    | 90 | Minzu Trunk Line 民族幹線 | HSR Depot / THSR Zuoying → SKM (MRT Sanduo) |
    | 12A | 12A | Siaogang → Kaohsiung Main Station |
    | 69A | Siaogang Trunk Line 小港幹線 | Siaogang → Kaohsiung Main Station |
    | 26 | 26 路 | Ruifeng → Kaohsiung Medical University (via Yisin 1st Rd) |
    | 36 | 36 路 | Qianzhen → Dream Mall → Kaohsiung Main Station |
    | Red 21 East | 紅21東 | Baohua → LRT Kaohsiung Exhibition Center |
  - **Chiayi / NCCU buses**:
    | No. | Name | Notes |
    | --- | --- | --- |
    | 7309 | Chiayi ↔ National Chung Cheng University (to Nanhua Univ.) | Main bus from Chiayi TRA to NCCU, ~38 min |
    | 7306 | Meishan ↔ Minxiong (via NCCU) | Minxiong TRA → NCCU, ~9 min |
    | 7212 BRT | Chiayi BRT: THSR Chiayi ↔ Chiayi TRA (rear) | HSR → city, then 7309 |
    | Yellow 9 | THSR Chiayi ↔ National Palace Museum Southern Branch | |
    | 106 | Taiwan Tourist Shuttle, Palace Museum South Line | **Suspended since 1 Sep 2026** — hidden by default, grey dashed sketch |
- Each bus route can be shown/hidden individually from the legend checkboxes.
- Tap a **bus line** → route number, English + Chinese name, start → end, key
  stops, notes, source link. Tap a **stop/station** → name, Chinese name, and
  the next stop in each direction.
- **📍 Locate me**: browser geolocation → blue dot + accuracy circle, zooms in,
  dashed line + popup to the nearest station/stop, and the 5 nearest
  stations/bus stops (enabled, non-suspended routes) with distance and ~walk
  minutes (80 m/min, straight line).

## Gaps / caveats
- **No direct Kaohsiung ↔ Chiayi bus currently**: Ho-Hsin 7502 (Kaohsiung–Chiayi)
  stopped on 27 Jun 2025; Ubus 1610 / Kuo-Kuang 1834 do not link the two cities.
  Use HSR (Zuoying → Chiayi, then BRT 7212 + 7309) or TRA (Kaohsiung → Chiayi or
  Minxiong, then 7309/7306).
- Only the outbound (往程) direction is drawn; the return runs roughly the reverse
  (one-way streets can differ slightly).
- Route data is a snapshot of OpenStreetMap (11 Oct 2026); routes/stops can change.
  Always confirm the number and destination on the bus.

## Run
```bash
cd /Users/jessiejayrubi/Documents/jessie-amor
npm run dev          # vite on port 3000
# open http://localhost:3000/khaoshiong/map-plus  (trip slug prefix + /map-plus)
```
Geolocation needs a secure context: works on `http://localhost` on the Mac, but
on a phone use the deployed `https://` site (a LAN `http://192.168.x.x:3000`
URL will be refused location by the browser).

## Code
- `src/components/MapPlusPage.tsx` – page (Leaflet, no react-leaflet)
- `src/components/MapPlusPage.css` – scoped `mp-` styles
- `src/data/taiwanTransit.ts` – metro/HSR lines, overlay groups, nearest-station helper
- `src/data/taiwanBusRoutes.ts` – **generated** bus routes (stops + simplified geometry)
- `src/App.tsx` / `src/components/Navigation.tsx` – route + nav entry

## Data sources
- Metro + Taipei/Zuoying HSR coords: OpenStreetMap `railway=station` nodes via
  Overpass (Oct 2026). © OpenStreetMap contributors, ODbL.
- Kaohsiung Orange Line O10–OT1 and other HSR stations: approximate public
  station locations (~100 m).
- Bus routes: OpenStreetMap `type=route route=bus` relations via Overpass API
  (11 Oct 2026). Relation IDs: 100 → 3233081, 70A → 3350574, 205 → 2380139,
  90 → 2378641, 12A → 3805220, 69A → 3813488, 26 → 3586712, 36 → 3359849,
  Red 21 East → 2564356, 7309 → 11087539, 7306 → 8703321, 7212 → 5426451,
  Yellow 9 → 6822203 (each popup links to its relation). Ways stitched in order
  and simplified (~5 m). Stop English names from OSM `name:en`; Chiayi county
  stops without `name:en` were romanized by hand.
- NCCU bus guidance (7309/7306, Activity Center stop): https://www.ccu.edu.tw/p/404-1000-25658.php
- 7306 stop list cross-check: https://taiwanhelper.com/bus/THB/THB7306
- 106 suspension + Palace Museum South buses: https://south.npm.gov.tw/Visit/Traffic/MassTransit.htm
- 7502 suspension: Ho-Hsin notice (ebus.com.tw, May 2025), via PTT Bus board.

### Regenerating bus data
Query Overpass for the relation IDs above with `out geom;` + member nodes, stitch
the `role=""` ways, take `stop`/`platform` member nodes as stops, and write
`src/data/taiwanBusRoutes.ts` in the same shape.
