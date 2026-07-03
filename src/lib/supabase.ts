import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseExpenseTable = import.meta.env.VITE_SUPABASE_EXPENSES_TABLE || "budget_expenses";
export const supabaseChecklistTable = import.meta.env.VITE_SUPABASE_CHECKLIST_TABLE || "trip_checklist_items";
export const supabaseMapTable = import.meta.env.VITE_SUPABASE_MAP_TABLE || "trip_map_itineraries";
export const supabaseMapDestinationsTable = import.meta.env.VITE_SUPABASE_MAP_DESTINATIONS_TABLE || "trip_map_destinations";
export const supabaseNotesTable = import.meta.env.VITE_SUPABASE_NOTES_TABLE || "trip_scratch_notes";
export const supabaseDiaryTable = import.meta.env.VITE_SUPABASE_DIARY_TABLE || "trip_diary_entries";
export const supabaseDiaryBucket = import.meta.env.VITE_SUPABASE_DIARY_BUCKET || "trip-diary-photos";
export const supabaseReceiptBucket = import.meta.env.VITE_SUPABASE_RECEIPT_BUCKET || "trip-receipt-photos";
export const supabaseBudgetSettingsTable = import.meta.env.VITE_SUPABASE_BUDGET_SETTINGS_TABLE || "trip_settings";
export const supabaseSettingsTable = import.meta.env.VITE_SUPABASE_SETTINGS_TABLE || "user_trip_settings";
export const supabaseTripProfileTable = import.meta.env.VITE_SUPABASE_TRIP_PROFILE_TABLE || "trip_profile";
export const tripKey = import.meta.env.VITE_TRIP_KEY || "jessie-amor-malaysia-singapore";
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
