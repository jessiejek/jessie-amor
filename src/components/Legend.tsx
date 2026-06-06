import React from "react";
import type { LegendItem } from "../data/code1Itinerary";

interface LegendProps {
  items: LegendItem[];
}

export default function Legend({ items }: LegendProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pb-2 no-print">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-semibold tracking-wide text-stone-600 shadow-xs"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}
