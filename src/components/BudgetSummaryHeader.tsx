import React from "react";
import { Info, PiggyBank } from "lucide-react";
import type { BudgetCard } from "../data/code1Itinerary";
import { exchangeRate } from "../data/itinerary";
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
      .filter((expense) => expense.day === dayNum && expense.paidWith === "Cash")
      .reduce((sum, expense) => sum + expense.amount, 0);

  const totalCashActual = expenses
    .filter((expense) => expense.paidWith === "Cash")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const renderCard = (card: BudgetCard, index: number) => {
    const isDayCard = index < 4;
    const dayNum = 12 + index;
    const liveTotal = isDayCard ? getDayTotal(dayNum) : null;
    const displayAmount = showLiveSpends && isDayCard ? `RM ${liveTotal!.toFixed(1)}` : card.amount;
    const displayPhp =
      showLiveSpends && isDayCard
        ? `≈ ₱ ${(liveTotal! * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} Actual`
        : card.php;

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
        <span className={`block text-[9px] font-mono font-bold uppercase tracking-widest mb-1 ${
          card.featured ? "text-[#88B04B]" : "text-[#88B04B]/90"
        }`}>
          {card.label}
        </span>
        <h3 className={`text-xl font-bold font-serif ${card.featured ? "text-white" : "text-stone-800"}`}>
          {displayAmount}
        </h3>
        <p className={`mt-1 text-[11px] font-mono ${card.featured ? "text-[#88B04B]" : "text-stone-400"}`}>
          {displayPhp}
        </p>
      </div>
    );
  };

  return (
    <section className="max-w-7xl mx-auto bg-stone-50 px-4 py-6 md:px-8">
      <div className="mb-6 flex flex-col items-start justify-between border-b border-stone-200 pb-4 sm:flex-row sm:items-baseline">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#0B3530] md:text-2xl">Budget Summary</h2>
          <p className="mt-0.5 text-xs font-sans text-stone-400">
            Overview of projected allowances v. recommended cash reserves
          </p>
        </div>

        <div className="mt-2 flex flex-col items-end sm:mt-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLiveSpends(!showLiveSpends)}
              className="mr-2 rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B3530] transition-colors hover:bg-[#18534C]/20 cursor-pointer border-none bg-[#18534C]/15"
            >
              {showLiveSpends ? "Show Targets" : "Show Calculated Active"}
            </button>
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Estimated total
            </span>
            <span className="text-lg font-serif font-bold text-[#0B3530]">RM 600 - 903</span>
          </div>
          <span className="mt-0.5 text-[10px] font-mono leading-none text-stone-400">
            ≈ PHP 9,336 - 14,047
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-5">
        {cards.map((card, index) => renderCard(card, index))}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#D0DFDC] bg-[#F1F5F4] p-3.5">
        <Info size={16} className="mt-0.5 shrink-0 text-[#0B3530]" />
        <div className="text-xs leading-relaxed text-[#0B3530] font-sans">
          <strong>Note:</strong> Airport Grab on July 12 & July 15 is paid by credit card. Coffee rule: 1 shared coffee, not 2.
          <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-stone-500">
            Actual cash spent so far: RM {totalCashActual.toFixed(1)}
          </div>
        </div>
        <div className="ml-auto hidden rounded-full bg-white px-3 py-2 text-[#0B3530] shadow-xs md:flex">
          <PiggyBank size={18} />
        </div>
      </div>
    </section>
  );
}
