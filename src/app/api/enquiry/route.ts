import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enquirySchema } from '@/lib/validation/schemas';
import { rateLimit, clientIp } from '@/lib/utils/rateLimit';

/** Public enquiry submission. Accepts form-encoded or JSON. */
export async function POST(req: Request) {
  if (!rateLimit(`enquiry:${clientIp(req)}`)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
  }
  const ct = req.headers.get('content-type') ?? '';
  const raw = ct.includes('application/json')
    ? await req.json()
    : Object.fromEntries((await req.formData()).entries());

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  // TODO: verify parsed.data.captchaToken with your CAPTCHA provider here.

  const admin = createAdminClient();
  await admin.from('enquiries').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  // Redirect back for form posts; JSON for fetch callers.
  if (!ct.includes('application/json')) {
    return NextResponse.redirect(new URL('/contact?sent=1', req.url), 303);
  }
  return NextResponse.json({ ok: true });
}
