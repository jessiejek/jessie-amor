import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CreditCard, DollarSign, ListFilter, PiggyBank, PlusCircle, Trash, Utensils } from "lucide-react";
import type { ExchangeRates } from "../lib/exchangeRates";
import type { Expense, ExpenseCategory, ExpenseCurrency, PaymentMethod } from "../types";
import { supabase } from "../lib/supabaseClient";

type TransactionRow = {
  id: string;
  name: string;
  date: string;
  category: string;
  method: string;
  user: string | null;
  amount: number;
  created_at?: string;
};

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
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [selectedRegistryDate, setSelectedRegistryDate] = useState("All");

  const convertToRm = (value: number, currency: ExpenseCurrency) => {
    if (currency === "RM") return value;
    if (currency === "PHP") return value / exchangeRates.php;
    return value / exchangeRates.sgd;
  };

  const formatRm = (amountValue: number) => `RM ${amountValue.toFixed(2)}`;
  const formatPhp = (amountValue: number) => `PHP ${Math.round(amountValue * exchangeRates.php).toLocaleString()}`;
  const formatSgd = (amountValue: number) => `SGD ${(amountValue * exchangeRates.sgd).toFixed(2)}`;
  const formatSavedBy = (email?: string, userId?: string) => {
    if (email) return email.split("@")[0];
    if (userId) return userId.slice(0, 8);
    return "Unknown";
  };
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

  const deleteTransaction = async (id: string) => {
    if (!canEdit) return;
    const { error } = await supabase.from("budget_expenses").delete().eq("id", id);
    if (error) {
      setTransactionsError(error.message);
      return;
    }
    setTransactions((prev) => prev.filter((item) => item.id !== id));
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

  const registryExpenses = [...filteredExpenses].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.item.localeCompare(b.item);
  });

  const groupedExpenses = registryExpenses.reduce<Record<number, Expense[]>>((groups, exp) => {
    if (!groups[exp.day]) groups[exp.day] = [];
    groups[exp.day].push(exp);
    return groups;
  }, {});

  const groupedExpenseDays = Object.keys(groupedExpenses)
    .map(Number)
    .sort((a, b) => a - b);

  const getCategoryBadgeClasses = (cat: ExpenseCategory) => {
    switch (cat) {
      case "Food":
        return "bg-[#FDECEA] text-[#8A3A2C]";
      case "Transport":
        return "bg-[#EAF2FD] text-[#2E5EAA]";
      case "Accommodation":
        return "bg-[#FFF4E5] text-[#A05A00]";
      case "Sightseeing":
        return "bg-[#E8F4F1] text-[#1D6B63]";
      default:
        return "bg-[#F2F2F2] text-[#667085]";
    }
  };

  const getPaymentBadgeClasses = (method: PaymentMethod) => {
    return method === "Cash"
      ? "bg-[#E6F7F1] text-[#1F6D54]"
      : "bg-[#EAF2FD] text-[#2E5EAA]";
  };

  const getCategoryPillClass = (value: string) => {
    switch (value.toLowerCase()) {
      case "food":
        return "budget-pill budget-pill-food";
      case "transport":
        return "budget-pill budget-pill-transport";
      case "accommodation":
        return "budget-pill budget-pill-accommodation";
      case "sightseeing":
        return "budget-pill budget-pill-sightseeing";
      default:
        return "budget-pill budget-pill-other";
    }
  };

  const getMethodPillClass = (value: string) => {
    return value === "Cash" || value === "Debit"
      ? "budget-pill budget-pill-cash"
      : "budget-pill budget-pill-card";
  };

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      setLoadingTransactions(true);
      setTransactionsError("");

      const { data, error } = await supabase
        .from("budget_expenses")
        .select("*")
        .order("day", { ascending: false })
        .order("item", { ascending: true });

      if (!isMounted) return;

      if (error) {
        setTransactions([]);
        setTransactionsError(error.message);
      } else {
        const mappedTransactions = ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
          id: String(row.id ?? ""),
          name: String(row.item ?? ""),
          date: `July ${String(row.day ?? "")}`,
          category: String(row.category ?? ""),
          method: String(row.paid_with ?? ""),
          user: (row.saved_by_email as string | undefined) || (row.saved_by_user_id as string | undefined) || null,
          amount: Number(row.amount ?? 0),
          created_at: row.updated_at ? String(row.updated_at) : undefined,
        }));

        setTransactions(mappedTransactions);
      }

      setLoadingTransactions(false);
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.id.localeCompare(b.id);
    });

    const groups: Record<string, TransactionRow[]> = {};
    const orderedDates: string[] = [];

    sorted.forEach((item) => {
      const key = item.date || "Unknown Date";
      if (!groups[key]) {
        groups[key] = [];
        orderedDates.push(key);
      }
      groups[key].push(item);
    });

    return { groups, orderedDates };
  }, [transactions]);

  const groupedTransactionDates = useMemo(
    () => groupedTransactions.orderedDates,
    [groupedTransactions],
  );

  const registryDateChips = useMemo(() => {
    const dates = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date) dates.add(tx.date);
    });
    return Array.from(dates).sort((a, b) => {
      const aDay = parseInt(a.split(" ")[1] || "0", 10);
      const bDay = parseInt(b.split(" ")[1] || "0", 10);
      return aDay - bDay;
    });
  }, [transactions]);

  const formatTransactionUser = (user?: string | null) => {
    if (!user) return "Unknown";
    return user.includes("@") ? user.split("@")[0] : user;
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

        <div className="budget-registry">
          <div className="budget-registry-header">
            <div className="budget-registry-header-copy">
              <h3 className="budget-registry-title">Transaction Registry</h3>
              <p className="budget-registry-description">Chronological list of all recorded travel cash outflows</p>
            </div>

            <div className="budget-registry-filter">
              <ListFilter size={12} className="budget-registry-filter-icon" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="budget-registry-select"
              >
                <option value="All">All Categories</option>
                <option value="Transport">Transport Only</option>
                <option value="Accommodation">Accommodation Only</option>
                <option value="Food">Food Only</option>
                <option value="Sightseeing">Sightseeing Only</option>
              </select>
            </div>
          </div>

          <div className="budget-day-filter">
            <button
              type="button"
              className={`budget-day-chip ${selectedRegistryDate === "All" ? "is-active" : ""}`}
              onClick={() => setSelectedRegistryDate("All")}
            >
              All
            </button>
            {registryDateChips.map((dateLabel) => (
              <button
                key={dateLabel}
                type="button"
                className={`budget-day-chip ${selectedRegistryDate === dateLabel ? "is-active" : ""}`}
                onClick={() => setSelectedRegistryDate(dateLabel)}
              >
                {dateLabel}
              </button>
            ))}
          </div>

          <div className="budget-registry-list">
            {loadingTransactions ? (
              <p className="budget-registry-state">Loading...</p>
            ) : transactionsError ? (
              <p className="budget-registry-state">No transactions found.</p>
            ) : groupedTransactionDates.length === 0 ? (
              <p className="budget-registry-state">No transactions found.</p>
            ) : (
              groupedTransactionDates
                .filter((dateKey) => selectedRegistryDate === "All" || dateKey === selectedRegistryDate)
                .map((dateKey) => (
                <div key={dateKey} className="budget-date-group">
                  <div className="budget-date-header">{dateKey.toUpperCase()}</div>

                  <div className="budget-date-list">
                    {groupedTransactions.groups[dateKey].map((tx) => (
                      <article key={tx.id} className="budget-transaction-card">
                        <div className="budget-transaction-icon">
                          <i className="ti ti-tools-kitchen-2" aria-hidden="true" />
                        </div>

                        <div className="budget-transaction-body">
                          <h4 className="budget-transaction-name">{tx.name}</h4>
                          <div className="budget-transaction-meta">
                            <span className="budget-transaction-date">{tx.date}</span>
                            <span className="budget-transaction-dot" aria-hidden="true">·</span>
                            <span className={getCategoryPillClass(tx.category)}>{tx.category}</span>
                            <span className="budget-transaction-dot" aria-hidden="true">·</span>
                            <span className={getMethodPillClass(tx.method)}>{tx.method}</span>
                          </div>
                          <div className="budget-transaction-user-line">{formatTransactionUser(tx.user)}</div>
                        </div>

                        <div className="budget-transaction-right">
                          <div className="budget-transaction-amount">−RM {Math.abs(tx.amount).toFixed(2)}</div>
                          <button
                            type="button"
                            onClick={() => deleteTransaction(tx.id)}
                            disabled={!canEdit}
                            className="budget-transaction-delete"
                            title="Delete transaction"
                            aria-label="Delete transaction"
                          >
                            <i className="ti ti-trash" aria-hidden="true" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





