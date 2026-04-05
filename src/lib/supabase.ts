import { createClient } from '@supabase/supabase-js';

// These variables are automatically injected when you add the Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Please click 'Add Supabase' to connect your database.");
}

// We use a fallback empty string to prevent the library from throwing a hard error during initialization
// but the app will require these to be set to function correctly.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');