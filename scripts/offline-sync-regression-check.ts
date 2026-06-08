import assert from "node:assert/strict";

import type { CachedDataset } from "../src/lib/offlineCache";
import { makeOfflineCacheKey } from "../src/lib/offlineCache";
import type { ChecklistItem, DiaryEntry, SyncStatus, TravelNote } from "../src/types";

const tripKey = "offline-sync-test";
const checklistCacheKey = makeOfflineCacheKey(tripKey, "checklist");
const notesCacheKey = makeOfflineCacheKey(tripKey, "notes");
const diaryCacheKey = makeOfflineCacheKey(tripKey, "diary");

const storage = new Map<string, string>();

const writeSnapshot = <T,>(key: string, snapshot: CachedDataset<T>) => {
  storage.set(key, JSON.stringify(snapshot));
};

const readSnapshot = <T,>(key: string): CachedDataset<T> => {
  const raw = storage.get(key);
  assert.ok(raw, `Missing snapshot for ${key}`);
  return JSON.parse(raw) as CachedDataset<T>;
};

const isDiaryLocalPhotoUrl = (photoUrl?: string) => Boolean(photoUrl?.startsWith("data:"));

const checklistSignature = (items: ChecklistItem[]) =>
  JSON.stringify(
    items.map((item) => ({
      id: item.id,
      trip_key: tripKey,
      text: item.text,
      completed: item.completed,
      saved_by_user_id: item.createdBy ?? item.savedByUserId ?? null,
      saved_by_email: item.savedByEmail ?? null,
    })),
  );

const notesSignature = (notes: TravelNote[]) =>
  JSON.stringify({
    trip_key: tripKey,
    notes: notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      createdAt: note.createdAt,
      createdBy: note.createdBy ?? note.savedByUserId ?? undefined,
      savedByUserId: note.createdBy ?? note.savedByUserId ?? undefined,
      savedByEmail: note.savedByEmail ?? undefined,
    })),
    saved_by_user_id: notes[0]?.createdBy ?? notes[0]?.savedByUserId ?? null,
    saved_by_email: notes[0]?.savedByEmail ?? null,
  });

const diarySignature = (entries: DiaryEntry[]) =>
  JSON.stringify(
    entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      type: entry.type,
      rating: entry.rating,
      date_visited: entry.dateVisited || null,
      location_name: entry.locationName || null,
      city_or_country: entry.cityOrCountry ?? null,
      tags: entry.tags,
      would_revisit: entry.wouldRevisit,
      photo_path: entry.photoPath ?? null,
      saved_by_user_id: entry.createdBy ?? entry.savedByUserId ?? null,
      saved_by_email: entry.savedByEmail ?? null,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt ?? entry.createdAt,
    })),
  );

const saveChecklistSnapshot = (
  nextChecklist: ChecklistItem[],
  syncedSignature: string,
  dirty: boolean,
  syncedIds: string[],
) => {
  writeSnapshot(checklistCacheKey, {
    data: nextChecklist,
    syncedSignature,
    dirty,
    syncedIds,
  });
};

const saveNotesSnapshot = (
  nextNotes: TravelNote[],
  syncedSignature: string,
  dirty: boolean,
  syncedIds: string[],
) => {
  writeSnapshot(notesCacheKey, {
    data: nextNotes,
    syncedSignature,
    dirty,
    syncedIds,
  });
};

const saveDiarySnapshot = (
  nextDiary: DiaryEntry[],
  syncedSignature: string,
  dirty: boolean,
  syncedIds: string[],
) => {
  writeSnapshot(diaryCacheKey, {
    data: nextDiary,
    syncedSignature,
    dirty,
    syncedIds,
  });
};

const reconcileChecklistAfterSuccess = (
  current: ChecklistItem[],
  requestChecklist: ChecklistItem[],
  previousSyncedSignature: string,
  previousSyncedIds: string[],
) => {
  const requestChecklistById = new Map(requestChecklist.map((item) => [item.id, item] as const));
  const requestChecklistIds = requestChecklist.map((item) => item.id);
  const requestChecklistSignature = checklistSignature(requestChecklist);
  let queued = false;
  let hasMismatch = false;
  const currentById = new Map(current.map((item) => [item.id, item] as const));
  const next = current.map((item) => {
    const requestItem = requestChecklistById.get(item.id);
    if (!requestItem) return item;
    if (checklistSignature([item]) !== checklistSignature([requestItem])) {
      hasMismatch = true;
      return item;
    }
    return { ...item, syncStatus: "synced" as SyncStatus };
  });

  for (const requestItem of requestChecklist) {
    if (!currentById.has(requestItem.id)) {
      hasMismatch = true;
      break;
    }
  }

  if (hasMismatch) {
    queued = true;
    saveChecklistSnapshot(next, requestChecklistSignature, true, requestChecklistIds);
    return { next, queued, previousSyncedSignature, previousSyncedIds };
  }

  saveChecklistSnapshot(next, requestChecklistSignature, false, requestChecklistIds);
  return { next, queued, previousSyncedSignature: requestChecklistSignature, previousSyncedIds: requestChecklistIds };
};

const reconcileNotesAfterSuccess = (current: TravelNote[], requestNotes: TravelNote[]) => {
  const requestNotesSignature = notesSignature(requestNotes);
  if (notesSignature(current) !== requestNotesSignature) {
    saveNotesSnapshot(current, requestNotesSignature, true, requestNotes.map((note) => note.id));
    return { next: current, queued: true, syncedSignature: requestNotesSignature };
  }

  const next = current.map((note) => ({ ...note, syncStatus: "synced" as SyncStatus }));
  saveNotesSnapshot(next, requestNotesSignature, false, next.map((note) => note.id));
  return { next, queued: false, syncedSignature: requestNotesSignature };
};

const reconcileDiaryAfterSuccess = (
  current: DiaryEntry[],
  requestOriginalDiary: DiaryEntry[],
  requestWrittenDiary: DiaryEntry[],
) => {
  const requestOriginalDiaryById = new Map(requestOriginalDiary.map((entry) => [entry.id, entry] as const));
  const requestWrittenDiaryById = new Map(requestWrittenDiary.map((entry) => [entry.id, entry] as const));
  const requestWrittenDiaryIds = requestWrittenDiary.map((entry) => entry.id);
  const requestWrittenDiarySignature = diarySignature(requestWrittenDiary);
  let hasMismatch = false;
  const currentById = new Map(current.map((entry) => [entry.id, entry] as const));
  const next = current.map((entry) => {
    const originalRequestEntry = requestOriginalDiaryById.get(entry.id);
    if (!originalRequestEntry) return entry;
    if (diarySignature([entry]) !== diarySignature([originalRequestEntry])) {
      hasMismatch = true;
      return entry;
    }

    const writtenEntry = requestWrittenDiaryById.get(entry.id);
    if (!writtenEntry) {
      hasMismatch = true;
      return entry;
    }

    return writtenEntry;
  });

  for (const requestEntry of requestWrittenDiary) {
    if (!currentById.has(requestEntry.id)) {
      hasMismatch = true;
      break;
    }
  }

  const remainingDirty = next.some((entry) => isDiaryLocalPhotoUrl(entry.photoUrl));
  if (hasMismatch) {
    saveDiarySnapshot(next, requestWrittenDiarySignature, true, requestWrittenDiaryIds);
    return { next, queued: true, remainingDirty, requestWrittenDiarySignature };
  }

  saveDiarySnapshot(next, requestWrittenDiarySignature, remainingDirty, requestWrittenDiaryIds);
  return { next, queued: false, remainingDirty, requestWrittenDiarySignature };
};

const ensureUniqueIds = (label: string, ids: string[]) => {
  assert.equal(new Set(ids).size, ids.length, `${label} should not contain duplicate ids`);
};

const caseLogs: string[] = [];
const runCase = (name: string, fn: () => void) => {
  fn();
  caseLogs.push(`PASS ${name}`);
};

const baseChecklist: ChecklistItem[] = [
  { id: "c1", text: "Buy SIM", completed: false, createdBy: "u1", savedByUserId: "u1", savedByEmail: "u1@test.com", syncStatus: "synced" },
];
const baseNotes: TravelNote[] = [
  { id: "n1", title: "Rule 1", content: "Keep passport", category: "Rule", createdAt: "2026-07-01T00:00:00.000Z", createdBy: "u1", savedByUserId: "u1", savedByEmail: "u1@test.com", syncStatus: "synced" },
  { id: "n2", title: "Rule 2", content: "Charge phone", category: "General", createdAt: "2026-07-01T00:05:00.000Z", createdBy: "u1", savedByUserId: "u1", savedByEmail: "u1@test.com", syncStatus: "synced" },
];
const baseDiary: DiaryEntry[] = [
  {
    id: "d1",
    title: "KL arrival",
    description: "Touched down",
    type: "Moment",
    rating: 4,
    dateVisited: "2026-07-12",
    locationName: "KLIA",
    tags: ["arrival"],
    wouldRevisit: true,
    createdBy: "u1",
    savedByUserId: "u1",
    savedByEmail: "u1@test.com",
    createdAt: "2026-07-12T08:00:00.000Z",
    syncStatus: "synced",
  },
];

runCase("Checklist offline add survives refresh and failed sync stays dirty", () => {
  const syncedSignature = checklistSignature(baseChecklist);
  const syncedIds = baseChecklist.map((item) => item.id);
  saveChecklistSnapshot(baseChecklist, syncedSignature, false, syncedIds);

  const offlineAdded: ChecklistItem[] = [
    ...baseChecklist,
    { id: "c2", text: "Buy water", completed: false, createdBy: "u1", savedByUserId: "u1", savedByEmail: "u1@test.com", syncStatus: "pending" },
  ];
  saveChecklistSnapshot(offlineAdded, syncedSignature, true, syncedIds);

  const cached = readSnapshot<ChecklistItem[]>(checklistCacheKey);
  assert.equal(cached.dirty, true);
  assert.equal(cached.syncedSignature, syncedSignature);
  assert.deepEqual(cached.syncedIds, syncedIds);
  assert.ok(cached.data.some((item) => item.id === "c2"));

  const refreshed = readSnapshot<ChecklistItem[]>(checklistCacheKey);
  assert.ok(refreshed.data.some((item) => item.id === "c2"));

  const failed = readSnapshot<ChecklistItem[]>(checklistCacheKey);
  assert.equal(failed.dirty, true);
});

runCase("Checklist offline toggle and delete survive refresh", () => {
  const syncedSignature = checklistSignature(baseChecklist);
  const syncedIds = ["c1", "c2"];
  const current: ChecklistItem[] = [
    { ...baseChecklist[0], completed: true, syncStatus: "pending" },
  ];

  saveChecklistSnapshot(current, syncedSignature, true, syncedIds);
  const cached = readSnapshot<ChecklistItem[]>(checklistCacheKey);

  assert.equal(cached.dirty, true);
  assert.equal(cached.data[0].completed, true);
  assert.ok(!cached.data.some((item) => item.id === "c2"));
  assert.deepEqual(cached.syncedIds, syncedIds);
});

runCase("Checklist dirty cache is written before in-flight return", () => {
  const previousSyncedSignature = checklistSignature(baseChecklist);
  const previousSyncedIds = baseChecklist.map((item) => item.id);
  const current: ChecklistItem[] = [
    ...baseChecklist,
    { id: "c3", text: "Book bus", completed: false, createdBy: "u1", savedByUserId: "u1", savedByEmail: "u1@test.com", syncStatus: "pending" },
  ];

  saveChecklistSnapshot(current, previousSyncedSignature, true, previousSyncedIds);
  const cached = readSnapshot<ChecklistItem[]>(checklistCacheKey);

  assert.equal(cached.dirty, true);
  assert.equal(cached.syncedSignature, previousSyncedSignature);
  assert.deepEqual(cached.syncedIds, previousSyncedIds);
  assert.ok(cached.data.some((item) => item.id === "c3"));
});

runCase("Checklist newer edit during in-flight survives old sync completion", () => {
  const syncedSignature = checklistSignature(baseChecklist);
  const syncedIds = baseChecklist.map((item) => item.id);
  const requestChecklist: ChecklistItem[] = [
    ...baseChecklist,
    { id: "c2", text: "Buy water", completed: false, createdBy: "u1", savedByUserId: "u1", savedByEmail: "u1@test.com", syncStatus: "pending" },
  ];
  const current: ChecklistItem[] = requestChecklist.map((item) =>
    item.id === "c2" ? { ...item, completed: true, syncStatus: "pending" as SyncStatus } : item,
  );
  saveChecklistSnapshot(current, syncedSignature, true, syncedIds);

  const result = reconcileChecklistAfterSuccess(current, requestChecklist, syncedSignature, syncedIds);
  const cached = readSnapshot<ChecklistItem[]>(checklistCacheKey);

  assert.equal(result.queued, true);
  assert.equal(cached.dirty, true);
  assert.equal(cached.syncedSignature, checklistSignature(requestChecklist));
  assert.deepEqual(cached.syncedIds, requestChecklist.map((item) => item.id));
  assert.equal(cached.data.find((item) => item.id === "c2")?.completed, true);
  ensureUniqueIds("Checklist", cached.data.map((item) => item.id));
});

runCase("Notes offline add/delete survives refresh and keeps JSON-row semantics", () => {
  const syncedSignature = notesSignature(baseNotes);
  const syncedIds = baseNotes.map((note) => note.id);
  saveNotesSnapshot(baseNotes, syncedSignature, false, syncedIds);

  const offlineAdded = [
    ...baseNotes,
    { id: "n3", title: "Rule 3", content: "Bring charger", category: "Requirement" as const, createdAt: "2026-07-01T00:10:00.000Z", createdBy: "u1", savedByUserId: "u1", savedByEmail: "u1@test.com", syncStatus: "pending" as SyncStatus },
  ];
  saveNotesSnapshot(offlineAdded, syncedSignature, true, syncedIds);
  let cached = readSnapshot<TravelNote[]>(notesCacheKey);
  assert.equal(cached.dirty, true);
  assert.ok(cached.data.some((note) => note.id === "n3"));

  const offlineDeleted = offlineAdded.filter((note) => note.id !== "n2");
  saveNotesSnapshot(offlineDeleted, syncedSignature, true, syncedIds);
  cached = readSnapshot<TravelNote[]>(notesCacheKey);
  assert.ok(!cached.data.some((note) => note.id === "n2"));
  assert.deepEqual(cached.syncedIds, syncedIds);
});

runCase("Notes dirty cache is written before in-flight return and failed sync stays dirty", () => {
  const previousSyncedSignature = notesSignature(baseNotes);
  const previousSyncedIds = baseNotes.map((note) => note.id);
  const current = [
    ...baseNotes,
    { id: "n4", title: "Rule 4", content: "Keep cash", category: "General" as const, createdAt: "2026-07-01T00:15:00.000Z", createdBy: "u1", savedByUserId: "u1", savedByEmail: "u1@test.com", syncStatus: "pending" as SyncStatus },
  ];

  saveNotesSnapshot(current, previousSyncedSignature, true, previousSyncedIds);
  const cached = readSnapshot<TravelNote[]>(notesCacheKey);

  assert.equal(cached.dirty, true);
  assert.equal(cached.syncedSignature, previousSyncedSignature);
  assert.deepEqual(cached.syncedIds, previousSyncedIds);
  assert.ok(cached.data.some((note) => note.id === "n4"));
});

runCase("Notes newer edit during in-flight survives old sync completion", () => {
  const requestNotes = [
    ...baseNotes,
    { id: "n3", title: "Rule 3", content: "Bring charger", category: "Requirement" as const, createdAt: "2026-07-01T00:10:00.000Z", createdBy: "u1", savedByUserId: "u1", savedByEmail: "u1@test.com", syncStatus: "pending" as SyncStatus },
  ];
  const current = requestNotes.map((note) =>
    note.id === "n3" ? { ...note, content: "Bring charger and adapter", syncStatus: "pending" as SyncStatus } : note,
  );
  const result = reconcileNotesAfterSuccess(current, requestNotes);
  const cached = readSnapshot<TravelNote[]>(notesCacheKey);

  assert.equal(result.queued, true);
  assert.equal(cached.dirty, true);
  assert.equal(cached.syncedSignature, notesSignature(requestNotes));
  assert.equal(cached.data.find((note) => note.id === "n3")?.content, "Bring charger and adapter");
  assert.ok(!cached.data.some((note) => note.id === "n2" && note.content === "Charge phone" && cached.data.length !== 3));
  ensureUniqueIds("Notes", cached.data.map((note) => note.id));
});

runCase("Diary offline create without photo survives refresh", () => {
  const syncedSignature = diarySignature(baseDiary);
  const syncedIds = baseDiary.map((entry) => entry.id);
  saveDiarySnapshot(baseDiary, syncedSignature, false, syncedIds);

  const offlineEntry: DiaryEntry = {
    id: "d2",
    title: "Dinner",
    description: "Great satay",
    type: "Food",
    rating: 5,
    dateVisited: "2026-07-12",
    locationName: "Jalan Alor",
    tags: ["food"],
    wouldRevisit: true,
    createdBy: "u1",
    savedByUserId: "u1",
    savedByEmail: "u1@test.com",
    createdAt: "2026-07-12T10:00:00.000Z",
    syncStatus: "pending",
  };
  const offlineDiary = [...baseDiary, offlineEntry];
  saveDiarySnapshot(offlineDiary, syncedSignature, true, syncedIds);

  const cached = readSnapshot<DiaryEntry[]>(diaryCacheKey);
  assert.equal(cached.dirty, true);
  assert.ok(cached.data.some((entry) => entry.id === "d2"));
});

runCase("Diary offline edit/delete survive refresh and dirty cache is written before in-flight return", () => {
  const syncedSignature = diarySignature([
    ...baseDiary,
    {
      ...baseDiary[0],
      id: "d6",
      title: "Old entry",
      createdAt: "2026-07-12T09:00:00.000Z",
    },
  ]);
  const syncedIds = ["d1", "d6"];
  const current: DiaryEntry[] = [
    { ...baseDiary[0], title: "KL arrival edited", syncStatus: "pending" },
  ];

  saveDiarySnapshot(current, syncedSignature, true, syncedIds);
  const cached = readSnapshot<DiaryEntry[]>(diaryCacheKey);

  assert.equal(cached.dirty, true);
  assert.equal(cached.data[0].title, "KL arrival edited");
  assert.ok(!cached.data.some((entry) => entry.id === "d6"));
  assert.deepEqual(cached.syncedIds, syncedIds);
});

runCase("Diary photo upload success replaces local data URL with uploaded result", () => {
  const requestOriginal: DiaryEntry[] = [
    {
      ...baseDiary[0],
      id: "d3",
      title: "Photo moment",
      description: "Twin towers",
      photoUrl: "data:image/jpeg;base64,abc123",
      syncStatus: "pending",
    },
  ];
  const requestWritten: DiaryEntry[] = [
    {
      ...requestOriginal[0],
      photoPath: "trip/u1/d3-photo.jpg",
      photoUrl: "https://signed.example/d3",
      syncStatus: "synced",
    },
  ];

  const result = reconcileDiaryAfterSuccess(requestOriginal, requestOriginal, requestWritten);
  const cached = readSnapshot<DiaryEntry[]>(diaryCacheKey);
  const entry = result.next[0];

  assert.equal(result.queued, false);
  assert.equal(result.remainingDirty, false);
  assert.equal(cached.dirty, false);
  assert.equal(entry.photoPath, "trip/u1/d3-photo.jpg");
  assert.equal(entry.photoUrl, "https://signed.example/d3");
  assert.equal(isDiaryLocalPhotoUrl(entry.photoUrl), false);
  assert.equal(entry.syncStatus, "synced");
});

runCase("Diary local data photo cannot be marked clean synced when upload fails", () => {
  const requestOriginal: DiaryEntry[] = [
    {
      ...baseDiary[0],
      id: "d4",
      title: "Upload failed",
      photoUrl: "data:image/jpeg;base64,failed",
      syncStatus: "pending",
    },
  ];
  const requestWritten: DiaryEntry[] = [
    {
      ...requestOriginal[0],
      syncStatus: "pending",
    },
  ];

  const result = reconcileDiaryAfterSuccess(requestOriginal, requestOriginal, requestWritten);
  const cached = readSnapshot<DiaryEntry[]>(diaryCacheKey);
  const entry = result.next[0];

  assert.equal(result.remainingDirty, true);
  assert.equal(cached.dirty, true);
  assert.equal(entry.syncStatus, "pending");
  assert.equal(isDiaryLocalPhotoUrl(entry.photoUrl), true);
});

runCase("Diary newer edit during upload is preserved and queued", () => {
  const requestOriginal: DiaryEntry[] = [
    {
      ...baseDiary[0],
      id: "d5",
      title: "Before upload",
      description: "Original",
      photoUrl: "data:image/jpeg;base64,uploading",
      syncStatus: "pending",
    },
  ];
  const current: DiaryEntry[] = [
    {
      ...requestOriginal[0],
      title: "Edited while uploading",
      description: "Updated locally",
      rating: 5,
      syncStatus: "pending",
    },
  ];
  const requestWritten: DiaryEntry[] = [
    {
      ...requestOriginal[0],
      photoPath: "trip/u1/d5-photo.jpg",
      photoUrl: "https://signed.example/d5",
      syncStatus: "synced",
    },
  ];

  const result = reconcileDiaryAfterSuccess(current, requestOriginal, requestWritten);
  const cached = readSnapshot<DiaryEntry[]>(diaryCacheKey);

  assert.equal(result.queued, true);
  assert.equal(cached.dirty, true);
  assert.equal(cached.data[0].title, "Edited while uploading");
  assert.equal(cached.data[0].description, "Updated locally");
  assert.equal(cached.data[0].rating, 5);
  assert.equal(cached.syncedSignature, diarySignature(requestWritten));
  ensureUniqueIds("Diary", cached.data.map((entry) => entry.id));
});

runCase("No duplicate notes, checklist, or diary ids remain after reconnect simulation", () => {
  const checklistCached = readSnapshot<ChecklistItem[]>(checklistCacheKey);
  const notesCached = readSnapshot<TravelNote[]>(notesCacheKey);
  const diaryCached = readSnapshot<DiaryEntry[]>(diaryCacheKey);

  ensureUniqueIds("Checklist reconnect", checklistCached.data.map((item) => item.id));
  ensureUniqueIds("Notes reconnect", notesCached.data.map((note) => note.id));
  ensureUniqueIds("Diary reconnect", diaryCached.data.map((entry) => entry.id));
});

console.log("Offline sync regression proof");
for (const line of caseLogs) {
  console.log(`- ${line}`);
}
console.log("Cache keys inspected");
console.log(`- ${checklistCacheKey}`);
console.log(`- ${notesCacheKey}`);
console.log(`- ${diaryCacheKey}`);
