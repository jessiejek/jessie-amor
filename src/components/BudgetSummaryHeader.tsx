import React, { useEffect, useMemo, useState } from "react";
import {
  IonCard,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import type { BudgetCard } from "../data/code1Itinerary";
import type { ExchangeRates } from "../lib/exchangeRates";
import type { Expense, UserTripSettings } from "../types";

interface BudgetSummaryHeaderProps {
  cards: BudgetCard[];
  expenses: Expense[];
  showLiveSpends: boolean;
  setShowLiveSpends: (val: boolean) => void;
  exchangeRates: ExchangeRates;
  userSettings?: UserTripSettings | null;
  selectedMobileDay?: number;
  onSelectedMobileDayChange?: (day: number) => void;
}

const fallbackDayCards = [
  { value: 12, label: "July 12" },
  { value: 13, label: "July 13" },
  { value: 14, label: "July 14" },
  { value: 15, label: "July 15" },
];

const formatShortDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const parseAmountRange = (value: string) => {
  const matches = value.match(/\d+(?:\.\d+)?/g);
  if (!matches?.length) return null;
  const numbers = matches.map(Number);
  if (numbers.length === 1) return { min: numbers[0], max: numbers[0] };
  return { min: numbers[0], max: numbers[1] };
};

export default function BudgetSummaryHeader({
  cards,
  expenses,
  showLiveSpends: _showLiveSpends,
  setShowLiveSpends: _setShowLiveSpends,
  exchangeRates,
  userSettings = null,
  selectedMobileDay,
  onSelectedMobileDayChange,
}: BudgetSummaryHeaderProps) {
  const dayCards = useMemo(() => {
    const configuredDayCards = (userSettings?.travelDates ?? []).map((dateStr) => {
      const date = new Date(`${dateStr}T00:00:00`);
      return {
        value: date.getDate(),
        label: date.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
      };
    });

    return configuredDayCards.length > 0 ? configuredDayCards : fallbackDayCards;
  }, [userSettings?.travelDates]);

  const [internalSelectedMobileDay, setInternalSelectedMobileDay] = useState<number>(dayCards[0]?.value ?? fallbackDayCards[0]?.value ?? 12);
  const resolvedSelectedMobileDay = selectedMobileDay ?? internalSelectedMobileDay;
  const setResolvedSelectedMobileDay = onSelectedMobileDayChange ?? setInternalSelectedMobileDay;

  useEffect(() => {
    if (!dayCards.some((dayCard) => dayCard.value === resolvedSelectedMobileDay)) {
      setResolvedSelectedMobileDay(dayCards[0]?.value ?? fallbackDayCards[0]?.value ?? 12);
    }
  }, [dayCards, resolvedSelectedMobileDay, setResolvedSelectedMobileDay]);

  const getDayTotal = (dayNum: number) =>
    expenses
      .filter((expense) => expense.day === dayNum && (expense.paidWith === "Cash" || expense.paidWith === "Debit"))
      .reduce((sum, expense) => sum + expense.amount, 0);

  const totalCashActual = expenses
    .filter((expense) => expense.paidWith === "Cash" || expense.paidWith === "Debit")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalCardActual = expenses
    .filter((expense) => expense.paidWith === "Credit Card")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const configuredCurrencies = userSettings?.currencies?.length
    ? userSettings.currencies
    : ["PHP", "MYR", "SGD"];
  const primaryDisplayCurrency = userSettings?.baseCurrency ?? configuredCurrencies[0] ?? "PHP";
  const orderedDisplayCurrencies = [
    primaryDisplayCurrency,
    ...configuredCurrencies.filter((code) => code !== primaryDisplayCurrency),
  ];
  const secondaryDisplayCurrencies = orderedDisplayCurrencies.filter((code) => code !== primaryDisplayCurrency);

  const formatCurrencyFromMyr = (amount: number, currencyCode: string) => {
    if (currencyCode === "RM" || currencyCode === "MYR") {
      return `MYR ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const rate = exchangeRates.rates[currencyCode];
    if (!rate) return `${currencyCode} N/A`;
    return `${currencyCode} ${(amount * rate).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  const formatCurrencyAmountValue = (amount: number, currencyCode: string) => {
    if (currencyCode === "RM" || currencyCode === "MYR") {
      return amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const rate = exchangeRates.rates[currencyCode];
    if (!rate) return "N/A";
    return (amount * rate).toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  const formatPrimaryAmount = (amount: number) => formatCurrencyFromMyr(amount, primaryDisplayCurrency);
  const formatSecondaryAmountGroup = (amount: number) =>
    secondaryDisplayCurrencies
      .map((currencyCode) => formatCurrencyFromMyr(amount, currencyCode))
      .join(" | ");

  const formatSecondaryRangeAmounts = (minAmount: number, maxAmount: number) =>
    secondaryDisplayCurrencies
      .map((currencyCode) => {
        const minValue = formatCurrencyAmountValue(minAmount, currencyCode);
        const maxValue = formatCurrencyAmountValue(maxAmount, currencyCode);
        return minAmount === maxAmount ? `${currencyCode} ${minValue}` : `${currencyCode} ${minValue} - ${maxValue}`;
      })
      .join(" | ");

  const formatRangeLine = (value: string) => {
    const range = parseAmountRange(value);
    if (!range) return `${primaryDisplayCurrency} N/A`;
    if (range.min === range.max) return formatPrimaryAmount(range.min);
    return `${formatPrimaryAmount(range.min)} - ${formatPrimaryAmount(range.max)}`;
  };

  const formatSecondaryRangeLine = (value: string) => {
    const range = parseAmountRange(value);
    if (!range || secondaryDisplayCurrencies.length === 0) return "";
    return formatSecondaryRangeAmounts(range.min, range.max);
  };

  const budgetCardByLabel = useMemo(() => {
    const entries = cards
      .filter((card) => !card.featured && /^([A-Za-z]+)\s+\d{1,2}$/.test(card.label))
      .map((card) => [card.label.toLowerCase(), card] as const);
    return new Map(entries);
  }, [cards]);

  const dayEntries = useMemo(
    () =>
      dayCards.map((dayCard) => ({
        dayMeta: dayCard,
        card: budgetCardByLabel.get(dayCard.label.toLowerCase()) ?? null,
      })),
    [budgetCardByLabel, dayCards],
  );

  const estimatedTotalRange = useMemo(() => {
    const totals = dayEntries
      .map((entry) => (entry.card ? parseAmountRange(entry.card.amount) : null))
      .filter((range): range is { min: number; max: number } => Boolean(range));

    const min = totals.reduce((sum, range) => sum + range.min, 0);
    const max = totals.reduce((sum, range) => sum + range.max, 0);
    return { min, max };
  }, [dayEntries]);

  const mobileSelectedCardIndex = Math.max(
    0,
    dayEntries.findIndex((entry) => entry.dayMeta.value === resolvedSelectedMobileDay),
  );
  const mobileSelectedEntry = dayEntries[mobileSelectedCardIndex] ?? dayEntries[0] ?? null;

  const renderDayCard = (dayMeta: { value: number; label: string }, card: BudgetCard | null, index: number) => {
    const liveTotal = getDayTotal(dayMeta.value);
    const targetPrimaryLabel = card ? formatRangeLine(card.amount) : "No target set";
    const targetSecondaryLabel = card ? formatSecondaryRangeLine(card.amount) : "";
    const activePrimaryLabel = formatPrimaryAmount(liveTotal);
    const activeSecondaryLabel = formatSecondaryAmountGroup(liveTotal);
    const isFeatured = Boolean(card?.featured);

    return (
      <IonCard
        key={`${dayMeta.label}-${index}`}
        className={`ja-budget-day-card ${isFeatured ? "ja-budget-day-card-featured" : ""}`}
        style={isFeatured ? ({ "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties) : undefined}
      >
        {isFeatured ? <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-[#18534C]/25" /> : null}
        <IonCardContent>
          <IonCardSubtitle
            className="ja-budget-day-subtitle text-[13px] font-mono font-bold uppercase tracking-widest"
            style={{ color: isFeatured ? "#88B04B" : "rgba(136,176,75,0.9)" }}
          >
            {dayMeta.label}
          </IonCardSubtitle>
          <div className="space-y-3 mt-3">
            <div>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-[0.25em] ${isFeatured ? "text-white/65" : "text-stone-400"}`}>
                Target
              </div>
              <h3 className={`mt-1 text-xl font-bold font-serif ${isFeatured ? "text-white" : "text-stone-800"}`}>
                {targetPrimaryLabel}
              </h3>
              {targetSecondaryLabel ? (
                <div className={`mt-1 text-[13px] font-mono ${isFeatured ? "text-[#88B04B]" : "text-stone-400"}`}>
                  <p>{targetSecondaryLabel}</p>
                </div>
              ) : !card ? (
                <div className="mt-1 text-[12px] font-mono text-stone-400">
                  Add a target for this day when ready.
                </div>
              ) : null}
            </div>
            <div
              className={`rounded-xl border px-3 py-2 ${isFeatured ? "border-white/15" : "border-stone-200"}`}
              style={{ background: isFeatured ? "rgba(255,255,255,0.08)" : "#fafaf9" }}
            >
              <div className={`text-[10px] font-mono font-bold uppercase tracking-[0.25em] ${isFeatured ? "text-white/65" : "text-stone-400"}`}>
                Calculated Active
              </div>
              <div className={`mt-1 text-lg font-bold font-serif ${isFeatured ? "text-white" : "text-stone-800"}`}>
                {activePrimaryLabel}
              </div>
              {activeSecondaryLabel ? (
                <div className={`mt-1 text-[12px] font-mono ${isFeatured ? "text-[#88B04B]" : "text-stone-500"}`}>
                  {activeSecondaryLabel}
                </div>
              ) : null}
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    );
  };

  return (
    <section className="mx-auto max-w-7xl bg-stone-50 px-4 py-6 md:px-8">
      <div className="mb-6 flex flex-col items-start justify-between border-b border-stone-200 pb-4 sm:flex-row sm:items-baseline">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#0B3530] md:text-2xl">Budget Summary</h2>
          <p className="mt-0.5 text-xs font-sans text-stone-400">
            Targets and calculated active totals shown together for faster comparison
          </p>
        </div>

        <div className="mt-2 flex flex-col items-end sm:mt-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-mono uppercase tracking-wider text-stone-400">
              Estimated target total
            </span>
            <span className="text-lg font-serif font-bold text-[#0B3530]">
              {`${formatPrimaryAmount(estimatedTotalRange.min)} - ${formatPrimaryAmount(estimatedTotalRange.max)}`}
            </span>
          </div>
          {secondaryDisplayCurrencies.length > 0 ? (
            <div className="mt-0.5 text-[13px] font-mono leading-none text-stone-400">
              {formatSecondaryRangeAmounts(estimatedTotalRange.min, estimatedTotalRange.max)}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile day selector */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
        {dayCards.map((dayCard) => {
          const isActive = dayCard.value === resolvedSelectedMobileDay;
          return (
            <IonButton
              key={dayCard.value}
              onClick={() => setResolvedSelectedMobileDay(dayCard.value)}
              fill={isActive ? "solid" : "outline"}
              color={isActive ? "primary" : undefined}
              size="small"
              className="ja-budget-day-btn"
            >
              {dayCard.label}
            </IonButton>
          );
        })}
      </div>

      {/* Mobile: single day card */}
      <div className="mb-5 sm:hidden">
        {mobileSelectedEntry ? renderDayCard(mobileSelectedEntry.dayMeta, mobileSelectedEntry.card, mobileSelectedCardIndex) : null}
      </div>

      {/* Desktop: all day cards in grid */}
      <div className="mb-5 hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        {dayEntries.map((entry, index) => renderDayCard(entry.dayMeta, entry.card, index))}
      </div>

      {/* Cash outflow + CC spends */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <IonCard
          className="ja-budget-summary-total-card ja-budget-summary-total-card-dark"
          style={{ "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties}
        >
          <IonCardContent>
            <IonCardSubtitle className="ja-budget-day-subtitle text-[13px] font-mono font-bold uppercase tracking-widest" style={{ color: "#88B04B" }}>
              CASH OUTFLOW
            </IonCardSubtitle>
            <h3 className="text-xl font-bold font-serif text-white mt-1">{formatPrimaryAmount(totalCashActual)}</h3>
            {secondaryDisplayCurrencies.length > 0 ? (
              <div className="mt-1 text-[13px] font-mono" style={{ color: "#88B04B" }}>
                <p>{formatSecondaryAmountGroup(totalCashActual)}</p>
              </div>
            ) : null}
          </IonCardContent>
        </IonCard>

        <IonCard className="ja-budget-summary-total-card">
          <IonCardContent>
            <IonCardSubtitle className="ja-budget-day-subtitle text-[13px] font-mono font-bold uppercase tracking-widest" style={{ color: "rgba(136,176,75,0.9)" }}>
              CC SPENDS
            </IonCardSubtitle>
            <h3 className="text-xl font-bold font-serif text-stone-800 mt-1">{formatPrimaryAmount(totalCardActual)}</h3>
            {secondaryDisplayCurrencies.length > 0 ? (
              <div className="mt-1 text-[13px] font-mono text-stone-400">
                <p>{formatSecondaryAmountGroup(totalCardActual)}</p>
              </div>
            ) : null}
          </IonCardContent>
        </IonCard>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#D0DFDC] bg-[#F1F5F4] p-3.5">
        <IonIcon icon={informationCircleOutline} className="mt-0.5 shrink-0" style={{ color: "#0B3530", fontSize: 16 }} />
        <div className="font-sans text-xs leading-relaxed" style={{ color: "#0B3530" }}>
          <strong>Note:</strong> Cash/debit is tracked together, while credit card spends stay separate.
          <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-stone-500">
            Live totals update from the expense registry.
          </div>
        </div>
      </div>
    </section>
  );
}
