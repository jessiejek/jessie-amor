import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Camera,
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

const getSyncPillClass = (value?: SyncStatus) =>
  value === "pending"
    ? "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800"
    : "inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]";

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
  if (rating === 0) return "No rating";
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

const renderStars = (rating: number, className = "h-4 w-4") =>
  starScale.map((starValue) => (
    <Star
      key={starValue}
      size={14}
      className={className}
      fill={starValue <= rating ? "currentColor" : "none"}
      strokeWidth={starValue <= rating ? 0 : 2}
    />
  ));

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

  const pendingPhotoCount = diaryEntries.filter((entry) => entry.syncStatus === "pending" && entry.photoUrl?.startsWith("data:")).length;
  const ratingTone = getRatingTone(form.rating);

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
      rating: entry.rating,
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
      rating: Math.max(0, Math.min(5, Number(form.rating.toFixed(1)))),
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
    <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-300 px-4 py-4 md:px-8">
      <section className="mb-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#88B04B]">
              <BookOpen size={14} />
              Travel diary
            </div>
            <h2 className="mt-2 text-2xl font-serif font-bold text-[#0B3530] md:text-3xl">
              Save the Malaysia and Singapore memories we want to remember.
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
              Capture meals, landmarks, hotel stays, transport wins, and little trip moments with photos, ratings,
              and tags that sync with the rest of the itinerary when you are online.
            </p>
          </div>

          <button
            type="button"
            onClick={focusForm}
            disabled={!canEdit}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${
              canEdit
                ? "bg-[#0B3530] text-white hover:bg-[#18534C]"
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
        className="mb-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs"
      >
        <div className="mb-4 flex flex-col gap-2 border-b border-stone-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#88B04B]">
              <Camera size={14} />
              {editingId ? "Edit memory" : "Add memory"}
            </div>
            <h3 className="mt-1 text-lg font-serif font-bold text-[#0B3530]">
              {editingId ? "Refine this trip memory" : "Create a new diary entry"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-stone-200 px-4 py-2 text-[13px] font-semibold text-stone-600 transition-colors hover:bg-stone-50"
              >
                Cancel edit
              </button>
            )}
            <button
              type="submit"
              disabled={!canEdit}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                canEdit
                  ? "bg-[#0B3530] text-white hover:bg-[#18534C]"
                  : "cursor-not-allowed bg-stone-100 text-stone-400"
              }`}
            >
              {editingId ? <PencilLine size={15} /> : <Plus size={15} />}
              {editingId ? "Update memory" : "Add memory"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-[13px] font-semibold text-stone-600">Title</span>
              <input
                ref={titleInputRef}
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                disabled={!canEdit}
                placeholder="Kaya toast at sunrise, Batu Caves, Marina Bay walk..."
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
                maxLength={120}
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-[13px] font-semibold text-stone-600">Type</span>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as DiaryEntryType }))}
                disabled={!canEdit}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
              >
                {diaryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-[13px] font-semibold text-stone-600">Date visited</span>
              <input
                type="date"
                value={form.dateVisited}
                onChange={(event) => setForm((current) => ({ ...current, dateVisited: event.target.value }))}
                disabled={!canEdit}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-[13px] font-semibold text-stone-600">Location name</span>
              <input
                type="text"
                value={form.locationName}
                onChange={(event) => setForm((current) => ({ ...current, locationName: event.target.value }))}
                disabled={!canEdit}
                placeholder="Jalan Alor, Marina Bay Sands, KL Sentral..."
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
                maxLength={120}
                required
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-1 block text-[13px] font-semibold text-stone-600">Country or city</span>
              <input
                type="text"
                value={form.cityOrCountry}
                onChange={(event) => setForm((current) => ({ ...current, cityOrCountry: event.target.value }))}
                disabled={!canEdit}
                placeholder="Kuala Lumpur, Malaysia"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
                maxLength={80}
              />
            </label>

            <div className="md:col-span-2">
              <span className="mb-1 block text-[13px] font-semibold text-stone-600">Rating</span>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-semibold ${ratingTone.scoreText}`}>{form.rating.toFixed(1)}</span>
                  <span className="pb-0.5 text-[13px] text-stone-400">/ 5</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: 5 }, (_, index) => {
                    const starNumber = index + 1;
                    const fillPercent = Math.max(0, Math.min(1, form.rating - (starNumber - 1))) * 100;
                    const isActive = fillPercent > 0;

                    return (
                      <div
                        key={starNumber}
                        className={`relative overflow-hidden rounded-full border px-3 py-2 ${
                          isActive ? `${ratingTone.border} bg-white` : "border-stone-200 bg-white"
                        }`}
                      >
                        <div
                          className={`absolute inset-y-0 left-0 ${ratingTone.fillBg}`}
                          style={{ width: `${fillPercent}%` }}
                        />
                        <div className="relative flex items-center gap-1 text-[13px] font-semibold text-stone-400">
                          <Star className="h-[14px] w-[14px] shrink-0" fill="currentColor" strokeWidth={0} />
                          <span>{starNumber}</span>
                        </div>
                        <div
                          className="absolute inset-y-0 left-0 overflow-hidden"
                          style={{ width: `${fillPercent}%` }}
                        >
                          <div className={`flex h-full items-center gap-1 px-3 py-2 text-[13px] font-semibold ${ratingTone.fillText}`}>
                            <Star className="h-[14px] w-[14px] shrink-0" fill="currentColor" strokeWidth={0} />
                            <span>{starNumber}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rating: Number(Number(event.target.value).toFixed(1)),
                    }))
                  }
                  disabled={!canEdit}
                  className={`w-full accent-[#0B3530] ${!canEdit ? "cursor-not-allowed opacity-70" : ""}`}
                />
                <p className={`text-[13px] font-semibold ${ratingTone.labelText}`}>{getRatingLabel(form.rating)}</p>
              </div>
            </div>

            <label className="md:col-span-2">
              <span className="mb-1 block text-[13px] font-semibold text-stone-600">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                disabled={!canEdit}
                placeholder="What made this stop memorable? What should we remember next time?"
                className="min-h-[130px] w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
                maxLength={1000}
                required
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-1 block text-[13px] font-semibold text-stone-600">Tags</span>
              <input
                type="text"
                value={form.tagsText}
                onChange={(event) => setForm((current) => ({ ...current, tagsText: event.target.value }))}
                disabled={!canEdit}
                placeholder="food, cafe, sunset, family time"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
              />
              <p className="mt-1 text-[11px] text-stone-400">Separate tags with commas.</p>
            </label>

            <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
              <input
                type="checkbox"
                checked={form.wouldRevisit}
                onChange={(event) => setForm((current) => ({ ...current, wouldRevisit: event.target.checked }))}
                disabled={!canEdit}
                className="h-4 w-4 rounded border-stone-300 text-[#0B3530] focus:ring-[#0B3530]"
              />
              <div>
                <span className="block text-[13px] font-semibold text-stone-700">Would revisit?</span>
                <span className="block text-[12px] text-stone-500">
                  Mark places we would happily return to on the next trip.
                </span>
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#88B04B]">
                <ImageIcon size={14} />
                Photo upload
              </div>

              <label className="block">
                <span className="mb-1 block text-[13px] font-semibold text-stone-600">Choose a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={!canEdit}
                  className="block w-full cursor-pointer rounded-xl border border-stone-200 bg-white px-3 py-2 text-[14px] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[#0B3530] file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-white"
                />
              </label>

              <p className="mt-2 text-[11px] text-stone-500">
                Images are compressed locally before sync. Supabase uploads happen only when you are signed in and online.
              </p>

              {photoError && <p className="mt-2 text-[12px] text-rose-600">{photoError}</p>}

              {form.photoUrl && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  {formPreview}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#88B04B]">
                <CalendarDays size={14} />
                Draft summary
              </div>

              <div className="mt-3 space-y-2 text-[13px] text-stone-600">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-stone-700">Location</span>
                  <span className="text-right">{form.locationName || "Pending"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-stone-700">Date visited</span>
                  <span className="text-right">{form.dateVisited ? formatDateLabel(form.dateVisited) : "Pending"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-stone-700">Revisit</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getRevisitPillClass(form.wouldRevisit)}`}>
                    {form.wouldRevisit ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#88B04B]">
                <MapPin size={14} />
                Sync notes
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-stone-500">
                {canEdit
                  ? "Saving will keep the memory on this device first, then push it to Supabase when the connection is ready."
                  : "Read-only mode keeps local cache entries visible, but editing is disabled until sign-in."}
              </p>
            </div>
          </div>
        </div>
      </form>

      <section className="mb-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#88B04B]">
              <Search size={14} />
              Filters
            </div>
            <h3 className="mt-1 text-lg font-serif font-bold text-[#0B3530]">Search the travel diary</h3>
          </div>

          <div className="text-[12px] text-stone-500">
            {filteredEntries.length} memor{filteredEntries.length === 1 ? "y" : "ies"} shown
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="md:col-span-1">
            <span className="mb-1 block text-[13px] font-semibold text-stone-600">Search</span>
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Title, location, tags, description..."
                className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
              />
            </div>
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-semibold text-stone-600">Type</span>
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value as DiaryEntryType | "All")}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
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
            <span className="mb-1 block text-[13px] font-semibold text-stone-600">Rating</span>
            <select
              value={filterRating}
              onChange={(event) => setFilterRating(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#0B3530]"
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
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white px-5 py-10 text-center text-[14px] text-stone-500 shadow-xs">
            {diaryEntries.length === 0
              ? "No memories yet. Add your first travel diary entry."
              : "No memories match your current filters."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEntries.map((entry) => {
              const typeClass = getTypePillClass(entry.type);
              const isPending = entry.syncStatus === "pending";
              const locationLabel = entry.cityOrCountry
                ? `${entry.locationName} - ${entry.cityOrCountry}`
                : entry.locationName;

              return (
                <article
                  key={entry.id}
                  className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
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
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${typeClass}`}>
                        {entry.type}
                      </span>
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <span className={getSyncPillClass(entry.syncStatus)}>Local</span>
                        ) : (
                          <span className={getSyncPillClass(entry.syncStatus)} aria-label="Synced" title="Synced" />
                        )}
                        {canManageEntry(entry) && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(entry)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/85 text-stone-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
                              aria-label={`Edit ${entry.title}`}
                              title="Edit entry"
                            >
                              <PencilLine size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(entry.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/85 text-rose-600 shadow-sm backdrop-blur transition-colors hover:bg-rose-50"
                              aria-label={`Delete ${entry.title}`}
                              title="Delete entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="line-clamp-2 text-[16px] font-semibold leading-snug text-stone-800">
                          {entry.title}
                        </h4>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-amber-500">
                        {renderStars(entry.rating)}
                        <span className="ml-1 text-[12px] font-semibold text-stone-500">{entry.rating}/5</span>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-[14px] leading-relaxed text-stone-500">
                      {entry.description}
                    </p>

                    <div className="grid grid-cols-1 gap-2 text-[13px] text-stone-600">
                      <div className="flex items-start gap-2">
                        <CalendarDays size={14} className="mt-0.5 shrink-0 text-[#88B04B]" />
                        <span>{formatDateLabel(entry.dateVisited)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-[#88B04B]" />
                        <span>{locationLabel}</span>
                      </div>
                    </div>

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tagValue) => (
                          <span
                            key={`${entry.id}-${tagValue}`}
                            className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600"
                          >
                            <Tag size={11} />
                            {tagValue}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-[11px] text-stone-400">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono uppercase tracking-wider">
                          Saved by {formatSavedBy(entry.savedByEmail, entry.savedByUserId)}
                        </span>
                        <span className="font-mono uppercase tracking-wider">
                          Created {formatTimestamp(entry.createdAt)}
                        </span>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getRevisitPillClass(
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
