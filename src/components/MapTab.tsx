import React, { useState } from "react";
import { MapPin, Navigation, Landmark, Bus, Train, ShoppingBag, Coffee } from "lucide-react";
import { DayPlan } from "../types";

interface MapPoint {
  id: string;
  name: string;
  latStr: string;
  lngStr: string;
  day: number;
  category: "Transport" | "Hotel" | "Sightseeing" | "Food";
  originalTime: string;
  coordX: number; // custom SVG bounds (0 - 100)
  coordY: number; // custom SVG bounds (0 - 100)
  desc: string;
  budget: string;
  duration?: string;
  photoUrl?: string;
}

const mapPoints: MapPoint[] = [
  {
    id: "p1",
    name: "Kuala Lumpur International Airport (KLIA)",
    latStr: "2.7456° N",
    lngStr: "101.7072° E",
    day: 12,
    category: "Transport",
    originalTime: "01:30 AM",
    coordX: 30,
    coordY: 90,
    desc: "Main primary aviation gateway into Malaysia. Clean, modern, high-speed rail lines to KL Sentral, and easy Grab rides.",
    budget: "Credit Card (Excluded from cash)",
    photoUrl: "/src/assets/images/kl_skyline_1780754501759.png"
  },
  {
    id: "p2",
    name: "Travelodge KL City Centre",
    latStr: "3.1432° N",
    lngStr: "101.6983° E",
    day: 12,
    category: "Hotel",
    originalTime: "03:00 AM",
    coordX: 47,
    coordY: 60,
    desc: "Your base stay. Highly rated budget friendly metropolitan hotel located right in the middle of Chinatown / Central Market lines.",
    budget: "Pre-paid Credit Card"
  },
  {
    id: "p3",
    name: "Chinatown & Petaling Street",
    latStr: "3.1436° N",
    lngStr: "101.6981° E",
    day: 12,
    category: "Sightseeing",
    originalTime: "08:00 AM",
    coordX: 48,
    coordY: 57,
    desc: "Historic marketplace with endless souvenir stalls, traditional herbal drink stands, and majestic red Chinese lanterns line.",
    budget: "RM 20–30"
  },
  {
    id: "p4",
    name: "Batu Caves Sub-shrine",
    latStr: "3.2379° N",
    lngStr: "101.6840° E",
    day: 13,
    category: "Sightseeing",
    originalTime: "09:30 AM",
    coordX: 30,
    coordY: 15,
    desc: "Ancient limestone temple hill featuring its giant golden Lord Murugan statue and 272 vibrant color-ascending staircase.",
    budget: "Free Entry",
    photoUrl: "/src/assets/images/batu_caves_1780754522244.png"
  },
  {
    id: "p5",
    name: "Petronas Twin Towers & Suria KLCC",
    latStr: "3.1578° N",
    lngStr: "101.7119° E",
    day: 13,
    category: "Sightseeing",
    originalTime: "02:30 PM",
    coordX: 68,
    coordY: 42,
    desc: "Sleek metallic skyscrapers representing modern Malaysia's skyline. Houses Suria shopping mall, and adjacent pools & parks.",
    budget: "Free (Sightseeing) / RM 25 (Tea)"
  },
  {
    id: "p6",
    name: "Saloma Link Bridge",
    latStr: "3.1598° N",
    lngStr: "101.7067° E",
    day: 13,
    category: "Sightseeing",
    originalTime: "08:00 PM",
    coordX: 61,
    coordY: 38,
    desc: "Contemporary, shell-shaped bridge spanning Klang river connecting Kampong Bharu and KLCC. Stunning nighttime illuminate.",
    budget: "Free Entry",
    photoUrl: "/src/assets/images/saloma_bridge_1780754540468.png"
  },
  {
    id: "p7",
    name: "Dutch Square / Stadthuys, Malacca",
    latStr: "2.1944° N",
    lngStr: "102.2492° E",
    day: 14,
    category: "Sightseeing",
    originalTime: "10:50 AM",
    coordX: 85,
    coordY: 82,
    desc: "The historic terracotta reddish buildings, ancient Christ Church, and Queen Victoria fountain. Highly active UNESCO center.",
    budget: "Free"
  },
  {
    id: "p8",
    name: "Jonker Street (Malacca)",
    latStr: "2.1950° N",
    lngStr: "102.2475° E",
    day: 14,
    category: "Food",
    originalTime: "12:15 PM",
    coordX: 82,
    coordY: 79,
    desc: "Peranakan heritage street filled with local crafts, historical shophouses, Gula Melaka cendol eateries and chicken rice ball spots.",
    budget: "RM 20–40"
  },
  {
    id: "p9",
    name: "Kuala Lumpur Sentral (Transit)",
    latStr: "3.1344° N",
    lngStr: "101.6865° E",
    day: 13,
    category: "Transport",
    originalTime: "08:30 AM",
    coordX: 42,
    coordY: 66,
    desc: "The critical transportation nexus of KL. Central terminal for KTM Komuter, LRT, MRT and express monorail systems.",
    budget: "RM 5.20"
  }
];

export default function MapTab() {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint>(mapPoints[1]); // defaults to hotel
  const [activeRegion, setActiveRegion] = useState<"KL" | "MALACCA">("KL");

  const markersToShow = mapPoints.filter((p) => {
    if (activeRegion === "KL") {
      return p.name.indexOf("Malacca") === -1 && p.name.indexOf("Dutch") === -1;
    } else {
      return p.name.indexOf("Malacca") !== -1 || p.name.indexOf("Dutch") !== -1 || p.name.indexOf("Sentral") !== -1;
    }
  });

  const getMarkerIcon = (cat: string) => {
    switch (cat) {
      case "Hotel":
        return <Landmark size={14} className="text-amber-500" />;
      case "Transport":
        return <Train size={14} className="text-blue-500" />;
      case "Food":
        return <Coffee size={14} className="text-rose-500" />;
      default:
        return <MapPin size={14} className="text-emerald-500" />;
    }
  };

  const getBgColor = (cat: string, isSel: boolean) => {
    if (isSel) return "bg-[#0B3530] text-white border-2 border-[#88B04B] scale-125 shadow-md";
    switch (cat) {
      case "Hotel":
        return "bg-amber-100 hover:bg-amber-200 border border-amber-300";
      case "Transport":
        return "bg-blue-100 hover:bg-blue-200 border border-blue-300";
      case "Food":
        return "bg-rose-100 hover:bg-rose-200 border border-rose-300";
      default:
        return "bg-emerald-100 hover:bg-emerald-200 border border-emerald-300";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 bg-stone-50 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map Canvas Card */}
        <div className="flex-1 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 relative overflow-hidden min-h-[480px] flex flex-col justify-between">
          
          {/* Header Region Swappers */}
          <div className="flex justify-between items-center z-10 relative">
            <div>
              <h3 className="text-base font-serif font-bold text-[#0B3530]">Interactive Travel Map</h3>
              <p className="text-[11px] text-stone-400 font-sans">Click on plotted coordinate points to review travel tips</p>
            </div>
            
            <div className="flex gap-1.5 bg-stone-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setActiveRegion("KL");
                  setSelectedPoint(mapPoints[1]);
                }}
                className={`px-3 py-1 text-xs font-medium font-sans rounded-md transition-all ${
                  activeRegion === "KL" ? "bg-[#0B3530] text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Kuala Lumpur
              </button>
              <button
                onClick={() => {
                  setActiveRegion("MALACCA");
                  setSelectedPoint(mapPoints[6]); // Melaka
                }}
                className={`px-3 py-1 text-xs font-medium font-sans rounded-md transition-all ${
                  activeRegion === "MALACCA" ? "bg-[#0B3530] text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Malacca Excursion
              </button>
            </div>
          </div>

          {/* Map Vector Graphic with dynamic Plots */}
          <div className="relative w-full aspect-video border border-stone-100 rounded-xl my-4 bg-[#EDF3EF]/60 p-4 overflow-hidden flex items-center justify-center">
            
            {/* Grid background lines to look blueprint style */}
            <svg className="absolute inset-0 w-full h-full text-emerald-800/5 stroke-dasharray-[2_4]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Plotting path connection for the visual trail */}
              {activeRegion === "KL" ? (
                // Airport -> Sentral -> Hotel/Chinatown -> Saloma -> Twin Towers -> Batu Caves
                <path
                  d="M 230 400 Q 280 340 330 300 T 360 260 T 470 170 T 520 120"
                  fill="none"
                  stroke="#88B04B"
                  strokeWidth="3"
                  className="stroke-dasharray-[4_4]"
                />
              ) : (
                // Sentral -> Malacca route line
                <path
                  d="M 200 150 Q 400 250 600 350"
                  fill="none"
                  stroke="#88B04B"
                  strokeWidth="3"
                  className="stroke-dasharray-[4_4]"
                />
              )}
            </svg>

            {/* Simulated River / Transport Route overlays */}
            <div className="absolute inset-x-0 h-4 bg-sky-200/40 rounded-full blur-xs top-[35%] skew-y-6"></div>
            <div className="absolute inset-y-0 w-4 bg-emerald-500/5 rounded-full blur-xs left-[45%] -rotate-12"></div>

            {/* Custom Overlay indicating Map state */}
            <div className="absolute top-2 left-2 bg-[#0B3530]/10 text-[#0B3530] font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              {activeRegion === "KL" ? "Transit Corridor: KLIA - Sentral - Gombak" : "Federal Route 1 Outbound Corridor"}
            </div>

            {/* Interactive Plots mapping onto container bounds */}
            {markersToShow.map((pt) => (
              <div
                key={pt.id}
                className="absolute transition-all duration-300 cursor-pointer"
                style={{
                  left: `${pt.coordX}%`,
                  top: `${pt.coordY}%`,
                  transform: "translate(-50%, -50%)"
                }}
                onClick={() => setSelectedPoint(pt)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${getBgColor(
                    pt.category,
                    selectedPoint.id === pt.id
                  )}`}
                >
                  {getMarkerIcon(pt.category)}
                </div>
                {/* Micro Label text above marker */}
                <span className="absolute left-1/2 -translate-x-1/2 -top-5 whitespace-nowrap text-[9px] font-sans font-bold text-stone-700 bg-white/90 px-1 py-0.5 rounded shadow-2xs border border-stone-100 pointer-events-none">
                  {pt.originalTime}
                </span>
              </div>
            ))}
          </div>

          {/* Compass / Metric Footer */}
          <div className="flex justify-between items-center border-t border-stone-100 pt-3 text-[10px] font-mono text-stone-400">
            <span className="flex items-center gap-1">
              <Navigation size={12} className="text-[#88B04B]" />
              WGS84 COORDINATES PLOTTED
            </span>
            <span>ACTIVE MAP CONTROLLER v12.1</span>
          </div>
        </div>

        {/* Details Panel Sidecard */}
        <div className="w-full lg:w-[380px] bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="px-2 py-0.5 rounded-md bg-[#88B04B]/15 text-[#0B3530] text-[10px] uppercase font-mono font-bold tracking-wider">
                DAY {selectedPoint.day} DESTINATION
              </span>
              <span className="text-xs font-mono text-stone-400">{selectedPoint.originalTime}</span>
            </div>

            {/* Dynamic visual preview if we have some images available */}
            <div className="rounded-xl overflow-hidden aspect-video bg-stone-100 relative border border-stone-200/50">
              <img
                src={selectedPoint.photoUrl || "https://picsum.photos/seed/" + selectedPoint.id + "/400/225"}
                alt={selectedPoint.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#88B04B]">{selectedPoint.category}</p>
                <p className="text-xs font-sans font-medium text-stone-200">{selectedPoint.latStr} • {selectedPoint.lngStr}</p>
              </div>
            </div>

            <div>
              <h4 className="text-base font-serif font-bold text-[#0B3530] leading-tight mb-1">
                {selectedPoint.name}
              </h4>
              <p className="text-xs text-stone-500 font-sans leading-relaxed">
                {selectedPoint.desc}
              </p>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 mt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400 font-sans">Projected Cost:</span>
              <span className="font-mono font-bold text-[#0B3530] bg-[#88B04B]/10 px-2 py-0.5 rounded">
                {selectedPoint.budget}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400 font-sans">Location Code:</span>
              <span className="font-mono text-stone-500">
                MY_{selectedPoint.category.toUpperCase()}_{selectedPoint.id.toUpperCase()}
              </span>
            </div>

            <button
              onClick={() => {
                alert(`Routing data exported for: ${selectedPoint.name}. Lat/Lng coordinates mapped successfully.`);
              }}
              className="w-full text-center py-2 bg-[#0B3530] text-[#88B04B] hover:text-white rounded-lg text-xs font-bold font-sans transition-colors cursor-pointer border-none"
            >
              Export Gps Navigation Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
