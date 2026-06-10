import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonChip,
  IonBadge,
  IonLabel,
  IonText,
  IonImg,
  IonSpinner,
} from "@ionic/react";
import {
  addOutline,
  bookOutline,
  cameraOutline,
  calendarOutline,
  cloudUploadOutline,
  createOutline,
  imageOutline,
  locateOutline,
  mapOutline,
  pencilOutline,
  searchOutline,
  starOutline,
  trashOutline,
} from "ionicons/icons";
import type { DiaryEntry, DiaryEntryType, SyncStatus } from "../types";

// --- TYPES, CONSTANTS, HELPERS (unchanged) ---
interface DiaryTabProps {
  diaryEntries: DiaryEntry[];
  setDiaryEntries: React.Dispatch<React.SetStateAction<DiaryEntry[]>>;
  isOnline?: boolean;
  canEdit?: boolean;
  currentUser?: {
    userId: string;
    email: string;
    isAdmin: boolean;
  } | null;
}

type DiaryFormState = {
  title: string;
  description: string;
  type: DiaryEntryType;
  rating: number;
  dateVisited: string;
  locationName: string;
  cityOrCountry: string;
  tagsText: string;
  wouldRevisit: boolean;
  photoUrl: string;
  photoPath?: string;
  photoChanged: boolean;
};

const diaryTypes: DiaryEntryType[] = ["Food", "Landmark", "Hotel", "Transport", "Shopping", "Moment", "Other"];
const starScale = [1, 2, 3, 4, 5];

const getLocalDateInputValue = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createEmptyForm = (): DiaryFormState => ({
  title: "", description: "", type: "Moment", rating: 5, dateVisited: getLocalDateInputValue(),
  locationName: "", cityOrCountry: "", tagsText: "", wouldRevisit: false,
  photoUrl: "", photoPath: undefined, photoChanged: false,
});

const normalizeDiaryRating = (rating: number) => {
  const numericRating = Number.isFinite(rating) ? rating : 0;
  return Math.round(Math.max(1, Math.min(5, numericRating)) * 10) / 10;
};

const formatDiaryRating = (rating: number) => {
  const normalized = normalizeDiaryRating(rating);
  return Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(1);
};

const compressImageFileToDataUrl = async (file: File) => {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("The selected image could not be read."));
      nextImage.src = objectUrl;
    });
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas compression is not supported in this browser.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const formatSavedBy = (email?: string, userId?: string) => {
  if (email) return email.split("@")[0];
  if (userId) return userId.slice(0, 8);
  return "Unknown";
};

const formatDateLabel = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

const formatNominatimDisplayName = (displayName: string) =>
  displayName.split(",").map((part) => part.trim()).filter(Boolean).slice(0, 3).join(", ");

const formatNominatimCountryOrCity = (address: Record<string, string | undefined>) => {
  const cityOrRegion = address.city || address.town || address.state;
  const country = address.country;
  return cityOrRegion && country ? `${cityOrRegion}, ${country}` : cityOrRegion || country || "";
};

const reverseGeocodeLocation = async (latitude: number, longitude: number) => {
  const url = `${NOMINATIM_REVERSE_URL}?lat=${encodeURIComponent(String(latitude))}&lon=${encodeURIComponent(String(longitude))}&format=json&addressdetails=1`;
  const response = await fetch(url, { headers: { "User-Agent": "TravelItineraryApp/1.0" } as HeadersInit });
  if (!response.ok) throw new Error("The location lookup service returned an unexpected response.");
  const payload = (await response.json()) as { display_name?: string; address?: Record<string, string | undefined> };
  if (!payload.display_name) throw new Error("The location lookup service did not return a usable address.");
  return { locationName: formatNominatimDisplayName(payload.display_name), cityOrCountry: formatNominatimCountryOrCity(payload.address ?? {}) };
};

const formatTimestamp = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";
  return parsed.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const getSyncDotColor = (value?: SyncStatus | "syncing" | "dirty" | "unsynced") => {
  if (value === "syncing") return "#64748b";
  if (value === "synced") return "#10b981";
  return "#f59e0b";
};

const getSyncDotLabel = (value?: SyncStatus | "syncing" | "dirty" | "unsynced") => {
  if (value === "syncing") return "Syncing";
  if (value === "synced") return "Synced";
  return "Pending sync";
};

const getTypePillColors = (value: DiaryEntryType) => {
  switch (value) {
    case "Food": return { bg: "#fffbeb", text: "#92400e", border: "#fde68a" };
    case "Landmark": return { bg: "#f0f9ff", text: "#075985", border: "#bae6fd" };
    case "Hotel": return { bg: "#f5f3ff", text: "#5b21b6", border: "#ddd6fe" };
    case "Transport": return { bg: "#ecfeff", text: "#155e75", border: "#a5f3fc" };
    case "Shopping": return { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3" };
    case "Moment": return { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" };
    default: return { bg: "#fafaf9", text: "#44403c", border: "#e7e5e4" };
  }
};

const getRevisitPillColors = (value: boolean) =>
  value ? { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" } : { bg: "#fafaf9", text: "#57534e", border: "#e7e5e4" };

const getRatingLabel = (rating: number) => {
  if (rating <= 1) return "Terrible";
  if (rating <= 2) return "Poor";
  if (rating <= 3) return "Average";
  if (rating <= 4) return "Good";
  return "Excellent";
};

const getRatingTone = (rating: number) => {
  if (rating <= 1) return { scoreText: "text-rose-700", labelText: "text-rose-600" };
  if (rating <= 2) return { scoreText: "text-orange-700", labelText: "text-orange-600" };
  if (rating <= 3) return { scoreText: "text-amber-700", labelText: "text-amber-600" };
  if (rating <= 4) return { scoreText: "text-lime-700", labelText: "text-lime-600" };
  return { scoreText: "text-emerald-700", labelText: "text-emerald-600" };
};

const getRatingStarTone = (rating: number) => {
  if (rating <= 1) return { border: "border-rose-200", activeBg: "bg-rose-50", activeText: "text-rose-600" };
  if (rating <= 2) return { border: "border-orange-200", activeBg: "bg-orange-50", activeText: "text-orange-600" };
  if (rating <= 3) return { border: "border-amber-200", activeBg: "bg-amber-50", activeText: "text-amber-600" };
  if (rating <= 4) return { border: "border-lime-200", activeBg: "bg-lime-50", activeText: "text-lime-600" };
  return { border: "border-emerald-200", activeBg: "bg-emerald-50", activeText: "text-emerald-600" };
};

// --- COMPONENT ---
export default function DiaryTab({
  diaryEntries, setDiaryEntries, isOnline = true, canEdit = false, currentUser = null,
}: DiaryTabProps) {
  const [form, setForm] = useState<DiaryFormState>(() => createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DiaryEntryType | "All">("All");
  const [filterRating, setFilterRating] = useState<string>("All");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "mine">("mine");
  const [photoError, setPhotoError] = useState("");
  const [locationLookupError, setLocationLookupError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const ratingTrackRef = useRef<HTMLDivElement | null>(null);
  const isRatingDraggingRef = useRef(false);

  const editingEntry = editingId ? diaryEntries.find((entry) => entry.id === editingId) ?? null : null;
  const canManageEntry = (entry?: DiaryEntry | null) => {
    if (!currentUser || !entry) return false;
    const ownerId = entry.createdBy ?? entry.savedByUserId ?? null;
    return currentUser.isAdmin || ownerId === currentUser.userId;
  };
  const editableEntry = editingEntry && canManageEntry(editingEntry) ? editingEntry : null;

  const setRatingFromValue = (rating: number) => {
    if (!canEdit) return;
    setForm((current) => ({ ...current, rating: normalizeDiaryRating(rating) }));
  };

  const getRatingFromClientX = (clientX: number) => {
    const track = ratingTrackRef.current;
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const ratio = (clientX - rect.left) / rect.width;
    return normalizeDiaryRating(1 + Math.max(0, Math.min(1, ratio)) * 4);
  };

  const handleRatingPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canEdit) return;
    const rating = getRatingFromClientX(event.clientX);
    if (rating === null) return;
    isRatingDraggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setRatingFromValue(rating);
    event.preventDefault();
  };

  const handleRatingPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canEdit || !isRatingDraggingRef.current) return;
    const rating = getRatingFromClientX(event.clientX);
    if (rating === null) return;
    setRatingFromValue(rating);
    event.preventDefault();
  };

  const stopRatingDrag = () => { isRatingDraggingRef.current = false; };

  const pendingPhotoCount = diaryEntries.filter((entry) => entry.syncStatus === "pending" && entry.photoUrl?.startsWith("data:")).length;
  const ratingTone = getRatingTone(form.rating);
  const draftLocationSummary = form.locationName.trim() || "Pending";
  const draftDateSummary = form.dateVisited ? formatDateLabel(form.dateVisited) : "Pending";
  const draftRevisitSummary = form.wouldRevisit ? "Yes" : "No";

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return [...diaryEntries]
      .filter((entry) => {
        if (filterType !== "All" && entry.type !== filterType) return false;
        if (filterRating !== "All" && entry.rating !== Number(filterRating)) return false;
        if (ownerFilter === "mine" && currentUser) {
          const ownerId = entry.createdBy ?? entry.savedByUserId ?? null;
          if (ownerId !== currentUser.userId) return false;
        }
        if (!normalizedSearch) return true;
        return [entry.title, entry.description, entry.locationName, entry.cityOrCountry ?? "", entry.tags.join(" ")]
          .join(" ").toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        if (aTime !== bTime) return bTime - aTime;
        return b.id.localeCompare(a.id);
      });
  }, [diaryEntries, filterRating, filterType, searchTerm, ownerFilter, currentUser]);

  const resetForm = () => { setEditingId(null); setForm(createEmptyForm()); setPhotoError(""); setLocationLookupError(""); };

  const focusForm = () => {
    if (!canEdit) return;
    titleInputRef.current?.focus();
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    try {
      const previewUrl = await compressImageFileToDataUrl(file);
      setForm((current) => ({ ...current, photoUrl: previewUrl, photoChanged: true }));
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "The selected photo could not be processed.");
    } finally { event.target.value = ""; }
  };

  const handleLocateMe = () => {
    if (!canEdit || isLocating) return;
    const geolocation = navigator.geolocation;
    if (!geolocation) { setLocationLookupError("Geolocation is not supported by this browser."); return; }
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) { setLocationLookupError("Location requires HTTPS or localhost."); return; }
    setIsLocating(true);
    setLocationLookupError("");
    geolocation.getCurrentPosition(
      async (position) => {
        try {
          const located = await reverseGeocodeLocation(position.coords.latitude, position.coords.longitude);
          setForm((current) => ({ ...current, locationName: located.locationName, cityOrCountry: located.cityOrCountry }));
        } catch (error) { setLocationLookupError(error instanceof Error ? error.message : "The location lookup failed."); }
        finally { setIsLocating(false); }
      },
      (error) => {
        setLocationLookupError(error.code === error.PERMISSION_DENIED ? "Location access was denied." : "Unable to get your current location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  const startEdit = (entry: DiaryEntry) => {
    if (!canManageEntry(entry)) return;
    setEditingId(entry.id);
    setPhotoError("");
    setLocationLookupError("");
    setForm({
      title: entry.title, description: entry.description, type: entry.type,
      rating: normalizeDiaryRating(entry.rating), dateVisited: entry.dateVisited,
      locationName: entry.locationName, cityOrCountry: entry.cityOrCountry ?? "",
      tagsText: entry.tags.join(", "), wouldRevisit: entry.wouldRevisit,
      photoUrl: entry.photoUrl ?? "", photoPath: entry.photoPath, photoChanged: false,
    });
    window.setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) return;
    if (editingId && !editableEntry) return;
    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const trimmedLocation = form.locationName.trim();
    const tags = form.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean);
    if (!trimmedTitle || !trimmedDescription || !trimmedLocation || !form.dateVisited) return;
    const existingEntry = editableEntry;
    const now = new Date().toISOString();
    const ownerId = existingEntry ? (existingEntry.createdBy ?? existingEntry.savedByUserId ?? null) : currentUser?.userId ?? null;
    const ownerEmail = existingEntry ? existingEntry.savedByEmail ?? null : currentUser?.email ?? null;
    const nextEntry: DiaryEntry = {
      id: existingEntry?.id ?? `diary-${Date.now()}`,
      title: trimmedTitle, description: trimmedDescription, type: form.type,
      rating: normalizeDiaryRating(form.rating), dateVisited: form.dateVisited,
      locationName: trimmedLocation, cityOrCountry: form.cityOrCountry.trim() || undefined,
      tags, wouldRevisit: form.wouldRevisit,
      photoPath: existingEntry?.photoPath,
      photoUrl: form.photoChanged ? form.photoUrl : existingEntry?.photoUrl,
      createdBy: ownerId ?? undefined, savedByUserId: ownerId ?? undefined,
      savedByEmail: ownerEmail ?? undefined, createdAt: existingEntry?.createdAt ?? now,
      updatedAt: now, syncStatus: "pending",
    };
    setDiaryEntries((current) => existingEntry
      ? current.map((entry) => (entry.id === existingEntry.id ? nextEntry : entry))
      : [nextEntry, ...current]);
    resetForm();
  };

  useEffect(() => {
    if (editingId && editingEntry && !editableEntry) resetForm();
  }, [editingEntry, editableEntry, editingId]);

  const handleDelete = (entryId: string) => {
    if (!canEdit) return;
    const target = diaryEntries.find((entry) => entry.id === entryId);
    if (!canManageEntry(target)) return;
    setDiaryEntries((current) => current.filter((entry) => entry.id !== entryId));
    if (editingId === entryId) resetForm();
  };

  const formPreview = form.photoUrl ? (
    <img src={form.photoUrl} alt={form.title || "Travel diary preview"} className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400">
      <IonIcon icon={imageOutline} style={{ fontSize: 28 }} />
      <span className="mt-2 text-[12px] font-medium">Photo preview</span>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl animate-in fade-in duration-300 px-4 py-4 md:px-8">
      {/* Hero section */}
      <IonCard className="ja-diary-hero-card">
        <IonCardContent>
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#93b56e" }}>
                <IonIcon icon={bookOutline} style={{ fontSize: 12 }} />
                Travel diary
              </div>
              <h2 className="mt-2 text-[38px] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#0b1f1c] md:max-w-[820px]">
                Save the Malaysia and Singapore memories we want to remember.
              </h2>
              <p className="mt-3 max-w-3xl text-[13px] leading-6 text-[#7a8785]">
                Capture meals, landmarks, hotel stays, transport wins, and little trip moments with photos, ratings, and tags that sync with the rest of the itinerary when you are online.
              </p>
            </div>
            <IonButton
              onClick={focusForm}
              disabled={!canEdit}
              className="ja-diary-hero-btn"
            >
              <IonIcon icon={addOutline} slot="start" />
              Add memory
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Banners */}
      {!canEdit && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 shadow-xs">
          Sign in to add memories and sync photos.
        </div>
      )}
      {!isOnline && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 shadow-xs">
          Offline mode is active. Text changes stay on this device and photos upload when the connection returns.
        </div>
      )}
      {pendingPhotoCount > 0 && (
        <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] text-sky-800 shadow-xs">
          {pendingPhotoCount} photo{pendingPhotoCount === 1 ? "" : "s"} still need an online sync before they can be fully shared from Supabase Storage.
        </div>
      )}

      {/* Form section */}
      <IonCard className="ja-diary-form-card">
        <form ref={formRef} onSubmit={handleSubmit}>
          <IonCardContent>
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#93b56e" }}>
                  <IonIcon icon={cameraOutline} style={{ fontSize: 12 }} />
                  Add memory
                </div>
                <h3 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-[#0b1f1c]">
                  {editingId ? "Refine this trip memory" : "Create a new diary entry"}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)] md:items-start">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Title */}
                <div className="md:col-span-2">
                  <span className="mb-1 block text-[12px] font-semibold text-stone-600">Title</span>
                  <IonInput
                    ref={titleInputRef}
                    value={form.title}
                    onIonInput={(event) => setForm((current) => ({ ...current, title: event.detail.value ?? "" }))}
                    disabled={!canEdit}
                    placeholder="Kaya toast at sunrise, Batu Caves, Marina Bay walk..."
                    className="ja-diary-input"
                    maxlength={120}
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <span className="mb-1 block text-[12px] font-semibold text-stone-600">Type</span>
                  <IonSelect
                    value={form.type}
                    onIonChange={(event) => setForm((current) => ({ ...current, type: event.detail.value }))}
                    disabled={!canEdit}
                    interface="action-sheet"
                    className="ja-diary-select"
                  >
                    {diaryTypes.map((type) => (
                      <IonSelectOption key={type} value={type}>{type}</IonSelectOption>
                    ))}
                  </IonSelect>
                </div>

                {/* Date visited */}
                <div>
                  <span className="mb-1 block text-[12px] font-semibold text-stone-600">Date visited</span>
                  <IonInput
                    type="date"
                    value={form.dateVisited}
                    onIonInput={(event) => setForm((current) => ({ ...current, dateVisited: event.detail.value ?? "" }))}
                    disabled={!canEdit}
                    className="ja-diary-input"
                    required
                  />
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="block text-[12px] font-semibold text-stone-600">Location name</span>
                    <IonButton
                      type="button"
                      size="small"
                      onClick={handleLocateMe}
                      disabled={!canEdit || isLocating}
                      className="ja-diary-locate-btn"
                    >
                      {isLocating ? <IonSpinner name="crescent" slot="start" /> : <IonIcon icon={locateOutline} slot="start" />}
                      {isLocating ? "Locating..." : "Locate Me"}
                    </IonButton>
                  </div>
                  <IonInput
                    value={form.locationName}
                    onIonInput={(event) => setForm((current) => ({ ...current, locationName: event.detail.value ?? "" }))}
                    disabled={!canEdit}
                    placeholder="Jalan Alor, Marina Bay Sands, KL Sentral..."
                    className="ja-diary-input"
                    maxlength={120}
                    required
                  />
                </div>

                {/* City/Country */}
                <div className="md:col-span-2">
                  <span className="mb-1 block text-[12px] font-semibold text-stone-600">Country or city</span>
                  <IonInput
                    value={form.cityOrCountry}
                    onIonInput={(event) => setForm((current) => ({ ...current, cityOrCountry: event.detail.value ?? "" }))}
                    disabled={!canEdit}
                    placeholder="Kuala Lumpur, Malaysia"
                    className="ja-diary-input"
                    maxlength={80}
                  />
                </div>

                {locationLookupError && <p className="md:col-span-2 -mt-1 text-[12px] text-rose-600">{locationLookupError}</p>}

                {/* Rating (custom pointer-based, preserved as-is) */}
                <div className="md:col-span-2">
                  <span className="mb-1 block text-[12px] font-semibold text-stone-600">Rating</span>
                  <div className="space-y-3">
                    <div className="flex items-end justify-between gap-2">
                      <div className="flex items-end gap-2">
                        <span className={`text-3xl font-semibold ${ratingTone.scoreText}`}>{formatDiaryRating(form.rating)}</span>
                        <span className="pb-0.5 text-[13px] text-stone-400">/ 5</span>
                      </div>
                      <span className={`text-[11px] font-semibold ${ratingTone.labelText}`}>{getRatingLabel(form.rating)}</span>
                    </div>
                    <div
                      ref={ratingTrackRef}
                      className="relative grid w-full grid-cols-5 gap-2 select-none touch-none"
                      role="slider"
                      tabIndex={canEdit ? 0 : -1}
                      aria-label="Diary rating"
                      aria-valuemin={1} aria-valuemax={5}
                      aria-valuenow={Number(form.rating.toFixed(1))}
                      aria-valuetext={`${formatDiaryRating(form.rating)} out of 5`}
                      onPointerDown={handleRatingPointerDown}
                      onPointerMove={handleRatingPointerMove}
                      onPointerUp={stopRatingDrag}
                      onPointerCancel={stopRatingDrag}
                      onLostPointerCapture={stopRatingDrag}
                      onKeyDown={(event) => {
                        if (!canEdit) return;
                        if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); setRatingFromValue(form.rating - 0.1); }
                        if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); setRatingFromValue(form.rating + 0.1); }
                        if (event.key === "Home") { event.preventDefault(); setRatingFromValue(1); }
                        if (event.key === "End") { event.preventDefault(); setRatingFromValue(5); }
                      }}
                    >
                      {Array.from({ length: 5 }, (_, index) => {
                        const starNumber = index + 1;
                        const starTone = getRatingStarTone(form.rating);
                        return (
                          <div
                            key={starNumber}
                            aria-hidden="true"
                            className={`inline-flex h-11 w-full items-center justify-center rounded-full border transition-colors ${
                              starNumber <= form.rating ? `${starTone.border} ${starTone.activeBg} ${starTone.activeText}` : "border-stone-200 bg-white text-stone-400"
                            }`}
                          >
                            <span className="relative inline-flex h-[16px] w-[16px]">
                              <IonIcon icon={starOutline} className="absolute inset-0 h-[16px] w-[16px] text-stone-300" />
                              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${Math.max(0, Math.min(1, form.rating - index)) * 100}%` }}>
                                <IonIcon icon={starOutline} style={{ color: "#0B3530", fontSize: 16 }} />
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-stone-400">Click or drag across the stars to set a decimal rating.</p>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <span className="mb-1 block text-[12px] font-semibold text-stone-600">Description</span>
                  <IonTextarea
                    value={form.description}
                    onIonInput={(event) => setForm((current) => ({ ...current, description: event.detail.value ?? "" }))}
                    disabled={!canEdit}
                    placeholder="What made this stop memorable? What should we remember next time?"
                    className="ja-diary-textarea"
                    maxlength={1000}
                    required
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <span className="mb-1 block text-[12px] font-semibold text-stone-600">Tags</span>
                  <IonInput
                    value={form.tagsText}
                    onIonInput={(event) => setForm((current) => ({ ...current, tagsText: event.detail.value ?? "" }))}
                    disabled={!canEdit}
                    placeholder="food, cafe, sunset, family time"
                    className="ja-diary-input"
                    maxlength={200}
                  />
                  <span className="mt-1 block text-[11px] text-stone-500">Separate tags with commas.</span>
                </div>

                {/* Would revisit (native checkbox preserved for simplicity) */}
                <label className="md:col-span-2 flex items-start gap-3 rounded-[10px] border border-stone-200 bg-white px-3 py-3">
                  <input
                    type="checkbox"
                    checked={form.wouldRevisit}
                    onChange={(event) => setForm((current) => ({ ...current, wouldRevisit: event.target.checked }))}
                    disabled={!canEdit}
                    className="h-4 w-4 rounded border-stone-300 text-[#0B3530] focus:ring-[#0B3530]"
                  />
                  <div>
                    <span className="block text-[13px] font-semibold text-stone-700">Would revisit?</span>
                    <span className="block text-[11px] text-stone-500">Mark places we would happily return to on the next trip.</span>
                  </div>
                </label>

                {/* Action buttons */}
                <div className="hidden items-center gap-2 md:col-span-2 md:flex">
                  {editingId && (
                    <IonButton fill="outline" onClick={resetForm} className="ja-diary-cancel-btn">
                      Cancel edit
                    </IonButton>
                  )}
                  <IonButton type="submit" disabled={!canEdit} className="ja-diary-save-btn">
                    <IonIcon icon={editingId ? createOutline : addOutline} slot="start" />
                    Save memory
                  </IonButton>
                </div>
              </div>

              {/* Right column: photo, draft summary, sync notes */}
              <div className="space-y-3">
                <IonCard className="ja-diary-photo-card">
                  <IonCardContent>
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#93b56e" }}>
                      <IonIcon icon={cloudUploadOutline} style={{ fontSize: 12 }} />
                      Photo upload
                    </div>
                    <div className="mb-2 text-[12px] font-semibold text-stone-700">Choose a photo</div>
                    <label className="block cursor-pointer">
                      <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={!canEdit} className="sr-only" />
                      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-[10px] border border-dashed border-stone-300 bg-white px-4 text-center md:min-h-[88px]">
                        <IonIcon icon={cloudUploadOutline} style={{ color: "#062d27", fontSize: 24 }} />
                        <div className="mt-2 text-[13px] font-semibold text-[#0b1f1c]">Tap to choose photo</div>
                        <p className="mt-1 text-[10px] text-stone-500">Images are compressed locally before sync. Supabase uploads happen only when you are signed in and online.</p>
                      </div>
                    </label>
                    {photoError && <p className="mt-2 text-[12px] text-rose-600">{photoError}</p>}
                    {form.photoUrl && (
                      <div className="mt-3 overflow-hidden rounded-[10px] border border-stone-200 bg-white">
                        {formPreview}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 md:hidden">
                      {editingId && (
                        <IonButton fill="outline" onClick={resetForm} className="ja-diary-cancel-btn">
                          Cancel edit
                        </IonButton>
                      )}
                      <IonButton type="submit" disabled={!canEdit} className="ja-diary-save-btn">
                        <IonIcon icon={editingId ? createOutline : addOutline} slot="start" />
                        Save memory
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>

                <IonCard className="ja-diary-summary-card">
                  <IonCardContent>
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#93b56e" }}>
                      <IonIcon icon={calendarOutline} style={{ fontSize: 12 }} />
                      Draft summary
                    </div>
                    <div className="space-y-2 text-[12px] text-stone-600">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-stone-700">Location</span>
                        <span className="text-right">{draftLocationSummary}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-stone-700">Date visited</span>
                        <span className="text-right">{draftDateSummary}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-stone-700">Revisit</span>
                        <IonChip className="ja-diary-chip" style={{ ...getRevisitPillColors(form.wouldRevisit) }}>
                          {draftRevisitSummary}
                        </IonChip>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>

                <IonCard className="ja-diary-sync-card">
                  <IonCardContent>
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#93b56e" }}>
                      <IonIcon icon={mapOutline} style={{ fontSize: 12 }} />
                      Sync notes
                    </div>
                    <p className="text-[12px] leading-5 text-[#58716b]">
                      {canEdit
                        ? "Saving will keep the memory on this device first, then push it to the cloud."
                        : "Read-only mode keeps local cache entries visible, but editing is disabled until sign-in."}
                    </p>
                  </IonCardContent>
                </IonCard>
              </div>
            </div>
          </IonCardContent>
        </form>
      </IonCard>

      {/* Filters section */}
      <IonCard className="ja-diary-filters-card">
        <IonCardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: "#6d7f79" }}>
                <IonIcon icon={searchOutline} style={{ fontSize: 12 }} />
                Filters
              </div>
              <h3 className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-[#0b1f1c]">Search the travel diary</h3>
            </div>
            <div className="text-[12px] text-stone-500 md:text-right">
              {filteredEntries.length} memor{filteredEntries.length === 1 ? "y" : "ies"} shown
            </div>
          </div>

          {/* Owner filter */}
          {currentUser && (
            <div className="flex items-center gap-1.5 mt-3 px-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 mr-1">Show</span>
              <IonSegment
                value={ownerFilter}
                onIonChange={(event) => setOwnerFilter(event.detail.value as "all" | "mine")}
                className="ja-diary-segment"
              >
                <IonSegmentButton value="all" className="ja-diary-segment-btn">
                  <IonLabel>All</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="mine" className="ja-diary-segment-btn">
                  <IonLabel>Mine</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1.3fr_0.85fr_0.85fr]">
            {/* Search input (keep native for search icon positioning) */}
            <div>
              <span className="mb-1 block text-[12px] font-semibold text-stone-600">Search</span>
              <div className="relative">
                <IonIcon icon={searchOutline} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" style={{ fontSize: 14 }} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Title, location, tags, description..."
                  className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
                />
              </div>
            </div>

            {/* Type select */}
            <div>
              <span className="mb-1 block text-[12px] font-semibold text-stone-600">Type</span>
              <IonSelect
                value={filterType}
                onIonChange={(event) => setFilterType(event.detail.value)}
                interface="action-sheet"
                className="ja-diary-filter-select"
              >
                <IonSelectOption value="All">All types</IonSelectOption>
                {diaryTypes.map((type) => (
                  <IonSelectOption key={type} value={type}>{type}</IonSelectOption>
                ))}
              </IonSelect>
            </div>

            {/* Rating select */}
            <div>
              <span className="mb-1 block text-[12px] font-semibold text-stone-600">Rating</span>
              <IonSelect
                value={filterRating}
                onIonChange={(event) => setFilterRating(event.detail.value)}
                interface="action-sheet"
                className="ja-diary-filter-select"
              >
                <IonSelectOption value="All">All ratings</IonSelectOption>
                {starScale.map((rating) => (
                  <IonSelectOption key={rating} value={String(rating)}>{rating} stars</IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Diary entries list */}
      <section className="mt-5">
        {filteredEntries.length === 0 ? (
          <IonCard className="ja-diary-empty-card">
            <IonCardContent>
              <div className="text-center py-4 text-[14px] text-stone-500">
                {diaryEntries.length === 0
                  ? "No memories yet. Add your first travel diary entry."
                  : "No memories match your current filters."}
              </div>
            </IonCardContent>
          </IonCard>
        ) : (
          <div className="space-y-4 md:space-y-5">
            {filteredEntries.map((entry) => {
              const typeColors = getTypePillColors(entry.type);
              const locationLabel = entry.cityOrCountry ? `${entry.locationName}, ${entry.cityOrCountry}` : entry.locationName;
              const revisitColors = getRevisitPillColors(entry.wouldRevisit);
              return (
                <article
                  key={entry.id}
                  className="group overflow-hidden rounded-[14px] border border-stone-200 bg-white shadow-[0_10px_30px_rgba(6,45,39,0.06)] transition-shadow hover:shadow-[0_14px_34px_rgba(6,45,39,0.1)] md:grid md:grid-cols-[340px_minmax(0,1fr)]"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 md:aspect-auto md:h-full md:min-h-[320px]">
                    {entry.photoUrl ? (
                      <img src={entry.photoUrl} alt={entry.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 text-stone-400">
                        <IonIcon icon={cameraOutline} style={{ fontSize: 30 }} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                      <IonChip className="ja-diary-entry-chip" style={{ background: typeColors.bg, color: typeColors.text, border: `1px solid ${typeColors.border}` }}>
                        {entry.type}
                      </IonChip>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getSyncDotColor(entry.syncStatus) }}
                          aria-label={getSyncDotLabel(entry.syncStatus)} title={getSyncDotLabel(entry.syncStatus)}
                        />
                        {canManageEntry(entry) && (
                          <div className="flex items-center gap-1">
                            <IonButton fill="clear" size="small" onClick={() => startEdit(entry)} className="ja-diary-entry-action-btn" aria-label={`Edit ${entry.title}`} title="Edit entry">
                              <IonIcon icon={pencilOutline} />
                            </IonButton>
                            <IonButton fill="clear" size="small" onClick={() => handleDelete(entry.id)} className="ja-diary-entry-action-btn ja-diary-entry-action-btn-danger" aria-label={`Delete ${entry.title}`} title="Delete entry">
                              <IonIcon icon={trashOutline} />
                            </IonButton>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3 p-4 md:flex md:flex-col md:justify-between md:p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="line-clamp-2 text-[22px] font-semibold leading-tight tracking-[-0.03em] text-stone-900 md:text-[28px]">{entry.title}</h4>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5" style={{ color: "#10b981" }}>
                        {starScale.map((starValue) => (
                          <span key={starValue} className={starValue <= entry.rating ? "text-emerald-500" : "text-stone-300"}>
                            <IonIcon icon={starOutline} style={{ fontSize: 14, fill: starValue <= entry.rating ? "currentColor" : "none" }} />
                          </span>
                        ))}
                        <span className="ml-1 text-[11px] font-semibold text-stone-500">{formatDiaryRating(entry.rating)}/5</span>
                      </div>
                    </div>

                    <div className="rounded-[12px] border border-stone-200 bg-stone-50 px-3 py-3">
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Description</div>
                      <p className="whitespace-pre-wrap break-words text-[14px] leading-6 text-stone-700">{entry.description}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-[12px] text-stone-600">
                      <div className="flex items-start gap-2">
                        <IonIcon icon={calendarOutline} className="mt-0.5 shrink-0" style={{ color: "#88B04B", fontSize: 13 }} />
                        <span>{formatDateLabel(entry.dateVisited)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <IonIcon icon={mapOutline} className="mt-0.5 shrink-0" style={{ color: "#88B04B", fontSize: 13 }} />
                        <span>{locationLabel}</span>
                      </div>
                    </div>

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tagValue) => (
                          <IonChip key={`${entry.id}-${tagValue}`} className="ja-diary-tag-chip">
                            {tagValue}
                          </IonChip>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-[10px] text-stone-400">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono uppercase tracking-wider">Saved by {formatSavedBy(entry.savedByEmail, entry.savedByUserId)}</span>
                        <span className="font-mono uppercase tracking-wider">Created {formatTimestamp(entry.createdAt)}</span>
                      </div>
                      <IonChip className="ja-diary-entry-chip" style={{ background: revisitColors.bg, color: revisitColors.text, border: `1px solid ${revisitColors.border}` }}>
                        {entry.wouldRevisit ? "Would revisit" : "One and done"}
                      </IonChip>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
