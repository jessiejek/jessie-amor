import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
} from "@ionic/react";
import type { HeroData } from "../data/code1Itinerary";
import RichText from "./RichText";
import heroImage from "../assets/images/malaysia_singapore_hero_019e9d4d.png";

interface HeroProps {
  hero: HeroData;
}

export default function Hero({ hero }: HeroProps) {
  return (
    <div className="ja-hero">
      <div className="ja-hero-image-wrap">
        <img
          src={heroImage}
          alt="Malaysia and Singapore skyline at sunset"
          className="ja-hero-image"
          referrerPolicy="no-referrer"
        />
        <div className="ja-hero-overlay" />
      </div>

      <IonCard className="ja-hero-info-card">
        <IonCardHeader className="ja-hero-card-header">
          <IonCardSubtitle className="ja-hero-subtitle">
            {hero.eyebrow}
          </IonCardSubtitle>
          <IonCardTitle className="ja-hero-title">
            {hero.title}
            {hero.subtitle ? <span className="ja-hero-subtitle-block">{hero.subtitle}</span> : null}
          </IonCardTitle>
        </IonCardHeader>

        <div className="ja-hero-underline" />

        {hero.meta.length > 0 ? (
          <IonCardContent className="ja-hero-card-content">
            <div className="ja-hero-meta-row">
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
            <p className="ja-hero-note-text">
              <RichText segments={hero.note} />
            </p>
          </IonCardContent>
        ) : null}
      </IonCard>
    </div>
  );
}
