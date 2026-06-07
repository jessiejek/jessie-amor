import React, { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Copy,
  Check,
  Download,
  Info,
  LogIn,
  LogOut,
  Map as MapIcon,
  Menu,
  BookOpen,
  NotebookText,
  Printer,
  Share2,
  X,
  User,
  Wallet,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const TRIP_COUNTDOWN_TARGET = new Date(2026, 6, 11, 0, 0, 0, 0);
const HEADER_TITLE = "J&A Malaysia · Singapore Trip 2026";

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

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: Session | null;
  isOnline: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  metadata: {
    title: string;
    description: string;
  };
}

type NavTab = {
  label: string;
  path: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  showInBottom?: boolean;
};

const navItems: NavTab[] = [
  { label: "Itinerary", path: "/", icon: CalendarDays, showInBottom: true },
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
  onSignOut,
  metadata,
}: NavigationProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdownState());

  useEffect(() => {
    const updateCountdown = () => setCountdown(getCountdownState());
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showMoreDrawer) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMoreDrawer(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMoreDrawer]);

  const [showCountdown, setShowCountdown] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowCountdown(currentScrollY < 10);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadItineraryJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metadata, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Malaysia_Singapore_Trip_Itinerary.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const countdownTime = `${String(countdown.hours).padStart(2, "0")}h ${String(countdown.minutes).padStart(2, "0")}m ${String(countdown.seconds).padStart(2, "0")}s`;
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
      <header className="no-print">
        <div className="md:hidden fixed top-0 left-0 right-0 z-[1100] bg-[#1a3328] text-stone-100 px-[14px] pt-3 pb-[10px]">
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
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/20 bg-transparent text-stone-100 transition-colors hover:bg-white/10"
                title="Share Trip"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/20 bg-transparent text-stone-100 transition-colors hover:bg-white/10"
                title="Download Data"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ${showCountdown ? "max-h-[48px] mt-[10px] opacity-100" : "max-h-0 mt-0 opacity-0"}`}>
            <div className="flex w-full items-center justify-between rounded-[20px] border border-[#7ec96b]/30 bg-[#7ec96b]/10 px-4 py-[7px]">
              <div className="flex items-center gap-2 whitespace-nowrap leading-none">
                <span className="text-[22px] font-bold leading-none text-[#7ec96b]">{countdown.days}</span>
                <span className="text-[13px] uppercase tracking-[0.07em] text-white/50">DAYS LEFT</span>
              </div>

              <div className="mx-2 h-6 w-px bg-white/15" />

              <div className="text-[13px] tracking-[0.03em] text-white/55">{countdownTime}</div>
            </div>
          </div>
        </div>

        <div className="hidden bg-[#0B3530] text-stone-100 shadow-md md:block">
          <div className="mx-auto max-w-7xl px-6 py-3">
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
                <button
                  onClick={session ? onSignOut : onOpenAuth}
                  className="inline-flex items-center gap-2 rounded-[6px] border border-white/25 bg-transparent px-3 py-1 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
                  title={session ? "Log out" : "Login"}
                >
                  {session ? <LogOut size={14} /> : <LogIn size={14} />}
                  {session ? "Log out" : "Login"}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/20 bg-transparent text-stone-100 transition-colors hover:bg-white/10"
                  title="Share Trip"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/20 bg-transparent text-stone-100 transition-colors hover:bg-white/10"
                  title="Download Data"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/20 bg-transparent text-stone-100 transition-colors hover:bg-white/10"
                  title="Print Itinerary"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>

            <div className="border-t border-white/8" />

            <div className="flex items-center justify-between gap-4 pt-2.5 pb-[10px]">
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

              <div className="flex items-center rounded-[20px] border border-[#7ec96b]/30 bg-[#7ec96b]/12 px-[14px] py-[5px]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 whitespace-nowrap leading-none">
                    <span className="text-[20px] font-bold leading-none text-[#7ec96b]">{countdown.days}</span>
                    <span className="text-[13px] uppercase tracking-[0.07em] leading-none text-white/50">
                      DAYS LEFT
                    </span>
                  </div>
                  <div className="h-6 w-px bg-white/15" />
                  <div className="text-[13px] tracking-[0.03em] text-white/55">{countdownTime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-[1200] border-t border-white/8 bg-[#122820] px-1 pt-2 pb-[calc(0.55rem+env(safe-area-inset-bottom))] md:hidden">
          <div className="grid grid-cols-5">
            {bottomNavItems.map((tab) => {
              const Icon = tab.icon ?? CalendarDays;
              const isActive = activeTab === tab.path;
              return (
                <button
                  key={tab.label}
                  onClick={() => handleNavigate(tab.path)}
                className={`flex flex-col items-center gap-[3px] py-[7px] text-[12px] transition-colors ${
                    isActive ? "text-[#7ec96b]" : "text-white/50"
                  }`}
                >
                  <Icon size={17} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setShowMoreDrawer(true)}
              className={`flex flex-col items-center gap-[3px] py-[7px] text-[12px] transition-colors ${
                isMoreActive ? "text-[#7ec96b]" : "text-white/50"
              }`}
              aria-expanded={showMoreDrawer}
              aria-controls="mobile-more-drawer"
              title="More"
            >
              <Menu size={17} />
              <span>More</span>
            </button>
          </div>
        </nav>
      </header>

      {showMoreDrawer && (
        <div className="fixed inset-0 z-[1350] md:hidden" aria-hidden="false">
          <button
            type="button"
            aria-label="Close more menu"
            className="absolute inset-0 bg-black/55 backdrop-blur-[1px] transition-opacity"
            onClick={() => setShowMoreDrawer(false)}
          />

          <aside
            id="mobile-more-drawer"
            className="absolute left-0 top-0 z-10 flex h-[100dvh] w-[75vw] max-w-[300px] flex-col border-r border-white/10 bg-[#1a3a35] text-white shadow-2xl transition-transform duration-300 ease-out animate-in fade-in slide-in-from-left-12"
            role="dialog"
            aria-modal="true"
            aria-label="More navigation"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="text-[13px] font-mono uppercase tracking-[0.22em] text-[#7ec96b]/70">More</p>
                <h2 className="mt-1 text-[15px] font-semibold text-white">Navigation</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreDrawer(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon ?? CalendarDays;
                  const isActive = activeTab === item.path;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleNavigate(item.path)}
                      className={`flex min-h-12 w-full items-center gap-2.5 rounded-[12px] px-3 py-[10px] text-left text-[14px] font-medium transition-colors ${
                        isActive ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isActive ? "bg-[#7ec96b]/20 text-[#7ec96b]" : "bg-white/10 text-white/75"
                        }`}
                      >
                        <Icon size={15} />
                      </span>
                      <span className="flex-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto border-t border-white/10 px-3 py-3">
              {!session ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreDrawer(false);
                    onOpenAuth();
                  }}
                  className="flex w-full items-center gap-3 rounded-[8px] bg-[rgba(255,255,255,0.08)] px-4 py-[10px] text-left text-[14px] text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80">
                    <User size={15} />
                  </span>
                  <span className="flex-1">Login</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-[8px] bg-[rgba(255,255,255,0.04)] px-3 py-[10px]">
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

                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreDrawer(false);
                      onSignOut();
                    }}
                    className="inline-flex shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white"
                    aria-label="Log out"
                    title="Log out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-4 backdrop-blur-xs no-print">
          <div className="relative w-full max-w-sm animate-in fade-in zoom-in duration-200 rounded-xl border border-stone-100 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute right-4 top-4 font-sans text-stone-400 hover:text-stone-600"
            >
              X
            </button>
            <h3 className="mb-2 text-lg font-serif font-bold text-[#0B3530]">Share Travel Itinerary</h3>
            <p className="mb-4 text-xs font-sans text-stone-500">
              Share Jessie and Amor's exclusive Malaysia itinerary with others. Both web preview and responsive modes are supported.
            </p>

            <div className="mb-4 flex flex-col items-center justify-center rounded-lg border border-stone-100 bg-[#F7F9FA] p-4">
              <div className="relative flex h-32 w-32 flex-wrap gap-1 overflow-hidden rounded-md bg-[#0B3530] p-2">
                <div className="absolute inset-2 flex items-center justify-center rounded bg-white">
                  <div className="grid h-full w-full grid-cols-5 gap-1.5 p-1 text-[#0B3530]">
                    <div className="h-6 w-6 border-2 border-[#0B3530]"></div>
                    <div className="col-start-5 h-6 w-6 border-2 border-[#0B3530]"></div>
                    <div className="col-start-3 row-start-3 h-2 w-2 rounded-full bg-[#0B3530]"></div>
                    <div className="col-start-1 row-start-5 h-6 w-6 border-2 border-[#0B3530]"></div>
                    <div className="col-start-2 row-start-2 rounded-sm bg-[#0b3530]"></div>
                    <div className="col-start-4 row-start-2 rounded-sm bg-[#0b3530]"></div>
                    <div className="col-start-3 row-start-4 rounded-sm bg-[#0b3530]"></div>
                    <div className="col-start-5 row-start-4 rounded-sm bg-[#0b3530]"></div>
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
              <button
                onClick={copyUrlToClipboard}
                className="flex items-center justify-center rounded bg-[#0B3530] p-2 text-white transition-colors hover:bg-[#18534C]"
              >
                {copied ? <Check size={16} className="text-[#88B04B]" /> : <Copy size={16} />}
              </button>
            </div>
            {copied && <p className="mt-1 text-center text-[10px] font-medium text-green-600">Link copied to clipboard!</p>}
          </div>
        </div>
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-4 backdrop-blur-xs no-print">
          <div className="relative w-full max-w-sm animate-in fade-in zoom-in duration-200 rounded-xl border border-stone-100 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute right-4 top-4 font-sans text-stone-400 hover:text-stone-600"
            >
              X
            </button>
            <h3 className="mb-2 text-lg font-serif font-bold text-[#0B3530]">Export Trip Data</h3>
            <p className="mb-4 text-xs font-sans text-stone-500">
              Choose an export format below to back up or download your current itinerary and custom budgets.
            </p>

            <div className="space-y-3">
              <button
                onClick={downloadItineraryJSON}
                className="flex w-full items-center justify-between rounded-lg border border-stone-200 p-3 text-left transition-all hover:border-[#0B3530] hover:bg-stone-50"
              >
                <div>
                  <h4 className="text-xs font-bold font-sans text-stone-800">Export as Itinerary JSON</h4>
                  <p className="text-[10px] text-stone-500">Includes all coordinates, tasks and details</p>
                </div>
                <Download size={14} className="text-stone-400" />
              </button>

              <button
                onClick={handlePrint}
                className="flex w-full items-center justify-between rounded-lg border border-stone-200 p-3 text-left transition-all hover:border-[#0B3530] hover:bg-stone-50"
              >
                <div>
                  <h4 className="text-xs font-bold font-sans text-stone-800">Print / Save as PDF</h4>
                  <p className="text-[10px] text-stone-500">Beautiful styled layouts matching original format</p>
                </div>
                <Printer size={14} className="text-stone-400" />
              </button>
            </div>

            <div className="mt-4 flex gap-2 rounded-lg bg-[#88B04B]/10 p-3">
              <Info size={16} className="mt-0.5 shrink-0 text-[#0B3530]" />
              <p className="text-[11px] leading-normal text-[#0b3530] font-sans">
                <strong>Cloud Sync Note:</strong> Any customizations made to the budget charts, map stops, or travel notes are stored in Supabase and stay in sync across open sessions.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
