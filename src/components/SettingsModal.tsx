import React, { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { CurrentUserInfo, UserTripSettings } from "../types";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
  currentUser: CurrentUserInfo | null;
  settings: UserTripSettings | null;
  onSave: (settings: UserTripSettings) => Promise<void>;
  isSaving: boolean;
  isFirstSetup?: boolean;
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

const formatPreviewDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const expandDateRange = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const current = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);

  while (current <= last) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export default function SettingsModal({
  open,
  onClose,
  session,
  currentUser,
  settings,
  onSave,
  isSaving,
  isFirstSetup = false,
}: SettingsModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(settings));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialState(settings));
    setErrors({});
  }, [open, settings]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isFirstSetup) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFirstSetup, onClose, open]);

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

  if (!open) return null;

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    <div
      className="fixed inset-0 z-[5500] flex items-start justify-center overflow-y-auto bg-black/60 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xs no-print sm:items-center"
      onClick={() => {
        if (!isFirstSetup) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        {!isFirstSetup && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-800"
            aria-label="Close settings modal"
          >
            X
          </button>
        )}

        <div className="bg-gradient-to-br from-[#0B3530] to-[#18534C] px-6 py-5 text-white">
          <div className="text-[13px] uppercase tracking-[0.35em] text-[#88B04B] font-mono">Trip Preferences</div>
          <h3 className="mt-1 text-lg font-serif font-bold md:text-xl">
            {isFirstSetup ? "Welcome! Set up your trip preferences" : "Trip Settings"}
          </h3>
          <p className="mt-1 max-w-2xl text-[14px] text-stone-200 md:text-[15px]">
            {isFirstSetup
              ? "Choose your currencies and travel dates. You can update these anytime in Settings."
              : "Update your currency preferences and travel dates."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-stone-50 p-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="mb-4">
              <h4 className="text-[16px] font-serif font-bold text-[#0B3530]">Currencies</h4>
              <p className="mt-1 text-[13px] text-stone-500">Choose your base currency plus up to 2 additional display currencies.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[14px] font-semibold text-stone-600">Base Currency</label>
                <select
                  value={form.baseCurrency}
                  onChange={(event) => handleBaseCurrencyChange(event.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} - {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[14px] font-semibold text-stone-600">Additional Currency</label>
                <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                  {currencyOptions
                    .filter((option) => option.code !== form.baseCurrency)
                    .map((option) => {
                      const checked = form.currencies.includes(option.code);
                      const disabled = !checked && !canSelectMoreAdditional;
                      return (
                        <label
                          key={option.code}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[14px] transition-colors ${
                            disabled
                              ? "border-stone-200 bg-stone-100 text-stone-400"
                              : checked
                                ? "border-[#0B3530] bg-[#0B3530]/5 text-[#0B3530]"
                                : "border-stone-200 bg-white text-stone-700 hover:border-[#0B3530]/40"
                          }`}
                        >
                          <span>{option.code} - {option.name}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => handleAdditionalCurrencyToggle(option.code)}
                            className="h-4 w-4 accent-[#0B3530]"
                          />
                        </label>
                      );
                    })}
                </div>
                <p className="mt-2 text-[12px] text-stone-500">You can pick up to 2 additional currencies for now. More currencies coming soon.</p>
                {errors.currencies ? <p className="mt-1 text-[12px] text-rose-600">{errors.currencies}</p> : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="mb-4">
              <h4 className="text-[16px] font-serif font-bold text-[#0B3530]">Travel Dates</h4>
              <p className="mt-1 text-[13px] text-stone-500">These dates drive the budget day labels without changing the stored day number format.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[14px] font-semibold text-stone-600">Trip Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
                />
                {errors.startDate ? <p className="mt-1 text-[12px] text-rose-600">{errors.startDate}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-[14px] font-semibold text-stone-600">Trip End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
                />
                {errors.endDate ? <p className="mt-1 text-[12px] text-rose-600">{errors.endDate}</p> : null}
              </div>
            </div>

            {previewText ? (
              <div className="mt-4 rounded-xl border border-[#D0DFDC] bg-[#F1F5F4] px-4 py-3 text-[13px] font-medium text-[#0B3530]">
                {previewText}
              </div>
            ) : null}
          </section>

          <div className="flex items-center justify-end gap-3">
            {!isFirstSetup && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:text-stone-900"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-[#0B3530] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#18534C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
