import React, { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { CurrentUserInfo, UserTripSettings, TripProfile, TripHotel } from "../types";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonChip,
  IonSpinner,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  currentUser: CurrentUserInfo | null;
  settings: UserTripSettings | null;
  onSave: (settings: UserTripSettings) => Promise<void>;
  isSaving: boolean;
  isFirstSetup?: boolean;
  budgetCapPhp?: number;
  onBudgetCapChange?: (value: number) => void;
  budgetCapRmLabel?: string;
  budgetCapStatusLabel?: string;
  tripProfile?: TripProfile | null;
  onSaveTripProfile?: (profile: TripProfile) => Promise<void>;
  isSavingProfile?: boolean;
}

type FormState = { baseCurrency: string; currencies: string[]; startDate: string; endDate: string; };

const DEFAULT_HOTELS: TripHotel[] = [
  { hotel: "Travelodge KL City Centre", location: "Kuala Lumpur", checkIn: "July 12, 2026", checkOut: "July 15, 2026" },
  { hotel: "Hotel Classic by Venue", location: "Joo Chiat, Singapore", checkIn: "July 15, 2026", checkOut: "July 16, 2026" },
];

type ProfileFormState = {
  traveler1: string; traveler2: string; purpose: string; duration: string; route: string;
  departPh: string; arrivePh: string; arrivalMalaysia: string; arrivalAirport: string;
  klToSgFlight: string; departureAirportSg: string; departureSg: string;
  hotels: TripHotel[];
};

const buildInitialProfile = (profile: TripProfile | null | undefined): ProfileFormState => ({
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
});

const currencyOptions = [
  { code: "MYR", name: "Malaysian Ringgit" }, { code: "SGD", name: "Singapore Dollar" },
  { code: "PHP", name: "Philippine Peso" }, { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" }, { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" }, { code: "GBP", name: "British Pound" },
  { code: "IDR", name: "Indonesian Rupiah" }, { code: "THB", name: "Thai Baht" },
];

const buildInitialState = (settings: UserTripSettings | null): FormState => {
  const baseCurrency = settings?.baseCurrency ?? "MYR";
  const currencies = settings?.currencies?.length ? settings.currencies : ["MYR", "SGD"];
  const startDate = settings?.travelDates?.[0] ?? "";
  const endDate = settings?.travelDates?.[settings.travelDates.length - 1] ?? "";
  return { baseCurrency, currencies, startDate, endDate };
};

const parseIsoDateToUtc = (value: string) => { const [y, m, d] = value.split("-").map(Number); return new Date(Date.UTC(y, (m || 1) - 1, d || 1)); };
const formatUtcDateToIso = (value: Date) => `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
const formatPreviewDate = (value: string) => parseIsoDateToUtc(value).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const expandDateRange = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const current = parseIsoDateToUtc(start);
  const last = parseIsoDateToUtc(end);
  while (current <= last) { dates.push(formatUtcDateToIso(current)); current.setUTCDate(current.getUTCDate() + 1); }
  return dates;
};

const brandToolbar = { "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties;

export default function SettingsModal({
  open, onClose, session, currentUser, settings, onSave, isSaving,
  isFirstSetup = false, budgetCapPhp = 0, onBudgetCapChange,
  budgetCapRmLabel = "RM 0", budgetCapStatusLabel = "",
  tripProfile, onSaveTripProfile, isSavingProfile = false,
}: SettingsModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(settings));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => buildInitialProfile(tripProfile));
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => { if (!open) return; setForm(buildInitialState(settings)); setErrors({}); }, [open, settings]);
  useEffect(() => { if (!open) return; setProfileForm(buildInitialProfile(tripProfile)); }, [open, tripProfile]);

  const additionalCurrencies = useMemo(() => form.currencies.filter((code) => code !== form.baseCurrency), [form.baseCurrency, form.currencies]);
  const maxAdditionalCurrencies = 2;
  const canSelectMoreAdditional = additionalCurrencies.length < maxAdditionalCurrencies;

  const previewText = useMemo(() => {
    if (!form.startDate || !form.endDate) return "";
    const expanded = expandDateRange(form.startDate, form.endDate);
    return `${expanded.length} days: ${formatPreviewDate(form.startDate)} -> ${formatPreviewDate(form.endDate)}`;
  }, [form.endDate, form.startDate]);

  const handleBaseCurrencyChange = (baseCurrency: string) => {
    setForm((current) => ({
      ...current, baseCurrency,
      currencies: [baseCurrency, ...current.currencies.filter((code) => code !== current.baseCurrency && code !== baseCurrency)],
    }));
  };

  const handleAdditionalCurrencyToggle = (currencyCode: string) => {
    setForm((current) => {
      if (current.currencies.includes(currencyCode)) return { ...current, currencies: current.currencies.filter((code) => code !== currencyCode) };
      if (current.currencies.filter((code) => code !== current.baseCurrency).length >= maxAdditionalCurrencies) return current;
      return { ...current, currencies: [...current.currencies, currencyCode] };
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.startDate) next.startDate = "Trip start date is required.";
    if (!form.endDate) next.endDate = "Trip end date is required.";
    if (form.startDate && form.endDate && form.endDate < form.startDate) next.endDate = "Trip end date must be on or after the start date.";
    if (additionalCurrencies.length < 1) next.currencies = "Select at least 1 additional currency.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const updateHotel = (index: number, field: keyof TripHotel, value: string) => {
    setProfileForm((prev) => {
      const hotels = prev.hotels.map((h, i) => i === index ? { ...h, [field]: value } : h);
      return { ...prev, hotels };
    });
  };

  const addHotel = () => setProfileForm((prev) => ({ ...prev, hotels: [...prev.hotels, { hotel: "", location: "", checkIn: "", checkOut: "" }] }));
  const removeHotel = (index: number) => setProfileForm((prev) => ({ ...prev, hotels: prev.hotels.filter((_, i) => i !== index) }));

  const handleSaveProfile = async () => {
    if (!onSaveTripProfile) return;
    await onSaveTripProfile({
      id: tripProfile?.id ?? crypto.randomUUID(),
      tripKey: tripProfile?.tripKey ?? "",
      ...profileForm,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const travelDates = expandDateRange(form.startDate, form.endDate);
    await onSave({
      id: settings?.id ?? crypto.randomUUID(), userId: currentUser?.userId ?? session?.user.id ?? "",
      tripKey: settings?.tripKey ?? "", baseCurrency: form.baseCurrency,
      currencies: [form.baseCurrency, ...additionalCurrencies], travelDates,
      createdAt: settings?.createdAt, updatedAt: settings?.updatedAt,
    });
  };

  return (
    <IonModal isOpen={open} onDidDismiss={() => { if (!isFirstSetup) onClose(); }} backdropDismiss={!isFirstSetup} className="ja-settings-modal ja-settings-fullpage">
      <IonHeader>
        <IonToolbar style={brandToolbar}>
          {!isFirstSetup && <IonButtons slot="end"><IonButton onClick={onClose} aria-label="Close settings modal"><IonIcon icon={closeOutline} /></IonButton></IonButtons>}
          <IonTitle>{isFirstSetup ? "Welcome! Set up your trip preferences" : "Trip Settings"}</IonTitle>
        </IonToolbar>
        <div className="ja-settings-desc-wrap" style={{ background: "#0B3530", color: "rgba(255,255,255,0.8)" }}>
          <p className="ja-settings-desc">{isFirstSetup ? "Choose your currencies and travel dates. You can update these anytime in Settings." : "Update your currency preferences and travel dates."}</p>
        </div>
      </IonHeader>

      <div className="ja-settings-scroll-body" style={{ background: "#f5f5f4" }}>
        <div className="ja-settings-content">
          <IonCard className="ja-settings-card">
            <IonCardContent>
              <div className="ja-settings-card-header">
                <h4 className="ja-settings-card-title">Currencies</h4>
                <p className="ja-settings-card-desc">Choose your base currency plus up to 2 additional display currencies.</p>
              </div>
              <div className="ja-settings-grid">
                <div>
                  <label className="ja-settings-field-label">Base Currency</label>
                  <IonSelect value={form.baseCurrency} onIonChange={(event) => handleBaseCurrencyChange(event.detail.value)} interface="action-sheet" className="ja-settings-select">
                    {currencyOptions.map((o) => <IonSelectOption key={o.code} value={o.code}>{o.code} - {o.name}</IonSelectOption>)}
                  </IonSelect>
                </div>
                <div>
                  <label className="ja-settings-field-label">Additional Currency</label>
                  <div className="ja-settings-checkbox-wrap">
                    <IonList className="ja-settings-checkbox-list">
                      {currencyOptions.filter((o) => o.code !== form.baseCurrency).map((option) => {
                        const checked = form.currencies.includes(option.code);
                        const isDisabled = !checked && !canSelectMoreAdditional;
                        return (
                          <IonItem key={option.code} className={`ja-settings-checkbox-item${checked ? " ja-settings-checkbox-item-checked" : ""}${isDisabled ? " ja-settings-checkbox-item-disabled" : ""}`}>
                            <IonLabel className="ja-settings-checkbox-label">{option.code} - {option.name}</IonLabel>
                            <IonCheckbox slot="end" checked={checked} disabled={isDisabled} onIonChange={() => handleAdditionalCurrencyToggle(option.code)} />
                          </IonItem>
                        );
                      })}
                    </IonList>
                  </div>
                  <p className="ja-settings-helper">You can pick up to 2 additional currencies for now. More currencies coming soon.</p>
                  {errors.currencies ? <p className="ja-settings-error">{errors.currencies}</p> : null}
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          <IonCard className="ja-settings-card">
            <IonCardContent>
              <div className="ja-settings-card-header">
                <h4 className="ja-settings-card-title">Travel Dates</h4>
                <p className="ja-settings-card-desc">These dates drive the budget day labels without changing the stored day number format.</p>
              </div>
              <div className="ja-settings-date-grid">
                <div>
                  <label className="ja-settings-field-label">Trip Start Date</label>
                  <IonInput type="date" value={form.startDate} onIonInput={(event) => { const v = event.detail.value ?? ""; setForm((c) => ({ ...c, startDate: String(v) })); }} className="ja-settings-date-input" />
                  {errors.startDate ? <p className="ja-settings-error">{errors.startDate}</p> : null}
                </div>
                <div>
                  <label className="ja-settings-field-label">Trip End Date</label>
                  <IonInput type="date" value={form.endDate} onIonInput={(event) => { const v = event.detail.value ?? ""; setForm((c) => ({ ...c, endDate: String(v) })); }} className="ja-settings-date-input" />
                  {errors.endDate ? <p className="ja-settings-error">{errors.endDate}</p> : null}
                </div>
              </div>
              {previewText ? <div className="ja-settings-preview">{previewText}</div> : null}
            </IonCardContent>
          </IonCard>

          <IonCard className="ja-settings-card">
            <IonCardContent>
              <div className="ja-settings-card-header">
                <h4 className="ja-settings-card-title">Budget Cap</h4>
                <p className="ja-settings-card-desc">Set a personal PHP cap for cash and debit spending. `0` means no cap.</p>
              </div>
              <label className="ja-settings-cap-row">
                <div className="ja-settings-cap-field">
                  <span className="ja-settings-cap-prefix">PHP</span>
                  <IonInput type="number" min={0} value={budgetCapPhp || ""} placeholder="No cap"
                    onIonInput={(event) => { const v = Number(event.detail.value ?? ""); if (!Number.isNaN(v)) onBudgetCapChange?.(Math.max(0, v)); }}
                    className="ja-settings-cap-input" />
                  <span className="ja-settings-cap-saved">Auto-saved</span>
                </div>
                {budgetCapPhp > 0 && <p className="ja-settings-cap-conversion">= {budgetCapRmLabel}{budgetCapStatusLabel ? <IonChip className="ja-settings-cap-chip">{budgetCapStatusLabel}</IonChip> : null}</p>}
              </label>
              {!session && <p className="ja-settings-warning">Sign in to sync cap across devices. Currently saved to this device only.</p>}
              <p className="ja-settings-helper">When set, an alert appears on the Budget page if cash+debit spending exceeds this cap.{budgetCapPhp > 0 ? <> Currently capped at <strong>PHP {budgetCapPhp.toLocaleString("en-PH", { maximumFractionDigits: 2 })}</strong>.</> : null}</p>
            </IonCardContent>
          </IonCard>

          <IonCard className="ja-settings-card">
              <IonCardContent>
                <div className="ja-settings-card-header">
                  <h4 className="ja-settings-card-title">Trip Profile</h4>
                  <p className="ja-settings-card-desc">Used in the immigration PDF — travelers, flights, and hotels.</p>
                </div>

                <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Traveler 1</label>
                <IonInput value={profileForm.traveler1} onIonInput={(e) => setProfileForm((p) => ({ ...p, traveler1: String(e.detail.value ?? "") }))} className="ja-settings-date-input" style={{ marginBottom: 10 }} />

                <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Traveler 2</label>
                <IonInput value={profileForm.traveler2} onIonInput={(e) => setProfileForm((p) => ({ ...p, traveler2: String(e.detail.value ?? "") }))} className="ja-settings-date-input" style={{ marginBottom: 10 }} />

                <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Purpose of travel</label>
                <IonInput value={profileForm.purpose} onIonInput={(e) => setProfileForm((p) => ({ ...p, purpose: String(e.detail.value ?? "") }))} className="ja-settings-date-input" style={{ marginBottom: 10 }} />

                <div className="ja-profile-grid">
                  <div>
                    <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Duration</label>
                    <IonInput value={profileForm.duration} onIonInput={(e) => setProfileForm((p) => ({ ...p, duration: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
                  </div>
                  <div>
                    <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Route</label>
                    <IonInput value={profileForm.route} onIonInput={(e) => setProfileForm((p) => ({ ...p, route: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
                  </div>
                </div>

                <div className="ja-profile-grid">
                  <div>
                    <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Depart Philippines</label>
                    <IonInput value={profileForm.departPh} onIonInput={(e) => setProfileForm((p) => ({ ...p, departPh: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
                  </div>
                  <div>
                    <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Arrive back Philippines</label>
                    <IonInput value={profileForm.arrivePh} onIonInput={(e) => setProfileForm((p) => ({ ...p, arrivePh: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
                  </div>
                </div>

                <div className="ja-profile-grid">
                  <div>
                    <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Arrival in Malaysia</label>
                    <IonInput value={profileForm.arrivalMalaysia} onIonInput={(e) => setProfileForm((p) => ({ ...p, arrivalMalaysia: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
                  </div>
                  <div>
                    <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Arrival airport</label>
                    <IonInput value={profileForm.arrivalAirport} onIonInput={(e) => setProfileForm((p) => ({ ...p, arrivalAirport: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
                  </div>
                </div>

                <div className="ja-profile-grid">
                  <div>
                    <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>KL → Singapore flight</label>
                    <IonInput value={profileForm.klToSgFlight} onIonInput={(e) => setProfileForm((p) => ({ ...p, klToSgFlight: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
                  </div>
                  <div>
                    <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Departure airport (SG)</label>
                    <IonInput value={profileForm.departureAirportSg} onIonInput={(e) => setProfileForm((p) => ({ ...p, departureAirportSg: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 4 }}>Departure from Singapore</label>
                  <IonInput value={profileForm.departureSg} onIonInput={(e) => setProfileForm((p) => ({ ...p, departureSg: String(e.detail.value ?? "") }))} className="ja-settings-date-input" />
                </div>

                <label className="ja-settings-field-label" style={{ display: "block", marginBottom: 8 }}>Hotels</label>
                {profileForm.hotels.map((hotel, i) => (
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
                      {profileForm.hotels.length > 1 && (
                        <IonButton fill="clear" color="danger" size="small" onClick={() => removeHotel(i)} style={{ marginBottom: 2 }}>Remove</IonButton>
                      )}
                    </div>
                  </div>
                ))}
                <IonButton fill="outline" size="small" onClick={addHotel} style={{ marginBottom: 8 }}>+ Add hotel</IonButton>

                <div style={{ marginTop: 12 }}>
                  <IonButton disabled={isSavingProfile} onClick={handleSaveProfile}>
                    {isSavingProfile ? <><IonSpinner slot="start" name="crescent" /> Saving...</> : profileSaved ? "Saved!" : "Save Trip Profile"}
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>

          <div className="ja-settings-actions">
            {!isFirstSetup && <IonButton fill="outline" onClick={onClose}>Cancel</IonButton>}
            <IonButton disabled={isSaving} onClick={handleSubmit} className="ja-settings-save-btn">
              {isSaving ? <><IonSpinner slot="start" name="crescent" /> Saving...</> : "Save Settings"}
            </IonButton>
          </div>
        </div>
      </div>
    </IonModal>
  );
}
