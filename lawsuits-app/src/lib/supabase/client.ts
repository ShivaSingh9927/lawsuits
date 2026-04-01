import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a lazy-initialized browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function getClient() {
  if (!browserClient && supabaseUrl && supabaseAnonKey) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  if (!browserClient) {
    throw new Error("Supabase not configured");
  }
  return browserClient;
}

// Export a proxy that lazily initializes the client
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = getClient();
    return (client as Record<string, unknown>)[prop as string];
  },
});

// Server-side admin client (for API routes)
export function createAdminClient() {
  if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin client not configured");
  }
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
}
