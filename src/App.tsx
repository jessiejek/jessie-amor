import React, { useEffect, useRef, useState } from "react";
import { CreditCard, Compass, Loader2, Printer, RefreshCw, Share2, Ticket, Utensils, LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import {
  buildGuideForItem,
  selectedItinerary,
  type DestinationGuide,
  type TimelineItemData,
} from "./data/code1Itinerary";
import { Expense, TravelNote, ChecklistItem } from "./types";
import {
  hasSupabaseConfig,
  supabase,
  supabaseExpenseTable,
  supabaseChecklistTable,
  supabaseNotesTable,
  tripKey,
} from "./lib/supabase";

import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import BudgetSummaryHeader from "./components/BudgetSummaryHeader";
import DailyItineraryView from "./components/DailyItineraryView";
import BudgetTab from "./components/BudgetTab";
import MapTab from "./components/MapTab";
import NotesTab from "./components/NotesTab";
import Legend from "./components/Legend";
import AlertBox from "./components/AlertBox";
import TipCard from "./components/TipCard";
import DestinationInfoModal from "./components/DestinationInfoModal";
import AuthPanel from "./components/AuthPanel";
import { useLiveExchangeRates } from "./lib/exchangeRates";

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

type SavedByInfo = {
  userId: string;
  email: string;
};

const expenseToRow = (expense: Expense, savedBy: SavedByInfo | null): SupabaseExpenseRow => ({
  id: expense.id,
  trip_key: tripKey,
  day: expense.day,
  category: expense.category,
  item: expense.item,
  amount: expense.amount,
  paid_with: expense.paidWith,
  original_amount: expense.originalAmount ?? null,
  original_currency: expense.originalCurrency ?? null,
  saved_by_user_id: savedBy?.userId ?? expense.savedByUserId ?? null,
  saved_by_email: savedBy?.email ?? expense.savedByEmail ?? null,
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
  savedByUserId: row.saved_by_user_id ?? undefined,
  savedByEmail: row.saved_by_email ?? undefined,
  createdAt: row.created_at ?? row.updated_at,
});

const checklistToRow = (item: ChecklistItem, savedBy: SavedByInfo | null): SupabaseChecklistRow => ({
  id: item.id,
  trip_key: tripKey,
  text: item.text,
  completed: item.completed,
  saved_by_user_id: savedBy?.userId ?? item.savedByUserId ?? null,
  saved_by_email: savedBy?.email ?? item.savedByEmail ?? null,
  updated_at: new Date().toISOString(),
});

  const rowToChecklist = (row: SupabaseChecklistRow): ChecklistItem => ({
    id: row.id,
    text: row.text,
    completed: Boolean(row.completed),
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

export default function App() {
  const PULL_REFRESH_TRIGGER = 84;
  const PULL_REFRESH_MAX = 108;
  const itinerary = selectedItinerary;
  const exchangeRates = useLiveExchangeRates();
  const routeFromPath = (pathname: string) => {
    if (pathname === "/budget") return "/budget";
    if (pathname === "/map") return "/map";
    if (pathname === "/notes") return "/notes";
    if (pathname === "/account") return "/account";
    return "/";
  };

  const [activeRoute, setActiveRoute] = useState<string>(() => {
    if (typeof window === "undefined") return "/";
    return routeFromPath(window.location.pathname);
  });
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(!supabase);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [showLiveSpends, setShowLiveSpends] = useState<boolean>(false);
  const [selectedGuide, setSelectedGuide] = useState<DestinationGuide | null>(null);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [expensesLoaded, setExpensesLoaded] = useState<boolean>(!hasSupabaseConfig);
  const [checklistLoaded, setChecklistLoaded] = useState<boolean>(!hasSupabaseConfig);
  const [notesLoaded, setNotesLoaded] = useState<boolean>(!hasSupabaseConfig);
  const expenseSignatureRef = useRef<string>("");
  const checklistSignatureRef = useRef<string>("");
  const notesSignatureRef = useRef<string>("");
  const expenseIdsRef = useRef<string[]>([]);
  const checklistIdsRef = useRef<string[]>([]);
  const pullStartYRef = useRef<number | null>(null);
  const isPullingRef = useRef<boolean>(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notes, setNotes] = useState<TravelNote[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const currentSavedBy: SavedByInfo | null = session?.user
    ? {
        userId: session.user.id,
        email: session.user.email ?? "",
      }
    : null;
  const pullProgress = Math.min(1, pullDistance / PULL_REFRESH_TRIGGER);
  const pullCanRefresh = pullDistance >= PULL_REFRESH_TRIGGER;
  const pullUiScale = 0.96 + pullProgress * 0.04;

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
        setSession(data.session);
        setAuthReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthReady(true);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !authReady) {
      setExpenses([]);
      setChecklist([]);
      setNotes([]);
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
      } else if (expenseData && expenseData.length > 0) {
        const remoteExpenses = expenseData.map((row) => rowToExpense(row as SupabaseExpenseRow));
        expenseSignatureRef.current = JSON.stringify(remoteExpenses);
        expenseIdsRef.current = remoteExpenses.map((expense) => expense.id);
        setExpenses(remoteExpenses);
      } else {
        expenseSignatureRef.current = "[]";
        expenseIdsRef.current = [];
        setExpenses([]);
      }

      if (checklistError) {
        console.warn("Supabase checklist load failed:", checklistError.message);
      } else if (checklistData && checklistData.length > 0) {
        const remoteChecklist = checklistData.map((row) => rowToChecklist(row as SupabaseChecklistRow));
        checklistSignatureRef.current = JSON.stringify(remoteChecklist);
        checklistIdsRef.current = remoteChecklist.map((item) => item.id);
        setChecklist(remoteChecklist);
      } else {
        checklistSignatureRef.current = "[]";
        checklistIdsRef.current = [];
        setChecklist([]);
      }

      if (notesError) {
        console.warn("Supabase notes load failed:", notesError.message);
      } else if (notesData?.notes && Array.isArray((notesData as SupabaseNotesRow).notes) && (notesData as SupabaseNotesRow).notes.length > 0) {
        const remoteNotes = (notesData as SupabaseNotesRow).notes;
        notesSignatureRef.current = JSON.stringify(remoteNotes);
        setNotes(remoteNotes);
      } else {
        notesSignatureRef.current = "[]";
        setNotes([]);
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
            if (payload.eventType === "DELETE") {
              const deletedId = String(payload.old?.id ?? "");
              if (!deletedId) return;
              setExpenses((current) => current.filter((expense) => expense.id !== deletedId));
              return;
            }

            const row = payload.new as SupabaseExpenseRow;
            if (!row) return;
            setExpenses((current) => mergeExpenseRow(current, row));
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: supabaseChecklistTable, filter: `trip_key=eq.${tripKey}` },
          (payload) => {
            if (payload.eventType === "DELETE") {
              const deletedId = String(payload.old?.id ?? "");
              if (!deletedId) return;
              setChecklist((current) => current.filter((item) => item.id !== deletedId));
              return;
            }

            const row = payload.new as SupabaseChecklistRow;
            if (!row) return;
            setChecklist((current) => mergeChecklistRow(current, row));
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: supabaseNotesTable, filter: `trip_key=eq.${tripKey}` },
          (payload) => {
            if (payload.eventType === "DELETE") {
              setNotes([]);
              return;
            }

            const row = payload.new as SupabaseNotesRow | undefined;
            if (!row || !Array.isArray(row.notes)) return;
            setNotes(row.notes);
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
  }, [authReady, session]);

  useEffect(() => {
    if (!supabase || !authReady || !session || !expensesLoaded) return;

    const payload = expenses.map((expense) => expenseToRow(expense, currentSavedBy));
    const currentSignature = JSON.stringify(
      payload.map(({ updated_at: _updatedAt, ...row }) => row),
    );
    const currentIds = expenses.map((expense) => expense.id);
    const removedIds = expenseIdsRef.current.filter((id) => !currentIds.includes(id));
    if (currentSignature === expenseSignatureRef.current && removedIds.length === 0) return;

    const timeout = window.setTimeout(async () => {
      const writePayload = payload.map((row) => ({
        ...row,
        updated_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from(supabaseExpenseTable)
        .upsert(writePayload, { onConflict: "id" });

      if (upsertError) {
        console.warn("Supabase expense sync failed:", upsertError.message);
        return;
      }

      if (removedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from(supabaseExpenseTable)
          .delete()
          .in("id", removedIds);

        if (deleteError) {
          console.warn("Supabase expense delete failed:", deleteError.message);
          return;
        }
      }

      expenseSignatureRef.current = currentSignature;
      expenseIdsRef.current = currentIds;
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [expenses, expensesLoaded, authReady, session]);

  useEffect(() => {
    if (!supabase || !authReady || !session || !checklistLoaded) return;

    const payload = checklist.map((item) => checklistToRow(item, currentSavedBy));
    const currentSignature = JSON.stringify(
      payload.map(({ updated_at: _updatedAt, ...row }) => row),
    );
    const currentIds = checklist.map((item) => item.id);
    const removedIds = checklistIdsRef.current.filter((id) => !currentIds.includes(id));
    if (currentSignature === checklistSignatureRef.current && removedIds.length === 0) return;

    const timeout = window.setTimeout(async () => {
      const writePayload = payload.map((row) => ({
        ...row,
        updated_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from(supabaseChecklistTable)
        .upsert(writePayload, { onConflict: "id" });

      if (upsertError) {
        console.warn("Supabase checklist sync failed:", upsertError.message);
        return;
      }

      if (removedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from(supabaseChecklistTable)
          .delete()
          .in("id", removedIds);

        if (deleteError) {
          console.warn("Supabase checklist delete failed:", deleteError.message);
          return;
        }
      }

      checklistSignatureRef.current = currentSignature;
      checklistIdsRef.current = currentIds;
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [checklist, checklistLoaded, authReady, session]);

  useEffect(() => {
    if (!supabase || !authReady || !session || !notesLoaded) return;

    const payload = {
      trip_key: tripKey,
      notes: notes.map((note) => ({
        ...note,
        savedByUserId: currentSavedBy?.userId ?? note.savedByUserId ?? undefined,
        savedByEmail: currentSavedBy?.email ?? note.savedByEmail ?? undefined,
      })),
      saved_by_user_id: currentSavedBy?.userId ?? null,
      saved_by_email: currentSavedBy?.email ?? null,
    };
    const currentSignature = JSON.stringify(payload);
    if (currentSignature === notesSignatureRef.current) return;

    const timeout = window.setTimeout(async () => {
      const writePayload = {
        ...payload,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from(supabaseNotesTable)
        .upsert(writePayload, { onConflict: "trip_key" });

      if (error) {
        console.warn("Supabase notes sync failed:", error.message);
        return;
      }

      notesSignatureRef.current = currentSignature;
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [notes, notesLoaded, authReady, session]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveRoute(routeFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const metadata = {
    title: "J&A Malaysia · Singapore Trip 2026",
    description: itinerary.hero.subtitle,
  };

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
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      console.warn("Supabase sign-out failed:", error.message);
    }
  };

  const navigateTo = (path: string) => {
    if (path === activeRoute) return;
    window.history.pushState({}, "", path);
    setActiveRoute(routeFromPath(path));
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const canUsePullRefresh = () =>
    typeof window !== "undefined"
    && window.innerWidth < 768
    && window.scrollY <= 0
    && !showAuthModal
    && !isRefreshing;

  const resetPullRefresh = () => {
    pullStartYRef.current = null;
    isPullingRef.current = false;
    setPullDistance(0);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1 || !canUsePullRefresh()) return;
    pullStartYRef.current = event.touches[0].clientY;
    isPullingRef.current = true;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isPullingRef.current || pullStartYRef.current == null) return;

    const rawDistance = event.touches[0].clientY - pullStartYRef.current;
    if (rawDistance <= 0) {
      setPullDistance(0);
      return;
    }

    const nextDistance = Math.min(PULL_REFRESH_MAX, rawDistance * 0.55);
    if (nextDistance > 12) {
      event.preventDefault();
    }
    setPullDistance(nextDistance);
  };

  const handleTouchEnd = () => {
    if (!isPullingRef.current) return;

    const shouldRefresh = pullDistance >= PULL_REFRESH_TRIGGER;
    if (shouldRefresh) {
      setIsRefreshing(true);
      setPullDistance(PULL_REFRESH_TRIGGER);
      window.setTimeout(() => {
        window.location.reload();
      }, 180);
      return;
    }

    resetPullRefresh();
  };

  const mobileAccountCard = session ? (
    <section className="md:hidden max-w-7xl mx-auto px-4 pt-4 pb-4 no-print">
          <div className="rounded-[10px] border border-[#ddd] bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7ec96b]/40 bg-[#7ec96b]/20 text-[14px] font-semibold text-[#7ec96b]">
                JA
              </div>
              <div className="min-w-0">
            <div className="text-[14px] font-medium text-[#1a3328]">Jessie Jayr</div>
            <div className="truncate text-[14px] text-[#888]">{session.user.email ?? "Signed in"}</div>
              </div>
            </div>

            <div className="mt-3 border-t border-[#eee] pt-2">
              <button
                type="button"
                onClick={handleShareTrip}
                className="flex w-full items-center gap-2 py-1.5 text-[14px] text-[#555]"
              >
                <Share2 size={14} />
                Share trip
              </button>
              <button
                type="button"
                onClick={handleMobilePrint}
                className="flex w-full items-center gap-2 py-1.5 text-[14px] text-[#555]"
              >
                <Printer size={14} />
                Print
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 py-1.5 text-[14px] text-[#d94f4f]"
              >
                <LogOut size={14} />
                Log out
              </button>
        </div>
      </div>
    </section>
  ) : (
    <section className="md:hidden max-w-7xl mx-auto px-4 pt-4 pb-4 no-print">
      <div className="rounded-[10px] border border-[#ddd] bg-white p-3 shadow-sm">
        <div className="text-[13px] font-medium text-[#1a3328]">Not signed in</div>
        <div className="mt-1 text-[13px] text-[#888]">Use the Login button above to sync your trip data.</div>
        <button
          type="button"
          onClick={() => setShowAuthModal(true)}
          className="mt-3 inline-flex items-center justify-center rounded-full bg-[#0B3530] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#18534C]"
        >
          Log in
        </button>
      </div>
    </section>
  );

  return (
    <div
      className="flex min-h-[100dvh] flex-col justify-between bg-stone-50 text-stone-850 selection:bg-[#88B04B]/35 selection:text-[#0b3530]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
        <div
          className={`pointer-events-none fixed left-1/2 top-0 z-[1600] -translate-x-1/2 transition-all duration-200 md:hidden ${
            pullDistance > 0 || isRefreshing ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translateX(-50%) translateY(${Math.max(8, pullDistance - 46)}px) scale(${pullUiScale})`,
          }}
        >
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A84FF]/10 text-[#0A84FF]">
              {isRefreshing ? (
                <Loader2 size={13} className="animate-spin" strokeWidth={2.2} />
              ) : (
                <RefreshCw
                  size={13}
                  strokeWidth={2.2}
                  className="transition-transform duration-150"
                  style={{
                    transform: `rotate(${pullProgress * 180}deg)`,
                  }}
                />
              )}
            </div>
            <span className="text-[11px] font-medium tracking-[0.01em] text-stone-700">
              {isRefreshing ? "Refreshing" : pullCanRefresh ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        </div>
        <Navigation
          activeTab={activeRoute}
          setActiveTab={navigateTo}
          metadata={metadata}
          session={session}
          onOpenAuth={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
        />

        <main
          className="flex-1 pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-0 pt-[112px] md:pt-0"
          style={{
            transform: pullDistance > 0 ? `translate3d(0, ${pullDistance * 0.28}px, 0)` : "translate3d(0, 0, 0)",
            transition: isPullingRef.current ? "none" : "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: pullDistance > 0 ? "transform" : "auto",
          }}
        >
          {activeRoute === "/account" && mobileAccountCard}
        {activeRoute === "/" && (
          <div className="animate-in fade-in duration-300">
            <div className="home-hero-section">
              <Hero hero={itinerary.hero} />
              <Legend items={itinerary.legend} />
            </div>
            <DailyItineraryView days={itinerary.days} onInfoClick={handleOpenGuide} />
            <BudgetSummaryHeader
              cards={itinerary.budgetSummary}
              expenses={expenses}
              showLiveSpends={showLiveSpends}
              setShowLiveSpends={setShowLiveSpends}
              exchangeRates={exchangeRates}
            />
            <AlertBox alert={itinerary.alert} />

            <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 no-print">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-[#0B3530]">Trip Tips</h3>
                  <p className="mt-1 text-[14px] font-sans text-stone-500">
                    Code 1's itinerary reminders, folded into Code 2's visual system.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {itinerary.tips.map((tip) => (
                  <TipCard key={tip.icon + tip.description.map((segment) => ("value" in segment ? segment.value : segment.label)).join("")} tip={tip} />
                ))}
              </div>
            </section>

            <section className="bg-stone-100/50 border-t border-b border-stone-200/50 py-12 px-4 md:px-8 no-print">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-[#0B3530]">
                    Pro-Traveler Insights
                  </h3>
                  <p className="text-[14px] text-stone-500 font-sans mt-1">
                    Smart hacks and safety strategies recommended by our logistics team
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0B3530] text-[#88B04B] flex items-center justify-center mb-4">
                      <CreditCard size={20} />
                    </div>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 mb-2">Touch 'n Go Card</h4>
                    <p className="text-[14px] text-stone-500 font-sans leading-relaxed">
                      The essential card for all transit. Buy at KL Sentral for seamless boarding and discounted fares.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0B3530] text-[#88B04B] flex items-center justify-center mb-4">
                      <Ticket size={20} />
                    </div>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 mb-2">Advance Booking</h4>
                    <p className="text-[14px] text-stone-500 font-sans leading-relaxed">
                      Malacca buses fill quickly on Sundays. Use BusOnlineTicket.com to secure your 8 AM slot.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0B3530] text-[#88B04B] flex items-center justify-center mb-4">
                      <Utensils size={20} />
                    </div>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 mb-2">Street Food Strategy</h4>
                    <p className="text-[14px] text-stone-500 font-sans leading-relaxed">
                      At Jalan Alor, stick to grilled skewers and local satay. Avoid the overpriced seafood platters.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 no-print">
              <div
                onClick={() => navigateTo("/map")}
                className="relative cursor-pointer overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[16/5] bg-stone-100 border border-stone-200 flex flex-col items-center justify-center group shadow-xs hover:border-[#88B04B]/60 transition-all text-center p-6"
              >
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>

                <div className="absolute top-[20%] left-[30%] w-3 h-3 rounded-full bg-stone-300"></div>
                <div className="absolute top-[50%] left-[70%] w-3 h-3 rounded-full bg-[#88B04B]/60"></div>
                <div className="absolute top-[30%] left-[60%] w-3 h-3 rounded-full bg-[#0B3530]/40"></div>
                <div className="absolute top-[70%] left-[25%] w-3 h-3 rounded-full bg-stone-400"></div>

                <div className="relative bg-white/95 backdrop-blur-sm rounded-xl py-4 px-6 md:px-8 border border-stone-100 max-w-sm shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Compass className="text-[#0B3530] mx-auto mb-2 animate-spin-slow" size={24} />
                  <h4 className="text-sm font-serif font-black text-stone-800 tracking-tight">Explore Kuala Lumpur</h4>
                  <p className="text-[13px] font-mono tracking-widest text-[#88B04B] font-bold mt-1 uppercase">
                    INTERACTIVE MAP NOW ACTIVE
                  </p>
                  <p className="text-[13px] text-stone-400 font-sans mt-1">Click to browse custom plotted transit markers</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeRoute === "/budget" && (
          <BudgetTab
            expenses={expenses}
            setExpenses={setExpenses}
            isSupabaseConnected={Boolean(supabase && session)}
            canEdit={Boolean(session)}
            exchangeRates={exchangeRates}
            currentSavedBy={currentSavedBy}
          />
        )}
        {activeRoute === "/map" && <MapTab session={session} canEdit={Boolean(session)} />}
        {activeRoute === "/notes" && (
          <NotesTab
            notes={notes}
            setNotes={setNotes}
            checklist={checklist}
            setChecklist={setChecklist}
            canEdit={Boolean(session)}
            currentSavedBy={currentSavedBy}
          />
        )}
      </main>

      <AuthPanel
        open={showAuthModal}
        title={session ? "Manage your account" : "Sign in to sync your trip"}
        description={session ? "Your cloud sync is active for budget and checklist data." : "Choose Google, GitHub, or Facebook to enable shared budget and checklist sync."}
        session={session}
        loading={!authReady}
        errorMessage={authError}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isConfigured={hasSupabaseConfig}
      />

      <footer className="bg-[#041D1A] text-stone-400 py-14 pb-[calc(8rem+env(safe-area-inset-bottom))] px-4 md:px-8 md:pb-14 border-t border-[#0B3530] no-print">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[18px] font-serif font-bold text-white leading-tight mt-2 max-w-xs">
              Curating unforgettable Asian experiences.
            </h3>
            <p className="text-[14px] text-stone-500 font-sans leading-relaxed mt-4 max-w-xs">
              {itinerary.footer}
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-[14px] font-bold text-white uppercase tracking-wider font-mono mb-4">Navigation</h4>
              <ul className="space-y-2 text-[14px] font-sans">
                <li><button onClick={() => navigateTo("/")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Daily Itinerary</button></li>
                <li><button onClick={() => navigateTo("/budget")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Budget Breakdown</button></li>
                <li><button onClick={() => navigateTo("/map")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Travel Map</button></li>
                <li><button onClick={() => navigateTo("/notes")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Custom Notes & Rules</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[14px] font-bold text-white uppercase tracking-wider font-mono mb-4">Resources</h4>
              <ul className="space-y-2 text-[14px] font-sans">
                <li><span className="text-stone-400">Transport Guide</span></li>
                <li><span className="text-stone-400">Dining Notes</span></li>
                <li><span className="text-stone-400">Safety Tips</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#0B3530] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-[12px] font-mono text-stone-500">
          <span>(c) 2026 Jessie & Amor. All rights reserved.</span>
          <div className="flex gap-4 mt-2 sm:mt-0 font-sans">
            <span className="hover:text-stone-400">Privacy</span>
            <span className="hover:text-stone-400">Support</span>
            <span className="hover:text-stone-400">Terms</span>
          </div>
        </div>
      </footer>

      <DestinationInfoModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
    </div>
  );
}

