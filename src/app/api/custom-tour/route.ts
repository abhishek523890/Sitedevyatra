import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { customTourSchema } from '@/lib/validation/schemas';
import { rateLimit, clientIp } from '@/lib/utils/rateLimit';

export async function POST(req: Request) {
  if (!rateLimit(`custom:${clientIp(req)}`)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }
  const ct = req.headers.get('content-type') ?? '';
  const raw = ct.includes('application/json')
    ? await req.json()
    : Object.fromEntries((await req.formData()).entries());

  const parsed = customTourSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const admin = createAdminClient();
  await admin.from('custom_tour_requests').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    destinations: parsed.data.destinations || null,
    travellers: parsed.data.travellers ?? null,
    preferred_date: parsed.data.preferredDate || null,
    duration_days: parsed.data.durationDays ?? null,
    budget: parsed.data.budget ?? null,
    requirements: parsed.data.requirements || null,
  });

  if (!ct.includes('application/json')) {
    return NextResponse.redirect(new URL('/custom-tour?sent=1', req.url), 303);
  }
  return NextResponse.json({ ok: true });
}
