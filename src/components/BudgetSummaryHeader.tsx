import React from "react";
import { Info } from "lucide-react";
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
}

export default function BudgetSummaryHeader({
  cards,
  expenses,
  showLiveSpends,
  setShowLiveSpends,
  exchangeRates,
  userSettings = null,
}: BudgetSummaryHeaderProps) {
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

  const baseCurrency = "MYR";
  const nonBaseCurrencies = userSettings?.currencies?.filter((code) => code !== baseCurrency) ?? ["PHP", "SGD"];
  const primaryDisplayCurrency = nonBaseCurrencies[0] ?? "PHP";
  const secondaryDisplayCurrencies = userSettings
    ? nonBaseCurrencies.slice(1)
    : ["SGD"];

  const formatBaseAmount = (amount: number) => `${baseCurrency} ${amount.toFixed(2)}`;
  const formatConvertedAmount = (amount: number, currencyCode: string) => {
    const rate = exchangeRates.rates[currencyCode];
    if (!rate) return `${currencyCode} N/A`;
    return `${currencyCode} ${(amount * rate).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  const formatPrimaryAmount = (amount: number) => formatConvertedAmount(amount, primaryDisplayCurrency);
  const formatSecondaryAmounts = (amount: number) => {
    const entries = [formatBaseAmount(amount), ...secondaryDisplayCurrencies.map((code) => formatConvertedAmount(amount, code))];
    return entries.join(" | ");
  };

  const parseRmRange = (value: string) => {
    const matches = value.match(/\d+(?:\.\d+)?/g);
    if (!matches?.length) return null;
    const numbers = matches.map(Number);
    if (numbers.length === 1) return { min: numbers[0], max: numbers[0] };
    return { min: numbers[0], max: numbers[1] };
  };

  const formatPrimaryRange = (value: string) => {
    const range = parseRmRange(value);
    if (!range) return `${primaryDisplayCurrency} N/A`;
    if (range.min === range.max) return formatPrimaryAmount(range.min);
    return `${formatPrimaryAmount(range.min)} - ${formatPrimaryAmount(range.max)}`;
  };

  const formatSecondaryRange = (value: string) => {
    const range = parseRmRange(value);
    if (!range) return `${formatBaseAmount(0)} | ${secondaryDisplayCurrencies.map((code) => `${code} N/A`).join(" | ")}`;
    if (range.min === range.max) return formatSecondaryAmounts(range.min);
    return `${formatSecondaryAmounts(range.min)} | ${formatSecondaryAmounts(range.max)}`;
  };

  const renderCard = (card: BudgetCard, index: number) => {
    const isDayCard = index < 4;
    const dayNum = 12 + index;
    const liveTotal = isDayCard ? getDayTotal(dayNum) : null;
    const primaryLabel = showLiveSpends && isDayCard ? formatPrimaryAmount(liveTotal!) : card.php ? formatPrimaryRange(card.amount) : formatPrimaryRange(card.amount);
    const secondaryLabel = showLiveSpends && isDayCard ? formatSecondaryAmounts(liveTotal!) : formatSecondaryRange(card.amount);

    return (
      <div
        key={card.label}
        className={`relative overflow-hidden rounded-2xl border p-4 transition-all hover:shadow-xs ${
          card.featured
            ? "border-[#0B3530] bg-[#0B3530] text-white"
            : "border-stone-200/60 bg-white"
        }`}
      >
        {card.featured ? <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-[#18534C]/25" /> : null}
        <span
          className={`mb-1 block text-[13px] font-mono font-bold uppercase tracking-widest ${
            card.featured ? "text-[#88B04B]" : "text-[#88B04B]/90"
          }`}
        >
          {card.label}
        </span>
        <h3 className={`text-xl font-bold font-serif ${card.featured ? "text-white" : "text-stone-800"}`}>
          {primaryLabel}
        </h3>
        <div className={`mt-1 text-[13px] font-mono ${card.featured ? "text-[#88B04B]" : "text-stone-400"}`}>
          <p>{secondaryLabel}</p>
        </div>
      </div>
    );
  };

  return (
    <section className="mx-auto max-w-7xl bg-stone-50 px-4 py-6 md:px-8">
      <div className="mb-6 flex flex-col items-start justify-between border-b border-stone-200 pb-4 sm:flex-row sm:items-baseline">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#0B3530] md:text-2xl">Budget Summary</h2>
          <p className="mt-0.5 text-xs font-sans text-stone-400">
            Overview of projected allowances v. recorded cash/debit vs. card spending
          </p>
        </div>

        <div className="mt-2 flex flex-col items-end sm:mt-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLiveSpends(!showLiveSpends)}
              className="mr-2 cursor-pointer rounded border-none bg-[#18534C]/15 px-2 py-0.5 text-[13px] font-mono font-bold uppercase tracking-wider text-[#0B3530] transition-colors hover:bg-[#18534C]/20"
            >
              {showLiveSpends ? "Show Targets" : "Show Calculated Active"}
            </button>
            <span className="text-[13px] font-mono uppercase tracking-wider text-stone-400">
              Estimated total
            </span>
            <span className="text-lg font-serif font-bold text-[#0B3530]">
              {formatPrimaryAmount(600)} - {formatPrimaryAmount(903)}
            </span>
          </div>
          <div className="mt-0.5 text-[13px] font-mono leading-none text-stone-400">
            {formatSecondaryAmounts(600)} | {formatSecondaryAmounts(903)}
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.slice(0, 4).map((card, index) => renderCard(card, index))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-[#0B3530] bg-[#0B3530] p-4 text-white">
          <span className="mb-1 block text-[13px] font-mono font-bold uppercase tracking-widest text-[#88B04B]">
            CASH OUTFLOW
          </span>
          <h3 className="text-xl font-bold font-serif text-white">{formatPrimaryAmount(totalCashActual)}</h3>
          <div className="mt-1 text-[13px] font-mono text-[#88B04B]">
            <p>{formatSecondaryAmounts(totalCashActual)}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-stone-200/60 bg-white p-4">
          <span className="mb-1 block text-[13px] font-mono font-bold uppercase tracking-widest text-[#88B04B]/90">
            CC SPENDS
          </span>
          <h3 className="text-xl font-bold font-serif text-stone-800">{formatPrimaryAmount(totalCardActual)}</h3>
          <div className="mt-1 text-[13px] font-mono text-stone-400">
            <p>{formatSecondaryAmounts(totalCardActual)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#D0DFDC] bg-[#F1F5F4] p-3.5">
        <Info size={16} className="mt-0.5 shrink-0 text-[#0B3530]" />
        <div className="font-sans text-xs leading-relaxed text-[#0B3530]">
          <strong>Note:</strong> Cash/debit is tracked together, while credit card spends stay separate.
          <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-stone-500">
            Live totals update from the expense registry.
          </div>
        </div>
      </div>
    </section>
  );
}
