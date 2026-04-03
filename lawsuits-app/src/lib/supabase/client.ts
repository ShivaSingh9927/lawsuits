import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a lazy-initialized browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

// Client-side browser client
export function createClient() {
  if (!browserClient && supabaseUrl && supabaseAnonKey) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  if (!browserClient) {
    throw new Error("Supabase not configured");
  }
  return browserClient as ReturnType<typeof createBrowserClient>;
}

// Export a proxy for backward compatibility
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = createClient();
    return (client as Record<string, unknown>)[prop as string];
  },
});

// Server-side admin client (for API routes)
export function createAdminClient() {
  if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin client not configured");
  }
  return createSupabaseClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
}
