import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BedDouble, BusFront, Camera, CreditCard, DollarSign, ListFilter, PlusCircle, Trash2, UtensilsCrossed, WalletCards } from "lucide-react";
import type { ExchangeRates } from "../lib/exchangeRates";
import type { CurrentUserInfo, Expense, ExpenseCategory, ExpenseCurrency, PaymentMethod, SyncStatus, UserTripSettings } from "../types";

type TransactionRow = {
  id: string;
  name: string;
  date: string;
  dayValue: number;
  time: string;
  category: string;
  method: string;
  user: string | null;
  createdBy: string | null;
  savedByUserId: string | null;
  savedByEmail: string | null;
  amount: number;
  originalAmount?: number;
  originalCurrency?: ExpenseCurrency;
  created_at?: string;
  syncStatus?: SyncStatus;
};

interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

const voiceNumberWords: Record<string, string> = {
  zero: "0",
  oh: "0",
  one: "1",
  won: "1",
  two: "2",
  to: "2",
  too: "2",
  three: "3",
  four: "4",
  for: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  ate: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
  thirty: "30",
  forty: "40",
  fifty: "50",
  sixty: "60",
  seventy: "70",
  eighty: "80",
  ninety: "90",
  hundred: "100",
};

const defaultVoiceCurrencyAliases: Record<string, string[]> = {
  MYR: ["myr", "rm", "ringgit", "malaysian ringgit"],
  SGD: ["sgd", "singapore dollar", "singapore dollars", "sing dollar", "sing dollars"],
  PHP: ["php", "peso", "pesos", "philippine peso", "philippine pesos"],
  USD: ["usd", "dollar", "dollars", "us dollar", "us dollars"],
  EUR: ["eur", "euro", "euros"],
  JPY: ["jpy", "yen", "japanese yen"],
  AUD: ["aud", "australian dollar", "australian dollars"],
  GBP: ["gbp", "british pound", "pound", "pounds"],
  IDR: ["idr", "rupiah", "indonesian rupiah"],
  THB: ["thb", "baht", "thai baht"],
};

const voicePaymentAliases: Record<PaymentMethod, string[]> = {
  Cash: ["cash", "money", "paid cash"],
  Debit: ["debit", "debit card", "atm card"],
  "Credit Card": ["credit card", "credit", "visa", "mastercard", "master card", "card"],
};

const voiceCategoryAliases: Record<ExpenseCategory, string[]> = {
  Food: ["food", "eat", "lunch", "dinner", "breakfast", "coffee", "cafe", "restaurant", "kaya", "toast", "nasi", "roti", "makan", "egg roll", "burger", "pizza", "snack", "drinks", "boba", "milk tea"],
  Transport: ["transport", "grab", "taxi", "bus", "mrt", "train", "ride", "uber", "transit", "ferry", "toll", "parking"],
  Accommodation: ["accommodation", "accomodation", "hotel", "hostel", "airbnb", "room", "stay", "check in", "check-in"],
  Sightseeing: ["sightseeing", "sight seeing", "tour", "museum", "attraction", "ticket", "visit", "zoo", "park", "entry", "show"],
  Other: ["other", "others", "misc", "miscellaneous"],
};

const voiceCategoryLabelAliases = ["food", "transport", "accommodation", "accomodation", "sightseeing", "sight seeing", "other", "others"];

const voiceCorrections: Array<[RegExp, string]> = [
  [/\begg dose\b/g, "egg toast"],
  [/\bdose\b/g, "toast"],
];

const numberWordPattern = new RegExp(`\\b(${Object.keys(voiceNumberWords).join("|")})\\b`, "g");
const matchesVoiceAlias = (text: string, aliases: string[]) =>
  aliases.some((alias) => new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b`).test(text));
const buildVoiceAliasPattern = (aliases: string[]) =>
  new RegExp(`\\b(${aliases.map((alias) => alias.replace(/\s+/g, "\\s+")).join("|")})\\b`, "g");

interface BudgetTabProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  isSupabaseConnected?: boolean;
  isOnline?: boolean;
  canEdit?: boolean;
  currentUser?: CurrentUserInfo | null;
  exchangeRates: ExchangeRates;
  budgetCapPhp: number;
  userSettings?: UserTripSettings | null;
}

export default function BudgetTab({
  expenses,
  setExpenses,
  isSupabaseConnected = false,
  isOnline = true,
  canEdit = false,
  currentUser = null,
  exchangeRates,
  budgetCapPhp,
  userSettings = null,
}: BudgetTabProps) {
  const [desc, setDesc] = useState("");
  const [amountText, setAmountText] = useState("");
  const fallbackDayOptions = [
    { value: 12, label: "Day 1 - Jul 12" },
    { value: 13, label: "Day 2 - Jul 13" },
    { value: 14, label: "Day 3 - Jul 14" },
    { value: 15, label: "Day 4 - Jul 15" },
  ];
  const currencyOptions = userSettings?.currencies?.length ? userSettings.currencies : ["MYR", "PHP", "SGD"];
  const [amountCurrency, setAmountCurrency] = useState<ExpenseCurrency>(currencyOptions[0] ?? "MYR");
  const [day, setDay] = useState<number>(12);
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [paidWith, setPaidWith] = useState<PaymentMethod>("Cash");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "mine">("mine");
  const [selectedRegistryDate, setSelectedRegistryDate] = useState("All");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [dismissedOverBudget, setDismissedOverBudget] = useState(false);

  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const activeDayOptions = useMemo(() => {
    const derived = (userSettings?.travelDates ?? []).map((dateStr, index) => {
      const date = new Date(`${dateStr}T00:00:00`);
      const dayNum = date.getDate();
      const labelDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { value: dayNum, label: `Day ${index + 1} - ${labelDate}` };
    });
    return derived.length > 0 ? derived : fallbackDayOptions;
  }, [userSettings?.travelDates]);
  const dayLabelByValue = useMemo(
    () => new Map(activeDayOptions.map((option) => [option.value, option.label] as const)),
    [activeDayOptions],
  );
  const syncRegistryDateForDay = (dayValue: number) => {
    const matchingLabel = dayLabelByValue.get(dayValue);
    if (matchingLabel) {
      setSelectedRegistryDate(matchingLabel);
    }
  };
  const handleDaySelection = (dayValue: number) => {
    setDay(dayValue);
    syncRegistryDateForDay(dayValue);
  };
  const handleRegistryDateSelection = (dateLabel: string) => {
    setSelectedRegistryDate(dateLabel);
    if (dateLabel === "All") return;
    const matchingDay = activeDayOptions.find((option) => option.label === dateLabel);
    if (matchingDay) {
      setDay(matchingDay.value);
    }
  };
  const voiceCurrencyAliases = useMemo(() => {
    const aliases: Record<string, string[]> = {};
    currencyOptions.forEach((code) => {
      aliases[code] = defaultVoiceCurrencyAliases[code] ?? [code.toLowerCase()];
    });
    return aliases;
  }, [currencyOptions]);
  const selectedDisplayCurrencies = useMemo(() => {
    const configured = userSettings?.currencies?.length ? userSettings.currencies : ["PHP", "MYR", "SGD"];
    return Array.from(new Set(configured));
  }, [userSettings]);
  const primaryDisplayCurrency = userSettings?.baseCurrency ?? selectedDisplayCurrencies[0] ?? "PHP";
  const secondaryDisplayCurrencies = selectedDisplayCurrencies.filter((code) => code !== primaryDisplayCurrency);

  useEffect(() => {
    if (!currencyOptions.includes(amountCurrency)) {
      setAmountCurrency(currencyOptions[0] ?? "MYR");
    }
  }, [amountCurrency, currencyOptions]);

  useEffect(() => {
    if (!activeDayOptions.some((option) => option.value === day)) {
      const fallbackDay = activeDayOptions[0]?.value ?? 12;
      setDay(fallbackDay);
      syncRegistryDateForDay(fallbackDay);
    }
  }, [activeDayOptions, day, dayLabelByValue]);

  const convertToRm = (value: number, currency: ExpenseCurrency) => {
    if (currency === "RM" || currency === "MYR") return value;
    const rate = exchangeRates.rates[currency];
    if (!rate) return value;
    return value / rate;
  };

  const formatRm = (amountValue: number) => `RM ${amountValue.toFixed(2)}`;
  const formatPhp = (amountValue: number) =>
    `PHP ${((amountValue * exchangeRates.php)).toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  const formatPhpExact = (amountValue: number) =>
    `PHP ${amountValue.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  const formatSgd = (amountValue: number) => `SGD ${(amountValue * exchangeRates.sgd).toFixed(2)}`;
  const formatPhpCap = (amountValue: number) =>
    `PHP ${amountValue.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  const hundredPhpInRm = (100 / exchangeRates.php).toFixed(3);
  const hundredPhpInSgd = ((100 / exchangeRates.php) * exchangeRates.sgd).toFixed(2);
  const formatCurrencyFromRm = (amountValue: number, currencyCode: string) => {
    if (currencyCode === "RM" || currencyCode === "MYR") {
      return `MYR ${amountValue.toFixed(2)}`;
    }

    const rate = exchangeRates.rates[currencyCode];
    if (!rate) {
      return `${currencyCode} N/A`;
    }

    return `${currencyCode} ${(amountValue * rate).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };
  const formatPrimaryDisplay = (amountValue: number) => formatCurrencyFromRm(amountValue, primaryDisplayCurrency);
  const formatSecondaryDisplay = (amountValue: number) => {
    if (secondaryDisplayCurrencies.length === 0) return "";
    return secondaryDisplayCurrencies.map((code) => formatCurrencyFromRm(amountValue, code)).join(" | ");
  };
  const exchangeHintLabel = secondaryDisplayCurrencies.length > 0
    ? `100 ${primaryDisplayCurrency} = ${secondaryDisplayCurrencies
      .map((code) => {
        if (code === "RM" || code === "MYR") {
          return formatCurrencyFromRm(100 / (exchangeRates.rates[primaryDisplayCurrency] ?? 1), code);
        }
        const primaryRate = primaryDisplayCurrency === "RM" || primaryDisplayCurrency === "MYR"
          ? 1
          : exchangeRates.rates[primaryDisplayCurrency];
        if (!primaryRate) return `${code} N/A`;
        return `${code} ${(100 / primaryRate * (exchangeRates.rates[code] ?? 0)).toFixed(2)}`;
      })
      .join(" | ")}`
    : `100 ${primaryDisplayCurrency}`;

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

  const mapExpenseToTransaction = (expense: Expense): TransactionRow => ({
    id: expense.id,
    name: expense.item,
    date: dayLabelByValue.get(expense.day) ?? `July ${String(expense.day)}`,
    dayValue: expense.day,
    time: formatDisplayTime(expense.createdAt),
    category: expense.category,
    method: expense.paidWith,
    user: expense.savedByEmail ?? expense.savedByUserId ?? null,
    createdBy: expense.createdBy ?? expense.savedByUserId ?? null,
    savedByUserId: expense.savedByUserId ?? null,
    savedByEmail: expense.savedByEmail ?? null,
    amount: expense.amount,
    originalAmount: expense.originalAmount,
    originalCurrency: expense.originalCurrency,
    created_at: expense.createdAt,
    syncStatus: expense.syncStatus,
  });

  const sortTransactions = (items: TransactionRow[]) =>
    [...items].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      if (a.dayValue !== b.dayValue) return b.dayValue - a.dayValue;
      return b.id.localeCompare(a.id);
    });

  const transactions = sortTransactions(expenses.map(mapExpenseToTransaction));

  const canManageExpense = (expense: Expense | TransactionRow) => {
    const ownerId = expense.createdBy ?? expense.savedByUserId ?? null;
    return Boolean(currentUser?.isAdmin || (currentUser && ownerId === currentUser.userId));
  };

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
      createdBy: currentUser?.userId,
      savedByUserId: currentUser?.userId,
      savedByEmail: currentUser?.email,
      createdAt: new Date().toISOString(),
      syncStatus: "pending",
    };

    setExpenses((prev) => [...prev, newExp]);
    setDesc("");
    setAmountText("");
  };

  const deleteTransaction = (transaction: TransactionRow) => {
    if (!canManageExpense(transaction)) return;
    setExpenses((prev) => prev.filter((exp) => exp.id !== transaction.id));
  };

  const ownerExpenses = useMemo(() => {
    if (ownerFilter === "mine" && currentUser) {
      return expenses.filter(
        (e) => e.createdBy === currentUser.userId || e.savedByUserId === currentUser.userId,
      );
    }
    return expenses;
  }, [expenses, ownerFilter, currentUser]);

  const myExpenses = useMemo(() => {
    if (!currentUser) return expenses;
    return expenses.filter(
      (e) => e.createdBy === currentUser.userId || e.savedByUserId === currentUser.userId,
    );
  }, [expenses, currentUser]);

  const cashSpent = ownerExpenses
    .filter((e) => e.paidWith === "Cash" || e.paidWith === "Debit")
    .reduce((sum, e) => sum + e.amount, 0);

  const cardSpent = ownerExpenses
    .filter((e) => e.paidWith === "Credit Card")
    .reduce((sum, e) => sum + e.amount, 0);

  const myCashSpent = useMemo(() =>
    myExpenses
      .filter((e) => e.paidWith === "Cash" || e.paidWith === "Debit")
      .reduce((sum, e) => sum + e.amount, 0),
    [myExpenses]);

  const budgetCapRm = budgetCapPhp > 0 ? budgetCapPhp / exchangeRates.php : 0;
  const isOverBudget = budgetCapRm > 0 && myCashSpent > budgetCapRm && !dismissedOverBudget;

  const cats: ExpenseCategory[] = ["Transport", "Accommodation", "Food", "Sightseeing", "Other"];
  const categoryTotals = cats.map((cat) => {
    const totalForCat = ownerExpenses
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

  const getSyncDotClass = (value?: SyncStatus | "syncing" | "dirty" | "unsynced") => {
    if (value === "syncing") {
      return "inline-block h-2.5 w-2.5 rounded-full bg-slate-500 align-middle";
    }

    if (value === "synced") {
      return "inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 align-middle";
    }

    return "inline-block h-2.5 w-2.5 rounded-full bg-amber-500 align-middle";
  };

  const getSyncDotLabel = (value?: SyncStatus | "syncing" | "dirty" | "unsynced") => {
    if (value === "syncing") return "Syncing";
    if (value === "synced") return "Synced";
    return "Pending sync";
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

  const visibleTransactions = useMemo(() => {
    let filtered = transactions;
    if (filterCategory !== "All") {
      filtered = filtered.filter((tx) => tx.category === filterCategory);
    }
    if (ownerFilter === "mine" && currentUser) {
      filtered = filtered.filter(
        (tx) => tx.createdBy === currentUser.userId || tx.savedByUserId === currentUser.userId,
      );
    }
    return filtered;
  }, [filterCategory, ownerFilter, transactions, currentUser]);

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
    return [...activeDayOptions]
      .sort((a, b) => b.value - a.value)
      .map((option) => option.label);
  }, [activeDayOptions]);

  const formatTransactionUser = (user?: string | null) => {
    if (!user) return "Unknown";
    return user.includes("@") ? user.split("@")[0] : user;
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser.");
      return;
    }

    setSpeechError(null);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setSpeechError("Microphone access denied. Please allow mic and try again.");
      } else {
        setSpeechError(`Speech error: ${event.error}`);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      parseTranscriptToForm(transcript);
    };

    recognition.start();
  };

  const parseTranscriptToForm = (text: string) => {
    const normalizeVoiceText = (value: string) => {
      let normalized = value
        .toLowerCase()
        .replace(/[.,!?]/g, " ");

      voiceCorrections.forEach(([pattern, replacement]) => {
        normalized = normalized.replace(pattern, replacement);
      });

      return normalized
        .replace(numberWordPattern, (match) => voiceNumberWords[match] ?? match)
        .replace(/\s+/g, " ")
        .trim();
    };

    const lower = normalizeVoiceText(text);
    const allVoiceCurrencyAliases = Object.values(voiceCurrencyAliases) as string[][];
    const currencyPattern = buildVoiceAliasPattern(allVoiceCurrencyAliases.flat());

    const spokenCurrency = Object.entries(voiceCurrencyAliases).find(([, aliases]) =>
      matchesVoiceAlias(lower, aliases as string[]),
    )?.[0];
    if (spokenCurrency) setAmountCurrency(spokenCurrency);

    const priceMatch = lower.match(/\b(\d+(\.\d{1,2})?)\b/);
    if (priceMatch) setAmountText(priceMatch[1]);

    const spokenPayment = (Object.entries(voicePaymentAliases) as Array<[PaymentMethod, string[]]>).find(([, aliases]) =>
      matchesVoiceAlias(lower, aliases),
    )?.[0];
    if (spokenPayment) setPaidWith(spokenPayment);

    const spokenCategory = (Object.entries(voiceCategoryAliases) as Array<[ExpenseCategory, string[]]>).find(([, aliases]) =>
      matchesVoiceAlias(lower, aliases),
    )?.[0];
    if (spokenCategory) setCategory(spokenCategory);

    const dayValuesPattern = activeDayOptions.map((option) => option.value).join("|");
    const dateMatch = dayValuesPattern ? lower.match(new RegExp(`\\bjuly\\s*(${dayValuesPattern})\\b|\\b(${dayValuesPattern})\\b`)) : null;
    if (dateMatch) {
      const d = parseInt(dateMatch[1] || dateMatch[2], 10);
      if (activeDayOptions.some((option) => option.value === d)) handleDaySelection(d);
    } else if (/\btoday\b/.test(lower)) {
      const d = new Date().getDate();
      if (activeDayOptions.some((option) => option.value === d)) handleDaySelection(d);
    }

    const cleanVoiceTitle = (value: string) => {
      const titleStripPatterns = [
        /\b\d+(\.\d{1,2})?\b/g,
        currencyPattern,
        buildVoiceAliasPattern(Object.values(voicePaymentAliases).flat()),
        buildVoiceAliasPattern(voiceCategoryLabelAliases),
        /\bjuly\s*\d{1,2}\b|\b\d{1,2}\b/g,
        /\b(i|spent|paid|bought|for|the|a|an|on|at|with|using|worth|costing|costed)\b/g,
      ];

      let cleaned = value;
      for (const pattern of titleStripPatterns) {
        cleaned = cleaned.replace(pattern, " ");
      }
      return cleaned.replace(/\s+/g, " ").trim();
    };

    const currencyMatch = lower.match(currencyPattern);
    const breakpoints = [
      typeof priceMatch?.index === "number" ? priceMatch.index : -1,
      typeof currencyMatch?.index === "number" ? currencyMatch.index : -1,
    ].filter((index) => index >= 0);
    const firstStructuredIndex = breakpoints.length ? Math.min(...breakpoints) : -1;
    const flowTitle = firstStructuredIndex > 0 ? cleanVoiceTitle(lower.slice(0, firstStructuredIndex)) : "";
    if (flowTitle) {
      setDesc(flowTitle);
      return;
    }

    const STRIP_PATTERNS = [
      /\b\d+(\.\d{1,2})?\b/g,
      currencyPattern,
      buildVoiceAliasPattern(Object.values(voicePaymentAliases).flat()),
      buildVoiceAliasPattern(voiceCategoryLabelAliases),
      /\bjuly\s*\d{1,2}\b|\b\d{1,2}\b/g,
      /\b(i|spent|paid|bought|for|the|a|an|on|at|with|using|worth|costing|costed)\b/g,
    ];

    let title = lower;
    for (const pattern of STRIP_PATTERNS) {
      title = title.replace(pattern, " ");
    }
    title = title.replace(/\s+/g, " ").trim();
    if (title) setDesc(title);
  };

  return (
    <div className="budget-page mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8 animate-in fade-in duration-300">
      <div className="budget-summary-grid mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="budget-summary-card flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div>
            <span className="block text-[13px] font-mono uppercase tracking-widest text-stone-400">Cash Outflow</span>
            <h4 className="mt-1 flex flex-wrap items-baseline gap-1 text-2xl font-serif font-bold text-stone-800">
              <span>{formatPrimaryDisplay(cashSpent)}</span>
              {budgetCapPhp > 0 && (
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400">
                  / {formatPhpCap(budgetCapPhp)}
                </span>
              )}
            </h4>
            {secondaryDisplayCurrencies.length > 0 && (
              <span className="mt-0.5 block text-[13px] text-stone-400">
                {formatSecondaryDisplay(cashSpent)}
              </span>
            )}
            {budgetCapRm > 0 && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cashSpent > budgetCapRm ? "bg-rose-500" : "bg-[#0B3530]"}`}
                  style={{ width: `${Math.min(100, (cashSpent / budgetCapRm) * 100)}%` }}
                />
              </div>
            )}
          </div>
          <div className="budget-summary-icon rounded-full bg-stone-100 p-3 text-stone-600">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="budget-summary-card flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div>
            <span className="block text-[13px] font-mono uppercase tracking-widest text-blue-500">CC Spends</span>
            <h4 className="mt-1 text-2xl font-serif font-bold text-blue-900">{formatPrimaryDisplay(cardSpent)}</h4>
            {secondaryDisplayCurrencies.length > 0 && (
              <span className="mt-0.5 block text-[13px] text-stone-400">
                {formatSecondaryDisplay(cardSpent)}
              </span>
            )}
          </div>
          <div className="budget-summary-icon rounded-full bg-blue-50 p-3 text-blue-600">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {isOverBudget && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
          <AlertTriangle size={16} />
          <span className="flex-1">
            Over budget: <strong>{formatPhp(myCashSpent)}</strong> of <strong>{formatPhpExact(budgetCapPhp)}</strong> cap
          </span>
          <button
            type="button"
            onClick={() => setDismissedOverBudget(true)}
            className="shrink-0 text-rose-400 hover:text-rose-600 text-[11px] font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="budget-main grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
        <div className="space-y-6 xl:sticky xl:top-24">
          <div className="budget-form-panel h-fit rounded-[26px] border border-stone-200 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
            <div className="mb-4 border-b border-stone-100 pb-3">
              <h3 className="budget-form-title mt-2 text-[18px] font-serif font-bold text-[#0B3530]">Add Custom Spend</h3>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-stone-500">
                <span>{exchangeHintLabel}</span>
                <button
                  type="button"
                  aria-label={exchangeRates.source === "live" ? "Live rate" : "Cached rate"}
                  title={exchangeRates.source === "live" ? "Live rate" : "Not live"}
                  className={`h-2.5 w-2.5 rounded-full border-0 p-0 shadow-sm ${
                    exchangeRates.source === "live"
                      ? "bg-emerald-500"
                      : "bg-orange-400"
                  }`}
                />
              </div>
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
                    {currencyOptions.map((currencyCode) => (
                      <option key={currencyCode} value={currencyCode}>
                        {currencyCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="budget-two-col grid grid-cols-2 gap-3">
                <div>
                  <label className="budget-label mb-1 block text-[14px] font-semibold text-stone-600">Date</label>
                  <select
                    value={day}
                    onChange={(e) => handleDaySelection(parseInt(e.target.value, 10))}
                    disabled={!canEdit}
                    className="budget-input w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-[15px] outline-none focus:border-[#0B3530]"
                  >
                    {activeDayOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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

              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    isListening ? "shadow-[0_0_0_3px_rgba(239,68,68,0.2)]" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={!canEdit}
                  className={`relative flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-[14px] font-semibold transition-all duration-200 cursor-pointer
                    ${!canEdit
                      ? "border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed"
                      : isListening
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-stone-200 bg-stone-50 text-stone-500 hover:border-[#0B3530] hover:text-[#0B3530] hover:bg-[#0B3530]/5"
                    }`}
                  title={isListening ? "Tap to stop recording" : "Tap to fill form by voice"}
                >
                  {isListening ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                      </span>
                      <span>Listening... tap to stop</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="22"/>
                      </svg>
                      <span>Fill by voice</span>
                    </>
                  )}
                </button>

                {speechError && (
                  <p className="mt-1.5 flex items-center gap-1 text-[12px] text-rose-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {speechError}
                  </p>
                )}
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
              {!isOnline ? (
                <p className="mt-2 text-[13px] text-amber-700">
                  Offline mode is active. New expenses stay on this device and will upload automatically when the connection returns.
                </p>
              ) : !isSupabaseConnected ? (
                <p className="mt-2 text-[13px] text-amber-700">
                  Sign in to sync this registry to the shared trip record.
                </p>
              ) : null}
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

          {currentUser && (
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 mr-1">Show</span>
              <button
                type="button"
                onClick={() => setOwnerFilter("all")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  ownerFilter === "all"
                    ? "bg-[#0B3530] text-white shadow-sm"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setOwnerFilter("mine")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  ownerFilter === "mine"
                    ? "bg-[#0B3530] text-white shadow-sm"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                Mine
              </button>
            </div>
          )}

          <div className="budget-day-filter">
            <div className="mb-2 flex items-center gap-2 px-1 md:hidden">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">Selected</span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[12px] font-semibold text-[#0B3530]">
                {selectedRegistryDate}
              </span>
            </div>
            <button
              type="button"
              className={`budget-day-chip ${selectedRegistryDate === "All" ? "is-active" : ""}`}
              onClick={() => handleRegistryDateSelection("All")}
            >
              All
            </button>
            {registryDateChips.map((dateLabel) => (
              <button
                key={dateLabel}
                type="button"
                className={`budget-day-chip ${selectedRegistryDate === dateLabel ? "is-active" : ""}`}
                onClick={() => handleRegistryDateSelection(dateLabel)}
              >
                {dateLabel}
              </button>
            ))}
          </div>

          <div className="budget-registry-list">
            {groupedTransactionDates.length === 0 ? (
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
                              <div className="flex items-center gap-2">
                                <div className="budget-transaction-amount">{formatTransactionAmount(tx)}</div>
                                <span
                                  className={getSyncDotClass(tx.syncStatus)}
                                  title={getSyncDotLabel(tx.syncStatus)}
                                  aria-label={getSyncDotLabel(tx.syncStatus)}
                                />
                              </div>
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
                            {canManageExpense(tx) && (
                              <button
                                type="button"
                                onClick={() => deleteTransaction(tx)}
                                className="budget-transaction-delete"
                                title="Delete transaction"
                                aria-label="Delete transaction"
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            )}
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
