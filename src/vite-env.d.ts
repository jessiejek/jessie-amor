/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_EXPENSES_TABLE: string;
  readonly VITE_SUPABASE_CHECKLIST_TABLE: string;
  readonly VITE_SUPABASE_MAP_TABLE: string;
  readonly VITE_SUPABASE_MAP_DESTINATIONS_TABLE: string;
  readonly VITE_SUPABASE_NOTES_TABLE: string;
  readonly VITE_SUPABASE_DIARY_TABLE: string;
  readonly VITE_SUPABASE_DIARY_BUCKET: string;
  readonly VITE_SUPABASE_RECEIPT_BUCKET: string;
  readonly VITE_SUPABASE_BUDGET_SETTINGS_TABLE: string;
  readonly VITE_SUPABASE_SETTINGS_TABLE: string;
  readonly VITE_SUPABASE_TRIP_PROFILE_TABLE: string;
  readonly VITE_TRIP_KEY: string;
  readonly GEMINI_API_KEY?: string;
  readonly APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:pwa-register" {
  import type { RegisterSWOptions } from "vite-plugin-pwa/types";

  export type { RegisterSWOptions };
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
