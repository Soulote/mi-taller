import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function requireEnvVar(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY") {
  const value = import.meta.env[name];

  if (!value) {
    const message = `Falta la variable de entorno ${name}.`;
    console.error("[supabase] missing environment variable", { name });
    throw new Error(message);
  }

  return value;
}

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const supabaseUrl = requireEnvVar("VITE_SUPABASE_URL");
  const supabaseAnonKey = requireEnvVar("VITE_SUPABASE_ANON_KEY");

  browserClient = createClient(supabaseUrl, supabaseAnonKey);

  return browserClient;
}
