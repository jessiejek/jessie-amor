import { TRIP_LIST } from "../data/trips";

/**
 * Landing page at "/". Lets the traveller choose which trip ("travel vlog")
 * to open. Each card is a real link, so selecting one is a full-page
 * navigation into that trip's mounted app (/mysg or /khaoshiong).
 */
export default function TripPicker() {
  return (
    <div className="ja-trip-picker">
      <div className="ja-trip-picker-inner">
        <header className="ja-trip-picker-head">
          <p className="ja-trip-picker-eyebrow">Jessie &amp; Amor</p>
          <h1 className="ja-trip-picker-title">Choose your trip</h1>
          <p className="ja-trip-picker-sub">
            Pick which travel plan to open. Budget, map, diary and notes are kept
            separate for each trip.
          </p>
        </header>

        <div className="ja-trip-picker-grid">
          {TRIP_LIST.map((trip) => (
            <a
              key={trip.slug}
              className="ja-trip-card"
              href={`${trip.routeBase}/`}
              style={{ ["--trip-accent" as string]: trip.accent }}
            >
              <span className="ja-trip-card-emoji" aria-hidden="true">
                {trip.emoji}
              </span>
              <span className="ja-trip-card-name">{trip.name}</span>
              <span className="ja-trip-card-location">{trip.location}</span>
              <span className="ja-trip-card-dates">{trip.dateLabel}</span>
              <span className="ja-trip-card-go">Open trip →</span>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .ja-trip-picker {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px calc(32px + env(safe-area-inset-bottom));
          background: radial-gradient(circle at 20% 0%, #12433c 0%, #0b3530 45%, #072420 100%);
          color: #f8fafc;
          box-sizing: border-box;
        }
        .ja-trip-picker-inner { width: 100%; max-width: 720px; }
        .ja-trip-picker-head { text-align: center; margin-bottom: 28px; }
        .ja-trip-picker-eyebrow {
          text-transform: uppercase; letter-spacing: .18em; font-size: 12px;
          font-weight: 600; opacity: .7; margin: 0 0 10px;
        }
        .ja-trip-picker-title { font-size: 30px; font-weight: 700; margin: 0 0 10px; }
        .ja-trip-picker-sub { font-size: 14px; line-height: 1.5; opacity: .78; margin: 0 auto; max-width: 440px; }
        .ja-trip-picker-grid {
          display: grid; gap: 16px;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }
        .ja-trip-card {
          display: flex; flex-direction: column; gap: 6px;
          padding: 22px 20px 20px;
          border-radius: 18px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
          border-top: 4px solid var(--trip-accent, #1d4e89);
          text-decoration: none; color: inherit;
          transition: transform .15s ease, background .15s ease, border-color .15s ease;
        }
        .ja-trip-card:hover, .ja-trip-card:focus-visible {
          transform: translateY(-3px);
          background: rgba(255,255,255,.11);
          border-color: rgba(255,255,255,.28);
          outline: none;
        }
        .ja-trip-card-emoji { font-size: 30px; }
        .ja-trip-card-name { font-size: 19px; font-weight: 700; }
        .ja-trip-card-location { font-size: 13px; opacity: .8; }
        .ja-trip-card-dates { font-size: 13px; opacity: .8; }
        .ja-trip-card-go { margin-top: 10px; font-size: 13px; font-weight: 600; color: #7fd4c1; }
      `}</style>
    </div>
  );
}
