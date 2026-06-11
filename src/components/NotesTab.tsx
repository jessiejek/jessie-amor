import React, { useMemo, useState } from "react";
import {
  IonCard, IonCardHeader, IonCardSubtitle, IonCardContent,
  IonInput, IonTextarea, IonButton, IonIcon, IonCheckbox,
  IonSelect, IonSelectOption, IonSegment, IonSegmentButton, IonChip, IonLabel,
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
  currentUser?: { userId: string; email: string; isAdmin: boolean; } | null;
}

export default function NotesTab({ notes, setNotes, checklist, setChecklist, isOnline = true, canEdit = false, currentUser = null }: NotesTabProps) {
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
  const getOwnerId = (entry?: { createdBy?: string; savedByUserId?: string | null } | null) => entry?.createdBy ?? entry?.savedByUserId ?? null;
  const canManageEntry = (entry?: { createdBy?: string; savedByUserId?: string | null } | null) => {
    if (!currentUser) return false;
    const ownerId = getOwnerId(entry);
    return currentUser.isAdmin || ownerId === currentUser.userId;
  };

  const ownerNotes = useMemo(() => {
    if (ownerFilter === "mine" && currentUser) return notes.filter((n) => n.createdBy === currentUser.userId || n.savedByUserId === currentUser.userId);
    return notes;
  }, [notes, ownerFilter, currentUser]);
  const ownerChecklist = useMemo(() => {
    if (ownerFilter === "mine" && currentUser) return checklist.filter((c) => c.createdBy === currentUser.userId || c.savedByUserId === currentUser.userId);
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
    if (!canEdit || !noteTitle.trim() || !noteContent.trim()) return;
    const newNote: TravelNote = {
      id: "note-" + Date.now(), title: noteTitle, content: noteContent, category: noteCategory,
      createdAt: new Date().toISOString(), createdBy: currentUser?.userId, savedByUserId: currentUser?.userId, savedByEmail: currentUser?.email, syncStatus: "pending",
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteTitle(""); setNoteContent("");
  };

  const handleDeleteNote = (id: string) => {
    if (!canEdit) return;
    const target = notes.find((note) => note.id === id);
    if (!canManageEntry(target)) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleCheck = (id: string) => {
    if (!canEdit) return;
    setChecklist(checklist.map((item) => {
      if (item.id === id && canManageEntry(item)) return { ...item, completed: !item.completed, createdBy: item.createdBy ?? item.savedByUserId, savedByUserId: item.savedByUserId ?? item.createdBy, savedByEmail: item.savedByEmail ?? undefined, syncStatus: "pending" };
      return item;
    }));
  };

  const handleDeleteCheckItem = (id: string) => {
    if (!canEdit) return;
    const target = checklist.find((item) => item.id === id);
    if (!canManageEntry(target)) return;
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !newCheckItem.trim()) return;
    setChecklist([...checklist, { id: "check-" + Date.now(), text: newCheckItem, completed: false, createdBy: currentUser?.userId, savedByUserId: currentUser?.userId, savedByEmail: currentUser?.email, syncStatus: "pending" }]);
    setNewCheckItem("");
  };

  const getCatBadgeStyles = (cat: string) => {
    switch (cat) { case "Rule": return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" }; case "Requirement": return { bg: "#ffe4e6", text: "#9f1239", border: "#fecdd3" }; default: return { bg: "#e0f2fe", text: "#075985", border: "#bae6fd" }; }
  };

  return (
    <div className="ja-notes-page">
      {!isOnline && <div className="ja-notes-offline-card">Offline mode is active. Checklist and notes changes stay on this device and upload when the connection returns.</div>}

      {currentUser && (
        <div className="ja-notes-filter-row">
          <span className="ja-notes-filter-label">Show</span>
          <IonSegment value={ownerFilter} onIonChange={(event) => setOwnerFilter(event.detail.value as "all" | "mine")} className="ja-notes-segment">
            <IonSegmentButton value="all" className="ja-notes-segment-btn"><IonLabel>All</IonLabel></IonSegmentButton>
            <IonSegmentButton value="mine" className="ja-notes-segment-btn"><IonLabel>Mine</IonLabel></IonSegmentButton>
          </IonSegment>
        </div>
      )}

      <div className="ja-notes-layout">
        <IonCard className="ja-notes-checklist-card">
          <IonCardHeader className="ja-notes-card-header">
            <div className="ja-notes-section-title-row"><IonIcon icon={clipboardOutline} className="ja-notes-section-icon" /><IonCardSubtitle className="ja-notes-section-title">Trip Checklist</IonCardSubtitle></div>
          </IonCardHeader>
          <IonCardContent className="ja-notes-card-body">
            {!canEdit && <div className="ja-notes-readonly-card">Sign in to add, edit, or mark checklist items.</div>}
            <form onSubmit={handleAddCheckItem} className="ja-notes-check-form">
              <IonInput value={newCheckItem} onIonInput={(e) => setNewCheckItem(e.detail.value ?? "")} placeholder="Add new checklist task..." disabled={!canEdit} className="ja-notes-input" maxlength={80} />
              <IonButton type="submit" disabled={!canEdit} className="ja-notes-add-btn" size="small">Add</IonButton>
            </form>
            <div className="ja-notes-checklist-list">
              {ownerChecklist.map((item) => (
                <div key={item.id} className={`ja-notes-check-row${canEdit && canManageEntry(item) ? "" : " ja-notes-check-row-readonly"}`}>
                  {canManageEntry(item) ? (
                    <IonCheckbox checked={item.completed} onIonChange={() => handleToggleCheck(item.id)} className="ja-notes-checkbox" aria-label={item.completed ? "Mark incomplete" : "Mark complete"} />
                  ) : <div className="ja-notes-check-dummy" aria-hidden="true" />}
                  <div className="ja-notes-check-content">
                    <span className={`ja-notes-check-text${item.completed ? " ja-notes-check-text-done" : ""}`}>{item.text}</span>
                    {(item.savedByEmail || item.savedByUserId) && (
                      <div className="ja-notes-check-meta">
                        <span className="ja-notes-check-user">{formatSavedBy(item.savedByEmail, item.savedByUserId)}</span>
                        <span className="ja-notes-check-dot" style={{ backgroundColor: getSyncDotColor(item.syncStatus) }} title={getSyncDotLabel(item.syncStatus)} aria-label={getSyncDotLabel(item.syncStatus)} />
                      </div>
                    )}
                  </div>
                  {canManageEntry(item) && (
                    <IonButton fill="clear" size="small" onClick={() => handleDeleteCheckItem(item.id)} className="ja-notes-delete-btn" aria-label="Delete checklist item" title="Delete checklist item">
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  )}
                </div>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        <div className="ja-notes-notes-col">
          <IonCard className="ja-notes-create-card">
            <IonCardHeader className="ja-notes-card-header">
              <div className="ja-notes-section-title-row"><IonIcon icon={createOutline} className="ja-notes-section-icon" /><IonCardSubtitle className="ja-notes-section-title">Add Travel Scratch Note</IonCardSubtitle></div>
            </IonCardHeader>
            <IonCardContent className="ja-notes-card-body">
              <form onSubmit={handleAddNote} className="ja-notes-form">
                <div className="ja-notes-form-grid">
                  <IonInput value={noteTitle} onIonInput={(e) => setNoteTitle(e.detail.value ?? "")} placeholder="Note Title (e.g., Souvenir Ideas)" disabled={!canEdit} className="ja-notes-input ja-notes-input-wide" required />
                  <IonSelect value={noteCategory} onIonChange={(e) => setNoteCategory(e.detail.value as "Rule" | "Requirement" | "General")} disabled={!canEdit} interface="action-sheet" className="ja-notes-select">
                    <IonSelectOption value="General">General Info</IonSelectOption>
                    <IonSelectOption value="Rule">Strict Rule</IonSelectOption>
                    <IonSelectOption value="Requirement">Requirement</IonSelectOption>
                  </IonSelect>
                </div>
                <IonTextarea value={noteContent} onIonInput={(e) => setNoteContent(e.detail.value ?? "")} placeholder="Write down sights to seek, shops to visit, or custom budgets ideas..." rows={3} disabled={!canEdit} className="ja-notes-textarea" required />
                <div className="ja-notes-form-submit">
                  <IonButton type="submit" disabled={!canEdit} className="ja-notes-add-btn"><IonIcon icon={addOutline} slot="start" />Add Scratch Note</IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>

          <div className="ja-notes-grid">
            {ownerNotes.map((note) => {
              const cs = getCatBadgeStyles(note.category);
              return (
                <IonCard key={note.id} className="ja-notes-note-card">
                  <IonCardContent className="ion-no-padding">
                    <div className="ja-notes-note-inner">
                      <div>
                        <div className="ja-notes-note-top">
                          <IonChip className="ja-notes-cat-chip" style={{ background: cs.bg, color: cs.text, border: `1px solid ${cs.border}` }}>{note.category}</IonChip>
                          {canManageEntry(note) && (
                            <IonButton fill="clear" size="small" onClick={() => handleDeleteNote(note.id)} className="ja-notes-delete-btn ja-notes-delete-abs" title="Delete Note"><IonIcon icon={trashOutline} /></IonButton>
                          )}
                        </div>
                        <h4 className="ja-notes-note-title">{note.title}</h4>
                        <p className="ja-notes-note-body">{note.content}</p>
                      </div>
                      <div className="ja-notes-note-footer">
                        <span>CREATED: {new Date(note.createdAt).toLocaleDateString()}</span>
                        {(note.savedByEmail || note.savedByUserId) && <span className="ja-notes-note-author">{formatSavedBy(note.savedByEmail, note.savedByUserId)}</span>}
                        <span className="ja-notes-sync-dot" style={{ backgroundColor: getSyncDotColor(note.syncStatus) }} title={getSyncDotLabel(note.syncStatus)} aria-label={getSyncDotLabel(note.syncStatus)} />
                        <IonIcon icon={bookmarkOutline} className="ja-notes-note-bookmark" />
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
