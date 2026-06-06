import React from "react";
import { Info } from "lucide-react";
import type { AlertBoxData } from "../data/code1Itinerary";
import RichText from "./RichText";

interface AlertBoxProps {
  alert: AlertBoxData;
}

export default function AlertBox({ alert }: AlertBoxProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-4 no-print">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 md:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-2 text-amber-700">
            <Info size={16} />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[#0B3530]">{alert.title}</div>
            <p className="text-xs leading-relaxed text-stone-600">
              <RichText segments={alert.body} />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
