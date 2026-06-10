import React from "react";
import { IonCard, IonCardContent, IonIcon, IonText } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import type { AlertBoxData } from "../data/code1Itinerary";
import RichText from "./RichText";

interface AlertBoxProps {
  alert: AlertBoxData;
}

export default function AlertBox({ alert }: AlertBoxProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-4 no-print">
      <IonCard className="ja-alert-card">
        <IonCardContent className="ion-no-padding">
          <div className="flex items-start gap-3 p-4 md:p-5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgb(254 243 199)", color: "rgb(180 83 9)" }}
            >
              <IonIcon icon={informationCircleOutline} size="small" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#0B3530]">{alert.title}</div>
              <p className="text-xs leading-relaxed text-stone-600">
                <RichText segments={alert.body} />
              </p>
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </section>
  );
}
