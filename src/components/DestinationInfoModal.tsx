import React from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonChip,
  IonBadge,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { MapPinned, Route, ShoppingBag, Utensils, Info } from "lucide-react";
import type { DestinationGuide } from "../data/code1Itinerary";

interface DestinationInfoModalProps {
  guide: DestinationGuide | null;
  onClose: () => void;
}

const brandToolbar = {
  "--background": "#0B3530",
  "--color": "#ffffff",
} as React.CSSProperties;

export default function DestinationInfoModal({ guide, onClose }: DestinationInfoModalProps) {
  return (
    <IonModal isOpen={Boolean(guide)} onDidDismiss={onClose} className="ja-destination-modal">
      <IonHeader>
        <IonToolbar style={brandToolbar}>
          <div className="flex items-center gap-2 pl-4">
            <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#88B04B]">
              How to do it
            </div>
          </div>
          <IonButtons slot="end">
            <IonButton onClick={onClose} aria-label="Close destination guide">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {guide && (
          <div style={{ background: "#0B3530", padding: "0 16px 12px" }}>
            <h2 className="text-lg font-serif font-bold text-white">{guide.title}</h2>
          </div>
        )}
      </IonHeader>

      {guide && (
        <IonContent style={{ "--background": "#fafaf9" } as React.CSSProperties}>
          <div className="space-y-4 p-4">
            {/* Summary */}
            <IonCard className="ja-dest-summary-card">
              <IonCardContent>
                <p className="text-sm leading-relaxed text-stone-600">{guide.summary}</p>
              </IonCardContent>
            </IonCard>

            {/* Service / Ticket / Where to buy */}
            {(guide.service || guide.ticket || guide.whereToBuy?.length) && (
              <div className="grid gap-3 md:grid-cols-3">
                {guide.service ? (
                  <IonCard className="ja-dest-info-card">
                    <IonCardHeader className="pb-1">
                      <IonCardSubtitle className="text-[10px] font-mono font-bold uppercase tracking-widest">
                        Service
                      </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent className="pt-0">
                      <p className="text-sm font-medium text-[#0B3530]">{guide.service}</p>
                    </IonCardContent>
                  </IonCard>
                ) : null}
                {guide.ticket ? (
                  <IonCard className="ja-dest-info-card">
                    <IonCardHeader className="pb-1">
                      <IonCardSubtitle className="text-[10px] font-mono font-bold uppercase tracking-widest">
                        Ticket
                      </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent className="pt-0">
                      <p className="text-sm font-medium text-[#0B3530]">{guide.ticket}</p>
                    </IonCardContent>
                  </IonCard>
                ) : null}
                {guide.whereToBuy?.length ? (
                  <IonCard className="ja-dest-info-card">
                    <IonCardHeader className="pb-1">
                      <IonCardSubtitle className="text-[10px] font-mono font-bold uppercase tracking-widest">
                        Where to buy
                      </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent className="pt-0">
                      <ul className="space-y-1 text-sm text-stone-600">
                        {guide.whereToBuy.map((place) => (
                          <li key={place}>{place}</li>
                        ))}
                      </ul>
                    </IonCardContent>
                  </IonCard>
                ) : null}
              </div>
            )}

            {/* Transport checklist */}
            {guide.transport ? (
              <div>
                <div className="mb-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0B3530]">
                  Transport checklist
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <GuideCard title="Go here" icon={<MapPinned size={16} />} items={guide.transport.goHere} />
                  <GuideCard title="Buy this" icon={<ShoppingBag size={16} />} items={guide.transport.buyThis} />
                  <GuideCard title="Tap here" icon={<Route size={16} />} items={guide.transport.tapHere} />
                  <GuideCard title="Get off here" icon={<MapPinned size={16} />} items={guide.transport.getOffHere} />
                  {guide.transport.extra?.length ? (
                    <GuideCard title="Extra notes" icon={<Info size={16} />} items={guide.transport.extra} fullWidth />
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Food guide */}
            {guide.foodGuide ? (
              <div>
                <div className="mb-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0B3530]">
                  What to eat nearby
                </div>
                <IonCard>
                  <IonCardContent className="text-sm leading-relaxed text-stone-600">
                    {guide.foodGuide.areaNote}
                  </IonCardContent>
                </IonCard>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {guide.foodGuide.nearbyFoods.map((food) => (
                    <IonCard key={food.name}>
                      <IonCardContent>
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-[#0B3530]">{food.name}</h3>
                          <IonChip className="text-[10px] font-mono font-bold m-0 h-auto px-2 py-1 text-[#0B3530]" style={{ background: "rgba(136,176,75,0.15)" }}>
                            {food.estimatedPrice}
                          </IonChip>
                        </div>
                        <p className="text-sm leading-relaxed text-stone-600">{food.description}</p>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <IonCard>
                    <IonCardHeader className="pb-1">
                      <IonCardSubtitle className="text-[10px] font-mono font-bold uppercase tracking-widest">
                        Suggested order for 2
                      </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent className="pt-0 text-sm leading-relaxed text-stone-600">
                      {guide.foodGuide.suggestedOrderForTwo}
                    </IonCardContent>
                  </IonCard>
                  <IonCard>
                    <IonCardHeader className="pb-1">
                      <IonCardSubtitle className="text-[10px] font-mono font-bold uppercase tracking-widest">
                        Food tips
                      </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent className="pt-0">
                      <ul className="space-y-2 text-sm leading-relaxed text-stone-600">
                        {guide.foodGuide.tips.map((tip) => (
                          <li key={tip} className="flex gap-2">
                            <span className="text-stone-400">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </IonCardContent>
                  </IonCard>
                </div>

                <p className="mt-3 text-xs italic leading-relaxed text-stone-500">{guide.foodGuide.priceNote}</p>
              </div>
            ) : null}

            {/* Easy steps */}
            <div>
              <div className="mb-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0B3530]">
                Easy steps
              </div>
              <IonList className="ja-dest-list">
                {guide.steps.map((step, index) => (
                  <IonItem key={step} className="ja-dest-step-item">
                    <div slot="start" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B3530] text-[10px] font-bold text-[#88B04B]">
                      {index + 1}
                    </div>
                    <IonLabel className="text-sm leading-relaxed text-stone-600">{step}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </div>

            {/* Remember */}
            <div>
              <div className="mb-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0B3530]">
                Remember
              </div>
              <IonList className="ja-dest-list">
                {guide.tips.map((tip) => (
                  <IonItem key={tip} className="ja-dest-tip-item">
                    <IonLabel className="text-sm leading-relaxed text-stone-600">{tip}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </div>
          </div>
        </IonContent>
      )}
    </IonModal>
  );
}

function GuideCard({
  title,
  icon,
  items,
  fullWidth = false,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  fullWidth?: boolean;
}) {
  return (
    <IonCard className={`ja-dest-guide-card ${fullWidth ? "md:col-span-2" : ""}`}>
      <IonCardContent>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0B3530]">
          <span className="text-[#88B04B]">{icon}</span>
          {title}
        </div>
        <ul className="space-y-2 text-sm leading-relaxed text-stone-600">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#88B04B] shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </IonCardContent>
    </IonCard>
  );
}
