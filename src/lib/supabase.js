import { createClient } from '@supabase/supabase-js';

// import.meta.env works in both Vite client and SSR contexts.
// Anon/publishable keys are intentionally public — safe as fallbacks.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://uxppkdmsfmbzerrddgab.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_SrBjqkycKZ9SKWWGgzKk2A_1ymiXpJy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
