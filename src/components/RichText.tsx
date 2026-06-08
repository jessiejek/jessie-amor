import React from "react";
import type { Segment } from "../data/code1Itinerary";

interface RichTextProps {
  segments: Segment[];
}

export default function RichText({ segments }: RichTextProps) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.kind === "text") {
          return <span key={`${segment.kind}-${index}`}>{segment.value}</span>;
        }

        if (segment.kind === "strong") {
          return <strong key={`${segment.kind}-${index}`}>{segment.value}</strong>;
        }

        return (
          <span key={`${segment.kind}-${index}`} className="inline-flex items-center">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(segment.mapQuery)}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-[#D8E6E2] bg-white px-1.5 py-0.5 font-medium text-[#0B3530] underline decoration-[#88B04B]/70 underline-offset-2 transition-colors hover:border-[#88B04B]/60 hover:bg-[#F5FAF0] hover:text-[#18534C]"
            >
              <span className="font-semibold">{segment.label}</span>
              {segment.placeType ? <span className="text-[10px] text-stone-500">{segment.placeType}</span> : null}
            </a>
          </span>
        );
      })}
    </>
  );
}
