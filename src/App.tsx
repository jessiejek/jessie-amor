import React, { useEffect, useRef, useState } from "react";
import { CreditCard, Compass, Ticket, Utensils } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import {
  buildGuideForItem,
  selectedItinerary,
  type DestinationGuide,
  type TimelineItemData,
} from "./data/code1Itinerary";
import { defaultExpenses, initialNotes } from "./data/itinerary";
import { Expense, TravelNote, ChecklistItem } from "./types";
import {
  hasSupabaseConfig,
  supabase,
  supabaseExpenseTable,
  supabaseChecklistTable,
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
};

type SupabaseChecklistRow = {
  id: string;
  trip_key: string;
  text: string;
  completed: boolean;
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
});

const checklistToRow = (item: ChecklistItem): SupabaseChecklistRow => ({
  id: item.id,
  trip_key: tripKey,
  text: item.text,
  completed: item.completed,
});

const rowToChecklist = (row: SupabaseChecklistRow): ChecklistItem => ({
  id: row.id,
  text: row.text,
  completed: Boolean(row.completed),
});

export default function App() {
  const itinerary = selectedItinerary;
  const routeFromPath = (pathname: string) => {
    if (pathname === "/budget") return "/budget";
    if (pathname === "/map") return "/map";
    if (pathname === "/notes") return "/notes";
    return "/";
  };

  const [activeRoute, setActiveRoute] = useState<string>(() => {
    if (typeof window === "undefined") return "/";
    return routeFromPath(window.location.pathname);
  });
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(!supabase);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showLiveSpends, setShowLiveSpends] = useState<boolean>(false);
  const [selectedGuide, setSelectedGuide] = useState<DestinationGuide | null>(null);
  const [expensesLoaded, setExpensesLoaded] = useState<boolean>(!hasSupabaseConfig);
  const [checklistLoaded, setChecklistLoaded] = useState<boolean>(!hasSupabaseConfig);
  const expenseSignatureRef = useRef<string>("");
  const checklistSignatureRef = useRef<string>("");

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const cached = localStorage.getItem("travel_budget_expenses");
    return cached ? JSON.parse(cached) : defaultExpenses;
  });

  const [notes, setNotes] = useState<TravelNote[]>(() => {
    const cached = localStorage.getItem("travel_scratch_notes");
    return cached ? JSON.parse(cached) : initialNotes;
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const cached = localStorage.getItem("travel_checklist_items");
    return cached
      ? JSON.parse(cached)
      : [
          { id: "c-1", text: "Buy Touch 'n Go cards at KL Sentral Station", completed: true },
          { id: "c-2", text: "Pre-book Malacca Sunday buses (use BusOnlineTicket.com)", completed: false },
          { id: "c-3", text: "Ensure Grab app has valid credit card loaded", completed: true },
          { id: "c-4", text: "Pre-pack proper outfit (no shorts) for Batu Caves steps", completed: false },
          { id: "c-5", text: "Download offline Kuala Lumpur map on Google Maps", completed: true },
          { id: "c-6", text: "Try authentic Melaka Nyonya laksa on Jonker Walk", completed: false },
        ];
  });

  useEffect(() => {
    localStorage.setItem("travel_budget_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("travel_scratch_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("travel_checklist_items", JSON.stringify(checklist));
  }, [checklist]);

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
    if (!supabase || !authReady || !session) {
      setExpensesLoaded(true);
      setChecklistLoaded(true);
      return;
    }

    let cancelled = false;

    const loadSyncedData = async () => {
      const [expenseResult, checklistResult] = await Promise.all([
        supabase
          .from(supabaseExpenseTable)
          .select("id, trip_key, day, category, item, amount, paid_with, original_amount, original_currency")
          .eq("trip_key", tripKey)
          .order("day", { ascending: true })
          .order("item", { ascending: true }),
        supabase
          .from(supabaseChecklistTable)
          .select("id, trip_key, text, completed")
          .eq("trip_key", tripKey)
          .order("id", { ascending: true }),
      ]);

      if (cancelled) return;

      const { data: expenseData, error: expenseError } = expenseResult;
      const { data: checklistData, error: checklistError } = checklistResult;

      if (expenseError) {
        console.warn("Supabase expense load failed:", expenseError.message);
      } else if (expenseData && expenseData.length > 0) {
        const remoteExpenses = expenseData.map((row) => rowToExpense(row as SupabaseExpenseRow));
        expenseSignatureRef.current = JSON.stringify(remoteExpenses);
        setExpenses(remoteExpenses);
      } else {
        const localSignature = JSON.stringify(expenses);
        const payload = expenses.map(expenseToRow);
        const { error: seedError } = await supabase.from(supabaseExpenseTable).upsert(payload, { onConflict: "id" });
        if (seedError) {
          console.warn("Supabase expense seed failed:", seedError.message);
        } else {
          expenseSignatureRef.current = localSignature;
        }
      }

      if (checklistError) {
        console.warn("Supabase checklist load failed:", checklistError.message);
      } else if (checklistData && checklistData.length > 0) {
        const remoteChecklist = checklistData.map((row) => rowToChecklist(row as SupabaseChecklistRow));
        checklistSignatureRef.current = JSON.stringify(remoteChecklist);
        setChecklist(remoteChecklist);
      } else {
        const localSignature = JSON.stringify(checklist);
        const payload = checklist.map(checklistToRow);
        const { error: seedError } = await supabase.from(supabaseChecklistTable).upsert(payload, { onConflict: "id" });
        if (seedError) {
          console.warn("Supabase checklist seed failed:", seedError.message);
        } else {
          checklistSignatureRef.current = localSignature;
        }
      }

      setExpensesLoaded(true);
      setChecklistLoaded(true);
    };

    loadSyncedData();

    return () => {
      cancelled = true;
    };
  }, [authReady, session]);

  useEffect(() => {
    if (!supabase || !authReady || !session || !expensesLoaded) return;

    const currentSignature = JSON.stringify(expenses);
    if (currentSignature === expenseSignatureRef.current) return;

    const timeout = window.setTimeout(async () => {
      const { error } = await supabase
        .from(supabaseExpenseTable)
        .upsert(expenses.map(expenseToRow), { onConflict: "id" });

      if (error) {
        console.warn("Supabase expense sync failed:", error.message);
        return;
      }

      expenseSignatureRef.current = currentSignature;
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [expenses, expensesLoaded, authReady, session]);

  useEffect(() => {
    if (!supabase || !authReady || !session || !checklistLoaded) return;

    const currentSignature = JSON.stringify(checklist);
    if (currentSignature === checklistSignatureRef.current) return;

    const timeout = window.setTimeout(async () => {
      const { error } = await supabase
        .from(supabaseChecklistTable)
        .upsert(checklist.map(checklistToRow), { onConflict: "id" });

      if (error) {
        console.warn("Supabase checklist sync failed:", error.message);
        return;
      }

      checklistSignatureRef.current = currentSignature;
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [checklist, checklistLoaded, authReady, session]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveRoute(routeFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const metadata = {
    title: "Jessie & Amor's Malaysia Singapore",
    description: itinerary.hero.subtitle,
    sub: "2 people | Travelodge KL City Centre | RM1 = PHP 15.56",
    rate: "RM 1 = PHP 15.56",
  };

  const handleOpenGuide = (item: TimelineItemData) => {
    setSelectedGuide(buildGuideForItem(item));
  };

  const handleSignIn = async (provider: "google" | "facebook") => {
    if (!supabase) return;

    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.warn("Supabase sign-in failed:", error.message);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn("Supabase sign-out failed:", error.message);
    }
  };

  const navigateTo = (path: string) => {
    if (path === activeRoute) return;
    window.history.pushState({}, "", path);
    setActiveRoute(routeFromPath(path));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-stone-50 text-stone-850 selection:bg-[#88B04B]/35 selection:text-[#0b3530]">
      <Navigation
        activeTab={activeRoute}
        setActiveTab={navigateTo}
        metadata={metadata}
        session={session}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      <main className="flex-1">
        {activeRoute === "/" && (
          <div className="animate-in fade-in duration-300">
            <Hero hero={itinerary.hero} />
            <Legend items={itinerary.legend} />
            <DailyItineraryView days={itinerary.days} onInfoClick={handleOpenGuide} />
            <BudgetSummaryHeader
              cards={itinerary.budgetSummary}
              expenses={expenses}
              showLiveSpends={showLiveSpends}
              setShowLiveSpends={setShowLiveSpends}
            />
            <AlertBox alert={itinerary.alert} />

            <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 no-print">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-[#0B3530]">Trip Tips</h3>
                  <p className="mt-1 text-xs font-sans text-stone-500">
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
                  <p className="text-xs text-stone-500 font-sans mt-1">
                    Smart hacks and safety strategies recommended by our logistics team
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0B3530] text-[#88B04B] flex items-center justify-center mb-4">
                      <CreditCard size={20} />
                    </div>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 mb-2">Touch 'n Go Card</h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      The essential card for all transit. Buy at KL Sentral for seamless boarding and discounted fares.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0B3530] text-[#88B04B] flex items-center justify-center mb-4">
                      <Ticket size={20} />
                    </div>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 mb-2">Advance Booking</h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      Malacca buses fill quickly on Sundays. Use BusOnlineTicket.com to secure your 8 AM slot.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0B3530] text-[#88B04B] flex items-center justify-center mb-4">
                      <Utensils size={20} />
                    </div>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 mb-2">Street Food Strategy</h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
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
                  <p className="text-[10px] font-mono tracking-widest text-[#88B04B] font-bold mt-1 uppercase">
                    INTERACTIVE MAP NOW ACTIVE
                  </p>
                  <p className="text-[10px] text-stone-400 font-sans mt-1">Click to browse custom plotted transit markers</p>
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
          />
        )}
        {activeRoute === "/map" && <MapTab />}
        {activeRoute === "/notes" && <NotesTab notes={notes} setNotes={setNotes} checklist={checklist} setChecklist={setChecklist} />}
      </main>

      <AuthPanel
        open={showAuthModal}
        title={session ? "Manage your account" : "Sign in to sync your trip"}
        description={session ? "Your cloud sync is active for budget and checklist data." : "Choose Google or Facebook to enable shared budget and checklist sync."}
        session={session}
        loading={!authReady}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <footer className="bg-[#041D1A] text-stone-400 py-14 px-4 md:px-8 border-t border-[#0B3530] no-print">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-[10px] tracking-widest text-[#88B04B] font-mono block uppercase">TRAVEL LOGIX</span>
            <h3 className="text-lg font-serif font-bold text-white leading-tight mt-2 max-w-xs">
              Curating unforgettable Asian experiences.
            </h3>
            <p className="text-xs text-stone-500 font-sans leading-relaxed mt-4 max-w-xs">
              {itinerary.footer}
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Navigation</h4>
              <ul className="space-y-2 text-xs font-sans">
                <li><button onClick={() => navigateTo("/")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Daily Itinerary</button></li>
                <li><button onClick={() => navigateTo("/budget")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Budget Breakdown</button></li>
                <li><button onClick={() => navigateTo("/map")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Travel Map</button></li>
                <li><button onClick={() => navigateTo("/notes")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Custom Notes & Rules</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Resources</h4>
              <ul className="space-y-2 text-xs font-sans">
                <li><span className="text-stone-400">Transport Guide</span></li>
                <li><span className="text-stone-400">Dining Notes</span></li>
                <li><span className="text-stone-400">Safety Tips</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#0B3530] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-stone-500">
            <span>(c) 2026 TravelLogix. All rights reserved.</span>
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

