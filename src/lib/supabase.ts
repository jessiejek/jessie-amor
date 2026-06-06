import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseExpenseTable = import.meta.env.VITE_SUPABASE_EXPENSES_TABLE || "budget_expenses";
export const supabaseChecklistTable = import.meta.env.VITE_SUPABASE_CHECKLIST_TABLE || "trip_checklist_items";
export const tripKey = import.meta.env.VITE_TRIP_KEY || "jessie-amor-malaysia-singapore";
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
