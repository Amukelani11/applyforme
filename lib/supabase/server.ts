import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createGenericClient } from '@supabase/supabase-js';
import { createCookieHandler } from './cookie-handler'

export async function createClient() {
  // Create a server's supabase client with newly configured cookie, this client
  // is safe to use only on server side operations.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: createCookieHandler(),
    }
  )
}

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  return createGenericClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
} 