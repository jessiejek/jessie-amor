import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Copy,
  Check,
  Download,
  Info,
  LogIn,
  LogOut,
  Map as MapIcon,
  BookOpen,
  NotebookText,
  Printer,
  Settings,
  Share2,
  User,
  Wallet,
  FileText,
  X,
} from "lucide-react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonChip,
  IonToast,
} from "@ionic/react";
import { closeOutline, settingsOutline, shareSocialOutline, downloadOutline } from "ionicons/icons";
import type { Session } from "@supabase/supabase-js";
import { itinerary } from "../data/code1Itinerary";
import type { Expense } from "../types";
import { jsPDF } from "jspdf";

const TRAVELER_1 = "Jessie Jay Q. Rubi";
const TRAVELER_2 = "Rizza Amor L. Caguco";
const TRIP_COUNTDOWN_TARGET = new Date(2026, 6, 11, 0, 0, 0, 0);
const HEADER_TITLE = "J&A Malaysia · Singapore Trip 2026";
const HOLIDAY_DISPLAY_DATE = { year: 2026, month: 6, day: 11 };

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const getCountdownState = (): CountdownState => {
  const diff = Math.max(0, TRIP_COUNTDOWN_TARGET.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const isHolidayDisplayDate = (date: Date) =>
  date.getFullYear() === HOLIDAY_DISPLAY_DATE.year &&
  date.getMonth() === HOLIDAY_DISPLAY_DATE.month &&
  date.getDate() === HOLIDAY_DISPLAY_DATE.day;

const getNextLocalMidnightDelay = () => {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return Math.max(1000, nextMidnight.getTime() - now.getTime());
};

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: Session | null;
  isOnline: boolean;
  onOpenAuth: () => void;
  onOpenSettings?: () => void;
  onSignOut: () => void;
  metadata: {
    title: string;
    description: string;
  };
  expenses?: Expense[];
  screenSize: "small" | "large";
}

type NavTab = {
  label: string;
  path: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  showInBottom?: boolean;
};

const navItems: NavTab[] = [
  { label: "Itinerary2", path: "/", icon: CalendarDays, showInBottom: true },
  { label: "Budget", path: "/budget", icon: Wallet, showInBottom: true },
  { label: "Map", path: "/map", icon: MapIcon, showInBottom: true },
  { label: "Notes", path: "/notes", icon: NotebookText, showInBottom: true },
  { label: "Diary", path: "/diary", icon: BookOpen, showInBottom: false },
];

export default function Navigation({
  activeTab,
  setActiveTab,
  session,
  isOnline,
  onOpenAuth,
  onOpenSettings,
  onSignOut,
  metadata,
  expenses = [],
  screenSize,
}: NavigationProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdownState());
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const updateCountdown = () => {
      const nextCountdown = getCountdownState();
      setCountdown(nextCountdown);
      return nextCountdown.days === 0 && nextCountdown.hours === 0 && nextCountdown.minutes === 0 && nextCountdown.seconds === 0;
    };

    if (updateCountdown()) {
      return;
    }

    const interval = window.setInterval(() => {
      if (updateCountdown()) {
        window.clearInterval(interval);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentDate(new Date());
    }, getNextLocalMidnightDelay());

    return () => window.clearTimeout(timeoutId);
  }, [currentDate]);

  useEffect(() => {
    const handler = () => setShowMoreDrawer(true);
    window.addEventListener("open-more-drawer", handler);
    return () => window.removeEventListener("open-more-drawer", handler);
  }, []);

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setShowCopiedToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowCopiedToast(false);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImmigrationDoc = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const M = 18;
    const PW = 190;
    let y = 22;
    const clean = (s: string) =>
      s
        .replace(/\u2019|\u2018/g, "'")
        .replace(/\u201C|\u201D/g, '"')
        .replace(/\u2013|\u2014/g, "-")
        .replace(/\u2192/g, "-")
        .replace(/\u00B7/g, ".")
        .replace(/\u2022/g, "-")
        .replace(/\u2026/g, "...")
        .replace(/\u00A0/g, " ")
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const sec = (title: string) => {
      y += 3;
      doc.setDrawColor(11, 53, 48);
      doc.setLineWidth(0.5);
      doc.line(M, y, PW + M - 8, y);
      y += 5;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(11, 53, 48);
      doc.text(clean(title).toUpperCase(), M, y);
      y += 6;
    };

    const kv = (k: string, v: string) => {
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text(clean(k), M, y);
      const kw = doc.getTextWidth(clean(k) + " ");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(26, 26, 26);
      doc.text(clean(v), M + kw, y);
      y += 4.8;
    };

    const nl = () => { y += 2; };
    const np = () => { if (y > 270) { doc.addPage(); y = 22; } };

    // ----- HEADER -----
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(11, 53, 48);
    doc.text("Jessie & Amor's Malaysia - Singapore Trip 2026", M, y);
    y += 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(11, 53, 48);
    const bw = doc.getTextWidth("TOURISM  JULY 12-16, 2026 (5 DAYS)") + 8;
    doc.roundedRect(M, y, bw, 6, 3, 3, "F");
    doc.text("TOURISM  JULY 12-16, 2026 (5 DAYS)", M + 4, y + 4.5);
    y += 12;
    doc.setDrawColor(11, 53, 48);
    doc.setLineWidth(1);
    doc.line(M, y, PW + M - 8, y);
    y += 8;

    // ----- TRAVELER INFO -----
    sec("Traveler Information");
    kv("Traveler 1:", TRAVELER_1);
    kv("Traveler 2:", TRAVELER_2);
    kv("Purpose:", "Tourism - sightseeing, cultural exploration, culinary experience");
    kv("Duration:", "5 days (arrive Kuala Lumpur July 12, depart Singapore July 16)");
    kv("Route:", "Kuala Lumpur, Malaysia - Malacca (day trip) - Singapore");

    // ----- FLIGHT DETAILS -----
    sec("Flight Details");
    kv("Arrival in Malaysia:", "July 12, 2026 at 01:30 AM - Kuala Lumpur International Airport (KLIA)");
    kv("Departure:", "July 16, 2026 (morning) - Changi Airport (SIN)");

    // ----- ACCOMMODATION -----
    sec("Accommodation");
    np();
    const cw = [65, 40, 38, 39];
    const th = ["Hotel", "Location", "Check-in", "Check-out"];
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(11, 53, 48);
    let cx = M;
    th.forEach((h, i) => { doc.text(h, cx + 1, y); cx += cw[i]; });
    doc.setDrawColor(11, 53, 48);
    doc.line(M, y + 1, M + cw.reduce((a, b) => a + b, 0), y + 1);
    y += 5;
    const hr = (r: string[]) => {
      let rx = M;
      r.forEach((c, i) => {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", i === 0 ? "bold" : "normal");
        doc.setTextColor(26, 26, 26);
        doc.text(clean(c), rx + 1, y);
        rx += cw[i];
      });
      y += 4.5;
    };
    hr(["Travelodge KL City Centre", "Kuala Lumpur", "July 12, 2026", "July 15, 2026"]);
    hr(["Hotel Classic by Venue", "Joo Chiat, Singapore", "July 15, 2026", "July 16, 2026"]);

    // ----- DAILY ITINERARY -----
    nl();
    sec("Daily Itinerary");
    itinerary.days.forEach((day) => {
      np();
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(11, 53, 48);
      doc.text("Day " + day.day + " - July " + day.day + " - " + clean(day.title), M, y);
      y += 4.5;
      day.items.forEach((item) => {
        np();
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(clean(item.time), M + 3, y);
        const tw = doc.getTextWidth(clean(item.time)) + 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(26, 26, 26);
        doc.text(clean(item.title), M + 3 + tw, y);
        y += 4;
      });
      y += 2;
    });

    doc.save("Immigration_Document.pdf");
  };

  const countdownTime = `${String(countdown.hours).padStart(2, "0")}h ${String(countdown.minutes).padStart(2, "0")}m ${String(countdown.seconds).padStart(2, "0")}s`;
  const shouldShowHolidayBanner = isHolidayDisplayDate(currentDate);
  const shouldShowCountdown = !shouldShowHolidayBanner && currentDate.getTime() < TRIP_COUNTDOWN_TARGET.getTime();
  const desktopNavItems = navItems;
  const bottomNavItems = navItems.filter((tab) => tab.showInBottom);
  const bottomNavPaths = bottomNavItems.map((tab) => tab.path);
  const isMoreActive = showMoreDrawer || !bottomNavPaths.includes(activeTab);
  const userMetadata = session?.user.user_metadata as
    | {
        avatar_url?: string;
        picture?: string;
        full_name?: string;
        name?: string;
      }
    | undefined;
  const userDisplayName =
    userMetadata?.full_name ??
    userMetadata?.name ??
    session?.user.email?.split("@")[0] ??
    "Signed in";
  const userEmail = session?.user.email ?? "";
  const userAvatar = userMetadata?.avatar_url ?? userMetadata?.picture ?? null;
  const userInitial = (userDisplayName.trim().charAt(0) || "?").toUpperCase();

  const handleNavigate = (path: string) => {
    setActiveTab(path);
    setShowMoreDrawer(false);
  };

  const connectionDotClass = isOnline ? "bg-emerald-400" : "bg-red-500";

  return (
    <>
      {/* Mobile header */}
      <header className={`no-print ${screenSize === "small" ? "" : "hidden"}`}>
        <div
          className="fixed top-0 left-0 right-0 z-[1100] px-[14px] pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[10px]"
          style={{ background: "#1a3328", color: "#f5f5f4" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] uppercase tracking-[0.1em] text-white/40 font-mono leading-none">
                TRAVEL ITINERARY
              </div>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <h1 className="min-w-0 text-[15px] font-semibold leading-[1.3] text-white">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="block truncate">{HEADER_TITLE}</span>
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${connectionDotClass}`}
                      aria-label={isOnline ? "Online" : "Offline"}
                      title={isOnline ? "Online" : "Offline"}
                    />
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <IonButton fill="clear" onClick={() => setShowShareModal(true)} className="ja-nav-icon-btn" title="Share Trip">
                <IonIcon icon={shareSocialOutline} />
              </IonButton>
              <IonButton fill="clear" onClick={() => setShowDownloadModal(true)} className="ja-nav-icon-btn" title="Download Data">
                <IonIcon icon={downloadOutline} />
              </IonButton>
            </div>
          </div>

          {/* Mobile countdown */}
          {shouldShowHolidayBanner ? (
            <div className="mt-[10px] rounded-[20px] border border-amber-300/40 bg-gradient-to-r from-amber-200/20 via-lime-300/15 to-emerald-300/20 px-4 py-[9px] text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/80">Holiday mode</div>
              <div className="mt-0.5 text-[16px] font-extrabold tracking-[-0.03em] text-white">Enjoy your holiday</div>
            </div>
          ) : shouldShowCountdown ? (
            <div className="mt-[10px] flex w-full items-center justify-between rounded-[20px] border border-[#7ec96b]/30 bg-[#7ec96b]/10 px-4 py-[7px]">
              <div className="flex items-center gap-2 whitespace-nowrap leading-none">
                <span className="text-[22px] font-bold leading-none text-[#7ec96b]">{countdown.days}</span>
                <span className="text-[13px] uppercase tracking-[0.07em] text-white/50">DAYS LEFT</span>
              </div>
              <div className="mx-2 h-6 w-px bg-white/15" />
              <div className="text-[13px] tracking-[0.03em] text-white/55">{countdownTime}</div>
            </div>
          ) : null}
        </div>
      </header>

      {/* Desktop header */}
      <header className={`no-print ${screenSize === "large" ? "" : "hidden"}`}>
        <div
          className="sticky top-0 z-[1100] shadow-md"
          style={{ background: "#0B3530", color: "#f5f5f4" }}
        >
          <div className="mx-auto max-w-7xl px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3">
            <div className="flex items-center justify-between gap-4 pb-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/40 font-mono leading-none">
                  TRAVEL ITINERARY
                </div>
                <h1 className="mt-1 flex flex-wrap items-center gap-2 text-[15px] font-semibold leading-tight text-white">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{HEADER_TITLE}</span>
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${connectionDotClass}`}
                      aria-label={isOnline ? "Online" : "Offline"}
                      title={isOnline ? "Online" : "Offline"}
                    />
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {session && onOpenSettings ? (
                  <IonButton fill="clear" onClick={onOpenSettings} className="ja-nav-desktop-btn" title="Settings">
                    <IonIcon icon={settingsOutline} slot="start" />
                    Settings
                  </IonButton>
                ) : null}
                <IonButton
                  fill="clear"
                  onClick={session ? onSignOut : onOpenAuth}
                  className="ja-nav-desktop-btn"
                  title={session ? "Log out" : "Login"}
                >
                  {session ? <LogOut size={14} /> : <LogIn size={14} />}
                  {session ? "Log out" : "Login"}
                </IonButton>
                <IonButton fill="clear" onClick={() => setShowShareModal(true)} className="ja-nav-icon-btn" title="Share Trip">
                  <IonIcon icon={shareSocialOutline} />
                </IonButton>
                <IonButton fill="clear" onClick={() => setShowDownloadModal(true)} className="ja-nav-icon-btn" title="Download Data">
                  <IonIcon icon={downloadOutline} />
                </IonButton>
                <IonButton fill="clear" onClick={handlePrint} className="ja-nav-icon-btn" title="Print Itinerary">
                  <Printer size={16} />
                </IonButton>
              </div>
            </div>

            <div className="border-t border-white/8" />

            <div className="flex items-center gap-2 whitespace-nowrap pt-2.5 pb-[10px]">
              <nav className="flex items-center gap-2 whitespace-nowrap">
                {desktopNavItems.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.path)}
                    className={`rounded-[6px] px-[14px] py-1.5 text-[15px] transition-colors ${
                      activeTab === tab.path
                        ? "border-b-2 border-[#7ec96b] bg-white/12 text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Desktop countdown */}
            {shouldShowHolidayBanner ? (
              <div className="pb-[10px] rounded-[20px] border border-amber-300/30 bg-gradient-to-r from-amber-200/15 via-lime-300/10 to-emerald-300/15 px-[16px] py-[8px] text-center shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-100/75">Holiday mode</div>
                <div className="mt-0.5 text-[16px] font-extrabold tracking-[-0.03em] text-white">Enjoy your holiday</div>
              </div>
            ) : shouldShowCountdown ? (
              <div className="pb-[10px] flex items-center rounded-[20px] border border-[#7ec96b]/30 bg-[#7ec96b]/12 px-[14px] py-[5px]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 whitespace-nowrap leading-none">
                    <span className="text-[20px] font-bold leading-none text-[#7ec96b]">{countdown.days}</span>
                    <span className="text-[13px] uppercase tracking-[0.07em] leading-none text-white/50">DAYS LEFT</span>
                  </div>
                  <div className="h-6 w-px bg-white/15" />
                  <div className="text-[13px] tracking-[0.03em] text-white/55">{countdownTime}</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* More Drawer Modal */}
      <IonModal
        isOpen={showMoreDrawer}
        onDidDismiss={() => setShowMoreDrawer(false)}
        className="ja-more-modal"
        swipeToClose={screenSize === "small"}
      >
        <IonHeader>
          <IonToolbar style={{ "--background": "#1a3a35", "--color": "#ffffff" } as React.CSSProperties}>
            <IonTitle className="text-[15px] font-semibold">More</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowMoreDrawer(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ "--background": "#1a3a35" } as React.CSSProperties}>
          <IonList className="ja-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon ?? CalendarDays;
              const isActive = activeTab === item.path;
              return (
                <IonItem
                  key={item.label}
                  button
                  onClick={() => handleNavigate(item.path)}
                  className={`ja-nav-item ${isActive ? "ja-nav-item-active" : ""}`}
                >
                  <span
                    slot="start"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: isActive ? "rgba(126,201,107,0.2)" : "rgba(255,255,255,0.1)",
                      color: isActive ? "#7ec96b" : "rgba(255,255,255,0.75)",
                    }}
                  >
                    <Icon size={15} />
                  </span>
                  <IonLabel className="text-[14px] font-medium">{item.label}</IonLabel>
                </IonItem>
              );
            })}
          </IonList>

          <div className="border-t border-white/10 px-3 py-4 mt-4">
            {session && onOpenSettings ? (
              <IonItem
                button
                onClick={() => {
                  setShowMoreDrawer(false);
                  onOpenSettings();
                }}
                className="ja-nav-item"
              >
                <span
                  slot="start"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                >
                  <Settings size={15} />
                </span>
                <IonLabel className="text-[14px] font-medium">Settings</IonLabel>
              </IonItem>
            ) : null}

            {!session ? (
              <IonItem
                button
                onClick={() => {
                  setShowMoreDrawer(false);
                  onOpenAuth();
                }}
                className="ja-nav-item"
              >
                <span
                  slot="start"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                >
                  <User size={15} />
                </span>
                <IonLabel className="text-[14px] font-medium">Login</IonLabel>
              </IonItem>
            ) : (
              <div
                className="flex items-center gap-3 rounded-[8px] px-3 py-[10px] mx-3"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-[14px] font-semibold text-white">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userDisplayName}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium leading-tight text-white">
                    {userDisplayName}
                  </div>
                  <div className="truncate text-[14px] leading-tight text-white/50">{userEmail}</div>
                </div>

                <IonButton
                  fill="clear"
                  onClick={() => {
                    setShowMoreDrawer(false);
                    onSignOut();
                  }}
                  title="Log out"
                  style={{ "--color": "rgba(255,255,255,0.5)" } as React.CSSProperties}
                >
                  <LogOut size={16} />
                </IonButton>
              </div>
            )}
          </div>
        </IonContent>
      </IonModal>

      {/* Share Modal */}
      <IonModal isOpen={showShareModal} onDidDismiss={() => setShowShareModal(false)} className="ja-share-modal">
        <IonHeader>
          <IonToolbar style={{ "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties}>
            <IonTitle>Share Travel Itinerary</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowShareModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ "--background": "#fafaf9" } as React.CSSProperties}>
          <p className="mb-4 text-xs text-stone-500">
            Share Jessie and Amor's exclusive Malaysia itinerary with others. Both web preview and responsive modes are supported.
          </p>

          <div className="mb-4 flex flex-col items-center justify-center rounded-lg border border-stone-100 bg-[#F7F9FA] p-4">
            <div className="relative flex h-32 w-32 flex-wrap gap-1 overflow-hidden rounded-md bg-[#0B3530] p-2">
              <div className="absolute inset-2 flex items-center justify-center rounded bg-white">
                <div className="grid h-full w-full grid-cols-5 gap-1.5 p-1 text-[#0B3530]">
                  <div className="h-6 w-6 border-2 border-[#0B3530]" />
                  <div className="col-start-5 h-6 w-6 border-2 border-[#0B3530]" />
                  <div className="col-start-3 row-start-3 h-2 w-2 rounded-full bg-[#0B3530]" />
                  <div className="col-start-1 row-start-5 h-6 w-6 border-2 border-[#0B3530]" />
                  <div className="col-start-2 row-start-2 rounded-sm bg-[#0b3530]" />
                  <div className="col-start-4 row-start-2 rounded-sm bg-[#0b3530]" />
                  <div className="col-start-3 row-start-4 rounded-sm bg-[#0b3530]" />
                  <div className="col-start-5 row-start-4 rounded-sm bg-[#0b3530]" />
                </div>
              </div>
            </div>
            <span className="mt-2 text-[10px] font-mono text-stone-400">SCAN FOR MOBILE VIEW</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="flex-1 truncate rounded border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-600 outline-none select-all"
            />
            <IonButton onClick={copyUrlToClipboard} className="ja-nav-copy-btn">
              {copied ? <Check size={16} style={{ color: "#88B04B" }} /> : <Copy size={16} />}
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      {/* Copied Toast */}
      <IonToast
        isOpen={showCopiedToast}
        message="Link copied to clipboard!"
        duration={2000}
        position="bottom"
        color="success"
        onDidDismiss={() => setShowCopiedToast(false)}
      />

      {/* Download/Immigration Modal */}
      <IonModal isOpen={showDownloadModal} onDidDismiss={() => setShowDownloadModal(false)} className="ja-download-modal">
        <IonHeader>
          <IonToolbar style={{ "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties}>
            <IonTitle>Immigration Document</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowDownloadModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ "--background": "#fafaf9" } as React.CSSProperties}>
          <p className="mb-4 text-xs text-stone-500">
            Generate a formatted letter for immigration purposes — includes traveler info, flights, hotels, and daily itinerary.
          </p>

          <IonButton
            expand="block"
            onClick={handleImmigrationDoc}
            className="ja-nav-download-btn"
            style={{ "--background": "#0B3530", "--background-hover": "#18534C" } as React.CSSProperties}
          >
            <FileText size={14} style={{ marginRight: 8 }} />
            Immigration Document (PDF)
          </IonButton>
          <p className="mt-2 text-[10px] text-stone-500">Formatted for immigration — travelers, flights, hotel, itinerary</p>

          <div className="mt-4 flex gap-2 rounded-lg bg-[#88B04B]/10 p-3">
            <Info size={16} className="mt-0.5 shrink-0 text-[#0B3530]" />
            <p className="text-[11px] leading-normal text-[#0b3530]">
              <strong>Cloud Sync Note:</strong> Any customizations made to the budget charts, map stops, or travel notes are stored in Supabase and stay in sync across open sessions.
            </p>
          </div>
        </IonContent>
      </IonModal>
    </>
  );
}
