import React from "react";

/**
 * Make bus / MRT / train names pop at a glance.
 * Matches rider labels from stationDisplayLabel + common line/bus phrases.
 */
const TRANSIT_RE = new RegExp(
  [
    // Title-Case station + code: "Sanduo Shopping District (R8 · Red Line)"
    // "Hamasen (O1 · Orange Line, old name Sizihwan)" — won't swallow "Transfer to…"
    String.raw`\b[A-Z][A-Za-z0-9'’.\-\/]*(?:\s+[A-Z][A-Za-z0-9'’.\-\/]*){0,5}\s*\(\s*(?:R\d+|O\d+|RK\d+)\s*·\s*(?:Red|Orange)\s+Line[^)]*\)`,
    // HSR stations: "Zuoying HSR (HSR)"
    String.raw`\b[A-Z][A-Za-z0-9'’.\-\/]*(?:\s+[A-Z][A-Za-z0-9'’.\-\/]*){0,5}\s*\(\s*HSR\s*\)`,
    // Parenthetical alone: "(R8 · Red Line…)" / "(HSR)"
    String.raw`\(\s*(?:R\d+|O\d+|RK\d+)\s*·\s*(?:Red|Orange)\s+Line[^)]*\)`,
    String.raw`\(\s*HSR\s*\)`,
    // "R8 · Red Line" without surrounding station name
    String.raw`(?:R\d+|O\d+|RK\d+)\s*·\s*(?:Red|Orange)\s+Line`,
    // Bus numbers as shown on the vehicle
    String.raw`Bus\s+\d+[A-Za-z]?`,
    // Named lines / systems
    String.raw`Kaohsiung\s+Metro\s+(?:Red|Orange)\s+Line`,
    String.raw`Taipei\s+Metro\s+Red\s+Line(?:\s*\([^)]+\))?`,
    String.raw`Taiwan\s+High\s+Speed\s+Rail(?:\s*\(THSR\))?`,
    String.raw`(?:Red|Orange)\s+Line`,
    String.raw`\bTHSR\b`,
    String.raw`\bHSR\b`,
    String.raw`\bMRT\b`,
  ].join("|"),
  "g",
);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Split text into plain / transit chunks (transit = should be bold). */
export function splitTransit(text: string): Array<{ bold: boolean; value: string }> {
  if (!text) return [];
  const out: Array<{ bold: boolean; value: string }> = [];
  let last = 0;
  TRANSIT_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TRANSIT_RE.exec(text)) !== null) {
    if (m.index > last) out.push({ bold: false, value: text.slice(last, m.index) });
    out.push({ bold: true, value: m[0] });
    last = m.index + m[0].length;
    // Avoid zero-length loops
    if (m[0].length === 0) TRANSIT_RE.lastIndex += 1;
  }
  if (last < text.length) out.push({ bold: false, value: text.slice(last) });
  return out;
}

/** React nodes with transit names wrapped in <strong>. */
export function boldTransit(text: string): React.ReactNode {
  const parts = splitTransit(text);
  if (parts.length === 0) return text;
  if (parts.length === 1 && !parts[0].bold) return text;
  return parts.map((p, i) =>
    p.bold ? <strong key={`t-${i}`} className="ja-transit-name">{p.value}</strong> : <React.Fragment key={`t-${i}`}>{p.value}</React.Fragment>,
  );
}

/** HTML string for Leaflet popups/tooltips (escapes non-bold parts). */
export function boldTransitHtml(text: string): string {
  return splitTransit(text)
    .map((p) => (p.bold ? `<b class="ja-transit-name">${escapeHtml(p.value)}</b>` : escapeHtml(p.value)))
    .join("");
}
