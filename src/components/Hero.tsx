import React from "react";
import { IonChip } from "@ionic/react";
import type { HeroData } from "../data/code1Itinerary";
import RichText from "./RichText";
import { activeTrip } from "../lib/activeTrip";
import heroImage from "../assets/images/malaysia_singapore_hero.webp";

interface HeroProps {
  hero: HeroData;
}

export default function Hero({ hero }: HeroProps) {
  const usePhoto = activeTrip?.slug !== "khaoshiong";
  return (
    <div className="ja-hero">
      <div className="ja-hero-image-wrap">
        {usePhoto ? (
          <img
            src={heroImage}
            alt="Malaysia and Singapore skyline at sunset"
            className="ja-hero-image"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="ja-hero-image"
            aria-hidden="true"
            style={{ background: "linear-gradient(135deg, #1D4E89 0%, #123a63 55%, #0b2540 100%)" }}
          />
        )}
        <div className="ja-hero-overlay" />
        <div className="ja-hero-info-card">
          <div className="ja-hero-card-header">
            <div className="ja-hero-subtitle">{hero.eyebrow}</div>
            <h2 className="ja-hero-title">
              {hero.title}
              {hero.subtitle ? <span className="ja-hero-subtitle-block">{hero.subtitle}</span> : null}
            </h2>
          </div>
          <div className="ja-hero-underline" />
        </div>
      </div>

      {hero.meta.length > 0 && (
        <div className="ja-hero-legend">
          {hero.meta.map((item) => (
            <IonChip key={item} className="ja-hero-chip">{item}</IonChip>
          ))}
        </div>
      )}

      {hero.note.length > 0 && (
        <div className="ja-hero-note">
          <p className="ja-hero-note-text">
            <RichText segments={hero.note} />
          </p>
        </div>
      )}
    </div>
  );
}
