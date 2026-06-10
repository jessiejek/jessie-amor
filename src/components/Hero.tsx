import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonText,
} from "@ionic/react";
import type { HeroData } from "../data/code1Itinerary";
import RichText from "./RichText";
import heroImage from "../assets/images/malaysia_singapore_hero_019e9d4d.png";

interface HeroProps {
  hero: HeroData;
}

export default function Hero({ hero }: HeroProps) {
  return (
    <div className="hero-intro-section relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2 no-print bg-stone-50">
      <div className="hero-image-wrapper group relative overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[16/6] bg-stone-200 shadow-lg">
        <img
          src={heroImage}
          alt="Malaysia and Singapore skyline at sunset"
          className="hero-image absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/65 via-stone-800/35 to-transparent" />
      </div>

      <IonCard className="ja-hero-card absolute bottom-4 left-4 max-w-lg md:bottom-8 md:left-8">
        <IonCardHeader className="ja-hero-card-header">
          <IonCardSubtitle className="ja-hero-subtitle text-[13px] font-mono font-bold uppercase tracking-[0.25em] md:text-sm">
            {hero.eyebrow}
          </IonCardSubtitle>
          <IonCardTitle className="ja-hero-title text-xl font-serif font-bold leading-tight tracking-tight md:text-3xl">
            {hero.title}
            {hero.subtitle ? <span className="block text-[#18534C]">{hero.subtitle}</span> : null}
          </IonCardTitle>
        </IonCardHeader>

        <div className="ml-4 h-1 w-16 rounded-full bg-[#88B04B]" />

        {hero.meta.length > 0 ? (
          <IonCardContent className="ja-hero-card-content">
            <div className="flex flex-wrap gap-2">
              {hero.meta.map((item) => (
                <IonChip key={item} className="ja-hero-chip">
                  {item}
                </IonChip>
              ))}
            </div>
          </IonCardContent>
        ) : null}

        {hero.note.length > 0 ? (
          <IonCardContent className="ja-hero-card-content">
            <p className="text-[13px] leading-relaxed text-stone-500 md:text-sm">
              <RichText segments={hero.note} />
            </p>
          </IonCardContent>
        ) : null}
      </IonCard>
    </div>
  );
}
