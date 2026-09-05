import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { newsletterSchema } from '@/lib/validation/schemas';
import { rateLimit, clientIp } from '@/lib/utils/rateLimit';

export async function POST(req: Request) {
  if (!rateLimit(`news:${clientIp(req)}`)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }
  const ct = req.headers.get('content-type') ?? '';
  const raw = ct.includes('application/json')
    ? await req.json()
    : Object.fromEntries((await req.formData()).entries());
  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

  const admin = createAdminClient();
  await admin.from('newsletter_subscribers').upsert({ email: parsed.data.email }, { onConflict: 'email' });

  if (!ct.includes('application/json')) {
    return NextResponse.redirect(new URL('/?subscribed=1', req.url), 303);
  }
  return NextResponse.json({ ok: true });
}
