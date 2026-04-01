import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!browserClient && supabaseUrl && supabaseAnonKey) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export const supabase = {
  auth: {
    signInWithPassword: async (params: Parameters<ReturnType<typeof createBrowserClient>["auth"]["signInWithPassword"]>[0]) => {
      const client = getSupabase();
      if (!client) throw new Error("Supabase not configured");
      return client.auth.signInWithPassword(params);
    },
    signUp: async (params: Parameters<ReturnType<typeof createBrowserClient>["auth"]["signUp"]>[0]) => {
      const client = getSupabase();
      if (!client) throw new Error("Supabase not configured");
      return client.auth.signUp(params);
    },
    signInWithOAuth: async (params: Parameters<ReturnType<typeof createBrowserClient>["auth"]["signInWithOAuth"]>[0]) => {
      const client = getSupabase();
      if (!client) throw new Error("Supabase not configured");
      return client.auth.signInWithOAuth(params);
    },
    signOut: async () => {
      const client = getSupabase();
      if (!client) throw new Error("Supabase not configured");
      return client.auth.signOut();
    },
    getUser: async () => {
      const client = getSupabase();
      if (!client) return { data: { user: null }, error: null };
      return client.auth.getUser();
    },
  },
};

// Server-side admin client (for API routes)
export function createAdminClient() {
  if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin client not configured");
  }
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
}
