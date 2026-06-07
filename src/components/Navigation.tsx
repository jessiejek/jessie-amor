import React, { useEffect, useState } from "react";
import { Share2, Download, Printer, Copy, Check, Info, LogIn, LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const TRIP_COUNTDOWN_TARGET = new Date(2026, 6, 11, 0, 0, 0, 0);

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

export default function Navigation({ activeTab, setActiveTab, session, onOpenAuth, onSignOut, metadata }: NavigationProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdownState());

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdownState());
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(interval);
    };
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

  const tabs = [
    { label: "Itinerary", path: "/" },
    { label: "Budget", path: "/budget" },
    { label: "Map", path: "/map" },
    { label: "Notes", path: "/notes" },
  ];

  return (
    <>
      <header className="bg-[#0B3530] text-stone-100 px-4 md:px-8 py-4 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#88B04B] font-mono leading-none">
                TRAVEL ITINERARY
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-semibold text-white tracking-tight mt-1 flex items-center gap-2">
                {metadata.title}
                <span className="text-[12px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#18534C] text-[#88B04B]">
                  2026
                </span>
              </h1>
              <div className="mt-2">
                <span className="inline-flex flex-col rounded-full border border-[#88B04B]/35 bg-[#18534C] px-4 py-2 text-[#88B04B] shadow-sm">
                  <span className="text-3xl md:text-5xl font-black leading-none tracking-tight font-sans">
                    {countdown.days}
                  </span>
                  <span className="text-sm md:text-base font-semibold uppercase tracking-[0.28em] leading-none">
                    Days Left
                  </span>
                  <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] md:text-sm font-semibold uppercase tracking-[0.18em] text-[#d8e7dd]">
                    <span>{String(countdown.hours).padStart(2, "0")} Hours</span>
                    <span>{String(countdown.minutes).padStart(2, "0")} Mins</span>
                    <span>{String(countdown.seconds).padStart(2, "0")} Seconds</span>
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-[#18534C] pl-0 md:pl-4">
              <button
                onClick={session ? onSignOut : onOpenAuth}
                className="inline-flex items-center gap-2 rounded-full border border-[#18534C] bg-[#18534C] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1f6158]"
                title={session ? "Log out" : "Login"}
              >
                {session ? <LogOut size={14} /> : <LogIn size={14} />}
                {session ? "Log out" : "Login"}
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-1.5 rounded-full hover:bg-[#18534C] text-stone-300 hover:text-white transition-colors"
                title="Share Trip"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="p-1.5 rounded-full hover:bg-[#18534C] text-stone-300 hover:text-white transition-colors"
                title="Download Data"
              >
                <Download size={16} />
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 rounded-full hover:bg-[#18534C] text-stone-300 hover:text-white transition-colors"
                title="Print Itinerary"
              >
                <Printer size={16} />
              </button>
            </div>
          </div>

          <div className="sticky top-0 z-50 -mx-4 bg-[#0B3530]/95 px-4 py-3 backdrop-blur-sm md:static md:z-auto md:mx-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-0">
            <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto whitespace-nowrap">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.path)}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                    activeTab === tab.path
                      ? "bg-[#18534C] text-white border-b-2 border-[#88B04B]"
                      : "text-stone-300 hover:text-white hover:bg-[#18534C]/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-stone-100 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 font-sans"
            >
              X
            </button>
            <h3 className="text-lg font-serif font-bold text-[#0B3530] mb-2">Share Travel Itinerary</h3>
            <p className="text-xs text-stone-500 mb-4 font-sans">
              Share Jessie and Amor's exclusive Malaysia itinerary with others. Both web preview and responsive modes are supported.
            </p>

            <div className="bg-[#F7F9FA] rounded-lg p-4 flex flex-col items-center justify-center mb-4 border border-stone-100">
              <div className="w-32 h-32 bg-[#0B3530] rounded-md p-2 flex flex-wrap gap-1 relative overflow-hidden">
                <div className="absolute inset-2 bg-white rounded flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 text-[#0B3530]">
                    <div className="border-2 border-[#0B3530] h-6 w-6"></div>
                    <div className="border-2 border-[#0B3530] h-6 w-6 col-start-5"></div>
                    <div className="bg-[#0B3530] h-2 w-2 rounded-full col-start-3 row-start-3"></div>
                    <div className="border-2 border-[#0B3530] h-6 w-6 col-start-1 row-start-5"></div>
                    <div className="bg-[#0b3530] rounded-sm col-start-2 row-start-2"></div>
                    <div className="bg-[#0b3530] rounded-sm col-start-4 row-start-2"></div>
                    <div className="bg-[#0b3530] rounded-sm col-start-3 row-start-4"></div>
                    <div className="bg-[#0b3530] rounded-sm col-start-5 row-start-4"></div>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-stone-400 mt-2">SCAN FOR MOBILE VIEW</span>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-stone-50 text-xs px-3 py-2 rounded border border-stone-200 outline-none select-all text-stone-600 font-mono truncate"
              />
              <button
                onClick={copyUrlToClipboard}
                className="p-2 bg-[#0B3530] text-white rounded hover:bg-[#18534C] transition-colors flex items-center justify-center"
              >
                {copied ? <Check size={16} className="text-[#88B04B]" /> : <Copy size={16} />}
              </button>
            </div>
            {copied && <p className="text-[10px] text-green-600 font-sans mt-1 text-center font-medium">Link copied to clipboard!</p>}
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-stone-100 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 font-sans"
            >
              X
            </button>
            <h3 className="text-lg font-serif font-bold text-[#0B3530] mb-2">Export Trip Data</h3>
            <p className="text-xs text-stone-500 mb-4 font-sans">
              Choose an export format below to back up or download your current itinerary and custom budgets.
            </p>

            <div className="space-y-3">
              <button
                onClick={downloadItineraryJSON}
                className="w-full text-left p-3 rounded-lg border border-stone-200 hover:border-[#0B3530] hover:bg-stone-50 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold font-sans text-stone-800">Export as Itinerary JSON</h4>
                  <p className="text-[10px] text-stone-500">Includes all coordinates, tasks and details</p>
                </div>
                <Download size={14} className="text-stone-400" />
              </button>

              <button
                onClick={handlePrint}
                className="w-full text-left p-3 rounded-lg border border-stone-200 hover:border-[#0B3530] hover:bg-stone-50 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold font-sans text-stone-800">Print / Save as PDF</h4>
                  <p className="text-[10px] text-stone-500">Beautiful styled layouts matching original format</p>
                </div>
                <Printer size={14} className="text-stone-400" />
              </button>
            </div>

            <div className="mt-4 bg-[#88B04B]/10 p-3 rounded-lg flex gap-2">
              <Info size={16} className="text-[#0B3530] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#0b3530] font-sans leading-normal">
                <strong>Cloud Sync Note:</strong> Any customizations made to the budget charts, map stops, or travel notes are stored in Supabase and stay in sync across open sessions.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
