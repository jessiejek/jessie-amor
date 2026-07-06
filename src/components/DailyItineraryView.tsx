import React, { useMemo, useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonChip,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { Bus, Camera, Clock3, Train, Utensils, Bed, MapPin, Footprints, Shirt } from "lucide-react";
import type { DaySectionData, TimelineItemData, TagVariant } from "../data/code1Itinerary";
import RichText from "./RichText";

interface DailyItineraryViewProps {
  days: DaySectionData[];
  onInfoClick?: (item: TimelineItemData) => void;
  selectedMobileDay?: number;
  onSelectedMobileDayChange?: (day: number) => void;
}

type CategoryMeta = { label: string; icon: React.ReactNode; chipColor: string; cardBorder: string; };

const CATEGORY_META: Record<string, CategoryMeta> = {
  train: { label: "TRAIN", icon: <Train size={14} />, chipColor: "#eff6ff", cardBorder: "rgba(191,219,254,0.7)" },
  bus: { label: "BUS", icon: <Bus size={14} />, chipColor: "#fffbeb", cardBorder: "rgba(252,211,77,0.5)" },
  food: { label: "FOOD", icon: <Utensils size={14} />, chipColor: "#fff1f2", cardBorder: "rgba(254,205,211,0.6)" },
  spot: { label: "SIGHTSEEING", icon: <Camera size={14} />, chipColor: "#f5f3ff", cardBorder: "rgba(221,214,254,0.6)" },
  hotel: { label: "HOTEL", icon: <Bed size={14} />, chipColor: "#ecfdf5", cardBorder: "rgba(167,243,208,0.6)" },
  walk: { label: "WALK", icon: <Footprints size={14} />, chipColor: "#fafaf9", cardBorder: "rgba(231,229,228,0.6)" },
  free: { label: "FREE", icon: <MapPin size={14} />, chipColor: "#f0f9ff", cardBorder: "rgba(186,230,253,0.6)" },
};

const TAG_VARIANT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  train: { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
  bus: { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  food: { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3" },
  walk: { bg: "#fafaf9", text: "#44403c", border: "#e7e5e4" },
  spot: { bg: "#f5f3ff", text: "#5b21b6", border: "#ddd6fe" },
  hotel: { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
  free: { bg: "#f0f9ff", text: "#075985", border: "#bae6fd" },
};

const getMapsUrl = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(query)}&travelmode=driving`;

const splitDayTitle = (title: string) => {
  const normalized = title.replace(/\s*[.-]\s*/g, " · ");
  const [label, date] = normalized.split("·").map((p) => p.trim());
  return { label: label || title, date: date || title };
};

const getMobileDayBadge = (day: DaySectionData, i: number) => {
  const { label } = splitDayTitle(day.title);
  return /flight day/i.test(label) ? "Flight Day" : `Day ${i}`;
};
const getMobileDayHeadline = (day: DaySectionData) => splitDayTitle(day.title).date;

export default function DailyItineraryView({ days, onInfoClick, selectedMobileDay, onSelectedMobileDayChange }: DailyItineraryViewProps) {
  const [internalDay, setInternalDay] = useState<number>(days[0]?.day ?? 0);
  const activeMobileDay = selectedMobileDay ?? internalDay;
  const setActiveMobileDay = onSelectedMobileDayChange ?? setInternalDay;
  const selectedDay = useMemo(() => days.find((d) => d.day === activeMobileDay) ?? days[0] ?? null, [activeMobileDay, days]);
  const selectedDayIndex = selectedDay ? days.findIndex((d) => d.day === selectedDay.day) : -1;

  const renderDayArticle = (day: DaySectionData, displayNum: number, mobileOnly = false) => (
    <article key={day.day} className={`ja-itinerary-article${mobileOnly ? " ja-itinerary-article-mobile" : " ja-itinerary-article-desktop"}`}>
      <div className="ja-itinerary-day-head">
        <div className="ja-itinerary-day-badge"><span className="ja-itinerary-day-num">{displayNum}</span></div>
        <div>
          <h3 className="ja-itinerary-day-title">{day.title}</h3>
          <p className="ja-itinerary-day-meta"><span>{day.budgetLabel}</span></p>
        </div>
      </div>

      {day.outfitTip && (
        <div className="ja-outfit-tip">
          <div className="ja-outfit-tip-header">
            <Shirt size={15} className="ja-outfit-tip-icon" />
            <span className="ja-outfit-tip-label">What to wear today</span>
          </div>
          {day.outfitTip.note && (
            <p className="ja-outfit-tip-note">{day.outfitTip.note}</p>
          )}
          <div className="ja-outfit-tip-cols">
            <div className="ja-outfit-section ja-outfit-wear">
              <div className="ja-outfit-section-title">✓ Wear this</div>
              <div className="ja-outfit-row"><span className="ja-outfit-gender">Male</span><ul className="ja-outfit-list">{day.outfitTip.wear.male.map((i) => <li key={i}>{i}</li>)}</ul></div>
              <div className="ja-outfit-row"><span className="ja-outfit-gender">Female</span><ul className="ja-outfit-list">{day.outfitTip.wear.female.map((i) => <li key={i}>{i}</li>)}</ul></div>
            </div>
            <div className="ja-outfit-section ja-outfit-avoid">
              <div className="ja-outfit-section-title">✕ Don't wear</div>
              <div className="ja-outfit-row"><span className="ja-outfit-gender">Male</span><ul className="ja-outfit-list">{day.outfitTip.avoid.male.map((i) => <li key={i}>{i}</li>)}</ul></div>
              <div className="ja-outfit-row"><span className="ja-outfit-gender">Female</span><ul className="ja-outfit-list">{day.outfitTip.avoid.female.map((i) => <li key={i}>{i}</li>)}</ul></div>
            </div>
          </div>
        </div>
      )}

      {day.images?.length ? (
        <div className="ja-itinerary-images">
          {day.images.map((img) => (
            <div key={img.title} className="ja-itinerary-image-card">
              <img src={img.url} alt={img.title} className="ja-itinerary-image-img" referrerPolicy="no-referrer" />
              <div className="ja-itinerary-image-overlay">
                <span className="ja-itinerary-image-label">{img.label}</span>
                <h4 className="ja-itinerary-image-title">{img.title}</h4>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="ja-itinerary-timeline">
        {day.items.map((item) => {
          const meta = CATEGORY_META[item.category] ?? CATEGORY_META.free;
          return (
            <div key={item.id} className="ja-itinerary-item-wrap">
              <div className="ja-itinerary-item-dot" />
              <IonCard className="ja-itinerary-item-card" style={{ "--ja-item-border": meta.cardBorder } as React.CSSProperties}>
                <IonCardContent>
                  <div className="ja-itinerary-item-layout">
                    <div className="ja-itinerary-item-main">
                      <div className="ja-itinerary-item-badges">
                        <IonChip className="ja-itinerary-chip" style={{ background: meta.chipColor, color: "#1e293b" }}>
                          <span className="ja-itinerary-chip-inner">{meta.icon}<span className="ja-itinerary-chip-text">{meta.label}</span></span>
                        </IonChip>
                        <IonChip className="ja-itinerary-chip ja-itinerary-time-chip"><Clock3 size={11} />{item.time}</IonChip>
                      </div>
                      <div className="ja-itinerary-item-content">
                        <h4 className="ja-itinerary-item-title">
                          <a href={getMapsUrl(item.mapQuery)} target="_blank" rel="noopener noreferrer" className="ja-itinerary-item-link" aria-label={`Open ${item.title} in Google Maps`}>{item.title}</a>
                        </h4>
                        <p className="ja-itinerary-item-desc"><RichText segments={item.description} /></p>
                      </div>
                      {item.tags.length > 0 ? (
                        <div className="ja-itinerary-tags">
                          {item.tags.map((tag) => {
                            const tc = TAG_VARIANT_COLORS[tag.variant] ?? TAG_VARIANT_COLORS.free;
                            return <IonChip key={`${tag.variant}-${tag.label}`} className="ja-itinerary-tag-chip" style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>{tag.label}</IonChip>;
                          })}
                        </div>
                      ) : null}
                    </div>
                    <div className="ja-itinerary-item-side">
                      {item.cost ? (
                        <div className="ja-itinerary-cost-box">
                          <span className="ja-itinerary-cost-label">Estimated</span>
                          <span className="ja-itinerary-cost-value">{item.cost}</span>
                        </div>
                      ) : <div />}
                      {onInfoClick ? (
                        <IonButton fill="clear" size="small" onClick={() => onInfoClick(item)} className="ja-itinerary-action-btn">
                          <IonIcon icon={informationCircleOutline} slot="start" />Guide
                        </IonButton>
                      ) : null}
                    </div>
                  </div>
                  <div className="ja-itinerary-item-maps-link">
                    <IonButton fill="clear" size="small" href={getMapsUrl(item.mapQuery)} target="_blank" rel="noopener noreferrer" className="ja-itinerary-action-btn">Open in Maps</IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
          );
        })}
      </div>
    </article>
  );

  return (
    <section className="ja-itinerary-view">
      <div className="ja-itinerary-header">
        <div>
          <h2 className="ja-itinerary-title">Daily Itinerary</h2>
          <p className="ja-itinerary-subtitle">Detailed timeline and excursion checkpoints</p>
        </div>
        <div className="ja-itinerary-stats">
          <IonChip className="ja-itinerary-stats-chip ja-itinerary-stats-chip-dark">4 Days</IonChip>
          <IonChip className="ja-itinerary-stats-chip">2 Cities</IonChip>
        </div>
      </div>

      <div className="ja-itinerary-mobile-selector">
        <div className="ja-itinerary-mobile-top">
          <div>
            <p className="ja-itinerary-mobile-eyebrow">Browse by Day</p>
            <h3 className="ja-itinerary-mobile-title">{selectedDay?.title ?? "Itinerary"}</h3>
          </div>
          <IonChip className="ja-itinerary-stats-chip">{selectedDay?.items.length ?? 0} Stops</IonChip>
        </div>
        <div className="ja-itinerary-mobile-days">
          {days.map((day) => {
            const isActive = day.day === activeMobileDay;
            const idx = days.findIndex((d) => d.day === day.day);
            return (
              <button key={day.day} type="button" onClick={() => setActiveMobileDay(day.day)}
                className={`ja-itinerary-day-btn${isActive ? " ja-itinerary-day-btn-active" : ""}`}>
                <div className={`ja-itinerary-day-btn-badge${isActive ? " ja-itinerary-day-btn-badge-active" : ""}`}>{getMobileDayBadge(day, idx)}</div>
                <div className="ja-itinerary-day-btn-headline">{getMobileDayHeadline(day)}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ja-itinerary-mobile-articles">{selectedDay ? renderDayArticle(selectedDay, selectedDayIndex, true) : null}</div>
      <div className="ja-itinerary-desktop-articles">{days.map((day, i) => renderDayArticle(day, i))}</div>
    </section>
  );
}
