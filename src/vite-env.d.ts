/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_EXPENSES_TABLE: string;
  readonly VITE_SUPABASE_CHECKLIST_TABLE: string;
  readonly VITE_SUPABASE_MAP_TABLE: string;
  readonly VITE_SUPABASE_NOTES_TABLE: string;
  readonly VITE_SUPABASE_DIARY_TABLE: string;
  readonly VITE_SUPABASE_DIARY_BUCKET: string;
  readonly VITE_TRIP_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:pwa-register" {
  import type { RegisterSWOptions } from "vite-plugin-pwa/types";

  export type { RegisterSWOptions };
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
