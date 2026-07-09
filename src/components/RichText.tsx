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

        if (segment.kind === "strike") {
          return (
            <s key={`${segment.kind}-${index}`} className="ja-rt-strike">
              {segment.value}
            </s>
          );
        }

        return (
          <span key={`${segment.kind}-${index}`} className="ja-rt-inline-wrap">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(segment.mapQuery)}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="ja-rt-link"
            >
              <span className="ja-rt-link-label">{segment.label}</span>
              {segment.placeType ? <span className="ja-rt-link-type">{segment.placeType}</span> : null}
            </a>
          </span>
        );
      })}
    </>
  );
}
