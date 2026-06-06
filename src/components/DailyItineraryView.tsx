import React from "react";
import { Train, Bus, Bed, Utensils, Landmark, MapPin, Navigation, MapIcon, ChevronRight, Clock, Info } from "lucide-react";
import { DayPlan, ItineraryItem } from "../types";

interface DailyItineraryViewProps {
  dayPlans: DayPlan[];
}

export default function DailyItineraryView({ dayPlans }: DailyItineraryViewProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "transport":
        return <Train size={15} className="text-blue-600" />;
      case "accommodation":
        return <Bed size={15} className="text-amber-600" />;
      case "food":
        return <Utensils size={15} className="text-rose-600" />;
      default:
        return <MapPin size={15} className="text-emerald-600" />;
    }
  };

  const getDayBadgeStyle = (badge: string) => {
    if (badge.indexOf("WALK") !== -1) return "bg-stone-100 text-stone-600";
    if (badge.indexOf("TRANSIT") !== -1) return "bg-amber-100 text-amber-800";
    return "bg-sky-100 text-sky-800";
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 bg-stone-50 pb-20">
      
      {/* Executive Header Section */}
      <div className="flex justify-between items-center border-b border-stone-200 pb-4 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-serif text-[#0B3530] font-bold">
            Daily Itinerary
          </h2>
          <p className="text-xs text-stone-400 font-sans mt-0.5">
            Detailed timeline and excursion checkpoints
          </p>
        </div>
        <div className="flex gap-2 font-mono text-[10px] font-bold uppercase select-none">
          <span className="px-2 py-1 bg-[#0B3530] text-[#88B04B] rounded-md">4 DAYS</span>
          <span className="px-2 py-1 bg-[#18534C]/15 text-[#0B3530] rounded-md">2 CITIES</span>
        </div>
      </div>

      <div className="space-y-14">
        
        {/* ==================== DAY 12 ==================== */}
        <div>
          {/* Day Title bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#0B3530] flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-lg font-serif font-bold text-white leading-none">12</span>
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-850">
                {dayPlans[0].title}
              </h3>
              <p className="text-xs font-mono text-stone-400 mt-0.5 flex items-center gap-1.5">
                <span>{dayPlans[0].budgetRange}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${getDayBadgeStyle(dayPlans[0].badge)}`}>
                  {dayPlans[0].badge}
                </span>
              </p>
            </div>
          </div>

          {/* Timeline points list */}
          <div className="relative pl-6 border-l-2 border-stone-200 space-y-6 ml-6">
            
            {/* Item 1 - Arrival */}
            <div className="relative">
              {/* Timeline indicator circle */}
              <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full border-4 border-stone-50 bg-[#88B04B] shadow-xs"></div>
              
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <span className="w-20 pt-3 text-xs font-mono text-stone-400 shrink-0 select-none">
                  01:30 AM
                </span>

                <div className="flex-1 bg-white border border-stone-200/60 rounded-xl p-4 md:p-5 flex justify-between items-start gap-4 hover:border-stone-300 transition-colors">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-mono text-[9px] font-bold uppercase tracking-wider">
                      {getIcon("transport")} TRANSPORT
                    </span>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 pt-1">
                      Arrive KLIA (airport)
                    </h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      Clear immigration, get baggage, and catch a Grab to the hotel. A smooth start to your journey.
                    </p>
                  </div>
                  
                  <div className="shrink-0 text-right">
                    <span className="inline-block text-[10px] font-semibold text-stone-400 bg-stone-100 rounded px-2 py-1 font-sans">
                      Credit Card <br />
                      <span className="text-[9px] text-stone-400 font-normal">Excluded from cash</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Item 2 - Hotel */}
            <div className="relative">
              <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full border-4 border-stone-50 bg-[#88B04B] shadow-xs"></div>
              
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <span className="w-20 pt-3 text-xs font-mono text-stone-400 shrink-0 select-none">
                  03:00 AM
                </span>

                <div className="flex-1 bg-white border border-stone-200/60 rounded-xl p-4 md:p-5 flex justify-between items-start gap-4 hover:border-stone-300 transition-colors">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-mono text-[9px] font-bold uppercase tracking-wider">
                      {getIcon("accommodation")} ACCOMMODATION
                    </span>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 pt-1">
                      Check in Travelodge (hotel)
                    </h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      Check-in at Travelodge KL City Centre. Leave your luggage or catch a few more hours of rest.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Item 3 - Breakfast */}
            <div className="relative">
              <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full border-4 border-stone-50 bg-[#88B04B] shadow-xs"></div>
              
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <span className="w-20 pt-3 text-xs font-mono text-stone-400 shrink-0 select-none">
                  08:00 AM
                </span>

                <div className="flex-1 bg-white border border-stone-200/60 rounded-xl p-4 md:p-5 flex justify-between items-start gap-4 hover:border-stone-300 transition-colors">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-800 rounded font-mono text-[9px] font-bold uppercase tracking-wider">
                      {getIcon("food")} BREAKFAST
                    </span>
                    <h4 className="text-sm font-semibold font-serif text-stone-800 pt-1">
                      Breakfast near Chinatown
                    </h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      Begin exploring the historic walking area. Remember the 1 shared coffee rule!
                    </p>
                  </div>

                  <div className="shrink-0 text-center bg-[#0B3530] text-stone-100 rounded-lg p-2 min-w-[100px] border border-[#18534C]">
                    <span className="block text-[8px] uppercase tracking-wider font-mono text-[#88B04B]">ESTIMATED</span>
                    <span className="block font-bold font-serif text-white text-xs py-0.5">RM 20–30</span>
                    <span className="block text-[8px] text-stone-300 font-sans">For 2 people</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ==================== DAY 13 ==================== */}
        <div>
          {/* Day Title bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#0B3530] flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-lg font-serif font-bold text-white leading-none">13</span>
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-850">
                {dayPlans[1].title}
              </h3>
              <p className="text-xs font-mono text-stone-400 mt-0.5 flex items-center gap-1.5">
                <span>{dayPlans[1].budgetRange}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${getDayBadgeStyle(dayPlans[1].badge)}`}>
                  {dayPlans[1].badge}
                </span>
              </p>
            </div>
          </div>

          {/* Cards Panel Grid (Dual layout matching screenshot) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ml-2 md:ml-16 mb-6">
            
            {/* Batu Caves Card Photo */}
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-stone-200 relative shadow-sm border border-stone-200/50 group">
              <img
                src="/src/assets/images/batu_caves_1780754522244.png"
                alt="Batu Caves golden Lord Murugan monument and colorful stairs"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent p-5">
                <span className="text-[9px] font-mono tracking-widest text-[#88B04B] font-bold block">MORNING ASCENT</span>
                <h4 className="text-lg font-serif text-white font-bold mt-1">Batu Caves Shrine</h4>
              </div>
            </div>

            {/* Saloma Link Bridge Card Photo */}
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-stone-200 relative shadow-sm border border-stone-200/50 group">
              <img
                src="/src/assets/images/saloma_bridge_1780754540468.png"
                alt="Saloma Link Bridge custom fluorescent illumination"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent p-5">
                <span className="text-[9px] font-mono tracking-widest text-[#88B04B] font-bold block">NIGHT ILLUMINATION</span>
                <h4 className="text-lg font-serif text-white font-bold mt-1">Saloma Link Bridge</h4>
              </div>
            </div>

          </div>

          {/* Bullet activities underneath photo cards */}
          <div className="ml-2 md:ml-16 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* KTM train ride bullet row */}
            <div className="bg-white border border-stone-200/60 rounded-xl p-4 flex justify-between items-center hover:border-stone-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Train size={18} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans text-stone-800">KTM Komuter to Batu Caves</h4>
                  <p className="text-[10px] text-stone-400 font-sans mt-0.5">8:30 AM • 29 mins travel</p>
                </div>
              </div>
              <span className="font-mono font-bold text-[#0B3530] text-sm bg-stone-100/80 px-2.5 py-1 rounded">RM 5.20</span>
            </div>

            {/* Lunch bullet row */}
            <div className="bg-white border border-stone-200/60 rounded-xl p-4 flex justify-between items-center hover:border-stone-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                  <Utensils size={18} className="text-rose-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans text-stone-800">Lunch: Local Delicacies</h4>
                  <p className="text-[10px] text-stone-400 font-sans mt-0.5">11:30 AM • Roti & Curry</p>
                </div>
              </div>
              <span className="font-mono font-bold text-[#0B3530] text-sm bg-stone-100/80 px-2.5 py-1 rounded">RM 35–55</span>
            </div>

          </div>
        </div>

        {/* ==================== DAY 14 ==================== */}
        <div>
          {/* Day Title bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#0B3530] flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-lg font-serif font-bold text-white leading-none">14</span>
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-850">
                {dayPlans[2].title}
              </h3>
              <p className="text-xs font-mono text-stone-400 mt-0.5 flex items-center gap-1.5">
                <span>{dayPlans[2].budgetRange}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${getDayBadgeStyle(dayPlans[2].badge)}`}>
                  {dayPlans[2].badge}
                </span>
              </p>
            </div>
          </div>

          {/* Divided grid sequence (deep green left card, structured checkpoints right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ml-2 md:ml-16">
            
            {/* "Heritage Journey" promotional/fact slate */}
            <div className="bg-[#0B3530] text-stone-100 rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden h-fit lg:h-full">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-[#18534C]/25 shrink-0"></div>
              <div>
                <h4 className="text-lg font-serif font-bold text-white tracking-tight leading-snug">Heritage Journey</h4>
                <p className="text-xs text-stone-300 font-sans leading-relaxed mt-3">
                  A deep dive into the historical heart of Malaysia. Experience the colonial charm from Dutch Square to the oriental flavors of Jonker Walk.
                </p>
              </div>

              <div className="space-y-4 border-t border-[#18534C] pt-6 mt-6 shrink-0 relative z-10">
                <div className="flex items-center gap-2.5 text-xs text-stone-200">
                  <div className="p-1 px-1.5 bg-[#18534C] rounded text-[#88B04B] font-mono font-bold text-[9px]">BUS</div>
                  <span className="font-sans font-medium hover:text-[#88B04B] transition-colors cursor-pointer text-stone-200 decoration-none">Intercity Bus: TBS to Melaka</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-200">
                  <div className="p-1 px-1.5 bg-[#18534C] rounded text-[#88B04B] font-mono font-bold text-[9px]">WLK</div>
                  <span className="font-sans font-medium text-stone-200">Colonial Square Walk</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-200">
                  <div className="p-1 px-1.5 bg-[#18534C] rounded text-[#88B04B] font-mono font-bold text-[9px]">FOD</div>
                  <span className="font-sans font-medium text-stone-200">Authentic Melaka Cendol</span>
                </div>
              </div>
            </div>

            {/* Checkpoints flow cards column (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Bus Ride Melaka */}
              <div className="bg-white border border-stone-200/60 rounded-xl p-5 hover:border-stone-300 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="inline-block px-1.5 py-0.5 bg-stone-100 text-[#0B3530] rounded font-mono text-[9px] font-bold">08:00 AM</span>
                    <h4 className="text-sm font-semibold font-serif text-stone-850 pt-1 flex items-center gap-1.5">
                      <Bus size={14} className="text-stone-400 shrink-0" /> Bus: TBS → Melaka Sentral
                    </h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      A comfortable 2-hour travel. Ensure you book in advance to secure the best seats for the scenic route.
                    </p>
                  </div>
                  
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono font-bold text-[#0B3530] bg-[#88B04B]/15 px-2.5 py-1 rounded">
                      RM 40-56 Round Trip
                    </span>
                  </div>
                </div>
              </div>

              {/* Dutch Square */}
              <div className="bg-white border border-stone-200/60 rounded-xl p-5 hover:border-stone-300 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="inline-block px-1.5 py-0.5 bg-stone-100 text-[#0B3530] rounded font-mono text-[9px] font-bold">10:50 AM</span>
                    <h4 className="text-sm font-semibold font-serif text-stone-850 pt-1 flex items-center gap-1.5">
                      <MapPin size={14} className="text-stone-400 shrink-0" /> Dutch Square / Red Square
                    </h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      Christ Church, Stadthuys, and the Clock Tower. This is the heart of Malacca's UNESCO heritage site.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cendol Ice */}
              <div className="bg-white border border-stone-200/60 rounded-xl p-5 hover:border-stone-300 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="inline-block px-1.5 py-0.5 bg-stone-100 text-[#0B3530] rounded font-mono text-[9px] font-bold">03:15 PM</span>
                    <h4 className="text-sm font-semibold font-serif text-stone-850 pt-1 flex items-center gap-1.5">
                      <Utensils size={14} className="text-stone-400 shrink-0" /> Cendol / Cold Drinks
                    </h4>
                    <p className="text-xs text-stone-500 font-sans leading-relaxed">
                      A vital stop to cool down. Try the famous Malacca Cendol with rich Gula Melaka syrup.
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono font-bold text-[#0B3530] bg-[#88B04B]/15 px-2.5 py-1 rounded">
                      RM 20-35 for 2
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
