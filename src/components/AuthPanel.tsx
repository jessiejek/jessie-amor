import React, { useEffect } from "react";
import { LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

type ProviderId = "google" | "facebook";

interface AuthPanelProps {
  open: boolean;
  title: string;
  description: string;
  session: Session | null;
  loading?: boolean;
  onClose: () => void;
  onSignIn: (provider: ProviderId) => void;
  onSignOut: () => void;
}

const providers: Array<{
  id: ProviderId;
  label: string;
  note: string;
  badge: string;
}> = [
  { id: "google", label: "Continue with Google", note: "Use your Google account", badge: "G" },
  { id: "facebook", label: "Continue with Facebook", note: "Use your Facebook account", badge: "f" },
];

export default function AuthPanel({
  open,
  title,
  description,
  session,
  loading = false,
  onClose,
  onSignIn,
  onSignOut,
}: AuthPanelProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-800"
          aria-label="Close login modal"
        >
          X
        </button>

        <div className="bg-gradient-to-r from-[#0B3530] to-[#18534C] px-6 py-5 text-white">
          <div className="text-[10px] uppercase tracking-[0.35em] text-[#88B04B] font-mono">Secure Sync</div>
          <h3 className="mt-1 text-lg md:text-xl font-serif font-bold">{title}</h3>
          <p className="mt-1 text-xs md:text-sm text-stone-200 max-w-2xl">{description}</p>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-sans text-stone-600 leading-relaxed">
              Sign in to sync your budget and trip checklist across devices. We keep the trip data private to this itinerary.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => onSignIn(provider.id)}
                disabled={loading}
                className="rounded-xl border border-stone-200 bg-white p-4 text-left transition-all hover:border-[#0B3530] hover:shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B3530] text-sm font-bold text-[#88B04B]">
                    {provider.badge}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-stone-800">{provider.label}</div>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                      {provider.note}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">Account</p>
              {session ? (
                <>
                  <p className="mt-2 text-sm font-semibold text-stone-800">{session.user.email ?? "Signed in"}</p>
                  <p className="mt-1 text-xs text-stone-500">Budget + checklist sync is active.</p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm font-semibold text-stone-800">Not signed in</p>
                  <p className="mt-1 text-xs text-stone-500">Choose Google or Facebook to enable shared cloud sync.</p>
                </>
              )}
            </div>

            <button
              onClick={onSignOut}
              disabled={!session}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition-all hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
