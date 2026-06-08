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
import { supabase, supabaseMapTable, tripKey } from "../lib/supabase";
import { makeOfflineCacheKey, readCachedDataset, writeCachedDataset } from "../lib/offlineCache";
import type { SyncStatus } from "../types";

type DraftState = {
  name: string;
  time: string;
  notes: string;
  lat: string;
  lng: string;
};

type UserLocationState = {
  lat: number;
  lng: number;
  accuracy: number | null;
  updatedAt: number;
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
  isOnline?: boolean;
  currentUser?: {
    userId: string;
    email: string;
    isAdmin: boolean;
  } | null;
}

type SavedByInfo = {
  userId: string;
  email: string;
};

const formatSavedBy = (email?: string, userId?: string) => {
  if (email) return email.split("@")[0];
  if (userId) return userId.slice(0, 8);
  return "Unknown";
};

const getSyncDotClass = (value?: SyncStatus | "syncing" | "dirty" | "unsynced") => {
  if (value === "syncing") {
    return "inline-block h-2.5 w-2.5 rounded-full bg-slate-500 align-middle";
  }

  if (value === "synced") {
    return "inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 align-middle";
  }

  return "inline-block h-2.5 w-2.5 rounded-full bg-amber-500 align-middle";
};

const getSyncDotLabel = (value?: SyncStatus | "syncing" | "dirty" | "unsynced") => {
  if (value === "syncing") return "Syncing";
  if (value === "synced") return "Synced";
  return "Pending sync";
};

type SupabaseMapRow = {
  trip_key: string;
  data: MapItineraryData;
  saved_by_user_id: string | null;
  saved_by_email: string | null;
  updated_at: string;
};

const mapCacheKey = makeOfflineCacheKey(tripKey, "map");

const applyMapSyncStatus = (data: MapItineraryData, syncStatus: SyncStatus): MapItineraryData => ({
  ...data,
  days: data.days.map((day) => ({
    ...day,
    destinations: day.destinations.map((destination) => ({
      ...destination,
      syncStatus: destination.syncStatus ?? syncStatus,
    })),
  })),
});

const forceMapSyncStatus = (data: MapItineraryData, syncStatus: SyncStatus): MapItineraryData => ({
  ...data,
  days: data.days.map((day) => ({
    ...day,
    destinations: day.destinations.map((destination) => ({
      ...destination,
      syncStatus,
    })),
  })),
});

const stripMapDestinationSyncStatus = (destination: MapDestination) => {
  const { syncStatus: _syncStatus, ...rest } = destination;
  return rest;
};

const mapDataForSync = (data: MapItineraryData) => ({
  version: data.version,
  updatedAt: data.updatedAt,
  days: data.days.map((day) => ({
    ...day,
    destinations: day.destinations.map(stripMapDestinationSyncStatus),
  })),
});

const mapSignature = (data: MapItineraryData) => JSON.stringify(mapDataForSync(data));

export default function MapTab({ session: authSession, canEdit = false, isOnline = true, currentUser = null }: MapTabProps) {
  const [session, setSession] = useState<Session | null>(authSession);
  const [initialMapCache] = useState(() => readCachedDataset<MapItineraryData>(mapCacheKey));
  const [initialMapData] = useState(() =>
    applyMapSyncStatus(initialMapCache?.data ?? buildEmptyMapItinerary(), initialMapCache?.dirty ? "pending" : "synced"),
  );
  const [itineraryData, setItineraryData] = useState<MapItineraryData>(() => initialMapData);
  const [selectedDay, setSelectedDay] = useState<number>(() => initialMapData.days[0]?.day ?? 11);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>(
    () => initialMapData.days[0]?.destinations[0]?.id ?? "",
  );
  const [draft, setDraft] = useState<DraftState>({
    name: "",
    time: "09:00 AM",
    notes: "",
    lat: "",
    lng: "",
  });
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
  const mapSignatureRef = useRef<string>(initialMapCache?.syncedSignature || mapSignature(initialMapData));
  const mapDirtyRef = useRef<boolean>(initialMapCache?.dirty ?? false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(!supabase);
  const currentSavedBy: SavedByInfo | null = session?.user
    ? {
        userId: session.user.id,
        email: session.user.email ?? "",
      }
    : null;
  const canManageDestination = (destination?: MapDestination | null) => {
    if (!currentUser || !destination) return false;
    const ownerId = destination.createdBy ?? destination.savedByUserId ?? null;
    return currentUser.isAdmin || ownerId === currentUser.userId;
  };
  const saveMapSnapshot = (nextData: MapItineraryData, syncedSignature: string, dirty: boolean) => {
    mapSignatureRef.current = syncedSignature;
    mapDirtyRef.current = dirty;
    writeCachedDataset(mapCacheKey, {
      data: nextData,
      syncedSignature,
      dirty,
    });
  };

  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location permission was denied. Enable location access in your browser settings to show where you are.";
      case error.POSITION_UNAVAILABLE:
        return "Your current location is unavailable right now. Please check GPS/location services.";
      case error.TIMEOUT:
        return "Getting your location took too long. Try again in an open area or with GPS enabled.";
      default:
        return "Unable to get your current location.";
    }
  };

  const stopLocationTracking = () => {
    if (locationWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }
    setIsTrackingLocation(false);
    setIsTrackingPaused(false);
    locationPausedRef.current = false;
    locationShouldPanRef.current = false;
  };

  const shouldAcceptLocationUpdate = (nextLat: number, nextLng: number, nextUpdatedAt: number) => {
    const previous = lastLocationUpdateRef.current;
    if (!previous) return true;

    const elapsed = nextUpdatedAt - previous.updatedAt;
    if (elapsed > 30000) return true;

    const distanceInMeters = (() => {
      const toRad = (value: number) => (value * Math.PI) / 180;
      const earthRadius = 6371000;
      const lat1 = toRad(previous.lat);
      const lat2 = toRad(nextLat);
      const deltaLat = toRad(nextLat - previous.lat);
      const deltaLng = toRad(nextLng - previous.lng);
      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    })();

    return distanceInMeters >= 25;
  };

  const applyLocationUpdate = (position: GeolocationPosition, allowPan = false) => {
    const nextLocation: UserLocationState = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
      updatedAt: Date.now(),
    };

    if (!shouldAcceptLocationUpdate(nextLocation.lat, nextLocation.lng, nextLocation.updatedAt)) {
      return;
    }

    lastLocationUpdateRef.current = {
      lat: nextLocation.lat,
      lng: nextLocation.lng,
      updatedAt: nextLocation.updatedAt,
    };

    setUserLocation(nextLocation);
    setLocationError(null);

    const map = mapRef.current;
    if (allowPan && map) {
      map.setView([nextLocation.lat, nextLocation.lng], Math.max(map.getZoom(), 16), { animate: true });
    }
  };

  const startLocationTracking = (panOnFirstUpdate = false) => {
    if (!navigator.geolocation) return;

    if (locationWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }

    setIsTrackingPaused(false);
    locationPausedRef.current = false;
    locationShouldPanRef.current = panOnFirstUpdate;

    locationWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const shouldPan = locationShouldPanRef.current;
        locationShouldPanRef.current = false;
        applyLocationUpdate(position, shouldPan);
      },
      (error) => {
        setLocationError(getGeolocationErrorMessage(error));
        stopLocationTracking();
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 30000,
      },
    );

    setIsTrackingLocation(true);
  };

  const handleLocateMe = () => {
    const geolocation = navigator.geolocation;
    if (!geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) {
      setLocationError("Location requires HTTPS or localhost.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    geolocation.getCurrentPosition(
      (position) => {
        applyLocationUpdate(position, true);
        setIsLocating(false);
      },
      (error) => {
        setLocationError(getGeolocationErrorMessage(error));
        setIsLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

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
    if (!supabase) {
      setMapLoaded(true);
      return;
    }

    if (!isOnline) {
      setMapLoaded(true);
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
        setMapLoaded(true);
        return;
      }

      if (!mapDirtyRef.current) {
        const remoteData = data?.data as MapItineraryData | undefined;
        const normalized = remoteData?.days?.length ? normalizeMapItinerary(remoteData) : buildEmptyMapItinerary();
        const synced = forceMapSyncStatus(normalized, "synced");
        saveMapSnapshot(synced, mapSignature(synced), false);
        setItineraryData(synced);
      }

      setMapLoaded(true);
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
            if (mapDirtyRef.current) return;

            if (payload.eventType === "DELETE") {
              const empty = buildEmptyMapItinerary();
              const synced = forceMapSyncStatus(empty, "synced");
              saveMapSnapshot(synced, mapSignature(synced), false);
              setItineraryData(synced);
              return;
            }

            const nextData = payload.new?.data as MapItineraryData | undefined;
            const normalized = nextData?.days?.length ? normalizeMapItinerary(nextData) : buildEmptyMapItinerary();
            const synced = forceMapSyncStatus(normalized, "synced");
            saveMapSnapshot(synced, mapSignature(synced), false);
            setItineraryData(synced);
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
  }, [isOnline, session]);

  useEffect(() => {
    if (!mapLoaded) return;

    const currentSignature = mapSignature(itineraryData);
    const hasPendingLocalChanges = currentSignature !== mapSignatureRef.current || mapDirtyRef.current;
    if (!hasPendingLocalChanges) return;

    if (currentSignature === mapSignatureRef.current) {
      saveMapSnapshot(itineraryData, currentSignature, false);
      return;
    }

    saveMapSnapshot(itineraryData, mapSignatureRef.current, true);

    if (!supabase || !session || !isOnline) return;

    const timeout = window.setTimeout(async () => {
      const payload: SupabaseMapRow = {
        trip_key: tripKey,
        data: itineraryData,
        saved_by_user_id: currentSavedBy?.userId ?? null,
        saved_by_email: currentSavedBy?.email ?? null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from(supabaseMapTable).upsert(payload, { onConflict: "trip_key" });

      if (error) {
        console.warn("Supabase map sync failed:", error.message);
        return;
      }

      const syncedMap = forceMapSyncStatus(itineraryData, "synced");
      setItineraryData(syncedMap);
      saveMapSnapshot(syncedMap, currentSignature, false);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [itineraryData, isOnline, mapLoaded, session]);

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
    userLocationLayerRef.current = L.layerGroup().addTo(map);
    setUserLocationLayerReady(true);

    const timeout = window.setTimeout(() => map.invalidateSize(), 150);

    return () => {
      window.clearTimeout(timeout);
      if (locationWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
        locationWatchIdRef.current = null;
      }
      routeLayerRef.current?.remove();
      markerLayerRef.current?.remove();
      userLocationLayerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      userLocationLayerRef.current = null;
      routeLayerRef.current = null;
      markerRefs.current = {};
      setUserLocationLayerReady(false);
      setIsTrackingLocation(false);
      setIsTrackingPaused(false);
      locationPausedRef.current = false;
      locationShouldPanRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (locationWatchIdRef.current !== null && navigator.geolocation) {
          locationPausedRef.current = true;
          setIsTrackingPaused(true);
          navigator.geolocation.clearWatch(locationWatchIdRef.current);
          locationWatchIdRef.current = null;
          setIsTrackingLocation(false);
          locationShouldPanRef.current = false;
        }
        return;
      }

      if (locationPausedRef.current) {
        setIsTrackingPaused(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    const userLayer = userLocationLayerRef.current;
    if (!userLayer || !userLocationLayerReady) return;

    userLayer.clearLayers();

    if (!userLocation) return;

    const latLng: L.LatLngExpression = [userLocation.lat, userLocation.lng];
    const icon = L.divIcon({
      className: "",
      html: `
        <div class="relative flex h-8 w-8 items-center justify-center">
          <span class="absolute inline-flex h-8 w-8 rounded-full bg-[#0B3530]/25 animate-ping"></span>
          <span class="relative inline-flex h-5 w-5 rounded-full bg-[#0B3530] ring-4 ring-white shadow-lg"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(latLng, { icon })
      .bindPopup(
        `<div style="font-weight:700;color:#0B3530;">You are here</div>
         <div style="font-size:12px;color:#6B7280;margin-top:4px;">Accuracy: ${
           userLocation.accuracy !== null ? `${Math.round(userLocation.accuracy)} m` : "Unknown"
         }</div>`,
        { closeButton: false },
      )
      .addTo(userLayer);

    if (userLocation.accuracy !== null && Number.isFinite(userLocation.accuracy)) {
      L.circle(latLng, {
        radius: userLocation.accuracy,
        color: "#0B3530",
        weight: 1,
        opacity: 0.35,
        fillColor: "#0B3530",
        fillOpacity: 0.08,
      }).addTo(userLayer);
    }
  }, [userLocation, userLocationLayerReady]);

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
    const target = activeDay?.destinations.find((destination) => destination.id === destinationId) ?? null;
    if (!canManageDestination(target)) return;
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
                  createdBy: destination.createdBy ?? destination.savedByUserId,
                  savedByUserId: destination.savedByUserId ?? destination.createdBy,
                  savedByEmail: destination.savedByEmail ?? undefined,
                  syncStatus: "pending",
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
      createdBy: currentUser?.userId,
      savedByUserId: currentSavedBy?.userId,
      savedByEmail: currentSavedBy?.email,
      syncStatus: "pending",
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
    const target = activeDay?.destinations.find((destination) => destination.id === destinationId) ?? null;
    if (!canManageDestination(target)) return;
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
      {!isOnline && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 shadow-xs">
          Offline mode is active. Map edits are cached locally and upload automatically when the connection returns.
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#88B04B]">
            <Route size={14} />
            Leaflet itinerary map
          </div>
            <h3 className="text-lg md:text-xl font-serif font-bold text-[#0B3530]">{activeDay.title}</h3>
          <p className="text-xs text-stone-500">
            Tap a destination in the list to pan the map and open its popup. Changes sync when the device is online.
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
          <div className="relative">
            <div ref={mapContainerRef} className="h-[460px] md:h-[560px] w-full" />

            <div className="absolute left-3 top-3 z-[500] flex max-w-[calc(100%-1.5rem)] flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-label="Show my current location"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0B3530] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-black/10 transition-colors hover:bg-[#18534C] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <LocateFixed size={14} />
                  {isLocating ? "Locating..." : "Locate me"}
                </button>

                <button
                  type="button"
                  aria-label="Start live location tracking"
                  onClick={() => startLocationTracking(true)}
                  disabled={isTrackingLocation || isLocating}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-lg shadow-black/5 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <LocateFixed size={14} />
                  Track me
                </button>

                {isTrackingLocation && (
                  <button
                    type="button"
                    aria-label="Stop location tracking"
                    onClick={stopLocationTracking}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-lg shadow-black/5 transition-colors hover:bg-stone-50"
                  >
                    Stop
                  </button>
                )}
              </div>

              {isTrackingPaused && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 text-[11px] text-amber-800 shadow-sm backdrop-blur">
                  Tracking paused to save battery. Tap Track me to resume.
                </div>
              )}

              {isTrackingLocation && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/95 px-3 py-2 text-[11px] text-emerald-800 shadow-sm backdrop-blur">
                  Tracking your location
                </div>
              )}

              {userLocation && (
                <div className="rounded-xl border border-stone-200 bg-white/95 px-3 py-2 text-[11px] text-stone-600 shadow-sm backdrop-blur">
                  You are here · accuracy{" "}
                  {userLocation.accuracy !== null ? `${Math.round(userLocation.accuracy)}m` : "unknown"} · updated{" "}
                  {new Date(userLocation.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}

              {locationError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 text-[11px] text-amber-800 shadow-sm backdrop-blur">
                  {locationError}
                </div>
              )}
            </div>
          </div>
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
              const isEditable = canManageDestination(destination);
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
                            {formatSavedBy(destination.savedByEmail, destination.savedByUserId)}
                          </span>
                        )}
                        <span
                          className={getSyncDotClass(destination.syncStatus)}
                          title={getSyncDotLabel(destination.syncStatus)}
                          aria-label={getSyncDotLabel(destination.syncStatus)}
                        />
                      </div>
                    </div>
                  </button>

                  {isEditable ? (
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
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-[12px] leading-relaxed text-stone-600">
                        {destination.notes}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => focusDestination(destination.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#0B3530] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#18534C]"
                        >
                          <LocateFixed size={12} />
                          Pan map
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="border-t border-stone-100 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.25em] text-stone-400">
            Local cache with Supabase sync and live cross-tab updates.
          </div>
        </section>
      </div>
    </div>
  );
}
