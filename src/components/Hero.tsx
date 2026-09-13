import React from "react";
import { IonChip } from "@ionic/react";
import type { HeroData } from "../data/code1Itinerary";
import RichText from "./RichText";
import { activeTrip } from "../lib/activeTrip";
import mySgHero from "../assets/images/malaysia_singapore_hero.webp";
import kaohsiungHero from "../assets/images/kaohsiung_hero.svg";

interface HeroProps {
  hero: HeroData;
}

const HERO_BY_TRIP: Record<string, { src: string; alt: string }> = {
  khaoshiong: { src: kaohsiungHero, alt: "Kaohsiung harbour skyline at golden hour" },
};

export default function Hero({ hero }: HeroProps) {
  const heroArt = (activeTrip && HERO_BY_TRIP[activeTrip.slug]) ?? {
    src: mySgHero,
    alt: "Malaysia and Singapore skyline at sunset",
  };
  return (
    <div className="ja-hero">
      <div className="ja-hero-image-wrap">
        <img
          src={heroArt.src}
          alt={heroArt.alt}
          className="ja-hero-image"
          referrerPolicy="no-referrer"
        />
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
