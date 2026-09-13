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
        <div className="ja-tip-card-icon" aria-hidden="true">
          {tip.icon}
        </div>
        <div className="ja-tip-card-text">
          <RichText segments={tip.description} />
        </div>
      </IonCardContent>
    </IonCard>
  );
}
