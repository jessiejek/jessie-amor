import React from "react";
import type { TipCardData } from "../data/code1Itinerary";
import RichText from "./RichText";

interface TipCardProps {
  tip: TipCardData;
  key?: React.Key;
}

export default function TipCard({ tip }: TipCardProps) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="mb-3 text-xl" aria-hidden="true">
        {tip.icon}
      </div>
      <div className="text-sm leading-relaxed text-stone-600">
        <RichText segments={tip.description} />
      </div>
    </article>
  );
}
