import React, { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonInput, IonButton, IonIcon, IonSelect, IonSelectOption,
  IonSegment, IonSegmentButton, IonChip, IonLabel,
} from "@ionic/react";
import { addCircleOutline, cashOutline, cardOutline, micOutline, micCircleOutline, funnelOutline, alertCircleOutline, imageOutline, cameraOutline, closeOutline, createOutline, checkmarkCircleOutline } from "ionicons/icons";
import type { ExchangeRates } from "../lib/exchangeRates";
import type { CurrentUserInfo, Expense, ExpenseCategory, ExpenseCurrency, PaymentMethod, SyncStatus, UserTripSettings } from "../types";

type TransactionRow = {
  id: string; name: string; date: string; dayValue: number; time: string;
  category: string; method: string; user: string | null; createdBy: string | null;
  savedByUserId: string | null; savedByEmail: string | null; amount: number;
  originalAmount?: number; originalCurrency?: ExpenseCurrency; created_at?: string; syncStatus?: SyncStatus;
  receiptUrl?: string; receiptPath?: string;
};

// Photos are compressed on the front end so every upload stays well under 3 MB
// — small enough to survive the browser's localStorage cache while an upload is
// still pending. We prefer createImageBitmap (fast, respects EXIF rotation) and
// fall back to an <img> decode for browsers/formats it can't handle directly
// (e.g. some iPhone HEIC photos), so attaching never just errors out.
const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;          // hard ceiling
const TARGET_RECEIPT_BYTES = 1.2 * 1024 * 1024;     // aim small to stay cache-safe
const estimateDataUrlBytes = (dataUrl: string) => {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.floor((base64.length * 3) / 4);
};

type Drawable = { width: number; height: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; cleanup: () => void };

const loadDrawable = async (file: File): Promise<Drawable> => {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { width: bmp.width, height: bmp.height, draw: (ctx, w, h) => ctx.drawImage(bmp, 0, 0, w, h), cleanup: () => bmp.close() };
    } catch {
      // fall through to the <img> decode path below
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("This image format is not supported on this device. Try a JPEG or PNG."));
      el.src = url;
    });
    return { width: img.naturalWidth || 1, height: img.naturalHeight || 1, draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h), cleanup: () => URL.revokeObjectURL(url) };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
};

const compressReceiptToDataUrl = async (file: File): Promise<string> => {
  const src = await loadDrawable(file);
  try {
    let scale = Math.min(1, 1280 / Math.max(src.width, src.height));
    let quality = 0.7;
    let bestUnderCeiling = "";
    for (let attempt = 0; attempt < 8; attempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(src.width * scale));
      canvas.height = Math.max(1, Math.round(src.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Image compression is not supported in this browser.");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      src.draw(ctx, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const bytes = estimateDataUrlBytes(dataUrl);
      if (bytes <= TARGET_RECEIPT_BYTES) return dataUrl;
      if (bytes <= MAX_RECEIPT_BYTES) bestUnderCeiling = dataUrl;
      if (quality > 0.45) quality -= 0.12;
      else scale *= 0.8;
    }
    if (bestUnderCeiling) return bestUnderCeiling;
    throw new Error("This photo is too large even after compression. Try a smaller image.");
  } finally {
    src.cleanup();
  }
};

interface SpeechRecognition {
  lang: string; interimResults: boolean; maxAlternatives: number;
  onstart: (() => void) | null; onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void; stop: () => void;
}
interface SpeechRecognitionEvent { results: ArrayLike<ArrayLike<{ transcript: string }>>; }
interface SpeechRecognitionErrorEvent { error: string; }

const voiceNumberWords: Record<string, string> = {
  zero: "0", oh: "0", one: "1", won: "1", two: "2", to: "2", too: "2",
  three: "3", four: "4", for: "4", five: "5", six: "6", seven: "7",
  eight: "8", ate: "8", nine: "9", ten: "10", eleven: "11", twelve: "12",
  thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16",
  seventeen: "17", eighteen: "18", nineteen: "19", twenty: "20",
  thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70",
  eighty: "80", ninety: "90", hundred: "100",
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
const voiceCorrections: Array<[RegExp, string]> = [[/\begg dose\b/g, "egg toast"], [/\bdose\b/g, "toast"]];
const numberWordPattern = new RegExp(`\\b(${Object.keys(voiceNumberWords).join("|")})\\b`, "g");
const matchesVoiceAlias = (text: string, aliases: string[]) => aliases.some((alias) => new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b`).test(text));
const buildVoiceAliasPattern = (aliases: string[]) => new RegExp(`\\b(${aliases.map((alias) => alias.replace(/\s+/g, "\\s+")).join("|")})\\b`, "g");

interface BudgetTabProps {
  expenses: Expense[]; setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  isSupabaseConnected?: boolean; isOnline?: boolean; canEdit?: boolean;
  currentUser?: CurrentUserInfo | null; exchangeRates: ExchangeRates;
  budgetCapPhp: number; userSettings?: UserTripSettings | null;
  getReceiptSignedUrl?: (path: string) => Promise<string | null>;
}

export default function BudgetTab({ expenses, setExpenses, isSupabaseConnected = false, isOnline = true, canEdit = false, currentUser = null, exchangeRates, budgetCapPhp, userSettings = null, getReceiptSignedUrl }: BudgetTabProps) {
  const [desc, setDesc] = useState("");
  const [amountText, setAmountText] = useState("");
  const fallbackDayOptions = [{ value: 12, label: "July 12" }, { value: 13, label: "July 13" }, { value: 14, label: "July 14" }, { value: 15, label: "July 15" }];
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
  // When set, the form is editing this expense in place instead of adding a new one
  const [editingId, setEditingId] = useState<string | null>(null);
  // Photo attached to the in-progress add/edit form
  const [draftReceiptUrl, setDraftReceiptUrl] = useState<string>("");
  // True once the user picks a new photo during this add/edit (vs keeping the existing one)
  const [draftReceiptChanged, setDraftReceiptChanged] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receiptBusy, setReceiptBusy] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);
  // Hidden input reused to attach/replace a receipt on an existing expense
  const cardReceiptInputRef = React.useRef<HTMLInputElement | null>(null);
  const receiptTargetIdRef = React.useRef<string | null>(null);

  const activeDayOptions = useMemo(() => {
    const d = (userSettings?.travelDates ?? []).map((ds) => { const dt = new Date(`${ds}T00:00:00`); return { value: dt.getDate(), label: dt.toLocaleDateString("en-US", { month: "long", day: "numeric" }) }; });
    return d.length > 0 ? d : fallbackDayOptions;
  }, [userSettings?.travelDates]);
  const dayLabelByValue = useMemo(() => new Map(activeDayOptions.map((o) => [o.value, o.label] as const)), [activeDayOptions]);
  const syncRegistryDateForDay = (dv: number) => { const ml = dayLabelByValue.get(dv); if (ml) setSelectedRegistryDate(ml); };
  const handleDaySelection = (dv: number) => { setDay(dv); syncRegistryDateForDay(dv); };
  const handleRegistryDateSelection = (dl: string) => { setSelectedRegistryDate(dl); if (dl === "All") return; const md = activeDayOptions.find((o) => o.label === dl); if (md) setDay(md.value); };
  const voiceCurrencyAliases = useMemo(() => { const a: Record<string, string[]> = {}; currencyOptions.forEach((c) => { a[c] = defaultVoiceCurrencyAliases[c] ?? [c.toLowerCase()]; }); return a; }, [currencyOptions]);
  const selectedDisplayCurrencies = useMemo(() => Array.from(new Set(userSettings?.currencies?.length ? userSettings.currencies : ["PHP", "MYR", "SGD"])), [userSettings]);
  const primaryDisplayCurrency = userSettings?.baseCurrency ?? selectedDisplayCurrencies[0] ?? "PHP";
  const secondaryDisplayCurrencies = selectedDisplayCurrencies.filter((c) => c !== primaryDisplayCurrency);

  useEffect(() => { if (!currencyOptions.includes(amountCurrency)) setAmountCurrency(currencyOptions[0] ?? "MYR"); }, [amountCurrency, currencyOptions]);
  useEffect(() => { if (!activeDayOptions.some((o) => o.value === day)) { const fd = activeDayOptions[0]?.value ?? 12; setDay(fd); syncRegistryDateForDay(fd); } }, [activeDayOptions, day, dayLabelByValue]);

  const convertToRm = (v: number, c: ExpenseCurrency) => { if (c === "RM" || c === "MYR") return v; const r = exchangeRates.rates[c]; return r ? v / r : v; };
  const formatPhp = (v: number) => `PHP ${(v * exchangeRates.php).toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  const formatPhpExact = (v: number) => `PHP ${v.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  const formatPhpCap = (v: number) => `PHP ${v.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  const formatCurrencyFromRm = (v: number, code: string) => {
    if (code === "RM" || code === "MYR") return `MYR ${v.toFixed(2)}`;
    const r = exchangeRates.rates[code]; return r ? `${code} ${(v * r).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : `${code} N/A`;
  };
  const formatPrimaryDisplay = (v: number) => formatCurrencyFromRm(v, primaryDisplayCurrency);
  const formatSecondaryDisplay = (v: number) => secondaryDisplayCurrencies.length ? secondaryDisplayCurrencies.map((c) => formatCurrencyFromRm(v, c)).join(" | ") : "";
  const exchangeHintLabel = secondaryDisplayCurrencies.length > 0
    ? `100 ${primaryDisplayCurrency} = ${secondaryDisplayCurrencies.map((c) => {
      if (c === "RM" || c === "MYR") return formatCurrencyFromRm(100 / (exchangeRates.rates[primaryDisplayCurrency] ?? 1), c);
      const pr = primaryDisplayCurrency === "RM" || primaryDisplayCurrency === "MYR" ? 1 : exchangeRates.rates[primaryDisplayCurrency];
      return pr ? `${c} ${(100 / pr * (exchangeRates.rates[c] ?? 0)).toFixed(2)}` : `${c} N/A`;
    }).join(" | ")}`
    : `100 ${primaryDisplayCurrency}`;
  const formatDisplayTime = (v?: string | null) => { if (!v) return "Unknown time"; const p = new Date(v); return Number.isNaN(p.getTime()) ? "Unknown time" : p.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase(); };
  const formatTransactionAmount = (tx: TransactionRow) => tx.originalAmount != null && tx.originalCurrency ? `-${tx.originalCurrency} ${Math.abs(tx.originalAmount).toFixed(2)}` : `-RM ${Math.abs(tx.amount).toFixed(2)}`;
  const mapExpenseToTransaction = (e: Expense): TransactionRow => ({ id: e.id, name: e.item, date: dayLabelByValue.get(e.day) ?? `July ${String(e.day)}`, dayValue: e.day, time: formatDisplayTime(e.createdAt), category: e.category, method: e.paidWith, user: e.savedByEmail ?? e.savedByUserId ?? null, createdBy: e.createdBy ?? e.savedByUserId ?? null, savedByUserId: e.savedByUserId ?? null, savedByEmail: e.savedByEmail ?? null, amount: e.amount, originalAmount: e.originalAmount, originalCurrency: e.originalCurrency, created_at: e.createdAt, syncStatus: e.syncStatus, receiptUrl: e.receiptUrl, receiptPath: e.receiptPath });
  const sortTransactions = (items: TransactionRow[]) => [...items].sort((a, b) => { const at = a.created_at ? new Date(a.created_at).getTime() : 0; const bt = b.created_at ? new Date(b.created_at).getTime() : 0; if (at !== bt) return bt - at; if (a.dayValue !== b.dayValue) return b.dayValue - a.dayValue; return b.id.localeCompare(a.id); });
  const transactions = sortTransactions(expenses.map(mapExpenseToTransaction));
  const canManageExpense = (e: Expense | TransactionRow) => { const o = e.createdBy ?? e.savedByUserId ?? null; return Boolean(currentUser?.isAdmin || (currentUser && o === currentUser.userId)); };

  const resetForm = () => {
    setEditingId(null); setDesc(""); setAmountText("");
    setDraftReceiptUrl(""); setDraftReceiptChanged(false); setReceiptError(null);
  };

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const pa = parseFloat(amountText);
    if (!desc.trim() || !amountText || isNaN(pa) || pa <= 0) return;

    if (editingId) {
      // Update the existing expense in place (never creates a new row).
      setExpenses((prev) => prev.map((x) => {
        if (x.id !== editingId) return x;
        return {
          ...x,
          day, category, item: desc,
          amount: convertToRm(pa, amountCurrency),
          paidWith, originalAmount: pa, originalCurrency: amountCurrency,
          // Only touch the photo if the user picked a new one this edit.
          receiptUrl: draftReceiptChanged ? (draftReceiptUrl || undefined) : x.receiptUrl,
          receiptPath: draftReceiptChanged && !draftReceiptUrl ? undefined : x.receiptPath,
          syncStatus: "pending",
        };
      }));
    } else {
      setExpenses((prev) => [...prev, { id: "exp-" + Date.now(), day, category, item: desc, amount: convertToRm(pa, amountCurrency), paidWith, originalAmount: pa, originalCurrency: amountCurrency, receiptUrl: draftReceiptUrl || undefined, createdBy: currentUser?.userId, savedByUserId: currentUser?.userId, savedByEmail: currentUser?.email, createdAt: new Date().toISOString(), syncStatus: "pending" }]);
    }
    resetForm();
  };

  // Load an existing expense into the form for editing in place.
  const startEdit = (tx: TransactionRow) => {
    if (!canManageExpense(tx) || !canEdit) return;
    const x = expenses.find((e) => e.id === tx.id);
    if (!x) return;
    setEditingId(x.id);
    setDesc(x.item);
    setAmountText(String(x.originalAmount ?? x.amount));
    setAmountCurrency(x.originalCurrency && currencyOptions.includes(x.originalCurrency) ? x.originalCurrency : (currencyOptions[0] ?? "MYR"));
    setDay(x.day);
    setCategory(x.category);
    setPaidWith(x.paidWith);
    setDraftReceiptChanged(false);
    setReceiptError(null);
    setDraftReceiptUrl(x.receiptUrl ?? "");
    // If only a stored path exists, fetch a signed URL just for the preview.
    if (!x.receiptUrl && x.receiptPath && getReceiptSignedUrl) {
      getReceiptSignedUrl(x.receiptPath).then((url) => { if (url) setDraftReceiptUrl((cur) => cur || url); });
    }
    document.querySelector(".ja-budget-form-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const deleteTransaction = (tx: TransactionRow) => { if (!canManageExpense(tx)) return; if (editingId === tx.id) resetForm(); setExpenses((prev) => prev.filter((e) => e.id !== tx.id)); };

  // Compress + attach a photo to the in-progress add/edit form
  const handleDraftReceiptChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setReceiptError(null); setReceiptBusy(true);
    try { setDraftReceiptUrl(await compressReceiptToDataUrl(file)); setDraftReceiptChanged(true); }
    catch (err) { setReceiptError(err instanceof Error ? err.message : "Could not process the photo."); }
    finally { setReceiptBusy(false); }
  };

  // Attach/replace a photo on an already-saved expense ("snap now, fix later")
  const triggerCardReceipt = (expenseId: string) => { receiptTargetIdRef.current = expenseId; cardReceiptInputRef.current?.click(); };
  const handleCardReceiptChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const targetId = receiptTargetIdRef.current;
    event.target.value = ""; receiptTargetIdRef.current = null;
    if (!file || !targetId) return;
    setReceiptError(null); setReceiptBusy(true);
    try {
      const dataUrl = await compressReceiptToDataUrl(file);
      setExpenses((prev) => prev.map((e) => e.id === targetId ? { ...e, receiptUrl: dataUrl, syncStatus: "pending" } : e));
    } catch (err) { setReceiptError(err instanceof Error ? err.message : "Could not process the photo."); }
    finally { setReceiptBusy(false); }
  };

  const openReceipt = async (tx: TransactionRow) => {
    if (tx.receiptUrl) { setViewingReceipt(tx.receiptUrl); return; }
    if (tx.receiptPath && getReceiptSignedUrl) {
      setLoadingReceiptId(tx.id);
      try {
        const url = await getReceiptSignedUrl(tx.receiptPath);
        if (url) setViewingReceipt(url); else setReceiptError("Could not load that photo. Check your connection.");
      } finally { setLoadingReceiptId(null); }
    }
  };

  const ownerExpenses = useMemo(() => { if (ownerFilter === "mine" && currentUser) return expenses.filter((e) => e.createdBy === currentUser.userId || e.savedByUserId === currentUser.userId); return expenses; }, [expenses, ownerFilter, currentUser]);
  const myExpenses = useMemo(() => { if (!currentUser) return expenses; return expenses.filter((e) => e.createdBy === currentUser.userId || e.savedByUserId === currentUser.userId); }, [expenses, currentUser]);
  const cashSpent = ownerExpenses.filter((e) => e.paidWith === "Cash" || e.paidWith === "Debit").reduce((s, e) => s + e.amount, 0);
  const cardSpent = ownerExpenses.filter((e) => e.paidWith === "Credit Card").reduce((s, e) => s + e.amount, 0);
  const myCashSpent = useMemo(() => myExpenses.filter((e) => e.paidWith === "Cash" || e.paidWith === "Debit").reduce((s, e) => s + e.amount, 0), [myExpenses]);
  const budgetCapRm = budgetCapPhp > 0 ? budgetCapPhp / exchangeRates.php : 0;
  const isOverBudget = budgetCapRm > 0 && myCashSpent > budgetCapRm && !dismissedOverBudget;
  const cats: ExpenseCategory[] = ["Transport", "Accommodation", "Food", "Sightseeing", "Other"];
  const categoryTotals = cats.map((cat) => ({ name: cat, amount: ownerExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0) }));
  const maxCatTotal = Math.max(...categoryTotals.map((c) => c.amount), 1);
  const getCategoryColor = (cat: ExpenseCategory) => { switch (cat) { case "Food": return "#E05A47"; case "Transport": return "#478BE0"; case "Accommodation": return "#E09C47"; case "Sightseeing": return "#18534C"; default: return "#7F8C8D"; } };
  const getCategoryPillClass = (v: string) => { switch (v.toLowerCase()) { case "food": return "budget-pill budget-pill-food"; case "transport": return "budget-pill budget-pill-transport"; case "accommodation": return "budget-pill budget-pill-accommodation"; case "sightseeing": return "budget-pill budget-pill-sightseeing"; default: return "budget-pill budget-pill-other"; } };
  const getMethodPillClass = (v: string) => v === "Cash" || v === "Debit" ? "budget-pill budget-pill-cash" : "budget-pill budget-pill-card";
  const getSyncDotColor = (v?: SyncStatus | "syncing" | "dirty" | "unsynced") => { if (v === "syncing") return "#64748b"; if (v === "synced") return "#10b981"; return "#f59e0b"; };
  const getSyncDotLabel = (v?: SyncStatus | "syncing" | "dirty" | "unsynced") => { if (v === "syncing") return "Syncing"; if (v === "synced") return "Synced"; return "Pending sync"; };
  const getCategoryIcon = (v: string) => { switch (v.toLowerCase()) { case "food": return <span className="ja-budget-cat-icon" aria-hidden="true">🍽</span>; case "transport": return <span className="ja-budget-cat-icon" aria-hidden="true">🚌</span>; case "accommodation": return <span className="ja-budget-cat-icon" aria-hidden="true">🛏</span>; case "sightseeing": return <span className="ja-budget-cat-icon" aria-hidden="true">📷</span>; default: return <span className="ja-budget-cat-icon" aria-hidden="true">💳</span>; } };

  const visibleTransactions = useMemo(() => {
    let f = transactions;
    if (filterCategory !== "All") f = f.filter((tx) => tx.category === filterCategory);
    if (ownerFilter === "mine" && currentUser) f = f.filter((tx) => tx.createdBy === currentUser.userId || tx.savedByUserId === currentUser.userId);
    return f;
  }, [filterCategory, ownerFilter, transactions, currentUser]);

  const filteredGroupedTransactions = useMemo(() => {
    const sorted = sortTransactions(visibleTransactions);
    const groups: Record<string, TransactionRow[]> = {};
    const od: string[] = [];
    sorted.forEach((item) => { const k = item.date || "Unknown Date"; if (!groups[k]) { groups[k] = []; od.push(k); } groups[k].push(item); });
    return { groups, orderedDates: od };
  }, [visibleTransactions]);

  const groupedTransactionDates = filteredGroupedTransactions.orderedDates;
  const registryDateChips = useMemo(() => [...activeDayOptions].sort((a, b) => a.value - b.value).map((o) => o.label), [activeDayOptions]);
  const formatTransactionUser = (u?: string | null) => { if (!u) return "Unknown"; return u.includes("@") ? u.split("@")[0] : u; };

  const handleVoiceInput = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeechError("Speech recognition is not supported in this browser."); return; }
    setSpeechError(null);
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => { setIsListening(false); if (event.error === "not-allowed") setSpeechError("Microphone access denied. Please allow mic and try again."); else setSpeechError(`Speech error: ${event.error}`); };
    recognition.onresult = (event: SpeechRecognitionEvent) => { parseTranscriptToForm(event.results[0][0].transcript.toLowerCase().trim()); };
    recognition.start();
  };

  const parseTranscriptToForm = (text: string) => {
    const normalizeVoiceText = (value: string) => { let n = value.toLowerCase().replace(/[.,!?]/g, " "); voiceCorrections.forEach(([pat, rep]) => { n = n.replace(pat, rep); }); return n.replace(numberWordPattern, (m) => voiceNumberWords[m] ?? m).replace(/\s+/g, " ").trim(); };
    const lower = normalizeVoiceText(text);
    const allVoiceCurrencyAliases = Object.values(voiceCurrencyAliases) as string[][];
    const currencyPattern = buildVoiceAliasPattern(allVoiceCurrencyAliases.flat());
    const spokenCurrency = Object.entries(voiceCurrencyAliases).find(([, al]) => matchesVoiceAlias(lower, al as string[]))?.[0];
    if (spokenCurrency) setAmountCurrency(spokenCurrency);
    const priceMatch = lower.match(/\b(\d+(\.\d{1,2})?)\b/);
    if (priceMatch) setAmountText(priceMatch[1]);
    const spokenPayment = (Object.entries(voicePaymentAliases) as Array<[PaymentMethod, string[]]>).find(([, al]) => matchesVoiceAlias(lower, al))?.[0];
    if (spokenPayment) setPaidWith(spokenPayment);
    const spokenCategory = (Object.entries(voiceCategoryAliases) as Array<[ExpenseCategory, string[]]>).find(([, al]) => matchesVoiceAlias(lower, al))?.[0];
    if (spokenCategory) setCategory(spokenCategory);
    const dvPattern = activeDayOptions.map((o) => o.value).join("|");
    const dateMatch = dvPattern ? lower.match(new RegExp(`\\bjuly\\s*(${dvPattern})\\b|\\b(${dvPattern})\\b`)) : null;
    if (dateMatch) { const d = parseInt(dateMatch[1] || dateMatch[2], 10); if (activeDayOptions.some((o) => o.value === d)) handleDaySelection(d); }
    else if (/\btoday\b/.test(lower)) { const d = new Date().getDate(); if (activeDayOptions.some((o) => o.value === d)) handleDaySelection(d); }
    const STRIP_PATTERNS = [/\b\d+(\.\d{1,2})?\b/g, currencyPattern, buildVoiceAliasPattern(Object.values(voicePaymentAliases).flat()), buildVoiceAliasPattern(voiceCategoryLabelAliases), /\bjuly\s*\d{1,2}\b|\b\d{1,2}\b/g, /\b(i|spent|paid|bought|for|the|a|an|on|at|with|using|worth|costing|costed)\b/g];
    let title = lower; STRIP_PATTERNS.forEach((p) => { title = title.replace(p, " "); }); title = title.replace(/\s+/g, " ").trim(); if (title) setDesc(title);
  };

  return (
    <div className="budget-page ja-budget-page">
      {/* Summary cards */}
      <div className="budget-summary-grid ja-budget-summary-row">
        <IonCard className="ja-budget-summary-card">
          <IonCardContent>
            <div className="ja-budget-summary-row-inner">
              <div>
                <span className="ja-budget-summary-label">Cash Outflow</span>
                <h4 className="ja-budget-summary-value">
                  <span>{formatPrimaryDisplay(cashSpent)}</span>
                  {budgetCapPhp > 0 && <span className="ja-budget-summary-cap">/ {formatPhpCap(budgetCapPhp)}</span>}
                </h4>
                {secondaryDisplayCurrencies.length > 0 && <span className="ja-budget-summary-alt">{formatSecondaryDisplay(cashSpent)}</span>}
                {budgetCapRm > 0 && (
                  <div className="ja-budget-progress-wrap">
                    <div className={`ja-budget-progress-fill${cashSpent > budgetCapRm ? " ja-budget-progress-over" : ""}`} style={{ width: `${Math.min(100, (cashSpent / budgetCapRm) * 100)}%` }} />
                  </div>
                )}
              </div>
              <div className="budget-summary-icon ja-budget-summary-icon">
                <IonIcon icon={cashOutline} style={{ fontSize: 24 }} />
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        <IonCard className="ja-budget-summary-card">
          <IonCardContent>
            <div className="ja-budget-summary-row-inner">
              <div>
                <span className="ja-budget-summary-label ja-budget-summary-label-blue">CC Spends</span>
                <h4 className="ja-budget-summary-value ja-budget-summary-value-blue">{formatPrimaryDisplay(cardSpent)}</h4>
                {secondaryDisplayCurrencies.length > 0 && <span className="ja-budget-summary-alt">{formatSecondaryDisplay(cardSpent)}</span>}
              </div>
              <div className="budget-summary-icon ja-budget-summary-icon ja-budget-summary-icon-blue">
                <IonIcon icon={cardOutline} style={{ fontSize: 24 }} />
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      </div>

      {/* Over budget alert */}
      {isOverBudget && (
        <div className="ja-budget-alert-card">
          <IonIcon icon={alertCircleOutline} />
          <span className="ja-budget-alert-text">Over budget: <strong>{formatPhp(myCashSpent)}</strong> of <strong>{formatPhpExact(budgetCapPhp)}</strong> cap</span>
          <IonButton fill="clear" size="small" onClick={() => setDismissedOverBudget(true)} className="ja-budget-dismiss-btn">Dismiss</IonButton>
        </div>
      )}

      <div className="budget-main ja-budget-main">
        <div className="ja-budget-sidebar">
          {/* Expense form */}
          <IonCard className="ja-budget-form-card">
            <IonCardHeader className="ja-budget-card-header">
              <div className="ja-budget-form-header">
                <IonCardTitle className="ja-budget-card-title">{editingId ? "Edit Spend" : "Add Custom Spend"}</IonCardTitle>
                <div className="ja-budget-exchange-hint">
                  <span>{exchangeHintLabel}</span>
                  <span className={`ja-budget-exchange-dot${exchangeRates.source === "live" ? " ja-budget-exchange-dot-live" : " ja-budget-exchange-dot-stale"}`} title={exchangeRates.source === "live" ? "Live rate" : "Not live"} />
                </div>
              </div>
            </IonCardHeader>
            <IonCardContent className="ja-budget-card-body">
              {!canEdit && <div className="ja-budget-readonly-card">Sign in to add or edit budget items.</div>}
              <form onSubmit={submitExpense} className="ja-budget-form">
                <div className="ja-budget-field">
                  <label className="ja-budget-field-label">Item Title</label>
                  <IonInput value={desc} onIonInput={(e) => setDesc(e.detail.value ?? "")} placeholder="e.g. Kaya Toast, Metro Pass" disabled={!canEdit} className="ja-budget-input" enterkeyhint="next" required />
                </div>
                <div className="ja-budget-form-row-3">
                  <div className="ja-budget-field-span-2">
                    <label className="ja-budget-field-label">Price</label>
                    <IonInput type="number" inputMode="decimal" step="0.01" value={amountText} onIonInput={(e) => setAmountText(e.detail.value ?? "")} placeholder="0.00" disabled={!canEdit} className="ja-budget-input" enterkeyhint="done" required />
                  </div>
                  <div className="ja-budget-field">
                    <label className="ja-budget-field-label">Currency</label>
                    <IonSelect value={amountCurrency} onIonChange={(e) => setAmountCurrency(e.detail.value)} disabled={!canEdit} interface="action-sheet" className="ja-budget-select">
                      {currencyOptions.map((c) => <IonSelectOption key={c} value={c}>{c}</IonSelectOption>)}
                    </IonSelect>
                  </div>
                </div>
                <div className="ja-budget-form-row-2">
                  <div className="ja-budget-field">
                    <label className="ja-budget-field-label">Date</label>
                    <IonSelect value={day} onIonChange={(e) => handleDaySelection(Number(e.detail.value))} disabled={!canEdit} interface="action-sheet" className="ja-budget-select">
                      {activeDayOptions.map((o) => <IonSelectOption key={o.value} value={o.value}>{o.label}</IonSelectOption>)}
                    </IonSelect>
                  </div>
                  <div className="ja-budget-field">
                    <label className="ja-budget-field-label">Payment Type</label>
                    <IonSelect value={paidWith} onIonChange={(e) => setPaidWith(e.detail.value)} disabled={!canEdit} interface="action-sheet" className="ja-budget-select">
                      <IonSelectOption value="Cash">Cash</IonSelectOption>
                      <IonSelectOption value="Debit">Debit</IonSelectOption>
                      <IonSelectOption value="Credit Card">Credit Card</IonSelectOption>
                    </IonSelect>
                  </div>
                </div>
                <div className="ja-budget-field">
                  <label className="ja-budget-field-label">Category</label>
                  <IonSelect value={category} onIonChange={(e) => setCategory(e.detail.value)} disabled={!canEdit} interface="action-sheet" className="ja-budget-select">
                    <IonSelectOption value="Food">Food</IonSelectOption>
                    <IonSelectOption value="Transport">Transport</IonSelectOption>
                    <IonSelectOption value="Accommodation">Accommodation</IonSelectOption>
                    <IonSelectOption value="Sightseeing">Sightseeing</IonSelectOption>
                    <IonSelectOption value="Other">Other</IonSelectOption>
                  </IonSelect>
                </div>
                <div className="ja-budget-voice-wrap">
                  <IonButton type="button" expand="block" fill="outline" onClick={handleVoiceInput} disabled={!canEdit}
                    className={`ja-budget-voice-btn${isListening ? " ja-budget-voice-btn-listening" : ""}`}>
                    <IonIcon slot="start" icon={isListening ? micCircleOutline : micOutline} />
                    {isListening ? "Listening... tap to stop" : "Fill by voice"}
                  </IonButton>
                  {isListening && <span className="ja-budget-voice-pulse" />}
                  {speechError && <p className="ja-budget-voice-error"><IonIcon icon={alertCircleOutline} />{speechError}</p>}
                </div>
                <div className="ja-budget-receipt-wrap">
                  <label className="ja-budget-receipt-attach">
                    <input type="file" accept="image/*" onChange={handleDraftReceiptChange} disabled={!canEdit || receiptBusy} className="ja-diary-sr-only" />
                    <IonIcon icon={draftReceiptUrl ? imageOutline : cameraOutline} />
                    <span>{receiptBusy ? "Processing photo..." : draftReceiptUrl ? "Photo attached - tap to replace" : "Snap or attach photo (optional)"}</span>
                  </label>
                  {draftReceiptUrl && (
                    <div className="ja-budget-receipt-preview">
                      <img src={draftReceiptUrl} alt="Attached photo preview" onClick={() => setViewingReceipt(draftReceiptUrl)} />
                      <button type="button" className="ja-budget-receipt-remove" onClick={() => { setDraftReceiptUrl(""); setDraftReceiptChanged(true); }} aria-label="Remove photo"><IonIcon icon={closeOutline} /></button>
                    </div>
                  )}
                  {receiptError && <p className="ja-budget-voice-error"><IonIcon icon={alertCircleOutline} />{receiptError}</p>}
                </div>
                <IonButton type="submit" expand="block" disabled={!canEdit} className="ja-budget-submit-btn">
                  <IonIcon slot="start" icon={editingId ? checkmarkCircleOutline : addCircleOutline} />{editingId ? "Update Expense" : "Add Expense Detail"}
                </IonButton>
                {editingId && (
                  <IonButton type="button" expand="block" fill="clear" onClick={resetForm} className="ja-budget-cancel-btn">
                    Cancel edit
                  </IonButton>
                )}
              </form>
            </IonCardContent>
          </IonCard>

          {/* Category breakdown */}
          <IonCard className="ja-budget-category-card">
            <IonCardHeader className="ja-budget-card-header">
              <IonCardTitle className="ja-budget-card-title">Spends by Category</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="ja-budget-card-body">
              <div className="ja-budget-category-list">
                {categoryTotals.map((cat) => {
                  const pct = (cat.amount / maxCatTotal) * 100;
                  return (
                    <div key={cat.name} className="ja-budget-category-row">
                      <div className="ja-budget-category-header">
                        <span className="ja-budget-category-name">{cat.name}</span>
                        <span className="ja-budget-category-amount">{formatPhp(cat.amount)}</span>
                      </div>
                      <div className="ja-budget-category-bar">
                        <div className="ja-budget-category-fill" style={{ width: `${pct}%`, backgroundColor: getCategoryColor(cat.name as ExpenseCategory) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Transaction Registry */}
        <IonCard className="ja-budget-registry-card">
          <IonCardHeader className="ja-budget-card-header">
            <div className="ja-budget-registry-header">
              <div>
                <IonCardTitle className="ja-budget-card-title">Transaction Registry</IonCardTitle>
                <p className="ja-budget-registry-desc">Chronological list of all recorded travel cash outflows</p>
                {!isOnline ? <p className="ja-budget-registry-warning">Offline mode is active. New expenses stay on this device and will upload automatically when the connection returns.</p>
                : !isSupabaseConnected ? <p className="ja-budget-registry-warning">Sign in to sync this registry to the shared trip record.</p> : null}
              </div>
              <div className="ja-budget-registry-filter">
                <IonIcon icon={funnelOutline} className="ja-budget-registry-filter-icon" />
                <IonSelect value={filterCategory} onIonChange={(e) => setFilterCategory(e.detail.value)} interface="popover" className="ja-budget-registry-select">
                  <IonSelectOption value="All">All Categories</IonSelectOption>
                  <IonSelectOption value="Transport">Transport Only</IonSelectOption>
                  <IonSelectOption value="Accommodation">Accommodation Only</IonSelectOption>
                  <IonSelectOption value="Food">Food Only</IonSelectOption>
                  <IonSelectOption value="Sightseeing">Sightseeing Only</IonSelectOption>
                </IonSelect>
              </div>
            </div>
          </IonCardHeader>
          <IonCardContent className="ja-budget-card-body">
            {currentUser && (
              <div className="ja-budget-owner-row">
                <span className="ja-budget-owner-label">Show</span>
                <IonSegment value={ownerFilter} onIonChange={(e) => setOwnerFilter(e.detail.value as "all" | "mine")} className="ja-budget-segment">
                  <IonSegmentButton value="all" className="ja-budget-segment-btn"><IonLabel>All</IonLabel></IonSegmentButton>
                  <IonSegmentButton value="mine" className="ja-budget-segment-btn"><IonLabel>Mine</IonLabel></IonSegmentButton>
                </IonSegment>
              </div>
            )}
            <div className="ja-budget-date-row">
              <IonChip className={`ja-budget-date-chip${selectedRegistryDate === "All" ? " ja-budget-date-chip-active" : ""}`} onClick={() => handleRegistryDateSelection("All")}>All</IonChip>
              {registryDateChips.map((dl) => (
                <IonChip key={dl} className={`ja-budget-date-chip${selectedRegistryDate === dl ? " ja-budget-date-chip-active" : ""}`} onClick={() => handleRegistryDateSelection(dl)}>{dl}</IonChip>
              ))}
            </div>
            <div className="ja-budget-transaction-list">
              {groupedTransactionDates.length === 0 ? (
                <p className="ja-budget-empty-text">No transactions found.</p>
              ) : (
                groupedTransactionDates.filter((dk) => selectedRegistryDate === "All" || dk === selectedRegistryDate).map((dateKey) => (
                  <div key={dateKey} className="ja-budget-date-group">
                    <div className="ja-budget-date-group-label">{dateKey}</div>
                    <div className="ja-budget-transaction-group">
                      {filteredGroupedTransactions.groups[dateKey].map((tx) => (
                        <article key={tx.id} className="budget-transaction-card">
                          <div className="budget-transaction-icon">{getCategoryIcon(tx.category)}</div>
                          <div className="budget-transaction-body">
                            <div className="budget-transaction-top">
                              <h4 className="budget-transaction-name">{tx.name}</h4>
                              <div className="ja-budget-tx-amount-row">
                                <div className="budget-transaction-amount">{formatTransactionAmount(tx)}</div>
                                <span className="ja-budget-sync-dot" style={{ backgroundColor: getSyncDotColor(tx.syncStatus) }} title={getSyncDotLabel(tx.syncStatus)} aria-label={getSyncDotLabel(tx.syncStatus)} />
                              </div>
                            </div>
                            <div className="budget-transaction-badges">
                              <span className={getCategoryPillClass(tx.category)}>{tx.category}</span>
                              <span className={getMethodPillClass(tx.method)}>{tx.method}</span>
                              {(tx.receiptUrl || tx.receiptPath) && <span className="budget-pill budget-pill-receipt"><IonIcon icon={imageOutline} aria-hidden="true" />Photo</span>}
                            </div>
                            <div className="budget-transaction-bottom">
                              <div className="budget-transaction-datetime">
                                <span className="budget-transaction-date">{tx.date}</span>
                                <span className="budget-transaction-dot" aria-hidden="true">·</span>
                                <span className="budget-transaction-time">{tx.time}</span>
                                <span className="budget-transaction-dot" aria-hidden="true">·</span>
                                <span className="budget-transaction-user-line">{formatTransactionUser(tx.user)}</span>
                              </div>
                              <div className="budget-transaction-actions">
                                {(tx.receiptUrl || tx.receiptPath) && (
                                  <button type="button" onClick={() => openReceipt(tx)} className="budget-transaction-receipt" title="View photo" aria-label="View photo" disabled={loadingReceiptId === tx.id}>
                                    <IonIcon icon={imageOutline} />
                                  </button>
                                )}
                                {canManageExpense(tx) && canEdit && (
                                  <button type="button" onClick={() => startEdit(tx)} className={`budget-transaction-receipt${editingId === tx.id ? " budget-transaction-receipt-active" : ""}`} title="Edit expense" aria-label="Edit expense">
                                    <IonIcon icon={createOutline} />
                                  </button>
                                )}
                                {canManageExpense(tx) && canEdit && (
                                  <button type="button" onClick={() => triggerCardReceipt(tx.id)} className="budget-transaction-receipt" title={tx.receiptUrl || tx.receiptPath ? "Replace photo" : "Add photo"} aria-label={tx.receiptUrl || tx.receiptPath ? "Replace photo" : "Add photo"}>
                                    <IonIcon icon={cameraOutline} />
                                  </button>
                                )}
                                {canManageExpense(tx) && <button type="button" onClick={() => deleteTransaction(tx)} className="budget-transaction-delete" title="Delete transaction" aria-label="Delete transaction"><Trash2 size={16} aria-hidden="true" /></button>}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </IonCardContent>
        </IonCard>
      </div>

      {/* Shared hidden input for attaching/replacing a receipt on an existing row */}
      <input ref={cardReceiptInputRef} type="file" accept="image/*" onChange={handleCardReceiptChange} className="ja-diary-sr-only" />

      {/* Receipt viewer overlay */}
      {viewingReceipt && (
        <div className="ja-budget-receipt-viewer" role="dialog" aria-modal="true" onClick={() => setViewingReceipt(null)}>
          <button type="button" className="ja-budget-receipt-viewer-close" onClick={() => setViewingReceipt(null)} aria-label="Close photo"><IonIcon icon={closeOutline} /></button>
          <img src={viewingReceipt} alt="Attached photo" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
