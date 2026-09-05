import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { formatINR, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/Badge';

export default async function BookingDetail({ params }: { params: { ref: string } }) {
  const user = await getCurrentUser();
  const supabase = createClient();
  // RLS ensures a user can only read their own booking.
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('reference', params.ref)
    .maybeSingle();
  if (!booking || booking.user_id !== user!.id) notFound();

  const { data: travellers } = await supabase
    .from('booking_travellers').select('*').eq('booking_id', booking.id);
  const { data: payments } = await supabase
    .from('payments').select('*').eq('booking_id', booking.id).order('created_at');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-maroon-900">{booking.reference}</h1>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-3 text-lg text-maroon-900">Trip details</h2>
          <dl className="space-y-2 text-sm">
            <Row k="Travel date" v={booking.departure_date ? formatDate(booking.departure_date) : 'Open date'} />
            <Row k="Travellers" v={`${booking.adults} adult(s), ${booking.children} child(ren)`} />
            <Row k="Rooms" v={String(booking.rooms)} />
            <Row k="Lead traveller" v={booking.lead_name} />
            <Row k="Phone" v={booking.lead_phone} />
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="mb-3 text-lg text-maroon-900">Payment summary</h2>
          <dl className="space-y-2 text-sm">
            <Row k="Package amount" v={formatINR(booking.package_amount)} />
            <Row k="Room charges" v={formatINR(booking.room_charges)} />
            <Row k="Discount" v={formatINR(booking.discount_amount)} />
            <Row k="Tax" v={formatINR(booking.tax_amount)} />
            <Row k="Total" v={formatINR(booking.total_amount)} strong />
            <Row k="Paid" v={formatINR(booking.paid_amount)} />
            <div className="flex items-center justify-between pt-1">
              <span className="text-maroon-500">Payment status</span>
              <StatusBadge status={booking.payment_status} />
            </div>
          </dl>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-3 text-lg text-maroon-900">Travellers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-maroon-400"><th className="py-2">Name</th><th>Age</th><th>ID Type</th></tr></thead>
            <tbody>
              {(travellers ?? []).map((t) => (
                <tr key={t.id} className="border-t border-maroon-100"><td className="py-2">{t.full_name}</td><td>{t.age ?? '—'}</td><td>{t.id_type ?? '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-maroon-400">
        Need changes or a cancellation? Contact support from the Profile page or WhatsApp — our team will assist.
      </p>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return <div className="flex justify-between"><dt className="text-maroon-500">{k}</dt><dd className={strong ? 'font-bold text-saffron-700' : 'font-medium text-maroon-900'}>{v}</dd></div>;
}
