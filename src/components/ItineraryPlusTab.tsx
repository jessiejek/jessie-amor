import React, { useEffect, useState } from "react";
import { IonButton, IonCheckbox, IonIcon, IonInput, IonSpinner } from "@ionic/react";
import { pencilOutline, checkmarkOutline, closeOutline, addOutline, trashOutline, downloadOutline } from "ionicons/icons";
import type { TripProfile, PdfItineraryDay, PdfFlightLeg, TripHotel } from "../types";
import { buildDefaultItineraryDays, buildDefaultFlightLegs, generateItineraryPlusPdf } from "../utils/generateImmigrationPdf";

interface ItineraryPlusTabProps {
  tripProfile: TripProfile | null;
  onSave: (profile: TripProfile) => Promise<void>;
  isSaving: boolean;
  canEdit: boolean;
}

const DEFAULT_HOTELS: TripHotel[] = [
  { hotel: "Travelodge KL City Centre", location: "Kuala Lumpur", checkIn: "July 12, 2026", checkOut: "July 15, 2026" },
  { hotel: "Hotel Classic by Venue", location: "Joo Chiat, Singapore", checkIn: "July 15, 2026", checkOut: "July 16, 2026" },
];

const DAY_BAND_COLORS = ["#DCEAFE", "#DCF7E3", "#FDEBD3", "#F3E1FB", "#FDE1E1", "#E1F5F3"];

// Fill an OOTD value in on the first row of its time range and leave the rows
// after it blank — the value spans (rowSpan) down through those blank rows.
// Type a lone "," on a row to explicitly stop the range there: that row shows
// nothing and breaks the merge, so the rows after it go back to being blank,
// unmerged cells instead of continuing to inherit the value above.
function computeOotdSpans(items: { ootdJessie?: string; ootdAmor?: string }[], field: "ootdJessie" | "ootdAmor"): number[] {
  const spans = new Array(items.length).fill(1);
  let activeStart = -1;
  items.forEach((item, i) => {
    const raw = (item[field] ?? "").trim();
    if (raw === ",") {
      spans[i] = 1;
      activeStart = -1;
    } else if (raw) {
      activeStart = i;
      spans[i] = 1;
    } else if (activeStart !== -1) {
      spans[activeStart] += 1;
      spans[i] = 0;
    }
  });
  return spans;
}

const ootdDisplayValue = (raw: string | undefined) => ((raw ?? "").trim() === "," ? "" : raw ?? "");

const TOGGLEABLE_COLUMNS: { key: "destination" | "fees" | "ootdJessie" | "ootdAmor"; label: string }[] = [
  { key: "destination", label: "Destination" },
  { key: "fees", label: "Fees" },
  { key: "ootdJessie", label: "OOTD — Jessie" },
  { key: "ootdAmor", label: "OOTD — Amor" },
];

const COLUMN_VISIBILITY_STORAGE_KEY = "ja-itplus-column-visibility";

function loadColumnVisibility(): Record<string, boolean> {
  const defaults: Record<string, boolean> = { destination: true, fees: true, ootdJessie: true, ootdAmor: true };
  try {
    const raw = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

const buildSavePayload = (current: TripProfile | null, itineraryDays: PdfItineraryDay[], flightLegs: PdfFlightLeg[]): TripProfile => ({
  id: current?.id ?? crypto.randomUUID(),
  tripKey: current?.tripKey ?? "",
  documentTitle: current?.documentTitle || "Jessie & Amor's Malaysia - Singapore Trip 2026",
  traveler1: current?.traveler1 ?? "Jessie Jay Q. Rubi",
  traveler2: current?.traveler2 ?? "Rizza Amor L. Caguco",
  purpose: current?.purpose ?? "Tourism - sightseeing, cultural exploration, culinary experience",
  duration: current?.duration ?? "5 days",
  route: current?.route ?? "Kuala Lumpur, Malaysia - Malacca (day trip) - Singapore",
  flightLegs,
  hotels: current?.hotels?.length ? current.hotels : DEFAULT_HOTELS,
  itineraryDays,
});

export default function ItineraryPlusTab({ tripProfile, onSave, isSaving, canEdit }: ItineraryPlusTabProps) {
  const [days, setDays] = useState<PdfItineraryDay[]>(() => (tripProfile?.itineraryDays?.length ? tripProfile.itineraryDays : buildDefaultItineraryDays()));
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(loadColumnVisibility);

  const toggleColumnVisibility = (key: string, value: boolean) => {
    setColumnVisibility((prev) => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // Grid columns are built dynamically so hidden columns don't leave dead
  // space, and Activities always spans from column 1 up through the last
  // non-OOTD column (or the whole row, if no OOTD columns are shown at all).
  const EDIT_GRID_TEMPLATE = "1fr 1.8fr 0.9fr 1.3fr 1.3fr";
  const viewGridTemplateColumns = [
    "1fr",
    columnVisibility.destination ? "1.8fr" : null,
    columnVisibility.fees ? "0.9fr" : null,
    columnVisibility.ootdJessie ? "1.3fr" : null,
    columnVisibility.ootdAmor ? "1.3fr" : null,
  ].filter(Boolean).join(" ");
  const viewNonOotdColumnCount = 1 + (columnVisibility.destination ? 1 : 0) + (columnVisibility.fees ? 1 : 0);

  useEffect(() => {
    if (isEditing) return;
    setDays(tripProfile?.itineraryDays?.length ? tripProfile.itineraryDays : buildDefaultItineraryDays());
  }, [tripProfile, isEditing]);

  const updateDayTitle = (dayIndex: number, value: string) => {
    setDays((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, title: value } : d)));
  };
  const addDay = () => setDays((prev) => [...prev, { day: prev.length ? Math.max(...prev.map((d) => d.day)) + 1 : 1, title: "", items: [] }]);
  const removeDay = (dayIndex: number) => setDays((prev) => prev.filter((_, i) => i !== dayIndex));

  const updateItem = (dayIndex: number, itemIndex: number, field: "time" | "destination" | "title" | "fees" | "ootdJessie" | "ootdAmor", value: string) => {
    setDays((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, items: d.items.map((it, j) => (j === itemIndex ? { ...it, [field]: value } : it)) } : d)));
  };
  const addItem = (dayIndex: number) => setDays((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, items: [...d.items, { time: "", title: "" }] } : d)));
  const removeItem = (dayIndex: number, itemIndex: number) => setDays((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, items: d.items.filter((_, j) => j !== itemIndex) } : d)));

  const handleStartEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setDays(tripProfile?.itineraryDays?.length ? tripProfile.itineraryDays : buildDefaultItineraryDays());
    setIsEditing(false);
  };
  const handleSave = async () => {
    const flightLegs = tripProfile?.flightLegs?.length ? tripProfile.flightLegs : buildDefaultFlightLegs();
    await onSave(buildSavePayload(tripProfile, days, flightLegs));
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="ja-itplus-page">
      <div className="ja-itplus-header">
        <div>
          <h2 className="ja-itplus-title">Itinerary+</h2>
          <p className="ja-itplus-subtitle">Day / Time / Destination / Activities / Fees / OOTD — spreadsheet view. Editing here updates the same data as the Downloadable PDF.</p>
        </div>
        <div className="ja-itplus-header-actions">
          <IonButton fill="outline" size="small" onClick={() => generateItineraryPlusPdf(buildSavePayload(tripProfile, days, tripProfile?.flightLegs?.length ? tripProfile.flightLegs : buildDefaultFlightLegs()), columnVisibility)}>
            <IonIcon icon={downloadOutline} slot="start" />Download
          </IonButton>
          {canEdit && (
            isEditing ? (
              <>
                <IonButton fill="outline" size="small" onClick={handleCancel}><IonIcon icon={closeOutline} slot="start" />Cancel</IonButton>
                <IonButton size="small" disabled={isSaving} onClick={handleSave}>
                  {isSaving ? <IonSpinner name="crescent" slot="start" /> : <IonIcon icon={checkmarkOutline} slot="start" />}
                  {isSaving ? "Saving..." : saved ? "Saved!" : "Save"}
                </IonButton>
              </>
            ) : (
              <IonButton fill="outline" size="small" onClick={handleStartEdit}><IonIcon icon={pencilOutline} slot="start" />Edit</IonButton>
            )
          )}
        </div>
      </div>

      {isEditing && (
        <div className="ja-itplus-column-toggles">
          <span className="ja-itplus-column-toggles-label">Show columns:</span>
          {TOGGLEABLE_COLUMNS.map((col) => (
            <label key={col.key} className="ja-itplus-column-toggle">
              <IonCheckbox
                checked={columnVisibility[col.key]}
                onIonChange={(e) => toggleColumnVisibility(col.key, e.detail.checked)}
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
      )}

      {days.map((day, dayIndex) => (
        <div key={dayIndex} className="ja-itplus-day">
          <div className="ja-itplus-day-band" style={{ background: DAY_BAND_COLORS[dayIndex % DAY_BAND_COLORS.length] }}>
            {isEditing ? (
              <>
                <IonInput value={day.title} onIonInput={(e) => updateDayTitle(dayIndex, String(e.detail.value ?? ""))} className="ja-itplus-day-title-input" placeholder="Day title" />
                <IonButton fill="clear" color="danger" size="small" onClick={() => removeDay(dayIndex)}><IonIcon icon={trashOutline} /></IonButton>
              </>
            ) : (
              <span className="ja-itplus-day-band-text">{day.title || "Untitled day"}</span>
            )}
          </div>

          <div
            className="ja-itplus-grid"
            style={{
              gridTemplateColumns: isEditing ? EDIT_GRID_TEMPLATE : viewGridTemplateColumns,
              ["--ja-itplus-activities-end" as any]: isEditing ? -1 : viewNonOotdColumnCount + 1,
            }}
          >
            <div className="ja-itplus-grid-head">Time</div>
            {(isEditing || columnVisibility.destination) && <div className="ja-itplus-grid-head">Destination</div>}
            {(isEditing || columnVisibility.fees) && <div className="ja-itplus-grid-head">Fees</div>}
            {(isEditing || columnVisibility.ootdJessie) && <div className="ja-itplus-grid-head">OOTD — Jessie</div>}
            {(isEditing || columnVisibility.ootdAmor) && <div className="ja-itplus-grid-head">OOTD — Amor</div>}

            {(() => {
              const jessieSpans = computeOotdSpans(day.items, "ootdJessie");
              const amorSpans = computeOotdSpans(day.items, "ootdAmor");
              return day.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  {isEditing ? (
                    <>
                      <div className="ja-itplus-cell"><IonInput value={item.time} onIonInput={(e) => updateItem(dayIndex, itemIndex, "time", String(e.detail.value ?? ""))} className="ja-itplus-cell-input" placeholder="8:00 AM" /></div>
                      <div className="ja-itplus-cell"><IonInput value={item.destination ?? ""} onIonInput={(e) => updateItem(dayIndex, itemIndex, "destination", String(e.detail.value ?? ""))} className="ja-itplus-cell-input" /></div>
                      <div className="ja-itplus-cell"><IonInput value={item.fees ?? ""} onIonInput={(e) => updateItem(dayIndex, itemIndex, "fees", String(e.detail.value ?? ""))} className="ja-itplus-cell-input" /></div>
                      <div className="ja-itplus-cell"><IonInput value={item.ootdJessie ?? ""} onIonInput={(e) => updateItem(dayIndex, itemIndex, "ootdJessie", String(e.detail.value ?? ""))} className="ja-itplus-cell-input" placeholder="blank continues above, , stops" /></div>
                      <div className="ja-itplus-cell"><IonInput value={item.ootdAmor ?? ""} onIonInput={(e) => updateItem(dayIndex, itemIndex, "ootdAmor", String(e.detail.value ?? ""))} className="ja-itplus-cell-input" placeholder="blank continues above, , stops" /></div>
                      <div className="ja-itplus-cell-activities ja-itplus-cell-activities-edit">
                        <IonInput value={item.title} onIonInput={(e) => updateItem(dayIndex, itemIndex, "title", String(e.detail.value ?? ""))} className="ja-itplus-cell-input" placeholder="Activities" />
                        <IonButton fill="clear" color="danger" size="small" onClick={() => removeItem(dayIndex, itemIndex)}><IonIcon icon={trashOutline} /></IonButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="ja-itplus-cell">{item.time || "—"}</div>
                      {columnVisibility.destination && <div className="ja-itplus-cell">{item.destination || "—"}</div>}
                      {columnVisibility.fees && <div className="ja-itplus-cell">{item.fees || "—"}</div>}
                      {columnVisibility.ootdJessie && jessieSpans[itemIndex] > 0 && (
                        <div className={`ja-itplus-cell${ootdDisplayValue(item.ootdJessie) ? " ja-itplus-ootd-cell" : ""}`} style={{ gridRow: `span ${jessieSpans[itemIndex] * 2}` }}>{ootdDisplayValue(item.ootdJessie)}</div>
                      )}
                      {columnVisibility.ootdAmor && amorSpans[itemIndex] > 0 && (
                        <div className={`ja-itplus-cell${ootdDisplayValue(item.ootdAmor) ? " ja-itplus-ootd-cell" : ""}`} style={{ gridRow: `span ${amorSpans[itemIndex] * 2}` }}>{ootdDisplayValue(item.ootdAmor)}</div>
                      )}
                      <div className="ja-itplus-cell-activities">{item.title || "—"}</div>
                    </>
                  )}
                </React.Fragment>
              ));
            })()}
          </div>
          {isEditing && <IonButton fill="outline" size="small" onClick={() => addItem(dayIndex)}><IonIcon icon={addOutline} slot="start" />Add row</IonButton>}
        </div>
      ))}

      {isEditing && <IonButton fill="outline" onClick={addDay}><IonIcon icon={addOutline} slot="start" />Add day</IonButton>}
      {!canEdit && <p className="ja-itplus-readonly-note">Sign in to edit this itinerary.</p>}
    </div>
  );
}
