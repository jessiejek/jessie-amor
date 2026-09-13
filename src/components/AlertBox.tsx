import React from "react";
import { IonCard, IonCardContent, IonIcon } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import type { AlertBoxData } from "../data/code1Itinerary";
import RichText from "./RichText";

interface AlertBoxProps {
  alert: AlertBoxData;
}

export default function AlertBox({ alert }: AlertBoxProps) {
  return (
    <section className="ja-alert-section">
      <IonCard className="ja-alert-card">
        <IonCardContent className="ion-no-padding">
          <div className="ja-alert-row">
            <div className="ja-alert-icon-wrap">
              <IonIcon icon={informationCircleOutline} size="small" />
            </div>
            <div className="ja-alert-body">
              <div className="ja-alert-title">{alert.title}</div>
              <p className="ja-alert-text">
                <RichText segments={alert.body} />
              </p>
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </section>
  );
}
