import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonInput, IonTextarea, IonButton, IonIcon, IonSelect, IonSelectOption, IonChip, IonSpinner,
} from "@ionic/react";
import { addOutline, locateOutline, trailSignOutline, navigateOutline, stopCircleOutline, trashOutline, mapOutline } from "ionicons/icons";
import type { Session } from "@supabase/supabase-js";
import type { Map as LeafletMap, Marker, LayerGroup } from "leaflet";
import { buildInitialMapItinerary, resolveCoordinatesFromName, type MapDestination, type MapItineraryData, type MapDestinationRow, destinationToRow, rowToDestination, groupDestinationsByDay } from "../data/mapItinerary";
import { supabase, supabaseMapDestinationsTable, tripKey } from "../lib/supabase";
import { makeOfflineCacheKey, readCachedDataset, writeCachedDataset } from "../lib/offlineCache";
import type { SyncStatus, UserTripSettings } from "../types";

type DraftState = { name: string; time: string; notes: string; lat: string; lng: string; };
type UserLocationState = { lat: number; lng: number; accuracy: number | null; updatedAt: number; };
type NominatimSuggestion = { display_name: string; lat: string; lon: string; place_id: number; };

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const timeOptions = (() => { const o: string[] = []; for (let h = 0; h < 24; h += 1) for (const m of [0, 30]) { const pm = h >= 12; const dh = h % 12 === 0 ? 12 : h % 12; o.push(`${dh}:${String(m).padStart(2, "0")} ${pm ? "PM" : "AM"}`); } return o; })();

const lookupPlaces = async (query: string, signal?: AbortSignal): Promise<NominatimSuggestion[]> => {
  const t = query.trim(); if (t.length < 3) return [];
  const r = await fetch(`${NOMINATIM_BASE_URL}?q=${encodeURIComponent(t)}&format=json&limit=5`, { signal, headers: { "User-Agent": "travel-itinerary-app", "Accept-Language": "en" } as HeadersInit });
  if (!r.ok) return []; const p = (await r.json()) as NominatimSuggestion[]; return Array.isArray(p) ? p : [];
};

const createMarkerIcon = (order: number, selected: boolean, anchorOffset: { x: number; y: number } = { x: 0, y: 0 }) =>
  L.divIcon({
    className: "",
    html: `<div class="ja-map-marker ${selected ? "ja-map-marker-selected" : ""}"><span class="ja-map-marker-num">${order}</span></div>`,
    iconSize: [40, 40], iconAnchor: [20 + anchorOffset.x, 20 + anchorOffset.y], popupAnchor: [-anchorOffset.x, -18 - anchorOffset.y],
  });

const escapeHtml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const renderPopup = (dest: MapDestination, order: number) =>
  `<div style="min-width:180px;max-width:220px;"><div style="font-size:13px;font-family:monospace;letter-spacing:0.12em;color:#88B04B;text-transform:uppercase;">Stop ${order}</div><div style="font-weight:700;color:#0B3530;margin-top:4px;">${escapeHtml(dest.name)}</div><div style="font-size:14px;color:#6B7280;margin-top:4px;">${escapeHtml(dest.time)}</div><div style="font-size:14px;color:#374151;line-height:1.45;margin-top:8px;">${escapeHtml(dest.notes)}</div></div>`;

// Same-coordinate stops would otherwise stack exactly on top of each other,
// leaving only the topmost marker clickable. Fan overlapping stops out into a
// small on-screen ring via each icon's pixel anchor — the underlying lat/lng
// (used for the route line and map bounds) stays untouched, and the ring
// stays a constant, clickable size at every zoom level instead of shrinking
// to nothing when zoomed out.
const getOverlapAnchorOffsets = (destinations: MapDestination[]): Map<string, { x: number; y: number }> => {
  const groups = new Map<string, MapDestination[]>();
  destinations.forEach((dest) => {
    const key = `${dest.lat.toFixed(5)},${dest.lng.toFixed(5)}`;
    const group = groups.get(key);
    if (group) group.push(dest); else groups.set(key, [dest]);
  });
  const offsets = new Map<string, { x: number; y: number }>();
  groups.forEach((group) => {
    if (group.length === 1) { offsets.set(group[0].id, { x: 0, y: 0 }); return; }
    const radiusPx = 15;
    group.forEach((dest, i) => {
      const angle = (2 * Math.PI * i) / group.length - Math.PI / 2;
      offsets.set(dest.id, { x: Math.round(radiusPx * Math.cos(angle)), y: Math.round(radiusPx * Math.sin(angle)) });
    });
  });
  return offsets;
};

interface MapTabProps { session: Session | null; canEdit?: boolean; isOnline?: boolean; isActive?: boolean; userSettings?: UserTripSettings | null; currentUser?: { userId: string; email: string; isAdmin: boolean; } | null; }
type SavedByInfo = { userId: string; email: string; };
const formatSavedBy = (e?: string, u?: string) => { if (e) return e.split("@")[0]; if (u) return u.slice(0, 8); return "Unknown"; };
const getSyncDotColor = (v?: SyncStatus | "syncing" | "dirty" | "unsynced") => { if (v === "syncing") return "#64748b"; if (v === "synced") return "#10b981"; return "#f59e0b"; };
const getSyncDotLabel = (v?: SyncStatus | "syncing" | "dirty" | "unsynced") => { if (v === "syncing") return "Syncing"; if (v === "synced") return "Synced"; return "Pending sync"; };
const mapCacheKey = makeOfflineCacheKey(tripKey, "map");
const applyMapSyncStatus = (data: MapItineraryData, ss: SyncStatus): MapItineraryData => ({ ...data, days: data.days.map((d) => ({ ...d, destinations: d.destinations.map((dd) => ({ ...dd, syncStatus: dd.syncStatus ?? ss })) })) });
const mapDestinations = (data: MapItineraryData): MapDestination[] => data.days.flatMap((d) => d.destinations);
const formatMapDayLabel = (dayNumber: number, travelDates: string[] | undefined) => {
  if (!travelDates?.length) return null; const i = dayNumber - 11; const md = travelDates[i]; if (!md) return null;
  const p = new Date(`${md}T00:00:00`); return Number.isNaN(p.getTime()) ? null : p.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function MapTab({ session, canEdit = false, isOnline = true, isActive = true, userSettings = null, currentUser = null }: MapTabProps) {
  const [initialMapCache] = useState(() => readCachedDataset<MapItineraryData>(mapCacheKey) ?? null);
  const [initialMapData] = useState(() => applyMapSyncStatus(initialMapCache?.data ?? buildInitialMapItinerary(), initialMapCache?.dirty ? "pending" : "synced"));
  const [itineraryData, setItineraryData] = useState<MapItineraryData>(() => initialMapData);
  const [selectedDay, setSelectedDay] = useState<number>(() => initialMapData.days[0]?.day ?? 11);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>(() => initialMapData.days[0]?.destinations[0]?.id ?? "");
  const [draft, setDraft] = useState<DraftState>({ name: "", time: "09:00 AM", notes: "", lat: "", lng: "" });
  const [userLocation, setUserLocation] = useState<UserLocationState | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [isTrackingPaused, setIsTrackingPaused] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocationLayerReady, setUserLocationLayerReady] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const userLocationLayerRef = useRef<LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markerRefs = useRef<Record<string, Marker>>({});
  const locationWatchIdRef = useRef<number | null>(null);
  const locationPausedRef = useRef(false);
  const locationShouldPanRef = useRef(false);
  const lastLocationUpdateRef = useRef<{ lat: number; lng: number; updatedAt: number } | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const mapDirtyRef = useRef<boolean>(initialMapCache?.dirty ?? false);
  const pendingDeleteIdsRef = useRef<Set<string>>(new Set());
  const cachedRowsRef = useRef<MapDestinationRow[]>([]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(!supabase);
  const currentSavedBy: SavedByInfo | null = session?.user ? { userId: session.user.id, email: session.user.email ?? "" } : null;
  const canManageDestination = (dest?: MapDestination | null) => { if (!currentUser || !dest) return false; const o = dest.createdBy ?? dest.savedByUserId ?? null; return currentUser.isAdmin || o === currentUser.userId; };
  const saveMapSnapshot = (nextData: MapItineraryData, dirty: boolean) => { mapDirtyRef.current = dirty; writeCachedDataset(mapCacheKey, { data: nextData, syncedSignature: "", dirty }); };
  const getGeolocationErrorMessage = (err: GeolocationPositionError): string => { switch (err.code) { case err.PERMISSION_DENIED: return "Location permission was denied. Enable location access in your browser settings to show where you are."; case err.POSITION_UNAVAILABLE: return "Your current location is unavailable right now. Please check GPS/location services."; case err.TIMEOUT: return "Getting your location took too long. Try again in an open area or with GPS enabled."; default: return "Unable to get your current location."; } };
  const stopLocationTracking = () => { if (locationWatchIdRef.current !== null && navigator.geolocation) { navigator.geolocation.clearWatch(locationWatchIdRef.current); locationWatchIdRef.current = null; } setIsTrackingLocation(false); setIsTrackingPaused(false); locationPausedRef.current = false; locationShouldPanRef.current = false; };
  const shouldAcceptLocationUpdate = (nl: number, ng: number, nu: number) => { const p = lastLocationUpdateRef.current; if (!p) return true; if (nu - p.updatedAt > 30000) return true; const tr = (v: number) => (v * Math.PI) / 180; const e = 6371000; const a = tr(p.lat); const b = tr(nl); const d = tr(nl - p.lat); const e2 = tr(ng - p.lng); const ha = Math.sin(d / 2) * Math.sin(d / 2) + Math.cos(a) * Math.cos(b) * Math.sin(e2 / 2) * Math.sin(e2 / 2); return (2 * e * Math.atan2(Math.sqrt(ha), Math.sqrt(1 - ha))) >= 25; };
  const applyLocationUpdate = (position: GeolocationPosition, allowPan = false) => {
    const nl: UserLocationState = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null, updatedAt: Date.now() };
    if (!shouldAcceptLocationUpdate(nl.lat, nl.lng, nl.updatedAt)) return; lastLocationUpdateRef.current = { lat: nl.lat, lng: nl.lng, updatedAt: nl.updatedAt }; setUserLocation(nl); setLocationError(null);
    const m = mapRef.current; if (allowPan && m) m.setView([nl.lat, nl.lng], Math.max(m.getZoom(), 16), { animate: true });
  };
  const startLocationTracking = (panOnFirstUpdate = false) => {
    if (!navigator.geolocation) return; if (locationWatchIdRef.current !== null) { navigator.geolocation.clearWatch(locationWatchIdRef.current); locationWatchIdRef.current = null; }
    setIsTrackingPaused(false); locationPausedRef.current = false; locationShouldPanRef.current = panOnFirstUpdate;
    locationWatchIdRef.current = navigator.geolocation.watchPosition((pos) => { const sp = locationShouldPanRef.current; locationShouldPanRef.current = false; applyLocationUpdate(pos, sp); }, (err) => { setLocationError(getGeolocationErrorMessage(err)); stopLocationTracking(); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }); setIsTrackingLocation(true);
  };
  const handleLocateMe = () => {
    const gl = navigator.geolocation; if (!gl) { setLocationError("Geolocation is not supported by this browser."); return; }
    if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") { setLocationError("Location requires HTTPS or localhost."); return; }
    setIsLocating(true); setLocationError(null);
    gl.getCurrentPosition((pos) => { applyLocationUpdate(pos, true); setIsLocating(false); }, (err) => { setLocationError(getGeolocationErrorMessage(err)); setIsLocating(false); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  };

  const displayDays = useMemo(() => itineraryData.days.map((day, i) => {
    const rl = formatMapDayLabel(day.day, userSettings?.travelDates); const fd = i === 0; const sn = Math.max(1, i);
    const label = rl ? (fd ? `Flight Day - ${rl}` : `Day ${sn} - ${rl}`) : day.label; return { ...day, label, title: label };
  }), [itineraryData.days, userSettings?.travelDates]);
  const activeDay = useMemo(() => displayDays.find((d) => d.day === selectedDay) ?? displayDays[0] ?? null, [displayDays, selectedDay]);

  // --- Leaflet / Sync useEffects ---
  useEffect(() => {
    if (!supabase) { setMapLoaded(true); return; } if (!isOnline) { setMapLoaded(true); return; }
    let c = false; let ch: ReturnType<typeof supabase.channel> | null = null;
    const loadRemoteMap = async () => {
      const { data, error } = await supabase.from(supabaseMapDestinationsTable).select("*").eq("trip_key", tripKey);
      if (c) return; if (error) { console.warn("Supabase map load failed:", error.message); setMapLoaded(true); return; }
      const rows = (data ?? []) as MapDestinationRow[]; cachedRowsRef.current = rows;
      if (rows.length > 0 && !mapDirtyRef.current) { const d = rows.map(rowToDestination); const days = groupDestinationsByDay(d, (dd) => rows.find((r) => r.id === dd.id)?.day ?? 12); setItineraryData({ ...buildInitialMapItinerary(), days }); saveMapSnapshot({ ...buildInitialMapItinerary(), days }, false); }
      setMapLoaded(true);
    };
    const handleRealtimeEvent = (payload: { eventType: string; new?: Record<string, unknown>; old?: Record<string, unknown> }) => {
      if (mapDirtyRef.current) return; setItineraryData((prev) => {
        const all = mapDestinations(prev);
        if (payload.eventType === "DELETE") { const id = (payload.old?.id ?? payload.new?.id) as string | undefined; if (!id) return prev; return { ...prev, days: groupDestinationsByDay(all.filter((dd) => dd.id !== id), (dd) => prev.days.find((d) => d.destinations.some((ds) => ds.id === dd.id))?.day ?? 12) }; }
        const nr = payload.new as MapDestinationRow | undefined; if (!nr) return prev; cachedRowsRef.current = cachedRowsRef.current.filter((r) => r.id !== nr.id).concat(nr); const up: MapDestination = { ...rowToDestination(nr), syncStatus: "synced" };
        if (payload.eventType === "INSERT") { if (all.some((dd) => dd.id === up.id)) return prev; return { ...prev, days: groupDestinationsByDay([...all, up], (dd) => nr.day) }; }
        if (payload.eventType === "UPDATE") { return { ...prev, days: groupDestinationsByDay(all.map((dd) => dd.id === up.id ? up : dd), (dd) => cachedRowsRef.current.find((r) => r.id === dd.id)?.day ?? nr.day) }; }
        return prev;
      });
    };
    const bootstrap = async () => { await loadRemoteMap(); if (c) return; ch = supabase.channel(`trip-map-sync-${tripKey}`).on("postgres_changes", { event: "*", schema: "public", table: supabaseMapDestinationsTable, filter: `trip_key=eq.${tripKey}` }, handleRealtimeEvent).subscribe(); };
    void bootstrap(); return () => { c = true; if (ch) void supabase.removeChannel(ch); };
  }, [isOnline, session]);

  useEffect(() => {
    if (!mapLoaded) return; if (!supabase || !session || !isOnline) return;
    const ad = mapDestinations(itineraryData); const pd = ad.filter((d) => d.syncStatus === "pending"); const hp = pd.length > 0 || pendingDeleteIdsRef.current.size > 0;
    if (!hp) { saveMapSnapshot(itineraryData, false); return; } saveMapSnapshot(itineraryData, true);
    const to = window.setTimeout(async () => {
      const deletes = Array.from(pendingDeleteIdsRef.current); const upsert = pd.map((d) => { const day = itineraryData.days.find((dd) => dd.destinations.some((ds) => ds.id === d.id)); return destinationToRow(d, tripKey, day?.day ?? 12); });
      const errs: string[] = []; for (const r of upsert) { const { error } = await supabase.from(supabaseMapDestinationsTable).upsert(r, { onConflict: "id" }); if (error) errs.push(error.message); }
      for (const id of deletes) { const { error } = await supabase.from(supabaseMapDestinationsTable).delete().eq("id", id); if (error) errs.push(error.message); }
      if (errs.length > 0) { console.warn("Supabase map sync errors:", errs.join(", ")); return; }
      pendingDeleteIdsRef.current = new Set();
      setItineraryData((prev) => ({ ...prev, days: prev.days.map((day) => ({ ...day, destinations: day.destinations.map((d) => d.syncStatus === "pending" ? { ...d, syncStatus: "synced" as const } : d) })) })); saveMapSnapshot(itineraryData, false);
    }, 300); return () => window.clearTimeout(to);
  }, [itineraryData, isOnline, mapLoaded, session]);

  useEffect(() => { if (!activeDay) return; if (!activeDay.destinations.some((d) => d.id === selectedDestinationId)) setSelectedDestinationId(activeDay.destinations[0]?.id ?? ""); }, [activeDay, selectedDestinationId]);
  useEffect(() => {
    searchAbortRef.current?.abort(); const t = draft.name.trim(); if (t.length < 3) { setSuggestions([]); setIsSearching(false); setActiveSuggestionIndex(-1); return; }
    const ctrl = new AbortController(); searchAbortRef.current = ctrl;
    const to = window.setTimeout(async () => { setIsSearching(true); try { const r = await lookupPlaces(t, ctrl.signal); if (ctrl.signal.aborted) return; setSuggestions(r); setActiveSuggestionIndex(r.length ? 0 : -1); } catch { if (ctrl.signal.aborted) return; setSuggestions([]); } finally { if (!ctrl.signal.aborted) setIsSearching(false); } }, 300);
    return () => { ctrl.abort(); window.clearTimeout(to); };
  }, [draft.name]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: true, scrollWheelZoom: true, preferCanvas: true }).setView([3.139, 101.6869], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    mapRef.current = map; markerLayerRef.current = L.layerGroup().addTo(map); userLocationLayerRef.current = L.layerGroup().addTo(map);
    setUserLocationLayerReady(true);
    const to = window.setTimeout(() => map.invalidateSize(), 150);
    return () => { window.clearTimeout(to); if (locationWatchIdRef.current !== null && navigator.geolocation) { navigator.geolocation.clearWatch(locationWatchIdRef.current); locationWatchIdRef.current = null; } routeLayerRef.current?.remove(); markerLayerRef.current?.remove(); userLocationLayerRef.current?.remove(); map.remove(); mapRef.current = null; markerLayerRef.current = null; userLocationLayerRef.current = null; routeLayerRef.current = null; markerRefs.current = {}; setUserLocationLayerReady(false); setIsTrackingLocation(false); setIsTrackingPaused(false); locationPausedRef.current = false; locationShouldPanRef.current = false; };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => { if (document.hidden) { if (locationWatchIdRef.current !== null && navigator.geolocation) { locationPausedRef.current = true; setIsTrackingPaused(true); navigator.geolocation.clearWatch(locationWatchIdRef.current); locationWatchIdRef.current = null; setIsTrackingLocation(false); locationShouldPanRef.current = false; } return; } if (locationPausedRef.current) setIsTrackingPaused(true); };
    document.addEventListener("visibilitychange", handleVisibilityChange); return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Pause GPS when the user navigates away from the Map tab — Ionic keeps this
  // component mounted, so visibilitychange never fires on an in-app tab switch.
  useEffect(() => {
    if (!isActive && locationWatchIdRef.current !== null && navigator.geolocation) {
      locationPausedRef.current = true;
      setIsTrackingPaused(true);
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
      setIsTrackingLocation(false);
      locationShouldPanRef.current = false;
    }
  }, [isActive]);

  useEffect(() => {
    const map = mapRef.current; const ml = markerLayerRef.current; if (!map || !ml || !activeDay) return;
    ml.clearLayers(); routeLayerRef.current?.remove(); routeLayerRef.current = null; markerRefs.current = {};
    const pts: L.LatLngExpression[] = [];
    const anchorOffsets = getOverlapAnchorOffsets(activeDay.destinations);
    activeDay.destinations.forEach((dest, i) => {
      const isSel = dest.id === selectedDestinationId;
      const offset = anchorOffsets.get(dest.id) ?? { x: 0, y: 0 };
      const m = L.marker([dest.lat, dest.lng], { icon: createMarkerIcon(i + 1, isSel, offset) });
      m.bindPopup(renderPopup(dest, i + 1), { closeButton: false, offset: L.point(0, -10), className: "map-popup-shell" });
      m.on("click", () => setSelectedDestinationId(dest.id)); m.addTo(ml); markerRefs.current[dest.id] = m; pts.push([dest.lat, dest.lng]);
    });
    if (pts.length > 1) { routeLayerRef.current = L.polyline(pts, { color: "#0B3530", weight: 4, opacity: 0.85, dashArray: "8 10" }).addTo(map); }
  }, [activeDay, selectedDestinationId]);

  useEffect(() => {
    const ul = userLocationLayerRef.current; if (!ul || !userLocationLayerReady) return; ul.clearLayers(); if (!userLocation) return;
    const ll: L.LatLngExpression = [userLocation.lat, userLocation.lng];
    const icon = L.divIcon({ className: "", html: `<div class="ja-map-user-marker"><span class="ja-map-user-pulse"></span><span class="ja-map-user-dot"></span></div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
    L.marker(ll, { icon }).bindPopup(`<div style="font-weight:700;color:#0B3530;">You are here</div><div style="font-size:12px;color:#6B7280;margin-top:4px;">Accuracy: ${userLocation.accuracy !== null ? `${Math.round(userLocation.accuracy)} m` : "Unknown"}</div>`, { closeButton: false }).addTo(ul);
    if (userLocation.accuracy !== null && Number.isFinite(userLocation.accuracy)) L.circle(ll, { radius: userLocation.accuracy, color: "#0B3530", weight: 1, opacity: 0.35, fillColor: "#0B3530", fillOpacity: 0.08 }).addTo(ul);
  }, [userLocation, userLocationLayerReady]);

  useEffect(() => {
    const map = mapRef.current; if (!map || !activeDay) return;
    const pts = activeDay.destinations.map((d) => [d.lat, d.lng] as L.LatLngTuple);
    if (pts.length === 0) return;
    if (pts.length === 1) { map.setView(pts[0], 14, { animate: true }); } else { map.fitBounds(L.latLngBounds(pts), { padding: [36, 36] }); }
    const to = window.setTimeout(() => map.invalidateSize(), 50);
    return () => window.clearTimeout(to);
  }, [activeDay?.day, activeDay?.destinations.map((d) => `${d.id}:${d.lat},${d.lng}`).join("|")]);

  useEffect(() => { const map = mapRef.current; const m = selectedDestinationId ? markerRefs.current[selectedDestinationId] : null; if (!map || !m) return; map.panTo(m.getLatLng(), { animate: true, duration: 0.55 }); m.openPopup(); }, [selectedDestinationId, selectedDay]);

  const updateDestination = (id: string, patch: Partial<MapDestination>) => {
    if (!canEdit) return; const t = activeDay?.destinations.find((d) => d.id === id) ?? null; if (!canManageDestination(t)) return;
    setItineraryData((p) => ({ ...p, updatedAt: new Date().toISOString(), days: p.days.map((day) => day.day !== selectedDay ? day : { ...day, destinations: day.destinations.map((d) => d.id === id ? { ...d, ...patch, createdBy: d.createdBy ?? d.savedByUserId, savedByUserId: d.savedByUserId ?? d.createdBy, savedByEmail: d.savedByEmail ?? undefined, syncStatus: "pending" } : d) }) }));
  };
  const selectSuggestion = (suggestion: NominatimSuggestion) => { setDraft((p) => ({ ...p, name: suggestion.display_name, lat: suggestion.lat, lng: suggestion.lon })); setSuggestions([]); setActiveSuggestionIndex(-1); };
  const geocodeDestination = async (name: string) => { const q = name.trim(); if (!q) return resolveCoordinatesFromName(name); try { const r = await lookupPlaces(q); if (r[0]) return { lat: Number(r[0].lat), lng: Number(r[0].lon) }; } catch { } return resolveCoordinatesFromName(name); };
  const addDestination = async (event: React.FormEvent) => {
    event.preventDefault(); if (!canEdit) return; if (!activeDay || !draft.name.trim()) return;
    const tn = draft.name.trim(); const ml = Number.parseFloat(draft.lat); const mg = Number.parseFloat(draft.lng);
    const hc = Number.isFinite(ml) && Number.isFinite(mg); const coords = hc ? { lat: ml, lng: mg } : await geocodeDestination(tn);
    const nd: MapDestination = { id: `dest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: tn, time: draft.time.trim() || "09:00 AM", notes: draft.notes.trim(), lat: coords.lat, lng: coords.lng, createdBy: currentUser?.userId, savedByUserId: currentSavedBy?.userId, savedByEmail: currentSavedBy?.email, syncStatus: "pending" };
    setItineraryData((p) => ({ ...p, updatedAt: new Date().toISOString(), days: p.days.map((day) => day.day === selectedDay ? { ...day, destinations: [...day.destinations, nd] } : day) }));
    setSelectedDestinationId(nd.id); setDraft({ name: "", time: "09:00 AM", notes: "", lat: "", lng: "" }); setSuggestions([]); setIsSearching(false); setActiveSuggestionIndex(-1);
  };
  const deleteDestination = (id: string) => { if (!canEdit) return; if (!canManageDestination(activeDay?.destinations.find((d) => d.id === id) ?? null)) return; pendingDeleteIdsRef.current = new Set(pendingDeleteIdsRef.current).add(id); setItineraryData((p) => ({ ...p, days: p.days.map((day) => day.day === selectedDay ? { ...day, destinations: day.destinations.filter((d) => d.id !== id) } : day) })); };
  const focusDestination = (id: string) => setSelectedDestinationId(id);

  if (!activeDay) {
    return (<div className="ja-map-loading"><div className="ja-map-loading-box">No itinerary map data available yet.</div></div>);
  }

  return (
    <div className="ja-map-page">
      {!isOnline && <div className="ja-map-offline-banner">Offline mode is active. Map edits are cached locally and upload automatically when the connection returns.</div>}

      <IonCard className="ja-map-header-card">
        <IonCardContent>
          <div className="ja-map-header-text">
            <div className="ja-map-eyebrow"><IonIcon icon={mapOutline} />Leaflet itinerary map</div>
            <h3 className="ja-map-header-title">{activeDay.title}</h3>
            <p className="ja-map-header-desc">Tap a destination in the list to pan the map and open its popup. Changes sync when the device is online.</p>
          </div>
          <div className="ja-map-day-row">{displayDays.map((day) => (
            <IonButton key={day.day} size="small" fill={selectedDay === day.day ? "solid" : "outline"} onClick={() => setSelectedDay(day.day)}
              className={`ja-map-day-btn${selectedDay === day.day ? " ja-map-day-btn-active" : ""}`}>{day.label}</IonButton>
          ))}</div>
        </IonCardContent>
      </IonCard>

      <div className="ja-map-layout">
        <section className="ja-map-panel">
          <div className="ja-map-panel-top">
            <div><h4 className="ja-map-panel-title">Map panel</h4><p className="ja-map-panel-desc">OpenStreetMap tiles, numbered markers, and route line by day.</p></div>
            <IonChip className="ja-map-stats-chip">{activeDay.label} | {activeDay.destinations.length} stops</IonChip>
          </div>
          <div className="ja-map-swarm-wrap">
            <div ref={mapContainerRef} className="ja-map-container" />
            <div className="ja-map-overlay-controls">
              <div className="ja-map-controls-row">
                <IonButton size="small" onClick={handleLocateMe} disabled={isLocating} className="ja-map-locate-btn">
                  {isLocating ? <IonSpinner name="crescent" slot="start" /> : <IonIcon icon={locateOutline} slot="start" />}{isLocating ? "Locating..." : "Locate me"}
                </IonButton>
                <IonButton size="small" fill="outline" onClick={() => startLocationTracking(true)} disabled={isTrackingLocation || isLocating} className="ja-map-track-btn"><IonIcon icon={navigateOutline} slot="start" />Track me</IonButton>
                {isTrackingLocation && <IonButton size="small" fill="outline" onClick={stopLocationTracking} className="ja-map-track-btn"><IonIcon icon={stopCircleOutline} slot="start" />Stop</IonButton>}
              </div>
              {isTrackingPaused && <div className="ja-map-banner ja-map-banner-amber">Tracking paused to save battery. Tap Track me to resume.</div>}
              {isTrackingLocation && <div className="ja-map-banner ja-map-banner-emerald">Tracking your location</div>}
              {userLocation && <div className="ja-map-banner ja-map-banner-light">You are here · accuracy {userLocation.accuracy !== null ? `${Math.round(userLocation.accuracy)}m` : "unknown"} · updated {new Date(userLocation.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
              {locationError && <div className="ja-map-banner ja-map-banner-amber">{locationError}</div>}
            </div>
          </div>
        </section>

        <IonCard className="ja-map-panel-card">
          <IonCardHeader className="ja-map-card-header-compact"><IonCardTitle className="ja-map-card-title">Destination list</IonCardTitle><p className="ja-map-card-sub">Inline edit, add, or remove stops for {activeDay.label}.</p></IonCardHeader>
          <IonCardContent className="ja-map-card-body-compact">
            {!canEdit && <div className="ja-map-readonly-card">Sign in to add or edit map destinations.</div>}

            <div className="ja-map-dest-list">
              <form onSubmit={addDestination} className="ja-map-add-form">
                <div className="ja-map-eyebrow"><IonIcon icon={addOutline} />Add destination</div>
                <div className="ja-map-form-grid">
                  <label className="ja-map-search-label">
                    <span className="ja-map-field-label">Name</span>
                    <input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value, lat: "", lng: "" }))} disabled={!canEdit}
                      onKeyDown={(e) => { if (!suggestions.length) return; if (e.key === "ArrowDown") { e.preventDefault(); setActiveSuggestionIndex((i) => (i + 1) % suggestions.length); } if (e.key === "ArrowUp") { e.preventDefault(); setActiveSuggestionIndex((i) => (i - 1 + suggestions.length) % suggestions.length); } if (e.key === "Enter" && activeSuggestionIndex >= 0) { e.preventDefault(); selectSuggestion(suggestions[activeSuggestionIndex]); } }}
                      className="ja-map-search-input" placeholder="Central Market Kuala Lumpur" autoComplete="off" />
                    {(isSearching || suggestions.length > 0) && (
                      <div className="ja-map-autocomplete">
                        {isSearching && <div className="ja-map-autocomplete-loading">Searching places...</div>}
                        {!isSearching && suggestions.map((s, i) => (
                          <button key={`${s.place_id}-${s.display_name}`} type="button" onClick={() => selectSuggestion(s)}
                            className={`ja-map-autocomplete-item${i === activeSuggestionIndex ? " ja-map-autocomplete-item-active" : ""}`}>{s.display_name}</button>
                        ))}
                      </div>
                    )}
                  </label>
                  <label className="ja-map-form-full"><span className="ja-map-field-label">Time</span>
                    <IonSelect value={draft.time} onIonChange={(e) => setDraft((p) => ({ ...p, time: e.detail.value }))} disabled={!canEdit} interface="action-sheet" className="ja-map-select">{timeOptions.map((to) => <IonSelectOption key={to} value={to}>{to}</IonSelectOption>)}</IonSelect>
                  </label>
                </div>
                <label className="ja-map-form-full"><span className="ja-map-field-label">Notes</span><IonTextarea value={draft.notes} onIonInput={(e) => setDraft((p) => ({ ...p, notes: e.detail.value ?? "" }))} disabled={!canEdit} className="ja-map-textarea" placeholder="Short notes for the popup" /></label>
                <IonButton type="submit" expand="block" disabled={!canEdit} className="ja-map-add-btn"><IonIcon icon={addOutline} slot="start" />Add stop</IonButton>
                <p className="ja-map-form-footer">Coordinates are resolved from the place name automatically.</p>
              </form>

              {activeDay.destinations.length === 0 ? (
                <IonCard className="ja-map-empty-card"><IonCardContent><div className="ja-map-empty-text">No destinations yet for {activeDay.label}. Add the first stop above.</div></IonCardContent></IonCard>
              ) : activeDay.destinations.map((d, i) => {
                const isActive = d.id === selectedDestinationId;
                const isEditable = canManageDestination(d);
                return (
                  <article key={d.id} className={`ja-map-dest-card${isActive ? " ja-map-dest-card-active" : ""}`}>
                    <button type="button" onClick={() => focusDestination(d.id)} className="ja-map-dest-btn">
                      <span className="ja-map-dest-num">{i + 1}</span>
                      <div className="ja-map-dest-info">
                        <div className="ja-map-dest-stop-label">Stop {i + 1}</div>
                        <div className="ja-map-dest-name">{d.name}</div>
                        <div className="ja-map-dest-meta">
                          <IonChip className="ja-map-list-chip">{d.time}</IonChip>
                          <IonChip className="ja-map-list-chip">{d.lat.toFixed(4)}, {d.lng.toFixed(4)}</IonChip>
                          {(d.savedByEmail || d.savedByUserId) && <IonChip className="ja-map-list-chip">{formatSavedBy(d.savedByEmail, d.savedByUserId)}</IonChip>}
                          <span className="ja-map-sync-dot" style={{ backgroundColor: getSyncDotColor(d.syncStatus) }} title={getSyncDotLabel(d.syncStatus)} aria-label={getSyncDotLabel(d.syncStatus)} />
                        </div>
                      </div>
                    </button>
                    {isEditable ? (
                      <div className="ja-map-dest-edit">
                        <div className="ja-map-dest-edit-grid">
                          <label className="ja-map-field-col"><span className="ja-map-field-label">Name</span><IonInput value={d.name} onIonInput={(e) => updateDestination(d.id, { name: e.detail.value ?? "" })} onFocus={() => focusDestination(d.id)} disabled={!canEdit} className="ja-map-input-sm" /></label>
                          <label className="ja-map-field-col"><span className="ja-map-field-label">Time</span><IonInput value={d.time} onIonInput={(e) => updateDestination(d.id, { time: e.detail.value ?? "" })} onFocus={() => focusDestination(d.id)} disabled={!canEdit} className="ja-map-input-sm" /></label>
                        </div>
                        <label className="ja-map-form-full"><span className="ja-map-field-label">Notes</span><IonTextarea value={d.notes} onIonInput={(e) => updateDestination(d.id, { notes: e.detail.value ?? "" })} onFocus={() => focusDestination(d.id)} disabled={!canEdit} className="ja-map-textarea-sm" /></label>
                        <div className="ja-map-dest-actions">
                          <IonButton size="small" onClick={() => focusDestination(d.id)} className="ja-map-pan-btn"><IonIcon icon={locateOutline} slot="start" />Pan map</IonButton>
                          <IonButton size="small" fill="outline" onClick={() => deleteDestination(d.id)} className="ja-map-delete-btn"><IonIcon icon={trashOutline} slot="start" />Delete</IonButton>
                        </div>
                      </div>
                    ) : (
                      <div className="ja-map-dest-view">
                        <div className="ja-map-dest-notes">{d.notes}</div>
                        <div className="ja-map-dest-actions">
                          <IonButton size="small" onClick={() => focusDestination(d.id)} className="ja-map-pan-btn"><IonIcon icon={locateOutline} slot="start" />Pan map</IonButton>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="ja-map-footer-text">Local cache with Supabase sync and live cross-tab updates.</div>
          </IonCardContent>
        </IonCard>
      </div>
    </div>
  );
}
