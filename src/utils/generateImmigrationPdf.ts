import { jsPDF } from "jspdf";
import { itinerary, TRAVELER_1, TRAVELER_2 } from "../data/code1Itinerary";
import type { PdfItineraryDay, TripProfile } from "../types";

export function buildDefaultItineraryDays(): PdfItineraryDay[] {
  return itinerary.days.map((day) => ({
    day: day.day,
    title: day.title,
    items: day.items.map((item) => ({ time: item.time, title: item.title })),
  }));
}

export function generateImmigrationPdf(tripProfile: TripProfile | null | undefined) {
  const p = tripProfile;
  const title = p?.documentTitle || "Jessie & Amor's Malaysia - Singapore Trip 2026";
  const t1 = p?.traveler1 ?? TRAVELER_1;
  const t2 = p?.traveler2 ?? TRAVELER_2;
  const purpose = p?.purpose ?? "Tourism - sightseeing, cultural exploration, culinary experience";
  const duration = p?.duration ?? "5 days";
  const route = p?.route ?? "Kuala Lumpur, Malaysia - Malacca (day trip) - Singapore";
  const arrivalMy = p?.arrivalMalaysia ?? "July 12, 2026 at 01:30 AM";
  const arrivalAirport = p?.arrivalAirport ?? "Kuala Lumpur International Airport (KLIA)";
  const departureSg = p?.departureSg ?? "July 16, 2026 (morning)";
  const departureAirportSg = p?.departureAirportSg ?? "Changi Airport (SIN)";
  const hotels = p?.hotels ?? [
    { hotel: "Travelodge KL City Centre", location: "Kuala Lumpur", checkIn: "July 12, 2026", checkOut: "July 15, 2026" },
    { hotel: "Hotel Classic by Venue", location: "Joo Chiat, Singapore", checkIn: "July 15, 2026", checkOut: "July 16, 2026" },
  ];
  const days = p?.itineraryDays?.length ? p.itineraryDays : itinerary.days;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const M = 18, PW = 190; let y = 22;
  const clean = (s: string) => s.replace(/’|‘/g, "'").replace(/“|”/g, '"').replace(/–|—/g, "-").replace(/→/g, "-").replace(/·/g, ".").replace(/•/g, "-").replace(/…/g, "...").replace(/ /g, " ").replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();
  const sec = (t: string) => { y += 3; doc.setDrawColor(11, 53, 48); doc.setLineWidth(0.5); doc.line(M, y, PW + M - 8, y); y += 5; doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(11, 53, 48); doc.text(clean(t).toUpperCase(), M, y); y += 6; };
  const kv = (k: string, v: string) => { doc.setFontSize(9.5); doc.setFont("helvetica", "bold"); doc.setTextColor(60, 60, 60); doc.text(clean(k), M, y); const kw = doc.getTextWidth(clean(k) + " "); doc.setFont("helvetica", "normal"); doc.setTextColor(26, 26, 26); doc.text(clean(v), M + kw, y); y += 4.8; };
  const np = () => { if (y > 270) { doc.addPage(); y = 22; } };
  doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(11, 53, 48); doc.text(clean(title), M, y); y += 8;
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255); doc.setFillColor(11, 53, 48);
  const badgeText = `TOURISM  ${duration.toUpperCase()}`;
  const bw = doc.getTextWidth(badgeText) + 8; doc.roundedRect(M, y, bw, 6, 3, 3, "F"); doc.text(badgeText, M + 4, y + 4.5); y += 12;
  doc.setDrawColor(11, 53, 48); doc.setLineWidth(1); doc.line(M, y, PW + M - 8, y); y += 8;
  sec("Traveler Information"); kv("Traveler 1:", t1); kv("Traveler 2:", t2); kv("Purpose:", purpose); kv("Duration:", duration); kv("Route:", route);
  sec("Flight Details"); kv("Arrival in Malaysia:", `${arrivalMy} - ${arrivalAirport}`); kv("Departure:", `${departureSg} - ${departureAirportSg}`);
  sec("Accommodation"); np();
  const cw = [65, 40, 38, 39], th = ["Hotel", "Location", "Check-in", "Check-out"];
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(11, 53, 48); let cx = M; th.forEach((h, i) => { doc.text(h, cx + 1, y); cx += cw[i]; });
  doc.setDrawColor(11, 53, 48); doc.line(M, y + 1, M + cw.reduce((a, b) => a + b, 0), y + 1); y += 5;
  const hr = (r: string[]) => { let rx = M; r.forEach((c2, i) => { doc.setFontSize(8.5); doc.setFont("helvetica", i === 0 ? "bold" : "normal"); doc.setTextColor(26, 26, 26); doc.text(clean(c2), rx + 1, y); rx += cw[i]; }); y += 4.5; };
  hotels.forEach((h) => hr([h.hotel, h.location, h.checkIn, h.checkOut]));
  sec("Daily Itinerary"); days.forEach((day) => { np(); doc.setFontSize(9.5); doc.setFont("helvetica", "bold"); doc.setTextColor(11, 53, 48); doc.text(clean(day.title), M, y); y += 4.5; day.items.forEach((item) => { np(); doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(50, 50, 50); doc.text(clean(item.time), M + 3, y); const tw2 = doc.getTextWidth(clean(item.time)) + 5; doc.setFont("helvetica", "normal"); doc.setTextColor(26, 26, 26); doc.text(clean(item.title), M + 3 + tw2, y); y += 4; }); y += 2; });
  doc.save("Immigration_Document.pdf");
}
