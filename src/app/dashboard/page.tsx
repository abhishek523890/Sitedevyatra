import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { formatINR, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function DashboardHome() {
  const user = await getCurrentUser();
  const supabase = createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select('reference, departure_date, total_amount, status, payment_status, created_at')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5);

  const list = bookings ?? [];
  const totalValue = list.reduce((s, b) => s + Number(b.total_amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-maroon-900">Namaste 🙏</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {[['Bookings', String(list.length)], ['Recent value', formatINR(totalValue)], ['Account', user!.email ?? '']].map(([a, b]) => (
          <div key={a} className="card p-5"><p className="text-xs text-maroon-400">{a}</p><p className="mt-1 truncate text-lg font-semibold text-maroon-900">{b}</p></div>
        ))}
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-maroon-900">Recent bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm text-saffron-700 hover:underline">View all</Link>
        </div>
        {list.length === 0 ? (
          <EmptyState title="No bookings yet" message="Your yatra bookings will appear here." />
        ) : (
          <div className="space-y-3">
            {list.map((b) => (
              <Link key={b.reference} href={`/dashboard/bookings/${b.reference}`} className="flex items-center justify-between rounded-xl border border-maroon-100 p-4 hover:border-saffron-300">
                <div>
                  <p className="font-medium text-maroon-900">{b.reference}</p>
                  <p className="text-xs text-maroon-500">{b.departure_date ? formatDate(b.departure_date) : 'Open date'} · {formatINR(b.total_amount)}</p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
