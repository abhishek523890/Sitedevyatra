/**
 * Minimal in-memory rate limiter for public form endpoints.
 * NOTE: resets on redeploy and is per-instance. For production scale,
 * back this with Upstash Redis or Vercel KV.
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  return xf?.split(',')[0]?.trim() || 'unknown';
}
