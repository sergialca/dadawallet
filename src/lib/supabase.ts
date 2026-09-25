import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

function supabaseProjectUrl() {
  const raw = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) {
    return null;
  }

  return raw.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

function supabaseAnonKey() {
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return key || null;
}

export function getSupabase() {
  if (client !== undefined) {
    return client;
  }

  const url = supabaseProjectUrl();
  const anonKey = supabaseAnonKey();
  client = url && anonKey ? createClient(url, anonKey) : null;
  return client;
}
