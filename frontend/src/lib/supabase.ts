import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Direct Supabase browser client.
 * Returns null if credentials are not provided, allowing smooth fallback to the FastAPI backend.
 */
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-"))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
