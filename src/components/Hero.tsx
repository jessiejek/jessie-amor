import React from "react";

export default function Hero() {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2 no-print bg-stone-50">
      <div className="relative overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[16/6] bg-stone-200 shadow-lg group">
        {/* Background Image with elegant overlay filter */}
        <img
          src="/src/assets/images/kl_skyline_1780754501759.png"
          alt="Kuala Lumpur Skyline with Petronas Twin Towers"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 via-stone-800/30 to-transparent"></div>

        {/* Floating Content Card */}
        <div className="absolute bottom-4 left-4 md:bottom-8 md:on shadow-xl left-8 bg-white/95 backdrop-blur-md rounded-xl p-6 md:p-8 max-w-lg border border-stone-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="text-[10px] md:text-xs font-mono font-bold text-[#88B04B] tracking-[#0.2em] uppercase leading-none block mb-1 md:mb-2">
            DESTINATION FOCUS
          </span>
          <h2 className="text-xl md:text-3xl font-serif font-bold text-[#0B3530] leading-tight tracking-tight">
            A Journey Through Southeast Asian Modernity
          </h2>
          <div className="w-16 h-1 bg-[#88B04B] mt-4 rounded-full"></div>
          <p className="text-stone-500 text-[11px] md:text-xs leading-relaxed font-sans mt-3">
            An exploration of contemporary architectural marvels, heritage streets, and ancient religious shrines across Malaysia and Singapore.
          </p>
        </div>
      </div>
    </div>
  );
}
