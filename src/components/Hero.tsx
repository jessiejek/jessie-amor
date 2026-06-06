import React from "react";
import type { HeroData } from "../data/code1Itinerary";
import RichText from "./RichText";

interface HeroProps {
  hero: HeroData;
}

export default function Hero({ hero }: HeroProps) {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2 no-print bg-stone-50">
      <div className="group relative overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[16/6] bg-stone-200 shadow-lg">
        <img
          src="/src/assets/images/kl_skyline_1780754501759.png"
          alt="Kuala Lumpur Skyline with Petronas Twin Towers"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/65 via-stone-800/35 to-transparent" />

        <div className="absolute bottom-4 left-4 max-w-lg rounded-2xl border border-white/50 bg-white/95 p-6 shadow-xl backdrop-blur-md md:bottom-8 md:left-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="mb-2 block text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#88B04B] md:text-xs">
            {hero.eyebrow}
          </span>
          <h2 className="text-xl font-serif font-bold leading-tight tracking-tight text-[#0B3530] md:text-3xl">
            {hero.title}
            <span className="block text-[#18534C]">{hero.subtitle}</span>
          </h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-[#88B04B]" />
          <div className="mt-4 flex flex-wrap gap-2">
            {hero.meta.map((item) => (
              <span
                key={item}
                className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-medium text-stone-600"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-stone-500 md:text-xs">
            <RichText segments={hero.note} />
          </p>
        </div>
      </div>
    </div>
  );
}
