import React, { useState, useEffect } from "react";
import { CreditCard, Compass, Ticket, Utensils, HelpCircle, Navigation as NavIcon, Heart, Notebook } from "lucide-react";
import { defaultDayPlans, defaultExpenses, initialNotes } from "./data/itinerary";
import { Expense, TravelNote } from "./types";

import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import BudgetSummaryHeader from "./components/BudgetSummaryHeader";
import DailyItineraryView from "./components/DailyItineraryView";
import BudgetTab from "./components/BudgetTab";
import MapTab from "./components/MapTab";
import NotesTab from "./components/NotesTab";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("Itinerary");
  const [showLiveSpends, setShowLiveSpends] = useState<boolean>(false);

  // Load state from localStorage on init
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const cached = localStorage.getItem("travel_budget_expenses");
    return cached ? JSON.parse(cached) : defaultExpenses;
  });

  const [notes, setNotes] = useState<TravelNote[]>(() => {
    const cached = localStorage.getItem("travel_scratch_notes");
    return cached ? JSON.parse(cached) : initialNotes;
  });

  // Save states to localStorage on change
  useEffect(() => {
    localStorage.setItem("travel_budget_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("travel_scratch_notes", JSON.stringify(notes));
  }, [notes]);

  const metadata = {
    title: "Jessie and Amor's Malaysia Singapore Trip",
    description: "Custom corporate and historical travel itinerary layout",
    sub: "2 people • Travelodge KL City Centre • RM1 ≈ PHP 13.56",
    rate: "RM 1 = PHP 13.56"
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-850 flex flex-col justify-between selection:bg-[#88B04B]/35 selection:text-[#0b3530]">
      
      {/* Top Navbar Header */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} metadata={metadata} />

      {/* Main Panel Content Routing */}
      <main className="flex-1">
        {activeTab === "Itinerary" && (
          <div className="animate-in fade-in duration-300">
            {/* 1. Hero banner */}
            <Hero />

            {/* 2. Budget Executive Overview Cards */}
            <BudgetSummaryHeader
              dayPlans={defaultDayPlans}
              expenses={expenses}
              showLiveSpends={showLiveSpends}
              setShowLiveSpends={setShowLiveSpends}
            />

            {/* 3. Detailed Day Checks list */}
            <DailyItineraryView dayPlans={defaultDayPlans} />

            {/* 4. Pro-Traveler Insights (Grid matching screenshot) */}
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
                  {/* Insight 1 */}
                  <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0B3530] text-[#88B04B] flex items-center justify-center mb-4">
                      <CreditCard size={20} />
                    </div>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 mb-2">Touch 'n Go Card</h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      The essential card for all transit. Buy at KL Sentral for seamless boarding and discounted fares.
                    </p>
                  </div>

                  {/* Insight 2 */}
                  <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0B3530] text-[#88B04B] flex items-center justify-center mb-4">
                      <Ticket size={20} />
                    </div>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 mb-2">Advance Booking</h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      Malacca buses fill quickly on Sundays. Use BusOnlineTicket.com to secure your 8 AM slot.
                    </p>
                  </div>

                  {/* Insight 3 */}
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

            {/* 5. Explore KL Interactive Teaser map block */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 no-print">
              <div
                onClick={() => setActiveTab("Map")}
                className="relative overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[16/5] bg-stone-100 border border-stone-200 flex flex-col items-center justify-center cursor-pointer group shadow-xs hover:border-[#88B04B]/60 transition-all text-center p-6"
              >
                {/* Visual grid backdrop lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
                
                {/* Mini coordinates floating circles */}
                <div className="absolute top-[20%] left-[30%] w-3 h-3 rounded-full bg-stone-300"></div>
                <div className="absolute top-[50%] left-[70%] w-3 h-3 rounded-full bg-[#88B04B]/60"></div>
                <div className="absolute top-[30%] left-[60%] w-3 h-3 rounded-full bg-[#0B3530]/40"></div>
                <div className="absolute top-[70%] left-[25%] w-3 h-3 rounded-full bg-stone-400"></div>

                {/* Card overlay */}
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

        {activeTab === "Budget" && (
          <BudgetTab expenses={expenses} setExpenses={setExpenses} />
        )}

        {activeTab === "Map" && (
          <MapTab />
        )}

        {activeTab === "Notes" && (
          <NotesTab notes={notes} setNotes={setNotes} />
        )}
      </main>

      {/* Styled Footer */}
      <footer className="bg-[#041D1A] text-stone-400 py-14 px-4 md:px-8 border-t border-[#0B3530] no-print">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-[10px] tracking-widest text-[#88B04B] font-mono block uppercase">TRAVEL LOGIX</span>
            <h3 className="text-lg font-serif font-bold text-white leading-tight mt-2 max-w-xs">
              Curating unforgettable Asian experiences.
            </h3>
            <p className="text-xs text-stone-500 font-sans leading-relaxed mt-4 max-w-xs">
              Custom itinerary designed specifically for Jessie and Amor's 2024 journey.
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Navigation</h4>
              <ul className="space-y-2 text-xs font-sans">
                <li><button onClick={() => setActiveTab("Itinerary")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Daily Itinerary</button></li>
                <li><button onClick={() => setActiveTab("Budget")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Budget Breakdown</button></li>
                <li><button onClick={() => setActiveTab("Map")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Travel Map</button></li>
                <li><button onClick={() => setActiveTab("Notes")} className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF]">Custom Notes & Rules</button></li>
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
          <span>© 2024 TravelLogix. All rights reserved.</span>
          <div className="flex gap-4 mt-2 sm:mt-0 font-sans">
            <span className="hover:text-stone-400">Privacy</span>
            <span className="hover:text-stone-400">Support</span>
            <span className="hover:text-stone-400">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
