// Validate required environment variables at import time
// This file should be imported in server-side code that needs env vars

export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnv(key: string): string | undefined {
  return process.env[key] || undefined;
}

// Validate Supabase config exists
export function validateSupabaseConfig() {
  return {
    url: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}
