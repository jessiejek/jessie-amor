import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Camera,
  CloudUpload,
  Image as ImageIcon,
  MapPin,
  PencilLine,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import type { DiaryEntry, DiaryEntryType, SyncStatus } from "../types";

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

const diaryTypes: DiaryEntryType[] = [
  "Food",
  "Landmark",
  "Hotel",
  "Transport",
  "Shopping",
  "Moment",
  "Other",
];

const starScale = [1, 2, 3, 4, 5];

const getLocalDateInputValue = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createEmptyForm = (): DiaryFormState => ({
  title: "",
  description: "",
  type: "Moment",
  rating: 5,
  dateVisited: getLocalDateInputValue(),
  locationName: "",
  cityOrCountry: "",
  tagsText: "",
  wouldRevisit: false,
  photoUrl: "",
  photoPath: undefined,
  photoChanged: false,
});

const normalizeDiaryRating = (rating: number) => {
  const numericRating = Number.isFinite(rating) ? rating : 0;
  const clampedRating = Math.max(1, Math.min(5, numericRating));
  return Math.round(clampedRating * 10) / 10;
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
    if (!context) {
      throw new Error("Canvas compression is not supported in this browser.");
    }

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
  return parsed.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTimestamp = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";
  return parsed.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

const getTypePillClass = (value: DiaryEntryType) => {
  switch (value) {
    case "Food":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "Landmark":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "Hotel":
      return "border-violet-200 bg-violet-50 text-violet-800";
    case "Transport":
      return "border-cyan-200 bg-cyan-50 text-cyan-800";
    case "Shopping":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "Moment":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    default:
      return "border-stone-200 bg-stone-100 text-stone-700";
  }
};

const getRevisitPillClass = (value: boolean) =>
  value
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-stone-200 bg-stone-100 text-stone-600";

const getRatingLabel = (rating: number) => {
  if (rating <= 1) return "Terrible";
  if (rating <= 2) return "Poor";
  if (rating <= 3) return "Average";
  if (rating <= 4) return "Good";
  return "Excellent";
};

const getRatingTone = (rating: number) => {
  if (rating <= 0) {
    return {
      scoreText: "text-stone-500",
      fillText: "text-stone-400",
      fillBg: "bg-stone-100",
      border: "border-stone-200",
      labelText: "text-stone-500",
    };
  }

  if (rating <= 1) {
    return {
      scoreText: "text-rose-700",
      fillText: "text-rose-700",
      fillBg: "bg-rose-50",
      border: "border-rose-200",
      labelText: "text-rose-600",
    };
  }

  if (rating <= 2) {
    return {
      scoreText: "text-orange-700",
      fillText: "text-orange-700",
      fillBg: "bg-orange-50",
      border: "border-orange-200",
      labelText: "text-orange-600",
    };
  }

  if (rating <= 3) {
    return {
      scoreText: "text-amber-700",
      fillText: "text-amber-700",
      fillBg: "bg-amber-50",
      border: "border-amber-200",
      labelText: "text-amber-600",
    };
  }

  if (rating <= 4) {
    return {
      scoreText: "text-lime-700",
      fillText: "text-lime-700",
      fillBg: "bg-lime-50",
      border: "border-lime-200",
      labelText: "text-lime-600",
    };
  }

  return {
    scoreText: "text-emerald-700",
    fillText: "text-emerald-700",
    fillBg: "bg-emerald-50",
    border: "border-emerald-200",
    labelText: "text-emerald-600",
  };
};

const getRatingStarTone = (rating: number) => {
  if (rating <= 1) {
    return {
      border: "border-rose-200",
      activeBg: "bg-rose-50",
      activeText: "text-rose-600",
    };
  }

  if (rating <= 2) {
    return {
      border: "border-orange-200",
      activeBg: "bg-orange-50",
      activeText: "text-orange-600",
    };
  }

  if (rating <= 3) {
    return {
      border: "border-amber-200",
      activeBg: "bg-amber-50",
      activeText: "text-amber-600",
    };
  }

  if (rating <= 4) {
    return {
      border: "border-lime-200",
      activeBg: "bg-lime-50",
      activeText: "text-lime-600",
    };
  }

  return {
    border: "border-emerald-200",
    activeBg: "bg-emerald-50",
    activeText: "text-emerald-600",
  };
};

const renderStars = (rating: number, className = "h-4 w-4") =>
  starScale.map((starValue) => {
    const starTone = getRatingStarTone(rating);
    return (
      <span key={starValue} className={starValue <= rating ? starTone.activeText : "text-stone-300"}>
        <Star
          size={14}
          className={className}
          fill={starValue <= rating ? "currentColor" : "none"}
          strokeWidth={starValue <= rating ? 0 : 2}
        />
      </span>
    );
  });

export default function DiaryTab({
  diaryEntries,
  setDiaryEntries,
  isOnline = true,
  canEdit = false,
  currentUser = null,
}: DiaryTabProps) {
  const [form, setForm] = useState<DiaryFormState>(() => createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DiaryEntryType | "All">("All");
  const [filterRating, setFilterRating] = useState<string>("All");
  const [photoError, setPhotoError] = useState("");
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

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

  const handleRatingRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRatingFromValue(Number(event.target.value));
  };

  const pendingPhotoCount = diaryEntries.filter((entry) => entry.syncStatus === "pending" && entry.photoUrl?.startsWith("data:")).length;
  const ratingTone = getRatingTone(form.rating);
  const draftLocationSummary = form.locationName.trim() || "Pending";
  const draftDateSummary = form.dateVisited ? formatDateLabel(form.dateVisited) : "Pending";
  const draftRevisitSummary = form.wouldRevisit ? "Yes" : "No";

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...diaryEntries]
      .filter((entry) => {
        if (filterType !== "All" && entry.type !== filterType) {
          return false;
        }

        if (filterRating !== "All" && entry.rating !== Number(filterRating)) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          entry.title,
          entry.description,
          entry.locationName,
          entry.cityOrCountry ?? "",
          entry.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        if (aTime !== bTime) return bTime - aTime;
        return b.id.localeCompare(a.id);
      });
  }, [diaryEntries, filterRating, filterType, searchTerm]);

  const resetForm = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setPhotoError("");
  };

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
      setForm((current) => ({
        ...current,
        photoUrl: previewUrl,
        photoChanged: true,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "The selected photo could not be processed.";
      setPhotoError(message);
    } finally {
      event.target.value = "";
    }
  };

  const startEdit = (entry: DiaryEntry) => {
    if (!canManageEntry(entry)) return;
    setEditingId(entry.id);
    setPhotoError("");
    setForm({
      title: entry.title,
      description: entry.description,
      type: entry.type,
      rating: normalizeDiaryRating(entry.rating),
      dateVisited: entry.dateVisited,
      locationName: entry.locationName,
      cityOrCountry: entry.cityOrCountry ?? "",
      tagsText: entry.tags.join(", "),
      wouldRevisit: entry.wouldRevisit,
      photoUrl: entry.photoUrl ?? "",
      photoPath: entry.photoPath,
      photoChanged: false,
    });
    window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) return;
    if (editingId && !editableEntry) return;

    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const trimmedLocation = form.locationName.trim();
    const tags = form.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!trimmedTitle || !trimmedDescription || !trimmedLocation || !form.dateVisited) {
      return;
    }

    const existingEntry = editableEntry;
    const now = new Date().toISOString();
    const ownerId = existingEntry ? (existingEntry.createdBy ?? existingEntry.savedByUserId ?? null) : currentUser?.userId ?? null;
    const ownerEmail = existingEntry ? existingEntry.savedByEmail ?? null : currentUser?.email ?? null;
    const nextEntry: DiaryEntry = {
      id: existingEntry?.id ?? `diary-${Date.now()}`,
      title: trimmedTitle,
      description: trimmedDescription,
      type: form.type,
      rating: normalizeDiaryRating(form.rating),
      dateVisited: form.dateVisited,
      locationName: trimmedLocation,
      cityOrCountry: form.cityOrCountry.trim() || undefined,
      tags,
      wouldRevisit: form.wouldRevisit,
      photoPath: existingEntry?.photoPath,
      photoUrl: form.photoChanged ? form.photoUrl : existingEntry?.photoUrl,
      createdBy: ownerId ?? undefined,
      savedByUserId: ownerId ?? undefined,
      savedByEmail: ownerEmail ?? undefined,
      createdAt: existingEntry?.createdAt ?? now,
      updatedAt: now,
      syncStatus: "pending",
    };

    setDiaryEntries((current) => {
      if (existingEntry) {
        return current.map((entry) => (entry.id === existingEntry.id ? nextEntry : entry));
      }
      return [nextEntry, ...current];
    });

    resetForm();
  };

  useEffect(() => {
    if (editingId && editingEntry && !editableEntry) {
      resetForm();
    }
  }, [editingEntry, editableEntry, editingId]);

  const handleDelete = (entryId: string) => {
    if (!canEdit) return;
    const target = diaryEntries.find((entry) => entry.id === entryId);
    if (!canManageEntry(target)) return;
    setDiaryEntries((current) => current.filter((entry) => entry.id !== entryId));
    if (editingId === entryId) {
      resetForm();
    }
  };

  const formPreview = form.photoUrl ? (
    <img
      src={form.photoUrl}
      alt={form.title || "Travel diary preview"}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400">
      <ImageIcon size={28} />
      <span className="mt-2 text-[12px] font-medium">Photo preview</span>
    </div>
  );

  return (
    <div
      className="mx-auto w-full max-w-6xl animate-in fade-in duration-300 px-4 py-4 md:px-8"
      style={{ fontFamily: '"Plus Jakarta Sans", var(--font-sans)' }}
    >
      <section className="mb-4 rounded-[14px] border border-stone-200 bg-white p-5 shadow-[0_10px_30px_rgba(6,45,39,0.06)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#93b56e]">
              <BookOpen size={12} />
              Travel diary
            </div>
            <h2 className="mt-2 text-[38px] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#0b1f1c] md:max-w-[820px]">
              Save the Malaysia and Singapore memories we want to remember.
            </h2>
            <p className="mt-3 max-w-3xl text-[13px] leading-6 text-[#7a8785]">
              Capture meals, landmarks, hotel stays, transport wins, and little trip moments with photos, ratings, and tags that sync with the rest of the itinerary when you are online.
            </p>
          </div>

          <button
            type="button"
            onClick={focusForm}
            disabled={!canEdit}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-bold transition-colors md:w-auto md:min-w-[136px] ${
              canEdit
                ? "bg-[#062d27] text-white hover:bg-[#0b3b34]"
                : "cursor-not-allowed bg-stone-100 text-stone-400"
            }`}
          >
            <Plus size={16} />
            Add memory
          </button>
        </div>
      </section>

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
          {pendingPhotoCount} photo{pendingPhotoCount === 1 ? "" : "s"} still need an online sync before they can
          be fully shared from Supabase Storage.
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mb-5 rounded-[14px] border border-stone-200 bg-white p-4 shadow-[0_10px_30px_rgba(6,45,39,0.06)]"
      >
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#93b56e]">
              <Camera size={12} />
              Add memory
            </div>
            <h3 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-[#0b1f1c]">
              {editingId ? "Refine this trip memory" : "Create a new diary entry"}
            </h3>
          </div>

          <button
            type="button"
            onClick={focusForm}
            disabled={!canEdit}
            className={`hidden items-center justify-center gap-2 rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition-colors md:inline-flex ${
              canEdit
                ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                : "cursor-not-allowed bg-stone-100 text-stone-400"
            }`}
          >
            <Plus size={14} />
            Add memory
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)] md:items-start">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-[12px] font-semibold text-stone-600">Title</span>
              <input
                ref={titleInputRef}
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                disabled={!canEdit}
                placeholder="Kaya toast at sunrise, Batu Caves, Marina Bay walk..."
                className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
                maxLength={120}
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-[12px] font-semibold text-stone-600">Type</span>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as DiaryEntryType }))}
                disabled={!canEdit}
                className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
              >
                {diaryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-[12px] font-semibold text-stone-600">Date visited</span>
              <input
                type="date"
                value={form.dateVisited}
                onChange={(event) => setForm((current) => ({ ...current, dateVisited: event.target.value }))}
                disabled={!canEdit}
                className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-[12px] font-semibold text-stone-600">Location name</span>
              <input
                type="text"
                value={form.locationName}
                onChange={(event) => setForm((current) => ({ ...current, locationName: event.target.value }))}
                disabled={!canEdit}
                placeholder="Jalan Alor, Marina Bay Sands, KL Sentral..."
                className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
                maxLength={120}
                required
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-1 block text-[12px] font-semibold text-stone-600">Country or city</span>
              <input
                type="text"
                value={form.cityOrCountry}
                onChange={(event) => setForm((current) => ({ ...current, cityOrCountry: event.target.value }))}
                disabled={!canEdit}
                placeholder="Kuala Lumpur, Malaysia"
                className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
                maxLength={80}
              />
            </label>

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
                <div className="relative grid w-full grid-cols-5 gap-2 select-none">
                  {Array.from({ length: 5 }, (_, index) => {
                    const starNumber = index + 1;
                    const starTone = getRatingStarTone(form.rating);
                    return (
                      <div
                        key={starNumber}
                        aria-hidden="true"
                        className={`inline-flex h-11 w-full items-center justify-center rounded-full border transition-colors ${
                          starNumber <= form.rating
                            ? `${starTone.border} ${starTone.activeBg} ${starTone.activeText}`
                            : "border-stone-200 bg-white text-stone-400"
                        }`}
                      >
                        <span className="relative inline-flex h-[16px] w-[16px]">
                          <Star className="absolute inset-0 h-[16px] w-[16px] text-stone-300" fill="currentColor" strokeWidth={0} />
                          <span
                            className="absolute inset-y-0 left-0 overflow-hidden"
                            style={{ width: `${Math.max(0, Math.min(1, form.rating - index)) * 100}%` }}
                          >
                            <Star className="h-[16px] w-[16px] text-[#0B3530]" fill="currentColor" strokeWidth={0} />
                          </span>
                        </span>
                      </div>
                    );
                  })}
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={handleRatingRangeChange}
                    onInput={handleRatingRangeChange}
                    disabled={!canEdit}
                    aria-label="Diary rating"
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                </div>
                <p className="text-[11px] text-stone-400">Click or drag across the stars to set a decimal rating.</p>
              </div>
            </div>

            <label className="rounded-[12px] border border-stone-200 bg-white p-3 shadow-[0_6px_20px_rgba(6,45,39,0.04)] md:col-span-2 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 md:text-[12px] md:font-semibold md:normal-case md:tracking-normal md:text-stone-600">Description</span>
              <span className="mb-2 block text-[12px] text-stone-600 md:hidden">Capture what made this memory worth keeping.</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                disabled={!canEdit}
                placeholder="What made this stop memorable? What should we remember next time?"
                className="min-h-[130px] w-full resize-none rounded-[10px] border border-stone-200 bg-[#fafaff] px-3 py-3 text-[14px] leading-6 text-stone-800 outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff] md:min-h-[110px] md:py-2.5 md:text-[14px] md:leading-normal"
                maxLength={1000}
                required
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-1 block text-[12px] font-semibold text-stone-600">Tags</span>
              <input
                type="text"
                value={form.tagsText}
                onChange={(event) => setForm((current) => ({ ...current, tagsText: event.target.value }))}
                disabled={!canEdit}
                placeholder="food, cafe, sunset, family time"
                className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
                maxLength={200}
              />
              <span className="mt-1 block text-[11px] text-stone-500">Separate tags with commas.</span>
            </label>

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
            <div className="hidden items-center gap-2 md:col-span-2 md:flex">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-[10px] border border-stone-200 px-4 py-3 text-[13px] font-semibold text-stone-600 transition-colors hover:bg-stone-50"
                >
                  Cancel edit
                </button>
              )}
              <button
                type="submit"
                disabled={!canEdit}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-[13px] font-bold transition-colors ${
                  canEdit
                    ? "bg-[#062d27] text-white hover:bg-[#0b3b34]"
                    : "cursor-not-allowed bg-stone-100 text-stone-400"
                }`}
              >
                {editingId ? <PencilLine size={15} /> : <Plus size={15} />}
                {editingId ? "Save memory" : "Save memory"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[16px] border border-stone-200 bg-white p-4 shadow-[0_6px_20px_rgba(6,45,39,0.04)]">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#93b56e]">
                <CloudUpload size={12} />
                Photo upload
              </div>
              <div className="mb-2 text-[12px] font-semibold text-stone-700">Choose a photo</div>
              <label className="block">
                <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={!canEdit} className="sr-only" />
                <div className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-stone-300 bg-white px-4 text-center md:min-h-[88px]">
                  <CloudUpload size={24} className="text-[#062d27]" />
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
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-[10px] border border-stone-200 px-4 py-3 text-[13px] font-semibold text-stone-600 transition-colors hover:bg-stone-50"
                  >
                    Cancel edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!canEdit}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-[13px] font-bold transition-colors ${
                    canEdit
                      ? "bg-[#062d27] text-white hover:bg-[#0b3b34]"
                      : "cursor-not-allowed bg-stone-100 text-stone-400"
                  }`}
                >
                  {editingId ? <PencilLine size={15} /> : <Plus size={15} />}
                  Save memory
                </button>
              </div>
            </div>

            <div className="rounded-[16px] border border-stone-200 bg-white p-4 shadow-[0_6px_20px_rgba(6,45,39,0.04)]">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#93b56e]">
                <CalendarDays size={12} />
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
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-semibold text-stone-600">{draftRevisitSummary}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dff2ea] bg-[#f2faf6] p-4 shadow-[0_6px_20px_rgba(6,45,39,0.04)]">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#93b56e]">
                <MapPin size={12} />
                Sync notes
              </div>
              <p className="text-[12px] leading-5 text-[#58716b]">
                {canEdit
                  ? "Saving will keep the memory on this device first, then push it to the cloud."
                  : "Read-only mode keeps local cache entries visible, but editing is disabled until sign-in."}
              </p>
            </div>
          </div>
        </div>
      </form>

      <section className="mb-5 rounded-[14px] border border-stone-200 bg-white p-4 shadow-[0_10px_30px_rgba(6,45,39,0.06)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6d7f79]">
              <Search size={12} />
              Filters
            </div>
            <h3 className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-[#0b1f1c]">Search the travel diary</h3>
          </div>

          <div className="text-[12px] text-stone-500 md:text-right">
            {filteredEntries.length} memor{filteredEntries.length === 1 ? "y" : "ies"} shown
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1.3fr_0.85fr_0.85fr]">
          <label className="md:col-span-1">
            <span className="mb-1 block text-[12px] font-semibold text-stone-600">Search</span>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Title, location, tags, description..."
                className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
              />
            </div>
          </label>

          <label>
            <span className="mb-1 block text-[12px] font-semibold text-stone-600">Type</span>
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value as DiaryEntryType | "All")}
              className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
            >
              <option value="All">All types</option>
              {diaryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-[12px] font-semibold text-stone-600">Rating</span>
            <select
              value={filterRating}
              onChange={(event) => setFilterRating(event.target.value)}
              className="w-full rounded-[10px] border border-stone-200 bg-[#fafaff] px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#7c6ae6] focus:bg-[#f6f2ff]"
            >
              <option value="All">All ratings</option>
              {starScale.map((rating) => (
                <option key={rating} value={String(rating)}>
                  {rating} stars
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section>
        {filteredEntries.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-stone-200 bg-white px-5 py-10 text-center text-[14px] text-stone-500 shadow-xs">
            {diaryEntries.length === 0
              ? "No memories yet. Add your first travel diary entry."
              : "No memories match your current filters."}
          </div>
        ) : (
          <div className="space-y-4 md:space-y-5">
            {filteredEntries.map((entry) => {
              const typeClass = getTypePillClass(entry.type);
              const locationLabel = entry.cityOrCountry
                ? `${entry.locationName}, ${entry.cityOrCountry}`
                : entry.locationName;

              return (
                <article
                  key={entry.id}
                  className="group overflow-hidden rounded-[14px] border border-stone-200 bg-white shadow-[0_10px_30px_rgba(6,45,39,0.06)] transition-shadow hover:shadow-[0_14px_34px_rgba(6,45,39,0.1)] md:grid md:grid-cols-[340px_minmax(0,1fr)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 md:aspect-auto md:h-full md:min-h-[320px]">
                    {entry.photoUrl ? (
                      <img
                        src={entry.photoUrl}
                        alt={entry.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 text-stone-400">
                        <Camera size={30} />
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${typeClass}`}>
                        {entry.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={getSyncDotClass(entry.syncStatus)}
                          aria-label={getSyncDotLabel(entry.syncStatus)}
                          title={getSyncDotLabel(entry.syncStatus)}
                        />
                        {canManageEntry(entry) && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(entry)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/90 text-stone-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
                              aria-label={`Edit ${entry.title}`}
                              title="Edit entry"
                            >
                              <PencilLine size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(entry.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/90 text-rose-600 shadow-sm backdrop-blur transition-colors hover:bg-rose-50"
                              aria-label={`Delete ${entry.title}`}
                              title="Delete entry"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 md:flex md:flex-col md:justify-between md:p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="line-clamp-2 text-[22px] font-semibold leading-tight tracking-[-0.03em] text-stone-900 md:text-[28px]">
                          {entry.title}
                        </h4>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-emerald-500">
                        {renderStars(entry.rating, "h-3.5 w-3.5")}
                        <span className="ml-1 text-[11px] font-semibold text-stone-500">{formatDiaryRating(entry.rating)}/5</span>
                      </div>
                    </div>

                    <div className="rounded-[12px] border border-stone-200 bg-stone-50 px-3 py-3 md:rounded-[12px] md:border md:border-stone-200">
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                        Description
                      </div>
                      <p className="whitespace-pre-wrap break-words text-[14px] leading-6 text-stone-700 md:text-[14px] md:text-stone-700">
                        {entry.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-[12px] text-stone-600">
                      <div className="flex items-start gap-2">
                        <CalendarDays size={13} className="mt-0.5 shrink-0 text-[#88B04B]" />
                        <span>{formatDateLabel(entry.dateVisited)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-[#88B04B]" />
                        <span>{locationLabel}</span>
                      </div>
                    </div>

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tagValue) => (
                          <span
                            key={`${entry.id}-${tagValue}`}
                            className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-medium text-stone-600"
                          >
                            <Tag size={11} />
                            {tagValue}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-[10px] text-stone-400">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono uppercase tracking-wider">
                          Saved by {formatSavedBy(entry.savedByEmail, entry.savedByUserId)}
                        </span>
                        <span className="font-mono uppercase tracking-wider">
                          Created {formatTimestamp(entry.createdAt)}
                        </span>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${getRevisitPillClass(
                          entry.wouldRevisit,
                        )}`}
                      >
                        {entry.wouldRevisit ? "Would revisit" : "One and done"}
                      </span>
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
