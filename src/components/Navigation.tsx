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
  NotebookText,
  Printer,
  Share2,
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
};

const desktopTabs: NavTab[] = [
  { label: "Itinerary", path: "/" },
  { label: "Budget", path: "/budget" },
  { label: "Map", path: "/map" },
  { label: "Notes", path: "/notes" },
];

const mobileTabs: NavTab[] = [
  { label: "Itinerary", path: "/", icon: CalendarDays },
  { label: "Budget", path: "/budget", icon: Wallet },
  { label: "Map", path: "/map", icon: MapIcon },
  { label: "Notes", path: "/notes", icon: NotebookText },
  { label: "Account", path: "/account", icon: User },
];

export default function Navigation({
  activeTab,
  setActiveTab,
  session,
  onOpenAuth,
  onSignOut,
  metadata,
}: NavigationProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdownState());

  useEffect(() => {
    const updateCountdown = () => setCountdown(getCountdownState());
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
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

  return (
    <>
      <header className="no-print">
        <div className="md:hidden bg-[#1a3328] text-stone-100 px-[14px] pt-3 pb-[10px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.1em] text-white/40 font-mono leading-none">
                TRAVEL ITINERARY
              </div>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <h1 className="min-w-0 text-[14px] font-semibold leading-[1.3] text-white">
                  <span className="block truncate">{HEADER_TITLE}</span>
                </h1>
                <span className="shrink-0 rounded-[20px] bg-[#c8e6a0] px-2 py-[2px] text-[11px] font-semibold leading-none text-[#2a5a0a]">
                  2026
                </span>
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

          <div className="mt-[10px] flex w-full items-center justify-between rounded-[20px] border border-[#7ec96b]/30 bg-[#7ec96b]/10 px-4 py-[7px]">
            <div className="flex items-center gap-2 whitespace-nowrap leading-none">
              <span className="text-[22px] font-bold leading-none text-[#7ec96b]">{countdown.days}</span>
              <span className="text-[9px] uppercase tracking-[0.07em] text-white/50">DAYS LEFT</span>
            </div>

            <div className="mx-2 h-6 w-px bg-white/15" />

            <div className="text-[12px] tracking-[0.03em] text-white/55">{countdownTime}</div>
          </div>
        </div>

        <div className="hidden bg-[#0B3530] text-stone-100 shadow-md md:block">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <div className="flex items-center justify-between gap-4 pb-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/40 font-mono leading-none">
                  TRAVEL ITINERARY
                </div>
                <h1 className="mt-1 flex flex-wrap items-center gap-2 text-[17px] font-semibold leading-tight text-white">
                  <span>{HEADER_TITLE}</span>
                  <span className="rounded-[20px] bg-[#c8e6a0] px-2 py-[2px] text-[11px] font-semibold leading-none text-[#2a5a0a]">
                    2026
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
                {desktopTabs.map((tab) => (
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
                    <span className="text-[9px] uppercase tracking-[0.07em] leading-none text-white/50">
                      DAYS LEFT
                    </span>
                  </div>
                  <div className="h-6 w-px bg-white/15" />
                  <div className="text-[12px] tracking-[0.03em] text-white/55">{countdownTime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-[1200] border-t border-white/8 bg-[#122820] px-1 pt-2 pb-[calc(0.55rem+env(safe-area-inset-bottom))] md:hidden">
          <div className="grid grid-cols-5">
            {mobileTabs.map((tab) => {
              const Icon = tab.icon ?? CalendarDays;
              const isActive = activeTab === tab.path;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.path)}
                  className={`flex flex-col items-center gap-[3px] py-[7px] text-[9px] transition-colors ${
                    isActive ? "text-[#7ec96b]" : "text-white/50"
                  }`}
                >
                  <Icon size={17} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

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
