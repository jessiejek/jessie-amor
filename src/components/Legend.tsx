import React from "react";
import { IonCard, IonCardContent, IonChip } from "@ionic/react";
import type { LegendItem } from "../data/code1Itinerary";

interface LegendProps {
  items: LegendItem[];
}

export default function Legend({ items }: LegendProps) {
  return (
    <section className="legend-pills-section max-w-7xl mx-auto px-4 md:px-8 pb-2 no-print">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <IonChip
            key={item.label}
            className="ja-legend-chip"
            style={{ "--ion-chip-background": "#ffffff", border: "1px solid #e7e5e4" } as React.CSSProperties}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[13px] font-semibold tracking-wide text-stone-600">{item.label}</span>
          </IonChip>
        ))}
      </div>
    </section>
  );
}
