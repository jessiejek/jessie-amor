import React from "react";
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle,
  IonList, IonItem, IonLabel, IonChip,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { MapPinned, Route, ShoppingBag, Utensils, Info } from "lucide-react";
import type { DestinationGuide } from "../data/code1Itinerary";

interface DestinationInfoModalProps { guide: DestinationGuide | null; onClose: () => void; }

const brandToolbar = { "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties;

export default function DestinationInfoModal({ guide, onClose }: DestinationInfoModalProps) {
  return (
    <IonModal isOpen={Boolean(guide)} onDidDismiss={onClose} className="ja-destination-modal">
      <IonHeader>
        <IonToolbar style={brandToolbar}>
          <div className="ja-dest-eyebrow-row"><div className="ja-dest-eyebrow">How to do it</div></div>
          <IonButtons slot="end">
            <IonButton onClick={onClose} aria-label="Close destination guide"><IonIcon icon={closeOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
        {guide && <div className="ja-dest-title-bar"><h2 className="ja-dest-title">{guide.title}</h2></div>}
      </IonHeader>

      {guide && (
        <IonContent style={{ "--background": "#fafaf9" } as React.CSSProperties}>
          <div className="ja-dest-content">
            <IonCard className="ja-dest-summary-card"><IonCardContent><p className="ja-dest-text">{guide.summary}</p></IonCardContent></IonCard>

            {(guide.service || guide.ticket || guide.whereToBuy?.length) && (
              <div className="ja-dest-info-grid">
                {guide.service ? (
                  <IonCard className="ja-dest-info-card"><IonCardHeader className="ja-dest-info-hdr"><IonCardSubtitle className="ja-dest-info-label">Service</IonCardSubtitle></IonCardHeader><IonCardContent className="ja-dest-info-body"><p className="ja-dest-info-value">{guide.service}</p></IonCardContent></IonCard>
                ) : null}
                {guide.ticket ? (
                  <IonCard className="ja-dest-info-card"><IonCardHeader className="ja-dest-info-hdr"><IonCardSubtitle className="ja-dest-info-label">Ticket</IonCardSubtitle></IonCardHeader><IonCardContent className="ja-dest-info-body"><p className="ja-dest-info-value">{guide.ticket}</p></IonCardContent></IonCard>
                ) : null}
                {guide.whereToBuy?.length ? (
                  <IonCard className="ja-dest-info-card"><IonCardHeader className="ja-dest-info-hdr"><IonCardSubtitle className="ja-dest-info-label">Where to buy</IonCardSubtitle></IonCardHeader><IonCardContent className="ja-dest-info-body"><ul className="ja-dest-buy-list">{guide.whereToBuy.map((p) => <li key={p}>{p}</li>)}</ul></IonCardContent></IonCard>
                ) : null}
              </div>
            )}

            {guide.transport ? (
              <div>
                <div className="ja-dest-section-title">Transport checklist</div>
                <div className="ja-dest-transport-grid">
                  <GuideCard title="Go here" icon={<MapPinned size={16} />} items={guide.transport.goHere} />
                  <GuideCard title="Buy this" icon={<ShoppingBag size={16} />} items={guide.transport.buyThis} />
                  <GuideCard title="Tap here" icon={<Route size={16} />} items={guide.transport.tapHere} />
                  <GuideCard title="Get off here" icon={<MapPinned size={16} />} items={guide.transport.getOffHere} />
                  {guide.transport.extra?.length ? <GuideCard title="Extra notes" icon={<Info size={16} />} items={guide.transport.extra} fullWidth /> : null}
                </div>
              </div>
            ) : null}

            {guide.foodGuide ? (
              <div>
                <div className="ja-dest-section-title">What to eat nearby</div>
                <IonCard className="ja-dest-food-note-card"><IonCardContent className="ja-dest-text">{guide.foodGuide.areaNote}</IonCardContent></IonCard>
                <div className="ja-dest-food-grid">
                  {guide.foodGuide.nearbyFoods.map((food) => (
                    <IonCard key={food.name}>
                      <IonCardContent>
                        <div className="ja-dest-food-header"><h3 className="ja-dest-food-name">{food.name}</h3><IonChip className="ja-dest-food-chip">{food.estimatedPrice}</IonChip></div>
                        <p className="ja-dest-text">{food.description}</p>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </div>
                <div className="ja-dest-food-suggest-grid">
                  <IonCard><IonCardHeader className="ja-dest-info-hdr"><IonCardSubtitle className="ja-dest-info-label">Suggested order for 2</IonCardSubtitle></IonCardHeader><IonCardContent className="ja-dest-food-suggest-body">{guide.foodGuide.suggestedOrderForTwo}</IonCardContent></IonCard>
                  <IonCard><IonCardHeader className="ja-dest-info-hdr"><IonCardSubtitle className="ja-dest-info-label">Food tips</IonCardSubtitle></IonCardHeader><IonCardContent className="ja-dest-info-body"><ul className="ja-dest-tips-list">{guide.foodGuide.tips.map((tip) => <li key={tip} className="ja-dest-tip-row"><span className="ja-dest-bullet">•</span><span>{tip}</span></li>)}</ul></IonCardContent></IonCard>
                </div>
                <p className="ja-dest-price-note">{guide.foodGuide.priceNote}</p>
              </div>
            ) : null}

            <div>
              <div className="ja-dest-section-title">Easy steps</div>
              <IonList className="ja-dest-list">
                {guide.steps.map((step, index) => (
                  <IonItem key={step} className="ja-dest-step-item">
                    <div slot="start" className="ja-dest-step-num">{index + 1}</div>
                    <IonLabel className="ja-dest-step-text">{step}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </div>

            <div>
              <div className="ja-dest-section-title">Remember</div>
              <IonList className="ja-dest-list">
                {guide.tips.map((tip) => (
                  <IonItem key={tip} className="ja-dest-tip-item"><IonLabel className="ja-dest-step-text">{tip}</IonLabel></IonItem>
                ))}
              </IonList>
            </div>
          </div>
        </IonContent>
      )}
    </IonModal>
  );
}

function GuideCard({ title, icon, items, fullWidth = false }: { title: string; icon: React.ReactNode; items: string[]; fullWidth?: boolean }) {
  return (
    <IonCard className={`ja-dest-guide-card${fullWidth ? " ja-dest-guide-card-wide" : ""}`}>
      <IonCardContent>
        <div className="ja-dest-guide-header"><span className="ja-dest-guide-icon">{icon}</span>{title}</div>
        <ul className="ja-dest-guide-list">{items.map((item) => <li key={item} className="ja-dest-guide-row"><span className="ja-dest-guide-dot" /><span>{item}</span></li>)}</ul>
      </IonCardContent>
    </IonCard>
  );
}
