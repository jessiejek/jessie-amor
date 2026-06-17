import React, { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Compass,
  Map as MapIcon,
  Menu,
  NotebookText,
  Printer,
  Share2,
  Ticket,
  Utensils,
  Wallet,
  LogOut,
} from "lucide-react";
//trigger
import {
  IonApp,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonLabel,
  IonPage,
  IonRow,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, useHistory, useLocation } from "react-router-dom";
import {
  calendarOutline,
  walletOutline,
  mapOutline,
  bookOutline,
  menuOutline,
} from "ionicons/icons";
import { installKeyboardClass } from "./utils/keyboardClass";
import type { Session } from "@supabase/supabase-js";
import {
  buildGuideForItem,
  selectedItinerary,
  type DestinationGuide,
  type TipCardData,
  type TimelineItemData,
} from "./data/code1Itinerary";
import type { MapItineraryData } from "./data/mapItinerary";
import { Expense, TravelNote, ChecklistItem, DiaryEntry, type SyncStatus, type CurrentUserInfo, type UserTripSettings, settingsToRow, rowToSettings, type UserTripSettingsRow } from "./types";
import {
  hasSupabaseConfig,
  supabase,
  supabaseExpenseTable,
  supabaseChecklistTable,
  supabaseNotesTable,
  supabaseDiaryTable,
  supabaseDiaryBucket,
  supabaseBudgetSettingsTable,
  supabaseSettingsTable,
  tripKey,
} from "./lib/supabase";
import { makeOfflineCacheKey, readCachedDataset, useCachedDataset, useOnlineStatus, writeCachedDataset } from "./lib/offlineCache";

import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import BudgetSummaryHeader from "./components/BudgetSummaryHeader";
import DailyItineraryView from "./components/DailyItineraryView";
import BudgetTab from "./components/BudgetTab";
import MapTab from "./components/MapTab";
import NotesTab from "./components/NotesTab";
import DiaryTab from "./components/DiaryTab";
import Legend from "./components/Legend";
import AlertBox from "./components/AlertBox";
import TipCard from "./components/TipCard";
import DestinationInfoModal from "./components/DestinationInfoModal";
import AuthPanel from "./components/AuthPanel";
import { useLiveExchangeRates } from "./lib/exchangeRates";
import SettingsModal from "./components/SettingsModal";

type SupabaseExpenseRow = {
  id: string;
  trip_key: string;
  day: number;
  category: Expense["category"];
  item: string;
  amount: number;
  paid_with: Expense["paidWith"];
  original_amount: number | null;
  original_currency: Expense["originalCurrency"] | null;
  saved_by_user_id: string | null;
  saved_by_email: string | null;
  created_at: string | null;
  updated_at: string;
};

type SupabaseChecklistRow = {
  id: string;
  trip_key: string;
  text: string;
  completed: boolean;
  saved_by_user_id: string | null;
  saved_by_email: string | null;
  updated_at: string;
};

type SupabaseNotesRow = {
  trip_key: string;
  notes: TravelNote[];
  saved_by_user_id: string | null;
  saved_by_email: string | null;
  updated_at: string;
};

type SupabaseDiaryRow = {
  id: string;
  trip_key: string;
  title: string;
  description: string;
  type: DiaryEntry["type"];
  rating: number;
  date_visited: string | null;
  location_name: string | null;
  city_or_country: string | null;
  tags: string[] | null;
  would_revisit: boolean;
  photo_path: string | null;
  saved_by_user_id: string | null;
  saved_by_email: string | null;
  created_at: string;
  updated_at: string;
};

const applySyncStatus = <T extends { syncStatus?: SyncStatus }>(items: T[], syncStatus: SyncStatus): T[] =>
  items.map((item) => ({
    ...item,
    syncStatus: item.syncStatus ?? syncStatus,
  }));

const forceSyncStatus = <T extends { syncStatus?: SyncStatus }>(items: T[], syncStatus: SyncStatus): T[] =>
  items.map((item) => ({
    ...item,
    syncStatus,
  }));

const stripNoteSyncStatus = (note: TravelNote) => {
  const { syncStatus: _syncStatus, ...rest } = note;
  return rest;
};

const expenseToRow = (expense: Expense): SupabaseExpenseRow => ({
  id: expense.id,
  trip_key: tripKey,
  day: expense.day,
  category: expense.category,
  item: expense.item,
  amount: expense.amount,
  paid_with: expense.paidWith,
  original_amount: expense.originalAmount ?? null,
  original_currency: expense.originalCurrency ?? null,
  saved_by_user_id: expense.createdBy ?? expense.savedByUserId ?? null,
  saved_by_email: expense.savedByEmail ?? null,
  created_at: expense.createdAt ?? new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const rowToExpense = (row: SupabaseExpenseRow): Expense => ({
  id: row.id,
  day: row.day,
  category: row.category,
  item: row.item,
  amount: Number(row.amount),
  paidWith: row.paid_with,
  originalAmount: row.original_amount ?? undefined,
  originalCurrency: row.original_currency ?? undefined,
  createdBy: row.saved_by_user_id ?? undefined,
  savedByUserId: row.saved_by_user_id ?? undefined,
  savedByEmail: row.saved_by_email ?? undefined,
  createdAt: row.created_at ?? row.updated_at,
});

const checklistToRow = (item: ChecklistItem): SupabaseChecklistRow => ({
  id: item.id,
  trip_key: tripKey,
  text: item.text,
  completed: item.completed,
  saved_by_user_id: item.createdBy ?? item.savedByUserId ?? null,
  saved_by_email: item.savedByEmail ?? null,
  updated_at: new Date().toISOString(),
});

  const rowToChecklist = (row: SupabaseChecklistRow): ChecklistItem => ({
    id: row.id,
    text: row.text,
    completed: Boolean(row.completed),
    createdBy: row.saved_by_user_id ?? undefined,
    savedByUserId: row.saved_by_user_id ?? undefined,
    savedByEmail: row.saved_by_email ?? undefined,
  });

  const mergeExpenseRow = (current: Expense[], row: SupabaseExpenseRow) => {
    const next = rowToExpense(row);
    const index = current.findIndex((expense) => expense.id === next.id);
    if (index === -1) return [...current, next];
    const copy = [...current];
    copy[index] = next;
    return copy;
  };

  const mergeChecklistRow = (current: ChecklistItem[], row: SupabaseChecklistRow) => {
    const next = rowToChecklist(row);
    const index = current.findIndex((item) => item.id === next.id);
    if (index === -1) return [...current, next];
    const copy = [...current];
    copy[index] = next;
    return copy;
  };

const mergeDiaryRow = (current: DiaryEntry[], row: DiaryEntry) => {
  const index = current.findIndex((entry) => entry.id === row.id);
  if (index === -1) return [...current, row];
  const copy = [...current];
  copy[index] = row;
  return copy;
};

const isDiaryEntryProtectedFromRealtime = (
  entry: DiaryEntry,
  syncedEntry?: DiaryEntry,
) => {
  if (entry.syncStatus === "pending" || isDiaryLocalPhotoUrl(entry.photoUrl)) {
    return true;
  }

  if (!syncedEntry) {
    return false;
  }

  return diarySignature([entry]) !== diarySignature([syncedEntry]);
};

const expenseCacheKey = makeOfflineCacheKey(tripKey, "expenses");
const checklistCacheKey = makeOfflineCacheKey(tripKey, "checklist");
const notesCacheKey = makeOfflineCacheKey(tripKey, "notes");
const mapCacheKey = makeOfflineCacheKey(tripKey, "map");

const expenseSignature = (expenses: Expense[]) =>
  JSON.stringify(expenses.map((expense) => {
    const { updated_at: _updatedAt, ...row } = expenseToRow(expense);
    return row;
  }));

const checklistSignature = (items: ChecklistItem[]) =>
  JSON.stringify(items.map((item) => {
    const { updated_at: _updatedAt, ...row } = checklistToRow(item);
    return row;
  }));

const notesPayload = (notes: TravelNote[]) => ({
  trip_key: tripKey,
  notes: notes.map((note) => {
    const rest = stripNoteSyncStatus(note);
    return {
      ...rest,
      createdBy: note.createdBy ?? note.savedByUserId ?? undefined,
      savedByUserId: note.createdBy ?? note.savedByUserId ?? undefined,
      savedByEmail: note.savedByEmail ?? undefined,
    };
  }),
  saved_by_user_id: notes[0]?.createdBy ?? notes[0]?.savedByUserId ?? null,
  saved_by_email: notes[0]?.savedByEmail ?? null,
});

const notesSignature = (notes: TravelNote[]) => JSON.stringify(notesPayload(notes));
const normalizeDiaryRating = (rating: number) => {
  const numericRating = Number.isFinite(rating) ? rating : 0;
  const clampedRating = Math.max(1, Math.min(5, numericRating));
  return Math.round(clampedRating * 10) / 10;
};

const diaryEntryToRow = (entry: DiaryEntry): Omit<SupabaseDiaryRow, "trip_key"> => ({
  id: entry.id,
  title: entry.title,
  description: entry.description,
  type: entry.type,
  rating: normalizeDiaryRating(entry.rating),
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
});

const rowToDiaryEntry = (row: SupabaseDiaryRow, photoUrl?: string): DiaryEntry => ({
  id: row.id,
  title: row.title,
  description: row.description,
  type: row.type,
  rating: normalizeDiaryRating(Number(row.rating)),
  dateVisited: row.date_visited ?? new Date().toISOString().slice(0, 10),
  locationName: row.location_name ?? "",
  cityOrCountry: row.city_or_country ?? undefined,
  tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag)) : [],
  wouldRevisit: Boolean(row.would_revisit),
  photoPath: row.photo_path ?? undefined,
  photoUrl,
  createdBy: row.saved_by_user_id ?? undefined,
  savedByUserId: row.saved_by_user_id ?? undefined,
  savedByEmail: row.saved_by_email ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const diarySignature = (entries: DiaryEntry[]) =>
  JSON.stringify(entries.map((entry) => {
    const { updated_at: _updatedAt, ...row } = diaryEntryToRow(entry);
    return row;
  }));

const getExpenseOwnerId = (expense: Expense) => expense.createdBy ?? expense.savedByUserId ?? null;
const getChecklistOwnerId = (item: ChecklistItem) => item.createdBy ?? item.savedByUserId ?? null;
const getDiaryOwnerId = (entry: DiaryEntry) => entry.createdBy ?? entry.savedByUserId ?? null;

const buildDiaryPhotoPath = (entryId: string, userId: string) => `${tripKey}/${userId}/${entryId}-photo.jpg`;
const isDiaryLocalPhotoUrl = (photoUrl?: string) => Boolean(photoUrl?.startsWith("data:"));

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash.toString(16);
};

const isPendingLocalSync = (status?: SyncStatus) => status !== "synced";

const mergeBootstrapItems = <T extends { id: string; syncStatus?: SyncStatus }>(
  localItems: T[],
  remoteItems: T[],
  syncedIds: string[] = [],
) => {
  const localById = new Map(localItems.map((item) => [item.id, item] as const));
  const deletedIds = new Set(syncedIds.filter((id) => !localById.has(id)));
  const merged: T[] = [];
  const seen = new Set<string>();

  for (const remoteItem of remoteItems) {
    if (deletedIds.has(remoteItem.id)) continue;

    const localItem = localById.get(remoteItem.id);
    if (localItem && isPendingLocalSync(localItem.syncStatus)) {
      merged.push(localItem);
      seen.add(localItem.id);
      continue;
    }

    if (localItem) {
      merged.push(remoteItem);
      seen.add(remoteItem.id);
      continue;
    }

    merged.push(remoteItem);
    seen.add(remoteItem.id);
  }

  for (const localItem of localItems) {
    if (seen.has(localItem.id)) continue;
    if (isPendingLocalSync(localItem.syncStatus)) {
      merged.push(localItem);
    }
  }

  const hasLocalPending = Boolean(deletedIds.size) || localItems.some((item) => isPendingLocalSync(item.syncStatus));

  return {
    merged,
    hasLocalPending,
    deletedIds: Array.from(deletedIds),
  };
};

const diaryCacheKey = makeOfflineCacheKey(tripKey, "diary");

const normalizeTipIcon = (icon: string) => {
  const normalized = icon.trim();
  const iconMap: Record<string, string> = {
    "ðŸ’³": "💳",
    "ðŸ—“ï¸": "🗓️",
    "ðŸ“±": "📱",
    "ðŸ¦€": "🦀",
  };

  return iconMap[normalized] ?? normalized;
};

function AppShell() {
  const itinerary = selectedItinerary;
  const [userSettings, setUserSettings] = useState<UserTripSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(!hasSupabaseConfig);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [isFirstSetup, setIsFirstSetup] = useState<boolean>(false);
  const settingsRouteHandledRef = useRef<boolean>(false);
  const requestedRateSymbols = React.useMemo(
    () => (userSettings?.currencies?.length
      ? Array.from(new Set(["MYR", ...userSettings.currencies.filter((code) => code !== "MYR")]))
      : ["MYR", "SGD"]),
    [userSettings],
  );
  const exchangeRates = useLiveExchangeRates(requestedRateSymbols);
  const routeFromPath = (pathname: string) => {
    if (pathname === "/budget") return "/budget";
    if (pathname === "/map") return "/map";
    if (pathname === "/notes") return "/notes";
    if (pathname === "/diary") return "/diary";
    if (pathname === "/account") return "/account";
    if (pathname === "/settings") return "/settings";
    return "/";
  };

  const history = useHistory();
  const location = useLocation();
  const activeRoute = routeFromPath(location.pathname);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(!supabase);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLiveSpends, setShowLiveSpends] = useState<boolean>(false);
  const [selectedHomeDay, setSelectedHomeDay] = useState<number>(selectedItinerary.days[0]?.day ?? 0);
  const [selectedGuide, setSelectedGuide] = useState<DestinationGuide | null>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isIosStandalonePwa, setIsIosStandalonePwa] = useState(false);
  const [screenSize, setScreenSize] = useState<"small" | "large">(window.innerWidth < 768 ? "small" : "large");
  const [budgetCapPhp, setBudgetCapPhp] = useState<number>(0);
  const [expensesLoaded, setExpensesLoaded] = useState<boolean>(!hasSupabaseConfig);
  const [checklistLoaded, setChecklistLoaded] = useState<boolean>(!hasSupabaseConfig);
  const [notesLoaded, setNotesLoaded] = useState<boolean>(!hasSupabaseConfig);
  const [diaryLoaded, setDiaryLoaded] = useState<boolean>(!hasSupabaseConfig);
  const isOnline = useOnlineStatus();
  const [initialExpenseCache] = useState(() => readCachedDataset<Expense[]>(expenseCacheKey));
  const [initialChecklistCache] = useState(() => readCachedDataset<ChecklistItem[]>(checklistCacheKey));
  const [initialNotesCache] = useState(() => readCachedDataset<TravelNote[]>(notesCacheKey));
  const [initialDiaryCache] = useState(() => readCachedDataset<DiaryEntry[]>(diaryCacheKey));
  const mapCache = useCachedDataset<MapItineraryData>(mapCacheKey);
  const initialExpenseItems = applySyncStatus<Expense>(initialExpenseCache?.data ?? [], initialExpenseCache?.dirty ? "pending" : "synced");
  const initialChecklistItems = applySyncStatus<ChecklistItem>(initialChecklistCache?.data ?? [], initialChecklistCache?.dirty ? "pending" : "synced");
  const initialNoteItems = applySyncStatus<TravelNote>(initialNotesCache?.data ?? [], initialNotesCache?.dirty ? "pending" : "synced");
  const initialDiaryItems = applySyncStatus<DiaryEntry>(initialDiaryCache?.data ?? [], initialDiaryCache?.dirty ? "pending" : "synced");
  const [expenses, setExpenses] = useState<Expense[]>(() => initialExpenseItems);
  const [notes, setNotes] = useState<TravelNote[]>(() => initialNoteItems);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => initialChecklistItems);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => initialDiaryItems);
  const expenseSignatureRef = useRef<string>(initialExpenseCache?.syncedSignature || expenseSignature(initialExpenseItems));
  const checklistSignatureRef = useRef<string>(initialChecklistCache?.syncedSignature || checklistSignature(initialChecklistItems));
  const notesSignatureRef = useRef<string>(initialNotesCache?.syncedSignature || notesSignature(initialNoteItems));
  const diarySignatureRef = useRef<string>(initialDiaryCache?.syncedSignature || diarySignature(initialDiaryItems));
  const contentRefs = useRef<Record<string, HTMLIonContentElement | null>>({});
  const expenseDirtyRef = useRef<boolean>(initialExpenseCache?.dirty ?? false);
  const checklistDirtyRef = useRef<boolean>(initialChecklistCache?.dirty ?? false);
  const notesDirtyRef = useRef<boolean>(initialNotesCache?.dirty ?? false);
  const diaryDirtyRef = useRef<boolean>(initialDiaryCache?.dirty ?? false);
  const expenseIdsRef = useRef<string[]>(initialExpenseCache?.syncedIds ?? initialExpenseItems.map((expense) => expense.id));
  const checklistIdsRef = useRef<string[]>(initialChecklistCache?.syncedIds ?? initialChecklistItems.map((item) => item.id));
  const notesIdsRef = useRef<string[]>(initialNotesCache?.syncedIds ?? initialNoteItems.map((note) => note.id));
  const diaryIdsRef = useRef<string[]>(initialDiaryCache?.syncedIds ?? initialDiaryItems.map((entry) => entry.id));
  const diarySyncedEntriesRef = useRef<Record<string, DiaryEntry>>(
    Object.fromEntries(initialDiaryItems.map((entry) => [entry.id, entry])),
  );
  const diaryPhotoRetryBlockRef = useRef<string>("");
  const expenseSyncInFlightRef = useRef<boolean>(false);
  const checklistSyncInFlightRef = useRef<boolean>(false);
  const notesSyncInFlightRef = useRef<boolean>(false);
  const diarySyncInFlightRef = useRef<boolean>(false);
  const expenseSyncQueuedRef = useRef<boolean>(false);
  const checklistSyncQueuedRef = useRef<boolean>(false);
  const notesSyncQueuedRef = useRef<boolean>(false);
  const diarySyncQueuedRef = useRef<boolean>(false);
  const [expenseSyncNonce, setExpenseSyncNonce] = useState(0);
  const [checklistSyncNonce, setChecklistSyncNonce] = useState(0);
  const [notesSyncNonce, setNotesSyncNonce] = useState(0);
  const [diarySyncNonce, setDiarySyncNonce] = useState(0);
  const expenseSnapshotOwnerRef = useRef<string>("");
  const checklistSnapshotOwnerRef = useRef<string>("");
  const diarySnapshotOwnerRef = useRef<string>("");

  const currentUser: CurrentUserInfo | null = session?.user
    ? {
        userId: session.user.id,
        email: session.user.email ?? "",
        isAdmin,
      }
    : null;
  const currentSavedBy = currentUser
    ? {
        userId: currentUser.userId,
        email: currentUser.email,
      }
    : null;
  const persistExpenseCache = (nextExpenses: Expense[], syncedSignature: string, dirty: boolean, syncedIds: string[] = nextExpenses.map((expense) => expense.id)) => {
    writeCachedDataset(expenseCacheKey, {
      data: nextExpenses,
      syncedSignature,
      dirty,
      syncedIds,
    });
  };

  const setExpenseSyncSnapshot = (syncedSignature: string, dirty: boolean, syncedIds: string[] = expenseIdsRef.current) => {
    expenseSignatureRef.current = syncedSignature;
    expenseDirtyRef.current = dirty;
    if (!dirty) {
      expenseIdsRef.current = syncedIds;
    }
  };

  const saveExpenseSnapshot = (
    nextExpenses: Expense[],
    syncedSignature: string,
    dirty: boolean,
    syncedIds: string[] = expenseIdsRef.current,
  ) => {
    setExpenseSyncSnapshot(syncedSignature, dirty, syncedIds);
    persistExpenseCache(nextExpenses, syncedSignature, dirty, syncedIds);
  };

  const saveChecklistSnapshot = (nextChecklist: ChecklistItem[], syncedSignature: string, dirty: boolean, syncedIds: string[] = checklistIdsRef.current) => {
    checklistSignatureRef.current = syncedSignature;
    checklistDirtyRef.current = dirty;
    if (!dirty) {
      checklistIdsRef.current = syncedIds;
    }
    writeCachedDataset(checklistCacheKey, {
      data: nextChecklist,
      syncedSignature,
      dirty,
      syncedIds,
    });
  };

  const saveNotesSnapshot = (nextNotes: TravelNote[], syncedSignature: string, dirty: boolean, syncedIds: string[] = notesIdsRef.current) => {
    notesSignatureRef.current = syncedSignature;
    notesDirtyRef.current = dirty;
    writeCachedDataset(notesCacheKey, {
      data: nextNotes,
      syncedSignature,
      dirty,
      syncedIds,
    });
    if (!dirty) {
      notesIdsRef.current = syncedIds;
    }
  };

  const saveDiarySnapshot = (nextDiary: DiaryEntry[], syncedSignature: string, dirty: boolean, syncedIds: string[] = diaryIdsRef.current) => {
    diarySignatureRef.current = syncedSignature;
    diaryDirtyRef.current = dirty;
    if (!dirty) {
      diaryIdsRef.current = syncedIds;
      diarySyncedEntriesRef.current = Object.fromEntries(nextDiary.map((entry) => [entry.id, entry]));
    }
    writeCachedDataset(diaryCacheKey, {
      data: nextDiary,
      syncedSignature,
      dirty,
      syncedIds,
    });
  };


  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        void supabase.realtime.setAuth(data.session?.access_token ?? "");
        setSession(data.session);
        setAuthReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthReady(true);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void supabase.realtime.setAuth(nextSession?.access_token ?? "");
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.warn("Supabase profile load failed:", error.message);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(Boolean(data?.is_admin));
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!supabase || !authReady) {
      setSettingsLoaded(true);
      return;
    }

    if (!session?.user) {
      setUserSettings(null);
      setSettingsLoaded(false);
      setIsFirstSetup(false);
      setShowSettingsModal(false);
      return;
    }

    if (!isOnline) {
      setSettingsLoaded(true);
      return;
    }

    let cancelled = false;

    const loadUserSettings = async () => {
      const { data, error } = await supabase
        .from(supabaseSettingsTable)
        .select("*")
        .eq("user_id", session.user.id)
        .eq("trip_key", tripKey)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.warn("Supabase user settings load failed:", error.message);
        setSettingsLoaded(true);
        return;
      }

      if (data) {
        setUserSettings(rowToSettings(data as UserTripSettingsRow));
        setIsFirstSetup(false);
        setShowSettingsModal(false);
      } else {
        setUserSettings(null);
        setIsFirstSetup(true);
        setShowSettingsModal(true);
      }

      setSettingsLoaded(true);
    };

    void loadUserSettings();

    return () => {
      cancelled = true;
    };
  }, [authReady, isOnline, session]);

  useEffect(() => {
    if (!supabase || !authReady) {
      setExpensesLoaded(true);
      setChecklistLoaded(true);
      setNotesLoaded(true);
      return;
    }

    if (!isOnline) {
      setExpensesLoaded(true);
      setChecklistLoaded(true);
      setNotesLoaded(true);
      return;
    }

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadSyncedData = async () => {
      const [expenseResult, checklistResult, notesResult] = await Promise.all([
        supabase
          .from(supabaseExpenseTable)
          .select("id, trip_key, day, category, item, amount, paid_with, original_amount, original_currency, saved_by_user_id, saved_by_email, created_at")
          .eq("trip_key", tripKey)
          .order("day", { ascending: true })
          .order("item", { ascending: true }),
        supabase
          .from(supabaseChecklistTable)
          .select("id, trip_key, text, completed, saved_by_user_id, saved_by_email")
          .eq("trip_key", tripKey)
          .order("id", { ascending: true }),
        supabase
          .from(supabaseNotesTable)
          .select("trip_key, notes, saved_by_user_id, saved_by_email")
          .eq("trip_key", tripKey)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const { data: expenseData, error: expenseError } = expenseResult;
      const { data: checklistData, error: checklistError } = checklistResult;
      const { data: notesData, error: notesError } = notesResult;

      if (expenseError) {
        console.warn("Supabase expense load failed:", expenseError.message);
      } else {
        const remoteExpenses = (expenseData ?? []).map((row) => rowToExpense(row as SupabaseExpenseRow));
        const { merged, hasLocalPending } = mergeBootstrapItems<Expense>(
          initialExpenseCache?.data ?? [],
          forceSyncStatus<Expense>(remoteExpenses, "synced"),
          initialExpenseCache?.syncedIds ?? expenseIdsRef.current,
        );
        if (hasLocalPending) {
          const syncedSignature = expenseSignatureRef.current || expenseSignature(merged);
          saveExpenseSnapshot(merged, syncedSignature, true, initialExpenseCache?.syncedIds ?? expenseIdsRef.current);
          setExpenses(merged);
        } else {
          const syncedExpenses = forceSyncStatus<Expense>(merged, "synced");
          const remoteSignature = expenseSignature(syncedExpenses);
          saveExpenseSnapshot(syncedExpenses, remoteSignature, false, syncedExpenses.map((expense) => expense.id));
          setExpenses(syncedExpenses);
        }
      }

      if (checklistError) {
        console.warn("Supabase checklist load failed:", checklistError.message);
      } else {
        const remoteChecklist = (checklistData ?? []).map((row) => rowToChecklist(row as SupabaseChecklistRow));
        const { merged, hasLocalPending } = mergeBootstrapItems<ChecklistItem>(
          initialChecklistCache?.data ?? [],
          forceSyncStatus<ChecklistItem>(remoteChecklist, "synced"),
          initialChecklistCache?.syncedIds ?? checklistIdsRef.current,
        );
        if (hasLocalPending) {
          const syncedSignature = checklistSignatureRef.current || checklistSignature(merged);
          saveChecklistSnapshot(merged, syncedSignature, true, initialChecklistCache?.syncedIds ?? checklistIdsRef.current);
          checklistDirtyRef.current = true;
          setChecklist(merged);
        } else {
          const syncedChecklist = forceSyncStatus<ChecklistItem>(merged, "synced");
          const remoteSignature = checklistSignature(syncedChecklist);
          saveChecklistSnapshot(syncedChecklist, remoteSignature, false, syncedChecklist.map((item) => item.id));
          setChecklist(syncedChecklist);
        }
      }

      if (notesError) {
        console.warn("Supabase notes load failed:", notesError.message);
      } else {
        const remoteNotes = notesData?.notes && Array.isArray((notesData as SupabaseNotesRow).notes)
          ? (notesData as SupabaseNotesRow).notes
          : [];
        const { merged, hasLocalPending } = mergeBootstrapItems<TravelNote>(
          initialNotesCache?.data ?? [],
          forceSyncStatus<TravelNote>(remoteNotes, "synced"),
          initialNotesCache?.syncedIds ?? notesIdsRef.current,
        );
        if (hasLocalPending) {
          const syncedSignature = notesSignatureRef.current || notesSignature(merged);
          saveNotesSnapshot(merged, syncedSignature, true, initialNotesCache?.syncedIds ?? notesIdsRef.current);
          notesDirtyRef.current = true;
          setNotes(merged);
        } else {
          const syncedNotes = forceSyncStatus<TravelNote>(merged, "synced");
          const remoteSignature = notesSignature(syncedNotes);
          saveNotesSnapshot(syncedNotes, remoteSignature, false, syncedNotes.map((note) => note.id));
          setNotes(syncedNotes);
        }
      }

      setExpensesLoaded(true);
      setChecklistLoaded(true);
      setNotesLoaded(true);
    };

    const bootstrap = async () => {
      await loadSyncedData();
      if (cancelled) return;

      channel = supabase
        .channel(`trip-sync-${tripKey}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: supabaseExpenseTable, filter: `trip_key=eq.${tripKey}` },
          (payload) => {
            if (expenseDirtyRef.current) return;

            if (payload.eventType === "DELETE") {
              const deletedId = String(payload.old?.id ?? "");
              if (!deletedId) return;
              setExpenses((current) => {
                const next = forceSyncStatus<Expense>(current.filter((expense) => expense.id !== deletedId), "synced");
                if (expenseSignature(current) === expenseSignature(next)) return current;
                const nextSignature = expenseSignature(next);
                saveExpenseSnapshot(next, nextSignature, false, next.map((expense) => expense.id));
                return next;
              });
              return;
            }

            const row = payload.new as SupabaseExpenseRow;
            if (!row) return;
            setExpenses((current) => {
              const existing = current.find((expense) => expense.id === row.id);
              const incoming = rowToExpense(row);
              if (existing && expenseSignature([existing]) === expenseSignature([incoming])) return current;
              const next = forceSyncStatus<Expense>(mergeExpenseRow(current, row), "synced");
              const nextSignature = expenseSignature(next);
              saveExpenseSnapshot(next, nextSignature, false, next.map((expense) => expense.id));
              return next;
            });
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: supabaseChecklistTable, filter: `trip_key=eq.${tripKey}` },
          (payload) => {
            if (checklistDirtyRef.current) return;

            if (payload.eventType === "DELETE") {
              const deletedId = String(payload.old?.id ?? "");
              if (!deletedId) return;
              setChecklist((current) => {
                const next = forceSyncStatus<ChecklistItem>(current.filter((item) => item.id !== deletedId), "synced");
                if (checklistSignature(current) === checklistSignature(next)) return current;
                const nextSignature = checklistSignature(next);
                saveChecklistSnapshot(next, nextSignature, false, next.map((item) => item.id));
                return next;
              });
              return;
            }

            const row = payload.new as SupabaseChecklistRow;
            if (!row) return;
            setChecklist((current) => {
              const existing = current.find((item) => item.id === row.id);
              const incoming = rowToChecklist(row);
              if (existing && checklistSignature([existing]) === checklistSignature([incoming])) return current;
              const next = forceSyncStatus<ChecklistItem>(mergeChecklistRow(current, row), "synced");
              const nextSignature = checklistSignature(next);
              saveChecklistSnapshot(next, nextSignature, false, next.map((item) => item.id));
              return next;
            });
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: supabaseNotesTable, filter: `trip_key=eq.${tripKey}` },
          (payload) => {
            if (notesDirtyRef.current) return;

            if (payload.eventType === "DELETE") {
              const next: TravelNote[] = [];
              saveNotesSnapshot(next, notesSignature(next), false, []);
              setNotes((current) => {
                if (notesSignature(current) === notesSignature(next)) return current;
                return next;
              });
              return;
            }

            const row = payload.new as SupabaseNotesRow | undefined;
            if (!row || !Array.isArray(row.notes)) return;
            const incomingNotes = forceSyncStatus<TravelNote>(row.notes, "synced");
            setNotes((current) => {
              if (notesSignature(current) === notesSignature(incomingNotes)) return current;
              saveNotesSnapshot(incomingNotes, notesSignature(incomingNotes), false, incomingNotes.map((note) => note.id));
              return incomingNotes;
            });
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
  }, [authReady, isOnline, session?.user?.id]);

  useEffect(() => {
    if (!supabase || !authReady || !session) {
      setDiaryLoaded(true);
      return;
    }

    if (!isOnline) {
      setDiaryLoaded(true);
      return;
    }

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const hydrateDiaryEntry = async (row: SupabaseDiaryRow) => {
      const baseEntry = rowToDiaryEntry(row);
      if (!row.photo_path) return baseEntry;

      const { data, error } = await supabase.storage.from(supabaseDiaryBucket).createSignedUrl(row.photo_path, 60 * 60);
      if (error) {
        console.warn("Supabase diary photo load failed:", error.message);
        return baseEntry;
      }

      return {
        ...baseEntry,
        photoUrl: data?.signedUrl ?? baseEntry.photoUrl,
      };
    };

    const loadSyncedDiary = async () => {
      const { data, error } = await supabase
        .from(supabaseDiaryTable)
        .select("id, trip_key, title, description, type, rating, date_visited, location_name, city_or_country, tags, would_revisit, photo_path, saved_by_user_id, saved_by_email, created_at, updated_at")
        .eq("trip_key", tripKey)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.warn("Supabase diary load failed:", error.message);
        setDiaryLoaded(true);
        return;
      }

      const remoteRows = (data ?? []) as SupabaseDiaryRow[];
      const hydratedRows = await Promise.all(remoteRows.map(async (row) => hydrateDiaryEntry(row)));
      if (cancelled) return;

      const { merged, hasLocalPending } = mergeBootstrapItems<DiaryEntry>(
        initialDiaryCache?.data ?? [],
        forceSyncStatus<DiaryEntry>(hydratedRows, "synced"),
        initialDiaryCache?.syncedIds ?? diaryIdsRef.current,
      );

      if (hasLocalPending) {
        const syncedSignature = diarySignatureRef.current || diarySignature(merged);
        saveDiarySnapshot(merged, syncedSignature, true, initialDiaryCache?.syncedIds ?? diaryIdsRef.current);
        setDiaryEntries(merged);
      } else {
        const syncedDiary = forceSyncStatus<DiaryEntry>(merged, "synced");
        const remoteSignature = diarySignature(syncedDiary);
        saveDiarySnapshot(syncedDiary, remoteSignature, false, syncedDiary.map((entry) => entry.id));
        setDiaryEntries((current) => {
          if (diarySignature(current) === remoteSignature) return current;
          return syncedDiary;
        });
      }

      setDiaryLoaded(true);
    };

    const bootstrap = async () => {
      await loadSyncedDiary();
      if (cancelled) return;

      channel = supabase
        .channel(`trip-diary-sync-${tripKey}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: supabaseDiaryTable },
          (payload) => {
            if (payload.eventType === "DELETE") {
              const deletedId = String(payload.old?.id ?? "");
              if (!deletedId) return;
              setDiaryEntries((current) => {
                const existingEntry = current.find((entry) => entry.id === deletedId);
                if (!existingEntry) return current;

                const syncedEntry = diarySyncedEntriesRef.current[deletedId];
                if (isDiaryEntryProtectedFromRealtime(existingEntry, syncedEntry)) {
                  return current;
                }

                const next = current.filter((entry) => entry.id !== deletedId);
                if (diarySignature(current) === diarySignature(next)) return current;
                if (diaryDirtyRef.current) {
                  saveDiarySnapshot(next, diarySignatureRef.current, true, diaryIdsRef.current);
                } else {
                  const nextSignature = diarySignature(next);
                  saveDiarySnapshot(next, nextSignature, false, next.map((entry) => entry.id));
                }
                return next;
              });
              return;
            }

            const row = payload.new as SupabaseDiaryRow | undefined;
            if (!row) return;
            if (row.trip_key !== tripKey) return;

            void (async () => {
              const hydratedRow = await hydrateDiaryEntry(row);
              const incomingEntry = { ...hydratedRow, syncStatus: "synced" as SyncStatus };

              setDiaryEntries((current) => {
                const existingEntry = current.find((entry) => entry.id === incomingEntry.id);
                const syncedEntry = existingEntry ? diarySyncedEntriesRef.current[incomingEntry.id] : undefined;

                if (existingEntry && isDiaryEntryProtectedFromRealtime(existingEntry, syncedEntry)) {
                  return current;
                }

                const next = mergeDiaryRow(current, incomingEntry);
                if (diarySignature(current) === diarySignature(next)) return current;
                if (diaryDirtyRef.current) {
                  saveDiarySnapshot(next, diarySignatureRef.current, true, diaryIdsRef.current);
                } else {
                  const nextSignature = diarySignature(next);
                  saveDiarySnapshot(next, nextSignature, false, next.map((entry) => entry.id));
                }
                return next;
              });
            })();
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
  }, [authReady, isOnline, session?.user?.id]);

  useEffect(() => {
    if (!expensesLoaded) return;

    const ownerKey = currentUser ? `${currentUser.isAdmin ? "admin" : "user"}:${currentUser.userId}` : "";
    if (expenseSnapshotOwnerRef.current !== ownerKey) {
      expenseSnapshotOwnerRef.current = ownerKey;
      const managedExpenses = currentUser
        ? expenses.filter((expense) => {
            if (currentUser.isAdmin) return true;
            const ownerId = getExpenseOwnerId(expense);
            return ownerId === currentUser.userId;
          })
        : [];
      const managedSignature = expenseSignature(managedExpenses);
      const managedIds = managedExpenses.map((expense) => expense.id);
      const managedHasPending = managedExpenses.some((expense) => expense.syncStatus === "pending");
      setExpenseSyncSnapshot(managedSignature, managedHasPending, managedHasPending ? expenseIdsRef.current : managedIds);
    }
  }, [expensesLoaded, currentUser, expenses]);

  useEffect(() => {
    if (!checklistLoaded) return;

    const ownerKey = currentUser ? `${currentUser.isAdmin ? "admin" : "user"}:${currentUser.userId}` : "";
    if (checklistSnapshotOwnerRef.current !== ownerKey) {
      checklistSnapshotOwnerRef.current = ownerKey;
      const managedChecklist = currentUser
        ? checklist.filter((item) => {
            if (currentUser.isAdmin) return true;
            return getChecklistOwnerId(item) === currentUser.userId;
          })
        : [];
      const managedSignature = checklistSignature(managedChecklist);
      const managedIds = managedChecklist.map((item) => item.id);
      const managedHasPending = managedChecklist.some((item) => item.syncStatus === "pending");
      checklistSignatureRef.current = managedSignature;
      checklistDirtyRef.current = managedHasPending;
      if (!managedHasPending) {
        checklistIdsRef.current = managedIds;
      }
    }
  }, [checklistLoaded, currentUser, checklist]);

  useEffect(() => {
    if (!expensesLoaded) return;

    const managedExpenses = expenses.filter((expense) => {
      if (!currentUser) return false;
      if (currentUser.isAdmin) return true;
      const ownerId = getExpenseOwnerId(expense);
      return ownerId === currentUser.userId;
    });
    const payload = managedExpenses.map((expense) => expenseToRow(expense));
    const currentSignature = expenseSignature(managedExpenses);
    const currentIds = managedExpenses.map((expense) => expense.id);
    const removedIds = expenseIdsRef.current.filter((id) => !currentIds.includes(id));
    const hasPendingLocalChanges =
      currentSignature !== expenseSignatureRef.current || removedIds.length > 0 || expenseDirtyRef.current;

    if (!hasPendingLocalChanges) return;

    const managedHasPending = managedExpenses.some((expense) => expense.syncStatus === "pending");
    const shouldRealignToManagedState =
      !expenseDirtyRef.current &&
      removedIds.length === 0 &&
      !managedHasPending &&
      currentSignature !== expenseSignatureRef.current;

    if (shouldRealignToManagedState) {
      saveExpenseSnapshot(expenses, currentSignature, false, currentIds);
      return;
    }

    if (expenseSyncInFlightRef.current) {
      expenseSyncQueuedRef.current = true;
      return;
    }

    saveExpenseSnapshot(expenses, expenseSignatureRef.current, true, expenseIdsRef.current);

    if (!supabase || !authReady || !session || !isOnline) return;

    if (payload.length === 0 && removedIds.length === 0) {
      saveExpenseSnapshot(expenses, currentSignature, false, currentIds);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const requestExpenses: Expense[] = managedExpenses.map((expense) => ({ ...expense }));
        const requestExpenseById = new Map(requestExpenses.map((expense) => [expense.id, expense] as const));
        const requestExpenseIds = requestExpenses.map((expense) => expense.id);
        const requestExpenseSignature = expenseSignature(requestExpenses);
        const requestRemovedIds = removedIds.slice();
        const writePayload = requestExpenses.map((expense) => ({
          ...expenseToRow(expense),
          updated_at: new Date().toISOString(),
        }));

        expenseSyncInFlightRef.current = true;

        const { error: upsertError } = await supabase
          .from(supabaseExpenseTable)
          .upsert(writePayload, { onConflict: "id" });

        if (upsertError) {
          console.warn("Supabase expense sync failed:", upsertError.message);
          return;
        }

        if (requestRemovedIds.length > 0) {
          const { error: deleteError } = await supabase
            .from(supabaseExpenseTable)
            .delete()
            .in("id", requestRemovedIds);

          if (deleteError) {
            console.warn("Supabase expense delete failed:", deleteError.message);
            return;
          }
        }

        setExpenses((current) => {
          const currentManaged = current.filter((expense) => {
            if (!currentUser) return false;
            if (currentUser.isAdmin) return true;
            return getExpenseOwnerId(expense) === currentUser.userId;
          });
          const currentManagedIds = new Set(currentManaged.map((expense) => expense.id));
          let hasMismatch = false;

          const next = current.map((expense) => {
            const isManaged = currentUser
              ? currentUser.isAdmin || getExpenseOwnerId(expense) === currentUser.userId
              : false;
            if (!isManaged) return expense;

            const requestExpense = requestExpenseById.get(expense.id);
            if (!requestExpense) {
              hasMismatch = true;
              return expense;
            }

            if (expenseSignature([expense]) !== expenseSignature([requestExpense])) {
              hasMismatch = true;
              return expense;
            }

            return { ...expense, syncStatus: "synced" };
          });

          for (const requestExpense of requestExpenses) {
            if (!currentManagedIds.has(requestExpense.id)) {
              hasMismatch = true;
              break;
            }
          }

          if (hasMismatch) {
            expenseSyncQueuedRef.current = true;
            saveExpenseSnapshot(next, requestExpenseSignature, true, requestExpenseIds);
            return next;
          }

          const syncedExpenses = next;
          saveExpenseSnapshot(syncedExpenses, requestExpenseSignature, false, requestExpenseIds);
          return syncedExpenses;
        });
      } finally {
        expenseSyncInFlightRef.current = false;
        if (expenseSyncQueuedRef.current) {
          expenseSyncQueuedRef.current = false;
          setExpenseSyncNonce((value) => value + 1);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      expenseSyncInFlightRef.current = false;
    };
  }, [expenses, expensesLoaded, authReady, session, isOnline, currentUser, expenseSyncNonce]);

  useEffect(() => {
    if (!checklistLoaded) return;

    const managedChecklist = checklist.filter((item) => {
      if (!currentUser) return false;
      if (currentUser.isAdmin) return true;
      return getChecklistOwnerId(item) === currentUser.userId;
    });
    const currentSignature = checklistSignature(managedChecklist);
    const currentIds = managedChecklist.map((item) => item.id);
    const removedIds = checklistIdsRef.current.filter((id) => !currentIds.includes(id));
    const hasPendingLocalChanges = currentSignature !== checklistSignatureRef.current || removedIds.length > 0 || checklistDirtyRef.current;

    if (!hasPendingLocalChanges) return;

    if (checklistSyncInFlightRef.current) {
      // dirty state persisted before return
      saveChecklistSnapshot(checklist, checklistSignatureRef.current, true, checklistIdsRef.current);
      checklistSyncQueuedRef.current = true;
      return;
    }

    if (currentSignature === checklistSignatureRef.current && removedIds.length === 0) {
      saveChecklistSnapshot(checklist, currentSignature, false, currentIds);
      return;
    }

    saveChecklistSnapshot(checklist, checklistSignatureRef.current, true, checklistIdsRef.current);

    // dirty state persisted before return
    if (!supabase || !authReady || !session || !isOnline) return;

    const timeout = window.setTimeout(async () => {
      if (checklistSyncInFlightRef.current) {
        checklistSyncQueuedRef.current = true;
        return;
      }
      checklistSyncInFlightRef.current = true;

      try {
        const requestChecklist: ChecklistItem[] = managedChecklist.map((item) => ({ ...item }));
        const requestChecklistById = new Map(requestChecklist.map((item) => [item.id, item] as const));
        const requestChecklistIds = requestChecklist.map((item) => item.id);
        const requestChecklistSignature = checklistSignature(requestChecklist);
        const requestRemovedIds = removedIds.slice();
        const writePayload = requestChecklist.map((item) => ({
          ...checklistToRow(item),
          updated_at: new Date().toISOString(),
        }));

        const { error: upsertError } = await supabase
          .from(supabaseChecklistTable)
          .upsert(writePayload, { onConflict: "id" });

        if (upsertError) {
          // dirty state persisted before return
          console.warn("Supabase checklist sync failed:", upsertError.message);
          return;
        }

        if (requestRemovedIds.length > 0) {
          const { error: deleteError } = await supabase
            .from(supabaseChecklistTable)
            .delete()
            .in("id", requestRemovedIds);

          if (deleteError) {
            // dirty state persisted before return
            console.warn("Supabase checklist delete failed:", deleteError.message);
            return;
          }
        }

        setChecklist((current) => {
          const currentManaged = current.filter((item) => {
            if (!currentUser) return false;
            if (currentUser.isAdmin) return true;
            return getChecklistOwnerId(item) === currentUser.userId;
          });
          let hasMismatch = false;
          const currentById = new Map(currentManaged.map((item) => [item.id, item] as const));
          const next = current.map((item) => {
            const isManaged = currentUser
              ? currentUser.isAdmin || getChecklistOwnerId(item) === currentUser.userId
              : false;
            if (!isManaged) return item;

            const requestItem = requestChecklistById.get(item.id);
            if (!requestItem) {
              return item;
            }

            if (checklistSignature([item]) !== checklistSignature([requestItem])) {
              hasMismatch = true;
              return item;
            }

            return { ...item, syncStatus: "synced" };
          });

          for (const requestItem of requestChecklist) {
            if (!currentById.has(requestItem.id)) {
              hasMismatch = true;
              break;
            }
          }

          if (hasMismatch) {
            // successful request baseline persisted; newer local state preserved and queued
            checklistSyncQueuedRef.current = true;
            saveChecklistSnapshot(next, requestChecklistSignature, true, requestChecklistIds);
            return next;
          }

          saveChecklistSnapshot(next, requestChecklistSignature, false, requestChecklistIds);
          return next;
        });
      } finally {
        checklistSyncInFlightRef.current = false;
        if (checklistSyncQueuedRef.current) {
          checklistSyncQueuedRef.current = false;
          setChecklistSyncNonce((value) => value + 1);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [checklist, checklistLoaded, authReady, session, isOnline, checklistSyncNonce, currentUser]);

  useEffect(() => {
    if (!notesLoaded) return;

    const currentSignature = notesSignature(notes);
    const hasPendingLocalChanges = currentSignature !== notesSignatureRef.current || notesDirtyRef.current;

    if (!hasPendingLocalChanges) return;

    if (notesSyncInFlightRef.current) {
      // dirty state persisted before return
      saveNotesSnapshot(notes, notesSignatureRef.current, true, notesIdsRef.current);
      notesSyncQueuedRef.current = true;
      return;
    }

    if (currentSignature === notesSignatureRef.current) {
      saveNotesSnapshot(notes, currentSignature, false, notes.map((note) => note.id));
      return;
    }

    saveNotesSnapshot(notes, notesSignatureRef.current, true, notesIdsRef.current);

    // dirty state persisted before return
    if (!supabase || !authReady || !session || !isOnline) return;

    const timeout = window.setTimeout(async () => {
      if (notesSyncInFlightRef.current) {
        notesSyncQueuedRef.current = true;
        return;
      }
      notesSyncInFlightRef.current = true;

      try {
        const requestNotes = notes.map((note) => ({ ...note }));
        const requestNotesSignature = notesSignature(requestNotes);
        const writePayload = {
          ...notesPayload(requestNotes),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from(supabaseNotesTable)
          .upsert(writePayload, { onConflict: "trip_key" });

        if (error) {
          // dirty state persisted before return
          console.warn("Supabase notes sync failed:", error.message);
          return;
        }

        setNotes((current) => {
          if (notesSignature(current) !== requestNotesSignature) {
            // successful request baseline persisted; newer local state preserved and queued
            notesSyncQueuedRef.current = true;
            saveNotesSnapshot(current, requestNotesSignature, true, requestNotes.map((note) => note.id));
            return current;
          }

          const syncedNotes = forceSyncStatus<TravelNote>(current, "synced");
          saveNotesSnapshot(syncedNotes, requestNotesSignature, false, syncedNotes.map((note) => note.id));
          return syncedNotes;
        });
      } finally {
        notesSyncInFlightRef.current = false;
        if (notesSyncQueuedRef.current) {
          notesSyncQueuedRef.current = false;
          setNotesSyncNonce((value) => value + 1);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [notes, notesLoaded, authReady, session?.user?.id, isOnline, notesSyncNonce]);

  useEffect(() => {
    if (!diaryLoaded) return;

    const ownerKey = currentUser ? `${currentUser.isAdmin ? "admin" : "user"}:${currentUser.userId}` : "";
    if (diarySnapshotOwnerRef.current !== ownerKey) {
      diarySnapshotOwnerRef.current = ownerKey;
      const managedDiaryEntries = currentUser
        ? diaryEntries.filter((entry) => {
            if (currentUser.isAdmin) return true;
            return getDiaryOwnerId(entry) === currentUser.userId;
          })
        : [];
      const managedSignature = diarySignature(managedDiaryEntries);
      const managedIds = managedDiaryEntries.map((entry) => entry.id);
      const managedHasPending = managedDiaryEntries.some((entry) => entry.syncStatus === "pending" || isDiaryLocalPhotoUrl(entry.photoUrl));
      diarySignatureRef.current = managedSignature;
      diaryDirtyRef.current = managedHasPending;
      if (!managedHasPending) {
        diaryIdsRef.current = managedIds;
      }
    }

    const managedDiaryEntries = diaryEntries.filter((entry) => {
      if (!currentUser) return false;
      if (currentUser.isAdmin) return true;
      return getDiaryOwnerId(entry) === currentUser.userId;
    });
    const currentSignature = diarySignature(managedDiaryEntries);
    const currentIds = managedDiaryEntries.map((entry) => entry.id);
    const removedIds = diaryIdsRef.current.filter((id) => !currentIds.includes(id));
    const pendingPhotoSignature = managedDiaryEntries
      .filter((entry) => entry.photoUrl?.startsWith("data:"))
      .map((entry) => `${entry.id}:${hashString(entry.photoUrl ?? "")}:${entry.photoPath ?? ""}`)
      .join("|");
    const hasPendingPhotoUploads = pendingPhotoSignature.length > 0;
    const hasPendingLocalChanges =
      currentSignature !== diarySignatureRef.current ||
      removedIds.length > 0 ||
      diaryDirtyRef.current ||
      hasPendingPhotoUploads;

    if (!hasPendingLocalChanges) return;

    const shouldBlockPhotoRetry =
      hasPendingPhotoUploads &&
      diaryPhotoRetryBlockRef.current === pendingPhotoSignature &&
      currentSignature === diarySignatureRef.current &&
      removedIds.length === 0;

    if (shouldBlockPhotoRetry) return;

    if (currentSignature === diarySignatureRef.current && removedIds.length === 0 && !hasPendingPhotoUploads && !diaryDirtyRef.current) {
      saveDiarySnapshot(diaryEntries, currentSignature, false, currentIds);
      return;
    }

    saveDiarySnapshot(diaryEntries, diarySignatureRef.current, true, diaryIdsRef.current);

    // dirty state persisted before return
    if (!supabase || !authReady || !session || !isOnline || !currentSavedBy) return;
    if (diarySyncInFlightRef.current) {
      // dirty state persisted before return
      diarySyncQueuedRef.current = true;
      return;
    }

    const timeout = window.setTimeout(async () => {
      if (diarySyncInFlightRef.current) {
        // dirty state already persisted before scheduling; queue retry instead of dropping local changes
        diarySyncQueuedRef.current = true;
        return;
      }
      diarySyncInFlightRef.current = true;

      try {
        const requestDiaryEntries: DiaryEntry[] = managedDiaryEntries.map((entry) => ({ ...entry }));
        const requestOriginalDiaryById = new Map(requestDiaryEntries.map((entry) => [entry.id, entry] as const));
        const requestDiaryIds = requestDiaryEntries.map((entry) => entry.id);
        const uploadResults = await Promise.all(
          requestDiaryEntries.map(async (entry) => {
            if (!isDiaryLocalPhotoUrl(entry.photoUrl)) {
              return {
                id: entry.id,
                photoPath: entry.photoPath ?? null,
                photoUrl: entry.photoUrl,
                uploaded: false,
                error: null as Error | null,
              };
            }

            try {
              const photoPath = entry.photoPath ?? buildDiaryPhotoPath(entry.id, currentSavedBy.userId);
              const response = await fetch(entry.photoUrl);
              const blob = await response.blob();
              const { error: uploadError } = await supabase.storage.from(supabaseDiaryBucket).upload(photoPath, blob, {
                contentType: blob.type || "image/jpeg",
                upsert: true,
              });

              if (uploadError) {
                throw uploadError;
              }

              const { data: signedData, error: signedError } = await supabase.storage
                .from(supabaseDiaryBucket)
                .createSignedUrl(photoPath, 60 * 60);

              if (signedError) {
                console.warn("Supabase diary photo sign URL failed:", signedError.message);
              }

              return {
                id: entry.id,
                photoPath,
                photoUrl: signedData?.signedUrl ?? undefined,
                uploaded: true,
                error: null as Error | null,
              };
            } catch (error) {
              return {
                id: entry.id,
                photoPath: entry.photoPath ?? null,
                photoUrl: entry.photoUrl,
                uploaded: false,
                error: error instanceof Error ? error : new Error(String(error)),
              };
            }
          }),
        );

        uploadResults
          .filter((result) => result.error)
          .forEach((result) => {
            console.warn("Supabase diary photo upload failed:", result.error?.message);
          });

        const nextDiary = requestDiaryEntries.map((entry) => {
          const result = uploadResults.find((item) => item.id === entry.id);
          const ownerId = entry.createdBy ?? entry.savedByUserId ?? null;
          const ownerEmail = entry.savedByEmail ?? null;

          if (result?.uploaded) {
            const resolvedPhotoPath = result.photoPath ?? entry.photoPath;
            if (!resolvedPhotoPath) {
              // local data photo cannot be marked clean synced without a remote photo path
              console.warn("Supabase diary photo upload completed without a photo path; keeping entry pending.");
              return {
                ...entry,
                createdBy: ownerId ?? undefined,
                savedByUserId: ownerId ?? undefined,
                savedByEmail: ownerEmail ?? undefined,
                syncStatus: "pending" as SyncStatus,
              };
            }

            return {
              ...entry,
              createdBy: ownerId ?? undefined,
              photoPath: resolvedPhotoPath,
              photoUrl: result.photoUrl ?? undefined,
              savedByUserId: ownerId ?? undefined,
              savedByEmail: ownerEmail ?? undefined,
              syncStatus: "synced" as SyncStatus,
            };
          }

          return {
            ...entry,
            createdBy: ownerId ?? undefined,
            savedByUserId: ownerId ?? undefined,
            savedByEmail: ownerEmail ?? undefined,
            syncStatus: (isDiaryLocalPhotoUrl(entry.photoUrl) ? "pending" : "synced") as SyncStatus,
          };
        });

        const writePayload = nextDiary.map((entry) => ({
          trip_key: tripKey,
          ...diaryEntryToRow(entry),
          updated_at: new Date().toISOString(),
        }));

        const { error: upsertError } = await supabase
          .from(supabaseDiaryTable)
          .upsert(writePayload, { onConflict: "id" });

        if (upsertError) {
          // dirty state persisted before return
          console.warn("Supabase diary sync failed:", upsertError.message);
          return;
        }

        const requestRemovedIds = removedIds.slice();

        if (requestRemovedIds.length > 0) {
          const { error: deleteError } = await supabase
            .from(supabaseDiaryTable)
            .delete()
            .in("id", requestRemovedIds);

          if (deleteError) {
            // dirty state persisted before return
            console.warn("Supabase diary delete failed:", deleteError.message);
            return;
          }
        }

        const removedPhotoPaths = requestRemovedIds
          .map((id) => diarySyncedEntriesRef.current[id]?.photoPath)
          .filter((value): value is string => Boolean(value));

        if (removedPhotoPaths.length > 0) {
          const { error: photoDeleteError } = await supabase.storage.from(supabaseDiaryBucket).remove(removedPhotoPaths);
          if (photoDeleteError) {
            console.warn("Supabase diary photo delete failed:", photoDeleteError.message);
          }
        }

        const requestWrittenDiary = nextDiary.map((entry) => ({
          ...entry,
          // local data photo cannot be marked clean synced
          syncStatus: (isDiaryLocalPhotoUrl(entry.photoUrl) ? "pending" : "synced") as SyncStatus,
        }));
        const requestWrittenDiarySignature = diarySignature(requestWrittenDiary);
        const requestWrittenDiaryById = new Map(requestWrittenDiary.map((entry) => [entry.id, entry] as const));
        const requestWrittenDiaryIds = requestWrittenDiary.map((entry) => entry.id);
        const nextPendingPhotoSignature = requestWrittenDiary
          .filter((entry) => entry.photoUrl?.startsWith("data:"))
          .map((entry) => `${entry.id}:${hashString(entry.photoUrl ?? "")}:${entry.photoPath ?? ""}`)
          .join("|");
        const remainingDirty = Boolean(nextPendingPhotoSignature);
        setDiaryEntries((current) => {
          let hasMismatch = false;
          const currentById = new Map(current.map((entry) => [entry.id, entry] as const));
          const next = current.map((entry) => {
            const originalRequestEntry = requestOriginalDiaryById.get(entry.id);
            if (!originalRequestEntry) {
              return entry;
            }

            if (diarySignature([entry]) !== diarySignature([originalRequestEntry])) {
              hasMismatch = true;
              return entry;
            }

            const writtenEntry = requestWrittenDiaryById.get(entry.id);
            if (!writtenEntry) {
              hasMismatch = true;
              return entry;
            }

            // successful request baseline persisted; unchanged local state is replaced with uploaded/written result
            return writtenEntry;
          });

          for (const requestEntry of requestWrittenDiary) {
            if (!currentById.has(requestEntry.id)) {
              hasMismatch = true;
              break;
            }
          }

          if (hasMismatch) {
            // newer local state preserved and queued
            diarySyncQueuedRef.current = true;
            saveDiarySnapshot(next, requestWrittenDiarySignature, true, requestWrittenDiaryIds);
            return next;
          }

          saveDiarySnapshot(next, requestWrittenDiarySignature, remainingDirty, requestWrittenDiaryIds);
          diaryIdsRef.current = requestWrittenDiaryIds;
          diarySyncedEntriesRef.current = Object.fromEntries(next.map((entry) => [entry.id, entry]));
          diaryPhotoRetryBlockRef.current = remainingDirty ? nextPendingPhotoSignature : "";
          return next;
        });
      } finally {
        diarySyncInFlightRef.current = false;
        if (diarySyncQueuedRef.current) {
          diarySyncQueuedRef.current = false;
          setDiarySyncNonce((value) => value + 1);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [diaryEntries, diaryLoaded, authReady, session?.user?.id, isOnline, diarySyncNonce]);

  useEffect(() => {
    diaryPhotoRetryBlockRef.current = "";
  }, [isOnline, session]);

  useEffect(() => {
    const navStandalone =
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    const displayModeStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches === true;

    const isIosLike =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

    const enabled = isIosLike && (navStandalone || displayModeStandalone);

    setIsIosStandalonePwa(enabled);
    document.documentElement.classList.toggle("ios-standalone-pwa", enabled);

    return () => {
      document.documentElement.classList.remove("ios-standalone-pwa");
    };
  }, []);



  useEffect(() => {
    const check = () => setScreenSize(window.innerWidth < 768 ? "small" : "large");
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const budgetCapStorageKey = session?.user.id ? `ja-budget-cap:${tripKey}:${session.user.id}` : null;

  useEffect(() => {
    if (!budgetCapStorageKey) return;
    try {
      const cached = Number(localStorage.getItem(budgetCapStorageKey));
      if (!Number.isNaN(cached) && cached >= 0) {
        setBudgetCapPhp(cached);
      }
    } catch {}
  }, [budgetCapStorageKey]);

  useEffect(() => {
    if (!supabase || !authReady || !session) return;
    supabase
      .from(supabaseBudgetSettingsTable)
      .select("budget_cap")
      .eq("trip_key", tripKey)
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return;
        const remote = Number(data["budget_cap"]);
        if (!isNaN(remote)) {
          setBudgetCapPhp(remote);
          if (budgetCapStorageKey) {
            try { localStorage.setItem(budgetCapStorageKey, String(remote)); } catch {}
          }
        }
      });
  }, [authReady, session, budgetCapStorageKey]);

  useEffect(() => {
    if (budgetCapStorageKey) {
      try {
        localStorage.setItem(budgetCapStorageKey, String(budgetCapPhp));
      } catch {}
    }
    if (!supabase || !authReady || !session) return;
    const timeout = setTimeout(async () => {
      const { error } = await supabase
        .from(supabaseBudgetSettingsTable)
        .upsert({ trip_key: tripKey, user_id: session.user.id, budget_cap: budgetCapPhp }, { onConflict: "trip_key,user_id" });
      if (error) console.warn("Supabase settings save failed:", error.message);
    }, 500);
    return () => clearTimeout(timeout);
  }, [budgetCapPhp, authReady, session, budgetCapStorageKey]);

  useEffect(() => {
    if (activeRoute !== "/settings") {
      settingsRouteHandledRef.current = false;
      return;
    }

    if (settingsRouteHandledRef.current) return;
    settingsRouteHandledRef.current = true;
    setIsFirstSetup(false);
    setShowSettingsModal(true);
  }, [activeRoute]);

  const metadata = {
    title: "J&A Malaysia · Singapore Trip 2026",
    description: itinerary.hero.subtitle,
  };
  const normalizedTips = itinerary.tips.map((tip) => ({
    ...tip,
    icon: normalizeTipIcon(tip.icon),
  }));

  const formatPhp = (php: number) =>
    `PHP ${php.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  const phpToRm = (php: number) =>
    php > 0 ? `RM ${(php / exchangeRates.php).toLocaleString("en-MY", { maximumFractionDigits: 2 })}` : "RM 0";
  const rmToPhp = (rm: number) =>
    rm > 0 ? `PHP ${(rm * exchangeRates.php).toLocaleString("en-PH", { maximumFractionDigits: 2 })}` : "PHP 0";

  const handleOpenGuide = (item: TimelineItemData) => {
    setSelectedGuide(buildGuideForItem(item));
  };

  const handleSignIn = async (provider: "google" | "facebook" | "github") => {
    if (!supabase) return;

    setAuthError("");
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      setAuthError(error.message);
      console.warn("Supabase sign-in failed:", error.message);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setAuthError("");
    setUserSettings(null);
    setSettingsLoaded(false);
    setIsFirstSetup(false);
    setShowSettingsModal(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      console.warn("Supabase sign-out failed:", error.message);
    }
  };

  const handleSaveSettings = async (incoming: UserTripSettings) => {
    if (!supabase || !session) return;

    setIsSavingSettings(true);
    const nextSettings: UserTripSettings = {
      ...incoming,
      userId: session.user.id,
      tripKey,
    };

    const { error } = await supabase
      .from(supabaseSettingsTable)
      .upsert(settingsToRow(nextSettings), { onConflict: "user_id,trip_key" });

    if (error) {
      console.warn("Supabase user settings save failed:", error.message);
      setIsSavingSettings(false);
      return;
    }

    setUserSettings(nextSettings);
    setShowSettingsModal(false);
    setIsFirstSetup(false);
    setSettingsLoaded(true);
    setIsSavingSettings(false);

    if (activeRoute === "/settings") {
      navigateTo("/budget");
    }
  };

  const handleOpenSettings = () => {
    setIsFirstSetup(false);
    setShowSettingsModal(true);
  };

  const getIonContentForRoute = (routeKey = activeRoute) => {
    const routeContent = contentRefs.current[routeKey];
    if (routeContent) return routeContent;

    return document.querySelector("ion-content.ja-ion-content") as HTMLIonContentElement | null;
  };

  const scrollContentToTop = (duration = 300, routeKey = activeRoute) => {
    const content = getIonContentForRoute(routeKey);
    const behavior: ScrollBehavior = duration > 0 ? "smooth" : "auto";

    setShowScrollTop(false);
    document.documentElement.classList.remove("nav-scrolled");

    if (!content) {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    if (content.scrollToPoint) {
      void content.scrollToPoint(0, 0, duration);
    } else if (content.scrollToTop) {
      void content.scrollToTop(duration);
    }

    window.setTimeout(() => {
      void content.getScrollElement?.().then((scrollElement) => {
        if (scrollElement.scrollTop > 2) {
          scrollElement.scrollTo({ top: 0, behavior });
        }
      });
    }, duration + 60);
  };

  const navigateTo = (path: string) => {
    const normalizedPath = routeFromPath(path);
    if (normalizedPath === activeRoute) {
      scrollContentToTop(250, normalizedPath);
      return;
    }

    history.push(path);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollContentToTop(250, normalizedPath));
    });
  };

  const handleShareTrip = async () => {
    const shareData = {
      title: metadata.title,
      text: metadata.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleMobilePrint = () => {
    window.print();
  };

  useEffect(() => {
    const cleanup = installKeyboardClass();
    return () => {
      cleanup?.();
    };
  }, []);

  const pullStartYRef = useRef(0);
  const pullOffsetRef = useRef(0);
  const isPullingRef = useRef(false);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const PULL_THRESHOLD = 70;

  const setPullOffset = (px: number, animate: boolean) => {
    const root = document.documentElement;
    root.style.setProperty("--ja-pull-offset", `${Math.round(px)}px`);
    root.style.setProperty("--ja-pull-easing", animate ? "transform 0.4s cubic-bezier(0.16,1,0.3,1)" : "none");
  };

  useEffect(() => {
    const getScrollTop = (): number => {
      const el = document.querySelector("ion-content.ja-ion-content") as any;
      return el?.scrollTop ?? 0;
    };

    const onTouchStart = (e: TouchEvent) => {
      pullStartYRef.current = e.touches[0].clientY;
      isPullingRef.current = false;
      pullOffsetRef.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const delta = e.touches[0].clientY - pullStartYRef.current;
      if (delta > 6 && getScrollTop() <= 0) {
        isPullingRef.current = true;
        const offset = Math.min(PULL_THRESHOLD, delta * 0.55);
        pullOffsetRef.current = offset;
        setPullOffset(offset, false);
      }
    };

    const onTouchEnd = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;
      if (pullOffsetRef.current >= PULL_THRESHOLD) {
        setPullRefreshing(true);
        setTimeout(() => window.location.reload(), 900);
      } else {
        setPullOffset(0, true);
        pullOffsetRef.current = 0;
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);


  const mobileAccountCard = session ? (
    <section className="ja-app-mobile-card">
      <div className="ja-app-mobile-card-inner">
        <div className="ja-app-mobile-user-row">
          <div className="ja-app-mobile-avatar">JA</div>
          <div className="ja-app-mobile-user-info">
            <div className="ja-app-mobile-user-name">Jessie Jayr</div>
            <div className="ja-app-mobile-user-email">{session.user.email ?? "Signed in"}</div>
          </div>
        </div>
        <div className="ja-app-mobile-actions">
          <button type="button" onClick={handleShareTrip} className="ja-app-mobile-action"><Share2 size={14} />Share trip</button>
          <button type="button" onClick={handleMobilePrint} className="ja-app-mobile-action"><Printer size={14} />Print</button>
          <button type="button" onClick={handleSignOut} className="ja-app-mobile-action ja-app-mobile-action-danger"><LogOut size={14} />Log out</button>
        </div>
      </div>
    </section>
  ) : (
    <section className="ja-app-mobile-card">
      <div className="ja-app-mobile-card-inner">
        <div className="ja-app-mobile-not-signed">Not signed in</div>
        <div className="ja-app-mobile-hint">Use the Login button above to sync your trip data.</div>
        <button type="button" onClick={() => setShowAuthModal(true)} className="ja-app-mobile-login-btn">
          Log in
        </button>
      </div>
    </section>
  );

  const renderSiteFooter = () => (
    <footer className="ja-app-footer">
      <div className="ja-app-footer-grid">
        <div>
          <h3 className="ja-app-footer-title">Curating unforgettable Asian experiences.</h3>
          <p className="ja-app-footer-text">{itinerary.footer}</p>
        </div>
        <div className="ja-app-footer-nav-col">
          <div>
            <h4 className="ja-app-footer-heading">Navigation</h4>
            <ul className="ja-app-footer-links">
              <li><button onClick={() => navigateTo("/")} className="ja-app-footer-link">Daily Itinerary</button></li>
              <li><button onClick={() => navigateTo("/budget")} className="ja-app-footer-link">Budget Breakdown</button></li>
              <li><button onClick={() => navigateTo("/map")} className="ja-app-footer-link">Travel Map</button></li>
              <li><button onClick={() => navigateTo("/notes")} className="ja-app-footer-link">Custom Notes & Rules</button></li>
              <li><button onClick={() => navigateTo("/diary")} className="ja-app-footer-link">Travel Diary</button></li>
            </ul>
          </div>
          <div>
            <h4 className="ja-app-footer-heading">Resources</h4>
            <ul className="ja-app-footer-links">
              <li><span className="ja-app-footer-muted">Transport Guide</span></li>
              <li><span className="ja-app-footer-muted">Dining Notes</span></li>
              <li><span className="ja-app-footer-muted">Safety Tips</span></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="ja-app-footer-bottom">
        <span>(c) 2026 Jessie & Amor. All rights reserved.</span>
        <div className="ja-app-footer-legal">
          <span className="ja-app-footer-legal-link">Privacy</span>
          <span className="ja-app-footer-legal-link">Support</span>
          <span className="ja-app-footer-legal-link">Terms</span>
        </div>
      </div>
    </footer>
  );

  const renderPage = (
    children: React.ReactNode,
    options?: { className?: string; routeKey?: string; showFooter?: boolean }
  ) => {
    const routeKey = options?.routeKey ?? activeRoute;

    return (
    <IonPage>
      <IonContent
        ref={(content) => {
          contentRefs.current[routeKey] = content;
        }}
        fullscreen
        scrollY={true}
        scrollEvents={true}
        className="ja-ion-content"
        onIonScroll={(event) => {
          if (routeKey !== activeRoute) return;
          const top = event.detail.scrollTop;
          setShowScrollTop(top > 400);
          document.documentElement.classList.toggle("nav-scrolled", top > 60);
        }}
      >
        <div className={`ja-page-frame ${options?.className ?? ""}`}>

          <div className="ja-content-offset">
            <main className="ja-app-main">
              <IonGrid fixed className="ja-page-grid">
                <IonRow className="ja-page-row">
                  <IonCol size="12" className="ja-page-col">
                    {children}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </main>
            {options?.showFooter === false ? null : renderSiteFooter()}
          </div>
        </div>
      </IonContent>
    </IonPage>
    );
  };

  return (
    <>
      {/* Pull-to-refresh spinner — sits behind nav bar, revealed as everything slides down */}
      <div className={`ja-pull-spinner${pullRefreshing ? " ja-pull-spinner--spin" : ""}`}>
        <div className="ja-pull-spinner-ring" />
      </div>

      <Navigation
        activeTab={activeRoute}
        setActiveTab={navigateTo}
        metadata={metadata}
        session={session}
        isOnline={isOnline}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenSettings={handleOpenSettings}
        onSignOut={handleSignOut}
        expenses={expenses}
        screenSize={screenSize}
      />

      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/account">
            {renderPage(mobileAccountCard, { routeKey: "/account", showFooter: false })}
          </Route>
          <Route exact path="/">
            {renderPage(
              <div className="ja-app-fade-in">
                <div className="home-hero-section">
                  <Hero hero={itinerary.hero} />
                  <Legend items={itinerary.legend} />
                </div>
                <DailyItineraryView
                  days={itinerary.days}
                  onInfoClick={handleOpenGuide}
                  selectedMobileDay={selectedHomeDay}
                  onSelectedMobileDayChange={setSelectedHomeDay}
                />
                <BudgetSummaryHeader
                  cards={itinerary.budgetSummary}
                  expenses={expenses}
                  showLiveSpends={showLiveSpends}
                  setShowLiveSpends={setShowLiveSpends}
                  exchangeRates={exchangeRates}
                  userSettings={userSettings}
                  selectedMobileDay={selectedHomeDay}
                  onSelectedMobileDayChange={setSelectedHomeDay}
                />
                <AlertBox alert={itinerary.alert} />

                <section className="ja-app-section">
                  <div className="ja-app-section-header"><div><h3 className="ja-app-section-title">Trip Tips</h3><p className="ja-app-section-desc">Code 1's itinerary reminders, folded into Code 2's visual system.</p></div></div>
                  <div className="ja-app-tips-grid">
                    {normalizedTips.map((tip, index) => (
                      <TipCard key={`${tip.icon}-${index}`} tip={tip as TipCardData} />
                    ))}
                  </div>
                </section>

                <section className="ja-app-insights">
                  <div className="ja-app-insights-inner">
                    <div className="ja-app-insights-header"><h3 className="ja-app-section-title">Pro-Traveler Insights</h3><p className="ja-app-section-desc">Smart hacks and safety strategies recommended by our logistics team</p></div>
                    <div className="ja-app-insights-grid">
                      <div className="ja-app-insight-card"><div className="ja-app-insight-icon"><CreditCard size={20} /></div><h4 className="ja-app-insight-title">Touch 'n Go Card</h4><p className="ja-app-section-desc">The essential card for all transit. Buy at KL Sentral for seamless boarding and discounted fares.</p></div>
                      <div className="ja-app-insight-card"><div className="ja-app-insight-icon"><Ticket size={20} /></div><h4 className="ja-app-insight-title">Advance Booking</h4><p className="ja-app-section-desc">Malacca buses fill quickly on Sundays. Use BusOnlineTicket.com to secure your 8 AM slot.</p></div>
                      <div className="ja-app-insight-card"><div className="ja-app-insight-icon"><Utensils size={20} /></div><h4 className="ja-app-insight-title">Street Food Strategy</h4><p className="ja-app-section-desc">At Jalan Alor, stick to grilled skewers and local satay. Avoid the overpriced seafood platters.</p></div>
                    </div>
                  </div>
                </section>

                <section className="ja-app-section">
                  <div onClick={() => navigateTo("/map")} className="ja-app-map-card">
                    <div className="ja-app-map-dots" />
                    <div className="ja-app-map-dot ja-app-map-dot-1" /><div className="ja-app-map-dot ja-app-map-dot-2" /><div className="ja-app-map-dot ja-app-map-dot-3" /><div className="ja-app-map-dot ja-app-map-dot-4" />
                    <div className="ja-app-map-card-inner">
                      <Compass className="ja-app-compass" size={24} />
                      <h4 className="ja-app-map-card-title">Explore Kuala Lumpur</h4>
                      <p className="ja-app-map-card-badge">INTERACTIVE MAP NOW ACTIVE</p>
                      <p className="ja-app-map-card-desc">Click to browse custom plotted transit markers</p>
                    </div>
                  </div>
                </section>
              </div>,
              { routeKey: "/" }
            )}
          </Route>
          <Route exact path="/budget">
            {renderPage(
              <BudgetTab
                expenses={expenses}
                setExpenses={setExpenses}
                isSupabaseConnected={Boolean(supabase && session)}
                isOnline={isOnline}
                canEdit={Boolean(session)}
                currentUser={currentUser}
                exchangeRates={exchangeRates}
                budgetCapPhp={budgetCapPhp}
                userSettings={userSettings}
              />,
              { routeKey: "/budget" }
            )}
          </Route>
          <Route exact path="/map">
            {renderPage(
              <MapTab
                session={session}
                canEdit={Boolean(session)}
                isOnline={isOnline}
                userSettings={userSettings}
                currentUser={currentUser}
              />,
              { className: "ja-map-page-frame", routeKey: "/map", showFooter: false }
            )}
          </Route>
          <Route exact path="/notes">
            {renderPage(
              <NotesTab
                notes={notes}
                setNotes={setNotes}
                checklist={checklist}
                setChecklist={setChecklist}
                isOnline={isOnline}
                canEdit={Boolean(session)}
                currentUser={currentUser}
              />,
              { routeKey: "/notes" }
            )}
          </Route>
          <Route exact path="/diary">
            {renderPage(
              <DiaryTab
                diaryEntries={diaryEntries}
                setDiaryEntries={setDiaryEntries}
                isOnline={isOnline}
                canEdit={Boolean(session)}
                currentUser={currentUser}
              />,
              { routeKey: "/diary" }
            )}
          </Route>
          <Route exact path="/settings">
            {renderPage(
              <div className="ja-app-settings-wrap">
                <div className="ja-app-settings-card">
                  <h2 className="ja-app-settings-title">Settings</h2>
                  <div className="ja-app-settings-body">
                    <label className="ja-app-settings-block">
                      <span className="ja-app-settings-field-label">Budget Cap</span>
                      <span className="ja-app-settings-hint">0 = no cap</span>
                      <div className="ja-app-settings-cap-row">
                        <span className="ja-app-settings-currency">PHP</span>
                        <input type="number" min="0" step="500" value={budgetCapPhp || ""} placeholder="No cap"
                          onChange={(e) => { const php = Math.max(0, Number(e.target.value) || 0); setBudgetCapPhp(php); }}
                          className="ja-app-settings-input" />
                        <span className="ja-app-settings-auto">Auto-saved</span>
                      </div>
                      {budgetCapPhp > 0 && <p className="ja-app-settings-conversion">= {phpToRm(budgetCapPhp)}<span className={`ja-app-rate ${exchangeRates.source === "live" ? "ja-app-rate-live" : exchangeRates.source === "cached" ? "ja-app-rate-cached" : "ja-app-rate-static"}`}>{exchangeRates.source === "live" ? "live rate" : exchangeRates.source === "cached" ? "cached rate" : "static rate"}</span></p>}
                    </label>
                    {!session && <p className="ja-app-settings-warning">Sign in to sync cap across devices. Currently saved to this device only.</p>}
                    <p className="ja-app-settings-helper">When set, an alert appears on the Budget page if cash+debit spending exceeds this cap.{budgetCapPhp > 0 && <> Currently capped at <strong>{formatPhp(budgetCapPhp)}</strong>.</>}</p>
                  </div>
                </div>
              </div>,
              { routeKey: "/settings" }
            )}
          </Route>
          <Redirect to="/" />
        </IonRouterOutlet>

        <IonTabBar slot="bottom" className="ja-ion-tab-bar no-print">
          <IonTabButton tab="itinerary" href="/" onClick={(event) => { event.preventDefault(); navigateTo("/"); }}>
            <IonIcon icon={calendarOutline} />
            <IonLabel>Itinerary</IonLabel>
          </IonTabButton>
          <IonTabButton tab="budget" href="/budget" onClick={(event) => { event.preventDefault(); navigateTo("/budget"); }}>
            <IonIcon icon={walletOutline} />
            <IonLabel>Budget</IonLabel>
          </IonTabButton>
          <IonTabButton tab="map" href="/map" onClick={(event) => { event.preventDefault(); navigateTo("/map"); }}>
            <IonIcon icon={mapOutline} />
            <IonLabel>Map</IonLabel>
          </IonTabButton>
          <IonTabButton tab="diary" href="/diary" onClick={(event) => { event.preventDefault(); navigateTo("/diary"); }}>
            <IonIcon icon={bookOutline} />
            <IonLabel>Diary</IonLabel>
          </IonTabButton>
          <IonTabButton
            tab="more"
            onClick={(event) => {
              event.preventDefault();
              window.dispatchEvent(new CustomEvent("open-more-drawer"));
            }}
          >
            <IonIcon icon={menuOutline} />
            <IonLabel>More</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>

      <AuthPanel
        open={showAuthModal}
        title={session ? "Manage your account" : "Sign in to sync your trip"}
        description={session ? "Your cloud sync is active for budget, checklist, notes, map, and diary data." : "Choose Google, GitHub, or Facebook to enable shared budget, checklist, notes, map, and diary sync."}
        session={session}
        loading={!authReady}
        errorMessage={authError}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isConfigured={hasSupabaseConfig}
      />

      <DestinationInfoModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />

      <SettingsModal
        open={showSettingsModal && settingsLoaded}
        onClose={() => {
          if (isFirstSetup) return;
          setShowSettingsModal(false);
          if (activeRoute === "/settings") {
            navigateTo("/budget");
          }
        }}
        session={session}
        currentUser={currentUser}
        settings={userSettings}
        onSave={handleSaveSettings}
        isSaving={isSavingSettings}
        isFirstSetup={isFirstSetup}
        budgetCapPhp={budgetCapPhp}
        onBudgetCapChange={setBudgetCapPhp}
        budgetCapRmLabel={phpToRm(budgetCapPhp)}
        budgetCapStatusLabel={
          exchangeRates.source === "live"
            ? "live rate"
            : exchangeRates.source === "cached"
              ? "cached rate"
              : "static rate"
        }
      />

      <button
        type="button"
        onClick={() => scrollContentToTop(300)}
        aria-label="Scroll to top"
        className={`ja-app-scroll-btn${showScrollTop ? " ja-app-scroll-visible" : ""}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
    </>
  );
}

export default function App() {
  return (
    <IonApp>
      {/* @ts-expect-error IonReactRouterProps children type gap with React 19 JSX */}
      <IonReactRouter>
        <AppShell />
      </IonReactRouter>
    </IonApp>
  );
}

