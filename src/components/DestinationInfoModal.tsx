import React, { useEffect } from "react";
import { X, MapPinned, Route, ShoppingBag, Utensils, Info } from "lucide-react";
import type { DestinationGuide } from "../data/code1Itinerary";

interface DestinationInfoModalProps {
  guide: DestinationGuide | null;
  onClose: () => void;
}

export default function DestinationInfoModal({ guide, onClose }: DestinationInfoModalProps) {
  useEffect(() => {
    if (!guide) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("overflow-hidden");

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("overflow-hidden");
    };
  }, [guide, onClose]);

  if (!guide) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="destination-guide-title"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-stone-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stone-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#88B04B]">
              How to do it
            </div>
            <h2 id="destination-guide-title" className="text-xl font-serif font-bold text-[#0B3530]">
              {guide.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 p-2 text-stone-400 transition-colors hover:border-[#88B04B]/50 hover:text-[#0B3530]"
            aria-label="Close destination guide"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          <p className="text-sm leading-relaxed text-stone-600">{guide.summary}</p>

          {(guide.service || guide.ticket || guide.whereToBuy?.length) && (
            <div className="grid gap-3 md:grid-cols-3">
              {guide.service ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="mb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Service
                  </div>
                  <div className="text-sm font-medium text-[#0B3530]">{guide.service}</div>
                </div>
              ) : null}
              {guide.ticket ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="mb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Ticket
                  </div>
                  <div className="text-sm font-medium text-[#0B3530]">{guide.ticket}</div>
                </div>
              ) : null}
              {guide.whereToBuy?.length ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 md:col-span-1">
                  <div className="mb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Where to buy
                  </div>
                  <ul className="space-y-1 text-sm text-stone-600">
                    {guide.whereToBuy.map((place) => (
                      <li key={place}>{place}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}

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

          {guide.foodGuide ? (
            <div>
              <div className="mb-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0B3530]">
                What to eat nearby
              </div>
              <p className="rounded-2xl border border-stone-200 bg-[#F8FBF8] p-4 text-sm leading-relaxed text-stone-600">
                {guide.foodGuide.areaNote}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {guide.foodGuide.nearbyFoods.map((food) => (
                  <div key={food.name} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-[#0B3530]">{food.name}</h3>
                      <span className="rounded-full bg-[#88B04B]/15 px-2 py-1 text-[10px] font-mono font-bold text-[#0B3530]">
                        {food.estimatedPrice}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-600">{food.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="mb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Suggested order for 2
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600">{guide.foodGuide.suggestedOrderForTwo}</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="mb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                    Food tips
                  </div>
                  <ul className="space-y-2 text-sm leading-relaxed text-stone-600">
                    {guide.foodGuide.tips.map((tip) => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-xs italic leading-relaxed text-stone-500">{guide.foodGuide.priceNote}</p>
            </div>
          ) : null}

          <div>
            <div className="mb-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0B3530]">
              Easy steps
            </div>
            <ol className="space-y-2 text-sm leading-relaxed text-stone-600">
              {guide.steps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B3530] text-[10px] font-bold text-[#88B04B]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="mb-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0B3530]">
              Remember
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-stone-600">
              {guide.tips.map((tip) => (
                <li key={tip} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-xs">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
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
    <section className={`rounded-2xl border border-stone-200 bg-white p-4 shadow-xs ${fullWidth ? "md:col-span-2" : ""}`}>
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
    </section>
  );
}
