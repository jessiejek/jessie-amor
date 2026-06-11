import React from "react";
import { IonChip } from "@ionic/react";
import type { LegendItem } from "../data/code1Itinerary";

interface LegendProps {
  items: LegendItem[];
}

export default function Legend({ items }: LegendProps) {
  return (
    <section className="ja-legend-section">
      <div className="ja-legend-row">
        {items.map((item) => (
          <IonChip
            key={item.label}
            className="ja-legend-chip"
            style={{ "--ion-chip-background": "#ffffff", border: "1px solid #e7e5e4" } as React.CSSProperties}
          >
            <span className="ja-legend-dot" style={{ backgroundColor: item.color }} />
            <span className="ja-legend-label">{item.label}</span>
          </IonChip>
        ))}
      </div>
    </section>
  );
}
