import React from "react";
import { Info } from "lucide-react";
import { DayPlan, Expense } from "../types";
import { exchangeRate } from "../data/itinerary";

interface BudgetSummaryHeaderProps {
  dayPlans: DayPlan[];
  expenses: Expense[];
  showLiveSpends: boolean;
  setShowLiveSpends: (val: boolean) => void;
}

export default function BudgetSummaryHeader({
  dayPlans,
  expenses,
  showLiveSpends,
  setShowLiveSpends
}: BudgetSummaryHeaderProps) {
  // Compute live totals if requested
  const getDayTotal = (dayNum: number) => {
    return expenses
      .filter((e) => e.day === dayNum && e.paidWith === "Cash")
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getDayCardData = (plan: DayPlan) => {
    if (!showLiveSpends) {
      return {
        rangeStr: plan.budgetRange,
        subStr: `₱ ${(plan.costMin * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}–${(plan.costMax * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      };
    } else {
      const total = getDayTotal(plan.day);
      return {
        rangeStr: `RM ${total.toFixed(1)}`,
        subStr: `₱ ${(total * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} Actual`
      };
    }
  };

  const totalCashActual = expenses
    .filter((e) => e.paidWith === "Cash")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 bg-stone-50">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline border-b border-stone-200 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-serif text-[#0B3530] font-bold">
            Budget Summary
          </h2>
          <p className="text-xs text-stone-400 font-sans mt-0.5">
            Overview of projected allowances v. recommended cash reserves
          </p>
        </div>
        <div className="flex flex-col items-end mt-2 sm:mt-0">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowLiveSpends(!showLiveSpends)}
              className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono font-bold bg-[#18534C]/15 text-[#0B3530] hover:bg-[#18534C]/25 transition-colors mr-2 cursor-pointer border-none"
            >
              {showLiveSpends ? "Show Targets" : "Show Calculated Active"}
            </button>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
              ESTIMATED TOTAL
            </span>
            <span className="text-lg font-serif font-bold text-[#0B3530]">
              RM 600 - 900
            </span>
          </div>
          <span className="text-[10px] font-mono text-stone-400 leading-none mt-0.5">
            ≈ PHP 8,136 - 12,204
          </span>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Day 12 Card */}
        <div className="bg-white rounded-xl border border-stone-200/60 p-4 transition-all hover:shadow-xs">
          <span className="text-[9px] font-mono font-bold text-[#88B04B]/90 uppercase tracking-widest block mb-1">
            JULY 12
          </span>
          <h3 className="text-xl font-bold font-serif text-stone-800">
            {getDayCardData(dayPlans[0]).rangeStr}
          </h3>
          <p className="text-[11px] font-mono text-stone-400 mt-1">
            {getDayCardData(dayPlans[0]).subStr}
          </p>
        </div>

        {/* Day 13 Card */}
        <div className="bg-white rounded-xl border border-stone-200/60 p-4 transition-all hover:shadow-xs">
          <span className="text-[9px] font-mono font-bold text-[#88B04B]/90 uppercase tracking-widest block mb-1">
            JULY 13
          </span>
          <h3 className="text-xl font-bold font-serif text-stone-800">
            {getDayCardData(dayPlans[1]).rangeStr}
          </h3>
          <p className="text-[11px] font-mono text-stone-400 mt-1">
            {getDayCardData(dayPlans[1]).subStr}
          </p>
        </div>

        {/* Day 14 Card */}
        <div className="bg-white rounded-xl border border-stone-200/60 p-4 transition-all hover:shadow-xs">
          <span className="text-[9px] font-mono font-bold text-[#88B04B]/90 uppercase tracking-widest block mb-1">
            JULY 14
          </span>
          <h3 className="text-xl font-bold font-serif text-stone-800">
            {getDayCardData(dayPlans[2]).rangeStr}
          </h3>
          <p className="text-[11px] font-mono text-stone-400 mt-1">
            {getDayCardData(dayPlans[2]).subStr}
          </p>
        </div>

        {/* Recommended Cash Card */}
        <div className="bg-[#0B3530] text-stone-100 rounded-xl p-4 transition-all hover:brightness-[1.05] relative overflow-hidden">
          {/* Subtle logo accent */}
          <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-[#18534C]/20 shrink-0"></div>
          <span className="text-[9px] font-mono font-bold text-[#88B04B] uppercase tracking-widest block mb-1">
            RECOMMENDED CASH
          </span>
          <h3 className="text-xl font-bold font-serif text-white">
            RM 1,000
          </h3>
          <p className="text-[11px] font-mono text-[#88B04B] mt-1">
            ~ PHP 13,560 (Actual Cash Spent: RM {totalCashActual.toFixed(1)})
          </p>
        </div>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-[#F1F5F4] rounded-xl border border-[#D0DFDC] p-3.5 flex gap-3 items-start">
        <Info size={16} className="text-[#0B3530] shrink-0 mt-0.5" />
        <div className="font-sans text-xs text-[#0B3530] leading-relaxed">
          <strong>Note:</strong> Airport Grab on July 12 & July 15 is paid by credit card. Coffee rule: 1 shared coffee, not 2.
        </div>
      </div>
    </section>
  );
}
