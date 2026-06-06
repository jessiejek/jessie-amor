import React, { useState } from "react";
import { Plus, Trash, AlertTriangle, PiggyBank, CreditCard, DollarSign, ListFilter, PlusCircle } from "lucide-react";
import { Expense, ExpenseCategory, PaymentMethod } from "../types";
import { exchangeRate } from "../data/itinerary";

interface BudgetTabProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export default function BudgetTab({ expenses, setExpenses }: BudgetTabProps) {
  // Expense inputs
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState<number>(12);
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [paidWith, setPaidWith] = useState<PaymentMethod>("Cash");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount || isNaN(parseFloat(amount))) return;

    const newExp: Expense = {
      id: "exp-" + Date.now(),
      day,
      category,
      item: desc,
      amount: parseFloat(amount),
      paidWith
    };

    setExpenses((prev) => [...prev, newExp]);
    setDesc("");
    setAmount("");
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Math variables
  const cashSpent = expenses
    .filter((e) => e.paidWith === "Cash")
    .reduce((sum, e) => sum + e.amount, 0);

  const cardSpent = expenses
    .filter((e) => e.paidWith === "Credit Card")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalBudget = 1000; // RM recommended cash budget
  const cashRemaining = totalBudget - cashSpent;
  const isOverBudget = cashRemaining < 0;

  // Filter lists
  const filteredExpenses = expenses.filter((e) => {
    if (filterCategory === "All") return true;
    return e.category === filterCategory;
  });

  // Calculate percentages by category for the SVG charting
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
        return "#E05A47"; // Warm Red
      case "Transport":
        return "#478BE0"; // Blue
      case "Accommodation":
        return "#E09C47"; // Golden Amber
      case "Sightseeing":
        return "#18534C"; // Dark Slate Teal
      default:
        return "#7F8C8D"; // Grey
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 bg-stone-50 animate-in fade-in duration-300">
      {/* Upper Executive Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Cash Balance Display */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#88B04B] uppercase block">RECOMMENDED CASH REMAINING</span>
            <h4 className={`text-2xl font-serif font-bold mt-1 ${isOverBudget ? "text-rose-600" : "text-[#0B3530]"}`}>
              RM {cashRemaining.toFixed(2)}
            </h4>
            <span className="text-[11px] text-stone-400 font-sans block mt-0.5">
              ≈ ₱ {(cashRemaining * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} PHP
            </span>
          </div>
          <div className={`p-3 rounded-full ${isOverBudget ? "bg-rose-50 text-rose-600" : "bg-[#EDF3EF] text-[#0B3530]"}`}>
            <PiggyBank size={24} />
          </div>
        </div>

        {/* Total Cash Spent */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase block">TOTAL CASH OUTFLOW</span>
            <h4 className="text-2xl font-serif font-bold text-stone-800 mt-1">
              RM {cashSpent.toFixed(2)}
            </h4>
            <span className="text-[11px] text-stone-400 font-sans block mt-0.5">
              ≈ ₱ {(cashSpent * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} PHP
            </span>
          </div>
          <div className="p-3 rounded-full bg-stone-100 text-stone-600">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Credit Card Excluded */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase block">CREDIT CARD SPENDS (EXCLUDED)</span>
            <h4 className="text-2xl font-serif font-bold text-blue-900 mt-1">
              RM {cardSpent.toFixed(2)}
            </h4>
            <span className="text-[11px] text-stone-400 font-sans block mt-0.5">
              Excludes from the RM 1,000 cash pool
            </span>
          </div>
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Progress alert bar wrapper */}
      {isOverBudget && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex gap-2 items-center">
          <AlertTriangle size={16} />
          <span>Careful, you have exceeded the recommended cash allowance of <strong>RM 1,000</strong>! Review card transactions or minimize shopping outflows.</span>
        </div>
      )}

      {/* Main Budget Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Left Input Form */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs h-fit">
          <h3 className="text-base font-serif font-bold text-[#0B3530] border-b border-stone-100 pb-3 mb-4">Add Custom Spend</h3>
          
          <form onSubmit={addExpense} className="space-y-4 font-sans">
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">Item Title</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. Kaya Toast, Metro Pass"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs outline-none focus:border-[#0B3530]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Price (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs outline-none focus:border-[#0B3530]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Travel Day</label>
                <select
                  value={day}
                  onChange={(e) => setDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs outline-none focus:border-[#0B3530] bg-[#FFFFFF]"
                >
                  <option value={12}>July 12 (Day 12)</option>
                  <option value={13}>July 13 (Day 13)</option>
                  <option value={14}>July 14 (Day 14)</option>
                  <option value={15}>July 15 (Day 15)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs outline-none focus:border-[#0B3530] bg-[#FFFFFF]"
                >
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Payment Type</label>
                <select
                  value={paidWith}
                  onChange={(e) => setPaidWith(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs outline-none focus:border-[#0B3530] bg-[#FFFFFF]"
                >
                  <option value="Cash">Cash Account</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-[#0B3530] text-white hover:bg-[#18534C] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-xs mt-2"
            >
              <PlusCircle size={15} /> Add Expense Detail
            </button>
          </form>

          {/* Budget Visual Chart */}
          <div className="mt-6 border-t border-stone-100 pt-5">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">Spends by Category</h4>
            <div className="space-y-3">
              {categoryTotals.map((cat) => {
                const percentage = (cat.amount / maxCatTotal) * 100;
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-sans font-medium text-stone-600">{cat.name}</span>
                      <span className="font-mono text-stone-800 font-bold">RM {cat.amount.toFixed(1)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getCategoryColor(cat.name as ExpenseCategory)
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Expenses Registry Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs lg:col-span-2 flex flex-col h-[520px]">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-[#0B3530]">Transaction Registry</h3>
              <p className="text-[11px] text-stone-400 font-sans">Chronological list of all recorded travel cash outflows</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5">
              <ListFilter size={12} className="text-stone-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2 py-1 border border-stone-200 rounded text-[11px] outline-none text-stone-600 font-sans bg-[#FFFFFF]"
              >
                <option value="All">All Categories</option>
                <option value="Transport">Transport Only</option>
                <option value="Accommodation">Accommodation Only</option>
                <option value="Food">Food Only</option>
                <option value="Sightseeing">Sightseeing Only</option>
              </select>
            </div>
          </div>

          {/* Table list */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {filteredExpenses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <p className="text-xs text-stone-400 font-sans">No expenses logged matching this filter criteria.</p>
              </div>
            ) : (
              filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex justify-between items-center p-3 rounded-lg border border-stone-100 bg-[#FBFBFB] hover:border-stone-200/80 transition-all text-xs font-sans group"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Circle Color Tag */}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(exp.category) }}
                    ></span>
                    <div>
                      <div className="font-semibold text-stone-800">{exp.item}</div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 font-sans mt-0.5">
                        <span>Day {exp.day}</span>
                        <span>•</span>
                        <span>{exp.category}</span>
                        <span>•</span>
                        <span className={exp.paidWith === "Credit Card" ? "text-blue-500 font-mono" : "text-emerald-600 font-mono"}>
                          {exp.paidWith}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono font-bold text-stone-800">RM {exp.amount.toFixed(2)}</div>
                      <div className="text-[9px] text-stone-400 font-mono">≈ ₱ {(exp.amount * exchangeRate).toFixed(0)}</div>
                    </div>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 rounded text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete expense"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-stone-100 pt-3 text-[10px] font-mono text-stone-400 text-center uppercase tracking-widest">
            REGISTRY SYNCHRONIZED SECURELY
          </div>
        </div>

      </div>
    </div>
  );
}
