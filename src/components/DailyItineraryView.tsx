import React, { useMemo, useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonChip,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { Bus, Camera, Clock3, Train, Utensils, Bed, MapPin, Info, Footprints } from "lucide-react";
import type { DaySectionData, TimelineItemData, TagVariant } from "../data/code1Itinerary";
import RichText from "./RichText";

interface DailyItineraryViewProps {
  days: DaySectionData[];
  onInfoClick?: (item: TimelineItemData) => void;
  selectedMobileDay?: number;
  onSelectedMobileDayChange?: (day: number) => void;
}

type CategoryMeta = {
  label: string;
  icon: React.ReactNode;
  chipColor: string;
  cardBorder: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  train: {
    label: "TRAIN",
    icon: <Train size={14} />,
    chipColor: "#eff6ff",
    cardBorder: "rgba(191,219,254,0.7)",
  },
  bus: {
    label: "BUS",
    icon: <Bus size={14} />,
    chipColor: "#fffbeb",
    cardBorder: "rgba(252,211,77,0.5)",
  },
  food: {
    label: "FOOD",
    icon: <Utensils size={14} />,
    chipColor: "#fff1f2",
    cardBorder: "rgba(254,205,211,0.6)",
  },
  spot: {
    label: "SIGHTSEEING",
    icon: <Camera size={14} />,
    chipColor: "#f5f3ff",
    cardBorder: "rgba(221,214,254,0.6)",
  },
  hotel: {
    label: "HOTEL",
    icon: <Bed size={14} />,
    chipColor: "#ecfdf5",
    cardBorder: "rgba(167,243,208,0.6)",
  },
  walk: {
    label: "WALK",
    icon: <Footprints size={14} />,
    chipColor: "#fafaf9",
    cardBorder: "rgba(231,229,228,0.6)",
  },
  free: {
    label: "FREE",
    icon: <MapPin size={14} />,
    chipColor: "#f0f9ff",
    cardBorder: "rgba(186,230,253,0.6)",
  },
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

const IMAGE_LABELS: Record<string, string> = {
  "MORNING ASCENT": "Morning Ascent",
  "NIGHT ILLUMINATION": "Night Illumination",
};

const getMapsUrl = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(query)}&travelmode=driving`;

const splitDayTitle = (title: string) => {
  const normalizedTitle = title.replace(/\s*[.-]\s*/g, " · ");
  const [rawLabel, rawDate] = normalizedTitle.split("·").map((part) => part.trim());
  return {
    label: rawLabel || title,
    date: rawDate || title,
  };
};

const getMobileDayBadge = (day: DaySectionData, dayIndex: number) => {
  const { label } = splitDayTitle(day.title);
  if (/flight day/i.test(label)) return "Flight Day";
  return `Day ${dayIndex}`;
};

const getMobileDayHeadline = (day: DaySectionData) => splitDayTitle(day.title).date;

export default function DailyItineraryView({
  days,
  onInfoClick,
  selectedMobileDay,
  onSelectedMobileDayChange,
}: DailyItineraryViewProps) {
  const [internalActiveMobileDay, setInternalActiveMobileDay] = useState<number>(days[0]?.day ?? 0);
  const activeMobileDay = selectedMobileDay ?? internalActiveMobileDay;
  const setActiveMobileDay = onSelectedMobileDayChange ?? setInternalActiveMobileDay;

  const selectedDay = useMemo(
    () => days.find((day) => day.day === activeMobileDay) ?? days[0] ?? null,
    [activeMobileDay, days],
  );
  const selectedDayIndex = selectedDay ? days.findIndex((day) => day.day === selectedDay.day) : -1;

  const renderDayArticle = (day: DaySectionData, displayDayNumber: number, mobileOnly = false) => (
    <article
      key={day.day}
      className={`space-y-5 ${mobileOnly ? "block md:hidden" : "hidden md:block"}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B3530] shadow-xs">
          <span className="text-lg font-serif font-bold leading-none text-white">{displayDayNumber}</span>
        </div>
        <div>
          <h3 className="text-lg font-serif font-bold text-stone-850">{day.title}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-mono text-stone-400">
            <span>{day.budgetLabel}</span>
          </p>
        </div>
      </div>

      {day.images?.length ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:ml-16">
          {day.images.map((image) => (
            <div
              key={image.title}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200/60 bg-stone-200 shadow-sm"
            >
              <img
                src={image.url}
                alt={image.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent p-5">
                <span className="block text-[9px] font-mono font-bold tracking-widest text-[#88B04B]">
                  {image.label}
                </span>
                <h4 className="mt-1 text-lg font-serif font-bold text-white">{image.title}</h4>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative ml-3 space-y-4 border-l-2 border-stone-200 pl-4 md:ml-16 md:pl-6">
        {day.items.map((item) => {
          const meta = CATEGORY_META[item.category] ?? CATEGORY_META.free;
          return (
            <div key={item.id} className="relative">
              <div className="absolute -left-[21px] top-5 h-4 w-4 rounded-full border-4 border-stone-50 bg-[#88B04B] shadow-xs md:-left-[31px]" />

              <IonCard className="ja-itinerary-item-card" style={{ "--ja-item-border": meta.cardBorder } as React.CSSProperties}>
                <IonCardContent>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <IonChip className="ja-itinerary-chip" style={{ background: meta.chipColor, color: "#1e293b" }}>
                          <span className="flex items-center gap-1">
                            {meta.icon}
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider">{meta.label}</span>
                          </span>
                        </IonChip>
                        <IonChip className="ja-itinerary-chip ja-itinerary-time-chip">
                          <Clock3 size={11} />
                          {item.time}
                        </IonChip>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold font-serif text-stone-800">
                          <a
                            href={getMapsUrl(item.mapQuery)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 underline decoration-[#88B04B]/70 underline-offset-2 transition-colors hover:text-[#18534C]"
                            aria-label={`Open ${item.title} in Google Maps`}
                          >
                            {item.title}
                          </a>
                        </h4>
                        <p className="text-xs leading-relaxed text-stone-500">
                          <RichText segments={item.description} />
                        </p>
                      </div>

                      {item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag) => {
                            const tagColors = TAG_VARIANT_COLORS[tag.variant] ?? TAG_VARIANT_COLORS.free;
                            return (
                              <IonChip
                                key={`${tag.variant}-${tag.label}`}
                                className="ja-itinerary-tag-chip"
                                style={{ background: tagColors.bg, color: tagColors.text, border: `1px solid ${tagColors.border}` }}
                              >
                                {tag.label}
                              </IonChip>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                      {item.cost ? (
                        <div className="rounded-xl bg-[#0B3530] px-3 py-2 text-right text-stone-100">
                          <span className="block text-[8px] uppercase tracking-wider text-[#88B04B]">Estimated</span>
                          <span className="block py-0.5 font-serif text-xs font-bold text-white">{item.cost}</span>
                        </div>
                      ) : <div />}

                      {onInfoClick ? (
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() => onInfoClick(item)}
                          className="ja-itinerary-action-btn"
                        >
                          <IonIcon icon={informationCircleOutline} slot="start" />
                          Guide
                        </IonButton>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <IonButton
                      fill="clear"
                      size="small"
                      href={getMapsUrl(item.mapQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ja-itinerary-action-btn"
                    >
                      Open in Maps
                    </IonButton>
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
    <section className="max-w-7xl mx-auto bg-stone-50 px-4 py-6 pb-20 md:px-8">
      <div className="mb-8 flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#0B3530] md:text-2xl">Daily Itinerary</h2>
          <p className="mt-0.5 text-xs font-sans text-stone-400">Detailed timeline and excursion checkpoints</p>
        </div>
        <div className="flex gap-2 font-mono text-[10px] font-bold uppercase select-none">
          <IonChip className="ja-itinerary-stats-chip ja-itinerary-stats-chip-dark">
            4 Days
          </IonChip>
          <IonChip className="ja-itinerary-stats-chip">
            2 Cities
          </IonChip>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs md:hidden">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#88B04B]">Browse by Day</p>
            <h3 className="mt-1 text-sm font-serif font-bold text-[#0B3530]">
              {selectedDay?.title ?? "Itinerary"}
            </h3>
          </div>
          <IonChip className="ja-itinerary-stats-chip">
            {selectedDay?.items.length ?? 0} Stops
          </IonChip>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((day) => {
            const isActive = day.day === activeMobileDay;
            const dayIndex = days.findIndex((candidate) => candidate.day === day.day);
            return (
              <button
                key={day.day}
                type="button"
                onClick={() => setActiveMobileDay(day.day)}
                className={`min-w-[148px] rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-[#0B3530] bg-[#0B3530] text-white"
                    : "border-stone-200 bg-stone-50 text-stone-700"
                }`}
              >
                <div className={`text-[10px] font-mono uppercase tracking-[0.2em] ${isActive ? "text-[#88B04B]" : "text-stone-400"}`}>
                  {getMobileDayBadge(day, dayIndex)}
                </div>
                <div className="mt-1 text-[13px] font-semibold leading-snug break-words">
                  {getMobileDayHeadline(day)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-12 md:hidden">
        {selectedDay ? renderDayArticle(selectedDay, selectedDayIndex + 1, true) : null}
      </div>

      <div className="hidden space-y-12 md:block">
        {days.map((day, index) => renderDayArticle(day, index + 1))}
      </div>
    </section>
  );
}
