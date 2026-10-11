import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPlusPage.css";
import {
  DEFAULT_HIDDEN_LINE_IDS,
  OVERLAYS,
  TAIWAN_BOUNDS,
  TAIWAN_CENTER,
  findNearestStations,
  type NearestResult,
  type OverlayKey,
  type TransitLine,
} from "../data/taiwanTransit";

type Props = { isActive?: boolean };
type LocateState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "error"; message: string }
  | { status: "found"; lat: number; lng: number; accuracy: number; nearest: NearestResult[] };

const WALK_M_PER_MIN = 80;
const escapeHtml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtMeters = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const fmtWalk = (m: number) => (m > 5000 ? "too far to walk" : `~${Math.max(1, Math.round(m / WALK_M_PER_MIN))} min walk`);
const kindLabel = (line: TransitLine) =>
  line.kind === "hsr" ? "HSR" : line.kind === "bus" ? `Bus${line.ref ? " " + line.ref : ""}` : "Metro";

/** Up to `max` evenly spaced stops (always first + last). */
const keyStops = (line: TransitLine, max = 8) => {
  const st = line.stations;
  if (st.length <= max) return st;
  const out = [st[0]];
  for (let i = 1; i < max - 1; i += 1) out.push(st[Math.round((i * (st.length - 1)) / (max - 1))]);
  out.push(st[st.length - 1]);
  return out;
};

const routePopup = (line: TransitLine) => {
  const first = line.stations[0];
  const last = line.stations[line.stations.length - 1];
  return `<div class="mp-popup">
    <div class="mp-popup-line" style="color:${line.color}">${escapeHtml(kindLabel(line))} · ${escapeHtml(line.city)}</div>
    <div class="mp-popup-name">${line.ref ? `<span class="mp-code" style="background:${line.color}">${escapeHtml(line.ref)}</span> ` : ""}${escapeHtml(line.name)}</div>
    ${line.suspended ? `<div class="mp-popup-warn">⚠️ Not running right now (suspended).</div>` : ""}
    ${first && last ? `<div class="mp-popup-dir"><b>${escapeHtml(first.name)}</b> → <b>${escapeHtml(last.name)}</b> (${line.stations.length} stops)</div>` : ""}
    ${line.kind === "bus" ? `<div class="mp-popup-stops"><b>Key stops:</b><ol>${keyStops(line).map((st) => `<li>${escapeHtml(st.name)}</li>`).join("")}</ol></div>` : ""}
    ${line.note ? `<div class="mp-popup-note">${escapeHtml(line.note)}</div>` : ""}
    ${line.kind === "bus" ? `<div class="mp-popup-note">Shown direction is outbound; the return bus runs roughly the reverse. Check the number and destination sign on the bus.</div>` : ""}
    ${line.source ? `<div class="mp-popup-src"><a href="${escapeHtml(line.source)}" target="_blank" rel="noopener noreferrer">Source</a></div>` : ""}
  </div>`;
};

const stationPopup = (line: TransitLine, idx: number) => {
  const st = line.stations[idx];
  const first = line.stations[0];
  const last = line.stations[line.stations.length - 1];
  const prev = line.stations[idx - 1];
  const next = line.stations[idx + 1];
  return `<div class="mp-popup">
    <div class="mp-popup-line" style="color:${line.color}">${escapeHtml(kindLabel(line))} · ${escapeHtml(line.name)}</div>
    <div class="mp-popup-name">${st.code ? `<span class="mp-code" style="background:${line.color}">${escapeHtml(st.code)}</span> ` : ""}${escapeHtml(st.name)}</div>
    <div class="mp-popup-dir">${prev ? `← toward <b>${escapeHtml(first.name)}</b>: next ${escapeHtml(prev.name)}<br/>` : ""}${next ? `→ toward <b>${escapeHtml(last.name)}</b>: next ${escapeHtml(next.name)}` : ""}</div>
    ${line.suspended ? `<div class="mp-popup-warn">⚠️ This route is suspended — use another bus.</div>` : ""}
    ${line.approximate ? `<div class="mp-popup-note">Approximate line — confirm the route number at the stop.</div>` : ""}
  </div>`;
};

export default function MapPlusPage({ isActive = true }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef<Partial<Record<OverlayKey, LayerGroup>>>({});
  const lineLayersRef = useRef<Record<string, LayerGroup>>({});
  const userLayerRef = useRef<LayerGroup | null>(null);
  const hasLocatedRef = useRef(false);
  const [enabled, setEnabled] = useState<Record<OverlayKey, boolean>>({
    kaohsiungMetro: true,
    taipeiRed: true,
    hsr: true,
    busKaohsiung: true,
    busChiayi: true,
  });
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(() => new Set(DEFAULT_HIDDEN_LINE_IDS));
  const toggleLine = (id: string) =>
    setHiddenLines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const [locate, setLocate] = useState<LocateState>({ status: "idle" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = OVERLAYS.filter((o) => enabled[o.key]).length;

  // Close the filter modal with Escape.
  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  const legendGroups = useMemo(() => OVERLAYS.map((o) => ({ overlay: o, lines: o.lines })), []);

  // Init map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, preferCanvas: true, maxBounds: [[20.5, 118.5], [26.8, 123.5]] }).setView(TAIWAN_CENTER, 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    map.fitBounds(TAIWAN_BOUNDS);

    OVERLAYS.forEach((overlay) => {
      const group = L.layerGroup();
      overlay.lines.forEach((line) => {
        const lineGroup = L.layerGroup();
        const coords = line.path ?? line.stations.map((st) => [st.lat, st.lng] as [number, number]);
        L.polyline(coords, {
          color: line.color,
          weight: line.kind === "hsr" ? 5 : line.kind === "bus" ? 3.5 : 4,
          opacity: line.suspended ? 0.5 : line.kind === "bus" ? 0.75 : 0.85,
          dashArray: line.approximate ? "8 8" : undefined,
        })
          .bindTooltip(`${line.ref && line.kind === "bus" ? `Bus ${line.ref} · ` : ""}${line.name}${line.approximate ? " (approx.)" : ""}`, { sticky: true })
          .bindPopup(routePopup(line), { maxWidth: 300 })
          .addTo(lineGroup);
        line.stations.forEach((st, idx) => {
          L.circleMarker([st.lat, st.lng], {
            radius: line.kind === "bus" ? 4 : 6,
            color: line.color,
            weight: 2,
            fillColor: "#ffffff",
            fillOpacity: 1,
          })
            .bindPopup(stationPopup(line, idx), { maxWidth: 260 })
            .bindTooltip(`${line.kind === "bus" && line.ref ? `[${line.ref}] ` : ""}${st.code ? st.code + " " : ""}${st.name}`, { direction: "top", offset: [0, -6] })
            .addTo(lineGroup);
        });
        lineLayersRef.current[line.id] = lineGroup;
        if (!DEFAULT_HIDDEN_LINE_IDS.includes(line.id)) lineGroup.addTo(group);
      });
      group.addTo(map);
      layersRef.current[overlay.key] = group;
    });

    userLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // Ionic may mount this page while hidden (0×0). When the container gets a
    // real size, recompute Leaflet's size and re-fit Taiwan (unless located).
    let wasEmpty = true;
    const ro = new ResizeObserver(() => {
      const el = containerRef.current;
      if (!el) return;
      const empty = el.clientWidth === 0 || el.clientHeight === 0;
      map.invalidateSize();
      if (wasEmpty && !empty && !hasLocatedRef.current) map.fitBounds(TAIWAN_BOUNDS);
      wasEmpty = empty;
    });
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layersRef.current = {};
      lineLayersRef.current = {};
      userLayerRef.current = null;
    };
  }, []);

  // Ionic keeps hidden pages mounted; fix tile sizing when the page is shown again.
  useEffect(() => {
    if (!isActive || !mapRef.current) return;
    const t = window.setTimeout(() => mapRef.current?.invalidateSize(), 120);
    return () => window.clearTimeout(t);
  }, [isActive]);

  // Toggle overlays.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (Object.keys(enabled) as OverlayKey[]).forEach((key) => {
      const group = layersRef.current[key];
      if (!group) return;
      if (enabled[key] && !map.hasLayer(group)) group.addTo(map);
      if (!enabled[key] && map.hasLayer(group)) map.removeLayer(group);
    });
  }, [enabled]);

  // Show / hide individual routes inside an overlay.
  useEffect(() => {
    OVERLAYS.forEach((overlay) => {
      const group = layersRef.current[overlay.key];
      if (!group) return;
      overlay.lines.forEach((line) => {
        const lg = lineLayersRef.current[line.id];
        if (!lg) return;
        const shouldShow = !hiddenLines.has(line.id);
        if (shouldShow && !group.hasLayer(lg)) group.addLayer(lg);
        if (!shouldShow && group.hasLayer(lg)) group.removeLayer(lg);
      });
    });
  }, [hiddenLines]);

  const activeLines = (): TransitLine[] => {
    const usable = (l: TransitLine) => !l.suspended && !hiddenLines.has(l.id);
    const lines = OVERLAYS.filter((o) => enabled[o.key]).flatMap((o) => o.lines).filter(usable);
    return lines.length ? lines : OVERLAYS.flatMap((o) => o.lines).filter((l) => !l.suspended);
  };

  const showUser = (lat: number, lng: number, accuracy: number) => {
    const map = mapRef.current;
    const layer = userLayerRef.current;
    if (!map || !layer) return;
    const nearest = findNearestStations(lat, lng, activeLines(), 5);
    layer.clearLayers();
    L.circle([lat, lng], { radius: Math.min(accuracy, 1500), color: "#2563EB", weight: 1, fillOpacity: 0.12 }).addTo(layer);
    L.circleMarker([lat, lng], { radius: 8, color: "#ffffff", weight: 3, fillColor: "#2563EB", fillOpacity: 1 })
      .bindTooltip("You are here", { permanent: false, direction: "top" })
      .addTo(layer);
    const best = nearest[0];
    if (best) {
      L.polyline([[lat, lng], [best.station.lat, best.station.lng]], { color: "#2563EB", weight: 3, dashArray: "4 6" }).addTo(layer);
      L.popup({ closeButton: true, autoClose: false, closeOnClick: false })
        .setLatLng([best.station.lat, best.station.lng])
        .setContent(
          `<div class="mp-popup"><div class="mp-popup-line" style="color:${best.line.color}">Nearest · ${escapeHtml(kindLabel(best.line))}</div><div class="mp-popup-name">${escapeHtml(best.station.name)}</div><div class="mp-popup-dir">${escapeHtml(best.line.name)}<br/>${fmtMeters(best.meters)} · ${fmtWalk(best.meters)}</div></div>`,
        )
        .addTo(layer);
      const bounds = L.latLngBounds([[lat, lng], [best.station.lat, best.station.lng]]);
      if (best.meters < 20000) map.fitBounds(bounds.pad(0.6), { maxZoom: 17 });
      else map.setView([lat, lng], 13);
    } else {
      map.setView([lat, lng], 15);
    }
    hasLocatedRef.current = true;
    setLocate({ status: "found", lat, lng, accuracy, nearest });
  };

  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      setLocate({ status: "error", message: "This browser does not support location. Tell Grok where you are instead." });
      return;
    }
    if (!window.isSecureContext) {
      setLocate({ status: "error", message: "Location needs HTTPS (or localhost). Open the deployed https:// site on your phone." });
      return;
    }
    setLocate({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => showUser(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy ?? 50),
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow location for this site in your browser/phone settings, then tap Locate me again."
            : err.code === err.TIMEOUT
              ? "Finding your location took too long. Move near a window/outside and try again."
              : "Could not get your location. Try again in a moment.";
        setLocate({ status: "error", message });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  };

  return (
    <div className="mp-page">
      <div className="mp-header">
        <div>
          <h1 className="mp-title">Map+</h1>
          <p className="mp-sub">Taiwan trains &amp; buses — tap a line or stop to check the route number, direction and next stop. Open Filters to locate yourself.</p>
        </div>
      </div>

      {locate.status === "error" && <div className="mp-alert mp-alert-error">{locate.message}</div>}
      {locate.status === "found" && (
        <div className="mp-alert">
          {locate.nearest.length === 0 ? (
            "No stations loaded."
          ) : (
            <>
              <div className="mp-nearest-title">Nearest stations &amp; bus stops (GPS accuracy ±{Math.round(locate.accuracy)} m)</div>
              <ol className="mp-nearest">
                {locate.nearest.map((n) => (
                  <li key={`${n.line.id}-${n.station.code ?? n.station.name}`}>
                    <span className="mp-dot" style={{ background: n.line.color }} />
                    <b>{n.station.name}</b> — {n.line.kind === "bus" ? `Bus · ${n.line.name}` : kindLabel(n.line)} · {n.line.city} · {fmtMeters(n.meters)} ({fmtWalk(n.meters)})
                  </li>
                ))}
              </ol>
              <div className="mp-hint">Straight-line distance; real walking route is usually a bit longer.</div>
            </>
          )}
        </div>
      )}

      <div className="mp-map-wrap">
        <div ref={containerRef} className="mp-map" />
        <button
          type="button"
          className="mp-fab"
          onClick={() => setFiltersOpen(true)}
          aria-label="Open map filters"
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M3 5h18l-7 8.5V19l-4 2v-7.5L3 5z" fill="currentColor" />
          </svg>
          <span className="mp-fab-badge">{activeFilterCount}</span>
        </button>
      </div>

      <div className="mp-key" aria-label="Line colors">
        {legendGroups.map(({ overlay, lines }) =>
          lines
            .filter((line) => enabled[overlay.key] && !hiddenLines.has(line.id))
            .map((line) => (
              <span key={line.id} className="mp-key-item">
                <span
                  className={`mp-swatch ${line.approximate ? "is-dashed" : ""}`}
                  style={{ borderColor: line.color, background: line.approximate ? "transparent" : line.color }}
                />
                {line.kind === "bus" && line.ref ? `Bus ${line.ref}` : line.name}
              </span>
            )),
        )}
        <span className="mp-key-item">
          <span className="mp-swatch mp-swatch-user" /> You
        </span>
      </div>
      <p className="mp-hint">
        Bus routes come from OpenStreetMap — always confirm the route number and destination on the front of the bus. No direct Kaohsiung ↔
        Chiayi bus right now: use HSR (Zuoying → Chiayi) or TRA trains.
      </p>

      {filtersOpen && (
        <div className="mp-modal-backdrop" onClick={() => setFiltersOpen(false)}>
          <div
            className="mp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mp-filters-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mp-modal-head">
              <h2 id="mp-filters-title" className="mp-modal-title">Filters</h2>
              <button type="button" className="mp-modal-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                ✕
              </button>
            </div>
            <div className="mp-modal-body">
              <div className="mp-modal-locate">
                <button
                  type="button"
                  className="mp-locate"
                  onClick={handleLocate}
                  disabled={locate.status === "locating"}
                >
                  {locate.status === "locating" ? "Locating…" : "📍 Locate me"}
                </button>
                {locate.status === "error" && (
                  <p className="mp-modal-locate-hint mp-modal-locate-error">{locate.message}</p>
                )}
                {locate.status === "found" && locate.nearest[0] && (
                  <p className="mp-modal-locate-hint">
                    Nearest: <b>{locate.nearest[0].station.name}</b> ({fmtMeters(locate.nearest[0].meters)})
                  </p>
                )}
              </div>
              {legendGroups.map(({ overlay, lines }) => (
                <div key={overlay.key} className={`mp-legend-group ${enabled[overlay.key] ? "" : "is-off"}`}>
                  <label className={`mp-toggle ${enabled[overlay.key] ? "is-on" : ""}`}>
                    <input
                      type="checkbox"
                      checked={enabled[overlay.key]}
                      onChange={(e) => setEnabled((prev) => ({ ...prev, [overlay.key]: e.target.checked }))}
                    />
                    <b>{overlay.label}</b>
                  </label>
                  {lines.map((line) => {
                    const visible = !hiddenLines.has(line.id);
                    const isBus = line.kind === "bus";
                    return (
                      <label key={line.id} className={`mp-legend-row ${visible ? "" : "is-off"} ${isBus ? "is-toggle" : ""}`}>
                        {isBus ? (
                          <input
                            type="checkbox"
                            checked={visible}
                            onChange={() => toggleLine(line.id)}
                            aria-label={`Show bus ${line.ref ?? line.name}`}
                          />
                        ) : null}
                        <span
                          className={`mp-swatch ${line.approximate ? "is-dashed" : ""}`}
                          style={{ borderColor: line.color, background: line.approximate ? "transparent" : line.color }}
                        />
                        <span>
                          {isBus && line.ref ? (
                            <span className="mp-ref" style={{ background: line.suspended ? "#9E9E9E" : line.color }}>
                              {line.ref}
                            </span>
                          ) : null}{" "}
                          <b>{line.name}</b>
                          {line.note ? <span className="mp-legend-note"> — {line.note}</span> : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mp-modal-foot">
              <button type="button" className="mp-modal-done" onClick={() => setFiltersOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
