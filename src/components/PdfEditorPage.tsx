import React, { useEffect, useState } from "react";
import { IonButton, IonCard, IonCardContent, IonDatetime, IonInput, IonModal, IonSpinner } from "@ionic/react";
import { ArrowLeft, FileText } from "lucide-react";
import type { TripProfile, TripHotel, PdfItineraryDay } from "../types";
import { generateImmigrationPdf, buildDefaultItineraryDays } from "../utils/generateImmigrationPdf";

interface PdfEditorPageProps {
  tripProfile: TripProfile | null;
  onSave: (profile: TripProfile) => Promise<void>;
  isSaving: boolean;
  onBack: () => void;
}

const DEFAULT_HOTELS: TripHotel[] = [
  { hotel: "Travelodge KL City Centre", location: "Kuala Lumpur", checkIn: "July 12, 2026", checkOut: "July 15, 2026" },
  { hotel: "Hotel Classic by Venue", location: "Joo Chiat, Singapore", checkIn: "July 15, 2026", checkOut: "July 16, 2026" },
];

type FormState = {
  documentTitle: string; traveler1: string; traveler2: string; purpose: string; duration: string; route: string;
  departPh: string; arrivePh: string; arrivalMalaysia: string; arrivalAirport: string;
  klToSgFlight: string; departureAirportSg: string; departureSg: string;
  hotels: TripHotel[];
  itineraryDays: PdfItineraryDay[];
};

const MINUTE_VALUES = "0,5,10,15,20,25,30,35,40,45,50,55";

const time12ToIso = (value: string): string => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return "2024-01-01T09:00:00";
  const [, hh, mm, ampm] = match;
  let hours = parseInt(hh, 10);
  if (ampm) {
    const isPM = ampm.toUpperCase() === "PM";
    if (hours === 12) hours = isPM ? 12 : 0;
    else if (isPM) hours += 12;
  }
  return `2024-01-01T${String(hours).padStart(2, "0")}:${mm}:00`;
};

const isoToTime12 = (iso: string): string => {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return "";
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

const buildInitialForm = (profile: TripProfile | null | undefined): FormState => ({
  documentTitle: profile?.documentTitle || "Jessie & Amor's Malaysia - Singapore Trip 2026",
  traveler1: profile?.traveler1 ?? "Jessie Jay Q. Rubi",
  traveler2: profile?.traveler2 ?? "Rizza Amor L. Caguco",
  purpose: profile?.purpose ?? "Tourism - sightseeing, cultural exploration, culinary experience",
  duration: profile?.duration ?? "5 days",
  route: profile?.route ?? "Kuala Lumpur, Malaysia - Malacca (day trip) - Singapore",
  departPh: profile?.departPh ?? "July 11, 2026",
  arrivePh: profile?.arrivePh ?? "July 17, 2026",
  arrivalMalaysia: profile?.arrivalMalaysia ?? "July 12, 2026 at 01:30 AM",
  arrivalAirport: profile?.arrivalAirport ?? "Kuala Lumpur International Airport (KLIA)",
  klToSgFlight: profile?.klToSgFlight ?? "July 15, 2026 at 08:00 AM",
  departureAirportSg: profile?.departureAirportSg ?? "Changi Airport (SIN)",
  departureSg: profile?.departureSg ?? "July 16, 2026 (morning)",
  hotels: profile?.hotels?.length ? profile.hotels : DEFAULT_HOTELS,
  itineraryDays: profile?.itineraryDays?.length ? profile.itineraryDays : buildDefaultItineraryDays(),
});

export default function PdfEditorPage({ tripProfile, onSave, isSaving, onBack }: PdfEditorPageProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(tripProfile));
  const [saved, setSaved] = useState(false);
  const [editingTime, setEditingTime] = useState<{ dayIndex: number; itemIndex: number } | null>(null);

  useEffect(() => { setForm(buildInitialForm(tripProfile)); }, [tripProfile]);

  const updateHotel = (index: number, field: keyof TripHotel, value: string) => {
    setForm((prev) => ({ ...prev, hotels: prev.hotels.map((h, i) => (i === index ? { ...h, [field]: value } : h)) }));
  };
  const addHotel = () => setForm((prev) => ({ ...prev, hotels: [...prev.hotels, { hotel: "", location: "", checkIn: "", checkOut: "" }] }));
  const removeHotel = (index: number) => setForm((prev) => ({ ...prev, hotels: prev.hotels.filter((_, i) => i !== index) }));

  const updateDayTitle = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      itineraryDays: prev.itineraryDays.map((d, i) => i === index ? { ...d, title: value } : d),
    }));
  };
  const addDay = () => setForm((prev) => ({ ...prev, itineraryDays: [...prev.itineraryDays, { day: prev.itineraryDays.length + 1, title: "", items: [] }] }));
  const removeDay = (index: number) => setForm((prev) => ({ ...prev, itineraryDays: prev.itineraryDays.filter((_, i) => i !== index) }));

  const updateItem = (dayIndex: number, itemIndex: number, field: "time" | "title", value: string) => {
    setForm((prev) => ({
      ...prev,
      itineraryDays: prev.itineraryDays.map((d, i) => i === dayIndex
        ? { ...d, items: d.items.map((it, j) => j === itemIndex ? { ...it, [field]: value } : it) }
        : d),
    }));
  };
  const addItem = (dayIndex: number) => setForm((prev) => ({
    ...prev,
    itineraryDays: prev.itineraryDays.map((d, i) => i === dayIndex ? { ...d, items: [...d.items, { time: "", title: "" }] } : d),
  }));
  const removeItem = (dayIndex: number, itemIndex: number) => setForm((prev) => ({
    ...prev,
    itineraryDays: prev.itineraryDays.map((d, i) => i === dayIndex ? { ...d, items: d.items.filter((_, j) => j !== itemIndex) } : d),
  }));

  const handleSave = async () => {
    await onSave({ id: tripProfile?.id ?? crypto.randomUUID(), tripKey: tripProfile?.tripKey ?? "", ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDownload = () => generateImmigrationPdf({ id: tripProfile?.id ?? "", tripKey: tripProfile?.tripKey ?? "", ...form });

  const editingItem = editingTime ? form.itineraryDays[editingTime.dayIndex]?.items[editingTime.itemIndex] : null;

  return (
    <div className="ja-settings-content">
      <div className="ja-pdf-editor-header">
        <IonButton fill="clear" onClick={onBack} className="ja-pdf-editor-back"><ArrowLeft size={16} style={{ marginRight: 6 }} />Back</IonButton>
        <h2 className="ja-pdf-editor-title">Edit Downloadable PDF</h2>
        <p className="ja-settings-card-desc">Everything on the Immigration Document comes from here — travelers, flights, hotels, and the daily itinerary. Editing the itinerary below only changes the PDF, not your live Itinerary tab.</p>
      </div>

      <IonCard className="ja-settings-card">
        <IonCardContent>
          <div className="ja-settings-card-header">
            <h4 className="ja-settings-card-title">Document</h4>
          </div>
          <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Title</label>
          <IonInput value={form.documentTitle} onIonInput={(e) => setForm((p) => ({ ...p, documentTitle: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
        </IonCardContent>
      </IonCard>

      <IonCard className="ja-settings-card">
        <IonCardContent>
          <div className="ja-settings-card-header">
            <h4 className="ja-settings-card-title">Traveler Information</h4>
          </div>

          <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Traveler 1</label>
          <IonInput value={form.traveler1} onIonInput={(e) => setForm((p) => ({ ...p, traveler1: String(e.detail.value ?? "") }))} className="ja-settings-date-input" style={{ marginBottom: 10 }} />

          <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Traveler 2</label>
          <IonInput value={form.traveler2} onIonInput={(e) => setForm((p) => ({ ...p, traveler2: String(e.detail.value ?? "") }))} className="ja-settings-date-input" style={{ marginBottom: 10 }} />

          <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Purpose of travel</label>
          <IonInput value={form.purpose} onIonInput={(e) => setForm((p) => ({ ...p, purpose: String(e.detail.value ?? "") }))} className="ja-settings-date-input" style={{ marginBottom: 10 }} />

          <div className="ja-profile-grid">
            <div>
              <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Duration</label>
              <IonInput value={form.duration} onIonInput={(e) => setForm((p) => ({ ...p, duration: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
            </div>
            <div>
              <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Route</label>
              <IonInput value={form.route} onIonInput={(e) => setForm((p) => ({ ...p, route: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
            </div>
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="ja-settings-card">
        <IonCardContent>
          <div className="ja-settings-card-header">
            <h4 className="ja-settings-card-title">Flights</h4>
            <p className="ja-settings-card-desc">Only Arrival in Malaysia and Departure from Singapore print on the PDF today.</p>
          </div>

          <div className="ja-profile-grid">
            <div>
              <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Depart Philippines</label>
              <IonInput value={form.departPh} onIonInput={(e) => setForm((p) => ({ ...p, departPh: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
            </div>
            <div>
              <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Arrive back Philippines</label>
              <IonInput value={form.arrivePh} onIonInput={(e) => setForm((p) => ({ ...p, arrivePh: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
            </div>
          </div>

          <div className="ja-profile-grid">
            <div>
              <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Arrival in Malaysia</label>
              <IonInput value={form.arrivalMalaysia} onIonInput={(e) => setForm((p) => ({ ...p, arrivalMalaysia: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
            </div>
            <div>
              <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Arrival airport</label>
              <IonInput value={form.arrivalAirport} onIonInput={(e) => setForm((p) => ({ ...p, arrivalAirport: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
            </div>
          </div>

          <div className="ja-profile-grid">
            <div>
              <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>KL → Singapore flight</label>
              <IonInput value={form.klToSgFlight} onIonInput={(e) => setForm((p) => ({ ...p, klToSgFlight: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
            </div>
            <div>
              <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Departure airport (SG)</label>
              <IonInput value={form.departureAirportSg} onIonInput={(e) => setForm((p) => ({ ...p, departureAirportSg: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
            </div>
          </div>

          <div>
            <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Departure from Singapore</label>
            <IonInput value={form.departureSg} onIonInput={(e) => setForm((p) => ({ ...p, departureSg: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="ja-settings-card">
        <IonCardContent>
          <div className="ja-settings-card-header">
            <h4 className="ja-settings-card-title">Hotels</h4>
          </div>
          {form.hotels.map((hotel, i) => (
            <div key={i} style={{ background: "var(--ion-color-light)", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
              <div className="ja-profile-hotel-grid">
                <div>
                  <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Hotel name</label>
                  <IonInput value={hotel.hotel} onIonInput={(e) => updateHotel(i, "hotel", String(e.detail.value ?? ""))} className="ja-settings-date-input" />
                </div>
                <div>
                  <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Location</label>
                  <IonInput value={hotel.location} onIonInput={(e) => updateHotel(i, "location", String(e.detail.value ?? ""))} className="ja-settings-date-input" />
                </div>
              </div>
              <div className="ja-profile-hotel-dates">
                <div>
                  <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Check-in</label>
                  <IonInput value={hotel.checkIn} onIonInput={(e) => updateHotel(i, "checkIn", String(e.detail.value ?? ""))} className="ja-settings-date-input" />
                </div>
                <div>
                  <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Check-out</label>
                  <IonInput value={hotel.checkOut} onIonInput={(e) => updateHotel(i, "checkOut", String(e.detail.value ?? ""))} className="ja-settings-date-input" />
                </div>
                {form.hotels.length > 1 && (
                  <IonButton fill="clear" color="danger" size="small" onClick={() => removeHotel(i)} style={{ marginBottom: 2 }}>Remove</IonButton>
                )}
              </div>
            </div>
          ))}
          <IonButton fill="outline" size="small" onClick={addHotel}>+ Add hotel</IonButton>
        </IonCardContent>
      </IonCard>

      <IonCard className="ja-settings-card">
        <IonCardContent>
          <div className="ja-settings-card-header">
            <h4 className="ja-settings-card-title">Daily Itinerary</h4>
            <p className="ja-settings-card-desc">Pre-filled from your real itinerary. Rename, reorder text, or add/remove days and items for the PDF only.</p>
          </div>
          {form.itineraryDays.map((day, dayIndex) => (
            <div key={dayIndex} style={{ background: "var(--ion-color-light)", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
              <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Day title</label>
              <IonInput value={day.title} onIonInput={(e) => updateDayTitle(dayIndex, String(e.detail.value ?? ""))} className="ja-settings-date-input" />

              <label className="ja-settings-field-label" style={{ display: "block", margin: "8px 0 4px" }}>Items</label>
              {day.items.map((item, itemIndex) => (
                <div key={itemIndex} className="ja-itinerary-item">
                  <div className="ja-itinerary-item-row">
                    <IonButton fill="outline" size="small" className="ja-time-trigger" onClick={() => setEditingTime({ dayIndex, itemIndex })}>
                      {item.time || "Set time"}
                    </IonButton>
                    <IonButton fill="clear" color="danger" size="small" onClick={() => removeItem(dayIndex, itemIndex)}>Remove</IonButton>
                  </div>
                  <IonInput placeholder="Title" value={item.title} onIonInput={(e) => updateItem(dayIndex, itemIndex, "title", String(e.detail.value ?? ""))} className="ja-settings-date-input" />
                </div>
              ))}
              <IonButton fill="outline" size="small" onClick={() => addItem(dayIndex)} style={{ marginRight: 8 }}>+ Add item</IonButton>
              <IonButton fill="clear" color="danger" size="small" onClick={() => removeDay(dayIndex)}>Remove day</IonButton>
            </div>
          ))}
          <IonButton fill="outline" size="small" onClick={addDay}>+ Add day</IonButton>
        </IonCardContent>
      </IonCard>

      <div className="ja-settings-actions">
        <IonButton fill="outline" onClick={handleDownload}><FileText size={14} style={{ marginRight: 8 }} />Download PDF</IonButton>
        <IonButton disabled={isSaving} onClick={handleSave} className="ja-settings-save-btn">
          {isSaving ? <><IonSpinner slot="start" name="crescent" /> Saving...</> : saved ? "Saved!" : "Save"}
        </IonButton>
      </div>

      <IonModal isOpen={!!editingTime} onDidDismiss={() => setEditingTime(null)} className="ja-time-modal" style={{ "--width": "auto", "--height": "auto" } as React.CSSProperties}>
        {editingTime && (
          <IonDatetime
            presentation="time"
            minuteValues={MINUTE_VALUES}
            value={time12ToIso(editingItem?.time ?? "")}
            onIonChange={(e) => {
              const value = Array.isArray(e.detail.value) ? e.detail.value[0] : e.detail.value;
              if (value) updateItem(editingTime.dayIndex, editingTime.itemIndex, "time", isoToTime12(value));
            }}
          />
        )}
        <IonButton expand="block" fill="clear" onClick={() => setEditingTime(null)}>Done</IonButton>
      </IonModal>
    </div>
  );
}
