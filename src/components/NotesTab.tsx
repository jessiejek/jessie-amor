import React, { useMemo, useState } from "react";
import { Copy, Plus, Trash2, CheckCircle2, Bookmark, Lightbulb, ClipboardList, PenTool } from "lucide-react";
import type { ChecklistItem, TravelNote, SyncStatus } from "../types";

interface NotesTabProps {
  notes: TravelNote[];
  setNotes: React.Dispatch<React.SetStateAction<TravelNote[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  isOnline?: boolean;
  canEdit?: boolean;
  currentUser?: {
    userId: string;
    email: string;
    isAdmin: boolean;
  } | null;
}

export default function NotesTab({
  notes,
  setNotes,
  checklist,
  setChecklist,
  isOnline = true,
  canEdit = false,
  currentUser = null,
}: NotesTabProps) {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState<"Rule" | "Requirement" | "General">("General");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "mine">("mine");
  
  const [newCheckItem, setNewCheckItem] = useState("");
  const formatSavedBy = (email?: string, userId?: string) => {
    if (email) return email.split("@")[0];
    if (userId) return userId.slice(0, 8);
    return "Unknown";
  };

  const getOwnerId = (entry?: { createdBy?: string; savedByUserId?: string | null } | null) =>
    entry?.createdBy ?? entry?.savedByUserId ?? null;

  const canManageEntry = (entry?: { createdBy?: string; savedByUserId?: string | null } | null) => {
    if (!currentUser) return false;
    const ownerId = getOwnerId(entry);
    return currentUser.isAdmin || ownerId === currentUser.userId;
  };

  const ownerNotes = useMemo(() => {
    if (ownerFilter === "mine" && currentUser) {
      return notes.filter(
        (n) => n.createdBy === currentUser.userId || n.savedByUserId === currentUser.userId,
      );
    }
    return notes;
  }, [notes, ownerFilter, currentUser]);

  const ownerChecklist = useMemo(() => {
    if (ownerFilter === "mine" && currentUser) {
      return checklist.filter(
        (c) => c.createdBy === currentUser.userId || c.savedByUserId === currentUser.userId,
      );
    }
    return checklist;
  }, [checklist, ownerFilter, currentUser]);

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

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: TravelNote = {
      id: "note-" + Date.now(),
      title: noteTitle,
      content: noteContent,
      category: noteCategory,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.userId,
      savedByUserId: currentUser?.userId,
      savedByEmail: currentUser?.email,
      syncStatus: "pending",
    };

    setNotes((prev) => [newNote, ...prev]);
    setNoteTitle("");
    setNoteContent("");
  };

  const handleDeleteNote = (id: string) => {
    if (!canEdit) return;
    const target = notes.find((note) => note.id === id);
    if (!canManageEntry(target)) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleCheck = (id: string) => {
    if (!canEdit) return;
    const updated = checklist.map((item) => {
      if (item.id === id && canManageEntry(item)) {
        return {
          ...item,
          completed: !item.completed,
          createdBy: item.createdBy ?? item.savedByUserId,
          savedByUserId: item.savedByUserId ?? item.createdBy,
          savedByEmail: item.savedByEmail ?? undefined,
          syncStatus: "pending",
        };
      }
      return item;
    });
    setChecklist(updated);
  };

  const handleDeleteCheckItem = (id: string) => {
    if (!canEdit) return;
    const target = checklist.find((item) => item.id === id);
    if (!canManageEntry(target)) return;
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!newCheckItem.trim()) return;

    const newItem: ChecklistItem = {
      id: "check-" + Date.now(),
      text: newCheckItem,
      completed: false,
      createdBy: currentUser?.userId,
      savedByUserId: currentUser?.userId,
      savedByEmail: currentUser?.email,
      syncStatus: "pending",
    };

    const updated = [...checklist, newItem];
    setChecklist(updated);
    setNewCheckItem("");
  };

  const getCatBadgeStyles = (cat: string) => {
    switch (cat) {
      case "Rule":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Requirement":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-sky-100 text-sky-800 border-sky-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 bg-stone-50 animate-in fade-in duration-300">
      {!isOnline && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 shadow-xs">
          Offline mode is active. Checklist and notes changes stay on this device and upload when the connection returns.
        </div>
      )}

      {currentUser && (
        <div className="flex items-center gap-1.5 mb-4 px-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 mr-1">Show</span>
          <button
            type="button"
            onClick={() => setOwnerFilter("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              ownerFilter === "all"
                ? "bg-[#0B3530] text-white shadow-sm"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setOwnerFilter("mine")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              ownerFilter === "mine"
                ? "bg-[#0B3530] text-white shadow-sm"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            Mine
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Checklist Column */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col h-fit">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-4">
            <ClipboardList className="text-[#0B3530]" size={18} />
            <h3 className="text-[15px] font-serif font-bold text-[#0B3530]">Trip Checklist</h3>
          </div>

          {!canEdit && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              Sign in to add, edit, or mark checklist items.
            </div>
          )}

          <form onSubmit={handleAddCheckItem} className="flex gap-2 mb-4 font-sans">
            <input
              type="text"
              value={newCheckItem}
              onChange={(e) => setNewCheckItem(e.target.value)}
              placeholder="Add new checklist task..."
              disabled={!canEdit}
              className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg text-[14px] outline-none focus:border-[#0B3530]"
              maxLength={80}
            />
            <button
              type="submit"
              disabled={!canEdit}
              className="px-3 py-1.5 bg-[#0B3530] text-[#88B04B] hover:text-white hover:bg-[#18534C] text-[14px] font-semibold rounded-lg transition-colors cursor-pointer border-none"
            >
              Add
            </button>
          </form>

          {/* Checklist items */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {ownerChecklist.map((item) => (
              <div
                key={item.id}
                className={`relative flex items-start gap-3 p-2.5 rounded-lg border border-stone-50 bg-stone-50/50 transition-all select-none ${
                  canEdit && canManageEntry(item) ? "hover:bg-stone-50 cursor-pointer" : "cursor-default opacity-80"
                }`}
              >
                {canManageEntry(item) ? (
                  <button
                    type="button"
                    onClick={() => handleToggleCheck(item.id)}
                    className={`mt-0.5 shrink-0 rounded-full border p-0.5 transition-all ${
                      item.completed ? "border-green-600 bg-green-50 text-green-600" : "border-stone-300 text-transparent"
                    }`}
                    aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    <CheckCircle2 size={12} className="stroke-[3px]" />
                  </button>
                ) : (
                  <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-stone-200 bg-stone-100" aria-hidden="true" />
                )}

                <div className="min-w-0 flex-1 pr-8">
                  <span className={`block text-[14px] font-sans leading-relaxed ${
                    item.completed ? "line-through text-stone-400" : "text-stone-700"
                  }`}>
                    {item.text}
                  </span>
                  {(item.savedByEmail || item.savedByUserId) && (
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="block text-[11px] font-mono uppercase tracking-wider text-stone-400">
                        {formatSavedBy(item.savedByEmail, item.savedByUserId)}
                      </span>
                      <span
                        className={getSyncDotClass(item.syncStatus)}
                        title={getSyncDotLabel(item.syncStatus)}
                        aria-label={getSyncDotLabel(item.syncStatus)}
                      />
                    </div>
                  )}
                </div>

                {canManageEntry(item) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCheckItem(item.id)}
                    className="absolute right-2 top-2 rounded p-1 text-stone-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Delete checklist item"
                    title="Delete checklist item"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Middle and Right Notes section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Note inline board */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-4">
              <PenTool className="text-[#0B3530]" size={18} />
              <h3 className="text-[15px] font-serif font-bold text-[#0B3530]">Add Travel Scratch Note</h3>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3 font-sans">
              <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note Title (e.g., Souvenir Ideas)"
                disabled={!canEdit}
                className="col-span-2 px-3 py-2 border border-stone-200 rounded-lg text-[14px] outline-none focus:border-[#0B3530]"
                required
              />
                
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  disabled={!canEdit}
                  className="px-3 py-2 border border-stone-200 rounded-lg text-[14px] outline-none focus:border-[#0B3530] bg-[#FFFFFF]"
                >
                  <option value="General">General Info</option>
                  <option value="Rule">Strict Rule</option>
                  <option value="Requirement">Requirement</option>
                </select>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write down sights to seek, shops to visit, or custom budgets ideas..."
                rows={3}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-[14px] outline-none focus:border-[#0B3530] resize-none"
                required
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!canEdit}
                  className="px-4 py-2 bg-[#0B3530] text-white hover:bg-[#18534C] text-[14px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border-none shadow-xs"
                >
                  <Plus size={14} /> Add Scratch Note
                </button>
              </div>
            </form>
          </div>

          {/* List of custom notes cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownerNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-48 relative overflow-hidden group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[14px] uppercase tracking-wider font-mono font-bold border ${getCatBadgeStyles(note.category)}`}>
                      {note.category}
                    </span>
                    {canManageEntry(note) && (
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 absolute top-3 right-3"
                        title="Delete Note"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <h4 className="text-[14px] font-bold text-stone-800 font-sans mt-1 line-clamp-1">{note.title}</h4>
                  <p className="text-[13px] text-stone-500 font-sans leading-relaxed mt-2 line-clamp-4">
                    {note.content}
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-2 mt-2 flex flex-col gap-1 font-mono text-[11px] text-stone-400">
                  <span>CREATED: {new Date(note.createdAt).toLocaleDateString()}</span>
                  {(note.savedByEmail || note.savedByUserId) && (
                    <span className="text-[11px] uppercase tracking-wider">{formatSavedBy(note.savedByEmail, note.savedByUserId)}</span>
                  )}
                  <span
                    className={getSyncDotClass(note.syncStatus)}
                    title={getSyncDotLabel(note.syncStatus)}
                    aria-label={getSyncDotLabel(note.syncStatus)}
                  />
                  <Bookmark size={10} className="text-[#88B04B]" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
