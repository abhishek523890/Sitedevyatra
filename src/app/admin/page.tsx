import { createClient } from '@/lib/supabase/server';
import { formatINR } from '@/lib/utils/format';

/**
 * Executive dashboard.
 * IMPORTANT: "Booking value" (gross of all non-cancelled bookings) is shown
 * SEPARATELY from "Amount collected" (actual payments). Unpaid/cancelled value
 * is never labelled as revenue.
 */
export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select('status, payment_status, total_amount, paid_amount, adults, children')
    .is('deleted_at', null);

  const rows = bookings ?? [];
  const active = rows.filter((b) => b.status !== 'cancelled');
  const kpis = {
    total: rows.length,
    newB: rows.filter((b) => b.status === 'new' || b.status === 'awaiting_confirmation').length,
    confirmed: rows.filter((b) => b.status === 'confirmed').length,
    cancelled: rows.filter((b) => b.status === 'cancelled').length,
    bookingValue: active.reduce((s, b) => s + Number(b.total_amount), 0),
    collected: rows.reduce((s, b) => s + Number(b.paid_amount), 0),
    travellers: rows.reduce((s, b) => s + b.adults + b.children, 0),
  };
  const outstanding = kpis.bookingValue - kpis.collected;
  const avg = active.length ? kpis.bookingValue / active.length : 0;

  const cards = [
    ['Total bookings', String(kpis.total), 'bg-white'],
    ['New / awaiting', String(kpis.newB), 'bg-amber-50'],
    ['Confirmed', String(kpis.confirmed), 'bg-emerald-50'],
    ['Cancelled', String(kpis.cancelled), 'bg-red-50'],
    ['Booking value (gross)', formatINR(kpis.bookingValue), 'bg-white'],
    ['Amount collected', formatINR(kpis.collected), 'bg-white'],
    ['Outstanding', formatINR(outstanding), 'bg-white'],
    ['Avg booking value', formatINR(avg), 'bg-white'],
    ['Total travellers', String(kpis.travellers), 'bg-white'],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-maroon-900">Dashboard</h1>
      <p className="rounded-lg bg-white p-3 text-xs text-maroon-500">
        Note: <b>Booking value</b> is the gross total of active bookings (including unpaid) and is
        <b> not</b> the same as revenue. <b>Amount collected</b> reflects actual recorded payments.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, bg]) => (
          <div key={label} className={`card p-5 ${bg}`}>
            <p className="text-xs text-maroon-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-maroon-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
