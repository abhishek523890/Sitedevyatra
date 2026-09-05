/**
 * Server Supabase client bound to the request cookies (respects RLS as the user).
 * Use in Server Components, Route Handlers and Server Actions.
 *
 * NOTE: `cookiesToSet` is explicitly typed (see middleware.ts for why) to avoid
 * TS7006 "implicitly has an 'any' type" under strict-mode builds.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicEnv } from '@/lib/env';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render - safe to ignore; middleware refreshes.
          }
        },
      },
    },
  );
}
