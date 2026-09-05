import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', req.url), 303);
  const form = Object.fromEntries((await req.formData()).entries());
  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: String(form.full_name ?? ''),
    phone: String(form.phone ?? ''),
    city: String(form.city ?? ''),
    state: String(form.state ?? ''),
    address: String(form.address ?? ''),
  });
  return NextResponse.redirect(new URL('/dashboard/profile?saved=1', req.url), 303);
}
