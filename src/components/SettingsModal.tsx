import React, { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { CurrentUserInfo, UserTripSettings } from "../types";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
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
}

type FormState = { baseCurrency: string; currencies: string[]; startDate: string; endDate: string; };

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
}: SettingsModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(settings));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (!open) return; setForm(buildInitialState(settings)); setErrors({}); }, [open, settings]);

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
    <IonModal isOpen={open} onDidDismiss={() => { if (!isFirstSetup) onClose(); }} backdropDismiss={!isFirstSetup} className="ja-settings-modal">
      <IonHeader>
        <IonToolbar style={brandToolbar}>
          {!isFirstSetup && <IonButtons slot="end"><IonButton onClick={onClose} aria-label="Close settings modal"><IonIcon icon={closeOutline} /></IonButton></IonButtons>}
          <IonTitle>{isFirstSetup ? "Welcome! Set up your trip preferences" : "Trip Settings"}</IonTitle>
        </IonToolbar>
        <div className="ja-settings-desc-wrap" style={{ background: "#0B3530", color: "rgba(255,255,255,0.8)" }}>
          <p className="ja-settings-desc">{isFirstSetup ? "Choose your currencies and travel dates. You can update these anytime in Settings." : "Update your currency preferences and travel dates."}</p>
        </div>
      </IonHeader>

      <IonContent style={{ "--background": "#f5f5f4" } as React.CSSProperties}>
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

          <div className="ja-settings-actions">
            {!isFirstSetup && <IonButton fill="outline" onClick={onClose}>Cancel</IonButton>}
            <IonButton disabled={isSaving} onClick={handleSubmit} className="ja-settings-save-btn">
              {isSaving ? <><IonSpinner slot="start" name="crescent" /> Saving...</> : "Save Settings"}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
}
