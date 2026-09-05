import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { formatINR, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function MyBookings() {
  const user = await getCurrentUser();
  const supabase = createClient();
  const { data } = await supabase
    .from('bookings')
    .select('reference, departure_date, adults, children, total_amount, status, payment_status')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  const bookings = data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-maroon-900">My Bookings</h1>
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" message="Browse packages to plan your first yatra." />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link key={b.reference} href={`/dashboard/bookings/${b.reference}`} className="card-hover flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-maroon-900">{b.reference}</p>
                <p className="text-sm text-maroon-500">
                  {b.departure_date ? formatDate(b.departure_date) : 'Open date'} · {b.adults} adult(s), {b.children} child(ren)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-saffron-700">{formatINR(b.total_amount)}</span>
                <StatusBadge status={b.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
