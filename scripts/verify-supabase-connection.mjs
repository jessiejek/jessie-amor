// Verify Supabase connection and auth flow using loaded .env.local
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load .env.local (Vite-style)
const envPath = resolve(root, '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL present:', Boolean(supabaseUrl));
console.log('Supabase anon key present:', Boolean(supabaseAnonKey));
console.log('URL format check:', supabaseUrl?.startsWith('https://') ? 'valid https' : 'invalid or missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('FAIL: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Get session (should show no session since we're not logged in)
const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
console.log('Session test:', sessionError ? 'ERROR: ' + sessionError.message : sessionData?.session ? 'Session exists' : 'No session (expected)');

// Test 2: Generate OAuth URL (don't actually sign in, just verify the URL is valid)
const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:4173/',
  },
});
console.log('OAuth URL generation:', oauthError ? 'ERROR: ' + oauthError.message : 'SUCCESS - URL received');
if (oauthData?.url) {
  console.log('OAuth URL starts with:', oauthData.url.substring(0, 80) + '...');
  console.log('Contains accounts.google.com:', oauthData.url.includes('accounts.google.com'));
  console.log('Contains supabase project:', oauthData.url.includes(supabaseUrl.replace('https://', '').split('.')[0]));
}

// Test 3: Verify the project is accessible
const { data: healthData, error: healthError } = await supabase.from('trip_checklist_items').select('count').limit(0).maybeSingle();
console.log('Table access test:', healthError ? 'Connection works but table may not exist: ' + healthError.message : 'Table exists and accessible');

// Test 4: Check all expected tables
const expectedTables = [
  'budget_expenses',
  'trip_checklist_items',
  'trip_map_itineraries',
  'trip_map_destinations',
  'trip_scratch_notes',
  'trip_diary_entries',
  'trip_settings',
  'user_trip_settings',
];
for (const table of expectedTables) {
  const { error } = await supabase.from(table).select('id').limit(1).maybeSingle();
  if (error && error.code === 'PGRST116') {
    console.log(`Table "${table}": exists (query returned no rows)`);
  } else if (error) {
    console.log(`Table "${table}": ${error.code} - ${error.message}`);
  } else {
    console.log(`Table "${table}": exists and has data`);
  }
}

console.log('\n=== Connection verification complete ===');
