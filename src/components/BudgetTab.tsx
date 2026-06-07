import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BedDouble, BusFront, Camera, CreditCard, DollarSign, ListFilter, PlusCircle, Trash2, UtensilsCrossed, WalletCards } from "lucide-react";
import type { ExchangeRates } from "../lib/exchangeRates";
import type { Expense, ExpenseCategory, ExpenseCurrency, PaymentMethod } from "../types";
import { supabase, supabaseExpenseTable, tripKey } from "../lib/supabase";

type TransactionRow = {
  id: string;
  name: string;
  date: string;
  time: string;
  category: string;
  method: string;
  user: string | null;
  amount: number;
  originalAmount?: number;
  originalCurrency?: ExpenseCurrency;
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

  const formatDisplayTime = (value?: string | null) => {
    if (!value) return "Unknown time";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Unknown time";
    return parsed
      .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      .toLowerCase();
  };

  const formatTransactionAmount = (tx: TransactionRow) => {
    if (tx.originalAmount != null && tx.originalCurrency) {
      return `-${tx.originalCurrency} ${Math.abs(tx.originalAmount).toFixed(2)}`;
    }
    return `-RM ${Math.abs(tx.amount).toFixed(2)}`;
  };

  const mapRowToTransaction = (row: Record<string, unknown>): TransactionRow => ({
    id: String(row.id ?? ""),
    name: String(row.item ?? ""),
    date: `July ${String(row.day ?? "")}`,
    time: formatDisplayTime((row.created_at as string | undefined) ?? (row.updated_at as string | undefined)),
    category: String(row.category ?? ""),
    method: String(row.paid_with ?? ""),
    user: (row.saved_by_email as string | undefined) || (row.saved_by_user_id as string | undefined) || null,
    amount: Number(row.amount ?? 0),
    originalAmount: row.original_amount == null ? undefined : Number(row.original_amount),
    originalCurrency: (row.original_currency as ExpenseCurrency | undefined) ?? undefined,
    created_at: (row.created_at as string | undefined) ?? (row.updated_at ? String(row.updated_at) : undefined),
  });

  const upsertTransaction = (current: TransactionRow[], next: TransactionRow) => {
    const index = current.findIndex((item) => item.id === next.id);
    if (index === -1) return [...current, next];
    const copy = [...current];
    copy[index] = next;
    return copy;
  };

  const sortTransactions = (items: TransactionRow[]) =>
    [...items].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      const aDay = parseInt(a.date.split(" ")[1] || "0", 10);
      const bDay = parseInt(b.date.split(" ")[1] || "0", 10);
      if (aDay !== bDay) return bDay - aDay;
      return b.id.localeCompare(a.id);
    });

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
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [...prev, newExp]);
    setTransactions((prev) =>
      sortTransactions([
        ...prev,
        {
          id: newExp.id,
          name: newExp.item,
          date: `July ${newExp.day}`,
          time: formatDisplayTime(newExp.createdAt),
          category: newExp.category,
          method: newExp.paidWith,
          user: newExp.savedByEmail ?? newExp.savedByUserId ?? null,
          amount: newExp.amount,
          originalAmount: newExp.originalAmount,
          originalCurrency: newExp.originalCurrency,
          created_at: newExp.createdAt,
        },
      ]),
    );
    setDesc("");
    setAmountText("");
    setAmountCurrency("RM");
  };

  const deleteTransaction = async (id: string) => {
    if (!canEdit) return;
    const { error } = await supabase.from(supabaseExpenseTable).delete().eq("trip_key", tripKey).eq("id", id);
    if (error) {
      setTransactionsError(error.message);
      return;
    }
    setTransactions((prev) => prev.filter((item) => item.id !== id));
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

  const getCategoryIcon = (value: string) => {
    switch (value.toLowerCase()) {
      case "food":
        return <UtensilsCrossed size={16} aria-hidden="true" />;
      case "transport":
        return <BusFront size={16} aria-hidden="true" />;
      case "accommodation":
        return <BedDouble size={16} aria-hidden="true" />;
      case "sightseeing":
        return <Camera size={16} aria-hidden="true" />;
      default:
        return <WalletCards size={16} aria-hidden="true" />;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadTransactions = async () => {
      if (!supabase) {
        setTransactions([]);
        setLoadingTransactions(false);
        return;
      }

      setLoadingTransactions(true);
      setTransactionsError("");

      const { data, error } = await supabase
        .from(supabaseExpenseTable)
        .select("*")
        .eq("trip_key", tripKey)
        .order("updated_at", { ascending: false })
        .order("day", { ascending: false })
        .order("item", { ascending: true });

      if (!isMounted) return;

      if (error) {
        setTransactions([]);
        setTransactionsError(error.message);
      } else {
        const mappedTransactions = ((data ?? []) as Array<Record<string, unknown>>).map(mapRowToTransaction);
        setTransactions(sortTransactions(mappedTransactions));
      }

      setLoadingTransactions(false);
    };

    loadTransactions();

    if (supabase) {
      channel = supabase
        .channel(`budget-registry-${tripKey}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: supabaseExpenseTable, filter: `trip_key=eq.${tripKey}` },
          (payload) => {
            if (!isMounted) return;

            if (payload.eventType === "DELETE") {
              const deletedId = String(payload.old?.id ?? "");
              if (!deletedId) return;
              setTransactions((current) => current.filter((item) => item.id !== deletedId));
              return;
            }

            const row = payload.new as Record<string, unknown> | undefined;
            if (!row) return;
            setTransactions((current) => sortTransactions(upsertTransaction(current, mapRowToTransaction(row))));
          },
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel) {
        void supabase?.removeChannel(channel);
      }
    };
  }, []);

  const visibleTransactions = useMemo(() => {
    if (filterCategory === "All") return transactions;
    return transactions.filter((tx) => tx.category === filterCategory);
  }, [filterCategory, transactions]);

  const filteredGroupedTransactions = useMemo(() => {
    const sorted = sortTransactions(visibleTransactions);
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
  }, [visibleTransactions]);

  const groupedTransactionDates = filteredGroupedTransactions.orderedDates;

  const registryDateChips = useMemo(() => {
    const dates = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date) dates.add(tx.date);
    });
    return Array.from(dates).sort((a, b) => {
      const aDay = parseInt(a.split(" ")[1] || "0", 10);
      const bDay = parseInt(b.split(" ")[1] || "0", 10);
      return bDay - aDay;
    });
  }, [transactions]);

  const formatTransactionUser = (user?: string | null) => {
    if (!user) return "Unknown";
    return user.includes("@") ? user.split("@")[0] : user;
  };

  return (
    <div className="budget-page mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8 animate-in fade-in duration-300">
      <div className="budget-summary-grid mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="budget-summary-card flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div>
            <span className="block text-[13px] font-mono uppercase tracking-widest text-stone-400">Cash Outflow</span>
            <h4 className="mt-1 text-2xl font-serif font-bold text-stone-800">{formatPhp(cashSpent)}</h4>
            <span className="mt-0.5 block text-[13px] text-stone-400">
              {formatRm(cashSpent)} | {formatSgd(cashSpent)}
            </span>
          </div>
          <div className="budget-summary-icon rounded-full bg-stone-100 p-3 text-stone-600">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="budget-summary-card flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div>
            <span className="block text-[13px] font-mono uppercase tracking-widest text-blue-500">CC Spends</span>
            <h4 className="mt-1 text-2xl font-serif font-bold text-blue-900">{formatPhp(cardSpent)}</h4>
            <span className="mt-0.5 block text-[13px] text-stone-400">
              {formatRm(cardSpent)} | {formatSgd(cardSpent)}
            </span>
          </div>
          <div className="budget-summary-icon rounded-full bg-blue-50 p-3 text-blue-600">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {isOverBudget && (
        <div className="budget-alert mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
          <AlertTriangle size={16} />
          <span>
            Careful, you have exceeded the recommended cash allowance of <strong>RM 1,000</strong>. Review card transactions or minimize shopping outflows.
          </span>
        </div>
      )}

      <div className="budget-main grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
        <div className="space-y-6 xl:sticky xl:top-24">
          <div className="budget-form-panel h-fit rounded-[26px] border border-stone-200 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
            <div className="mb-4 border-b border-stone-100 pb-3">
              <h3 className="budget-form-title mt-2 text-[18px] font-serif font-bold text-[#0B3530]">Add Custom Spend</h3>
            </div>

            {!canEdit && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
                Sign in to add or edit budget items.
              </div>
            )}

            <form onSubmit={addExpense} className="budget-form space-y-4 font-sans">
              <div>
                <label className="budget-label mb-1 block text-[14px] font-semibold text-stone-600">Item Title</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Kaya Toast, Metro Pass"
                  disabled={!canEdit}
                  className="budget-input w-full rounded-lg border border-stone-200 px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
                  required
                />
              </div>

              <div className="budget-two-col grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="budget-label mb-1 block text-[14px] font-semibold text-stone-600">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountText}
                    onChange={(e) => setAmountText(e.target.value)}
                    placeholder="0.00"
                    disabled={!canEdit}
                    className="budget-input w-full rounded-lg border border-stone-200 px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
                    required
                  />
                </div>

                <div>
                  <label className="budget-label mb-1 block text-[14px] font-semibold text-stone-600">Currency</label>
                  <select
                    value={amountCurrency}
                    onChange={(e) => setAmountCurrency(e.target.value as ExpenseCurrency)}
                    disabled={!canEdit}
                    className="budget-input w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
                  >
                    <option value="RM">RM</option>
                    <option value="PHP">PHP</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>
              </div>

              <div className="budget-two-col grid grid-cols-2 gap-3">
                <div>
                  <label className="budget-label mb-1 block text-[14px] font-semibold text-stone-600">Date</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(parseInt(e.target.value, 10))}
                    disabled={!canEdit}
                    className="budget-input w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
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
                  <label className="budget-label mb-1 block text-[14px] font-semibold text-stone-600">Payment Type</label>
                  <select
                    value={paidWith}
                    onChange={(e) => setPaidWith(e.target.value as PaymentMethod)}
                    disabled={!canEdit}
                    className="budget-input w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Debit">Debit</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="budget-label mb-1 block text-[14px] font-semibold text-stone-600">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  disabled={!canEdit}
                  className="budget-input w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
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
                className="budget-submit mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border-none bg-[#0B3530] px-4 py-3 text-[15px] font-bold text-white shadow-xs transition-all hover:bg-[#18534C] cursor-pointer"
              >
                <PlusCircle size={15} /> Add Expense Detail
              </button>
            </form>
          </div>

          <div className="budget-category-panel rounded-[26px] border border-stone-200 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
            <div className="mb-4 border-b border-stone-100 pb-3">
              <h4 className="budget-category-title mt-2 text-[18px] font-serif font-bold text-[#0B3530]">Spends by Category</h4>
            </div>

            <div className="budget-category-list space-y-3">
              {categoryTotals.map((cat) => {
                const percentage = (cat.amount / maxCatTotal) * 100;
                return (
                  <div key={cat.name} className="budget-category-row space-y-1">
                    <div className="budget-category-row-head flex items-center justify-between text-[16px]">
                      <span className="font-sans font-medium text-stone-600">{cat.name}</span>
                      <span className="font-mono font-bold text-stone-800">{formatPhp(cat.amount)}</span>
                    </div>
                    <div className="budget-category-bar h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
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
              {!isSupabaseConnected && (
                <p className="mt-2 text-[13px] text-amber-700">
                  Cloud sync is offline right now, so this view is only showing the current local session state.
                </p>
              )}
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
              <p className="budget-registry-state">{transactionsError}</p>
            ) : groupedTransactionDates.length === 0 ? (
              <p className="budget-registry-state">No transactions found.</p>
            ) : (
              groupedTransactionDates
                .filter((dateKey) => selectedRegistryDate === "All" || dateKey === selectedRegistryDate)
                .map((dateKey) => (
                  <div key={dateKey} className="budget-date-group">
                    <div className="budget-date-header">{dateKey.toUpperCase()}</div>

                    <div className="budget-date-list">
                      {filteredGroupedTransactions.groups[dateKey].map((tx) => (
                        <article key={tx.id} className="budget-transaction-card">
                          <div className="budget-transaction-icon">
                            {getCategoryIcon(tx.category)}
                          </div>

                          <div className="budget-transaction-body">
                            <div className="budget-transaction-top">
                              <h4 className="budget-transaction-name">{tx.name}</h4>
                            </div>

                            <div className="budget-transaction-middle">
                              <div className="budget-transaction-badges">
                                <span className={getCategoryPillClass(tx.category)}>{tx.category}</span>
                                <span className={getMethodPillClass(tx.method)}>{tx.method}</span>
                              </div>
                              <div className="budget-transaction-amount">{formatTransactionAmount(tx)}</div>
                            </div>

                            <div className="budget-transaction-bottom">
                              <div className="budget-transaction-datetime">
                                <span className="budget-transaction-date">{tx.date}</span>
                                <span className="budget-transaction-dot" aria-hidden="true">|</span>
                                <span className="budget-transaction-time">{tx.time}</span>
                              </div>
                              <div className="budget-transaction-user-line">{formatTransactionUser(tx.user)}</div>
                            </div>
                          </div>

                          <div className="budget-transaction-actions">
                            <button
                              type="button"
                              onClick={() => deleteTransaction(tx.id)}
                              disabled={!canEdit}
                              className="budget-transaction-delete"
                              title="Delete transaction"
                              aria-label="Delete transaction"
                            >
                              <Trash2 size={16} aria-hidden="true" />
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
