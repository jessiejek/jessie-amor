import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Route, Plus, Trash2, LocateFixed } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import type { Map as LeafletMap, Marker, LayerGroup } from "leaflet";
import {
  buildEmptyMapItinerary,
  resolveCoordinatesFromName,
  normalizeMapItinerary,
  type MapDestination,
  type MapItineraryData,
} from "../data/mapItinerary";
import { hasSupabaseConfig, supabase, supabaseMapTable, tripKey } from "../lib/supabase";

type DraftState = {
  name: string;
  time: string;
  notes: string;
  lat: string;
  lng: string;
};

type NominatimSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
};

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

const timeOptions = (() => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30]) {
      const isPm = hour >= 12;
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayMinute = minute.toString().padStart(2, "0");
      const suffix = isPm ? "PM" : "AM";
      options.push(`${displayHour}:${displayMinute} ${suffix}`);
    }
  }
  return options;
})();

const lookupPlaces = async (query: string, signal?: AbortSignal): Promise<NominatimSuggestion[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(trimmed)}&format=json&limit=5`;
  const response = await fetch(url, {
    signal,
    headers: {
      "User-Agent": "travel-itinerary-app",
      "Accept-Language": "en",
    } as HeadersInit,
  });

  if (!response.ok) return [];
  const payload = (await response.json()) as NominatimSuggestion[];
  return Array.isArray(payload) ? payload : [];
};

const createMarkerIcon = (order: number, selected: boolean) =>
  L.divIcon({
    className: "",
    html: `
      <div class="${selected ? "scale-110 bg-[#0B3530] text-white ring-4 ring-[#88B04B]/30" : "bg-white text-[#0B3530] ring-2 ring-[#0B3530]/15"} flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform">
        <span class="text-[11px] font-bold font-mono">${order}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderPopup = (destination: MapDestination, order: number) => `
  <div style="min-width: 180px; max-width: 220px;">
    <div style="font-size: 13px; font-family: monospace; letter-spacing: 0.12em; color: #88B04B; text-transform: uppercase;">Stop ${order}</div>
    <div style="font-weight: 700; color: #0B3530; margin-top: 4px;">${escapeHtml(destination.name)}</div>
    <div style="font-size: 14px; color: #6B7280; margin-top: 4px;">${escapeHtml(destination.time)}</div>
    <div style="font-size: 14px; color: #374151; line-height: 1.45; margin-top: 8px;">${escapeHtml(destination.notes)}</div>
  </div>
`;

interface MapTabProps {
  session: Session | null;
  canEdit?: boolean;
}

type SavedByInfo = {
  userId: string;
  email: string;
};

type SupabaseMapRow = {
  trip_key: string;
  data: MapItineraryData;
  saved_by_user_id: string | null;
  saved_by_email: string | null;
};

export default function MapTab({ session: authSession, canEdit = false }: MapTabProps) {
  const [session, setSession] = useState<Session | null>(authSession);
  const [itineraryData, setItineraryData] = useState<MapItineraryData>(() => buildEmptyMapItinerary());
  const [selectedDay, setSelectedDay] = useState<number>(() => buildEmptyMapItinerary().days[0]?.day ?? 11);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>(
    () => buildEmptyMapItinerary().days[0]?.destinations[0]?.id ?? "",
  );
  const [draft, setDraft] = useState<DraftState>({
    name: "",
    time: "09:00 AM",
    notes: "",
    lat: "",
    lng: "",
  });
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markerRefs = useRef<Record<string, Marker>>({});
  const searchAbortRef = useRef<AbortController | null>(null);
  const mapSignatureRef = useRef<string>("");
  const mapLoadedRef = useRef<boolean>(!hasSupabaseConfig);
  const currentSavedBy: SavedByInfo | null = session?.user
    ? {
        userId: session.user.id,
        email: session.user.email ?? "",
      }
    : null;

  const activeDay = useMemo(
    () => itineraryData.days.find((day) => day.day === selectedDay) ?? itineraryData.days[0] ?? null,
    [itineraryData.days, selectedDay],
  );

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [authSession]);

  useEffect(() => {
    if (!supabase || !session) {
      mapLoadedRef.current = true;
      setItineraryData(buildEmptyMapItinerary());
      return;
    }

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadRemoteMap = async () => {
      const { data, error } = await supabase
        .from(supabaseMapTable)
        .select("trip_key, data, saved_by_user_id, saved_by_email")
        .eq("trip_key", tripKey)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.warn("Supabase map load failed:", error.message);
        mapLoadedRef.current = true;
        return;
      }

      const remoteData = data?.data as MapItineraryData | undefined;
      if (remoteData?.days?.length) {
        const normalized = normalizeMapItinerary(remoteData);
        mapSignatureRef.current = JSON.stringify(normalized);
        setItineraryData(normalized);
      } else {
        const empty = buildEmptyMapItinerary();
        mapSignatureRef.current = JSON.stringify(empty);
        setItineraryData(empty);
      }

      mapLoadedRef.current = true;
    };

    const bootstrap = async () => {
      await loadRemoteMap();
      if (cancelled) return;

      channel = supabase
        .channel(`trip-map-sync-${tripKey}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: supabaseMapTable,
            filter: `trip_key=eq.${tripKey}`,
          },
          (payload) => {
            if (payload.eventType === "DELETE") {
              const empty = buildEmptyMapItinerary();
              mapSignatureRef.current = JSON.stringify(empty);
              setItineraryData(empty);
              return;
            }

            const nextData = payload.new?.data as MapItineraryData | undefined;
            if (!nextData?.days?.length) return;
            const normalized = normalizeMapItinerary(nextData);
            mapSignatureRef.current = JSON.stringify(normalized);
            setItineraryData(normalized);
          },
        )
        .subscribe();
    };

    void bootstrap();

    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [session]);

  useEffect(() => {
    if (!supabase || !session) {
      mapLoadedRef.current = true;
      return;
    }

    if (!mapLoadedRef.current) return;

    const currentSignature = JSON.stringify(itineraryData);
    if (currentSignature === mapSignatureRef.current) return;

    const timeout = window.setTimeout(async () => {
      const payload: SupabaseMapRow = {
        trip_key: tripKey,
        data: itineraryData,
        saved_by_user_id: currentSavedBy?.userId ?? null,
        saved_by_email: currentSavedBy?.email ?? null,
      };
      const { error } = await supabase.from(supabaseMapTable).upsert(payload, { onConflict: "trip_key" });

      if (error) {
        console.warn("Supabase map sync failed:", error.message);
        return;
      }

      mapSignatureRef.current = currentSignature;
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [itineraryData, session]);

  useEffect(() => {
    if (!activeDay) return;

    const stillExists = activeDay.destinations.some((destination) => destination.id === selectedDestinationId);
    if (!stillExists) {
      setSelectedDestinationId(activeDay.destinations[0]?.id ?? "");
    }
  }, [activeDay, selectedDestinationId]);

  useEffect(() => {
    searchAbortRef.current?.abort();
    const trimmed = draft.name.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await lookupPlaces(trimmed, controller.signal);
        if (controller.signal.aborted) return;
        setSuggestions(results);
        setActiveSuggestionIndex(results.length ? 0 : -1);
      } catch {
        if (controller.signal.aborted) return;
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [draft.name]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      preferCanvas: true,
    }).setView([3.139, 101.6869], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);

    const timeout = window.setTimeout(() => map.invalidateSize(), 150);

    return () => {
      window.clearTimeout(timeout);
      routeLayerRef.current?.remove();
      markerLayerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      routeLayerRef.current = null;
      markerRefs.current = {};
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer || !activeDay) return;

    markerLayer.clearLayers();
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;
    markerRefs.current = {};

    const points: L.LatLngExpression[] = [];

    activeDay.destinations.forEach((destination, index) => {
      const isSelected = destination.id === selectedDestinationId;
      const marker = L.marker([destination.lat, destination.lng], {
        icon: createMarkerIcon(index + 1, isSelected),
      });

      marker.bindPopup(renderPopup(destination, index + 1), {
        closeButton: false,
        offset: L.point(0, -10),
        className: "map-popup-shell",
      });

      marker.on("click", () => {
        setSelectedDestinationId(destination.id);
      });

      marker.addTo(markerLayer);
      markerRefs.current[destination.id] = marker;
      points.push([destination.lat, destination.lng]);
    });

    if (points.length > 1) {
      routeLayerRef.current = L.polyline(points, {
        color: "#0B3530",
        weight: 4,
        opacity: 0.85,
        dashArray: "8 10",
      }).addTo(map);
    }
  }, [activeDay, selectedDestinationId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeDay) return;

    const points = activeDay.destinations.map((destination) => [destination.lat, destination.lng] as L.LatLngTuple);
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
    } else {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [36, 36] });
    }

    window.setTimeout(() => map.invalidateSize(), 50);
  }, [activeDay?.day, activeDay?.destinations.map((destination) => `${destination.id}:${destination.lat},${destination.lng}`).join("|")]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = selectedDestinationId ? markerRefs.current[selectedDestinationId] : null;
    if (!map || !marker) return;

    map.panTo(marker.getLatLng(), { animate: true, duration: 0.55 });
    marker.openPopup();
  }, [selectedDestinationId, selectedDay]);

  const updateDestination = (destinationId: string, patch: Partial<MapDestination>) => {
    if (!canEdit) return;
    setItineraryData((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      days: prev.days.map((day) => {
        if (day.day !== selectedDay) return day;
        return {
          ...day,
          destinations: day.destinations.map((destination) =>
            destination.id === destinationId
              ? {
                  ...destination,
                  ...patch,
                  savedByUserId: currentSavedBy?.userId ?? destination.savedByUserId,
                  savedByEmail: currentSavedBy?.email ?? destination.savedByEmail,
                }
              : destination,
          ),
        };
      }),
    }));
  };

  const selectSuggestion = (suggestion: NominatimSuggestion) => {
    setDraft((prev) => ({
      ...prev,
      name: suggestion.display_name,
      lat: suggestion.lat,
      lng: suggestion.lon,
    }));
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  const geocodeDestination = async (name: string) => {
    const query = name.trim();
    if (!query) return resolveCoordinatesFromName(name);

    try {
      const results = await lookupPlaces(query);
      const topResult = results[0];
      if (topResult) {
        return { lat: Number(topResult.lat), lng: Number(topResult.lon) };
      }
    } catch {
      // fall back to local coordinate hints below
    }

    return resolveCoordinatesFromName(name);
  };

  const addDestination = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) return;
    if (!activeDay || !draft.name.trim()) return;

    const trimmedName = draft.name.trim();
    const manualLat = Number.parseFloat(draft.lat);
    const manualLng = Number.parseFloat(draft.lng);
    const hasManualCoords = Number.isFinite(manualLat) && Number.isFinite(manualLng);
    const coordinates = hasManualCoords ? { lat: manualLat, lng: manualLng } : await geocodeDestination(trimmedName);

    const newDestination: MapDestination = {
      id: `dest-${selectedDay}-${Date.now()}`,
      name: trimmedName,
      time: draft.time.trim() || "09:00 AM",
      notes: draft.notes.trim(),
      lat: coordinates.lat,
      lng: coordinates.lng,
      savedByUserId: currentSavedBy?.userId,
      savedByEmail: currentSavedBy?.email,
    };

    setItineraryData((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      days: prev.days.map((day) =>
        day.day === selectedDay
          ? { ...day, destinations: [...day.destinations, newDestination] }
          : day,
      ),
    }));

    setSelectedDestinationId(newDestination.id);
    setDraft({
      name: "",
      time: "09:00 AM",
      notes: "",
      lat: "",
      lng: "",
    });
    setSuggestions([]);
    setIsSearching(false);
    setActiveSuggestionIndex(-1);
  };

  const deleteDestination = (destinationId: string) => {
    if (!canEdit) return;
    setItineraryData((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      days: prev.days.map((day) =>
        day.day === selectedDay
          ? { ...day, destinations: day.destinations.filter((destination) => destination.id !== destinationId) }
          : day,
      ),
    }));
  };

  const focusDestination = (destinationId: string) => {
    setSelectedDestinationId(destinationId);
  };

  if (!activeDay) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
          No itinerary map data available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 bg-stone-50 animate-in fade-in duration-300">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#88B04B]">
            <Route size={14} />
            Leaflet itinerary map
          </div>
            <h3 className="text-lg md:text-xl font-serif font-bold text-[#0B3530]">{activeDay.title}</h3>
          <p className="text-xs text-stone-500">
            Tap a destination in the list to pan the map and open its popup. Changes sync to Supabase immediately.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
      {itineraryData.days.map((day) => (
              <button
                key={day.day}
                type="button"
                onClick={() => setSelectedDay(day.day)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  selectedDay === day.day
                    ? "bg-[#0B3530] text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {day.label}
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <section className="min-h-[460px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <div>
              <h4 className="text-sm font-semibold text-[#0B3530]">Map panel</h4>
              <p className="text-[11px] text-stone-400">OpenStreetMap tiles, numbered markers, and route line by day.</p>
            </div>
            <div className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-stone-500">
              {activeDay.label} | {activeDay.destinations.length} stops
            </div>
          </div>
          <div ref={mapContainerRef} className="h-[460px] md:h-[560px] w-full" />
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-4 py-3">
            <h4 className="text-sm font-semibold text-[#0B3530]">Destination list</h4>
            <p className="text-[11px] text-stone-400">Inline edit, add, or remove stops for {activeDay.label}.</p>
          </div>

          {!canEdit && (
            <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              Sign in to add or edit map destinations.
            </div>
          )}

          <div className="max-h-[640px] overflow-y-auto p-4 space-y-4">
            <form onSubmit={addDestination} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#88B04B]">
                <Plus size={14} />
                Add destination
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="relative space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-stone-600">Name</span>
                    <input
                      value={draft.name}
                      onChange={(event) => {
                        setDraft((prev) => ({ ...prev, name: event.target.value, lat: "", lng: "" }));
                      }}
                      disabled={!canEdit}
                      onKeyDown={(event) => {
                      if (!suggestions.length) return;
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setActiveSuggestionIndex((current) => (current + 1) % suggestions.length);
                      }
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setActiveSuggestionIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
                      }
                      if (event.key === "Enter" && activeSuggestionIndex >= 0) {
                        event.preventDefault();
                        selectSuggestion(suggestions[activeSuggestionIndex]);
                      }
                    }}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#0B3530]"
                    placeholder="Central Market Kuala Lumpur"
                    autoComplete="off"
                  />
                  {(isSearching || suggestions.length > 0) && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                      {isSearching && (
                        <div className="px-3 py-2 text-[11px] text-stone-500">Searching places...</div>
                      )}
                      {!isSearching &&
                        suggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion.place_id}-${suggestion.display_name}`}
                            type="button"
                            onClick={() => selectSuggestion(suggestion)}
                            className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
                              index === activeSuggestionIndex ? "bg-[#0B3530] text-white" : "hover:bg-stone-50 text-stone-700"
                            }`}
                          >
                            {suggestion.display_name}
                          </button>
                        ))}
                    </div>
                  )}
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-stone-600">Time</span>
                  <select
                    value={draft.time}
                    onChange={(event) => setDraft((prev) => ({ ...prev, time: event.target.value }))}
                    disabled={!canEdit}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#0B3530]"
                  >
                    {timeOptions.map((timeOption) => (
                      <option key={timeOption} value={timeOption}>
                        {timeOption}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="space-y-1 block">
                <span className="text-[11px] font-semibold text-stone-600">Notes</span>
                <textarea
                  value={draft.notes}
                  onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#0B3530] min-h-[84px] resize-none"
                  placeholder="Short notes for the popup"
                />
              </label>
              <button
                type="submit"
                disabled={!canEdit}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B3530] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#18534C]"
              >
                <Plus size={14} />
                Add stop
              </button>
              <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                Coordinates are resolved from the place name automatically.
              </p>
            </form>

            {activeDay.destinations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-5 text-center text-xs text-stone-500">
                No destinations yet for {activeDay.label}. Add the first stop above.
              </div>
            ) : activeDay.destinations.map((destination, index) => {
              const isActive = destination.id === selectedDestinationId;
              return (
                <article
                  key={destination.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isActive ? "border-[#0B3530] bg-[#0B3530]/5 shadow-xs" : "border-stone-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => focusDestination(destination.id)}
                    className="mb-3 flex w-full items-start gap-3 text-left"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B3530] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#88B04B]">
                        Stop {index + 1}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-stone-800">{destination.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono">{destination.time}</span>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono">
                          {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                        </span>
                        {(destination.savedByEmail || destination.savedByUserId) && (
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono">
                            Saved by {destination.savedByEmail || destination.savedByUserId}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-600">Name</span>
                        <input
                          value={destination.name}
                          onChange={(event) => updateDestination(destination.id, { name: event.target.value })}
                          onFocus={() => focusDestination(destination.id)}
                          disabled={!canEdit}
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#0B3530]"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-600">Time</span>
                        <input
                          value={destination.time}
                          onChange={(event) => updateDestination(destination.id, { time: event.target.value })}
                          onFocus={() => focusDestination(destination.id)}
                          disabled={!canEdit}
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#0B3530]"
                        />
                      </label>
                    </div>

                    <label className="space-y-1 block">
                      <span className="text-[11px] font-semibold text-stone-600">Notes</span>
                      <textarea
                        value={destination.notes}
                        onChange={(event) => updateDestination(destination.id, { notes: event.target.value })}
                        onFocus={() => focusDestination(destination.id)}
                        disabled={!canEdit}
                        className="w-full min-h-[96px] resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#0B3530]"
                      />
                    </label>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => focusDestination(destination.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0B3530] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#18534C]"
                      >
                        <LocateFixed size={12} />
                        Pan map
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteDestination(destination.id)}
                        disabled={!canEdit}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="border-t border-stone-100 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.25em] text-stone-400">
            Supabase-backed map data with live cross-tab updates.
          </div>
        </section>
      </div>
    </div>
  );
}
