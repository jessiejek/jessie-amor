import React, { useMemo, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonChip,
  IonLabel,
} from "@ionic/react";
import { addOutline, trashOutline, bookmarkOutline, clipboardOutline, createOutline } from "ionicons/icons";
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
        return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
      case "Requirement":
        return { bg: "#ffe4e6", text: "#9f1239", border: "#fecdd3" };
      default:
        return { bg: "#e0f2fe", text: "#075985", border: "#bae6fd" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 bg-stone-50 animate-in fade-in duration-300">
      {/* Offline banner */}
      {!isOnline && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 shadow-xs">
          Offline mode is active. Checklist and notes changes stay on this device and upload when the connection returns.
        </div>
      )}

      {/* Owner filter */}
      {currentUser && (
        <div className="flex items-center gap-1.5 mb-4 px-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 mr-1">Show</span>
          <IonSegment
            value={ownerFilter}
            onIonChange={(event) => setOwnerFilter(event.detail.value as "all" | "mine")}
            className="ja-notes-segment"
          >
            <IonSegmentButton value="all" className="ja-notes-segment-btn">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="mine" className="ja-notes-segment-btn">
              <IonLabel>Mine</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Checklist Column */}
        <IonCard className="ja-notes-checklist-card">
          <IonCardHeader className="ja-notes-card-header">
            <div className="flex items-center gap-2">
              <IonIcon icon={clipboardOutline} style={{ color: "#0B3530", fontSize: 18 }} />
              <IonCardSubtitle className="ja-notes-section-title">Trip Checklist</IonCardSubtitle>
            </div>
          </IonCardHeader>

          <IonCardContent className="ja-notes-card-body">
            {!canEdit && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
                Sign in to add, edit, or mark checklist items.
              </div>
            )}

            <form onSubmit={handleAddCheckItem} className="flex gap-2 mb-4">
              <IonInput
                value={newCheckItem}
                onIonInput={(event) => setNewCheckItem(event.detail.value ?? "")}
                placeholder="Add new checklist task..."
                disabled={!canEdit}
                className="ja-notes-input"
                maxlength={80}
              />
              <IonButton
                type="submit"
                disabled={!canEdit}
                className="ja-notes-add-btn"
                size="small"
              >
                Add
              </IonButton>
            </form>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {ownerChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`relative flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                    canEdit && canManageEntry(item)
                      ? "border-stone-100 bg-stone-50/50 hover:bg-stone-50"
                      : "border-stone-100 bg-stone-50/50 cursor-default opacity-80"
                  }`}
                >
                  {canManageEntry(item) ? (
                    <IonCheckbox
                      checked={item.completed}
                      onIonChange={() => handleToggleCheck(item.id)}
                      className="ja-notes-checkbox"
                      aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                    />
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
                          className="inline-block h-2.5 w-2.5 rounded-full align-middle"
                          style={{ backgroundColor: getSyncDotColor(item.syncStatus) }}
                          title={getSyncDotLabel(item.syncStatus)}
                          aria-label={getSyncDotLabel(item.syncStatus)}
                        />
                      </div>
                    )}
                  </div>

                  {canManageEntry(item) && (
                    <IonButton
                      fill="clear"
                      size="small"
                      onClick={() => handleDeleteCheckItem(item.id)}
                      className="ja-notes-delete-btn"
                      aria-label="Delete checklist item"
                      title="Delete checklist item"
                    >
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  )}
                </div>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Middle and Right Notes section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Note card */}
          <IonCard className="ja-notes-create-card">
            <IonCardHeader className="ja-notes-card-header">
              <div className="flex items-center gap-2">
                <IonIcon icon={createOutline} style={{ color: "#0B3530", fontSize: 18 }} />
                <IonCardSubtitle className="ja-notes-section-title">Add Travel Scratch Note</IonCardSubtitle>
              </div>
            </IonCardHeader>

            <IonCardContent className="ja-notes-card-body">
              <form onSubmit={handleAddNote} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <IonInput
                    value={noteTitle}
                    onIonInput={(event) => setNoteTitle(event.detail.value ?? "")}
                    placeholder="Note Title (e.g., Souvenir Ideas)"
                    disabled={!canEdit}
                    className="ja-notes-input col-span-2"
                    required
                  />

                  <IonSelect
                    value={noteCategory}
                    onIonChange={(event) => setNoteCategory(event.detail.value as "Rule" | "Requirement" | "General")}
                    disabled={!canEdit}
                    interface="action-sheet"
                    className="ja-notes-select"
                  >
                    <IonSelectOption value="General">General Info</IonSelectOption>
                    <IonSelectOption value="Rule">Strict Rule</IonSelectOption>
                    <IonSelectOption value="Requirement">Requirement</IonSelectOption>
                  </IonSelect>
                </div>

                <IonTextarea
                  value={noteContent}
                  onIonInput={(event) => setNoteContent(event.detail.value ?? "")}
                  placeholder="Write down sights to seek, shops to visit, or custom budgets ideas..."
                  rows={3}
                  disabled={!canEdit}
                  className="ja-notes-textarea"
                  required
                />

                <div className="flex justify-end">
                  <IonButton
                    type="submit"
                    disabled={!canEdit}
                    className="ja-notes-add-btn"
                  >
                    <IonIcon icon={addOutline} slot="start" />
                    Add Scratch Note
                  </IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Notes grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownerNotes.map((note) => {
              const catStyles = getCatBadgeStyles(note.category);
              return (
                <IonCard
                  key={note.id}
                  className="ja-notes-note-card"
                >
                  <IonCardContent className="ion-no-padding" style={{ padding: 0 }}>
                    <div className="flex flex-col justify-between h-48 relative overflow-hidden p-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <IonChip
                            className="ja-notes-cat-chip"
                            style={{ background: catStyles.bg, color: catStyles.text, border: `1px solid ${catStyles.border}` }}
                          >
                            {note.category}
                          </IonChip>
                          {canManageEntry(note) && (
                            <IonButton
                              fill="clear"
                              size="small"
                              onClick={() => handleDeleteNote(note.id)}
                              className="ja-notes-delete-btn absolute top-3 right-3"
                              title="Delete Note"
                            >
                              <IonIcon icon={trashOutline} />
                            </IonButton>
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
                          className="inline-block h-2.5 w-2.5 rounded-full align-middle"
                          style={{ backgroundColor: getSyncDotColor(note.syncStatus) }}
                          title={getSyncDotLabel(note.syncStatus)}
                          aria-label={getSyncDotLabel(note.syncStatus)}
                        />
                        <IonIcon icon={bookmarkOutline} style={{ color: "#88B04B", fontSize: 10 }} />
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
