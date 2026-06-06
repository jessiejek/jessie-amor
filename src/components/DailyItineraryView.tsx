import React from "react";
import { Bus, Camera, Clock3, Train, Utensils, Bed, MapPin, Info, Footprints } from "lucide-react";
import type { DaySectionData, TimelineItemData, TagVariant } from "../data/code1Itinerary";
import RichText from "./RichText";

interface DailyItineraryViewProps {
  days: DaySectionData[];
  onInfoClick?: (item: TimelineItemData) => void;
}

type CategoryMeta = {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
  cardClass: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  train: {
    label: "TRAIN",
    icon: <Train size={14} />,
    badgeClass: "bg-blue-50 text-blue-800",
    cardClass: "border-blue-200/70",
  },
  bus: {
    label: "BUS",
    icon: <Bus size={14} />,
    badgeClass: "bg-amber-50 text-amber-800",
    cardClass: "border-amber-200/70",
  },
  food: {
    label: "FOOD",
    icon: <Utensils size={14} />,
    badgeClass: "bg-rose-50 text-rose-800",
    cardClass: "border-rose-200/70",
  },
  spot: {
    label: "SIGHTSEEING",
    icon: <Camera size={14} />,
    badgeClass: "bg-violet-50 text-violet-800",
    cardClass: "border-violet-200/70",
  },
  hotel: {
    label: "HOTEL",
    icon: <Bed size={14} />,
    badgeClass: "bg-emerald-50 text-emerald-800",
    cardClass: "border-emerald-200/70",
  },
  walk: {
    label: "WALK",
    icon: <Footprints size={14} />,
    badgeClass: "bg-stone-100 text-stone-700",
    cardClass: "border-stone-200/70",
  },
  free: {
    label: "FREE",
    icon: <MapPin size={14} />,
    badgeClass: "bg-sky-50 text-sky-800",
    cardClass: "border-sky-200/70",
  },
};

const TAG_STYLES: Record<TagVariant, string> = {
  train: "bg-blue-50 text-blue-800 border-blue-100",
  bus: "bg-amber-50 text-amber-800 border-amber-100",
  food: "bg-rose-50 text-rose-800 border-rose-100",
  walk: "bg-stone-100 text-stone-700 border-stone-200",
  spot: "bg-violet-50 text-violet-800 border-violet-100",
  hotel: "bg-emerald-50 text-emerald-800 border-emerald-100",
  free: "bg-sky-50 text-sky-800 border-sky-100",
};

const IMAGE_LABELS: Record<string, string> = {
  "MORNING ASCENT": "Morning Ascent",
  "NIGHT ILLUMINATION": "Night Illumination",
};

export default function DailyItineraryView({ days, onInfoClick }: DailyItineraryViewProps) {
  return (
    <section className="max-w-7xl mx-auto bg-stone-50 px-4 py-6 pb-20 md:px-8">
      <div className="mb-8 flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#0B3530] md:text-2xl">Daily Itinerary</h2>
          <p className="mt-0.5 text-xs font-sans text-stone-400">Detailed timeline and excursion checkpoints</p>
        </div>
        <div className="flex gap-2 font-mono text-[10px] font-bold uppercase select-none">
          <span className="rounded-md bg-[#0B3530] px-2 py-1 text-[#88B04B]">4 Days</span>
          <span className="rounded-md bg-[#18534C]/15 px-2 py-1 text-[#0B3530]">2 Cities</span>
        </div>
      </div>

      <div className="space-y-12">
        {days.map((day) => (
          <article key={day.day} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B3530] shadow-xs">
                <span className="text-lg font-serif font-bold leading-none text-white">{day.day}</span>
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

            <div className="relative ml-6 space-y-4 border-l-2 border-stone-200 pl-6 md:ml-16">
              {day.items.map((item) => {
                const meta = CATEGORY_META[item.category] ?? CATEGORY_META.free;
                return (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[31px] top-5 h-4 w-4 rounded-full border-4 border-stone-50 bg-[#88B04B] shadow-xs" />

                    <div className={`rounded-2xl border bg-white p-4 md:p-5 shadow-xs transition-colors hover:border-stone-300 ${meta.cardClass}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 ${meta.badgeClass}`}>
                              {meta.icon}
                              {meta.label}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-stone-500">
                              <Clock3 size={11} />
                              {item.time}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold font-serif text-stone-800">{item.title}</h4>
                            <p className="text-xs leading-relaxed text-stone-500">
                              <RichText segments={item.description} />
                            </p>
                          </div>

                          {item.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag) => (
                                <span
                                  key={`${tag.variant}-${tag.label}`}
                                  className={`rounded-full border px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${TAG_STYLES[tag.variant]}`}
                                >
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          {item.cost ? (
                            <div className="rounded-xl bg-[#0B3530] px-3 py-2 text-right text-stone-100">
                              <span className="block text-[8px] uppercase tracking-wider text-[#88B04B]">Estimated</span>
                              <span className="block py-0.5 font-serif text-xs font-bold text-white">{item.cost}</span>
                            </div>
                          ) : null}

                          {onInfoClick ? (
                            <button
                              type="button"
                              onClick={() => onInfoClick(item)}
                              className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 transition-colors hover:border-[#88B04B]/50 hover:text-[#0B3530]"
                            >
                              <Info size={11} />
                              Guide
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
