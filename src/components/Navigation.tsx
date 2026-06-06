import React, { useState } from "react";
import { Share2, Download, Printer, Copy, Check, Info, Heart } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metadata: {
    title: string;
    description: string;
    sub: string;
    rate: string;
  };
}

export default function Navigation({ activeTab, setActiveTab, metadata }: NavigationProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0B3530] text-stone-100 px-4 md:px-8 py-4 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Logo / Trip title */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#88B04B] font-mono leading-none">
              TRAVEL ITINERARY
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-semibold text-white tracking-tight mt-1 flex items-center gap-2">
              {metadata.title}
              <span className="text-[12px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#18534C] text-[#88B04B]">
                2024
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-300 mt-1 font-sans">
              <span>{metadata.sub}</span>
              <span className="text-stone-400">•</span>
              <span className="font-mono text-stone-200">{metadata.rate}</span>
            </div>
          </div>

          {/* Navigation Links and Utility Icons */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 self-stretch md:self-auto justify-between md:justify-end">
            <nav className="flex items-center gap-1 md:gap-2">
              {["Itinerary", "Budget", "Map", "Notes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-[#18534C] text-white border-b-2 border-[#88B04B]"
                      : "text-stone-300 hover:text-white hover:bg-[#18534C]/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 border-l border-[#18534C] pl-4">
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
              ✕
            </button>
            <h3 className="text-lg font-serif font-bold text-[#0B3530] mb-2">Share Travel Itinerary</h3>
            <p className="text-xs text-stone-500 mb-4 font-sans">
              Share Jessie and Amor's exclusive Malaysia itinerary with others. Both web preview and responsive modes are supported.
            </p>

            {/* Simulated QR Code */}
            <div className="bg-[#F7F9FA] rounded-lg p-4 flex flex-col items-center justify-center mb-4 border border-stone-100">
              <div className="w-32 h-32 bg-[#0B3530] rounded-md p-2 flex flex-wrap gap-1 relative overflow-hidden">
                {/* Decorative QR-like design pattern */}
                <div className="absolute inset-2 bg-white rounded flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 text-[#0B3530]">
                    <div className="border-2 border-[#0B3530] h-6 w-6"></div>
                    <div className="border-2 border-[#0B3530] h-6 w-6 col-start-5"></div>
                    <div className="bg-[#0B3530] h-2 w-2 rounded-full col-start-3 row-start-3"></div>
                    <div className="border-2 border-[#0B3530] h-6 w-6 col-start-1 row-start-5"></div>
                    {/* Tiny dots */}
                    <div className="bg-[#0b3530] rounded-sm col-start-2 row-start-2"></div>
                    <div className="bg-[#0b3530] rounded-sm col-start-4 row-start-2"></div>
                    <div className="bg-[#0b3530] rounded-sm col-start-3 row-start-4"></div>
                    <div className="bg-[#0b3530] rounded-sm col-start-5 row-start-4"></div>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-stone-400 mt-2">SCAN FOR MOBILE VIEW</span>
            </div>

            {/* Copy link input */}
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
              ✕
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
                <strong>Dynamic Storage Note:</strong> Any customizations made to the budget charts or travel notes are stored locally inside your browser and can be exported at any time.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
