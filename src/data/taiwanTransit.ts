// Static Taiwan transit data for the Map+ page (/map-plus).
//
// Sources:
// - Metro (Taipei Red Line, Kaohsiung Red/Orange Line) station coordinates:
//   OpenStreetMap railway=station nodes (Overpass API, pulled Oct 2026).
//   Kaohsiung Orange Line O10–OT1 are hand-placed approximations.
// - HSR: Taipei + Zuoying from OSM, other stations from public station
//   locations (approximate to ~100 m).
// - Buses: real numbered routes from OpenStreetMap route relations (see
//   ./taiwanBusRoutes.ts, generated). Kaohsiung city buses around Hub Hotel
//   Yisin / Sanduo / Shihjia, and Chiayi county buses to CCU (7309, 7306),
//   Chiayi BRT 7212 and Yellow 9. Always confirm the route number on the bus.
// OSM data © OpenStreetMap contributors (ODbL).

import { BUS_ROUTES } from "./taiwanBusRoutes";

export type TransitKind = "metro" | "hsr" | "bus";

export type TransitStation = {
  code?: string;
  name: string;
  zh?: string;
  lat: number;
  lng: number;
};

export type TransitLine = {
  id: string;
  name: string;
  zh: string;
  kind: TransitKind;
  city: string;
  color: string;
  /** Dashed line = approximate geometry. */
  approximate?: boolean;
  note?: string;
  stations: TransitStation[];
  /** Optional extra shape points (bus corridors). Defaults to station order. */
  path?: [number, number][];
  /** Bus route number as shown on the bus (e.g. "70A", "7309"). */
  ref?: string;
  /** Bus grouping for the overlay toggles. */
  group?: "kaohsiung" | "chiayi";
  /** Route no longer running — hidden by default, shown greyed out. */
  suspended?: boolean;
  /** Where the geometry / info came from. */
  source?: string;
};

const s = (code: string, name: string, zh: string, lat: number, lng: number): TransitStation => ({ code, name, zh, lat, lng });


/** Short color name for rider-facing labels: "Red Line", "Orange Line", "HSR". */
export const lineColorLabel = (line: TransitLine): string => {
  if (line.kind === "hsr") return "HSR";
  if (/orange/i.test(line.name) || line.id.includes("orange")) return "Orange Line";
  if (/red/i.test(line.name) || line.id.includes("red")) return "Red Line";
  return "Metro";
};

/**
 * Rider-facing station label with line color.
 * Metro: "Sanduo Shopping District (R8 · Red Line)"
 * Taipei: "Tamsui (R28 · Red Line)"
 * HSR:   "Zuoying HSR (HSR)"
 * Bus:   plain English name (no code/line suffix)
 * Render with boldTransit() / boldTransitHtml() so codes & lines stand out.
 */
export const stationDisplayLabel = (line: TransitLine, station: TransitStation): string => {
  const name = station.name;
  if (line.kind === "hsr") {
    return /\(HSR\)\s*$/.test(name) ? name : `${name} (HSR)`;
  }
  if (line.kind === "bus" || !station.code) return name;
  return `${name} (${station.code} · ${lineColorLabel(line)})`;
};

/** Lookup by code on a line → full rider label. */
export const stationLabelByCode = (line: TransitLine, code: string): string => {
  const st = line.stations.find((x) => x.code === code);
  if (!st) throw new Error(`Unknown station ${code} on ${line.id}`);
  return stationDisplayLabel(line, st);
};


export const TAIPEI_RED_LINE: TransitLine = {
  id: "taipei-red",
  name: "Taipei Metro Red Line (Tamsui–Xinyi)",
  zh: "台北捷運 淡水信義線",
  kind: "metro",
  city: "Taipei",
  color: "#E3002C",
  note: "Trains run Tamsui ↔ Xiangshan. Check the platform sign for direction.",
  stations: [
    s("R28", "Tamsui", "淡水", 25.16778, 121.44557),
    s("R27", "Hongshulin", "紅樹林", 25.15441, 121.45883),
    s("R26", "Zhuwei", "竹圍", 25.13697, 121.45951),
    s("R25", "Guandu", "關渡", 25.1257, 121.46714),
    s("R24", "Zhongyi", "忠義", 25.13095, 121.47337),
    s("R23", "Fuxinggang", "復興崗", 25.13749, 121.4855),
    s("R22", "Beitou", "北投", 25.13193, 121.49859),
    s("R21", "Qiyan", "奇岩", 25.1256, 121.50114),
    s("R20", "Qilian", "唭哩岸", 25.1209, 121.50613),
    s("R19", "Shipai", "石牌", 25.11461, 121.51552),
    s("R18", "Mingde", "明德", 25.10986, 121.51877),
    s("R17", "Zhishan", "芝山", 25.103, 121.52252),
    s("R16", "Shilin", "士林", 25.09349, 121.52625),
    s("R15", "Jiantan", "劍潭", 25.08429, 121.52498),
    s("R14", "Yuanshan", "圓山", 25.07142, 121.52014),
    s("R13", "Minquan W. Rd.", "民權西路", 25.06285, 121.5194),
    s("R12", "Shuanglian", "雙連", 25.05763, 121.5207),
    s("R11", "Zhongshan", "中山", 25.05263, 121.52039),
    s("R10", "Taipei Main Station", "台北車站", 25.04624, 121.51747),
    s("R09", "NTU Hospital", "台大醫院", 25.04165, 121.51618),
    s("R08", "Chiang Kai-Shek Memorial Hall", "中正紀念堂", 25.0337, 121.51755),
    s("R07", "Dongmen", "東門", 25.03384, 121.52926),
    s("R06", "Daan Park", "大安森林公園", 25.03356, 121.53528),
    s("R05", "Daan", "大安", 25.03333, 121.54355),
    s("R04", "Xinyi Anhe", "信義安和", 25.03313, 121.55273),
    s("R03", "Taipei 101/World Trade Center", "台北101/世貿", 25.03298, 121.56245),
    s("R02", "Xiangshan", "象山", 25.03287, 121.56976),
  ],
};

export const KAOHSIUNG_RED_LINE: TransitLine = {
  id: "kaohsiung-red",
  name: "Kaohsiung Metro Red Line",
  zh: "高雄捷運 紅線",
  kind: "metro",
  city: "Kaohsiung",
  color: "#E2231A",
  note: "Northbound trains say \"toward Gangshan Station\"; southbound say \"toward Siaogang\". Hotel stations: Sanduo Shopping District (R8 · Red Line) and Shihjia (R7 · Red Line). Transfer to Orange Line at Formosa Boulevard (R10 · Red Line / O5 · Orange Line); Zuoying HSR at Zuoying (R16 · Red Line).",
  stations: [
    s("R3", "Siaogang", "小港", 22.5647, 120.3541),
    s("R4", "Kaohsiung International Airport", "高雄國際機場", 22.5701, 120.3412),
    s("R4A", "Caoya", "草衙", 22.58055, 120.32877),
    s("R5", "Cianjhen Senior High School", "前鎮高中", 22.58841, 120.32174),
    s("R6", "Kaisyuan", "凱旋", 22.59702, 120.31511),
    s("R7", "Shihjia", "獅甲", 22.60618, 120.30788),
    s("R8", "Sanduo Shopping District", "三多商圈", 22.61415, 120.30442),
    s("R9", "Central Park", "中央公園", 22.62487, 120.30112),
    s("R10", "Formosa Boulevard", "美麗島", 22.63139, 120.30186),
    s("R11", "Kaohsiung Main Station", "高雄車站", 22.63934, 120.30265),
    s("R12", "Houyi", "後驛", 22.64774, 120.30322),
    s("R13", "Aozihdi", "凹子底", 22.65712, 120.30308),
    s("R14", "Kaohsiung Arena", "巨蛋", 22.66562, 120.30326),
    s("R15", "Ecological District", "生態園區", 22.67646, 120.30634),
    s("R16", "Zuoying", "左營", 22.68817, 120.30902),
    s("R17", "World Games", "世運", 22.70175, 120.30251),
    s("R18", "Oil Refinery Elementary School", "油廠國小", 22.70875, 120.30231),
    s("R19", "Nanzih Technology Industrial Park", "楠梓科技園區", 22.71871, 120.30717),
    s("R20", "Houjing", "後勁", 22.72235, 120.31625),
    s("R21", "Metropolitan Park", "都會公園", 22.72961, 120.32093),
    s("R22", "Cingpu", "青埔", 22.74441, 120.31772),
    s("R22A", "Ciaotou Sugar Refinery", "橋頭糖廠", 22.75356, 120.31455),
    s("R23", "Ciaotou Station", "橋頭火車站", 22.76093, 120.31069),
    s("R24", "KMU Gangshan Hospital", "岡山高醫", 22.78075, 120.30173),
    s("RK1", "Gangshan Station", "岡山車站", 22.7926, 120.29906),
  ],
};

export const KAOHSIUNG_ORANGE_LINE: TransitLine = {
  id: "kaohsiung-orange",
  name: "Kaohsiung Metro Orange Line",
  zh: "高雄捷運 橘線",
  kind: "metro",
  city: "Kaohsiung",
  color: "#F39800",
  note: "Hamasen (O1 · Orange Line, old name Sizihwan) ↔ Daliao. Westbound trains say \"toward Hamasen\". East end (O10–OT1) positions approximate.",
  stations: [
    s("O1", "Hamasen", "哈瑪星", 22.62137, 120.2748),
    s("O2", "Yanchengpu", "鹽埕埔", 22.62416, 120.28408),
    s("O4", "Cianjin", "前金", 22.62897, 120.29463),
    s("O5", "Formosa Boulevard", "美麗島", 22.63139, 120.30186),
    s("O6", "Sinyi Elementary School", "信義國小", 22.63073, 120.31145),
    s("O7", "Cultural Center", "文化中心", 22.63027, 120.31762),
    s("O8", "Wukuaicuo", "五塊厝", 22.62947, 120.32765),
    s("O9", "Lingya Sports Park", "苓雅運動園區", 22.62725, 120.33464),
    s("O10", "Weiwuying", "衛武營", 22.6253, 120.3415),
    s("O11", "Fongshan West", "鳳山西站", 22.6254, 120.3502),
    s("O12", "Fongshan", "鳳山", 22.626, 120.3577),
    s("O13", "Dadong", "大東", 22.6248, 120.3643),
    s("O14", "Fongshan Junior High School", "鳳山國中", 22.6223, 120.3772),
    s("OT1", "Daliao", "大寮", 22.6216, 120.391),
  ],
};

export const HSR_LINE: TransitLine = {
  id: "hsr",
  name: "Taiwan High Speed Rail (THSR)",
  zh: "台灣高鐵",
  kind: "hsr",
  city: "West corridor",
  color: "#F26B21",
  note: "Nangang ↔ Zuoying HSR. Our Day 3 plan: Zuoying HSR → Chiayi HSR, then taxi to CCU (National Chung Cheng University). Bus backup: BRT 7212 to Chiayi TRA, then 7309 to CCU.",
  stations: [
    s("NAG", "Nangang HSR", "南港", 25.0531, 121.607),
    s("TPE", "Taipei HSR", "台北", 25.04755, 121.51705),
    s("BAQ", "Banqiao HSR", "板橋", 25.0137, 121.4637),
    s("TAY", "Taoyuan HSR", "桃園", 25.013, 121.2149),
    s("HSC", "Hsinchu HSR", "新竹", 24.8081, 121.0402),
    s("MIL", "Miaoli HSR", "苗栗", 24.6054, 120.8254),
    s("TAC", "Taichung HSR", "台中", 24.1123, 120.6157),
    s("CHH", "Changhua HSR", "彰化", 23.8743, 120.5745),
    s("YUL", "Yunlin HSR", "雲林", 23.7362, 120.4165),
    s("CHY", "Chiayi HSR", "嘉義", 23.4595, 120.3233),
    s("TAN", "Tainan HSR", "台南", 22.9248, 120.2858),
    s("ZUY", "Zuoying HSR", "左營", 22.68724, 120.30767),
  ],
};

export const KAOHSIUNG_BUS_LINES: TransitLine[] = BUS_ROUTES.filter((l) => l.group === "kaohsiung");
export const CHIAYI_BUS_LINES: TransitLine[] = BUS_ROUTES.filter((l) => l.group === "chiayi");
export const BUS_LINES: TransitLine[] = BUS_ROUTES;

/** Lines hidden on first load (e.g. suspended routes). */
export const DEFAULT_HIDDEN_LINE_IDS: string[] = BUS_ROUTES.filter((l) => l.suspended).map((l) => l.id);

export type OverlayKey = "taipeiRed" | "kaohsiungMetro" | "hsr" | "busKaohsiung" | "busChiayi";

export const OVERLAYS: { key: OverlayKey; label: string; lines: TransitLine[] }[] = [
  { key: "kaohsiungMetro", label: "Kaohsiung Metro (Red + Orange)", lines: [KAOHSIUNG_RED_LINE, KAOHSIUNG_ORANGE_LINE] },
  { key: "taipeiRed", label: "Taipei Red Line", lines: [TAIPEI_RED_LINE] },
  { key: "hsr", label: "High Speed Rail", lines: [HSR_LINE] },
  { key: "busKaohsiung", label: "Kaohsiung buses (hotel area)", lines: KAOHSIUNG_BUS_LINES },
  { key: "busChiayi", label: "Chiayi / CCU buses", lines: CHIAYI_BUS_LINES },
];

export const TAIWAN_CENTER: [number, number] = [23.7, 120.95];
export const TAIWAN_BOUNDS: [[number, number], [number, number]] = [[21.85, 119.95], [25.35, 122.05]];

/** Great-circle distance in meters. */
export const haversineMeters = (aLat: number, aLng: number, bLat: number, bLng: number): number => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export type NearestResult = { station: TransitStation; line: TransitLine; meters: number };

export const findNearestStations = (lat: number, lng: number, lines: TransitLine[], limit = 3): NearestResult[] => {
  const seen = new Set<string>();
  const all: NearestResult[] = [];
  lines.forEach((line) => {
    line.stations.forEach((station) => {
      const key = `${line.id}:${station.code ?? station.name}`;
      if (seen.has(key)) return;
      seen.add(key);
      all.push({ station, line, meters: haversineMeters(lat, lng, station.lat, station.lng) });
    });
  });
  return all.sort((a, b) => a.meters - b.meters).slice(0, limit);
};
