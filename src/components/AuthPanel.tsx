import React from "react";
import type { Session } from "@supabase/supabase-js";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner,
} from "@ionic/react";
import { logOutOutline, closeOutline } from "ionicons/icons";

type ProviderId = "google" | "facebook" | "github";

interface AuthPanelProps {
  open: boolean;
  title: string;
  description: string;
  session: Session | null;
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSignIn: (provider: ProviderId) => void;
  onSignOut: () => void;
  isConfigured?: boolean;
}

const providers: Array<{
  id: ProviderId;
  label: string;
  note: string;
  badge: string;
}> = [
  { id: "google", label: "Continue with Google", note: "Use your Google account", badge: "G" },
  { id: "github", label: "Continue with GitHub", note: "Use your GitHub account", badge: "GH" },
  { id: "facebook", label: "Continue with Facebook", note: "Use your Facebook account", badge: "f" },
];

const brandToolbar = {
  "--background": "#0B3530",
  "--color": "#ffffff",
} as React.CSSProperties;

export default function AuthPanel({
  open,
  title,
  description,
  session,
  loading = false,
  errorMessage = "",
  onClose,
  onSignIn,
  onSignOut,
  isConfigured = true,
}: AuthPanelProps) {
  return (
    <IonModal isOpen={open} onDidDismiss={onClose} className="ja-auth-modal">
      <IonHeader>
        <IonToolbar style={brandToolbar}>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} aria-label="Close login modal">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <div
          className="px-4 pb-4 pt-1"
          style={{ background: "#0B3530", color: "rgba(255,255,255,0.8)" }}
        >
          <p className="text-[14px] leading-relaxed">{description}</p>
        </div>
      </IonHeader>

      <IonContent className="ion-padding" style={{ "--background": "#fafaf9" } as React.CSSProperties}>
        {loading && (
          <div className="flex justify-center py-8">
            <IonSpinner name="crescent" />
          </div>
        )}

        {!loading && (
          <>
            {errorMessage ? (
              <IonCard className="ja-auth-error-card" style={{ margin: "0 0 16px" }}>
                <IonCardContent>
                  <IonText color="danger">
                    <p className="font-semibold text-[14px]">{errorMessage}</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            ) : null}

            <IonCard style={{ margin: "0 0 16px" }}>
              <IonCardContent>
                <p className="text-[14px] leading-relaxed text-stone-600">
                  Sign in to sync your budget and trip checklist across devices. We keep the trip data private to this itinerary.
                </p>
              </IonCardContent>
            </IonCard>

            {!isConfigured && (
              <IonCard
                className="ja-auth-config-card"
                style={{
                  margin: "0 0 16px",
                  "--border-color": "#fde68a",
                } as React.CSSProperties}
              >
                <IonCardContent>
                  <p className="text-[14px] font-semibold text-amber-900">Login is not configured on this deployment yet.</p>
                  <p className="mt-1 text-[14px] text-amber-800">
                    The app needs Supabase environment variables in Vercel before Google/Facebook sign-in can work.
                  </p>
                </IonCardContent>
              </IonCard>
            )}

            <IonList className="ja-auth-provider-list" style={{ margin: "0 0 16px" }}>
              {providers.map((provider) => (
                <IonItem
                  key={provider.id}
                  button
                  disabled={loading || !isConfigured}
                  onClick={() => onSignIn(provider.id)}
                  className="ja-auth-provider-item"
                  detail={false}
                >
                  <div
                    slot="start"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: "#0B3530", color: "#88B04B" }}
                  >
                    {provider.badge}
                  </div>
                  <IonLabel>
                    <div className="text-[15px] font-semibold text-stone-800">{provider.label}</div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                      {provider.note}
                    </p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>

            <IonCard style={{ margin: "0 0 16px" }}>
              <IonCardContent>
                <div className="mb-3">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-stone-400">Account</p>
                  {session ? (
                    <>
                      <p className="mt-1 text-[15px] font-semibold text-stone-800">{session.user.email ?? "Signed in"}</p>
                      <p className="text-[14px] text-stone-500">Budget + checklist sync is active.</p>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-[15px] font-semibold text-stone-800">Not signed in</p>
                      <p className="text-[14px] text-stone-500">Choose Google, GitHub, or Facebook to enable shared cloud sync.</p>
                    </>
                  )}
                </div>

                <IonButton
                  expand="block"
                  fill="outline"
                  disabled={!session || !isConfigured}
                  onClick={onSignOut}
                  color="danger"
                  className="ja-auth-sign-out"
                >
                  <IonIcon slot="start" icon={logOutOutline} />
                  Sign out
                </IonButton>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonModal>
  );
}
