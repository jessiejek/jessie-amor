import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonInput, IonTextarea, IonButton, IonIcon, IonSelect, IonSelectOption,
  IonSegment, IonSegmentButton, IonChip, IonLabel, IonSpinner,
} from "@ionic/react";
import {
  addOutline, bookOutline, cameraOutline, calendarOutline, cloudUploadOutline,
  createOutline, imageOutline, locateOutline, mapOutline, pencilOutline,
  searchOutline, starOutline, trashOutline,
} from "ionicons/icons";
import type { DiaryEntry, DiaryEntryType, SyncStatus } from "../types";

interface DiaryTabProps {
  diaryEntries: DiaryEntry[];
  setDiaryEntries: React.Dispatch<React.SetStateAction<DiaryEntry[]>>;
  isOnline?: boolean;
  canEdit?: boolean;
  currentUser?: { userId: string; email: string; isAdmin: boolean; } | null;
}

type DiaryFormState = {
  title: string; description: string; type: DiaryEntryType; rating: number;
  dateVisited: string; locationName: string; cityOrCountry: string;
  tagsText: string; wouldRevisit: boolean; photoUrl: string; photoPath?: string; photoChanged: boolean;
};

const diaryTypes: DiaryEntryType[] = ["Food", "Landmark", "Hotel", "Transport", "Shopping", "Moment", "Other"];
const starScale = [1, 2, 3, 4, 5];

const getLocalDateInputValue = (value = new Date()) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

const createEmptyForm = (): DiaryFormState => ({
  title: "", description: "", type: "Moment", rating: 5, dateVisited: getLocalDateInputValue(),
  locationName: "", cityOrCountry: "", tagsText: "", wouldRevisit: false, photoUrl: "", photoPath: undefined, photoChanged: false,
});

const normalizeDiaryRating = (rating: number) => Math.round(Math.max(1, Math.min(5, Number.isFinite(rating) ? rating : 0)) * 10) / 10;
const formatDiaryRating = (rating: number) => { const n = normalizeDiaryRating(rating); return Number.isInteger(n) ? String(n) : n.toFixed(1); };

const compressImageFileToDataUrl = async (file: File) => {
  // createImageBitmap with imageOrientation:'from-image' respects iPhone EXIF rotation
  // so portrait photos no longer come out sideways after canvas compression
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas compression is not supported in this browser.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    bitmap.close();
  }
};

const formatSavedBy = (email?: string, userId?: string) => { if (email) return email.split("@")[0]; if (userId) return userId.slice(0, 8); return "Unknown"; };
const formatDateLabel = (value: string) => { const p = new Date(`${value}T00:00:00`); return Number.isNaN(p.getTime()) ? value : p.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }); };
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const formatNominatimDisplayName = (dn: string) => dn.split(",").map((p) => p.trim()).filter(Boolean).slice(0, 3).join(", ");
const formatNominatimCountryOrCity = (addr: Record<string, string | undefined>) => { const c = addr.city || addr.town || addr.state; const co = addr.country; return c && co ? `${c}, ${co}` : c || co || ""; };

const reverseGeocodeLocation = async (lat: number, lng: number) => {
  const url = `${NOMINATIM_REVERSE_URL}?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}&format=json&addressdetails=1`;
  const r = await fetch(url, { headers: { "User-Agent": "TravelItineraryApp/1.0" } as HeadersInit });
  if (!r.ok) throw new Error("The location lookup service returned an unexpected response.");
  const p = (await r.json()) as { display_name?: string; address?: Record<string, string | undefined> };
  if (!p.display_name) throw new Error("The location lookup service did not return a usable address.");
  return { locationName: formatNominatimDisplayName(p.display_name), cityOrCountry: formatNominatimCountryOrCity(p.address ?? {}) };
};

const formatTimestamp = (value: string) => { const p = new Date(value); return Number.isNaN(p.getTime()) ? "Unknown time" : p.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); };

const getSyncDotColor = (v?: SyncStatus | "syncing" | "dirty" | "unsynced") => { if (v === "syncing") return "#64748b"; if (v === "synced") return "#10b981"; return "#f59e0b"; };
const getSyncDotLabel = (v?: SyncStatus | "syncing" | "dirty" | "unsynced") => { if (v === "syncing") return "Syncing"; if (v === "synced") return "Synced"; return "Pending sync"; };

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

const getRevisitPillColors = (value: boolean) => value ? { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" } : { bg: "#fafaf9", text: "#57534e", border: "#e7e5e4" };
const getRatingLabel = (rating: number) => { if (rating <= 1) return "Terrible"; if (rating <= 2) return "Poor"; if (rating <= 3) return "Average"; if (rating <= 4) return "Good"; return "Excellent"; };

// Rating tone classes (no Tailwind - mapped to CSS)
const getRatingScoreClass = (r: number) => { if (r <= 1) return "ja-diary-score-terrible"; if (r <= 2) return "ja-diary-score-poor"; if (r <= 3) return "ja-diary-score-avg"; if (r <= 4) return "ja-diary-score-good"; return "ja-diary-score-excel"; };
const getRatingLabelClass = (r: number) => { if (r <= 1) return "ja-diary-label-terrible"; if (r <= 2) return "ja-diary-label-poor"; if (r <= 3) return "ja-diary-label-avg"; if (r <= 4) return "ja-diary-label-good"; return "ja-diary-label-excel"; };
const getRatingStarClass = (r: number) => { if (r <= 1) return "ja-diary-star-terrible"; if (r <= 2) return "ja-diary-star-poor"; if (r <= 3) return "ja-diary-star-avg"; if (r <= 4) return "ja-diary-star-good"; return "ja-diary-star-excel"; };
const getRatingInactiveStarClass = (r: number) => { if (r <= 1) return "ja-diary-star-inactive-terrible"; if (r <= 2) return "ja-diary-star-inactive-poor"; if (r <= 3) return "ja-diary-star-inactive-avg"; if (r <= 4) return "ja-diary-star-inactive-good"; return "ja-diary-star-inactive-excel"; };
const getStarFillWidth = (rating: number, index: number) => `${Math.max(0, Math.min(1, (Number.isFinite(rating) ? rating : 3) - index)) * 100}%`;

// Rating star tone CSS class for the star cell background/border
const getRatingCellClass = (r: number, filled: boolean) => {
  if (filled) {
    if (r <= 1) return "ja-diary-star-cell-terrible";
    if (r <= 2) return "ja-diary-star-cell-poor";
    if (r <= 3) return "ja-diary-star-cell-avg";
    if (r <= 4) return "ja-diary-star-cell-good";
    return "ja-diary-star-cell-excel";
  }
  return "ja-diary-star-cell-empty";
};

// --- COMPONENT ---
export default function DiaryTab({ diaryEntries, setDiaryEntries, isOnline = true, canEdit = false, currentUser = null }: DiaryTabProps) {
  const [form, setForm] = useState<DiaryFormState>(() => createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DiaryEntryType | "All">("All");
  const [filterRating, setFilterRating] = useState<string>("All");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "mine">("mine");
  const [photoError, setPhotoError] = useState("");
  const [locationLookupError, setLocationLookupError] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const [shakingFields, setShakingFields] = useState<Set<string>>(new Set());
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const ratingTrackRef = useRef<HTMLDivElement | null>(null);
  const isRatingDraggingRef = useRef(false);
  const titleFieldRef = useRef<HTMLDivElement | null>(null);
  const dateFieldRef = useRef<HTMLDivElement | null>(null);
  const locationFieldRef = useRef<HTMLDivElement | null>(null);
  const descriptionFieldRef = useRef<HTMLDivElement | null>(null);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => { const next = new Set(prev); next.delete(field); return next; });
  };

  const editingEntry = editingId ? diaryEntries.find((e) => e.id === editingId) ?? null : null;
  const canManageEntry = (entry?: DiaryEntry | null) => { if (!currentUser || !entry) return false; const o = entry.createdBy ?? entry.savedByUserId ?? null; return currentUser.isAdmin || o === currentUser.userId; };
  const editableEntry = editingEntry && canManageEntry(editingEntry) ? editingEntry : null;

  const setRatingFromValue = (rating: number) => { if (!canEdit) return; setForm((c) => ({ ...c, rating: normalizeDiaryRating(rating) })); };
  const getRatingFromClientX = (clientX: number) => { const t = ratingTrackRef.current; if (!t) return null; const r = t.getBoundingClientRect(); if (r.width <= 0) return null; return normalizeDiaryRating(1 + Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * 4); };

  const handleRatingPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canEdit) return; const r = getRatingFromClientX(event.clientX); if (r === null) return;
    isRatingDraggingRef.current = true; event.currentTarget.setPointerCapture(event.pointerId); setRatingFromValue(r); event.preventDefault();
  };
  const handleRatingPointerMove = (event: React.PointerEvent<HTMLDivElement>) => { if (!canEdit || !isRatingDraggingRef.current) return; const r = getRatingFromClientX(event.clientX); if (r === null) return; setRatingFromValue(r); event.preventDefault(); };
  const stopRatingDrag = () => { isRatingDraggingRef.current = false; };

  const pendingPhotoCount = diaryEntries.filter((e) => e.syncStatus === "pending" && e.photoUrl?.startsWith("data:")).length;
  const draftLocationSummary = form.locationName.trim() || "Pending";
  const draftDateSummary = form.dateVisited ? formatDateLabel(form.dateVisited) : "Pending";
  const draftRevisitSummary = form.wouldRevisit ? "Yes" : "No";

  const filteredEntries = useMemo(() => {
    const ns = searchTerm.trim().toLowerCase();
    return [...diaryEntries].filter((e) => {
      if (filterType !== "All" && e.type !== filterType) return false;
      if (filterRating !== "All" && e.rating !== Number(filterRating)) return false;
      if (ownerFilter === "mine" && currentUser) { const o = e.createdBy ?? e.savedByUserId ?? null; if (o !== currentUser.userId) return false; }
      return !ns || [e.title, e.description, e.locationName, e.cityOrCountry ?? "", e.tags.join(" ")].join(" ").toLowerCase().includes(ns);
    }).sort((a, b) => { const at = new Date(a.createdAt).getTime(); const bt = new Date(b.createdAt).getTime(); return at !== bt ? bt - at : b.id.localeCompare(a.id); });
  }, [diaryEntries, filterRating, filterType, searchTerm, ownerFilter, currentUser]);

  const resetForm = () => { setEditingId(null); setForm(createEmptyForm()); setPhotoError(""); setLocationLookupError(""); setFieldErrors(new Set()); setShakingFields(new Set()); };
  const focusForm = () => { if (!canEdit) return; titleInputRef.current?.focus(); formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return; const file = event.target.files?.[0]; if (!file) return; setPhotoError("");
    try { const previewUrl = await compressImageFileToDataUrl(file); setForm((c) => ({ ...c, photoUrl: previewUrl, photoChanged: true })); }
    catch (err) { setPhotoError(err instanceof Error ? err.message : "The selected photo could not be processed."); }
    finally { event.target.value = ""; }
  };

  const handleLocateMe = () => {
    if (!canEdit || isLocating) return;
    const gl = navigator.geolocation; if (!gl) { setLocationLookupError("Geolocation is not supported by this browser."); return; }
    const hn = window.location.hostname; const isLocal = hn === "localhost" || hn === "127.0.0.1";
    if (!window.isSecureContext && !isLocal) { setLocationLookupError("Location requires HTTPS or localhost."); return; }
    setIsLocating(true); setLocationLookupError("");
    gl.getCurrentPosition(
      async (pos) => { try { const loc = await reverseGeocodeLocation(pos.coords.latitude, pos.coords.longitude); setForm((c) => ({ ...c, locationName: loc.locationName, cityOrCountry: loc.cityOrCountry })); } catch (err) { setLocationLookupError(err instanceof Error ? err.message : "The location lookup failed."); } finally { setIsLocating(false); } },
      (err) => { setLocationLookupError(err.code === err.PERMISSION_DENIED ? "Location access was denied." : "Unable to get your current location."); setIsLocating(false); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  const startEdit = (entry: DiaryEntry) => {
    if (!canManageEntry(entry)) return;
    setEditingId(entry.id); setPhotoError(""); setLocationLookupError("");
    setForm({ title: entry.title, description: entry.description, type: entry.type, rating: normalizeDiaryRating(entry.rating), dateVisited: entry.dateVisited, locationName: entry.locationName, cityOrCountry: entry.cityOrCountry ?? "", tagsText: entry.tags.join(", "), wouldRevisit: entry.wouldRevisit, photoUrl: entry.photoUrl ?? "", photoPath: entry.photoPath, photoChanged: false });
    window.setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) return; if (editingId && !editableEntry) return;
    const tt = form.title.trim(); const td = form.description.trim(); const tl = form.locationName.trim(); const tags = form.tagsText.split(",").map((t) => t.trim()).filter(Boolean);

    const errors = new Set<string>();
    if (!tt) errors.add("title");
    if (!form.dateVisited) errors.add("date");
    if (!tl) errors.add("location");
    if (!td) errors.add("description");

    if (errors.size > 0) {
      setFieldErrors(errors);
      setShakingFields(new Set(errors));
      setTimeout(() => setShakingFields(new Set()), 600);

      const firstRef = !tt ? titleFieldRef : !form.dateVisited ? dateFieldRef : !tl ? locationFieldRef : descriptionFieldRef;
      firstRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setFieldErrors(new Set());
    const ex = editableEntry; const now = new Date().toISOString();
    const oid = ex ? (ex.createdBy ?? ex.savedByUserId ?? null) : currentUser?.userId ?? null;
    const oe = ex ? ex.savedByEmail ?? null : currentUser?.email ?? null;
    const next: DiaryEntry = {
      id: ex?.id ?? `diary-${Date.now()}`, title: tt, description: td, type: form.type, rating: normalizeDiaryRating(form.rating),
      dateVisited: form.dateVisited, locationName: tl, cityOrCountry: form.cityOrCountry.trim() || undefined,
      tags, wouldRevisit: form.wouldRevisit, photoPath: ex?.photoPath, photoUrl: form.photoChanged ? form.photoUrl : ex?.photoUrl,
      createdBy: oid ?? undefined, savedByUserId: oid ?? undefined, savedByEmail: oe ?? undefined,
      createdAt: ex?.createdAt ?? now, updatedAt: now, syncStatus: "pending",
    };
    setDiaryEntries((c) => ex ? c.map((e) => e.id === ex.id ? next : e) : [next, ...c]);
    resetForm();
  };

  useEffect(() => { if (editingId && editingEntry && !editableEntry) resetForm(); }, [editingEntry, editableEntry, editingId]);

  const handleDelete = (entryId: string) => {
    if (!canEdit) return; const target = diaryEntries.find((e) => e.id === entryId);
    if (!canManageEntry(target)) return; setDiaryEntries((c) => c.filter((e) => e.id !== entryId));
    if (editingId === entryId) resetForm();
  };

  const formPreview = form.photoUrl ? (
    <img src={form.photoUrl} alt={form.title || "Travel diary preview"} className="ja-diary-preview-img" />
  ) : (
    <div className="ja-diary-preview-placeholder"><IonIcon icon={imageOutline} className="ja-diary-preview-icon" /><span className="ja-diary-preview-label">Photo preview</span></div>
  );

  return (
    <div className="ja-diary-page">
      <IonCard className="ja-diary-hero-card">
        <IonCardContent>
          <div className="ja-diary-hero-row">
            <div className="ja-diary-hero-text-col">
              <div className="ja-diary-section-eyebrow"><IonIcon icon={bookOutline} className="ja-diary-eyebrow-icon" />Travel diary</div>
              <h2 className="ja-diary-hero-main-title">Save the Malaysia and Singapore memories we want to remember.</h2>
              <p className="ja-diary-hero-desc">Capture meals, landmarks, hotel stays, transport wins, and little trip moments with photos, ratings, and tags that sync with the rest of the itinerary when you are online.</p>
            </div>
            {!canEdit && <div className="ja-diary-banner ja-diary-banner-amber" style={{ marginTop: "12px", marginBottom: 0 }}>Sign in to add memories and sync photos.</div>}
            <IonButton onClick={focusForm} disabled={!canEdit} className="ja-diary-hero-btn"><IonIcon icon={addOutline} slot="start" />Add memory</IonButton>
          </div>
        </IonCardContent>
      </IonCard>
      {!isOnline && <div className="ja-diary-banner ja-diary-banner-amber">Offline mode is active. Text changes stay on this device and photos upload when the connection returns.</div>}
      {pendingPhotoCount > 0 && <div className="ja-diary-banner ja-diary-banner-sky">{pendingPhotoCount} photo{pendingPhotoCount === 1 ? "" : "s"} still need an online sync before they can be fully shared from Supabase Storage.</div>}

      <IonCard className="ja-diary-form-card">
        <form ref={formRef} onSubmit={handleSubmit}>
          <IonCardContent>
            <div className="ja-diary-form-header">
              <div>
                <div className="ja-diary-section-eyebrow"><IonIcon icon={cameraOutline} className="ja-diary-eyebrow-icon" />Add memory</div>
                <h3 className="ja-diary-form-title">{editingId ? "Refine this trip memory" : "Create a new diary entry"}</h3>
              </div>
            </div>
            <div className="ja-diary-form-layout">
              <div className="ja-diary-form-fields">
                <div ref={titleFieldRef} className={`ja-diary-field-span2${fieldErrors.has("title") ? " ja-diary-field--error" : ""}${shakingFields.has("title") ? " ja-diary-field--shake" : ""}`}>
                  <span className="ja-diary-field-label">Title <span className="ja-diary-required">*</span></span>
                  {fieldErrors.has("title") && <span className="ja-diary-field-error-msg">Title is required</span>}
                  <IonInput ref={titleInputRef} value={form.title} onIonInput={(e) => { setForm((c) => ({ ...c, title: e.detail.value ?? "" })); clearFieldError("title"); }}
                    disabled={!canEdit} placeholder="Kaya toast at sunrise, Batu Caves, Marina Bay walk..." className="ja-diary-input" maxlength={120} />
                </div>
                <div className="ja-diary-field">
                  <span className="ja-diary-field-label">Type</span>
                  <IonSelect value={form.type} onIonChange={(e) => setForm((c) => ({ ...c, type: e.detail.value }))} disabled={!canEdit} interface="action-sheet" className="ja-diary-select">
                    {diaryTypes.map((t) => <IonSelectOption key={t} value={t}>{t}</IonSelectOption>)}
                  </IonSelect>
                </div>
                <div ref={dateFieldRef} className={`ja-diary-field${fieldErrors.has("date") ? " ja-diary-field--error" : ""}${shakingFields.has("date") ? " ja-diary-field--shake" : ""}`}>
                  <span className="ja-diary-field-label">Date visited <span className="ja-diary-required">*</span></span>
                  {fieldErrors.has("date") && <span className="ja-diary-field-error-msg">Date is required</span>}
                  <IonInput type="date" value={form.dateVisited} onIonInput={(e) => { setForm((c) => ({ ...c, dateVisited: e.detail.value ?? "" })); clearFieldError("date"); }} disabled={!canEdit} className="ja-diary-input" />
                </div>
                <div ref={locationFieldRef} className={`ja-diary-field-span2${fieldErrors.has("location") ? " ja-diary-field--error" : ""}${shakingFields.has("location") ? " ja-diary-field--shake" : ""}`}>
                  <div className="ja-diary-field-row">
                    <span className="ja-diary-field-label">Location name <span className="ja-diary-required">*</span></span>
                    <IonButton type="button" size="small" onClick={handleLocateMe} disabled={!canEdit || isLocating} className="ja-diary-locate-btn">
                      {isLocating ? <IonSpinner name="crescent" slot="start" /> : <IonIcon icon={locateOutline} slot="start" />}{isLocating ? "Locating..." : "Locate Me"}
                    </IonButton>
                  </div>
                  {fieldErrors.has("location") && <span className="ja-diary-field-error-msg">Location is required</span>}
                  <IonInput value={form.locationName} onIonInput={(e) => { setForm((c) => ({ ...c, locationName: e.detail.value ?? "" })); clearFieldError("location"); }} disabled={!canEdit} placeholder="Jalan Alor, Marina Bay Sands, KL Sentral..." className="ja-diary-input" maxlength={120} />
                </div>
                <div className="ja-diary-field-span2">
                  <span className="ja-diary-field-label">Country or city</span>
                  <IonInput value={form.cityOrCountry} onIonInput={(e) => setForm((c) => ({ ...c, cityOrCountry: e.detail.value ?? "" }))} disabled={!canEdit} placeholder="Kuala Lumpur, Malaysia" className="ja-diary-input" maxlength={80} />
                </div>
                {locationLookupError && <p className="ja-diary-field-span2 ja-diary-error-text">{locationLookupError}</p>}

                {/* Rating */}
                <div className="ja-diary-field-span2">
                  <span className="ja-diary-field-label">Rating</span>
                  <div className="ja-diary-rating-section">
                    <div className="ja-diary-rating-top">
                      <div className="ja-diary-rating-score"><span className={`ja-diary-rating-score-value ${getRatingScoreClass(form.rating)}`}>{formatDiaryRating(form.rating)}</span><span className="ja-diary-rating-max">/ 5</span></div>
                      <span className={`ja-diary-rating-word ${getRatingLabelClass(form.rating)}`}>{getRatingLabel(form.rating)}</span>
                    </div>
                    <div ref={ratingTrackRef} className="ja-diary-rating-track" role="slider" tabIndex={canEdit ? 0 : -1}
                      aria-label="Diary rating" aria-valuemin={1} aria-valuemax={5} aria-valuenow={Number(form.rating.toFixed(1))} aria-valuetext={`${formatDiaryRating(form.rating)} out of 5`}
                      onPointerDown={handleRatingPointerDown} onPointerMove={handleRatingPointerMove}
                      onPointerUp={stopRatingDrag} onPointerCancel={stopRatingDrag} onLostPointerCapture={stopRatingDrag}
                      onKeyDown={(e) => { if (!canEdit) return; if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setRatingFromValue(form.rating - 0.1); } if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setRatingFromValue(form.rating + 0.1); } if (e.key === "Home") { e.preventDefault(); setRatingFromValue(1); } if (e.key === "End") { e.preventDefault(); setRatingFromValue(5); } }}>
                      {Array.from({ length: 5 }, (_, i) => { const sn = i + 1; const sc = getRatingCellClass(form.rating, sn <= form.rating); const starClass = sn <= form.rating ? getRatingStarClass(form.rating) : "ja-diary-star-gray"; return (
                        <div key={sn} aria-hidden="true" className={`ja-diary-star-cell ${sc}`}>
                          <span className="ja-diary-star-wrap"><IonIcon icon={starOutline} className={`ja-diary-star-bg ${starClass}`} /><span className="ja-diary-star-fill" style={{ width: `${Math.max(0, Math.min(1, (Number.isFinite(form.rating) ? form.rating : 3) - i)) * 100}%` }}><IonIcon icon={starOutline} className="ja-diary-star-active" /></span></span>
                        </div>
                      ); })}
                    </div>
                    <p className="ja-diary-rating-hint">Click or drag across the stars to set a decimal rating.</p>
                  </div>
                </div>

                {/* Description */}
                <div ref={descriptionFieldRef} className={`ja-diary-field-span2${fieldErrors.has("description") ? " ja-diary-field--error" : ""}${shakingFields.has("description") ? " ja-diary-field--shake" : ""}`}>
                  <span className="ja-diary-field-label">Description <span className="ja-diary-required">*</span></span>
                  {fieldErrors.has("description") && <span className="ja-diary-field-error-msg">Description is required</span>}
                  <IonTextarea value={form.description} onIonInput={(e) => { setForm((c) => ({ ...c, description: e.detail.value ?? "" })); clearFieldError("description"); }} disabled={!canEdit}
                    placeholder="What made this stop memorable? What should we remember next time?" className="ja-diary-textarea" maxlength={1000} />
                </div>

                {/* Tags */}
                <div className="ja-diary-field-span2">
                  <span className="ja-diary-field-label">Tags</span>
                  <IonInput value={form.tagsText} onIonInput={(e) => setForm((c) => ({ ...c, tagsText: e.detail.value ?? "" }))} disabled={!canEdit} placeholder="food, cafe, sunset, family time" className="ja-diary-input" maxlength={200} />
                  <span className="ja-diary-helper">Separate tags with commas.</span>
                </div>

                {/* Would revisit */}
                <label className="ja-diary-field-span2 ja-diary-check-label">
                  <input type="checkbox" checked={form.wouldRevisit} onChange={(e) => setForm((c) => ({ ...c, wouldRevisit: e.target.checked }))} disabled={!canEdit} className="ja-diary-check-input" />
                  <div><span className="ja-diary-check-title">Would revisit?</span><span className="ja-diary-check-desc">Mark places we would happily return to on the next trip.</span></div>
                </label>

                {/* Desktop action buttons */}
                <div className="ja-diary-desktop-actions">
                  {editingId && <IonButton fill="outline" onClick={resetForm} className="ja-diary-cancel-btn">Cancel edit</IonButton>}
                  <IonButton type="submit" disabled={!canEdit} className="ja-diary-save-btn"><IonIcon icon={editingId ? createOutline : addOutline} slot="start" />Save memory</IonButton>
                </div>
              </div>

              {/* Right side: photo, draft summary, sync */}
              <div className="ja-diary-side-col">
                <IonCard className="ja-diary-photo-card">
                  <IonCardContent>
                    <div className="ja-diary-section-eyebrow"><IonIcon icon={cloudUploadOutline} className="ja-diary-eyebrow-icon" />Photo upload</div>
                    <div className="ja-diary-photo-prompt">Choose a photo</div>
                    <label className="ja-diary-photo-label">
                      <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={!canEdit} className="ja-diary-sr-only" />
                      <div className="ja-diary-photo-dropzone"><IonIcon icon={cloudUploadOutline} className="ja-diary-photo-icon" /><div className="ja-diary-photo-text">Tap to choose photo</div><p className="ja-diary-photo-helper">Images are compressed locally before sync. Supabase uploads happen only when you are signed in and online.</p></div>
                    </label>
                    {photoError && <p className="ja-diary-photo-error">{photoError}</p>}
                    {form.photoUrl && <div className="ja-diary-photo-preview-wrap">{formPreview}</div>}
                    <div className="ja-diary-mobile-actions">
                      {editingId && <IonButton fill="outline" onClick={resetForm} className="ja-diary-cancel-btn">Cancel edit</IonButton>}
                      <IonButton type="submit" disabled={!canEdit} className="ja-diary-save-btn"><IonIcon icon={editingId ? createOutline : addOutline} slot="start" />Save memory</IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>

                <IonCard className="ja-diary-summary-card">
                  <IonCardContent>
                    <div className="ja-diary-section-eyebrow"><IonIcon icon={calendarOutline} className="ja-diary-eyebrow-icon" />Draft summary</div>
                    <div className="ja-diary-summary-grid">
                      <div className="ja-diary-summary-row"><span className="ja-diary-summary-key">Location</span><span className="ja-diary-summary-val ja-diary-summary-val-right">{draftLocationSummary}</span></div>
                      <div className="ja-diary-summary-row"><span className="ja-diary-summary-key">Date visited</span><span className="ja-diary-summary-val ja-diary-summary-val-right">{draftDateSummary}</span></div>
                      <div className="ja-diary-summary-row"><span className="ja-diary-summary-key">Revisit</span><IonChip className="ja-diary-chip" style={{ ...getRevisitPillColors(form.wouldRevisit) }}>{draftRevisitSummary}</IonChip></div>
                    </div>
                  </IonCardContent>
                </IonCard>

                <IonCard className="ja-diary-sync-card">
                  <IonCardContent>
                    <div className="ja-diary-section-eyebrow"><IonIcon icon={mapOutline} className="ja-diary-eyebrow-icon" />Sync notes</div>
                    <p className="ja-diary-sync-text">{canEdit ? "Saving will keep the memory on this device first, then push it to the cloud." : "Read-only mode keeps local cache entries visible, but editing is disabled until sign-in."}</p>
                  </IonCardContent>
                </IonCard>
              </div>
            </div>
          </IonCardContent>
        </form>
      </IonCard>

      {/* Filters */}
      <IonCard className="ja-diary-filters-card">
        <IonCardContent>
          <div className="ja-diary-filters-top">
            <div>
              <div className="ja-diary-section-eyebrow ja-diary-eyebrow-muted"><IonIcon icon={searchOutline} className="ja-diary-eyebrow-icon" />Filters</div>
              <h3 className="ja-diary-filters-title">Search the travel diary</h3>
            </div>
            <div className="ja-diary-filters-count">{filteredEntries.length} memor{filteredEntries.length === 1 ? "y" : "ies"} shown</div>
          </div>

          {currentUser && (
            <div className="ja-diary-owner-row">
              <span className="ja-diary-owner-label">Show</span>
              <IonSegment value={ownerFilter} onIonChange={(e) => setOwnerFilter(e.detail.value as "all" | "mine")} className="ja-diary-segment">
                <IonSegmentButton value="all" className="ja-diary-segment-btn"><IonLabel>All</IonLabel></IonSegmentButton>
                <IonSegmentButton value="mine" className="ja-diary-segment-btn"><IonLabel>Mine</IonLabel></IonSegmentButton>
              </IonSegment>
            </div>
          )}

          <div className="ja-diary-filters-grid">
            <div>
              <span className="ja-diary-field-label">Search</span>
              <div className="ja-diary-search-wrap">
                <IonIcon icon={searchOutline} className="ja-diary-search-icon" />
                <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Title, location, tags, description..." className="ja-diary-search-input" />
              </div>
            </div>
            <div>
              <span className="ja-diary-field-label">Type</span>
              <IonSelect value={filterType} onIonChange={(e) => setFilterType(e.detail.value)} interface="action-sheet" className="ja-diary-filter-select">
                <IonSelectOption value="All">All types</IonSelectOption>
                {diaryTypes.map((t) => <IonSelectOption key={t} value={t}>{t}</IonSelectOption>)}
              </IonSelect>
            </div>
            <div>
              <span className="ja-diary-field-label">Rating</span>
              <IonSelect value={filterRating} onIonChange={(e) => setFilterRating(e.detail.value)} interface="action-sheet" className="ja-diary-filter-select">
                <IonSelectOption value="All">All ratings</IonSelectOption>
                {starScale.map((r) => <IonSelectOption key={r} value={String(r)}>{r} stars</IonSelectOption>)}
              </IonSelect>
            </div>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Entry list */}
      <section className="ja-diary-entries-section">
        {filteredEntries.length === 0 ? (
          <IonCard className="ja-diary-empty-card">
            <IonCardContent>
              <div className="ja-diary-empty-text">{diaryEntries.length === 0 ? "No memories yet. Add your first travel diary entry." : "No memories match your current filters."}</div>
            </IonCardContent>
          </IonCard>
        ) : (
          <div className="ja-diary-entry-grid">
            {filteredEntries.map((entry) => {
              const tc = getTypePillColors(entry.type);
              const locLabel = entry.cityOrCountry ? `${entry.locationName}, ${entry.cityOrCountry}` : entry.locationName;
              const rc = getRevisitPillColors(entry.wouldRevisit);
              return (
                <article key={entry.id} className="ja-diary-entry-card">
                  <div className="ja-diary-entry-image-col">
                    {entry.photoUrl ? <img src={entry.photoUrl} alt={entry.title} className="ja-diary-entry-photo" loading="lazy" />
                    : <div className="ja-diary-entry-photo-missing"><IonIcon icon={cameraOutline} className="ja-diary-entry-photo-icon" /></div>}
                    <div className="ja-diary-entry-image-overlay">
                      <IonChip className="ja-diary-entry-chip" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>{entry.type}</IonChip>
                      <div className="ja-diary-entry-overlay-actions">
                        <span className="ja-diary-sync-dot" style={{ backgroundColor: getSyncDotColor(entry.syncStatus) }} title={getSyncDotLabel(entry.syncStatus)} aria-label={getSyncDotLabel(entry.syncStatus)} />
                        {canManageEntry(entry) && (
                          <>
                            <IonButton fill="clear" size="small" onClick={() => startEdit(entry)} className="ja-diary-entry-action-btn" aria-label={`Edit ${entry.title}`} title="Edit entry"><IonIcon icon={pencilOutline} /></IonButton>
                            <IonButton fill="clear" size="small" onClick={() => handleDelete(entry.id)} className="ja-diary-entry-action-btn ja-diary-entry-action-btn-danger" aria-label={`Delete ${entry.title}`} title="Delete entry"><IonIcon icon={trashOutline} /></IonButton>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ja-diary-entry-content-col">
                    <div>
                      <div className="ja-diary-entry-title-row"><h4 className="ja-diary-entry-title">{entry.title}</h4></div>
                      <div className="ja-diary-entry-stars">
                        {starScale.map((sv) => <span key={sv} className={sv <= entry.rating ? "ja-diary-star-filled" : "ja-diary-star-empty"}><IonIcon icon={starOutline} style={{ fontSize: 14, fill: sv <= entry.rating ? "currentColor" : "none" }} /></span>)}
                        <span className="ja-diary-entry-rating-label">{formatDiaryRating(entry.rating)}/5</span>
                      </div>
                    </div>
                    <div className="ja-diary-entry-desc-box">
                      <div className="ja-diary-entry-desc-label">Description</div>
                      <p className="ja-diary-entry-desc-text">{entry.description}</p>
                    </div>
                    <div className="ja-diary-entry-meta-row">
                      <div className="ja-diary-entry-meta-icon-row"><IonIcon icon={calendarOutline} className="ja-diary-entry-meta-icon" /><span>{formatDateLabel(entry.dateVisited)}</span></div>
                      <div className="ja-diary-entry-meta-icon-row"><IonIcon icon={mapOutline} className="ja-diary-entry-meta-icon" /><span>{locLabel}</span></div>
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="ja-diary-entry-tag-row">{entry.tags.map((tv) => <IonChip key={`${entry.id}-${tv}`} className="ja-diary-tag-chip">{tv}</IonChip>)}</div>
                    )}
                    <div className="ja-diary-entry-footer">
                      <div className="ja-diary-entry-footer-left">
                        <span className="ja-diary-entry-footer-text">Saved by {formatSavedBy(entry.savedByEmail, entry.savedByUserId)}</span>
                        <span className="ja-diary-entry-footer-text">Created {formatTimestamp(entry.createdAt)}</span>
                      </div>
                      <IonChip className="ja-diary-entry-chip" style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>{entry.wouldRevisit ? "Would revisit" : "One and done"}</IonChip>
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
