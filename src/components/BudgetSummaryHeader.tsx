import React from "react";
import { Info } from "lucide-react";
import type { BudgetCard } from "../data/code1Itinerary";
import { exchangeRates } from "../data/itinerary";
import type { Expense } from "../types";

interface BudgetSummaryHeaderProps {
  cards: BudgetCard[];
  expenses: Expense[];
  showLiveSpends: boolean;
  setShowLiveSpends: (val: boolean) => void;
}

export default function BudgetSummaryHeader({
  cards,
  expenses,
  showLiveSpends,
  setShowLiveSpends,
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

  const formatRm = (amount: number) => `RM ${amount.toFixed(2)}`;
  const toPhp = (amount: number) => `PHP ${Math.round(amount * exchangeRates.php).toLocaleString()}`;
  const toSgd = (amount: number) => `SGD ${(amount * exchangeRates.sgd).toFixed(2)}`;

  const parseRmRange = (value: string) => {
    const matches = value.match(/\d+(?:\.\d+)?/g);
    if (!matches?.length) return null;
    const numbers = matches.map(Number);
    if (numbers.length === 1) return { min: numbers[0], max: numbers[0] };
    return { min: numbers[0], max: numbers[1] };
  };

  const renderCard = (card: BudgetCard, index: number) => {
    const isDayCard = index < 4;
    const dayNum = 12 + index;
    const liveTotal = isDayCard ? getDayTotal(dayNum) : null;
    const amountLabel = showLiveSpends && isDayCard ? formatRm(liveTotal!) : card.amount;
    const rmRange = parseRmRange(card.amount);
    const phpLabel = showLiveSpends && isDayCard
      ? toPhp(liveTotal!)
      : card.php;
    const rmLabel = showLiveSpends && isDayCard ? formatRm(liveTotal!) : card.amount;
    const sgdLabel = showLiveSpends && isDayCard
      ? toSgd(liveTotal!)
      : rmRange
        ? rmRange.min === rmRange.max
          ? toSgd(rmRange.min)
          : `${toSgd(rmRange.min)} - ${toSgd(rmRange.max)}`
        : "SGD N/A";

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
          className={`block mb-1 text-[9px] font-mono font-bold uppercase tracking-widest ${
            card.featured ? "text-[#88B04B]" : "text-[#88B04B]/90"
          }`}
        >
          {card.label}
        </span>
        <h3 className={`text-xl font-bold font-serif ${card.featured ? "text-white" : "text-stone-800"}`}>
          {amountLabel}
        </h3>
        <div className={`mt-1 text-[11px] font-mono ${card.featured ? "text-[#88B04B]" : "text-stone-400"}`}>
          <p>
            {phpLabel} <span className="mx-1">|</span> {rmLabel} <span className="mx-1">|</span> {sgdLabel}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section className="max-w-7xl mx-auto bg-stone-50 px-4 py-6 md:px-8">
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
              className="mr-2 rounded border-none bg-[#18534C]/15 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B3530] transition-colors hover:bg-[#18534C]/20 cursor-pointer"
            >
              {showLiveSpends ? "Show Targets" : "Show Calculated Active"}
            </button>
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Estimated total
            </span>
            <span className="text-lg font-serif font-bold text-[#0B3530]">RM 600 - 903</span>
          </div>
          <div className="mt-0.5 text-[10px] font-mono leading-none text-stone-400">
            {toPhp(600)} | RM 600.00 | {toSgd(600)}
            <span className="mx-1">|</span>
            {toPhp(903)} | RM 903.00 | {toSgd(903)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.slice(0, 4).map((card, index) => renderCard(card, index))}
      </div>

      <div className="grid grid-cols-1 gap-4 mb-5 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-[#0B3530] bg-[#0B3530] p-4 text-white">
          <span className="block mb-1 text-[9px] font-mono font-bold uppercase tracking-widest text-[#88B04B]">
            TOTAL CASH OUTFLOW (Cash / Debit)
          </span>
          <h3 className="text-xl font-bold font-serif text-white">RM {totalCashActual.toFixed(2)}</h3>
          <div className="mt-1 text-[11px] font-mono text-[#88B04B]">
            <p>
              {toPhp(totalCashActual)} <span className="mx-1">|</span> RM {totalCashActual.toFixed(2)}{" "}
              <span className="mx-1">|</span> {toSgd(totalCashActual)}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-stone-200/60 bg-white p-4">
          <span className="block mb-1 text-[9px] font-mono font-bold uppercase tracking-widest text-[#88B04B]/90">
            CREDIT CARD SPENDS
          </span>
          <h3 className="text-xl font-bold font-serif text-stone-800">RM {totalCardActual.toFixed(2)}</h3>
          <div className="mt-1 text-[11px] font-mono text-stone-400">
            <p>
              {toPhp(totalCardActual)} <span className="mx-1">|</span> RM {totalCardActual.toFixed(2)}{" "}
              <span className="mx-1">|</span> {toSgd(totalCardActual)}
            </p>
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
