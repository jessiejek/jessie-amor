import React from "react";
import { IonCard, IonCardContent } from "@ionic/react";
import type { TipCardData } from "../data/code1Itinerary";
import RichText from "./RichText";

interface TipCardProps {
  tip: TipCardData;
  key?: React.Key;
}

export default function TipCard({ tip }: TipCardProps) {
  return (
    <IonCard className="ja-tip-card">
      <IonCardContent>
        <div className="mb-3 text-xl" aria-hidden="true">
          {tip.icon}
        </div>
        <div className="text-sm leading-relaxed text-stone-600">
          <RichText segments={tip.description} />
        </div>
      </IonCardContent>
    </IonCard>
  );
}
