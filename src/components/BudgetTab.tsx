import React, { useState } from "react";
import { AlertTriangle, CreditCard, DollarSign, ListFilter, PiggyBank, PlusCircle, Trash } from "lucide-react";
import type { ExchangeRates } from "../lib/exchangeRates";
import type { Expense, ExpenseCategory, ExpenseCurrency, PaymentMethod } from "../types";

interface BudgetTabProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  isSupabaseConnected?: boolean;
  canEdit?: boolean;
  exchangeRates: ExchangeRates;
  currentSavedBy?: {
    userId: string;
    email: string;
  } | null;
}

const currencyLabels: Record<ExpenseCurrency, string> = {
  RM: "RM",
  PHP: "PHP",
  SGD: "SGD",
};

export default function BudgetTab({
  expenses,
  setExpenses,
  isSupabaseConnected = false,
  canEdit = false,
  exchangeRates,
  currentSavedBy = null,
}: BudgetTabProps) {
  const [desc, setDesc] = useState("");
  const [amountText, setAmountText] = useState("");
  const [amountCurrency, setAmountCurrency] = useState<ExpenseCurrency>("RM");
  const [day, setDay] = useState<number>(12);
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [paidWith, setPaidWith] = useState<PaymentMethod>("Cash");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const convertToRm = (value: number, currency: ExpenseCurrency) => {
    if (currency === "RM") return value;
    if (currency === "PHP") return value / exchangeRates.php;
    return value / exchangeRates.sgd;
  };

  const formatRm = (amountValue: number) => `RM ${amountValue.toFixed(2)}`;
  const formatPhp = (amountValue: number) => `PHP ${Math.round(amountValue * exchangeRates.php).toLocaleString()}`;
  const formatSgd = (amountValue: number) => `SGD ${(amountValue * exchangeRates.sgd).toFixed(2)}`;
  const formatSavedBy = (email?: string, userId?: string) => email || userId || "Unknown";
  const formatTripDate = (tripDay: number) => `July ${tripDay}`;

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const parsedAmount = parseFloat(amountText);
    if (!desc.trim() || !amountText || isNaN(parsedAmount)) return;

    const newExp: Expense = {
      id: "exp-" + Date.now(),
      day,
      category,
      item: desc,
      amount: convertToRm(parsedAmount, amountCurrency),
      paidWith,
      originalAmount: parsedAmount,
      originalCurrency: amountCurrency,
      savedByUserId: currentSavedBy?.userId,
      savedByEmail: currentSavedBy?.email,
    };

    setExpenses((prev) => [...prev, newExp]);
    setDesc("");
    setAmountText("");
    setAmountCurrency("RM");
  };

  const deleteExpense = (id: string) => {
    if (!canEdit) return;
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const cashSpent = expenses
    .filter((e) => e.paidWith === "Cash" || e.paidWith === "Debit")
    .reduce((sum, e) => sum + e.amount, 0);

  const cardSpent = expenses
    .filter((e) => e.paidWith === "Credit Card")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalBudget = 1000;
  const cashRemaining = totalBudget - cashSpent;
  const isOverBudget = cashRemaining < 0;

  const filteredExpenses = expenses.filter((e) => {
    if (filterCategory === "All") return true;
    return e.category === filterCategory;
  });

  const cats: ExpenseCategory[] = ["Transport", "Accommodation", "Food", "Sightseeing", "Other"];
  const categoryTotals = cats.map((cat) => {
    const totalForCat = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat, amount: totalForCat };
  });

  const maxCatTotal = Math.max(...categoryTotals.map((c) => c.amount), 1);

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case "Food":
        return "#E05A47";
      case "Transport":
        return "#478BE0";
      case "Accommodation":
        return "#E09C47";
      case "Sightseeing":
        return "#18534C";
      default:
        return "#7F8C8D";
    }
  };

  return (
    <div className="budget-page max-w-7xl mx-auto px-4 md:px-8 py-4 bg-stone-50 animate-in fade-in duration-300">
      <div className="budget-summary-grid grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="budget-summary-card bg-white rounded-xl border border-stone-200 p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[13px] font-mono tracking-widest text-stone-400 uppercase block">CASH OUTFLOW</span>
            <h4 className="text-2xl font-serif font-bold text-stone-800 mt-1">{formatPhp(cashSpent)}</h4>
            <span className="text-[13px] text-stone-400 font-sans block mt-0.5">
              {formatRm(cashSpent)} | {formatSgd(cashSpent)}
            </span>
          </div>
          <div className="budget-summary-icon p-3 rounded-full bg-stone-100 text-stone-600">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="budget-summary-card bg-white rounded-xl border border-stone-200 p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[13px] font-mono tracking-widest text-blue-500 uppercase block">CC SPENDS</span>
            <h4 className="text-2xl font-serif font-bold text-blue-900 mt-1">{formatPhp(cardSpent)}</h4>
            <span className="text-[13px] text-stone-400 font-sans block mt-0.5">
              {formatRm(cardSpent)} | {formatSgd(cardSpent)}
            </span>
          </div>
          <div className="budget-summary-icon p-3 rounded-full bg-blue-50 text-blue-600">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {isOverBudget && (
        <div className="budget-alert mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex gap-2 items-center">
          <AlertTriangle size={16} />
          <span>
            Careful, you have exceeded the recommended cash allowance of <strong>RM 1,000</strong>! Review card transactions or minimize shopping outflows.
          </span>
        </div>
      )}

      <div className="budget-main grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="budget-form-panel bg-white rounded-2xl border border-stone-200 p-5 shadow-xs h-fit">
          <h3 className="budget-form-title text-[15px] font-serif font-bold text-[#0B3530] border-b border-stone-100 pb-3 mb-4 uppercase tracking-[0.08em]">Add Custom Spend</h3>
          {!canEdit && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              Sign in to add or edit budget items.
            </div>
          )}

          <form onSubmit={addExpense} className="budget-form space-y-4 font-sans">
            <div>
              <label className="budget-label text-[14px] font-semibold text-stone-600 block mb-1">Item Title</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. Kaya Toast, Metro Pass"
                disabled={!canEdit}
                className="budget-input w-full px-3 py-2 border border-stone-200 rounded-lg text-[15px] outline-none focus:border-[#0B3530]"
                required
              />
            </div>

            <div className="budget-two-col grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="budget-label text-[14px] font-semibold text-stone-600 block mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountText}
                  onChange={(e) => setAmountText(e.target.value)}
                  placeholder="0.00"
                  disabled={!canEdit}
                  className="budget-input w-full px-3 py-2 border border-stone-200 rounded-lg text-[15px] outline-none focus:border-[#0B3530]"
                  required
                />
              </div>

              <div>
                <label className="budget-label text-[14px] font-semibold text-stone-600 block mb-1">Currency</label>
                <select
                  value={amountCurrency}
                  onChange={(e) => setAmountCurrency(e.target.value as ExpenseCurrency)}
                  disabled={!canEdit}
                  className="budget-input w-full px-3 py-2 border border-stone-200 rounded-lg text-[15px] outline-none focus:border-[#0B3530] bg-[#FFFFFF]"
                >
                  <option value="RM">RM</option>
                  <option value="PHP">PHP</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
            </div>

            <div className="budget-two-col grid grid-cols-2 gap-3">
              <div>
                <label className="budget-label text-[14px] font-semibold text-stone-600 block mb-1">Date</label>
                <select
                  value={day}
                  onChange={(e) => setDay(parseInt(e.target.value))}
                  disabled={!canEdit}
                  className="budget-input w-full px-3 py-2 border border-stone-200 rounded-lg text-[15px] outline-none focus:border-[#0B3530] bg-[#FFFFFF]"
                >
                  <option value={11}>July 11</option>
                  <option value={12}>July 12</option>
                  <option value={13}>July 13</option>
                  <option value={14}>July 14</option>
                  <option value={15}>July 15</option>
                  <option value={16}>July 16</option>
                </select>
              </div>

              <div>
                <label className="budget-label text-[14px] font-semibold text-stone-600 block mb-1">Payment Type</label>
                <select
                  value={paidWith}
                  onChange={(e) => setPaidWith(e.target.value as PaymentMethod)}
                  disabled={!canEdit}
                  className="budget-input w-full px-3 py-2 border border-stone-200 rounded-lg text-[15px] outline-none focus:border-[#0B3530] bg-[#FFFFFF]"
                >
                  <option value="Cash">Cash</option>
                  <option value="Debit">Debit</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="budget-label text-[14px] font-semibold text-stone-600 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                disabled={!canEdit}
                className="budget-input w-full px-3 py-2 border border-stone-200 rounded-lg text-[15px] outline-none focus:border-[#0B3530] bg-[#FFFFFF]"
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Sightseeing">Sightseeing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!canEdit}
              className="budget-submit w-full py-3 px-4 rounded-lg bg-[#0B3530] text-white hover:bg-[#18534C] text-[15px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-xs mt-2"
            >
              <PlusCircle size={15} /> Add Expense Detail
            </button>
          </form>

          <div className="budget-category-panel mt-6 border-t border-stone-100 pt-5">
            <h4 className="budget-category-title text-[15px] font-bold text-stone-700 uppercase tracking-wider mb-3">Spends by Category</h4>
            <div className="budget-category-list space-y-3">
              {categoryTotals.map((cat) => {
                const percentage = (cat.amount / maxCatTotal) * 100;
                return (
                  <div key={cat.name} className="budget-category-row space-y-1">
                    <div className="budget-category-row-head flex justify-between items-center text-[16px]">
                      <span className="font-sans font-medium text-stone-600">{cat.name}</span>
                      <span className="font-mono text-stone-800 font-bold">{formatPhp(cat.amount)}</span>
                    </div>
                    <div className="budget-category-bar w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getCategoryColor(cat.name as ExpenseCategory),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="budget-registry bg-white rounded-2xl border border-stone-200 p-5 shadow-xs lg:col-span-2 flex flex-col h-[520px]">
          <div className="budget-registry-header flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
            <div>
              <h3 className="budget-registry-title text-[15px] font-serif font-bold text-[#0B3530]">Transaction Registry</h3>
              <p className="budget-registry-description text-[15px] text-stone-400 font-sans">Chronological list of all recorded travel cash outflows</p>
            </div>

            <div className="budget-registry-filter flex items-center gap-1.5">
              <ListFilter size={12} className="text-stone-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              className="budget-registry-select px-2 py-1 border border-stone-200 rounded text-[14px] outline-none text-stone-600 font-sans bg-[#FFFFFF]"
              >
                <option value="All">All Categories</option>
                <option value="Transport">Transport Only</option>
                <option value="Accommodation">Accommodation Only</option>
                <option value="Food">Food Only</option>
                <option value="Sightseeing">Sightseeing Only</option>
              </select>
            </div>
          </div>

          <div className="budget-registry-list flex-1 overflow-y-auto pr-1 space-y-2">
            {filteredExpenses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <p className="text-xs text-stone-400 font-sans">No expenses logged matching this filter criteria.</p>
              </div>
            ) : (
              filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="budget-transaction-row flex justify-between items-center p-3 rounded-lg border border-stone-100 bg-[#FBFBFB] hover:border-stone-200/80 transition-all text-sm md:text-xs font-sans group"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="budget-transaction-dot w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(exp.category) }}
                    />
                    <div>
                      <div className="budget-transaction-title font-semibold text-stone-800 text-[15px]">{exp.item}</div>
                      <div className="budget-transaction-meta flex items-center gap-1 text-[14px] text-stone-400 font-sans mt-0.5 flex-nowrap min-w-0">
                        <span>{formatTripDate(exp.day)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{exp.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className={exp.paidWith === "Credit Card" ? "text-blue-500 font-mono" : "text-emerald-600 font-mono"}>
                          {exp.paidWith}
                        </span>
                        {(exp.savedByEmail || exp.savedByUserId) && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-stone-500 font-mono">Saved by {formatSavedBy(exp.savedByEmail, exp.savedByUserId)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right shrink-0 ml-2">
                      <div className="budget-transaction-amount font-mono font-bold text-stone-800 text-[15px]">
                        {exp.originalCurrency && exp.originalAmount != null
                          ? `${currencyLabels[exp.originalCurrency]} ${exp.originalAmount.toFixed(2)}`
                          : `RM ${exp.amount.toFixed(2)}`}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      disabled={!canEdit}
                      className="p-1 rounded text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      title="Delete expense"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-stone-100 pt-3 text-[13px] font-mono text-stone-400 text-center uppercase tracking-widest">
            {isSupabaseConnected ? "SUPABASE SYNC ACTIVE" : "PREVIEW MODE ACTIVE"}
          </div>
        </div>
      </div>
    </div>
  );
}
