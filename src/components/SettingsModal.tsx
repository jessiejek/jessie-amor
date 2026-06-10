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
  IonBadge,
  IonText,
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

type FormState = {
  baseCurrency: string;
  currencies: string[];
  startDate: string;
  endDate: string;
};

const currencyOptions = [
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "THB", name: "Thai Baht" },
];

const buildInitialState = (settings: UserTripSettings | null): FormState => {
  const baseCurrency = settings?.baseCurrency ?? "MYR";
  const currencies = settings?.currencies?.length ? settings.currencies : ["MYR", "SGD"];
  const startDate = settings?.travelDates?.[0] ?? "";
  const endDate = settings?.travelDates?.[settings.travelDates.length - 1] ?? "";

  return {
    baseCurrency,
    currencies,
    startDate,
    endDate,
  };
};

const parseIsoDateToUtc = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
};

const formatUtcDateToIso = (value: Date) => {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatPreviewDate = (value: string) =>
  parseIsoDateToUtc(value).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const expandDateRange = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const current = parseIsoDateToUtc(start);
  const last = parseIsoDateToUtc(end);

  while (current <= last) {
    dates.push(formatUtcDateToIso(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};

const brandToolbar = {
  "--background": "#0B3530",
  "--color": "#ffffff",
} as React.CSSProperties;

export default function SettingsModal({
  open,
  onClose,
  session,
  currentUser,
  settings,
  onSave,
  isSaving,
  isFirstSetup = false,
  budgetCapPhp = 0,
  onBudgetCapChange,
  budgetCapRmLabel = "RM 0",
  budgetCapStatusLabel = "",
}: SettingsModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(settings));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialState(settings));
    setErrors({});
  }, [open, settings]);

  const additionalCurrencies = useMemo(
    () => form.currencies.filter((code) => code !== form.baseCurrency),
    [form.baseCurrency, form.currencies],
  );

  const maxAdditionalCurrencies = 2;
  const canSelectMoreAdditional = additionalCurrencies.length < maxAdditionalCurrencies;

  const previewText = useMemo(() => {
    if (!form.startDate || !form.endDate) return "";
    const expanded = expandDateRange(form.startDate, form.endDate);
    return `${expanded.length} days: ${formatPreviewDate(form.startDate)} -> ${formatPreviewDate(form.endDate)}`;
  }, [form.endDate, form.startDate]);

  const handleBaseCurrencyChange = (baseCurrency: string) => {
    setForm((current) => ({
      ...current,
      baseCurrency,
      currencies: [baseCurrency, ...current.currencies.filter((code) => code !== current.baseCurrency && code !== baseCurrency)],
    }));
  };

  const handleAdditionalCurrencyToggle = (currencyCode: string) => {
    setForm((current) => {
      const alreadySelected = current.currencies.includes(currencyCode);
      if (alreadySelected) {
        return {
          ...current,
          currencies: current.currencies.filter((code) => code !== currencyCode),
        };
      }

      if (current.currencies.filter((code) => code !== current.baseCurrency).length >= maxAdditionalCurrencies) {
        return current;
      }

      return {
        ...current,
        currencies: [...current.currencies, currencyCode],
      };
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.startDate) nextErrors.startDate = "Trip start date is required.";
    if (!form.endDate) nextErrors.endDate = "Trip end date is required.";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = "Trip end date must be on or after the start date.";
    }
    if (additionalCurrencies.length < 1) {
      nextErrors.currencies = "Select at least 1 additional currency.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const travelDates = expandDateRange(form.startDate, form.endDate);
    const nextSettings: UserTripSettings = {
      id: settings?.id ?? crypto.randomUUID(),
      userId: currentUser?.userId ?? session?.user.id ?? "",
      tripKey: settings?.tripKey ?? "",
      baseCurrency: form.baseCurrency,
      currencies: [form.baseCurrency, ...additionalCurrencies],
      travelDates,
      createdAt: settings?.createdAt,
      updatedAt: settings?.updatedAt,
    };

    await onSave(nextSettings);
  };

  return (
    <IonModal
      isOpen={open}
      onDidDismiss={() => {
        if (!isFirstSetup) onClose();
      }}
      backdropDismiss={!isFirstSetup}
      className="ja-settings-modal"
    >
      <IonHeader>
        <IonToolbar style={brandToolbar}>
          {!isFirstSetup && (
            <IonButtons slot="end">
              <IonButton onClick={onClose} aria-label="Close settings modal">
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          )}
          <IonTitle>
            {isFirstSetup ? "Welcome! Set up your trip preferences" : "Trip Settings"}
          </IonTitle>
        </IonToolbar>
        <div
          className="px-4 pb-4 pt-1"
          style={{ background: "#0B3530", color: "rgba(255,255,255,0.8)" }}
        >
          <p className="text-[14px] leading-relaxed">
            {isFirstSetup
              ? "Choose your currencies and travel dates. You can update these anytime in Settings."
              : "Update your currency preferences and travel dates."}
          </p>
        </div>
      </IonHeader>

      <IonContent style={{ "--background": "#f5f5f4" } as React.CSSProperties}>
        <div className="space-y-4 p-4">
          {/* Currencies */}
          <IonCard className="ja-settings-card">
            <IonCardContent>
              <div className="mb-4">
                <h4 className="text-[16px] font-serif font-bold text-[#0B3530]">Currencies</h4>
                <p className="mt-1 text-[13px] text-stone-500">Choose your base currency plus up to 2 additional display currencies.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[14px] font-semibold text-stone-600">Base Currency</label>
                  <IonSelect
                    value={form.baseCurrency}
                    onIonChange={(event) => handleBaseCurrencyChange(event.detail.value)}
                    interface="action-sheet"
                    className="ja-settings-select"
                  >
                    {currencyOptions.map((option) => (
                      <IonSelectOption key={option.code} value={option.code}>
                        {option.code} - {option.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>

                <div>
                  <label className="mb-1 block text-[14px] font-semibold text-stone-600">Additional Currency</label>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <IonList className="ja-settings-checkbox-list">
                      {currencyOptions
                        .filter((option) => option.code !== form.baseCurrency)
                        .map((option) => {
                          const checked = form.currencies.includes(option.code);
                          const isDisabled = !checked && !canSelectMoreAdditional;
                          return (
                            <IonItem
                              key={option.code}
                              className={`ja-settings-checkbox-item ${checked ? "ja-settings-checkbox-item-checked" : ""} ${isDisabled ? "ja-settings-checkbox-item-disabled" : ""}`}
                            >
                              <IonLabel className="text-[14px]">{option.code} - {option.name}</IonLabel>
                              <IonCheckbox
                                slot="end"
                                checked={checked}
                                disabled={isDisabled}
                                onIonChange={() => handleAdditionalCurrencyToggle(option.code)}
                              />
                            </IonItem>
                          );
                        })}
                    </IonList>
                  </div>
                  <p className="mt-2 text-[12px] text-stone-500">You can pick up to 2 additional currencies for now. More currencies coming soon.</p>
                  {errors.currencies ? <p className="mt-1 text-[12px] text-rose-600">{errors.currencies}</p> : null}
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Travel Dates */}
          <IonCard className="ja-settings-card">
            <IonCardContent>
              <div className="mb-4">
                <h4 className="text-[16px] font-serif font-bold text-[#0B3530]">Travel Dates</h4>
                <p className="mt-1 text-[13px] text-stone-500">These dates drive the budget day labels without changing the stored day number format.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[14px] font-semibold text-stone-600">Trip Start Date</label>
                  <IonInput
                    type="date"
                    value={form.startDate}
                    onIonInput={(event) => {
                      const value = event.detail.value ?? "";
                      setForm((current) => ({ ...current, startDate: String(value) }));
                    }}
                    className="ja-settings-date-input"
                  />
                  {errors.startDate ? <p className="mt-1 text-[12px] text-rose-600">{errors.startDate}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-[14px] font-semibold text-stone-600">Trip End Date</label>
                  <IonInput
                    type="date"
                    value={form.endDate}
                    onIonInput={(event) => {
                      const value = event.detail.value ?? "";
                      setForm((current) => ({ ...current, endDate: String(value) }));
                    }}
                    className="ja-settings-date-input"
                  />
                  {errors.endDate ? <p className="mt-1 text-[12px] text-rose-600">{errors.endDate}</p> : null}
                </div>
              </div>

              {previewText ? (
                <div className="mt-4 rounded-xl border border-[#D0DFDC] bg-[#F1F5F4] px-4 py-3 text-[13px] font-medium text-[#0B3530]">
                  {previewText}
                </div>
              ) : null}
            </IonCardContent>
          </IonCard>

          {/* Budget Cap */}
          <IonCard className="ja-settings-card">
            <IonCardContent>
              <div className="mb-4">
                <h4 className="text-[16px] font-serif font-bold text-[#0B3530]">Budget Cap</h4>
                <p className="mt-1 text-[13px] text-stone-500">Set a personal PHP cap for cash and debit spending. `0` means no cap.</p>
              </div>

              <label className="block">
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-mono text-stone-500">PHP</span>
                  <IonInput
                    type="number"
                    min={0}
                    value={budgetCapPhp || ""}
                    placeholder="No cap"
                    onIonInput={(event) => {
                      const raw = event.detail.value ?? "";
                      const value = Number(raw);
                      if (!Number.isNaN(value)) {
                        onBudgetCapChange?.(Math.max(0, value));
                      }
                    }}
                    className="ja-settings-cap-input"
                  />
                  <span className="text-[11px] font-medium text-emerald-600">Auto-saved</span>
                </div>
                {budgetCapPhp > 0 && (
                  <p className="mt-1 text-[11px] text-stone-400">
                    = {budgetCapRmLabel}
                    {budgetCapStatusLabel ? (
                      <IonChip className="ml-1 text-[10px] h-auto px-2 py-1 m-0 font-mono">
                        {budgetCapStatusLabel}
                      </IonChip>
                    ) : null}
                  </p>
                )}
              </label>

              {!session && (
                <p className="mt-3 text-[11px] text-amber-600">
                  Sign in to sync cap across devices. Currently saved to this device only.
                </p>
              )}

              <p className="mt-3 text-[11px] text-stone-400">
                When set, an alert appears on the Budget page if cash+debit spending exceeds this cap.
                {budgetCapPhp > 0 && <> Currently capped at <strong>PHP {budgetCapPhp.toLocaleString("en-PH", { maximumFractionDigits: 2 })}</strong>.</>}
              </p>
            </IonCardContent>
          </IonCard>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-4">
            {!isFirstSetup && (
              <IonButton fill="outline" onClick={onClose}>
                Cancel
              </IonButton>
            )}
            <IonButton
              disabled={isSaving}
              onClick={handleSubmit}
              className="ja-settings-save-btn"
            >
              {isSaving ? (
                <>
                  <IonSpinner slot="start" name="crescent" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
}
