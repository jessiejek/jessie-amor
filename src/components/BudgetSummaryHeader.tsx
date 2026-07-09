import React, { useMemo, useState } from "react";
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

  // Some itinerary days (e.g. the arrival/flight day) have no budget card here.
  // Fall back to the first budget day for *this component's own display* instead
  // of overwriting the shared selected-day state — that state also drives the
  // itinerary tab, and stomping on it would kick a valid itinerary day selection
  // (like Day 0) back to whatever day this component defaults to.
  const safeSelectedMobileDay = dayCards.some((dayCard) => dayCard.value === resolvedSelectedMobileDay)
    ? resolvedSelectedMobileDay
    : (dayCards[0]?.value ?? fallbackDayCards[0]?.value ?? 12);

  const getDayTotal = (dayNum: number) =>
    expenses.filter((expense) => expense.day === dayNum && (expense.paidWith === "Cash" || expense.paidWith === "Debit"))
      .reduce((sum, expense) => sum + expense.amount, 0);

  const totalCashActual = expenses.filter((expense) => expense.paidWith === "Cash" || expense.paidWith === "Debit")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalCardActual = expenses.filter((expense) => expense.paidWith === "Credit Card")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const configuredCurrencies = userSettings?.currencies?.length ? userSettings.currencies : ["PHP", "MYR", "SGD"];
  const primaryDisplayCurrency = userSettings?.baseCurrency ?? configuredCurrencies[0] ?? "PHP";
  const orderedDisplayCurrencies = [primaryDisplayCurrency, ...configuredCurrencies.filter((code) => code !== primaryDisplayCurrency)];
  const secondaryDisplayCurrencies = orderedDisplayCurrencies.filter((code) => code !== primaryDisplayCurrency);

  const formatCurrencyFromMyr = (amount: number, currencyCode: string) => {
    if (currencyCode === "RM" || currencyCode === "MYR") return `MYR ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const rate = exchangeRates.rates[currencyCode];
    if (!rate) return `${currencyCode} N/A`;
    return `${currencyCode} ${(amount * rate).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  const formatCurrencyAmountValue = (amount: number, currencyCode: string) => {
    if (currencyCode === "RM" || currencyCode === "MYR") return amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const rate = exchangeRates.rates[currencyCode];
    if (!rate) return "N/A";
    return (amount * rate).toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  const formatPrimaryAmount = (amount: number) => formatCurrencyFromMyr(amount, primaryDisplayCurrency);
  const formatSecondaryAmountGroup = (amount: number) => secondaryDisplayCurrencies.map((code) => formatCurrencyFromMyr(amount, code)).join(" | ");
  const formatSecondaryRangeAmounts = (minAmount: number, maxAmount: number) =>
    secondaryDisplayCurrencies.map((code) => {
      const minValue = formatCurrencyAmountValue(minAmount, code);
      const maxValue = formatCurrencyAmountValue(maxAmount, code);
      return minAmount === maxAmount ? `${code} ${minValue}` : `${code} ${minValue} - ${maxValue}`;
    }).join(" | ");

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
    const entries = cards.filter((card) => !card.featured && /^([A-Za-z]+)\s+\d{1,2}$/.test(card.label))
      .map((card) => [card.label.toLowerCase(), card] as const);
    return new Map(entries);
  }, [cards]);

  const dayEntries = useMemo(() =>
    dayCards.map((dayCard) => ({ dayMeta: dayCard, card: budgetCardByLabel.get(dayCard.label.toLowerCase()) ?? null })),
    [budgetCardByLabel, dayCards],
  );

  const estimatedTotalRange = useMemo(() => {
    const totals = dayEntries.map((entry) => (entry.card ? parseAmountRange(entry.card.amount) : null))
      .filter((range): range is { min: number; max: number } => Boolean(range));
    return { min: totals.reduce((sum, r) => sum + r.min, 0), max: totals.reduce((sum, r) => sum + r.max, 0) };
  }, [dayEntries]);

  const mobileSelectedCardIndex = Math.max(0, dayEntries.findIndex((entry) => entry.dayMeta.value === safeSelectedMobileDay));
  const mobileSelectedEntry = dayEntries[mobileSelectedCardIndex] ?? dayEntries[0] ?? null;

  const renderDayCard = (dayMeta: { value: number; label: string }, card: BudgetCard | null, index: number) => {
    const liveTotal = getDayTotal(dayMeta.value);
    const targetPrimaryLabel = card ? formatRangeLine(card.amount) : "No target set";
    const targetSecondaryLabel = card ? formatSecondaryRangeLine(card.amount) : "";
    const activePrimaryLabel = formatPrimaryAmount(liveTotal);
    const activeSecondaryLabel = formatSecondaryAmountGroup(liveTotal);
    const isFeatured = Boolean(card?.featured);

    return (
      <IonCard key={`${dayMeta.label}-${index}`} className={`ja-budget-day-card${isFeatured ? " ja-budget-day-card-featured" : ""}`}
        style={isFeatured ? ({ "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties) : undefined}>
        {isFeatured ? <div className="ja-budget-day-deco" /> : null}
        <IonCardContent>
          <IonCardSubtitle className="ja-budget-day-subtitle" style={{ color: isFeatured ? "#88B04B" : "rgba(136,176,75,0.9)" }}>
            {dayMeta.label}
          </IonCardSubtitle>
          <div className="ja-budget-day-inner">
            <div>
              <div className={`ja-budget-day-label${isFeatured ? " ja-budget-day-label-light" : ""}`}>Target</div>
              <h3 className={`ja-budget-day-value${isFeatured ? " ja-budget-day-value-light" : ""}`}>{targetPrimaryLabel}</h3>
              {targetSecondaryLabel ? (
                <div className={`ja-budget-day-meta${isFeatured ? " ja-budget-day-meta-green" : ""}`}>
                  <p>{targetSecondaryLabel}</p>
                </div>
              ) : !card ? (
                <div className="ja-budget-day-meta-muted">Add a target for this day when ready.</div>
              ) : null}
            </div>
            <div className="ja-budget-day-active-box" style={{ background: isFeatured ? "rgba(255,255,255,0.08)" : "#fafaf9" }}>
              <div className={`ja-budget-day-label${isFeatured ? " ja-budget-day-label-light" : ""}`}>Calculated Active</div>
              <div className={`ja-budget-day-active-value${isFeatured ? " ja-budget-day-active-value-light" : ""}`}>{activePrimaryLabel}</div>
              {activeSecondaryLabel ? <div className={`ja-budget-day-active-meta${isFeatured ? " ja-budget-day-active-meta-green" : ""}`}>{activeSecondaryLabel}</div> : null}
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    );
  };

  return (
    <section className="ja-budget-summary-section">
      <div className="ja-budget-summary-header">
        <div>
          <h2 className="ja-budget-summary-title">Budget Summary</h2>
          <p className="ja-budget-summary-subtitle">Targets and calculated active totals shown together for faster comparison</p>
        </div>
        <div className="ja-budget-summary-total-col">
          <div className="ja-budget-summary-total-row">
            <span className="ja-budget-summary-total-label">Estimated target total</span>
            <span className="ja-budget-summary-total-value">{`${formatPrimaryAmount(estimatedTotalRange.min)} - ${formatPrimaryAmount(estimatedTotalRange.max)}`}</span>
          </div>
          {secondaryDisplayCurrencies.length > 0 ? (
            <div className="ja-budget-summary-alt">{formatSecondaryRangeAmounts(estimatedTotalRange.min, estimatedTotalRange.max)}</div>
          ) : null}
        </div>
      </div>

      <div className="ja-budget-summary-mobile-days">
        {dayCards.map((dayCard) => {
          const isActive = dayCard.value === safeSelectedMobileDay;
          return (
            <IonButton key={dayCard.value} onClick={() => setResolvedSelectedMobileDay(dayCard.value)}
              fill={isActive ? "solid" : "outline"} color={isActive ? "primary" : undefined} size="small" className="ja-budget-day-btn">
              {dayCard.label}
            </IonButton>
          );
        })}
      </div>

      <div className="ja-budget-summary-mobile-card">
        {mobileSelectedEntry ? renderDayCard(mobileSelectedEntry.dayMeta, mobileSelectedEntry.card, mobileSelectedCardIndex) : null}
      </div>

      <div className="ja-budget-summary-grid">
        {dayEntries.map((entry, index) => renderDayCard(entry.dayMeta, entry.card, index))}
      </div>

      <div className="ja-budget-summary-totals-row">
        <IonCard className="ja-budget-summary-total-card ja-budget-summary-total-card-dark"
          style={{ "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties}>
          <IonCardContent>
            <IonCardSubtitle className="ja-budget-summary-total-label-inner" style={{ color: "#88B04B" }}>CASH OUTFLOW</IonCardSubtitle>
            <h3 className="ja-budget-summary-total-amount">{formatPrimaryAmount(totalCashActual)}</h3>
            {secondaryDisplayCurrencies.length > 0 ? (
              <div className="ja-budget-summary-total-alt" style={{ color: "#88B04B" }}><p>{formatSecondaryAmountGroup(totalCashActual)}</p></div>
            ) : null}
          </IonCardContent>
        </IonCard>

        <IonCard className="ja-budget-summary-total-card">
          <IonCardContent>
            <IonCardSubtitle className="ja-budget-summary-total-label-inner" style={{ color: "rgba(136,176,75,0.9)" }}>CC SPENDS</IonCardSubtitle>
            <h3 className="ja-budget-summary-total-amount">{formatPrimaryAmount(totalCardActual)}</h3>
            {secondaryDisplayCurrencies.length > 0 ? (
              <div className="ja-budget-summary-total-alt"><p>{formatSecondaryAmountGroup(totalCardActual)}</p></div>
            ) : null}
          </IonCardContent>
        </IonCard>
      </div>

      <div className="ja-budget-summary-note">
        <IonIcon icon={informationCircleOutline} className="ja-budget-summary-note-icon" style={{ color: "#0B3530", fontSize: 16 }} />
        <div className="ja-budget-summary-note-text">
          <strong>Note:</strong> Cash/debit is tracked together, while credit card spends stay separate.
          <div className="ja-budget-summary-note-sub">Live totals update from the expense registry.</div>
        </div>
      </div>
    </section>
  );
}
