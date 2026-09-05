import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatINR, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/Badge';
import { BookingActions } from '@/components/admin/BookingActions';

export default async function AdminBookingDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: booking } = await supabase.from('bookings').select('*').eq('id', params.id).maybeSingle();
  if (!booking) notFound();
  const { data: travellers } = await supabase.from('booking_travellers').select('*').eq('booking_id', booking.id);
  const { data: history } = await supabase.from('booking_status_history').select('*').eq('booking_id', booking.id).order('created_at');
  const { data: payments } = await supabase.from('payments').select('*').eq('booking_id', booking.id).order('created_at');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-maroon-900">{booking.reference}</h1>
          <p className="text-sm text-maroon-500">{booking.lead_name} · {booking.lead_email} · {booking.lead_phone}</p>
        </div>
        <div className="flex gap-2"><StatusBadge status={booking.status} /><StatusBadge status={booking.payment_status} /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-3 text-lg text-maroon-900">Trip & pricing</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <Row k="Travel date" v={booking.departure_date ? formatDate(booking.departure_date) : 'Open date'} />
              <Row k="Travellers" v={`${booking.adults} + ${booking.children}`} />
              <Row k="Total" v={formatINR(booking.total_amount)} />
              <Row k="Paid" v={formatINR(booking.paid_amount)} />
              <Row k="Tax" v={formatINR(booking.tax_amount)} />
              <Row k="Discount" v={formatINR(booking.discount_amount)} />
            </dl>
            {booking.special_requirements && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">📝 {booking.special_requirements}</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="mb-3 text-lg text-maroon-900">Travellers</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-maroon-400"><th className="py-1">Name</th><th>Age</th><th>Assist</th></tr></thead>
              <tbody>{(travellers ?? []).map((t) => (
                <tr key={t.id} className="border-t border-maroon-100"><td className="py-1">{t.full_name}</td><td>{t.age ?? '—'}</td><td>{t.needs_assistance ? '✅' : '—'}</td></tr>
              ))}</tbody>
            </table>
          </div>

          <div className="card p-6">
            <h2 className="mb-3 text-lg text-maroon-900">Status history</h2>
            <ul className="space-y-2 text-sm text-maroon-600">
              {(history ?? []).map((h) => (
                <li key={h.id} className="flex justify-between border-b border-maroon-50 pb-1">
                  <span>{h.from_status ?? '—'} → <b>{h.to_status}</b> {h.note && `· ${h.note}`}</span>
                  <span className="text-maroon-400">{formatDate(h.created_at)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action panel (client component -> server actions) */}
        <BookingActions bookingId={booking.id} currentStatus={booking.status} />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div><dt className="text-xs text-maroon-400">{k}</dt><dd className="font-medium text-maroon-900">{v}</dd></div>;
}
