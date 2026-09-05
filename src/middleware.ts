import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/** Refresh auth session + guard protected routes on every matched request. */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except static assets and images.
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
