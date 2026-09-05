import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isStaff } from '@/lib/auth';

/** Export bookings to CSV. Staff-only (server-checked). */
export async function GET() {
  if (!(await isStaff())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const supabase = createClient();
  const { data } = await supabase
    .from('bookings')
    .select('reference, lead_name, lead_email, lead_phone, departure_date, adults, children, total_amount, paid_amount, status, payment_status, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const rows = data ?? [];
  const headers = Object.keys(rows[0] ?? { reference: '' });
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(',')),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="devyatra-bookings-${Date.now()}.csv"`,
    },
  });
}
