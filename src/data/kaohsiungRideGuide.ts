// "How to ride" cheat sheet for the Kaohsiung trip home page.
//
// Every station, line and bus name here is read straight from the Map+ data
// (./taiwanTransit.ts + ./taiwanBusRoutes.ts), so the trip page and
// /khaoshiong/map-plus always show the exact same English names.

import { BUS_LINES, HSR_LINE, KAOHSIUNG_ORANGE_LINE, KAOHSIUNG_RED_LINE, stationLabelByCode, type TransitLine } from "./taiwanTransit";

const stationName = (line: TransitLine, code: string): string => {
  const st = line.stations.find((s) => s.code === code);
  if (!st) throw new Error(`Unknown station ${code} on ${line.id}`);
  return st.name;
};

/** "Sanduo Shopping District (R8 · Red Line)" — same name as Map+ popup. */
export const stationLabel = (line: TransitLine, code: string): string => stationLabelByCode(line, code);

const R = (code: string) => stationLabel(KAOHSIUNG_RED_LINE, code);
const O = (code: string) => stationLabel(KAOHSIUNG_ORANGE_LINE, code);
const HSR = (code: string) => stationLabel(HSR_LINE, code);

export const RED_LINE_NAME = KAOHSIUNG_RED_LINE.name; // "Kaohsiung Metro Red Line"
export const ORANGE_LINE_NAME = KAOHSIUNG_ORANGE_LINE.name; // "Kaohsiung Metro Orange Line"
export const HSR_NAME = HSR_LINE.name; // "Taiwan High Speed Rail (THSR)"

/** Direction text exactly as it appears on platform signs (= last station). */
export const RED_NORTHBOUND = `toward ${stationName(KAOHSIUNG_RED_LINE, "RK1")}`; // toward Gangshan Station
export const RED_SOUTHBOUND = `toward ${stationName(KAOHSIUNG_RED_LINE, "R3")}`; // toward Siaogang
export const ORANGE_WESTBOUND = `toward ${stationName(KAOHSIUNG_ORANGE_LINE, "O1")}`; // toward Hamasen

export type RideHotelStation = { label: string; line: string; color: string; note: string };

export const HOTEL_STATIONS: RideHotelStation[] = [
  {
    label: R("R8"),
    line: RED_LINE_NAME,
    color: KAOHSIUNG_RED_LINE.color,
    note: "Arrival / bags / taxi curb. Day 1 airport stop + Day 2 Formosa transfer + Day 5 bags-to-airport. Walk ~12 min from Hub, or short taxi with luggage.",
  },
  {
    label: R("R7"),
    line: RED_LINE_NAME,
    color: KAOHSIUNG_RED_LINE.color,
    note: "Closer walk from Hub (~8–10 min). Prefer for Day 3 Zuoying and Day 5 Lotus when you have no heavy bags. One stop south of Sanduo.",
  },
];

export type RideStep = { day: string; title: string; color: string; steps: string[] };

export const MRT_RIDES: RideStep[] = [
  {
    day: "Day 1 · Oct 17",
    title: "Airport → hotel",
    color: KAOHSIUNG_RED_LINE.color,
    steps: [`Red Line ${RED_NORTHBOUND}`, `${R("R4")} → ${R("R8")}`, "No transfer · then short taxi to Hub"],
  },
  {
    day: "Day 2 · Oct 18",
    title: "Hotel → Consulate / Cijin ferry",
    color: KAOHSIUNG_ORANGE_LINE.color,
    steps: [
      `Red Line ${RED_NORTHBOUND}: ${R("R8")} → ${R("R10")}`,
      `Transfer to Orange Line ${ORANGE_WESTBOUND}: ${O("O5")} → ${O("O1")} (last stop, old name Sizihwan)`,
    ],
  },
  {
    day: "Day 3 · Oct 19",
    title: "Hotel → Chiayi (CCU) and back",
    color: HSR_LINE.color,
    steps: [
      `Red Line ${RED_NORTHBOUND}: ${R("R7")} → ${R("R16")} (prefer Shihjia — no Sanduo needed)`,
      `High Speed Rail: ${HSR("ZUY")} → ${HSR("CHY")} · then taxi to CCU (National Chung Cheng University)`,
      `Return: ${HSR("CHY")} → ${HSR("ZUY")}, Red Line ${RED_SOUTHBOUND}: ${R("R16")} → ${R("R7")}`,
    ],
  },
  {
    day: "Day 5 · Oct 21",
    title: "Lotus Pond, then airport",
    color: KAOHSIUNG_RED_LINE.color,
    steps: [
      `Lotus Pond option: Red Line ${RED_NORTHBOUND}: ${R("R7")} → ${R("R16")}, then short Uber (or Uber direct Hub → pagodas)`,
      `Airport with bags: Red Line ${RED_SOUTHBOUND}: ${R("R8")} → ${R("R4")} (taxi curb); alt light bags: ${R("R7")} → ${R("R4")}`,
    ],
  },
];

export type RideBus = { ref: string; name: string; color: string; note: string };

const bus = (id: string): RideBus => {
  const line = BUS_LINES.find((l) => l.id === id);
  if (!line) throw new Error(`Unknown bus ${id}`);
  return { ref: line.ref ?? "", name: line.name, color: line.color, note: line.note ?? "" };
};

/** Backup buses — same numbers, names and colors as the Map+ bus layer. */
export const KAOHSIUNG_BUSES: RideBus[] = ["bus-k70a", "bus-k100", "bus-k90", "bus-k12a", "bus-k26"].map(bus);
export const CHIAYI_BUSES: RideBus[] = ["bus-c7212", "bus-c7309", "bus-c7306"].map(bus);
