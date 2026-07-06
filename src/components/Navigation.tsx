import React, { useEffect, useState } from "react";
import { CalendarDays, Copy, Check, Download, Info, LogOut, Map as MapIcon, BookOpen, NotebookText, Printer, Settings, Share2, User, Wallet, FileText, X, Table } from "lucide-react";
import { createAnimation, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonModal, IonList, IonItem, IonLabel, IonText, IonChip, IonToast } from "@ionic/react";
import { closeOutline, settingsOutline, shareSocialOutline, downloadOutline } from "ionicons/icons";
import type { Session } from "@supabase/supabase-js";
import type { Expense, TripProfile } from "../types";
import { generateImmigrationPdf } from "../utils/generateImmigrationPdf";

const TRIP_COUNTDOWN_TARGET = new Date(2026, 6, 11, 0, 0, 0, 0); // July 11 — countdown ends here
const TRIP_END = new Date(2026, 6, 17, 0, 0, 0, 0);             // July 17 — trip over after this
const HEADER_TITLE = "J&A Malaysia · Singapore Trip 2026";

type CountdownState = { days: number; hours: number; minutes: number; seconds: number; };
const getCountdownState = (): CountdownState => { const d = Math.max(0, TRIP_COUNTDOWN_TARGET.getTime() - Date.now()); const ts = Math.floor(d / 1000); return { days: Math.floor(ts / 86400), hours: Math.floor((ts % 86400) / 3600), minutes: Math.floor((ts % 3600) / 60), seconds: ts % 60 }; };
const isTripOngoing = (date: Date) => date.getTime() >= TRIP_COUNTDOWN_TARGET.getTime() && date.getTime() < TRIP_END.getTime();
const getNextLocalMidnightDelay = () => { const n = new Date(); return Math.max(1000, new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 0, 0).getTime() - n.getTime()); };
const getMoreDrawerElements = (baseEl: HTMLElement) => {
  const root = baseEl.shadowRoot;
  return {
    backdrop: root?.querySelector("ion-backdrop") ?? baseEl,
    wrapper: root?.querySelector(".modal-wrapper") ?? baseEl,
  };
};
const moreDrawerEnterAnimation = (baseEl: HTMLElement) => {
  const { backdrop, wrapper } = getMoreDrawerElements(baseEl);
  const backdropAnimation = createAnimation().addElement(backdrop).fromTo("opacity", "0.01", "var(--backdrop-opacity)");
  const wrapperAnimation = createAnimation().addElement(wrapper).fromTo("transform", "translateX(-100%)", "translateX(0)");

  return createAnimation().addElement(baseEl).easing("cubic-bezier(0.22, 1, 0.36, 1)").duration(260).addAnimation([backdropAnimation, wrapperAnimation]);
};
const moreDrawerLeaveAnimation = (baseEl: HTMLElement) => {
  const { backdrop, wrapper } = getMoreDrawerElements(baseEl);
  const backdropAnimation = createAnimation().addElement(backdrop).fromTo("opacity", "var(--backdrop-opacity)", "0.01");
  const wrapperAnimation = createAnimation().addElement(wrapper).fromTo("transform", "translateX(0)", "translateX(-100%)");

  return createAnimation().addElement(baseEl).easing("cubic-bezier(0.4, 0, 0.2, 1)").duration(190).addAnimation([backdropAnimation, wrapperAnimation]);
};

interface NavigationProps {
  activeTab: string; setActiveTab: (tab: string) => void; session: Session | null; isOnline: boolean;
  onOpenAuth: () => void; onOpenSettings?: () => void; onSignOut: () => void;
  metadata: { title: string; description: string }; expenses?: Expense[]; screenSize: "small" | "large";
  tripProfile?: TripProfile | null;
}
type NavTab = { label: string; path: string; icon?: React.ComponentType<{ size?: number; className?: string }>; showInBottom?: boolean; };
const navItems: NavTab[] = [
  { label: "Itinerary", path: "/", icon: CalendarDays, showInBottom: true }, { label: "Itinerary+", path: "/itinerary-plus", icon: Table, showInBottom: true }, { label: "Budget", path: "/budget", icon: Wallet, showInBottom: true },
  { label: "Map", path: "/map", icon: MapIcon, showInBottom: true }, { label: "Diary", path: "/diary", icon: BookOpen, showInBottom: true }, { label: "Notes", path: "/notes", icon: NotebookText, showInBottom: false },
];

export default function Navigation({ activeTab, setActiveTab, session, isOnline, onOpenAuth, onOpenSettings, onSignOut, metadata, expenses = [], screenSize, tripProfile }: NavigationProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdownState());
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const update = () => { const nc = getCountdownState(); setCountdown(nc); return nc.days === 0 && nc.hours === 0 && nc.minutes === 0 && nc.seconds === 0; };
    if (update()) return;
    let interval: number | undefined;
    const stop = () => { if (interval !== undefined) { window.clearInterval(interval); interval = undefined; } };
    const start = () => { stop(); interval = window.setInterval(() => { if (update()) stop(); }, 1000); };
    const handleVisibility = () => { if (document.hidden) { stop(); } else { if (!update()) start(); } };
    document.addEventListener("visibilitychange", handleVisibility);
    if (!document.hidden) start();
    return () => { stop(); document.removeEventListener("visibilitychange", handleVisibility); };
  }, []);

  useEffect(() => { const to = window.setTimeout(() => setCurrentDate(new Date()), getNextLocalMidnightDelay()); return () => window.clearTimeout(to); }, [currentDate]);
  useEffect(() => { const h = () => setShowMoreDrawer(true); window.addEventListener("open-more-drawer", h); return () => window.removeEventListener("open-more-drawer", h); }, []);

  const copyUrlToClipboard = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setShowCopiedToast(true); setTimeout(() => { setCopied(false); setShowCopiedToast(false); }, 2000); };
  const handlePrint = () => window.print();

  const handleImmigrationDoc = () => generateImmigrationPdf(tripProfile);

  const countdownTime = `${String(countdown.hours).padStart(2, "0")}h ${String(countdown.minutes).padStart(2, "0")}m ${String(countdown.seconds).padStart(2, "0")}s`;
  const shouldShowHolidayBanner = isTripOngoing(currentDate);
  const shouldShowCountdown = !shouldShowHolidayBanner && currentDate.getTime() < TRIP_COUNTDOWN_TARGET.getTime();
  const bottomNavItems = navItems.filter((tab) => tab.showInBottom);
  const bottomNavPaths = bottomNavItems.map((tab) => tab.path);

  useEffect(() => {
    const root = document.documentElement;
    const setNavHeights = () => {
      const mobileHeader = document.querySelector(".ja-nav-mobile:not(.ja-nav-hidden)") as HTMLElement | null;
      const desktopHeader = document.querySelector(".ja-nav-desktop:not(.ja-nav-hidden) .ja-nav-desktop-bar") as HTMLElement | null;

      if (mobileHeader?.offsetHeight) {
        root.style.setProperty("--ja-nav-height-mobile", `${mobileHeader.offsetHeight}px`);
      }

      if (desktopHeader?.offsetHeight) {
        root.style.setProperty("--ja-nav-height-desktop", `${desktopHeader.offsetHeight}px`);
      }
    };

    setNavHeights();
    window.addEventListener("resize", setNavHeights);

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(setNavHeights) : null;
    const observedNodes = [
      document.querySelector(".ja-nav-mobile"),
      document.querySelector(".ja-nav-desktop .ja-nav-desktop-bar"),
    ].filter((node): node is Element => Boolean(node));

    observedNodes.forEach((node) => observer?.observe(node));

    return () => {
      window.removeEventListener("resize", setNavHeights);
      observer?.disconnect();
    };
  }, [screenSize, shouldShowCountdown, shouldShowHolidayBanner]);

  const userMetadata = session?.user.user_metadata as { avatar_url?: string; picture?: string; full_name?: string; name?: string } | undefined;
  const userDisplayName = userMetadata?.full_name ?? userMetadata?.name ?? session?.user.email?.split("@")[0] ?? "Signed in";
  const userEmail = session?.user.email ?? "";
  const userAvatar = userMetadata?.avatar_url ?? userMetadata?.picture ?? null;
  const userInitial = (userDisplayName.trim().charAt(0) || "?").toUpperCase();
  const handleNavigate = (path: string) => { setActiveTab(path); setShowMoreDrawer(false); };

  return (
    <>
      <header className={`ja-nav-mobile${screenSize !== "small" ? " ja-nav-hidden" : ""}`}>
        <div className="ja-nav-mobile-bar">
          <div className="ja-nav-mobile-left">
            <div className="ja-nav-mobile-eyebrow">TRAVEL ITINERARY</div>
            <div className="ja-nav-mobile-title-row">
              <h1 className="ja-nav-mobile-title">
                <span className="ja-nav-mobile-title-inner">
                  <span className="ja-nav-truncate">{HEADER_TITLE}</span>
                  <span className={`ja-nav-dot${isOnline ? " ja-nav-dot-online" : " ja-nav-dot-offline"}`} aria-label={isOnline ? "Online" : "Offline"} title={isOnline ? "Online" : "Offline"} />
                </span>
              </h1>
            </div>
          </div>
          <div className="ja-nav-mobile-actions">
            <IonButton fill="clear" onClick={() => setShowShareModal(true)} className="ja-nav-icon-btn" title="Share Trip"><IonIcon icon={shareSocialOutline} /></IonButton>
            <IonButton fill="clear" onClick={() => setShowDownloadModal(true)} className="ja-nav-icon-btn" title="Download Data"><IonIcon icon={downloadOutline} /></IonButton>
          </div>
        </div>

        {shouldShowHolidayBanner ? (
          <div className="ja-nav-countdown ja-nav-countdown-holiday">
            <div className="ja-nav-holiday-label">Holiday mode</div>
            <div className="ja-nav-holiday-title">Enjoy your holiday</div>
          </div>
        ) : shouldShowCountdown ? (
            <div className="ja-nav-countdown ja-nav-countdown-days">
            <div className="ja-nav-countdown-left"><span className="ja-nav-countdown-num"><span className="ja-nav-countdown-num-value">{countdown.days}</span></span><span className="ja-nav-countdown-unit">DAYS LEFT</span></div>
            <div className="ja-nav-countdown-divider" />
            <div className="ja-nav-countdown-clock">{countdownTime}</div>
          </div>
        ) : null}
      </header>

      <header className={`ja-nav-desktop${screenSize !== "large" ? " ja-nav-hidden" : ""}`}>
        <div className="ja-nav-desktop-bar">
          <div className="ja-nav-desktop-inner">
            <div className="ja-nav-desktop-top-row">
              <div className="ja-nav-desktop-left">
                <div className="ja-nav-desktop-eyebrow">TRAVEL ITINERARY</div>
                <h1 className="ja-nav-desktop-title">
                  <span className="ja-nav-desktop-title-inner">
                    <span className="ja-nav-truncate">{HEADER_TITLE}</span>
                    <span className={`ja-nav-dot${isOnline ? " ja-nav-dot-online" : " ja-nav-dot-offline"}`} aria-label={isOnline ? "Online" : "Offline"} title={isOnline ? "Online" : "Offline"} />
                  </span>
                </h1>
              </div>
              <div className="ja-nav-desktop-actions">
                {session && onOpenSettings ? (
                  <IonButton fill="clear" onClick={onOpenSettings} className="ja-nav-desktop-btn" title="Settings">
                    <Settings size={16} />
                    <span>Settings</span>
                  </IonButton>
                ) : null}
                <IonButton fill="clear" onClick={session ? onSignOut : onOpenAuth} className="ja-nav-desktop-btn" title={session ? "Log out" : "Log in"}>
                  {session ? <LogOut size={16} /> : <User size={16} />}
                  <span>{session ? "Log out" : "Log in"}</span>
                </IonButton>
                <IonButton fill="clear" onClick={() => setShowShareModal(true)} className="ja-nav-icon-btn" title="Share Trip"><IonIcon icon={shareSocialOutline} /></IonButton>
                <IonButton fill="clear" onClick={() => setShowDownloadModal(true)} className="ja-nav-icon-btn" title="Download Data"><IonIcon icon={downloadOutline} /></IonButton>
                <IonButton fill="clear" onClick={handlePrint} className="ja-nav-icon-btn" title="Print Itinerary"><Printer size={16} /></IonButton>
              </div>
            </div>
            <div className="ja-nav-desktop-divider" />
            <nav className="ja-nav-desktop-tabs" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon ?? CalendarDays;
                const isActive = activeTab === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => setActiveTab(item.path)}
                    className={`ja-nav-desktop-tab${isActive ? ' ja-nav-desktop-tab-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            {shouldShowHolidayBanner ? (
              <div className="ja-nav-desktop-countdown ja-nav-countdown-holiday">
                <div className="ja-nav-holiday-label">Holiday mode</div>
                <div className="ja-nav-holiday-title">Enjoy your holiday</div>
              </div>
            ) : shouldShowCountdown ? (
              <div className="ja-nav-desktop-countdown ja-nav-countdown-days">
                <div className="ja-nav-countdown-left"><span className="ja-nav-countdown-num"><span className="ja-nav-countdown-num-value">{countdown.days}</span></span><span className="ja-nav-countdown-unit">DAYS LEFT</span></div>
                <div className="ja-nav-countdown-divider" />
                <div className="ja-nav-countdown-clock">{countdownTime}</div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <IonModal isOpen={showMoreDrawer} onDidDismiss={() => setShowMoreDrawer(false)} className="ja-more-modal" enterAnimation={moreDrawerEnterAnimation} leaveAnimation={moreDrawerLeaveAnimation} style={{ "--width": "100vw", "--max-width": "100vw", "--min-width": "260px", "--height": "85dvh", "--border-radius": "0", "--box-shadow": "8px 0 32px rgba(0,0,0,0.3)", "--backdrop-opacity": "0.5" } as React.CSSProperties}>
        <IonHeader><IonToolbar style={{ "--background": "#1a3a35", "--color": "#ffffff" } as React.CSSProperties}>
          <IonTitle className="ja-nav-more-title">More</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowMoreDrawer(false)} aria-label="Close">
              <X size={20} />
            </IonButton>
          </IonButtons>
        </IonToolbar></IonHeader>
        <IonContent style={{ "--background": "var(--ja-green-800)" } as React.CSSProperties}>
          <IonList className="ja-nav-list">
            {navItems.map((item) => { const Icon = item.icon ?? CalendarDays; const isA = activeTab === item.path; return (
              <IonItem key={item.label} button onClick={() => handleNavigate(item.path)} className={`ja-nav-item${isA ? " ja-nav-item-active" : ""}`}>
                <span slot="start" className={`ja-nav-item-icon${isA ? " ja-nav-item-icon-active" : ""}`}><Icon size={16} /></span>
                <IonLabel className="ja-nav-item-label">{item.label}</IonLabel>
              </IonItem>
            ); })}
          </IonList>
          <div className="ja-nav-more-footer">
            {session && onOpenSettings ? (
              <IonItem button onClick={() => { setShowMoreDrawer(false); onOpenSettings(); }} className="ja-nav-item">
                <span slot="start" className="ja-nav-item-icon"><Settings size={16} /></span>
                <IonLabel className="ja-nav-item-label">Settings</IonLabel>
              </IonItem>
            ) : null}
            {!session ? (
              <IonItem button onClick={() => { setShowMoreDrawer(false); onOpenAuth(); }} className="ja-nav-item">
                <span slot="start" className="ja-nav-item-icon"><User size={16} /></span>
                <IonLabel className="ja-nav-item-label">Login</IonLabel>
              </IonItem>
            ) : (
              <div className="ja-nav-user-card">
                <div className="ja-nav-user-avatar">{userAvatar ? <img src={userAvatar} alt={userDisplayName} className="ja-nav-user-img" referrerPolicy="no-referrer" /> : <span>{userInitial}</span>}</div>
                <div className="ja-nav-user-info"><div className="ja-nav-user-name">{userDisplayName}</div><div className="ja-nav-user-email">{userEmail}</div></div>
                <IonButton fill="clear" onClick={() => { setShowMoreDrawer(false); onSignOut(); }} title="Log out" className="ja-nav-signout-btn"><LogOut size={16} /></IonButton>
              </div>
            )}
          </div>
          <div className="ja-nav-more-version">J&amp;A Trip · 2026</div>
        </IonContent>
      </IonModal>

      <IonModal isOpen={showShareModal} onDidDismiss={() => setShowShareModal(false)} className="ja-share-modal" style={{ "--border-radius": "18px", "--backdrop-opacity": "0.45" } as React.CSSProperties}>
        <IonHeader><IonToolbar style={{ "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties}>
          <IonTitle>Share Travel Itinerary</IonTitle>
          <IonButtons slot="end"><IonButton onClick={() => setShowShareModal(false)}><IonIcon icon={closeOutline} /></IonButton></IonButtons>
        </IonToolbar></IonHeader>
        <IonContent className="ja-nav-share-body" style={{ "--background": "#fafaf9" } as React.CSSProperties}>
          <p className="ja-nav-share-desc">Share Jessie and Amor's exclusive Malaysia itinerary with others. Both web preview and responsive modes are supported.</p>
          <div className="ja-nav-share-card"><div className="ja-nav-share-grid"><div className="ja-nav-share-grid-inner"><div className="ja-nav-share-block" /><div className="ja-nav-share-block ja-nav-share-block-tr" /><div className="ja-nav-share-dot" /><div className="ja-nav-share-block ja-nav-share-block-bl" /><div className="ja-nav-share-fill" /><div className="ja-nav-share-fill ja-nav-share-fill-2" /><div className="ja-nav-share-fill ja-nav-share-fill-3" /><div className="ja-nav-share-fill ja-nav-share-fill-4" /></div></div><span className="ja-nav-share-label">SCAN FOR MOBILE VIEW</span></div>
          <div className="ja-nav-share-copy-row"><input type="text" readOnly value={window.location.href} className="ja-nav-share-input" /><IonButton onClick={copyUrlToClipboard} className="ja-nav-copy-btn">{copied ? <Check size={16} style={{ color: "#88B04B" }} /> : <Copy size={16} />}</IonButton></div>
        </IonContent>
      </IonModal>

      <IonToast isOpen={showCopiedToast} message="Link copied to clipboard!" duration={2000} position="bottom" color="success" onDidDismiss={() => setShowCopiedToast(false)} />

      <IonModal isOpen={showDownloadModal} onDidDismiss={() => setShowDownloadModal(false)} className="ja-download-modal" style={{ "--width": "min(420px, calc(100vw - 32px))", "--max-width": "420px", "--max-height": "calc(100dvh - 64px)", "--border-radius": "18px", "--backdrop-opacity": "0.55" } as React.CSSProperties}>
        <IonHeader><IonToolbar style={{ "--background": "#0B3530", "--color": "#ffffff" } as React.CSSProperties}>
          <IonTitle>Immigration Document</IonTitle>
          <IonButtons slot="end"><IonButton onClick={() => setShowDownloadModal(false)}><IonIcon icon={closeOutline} /></IonButton></IonButtons>
        </IonToolbar></IonHeader>
        <div className="ja-nav-download-body" style={{ background: "#fafaf9", overflowY: "auto", flex: 1 }}>
          <p className="ja-nav-download-desc">Generate a formatted letter for immigration purposes — includes traveler info, flights, hotels, and daily itinerary.</p>
          <IonButton expand="block" onClick={handleImmigrationDoc} className="ja-nav-download-btn" style={{ "--background": "#0B3530", "--background-hover": "#18534C" } as React.CSSProperties}>
            <FileText size={14} style={{ marginRight: 8 }} />Immigration Document (PDF)
          </IonButton>
          <p className="ja-nav-download-footnote">Formatted for immigration — travelers, flights, hotel, itinerary</p>
          <div className="ja-nav-download-info"><Info size={16} className="ja-nav-download-info-icon" /><p className="ja-nav-download-info-text"><strong>Cloud Sync Note:</strong> Any customizations made to the budget charts, map stops, or travel notes are stored in Supabase and stay in sync across open sessions.</p></div>
        </div>
      </IonModal>
    </>
  );
}
