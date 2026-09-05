import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatINR, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/Badge';

const PAGE_SIZE = 20;

/** Admin bookings list with status filter + pagination. */
export default async function AdminBookings({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const supabase = createClient();

  let query = supabase
    .from('bookings')
    .select('id, reference, lead_name, departure_date, total_amount, status, payment_status, is_demo', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (searchParams.status) query = query.eq('status', searchParams.status);
  const { data, count } = await query;
  const bookings = data ?? [];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const statuses = ['', 'new', 'awaiting_confirmation', 'confirmed', 'partially_paid', 'fully_paid', 'cancelled', 'completed'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-maroon-900">Bookings {count != null && <span className="text-base text-maroon-400">({count})</span>}</h1>
        <a href="/api/admin/export-bookings" className="btn-secondary">Export CSV</a>
      </div>

      <form className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link key={s || 'all'} href={`/admin/bookings${s ? `?status=${s}` : ''}`}
            className={`badge ${searchParams.status === s || (!searchParams.status && !s) ? 'bg-saffron-600 text-white' : 'bg-white text-maroon-600'}`}>
            {s ? s.replace('_', ' ') : 'All'}
          </Link>
        ))}
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-maroon-50 text-left text-maroon-500">
            <tr><th className="p-3">Reference</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-maroon-100 hover:bg-maroon-50/50">
                <td className="p-3">
                  <Link href={`/admin/bookings/${b.id}`} className="font-medium text-saffron-700 hover:underline">{b.reference}</Link>
                  {b.is_demo && <span className="badge ml-2 bg-purple-100 text-purple-700">DEMO</span>}
                </td>
                <td>{b.lead_name}</td>
                <td>{b.departure_date ? formatDate(b.departure_date) : '—'}</td>
                <td>{formatINR(b.total_amount)}</td>
                <td><StatusBadge status={b.status} /></td>
                <td><StatusBadge status={b.payment_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/admin/bookings?${searchParams.status ? `status=${searchParams.status}&` : ''}page=${p}`}
              className={`badge ${p === page ? 'bg-saffron-600 text-white' : 'bg-white text-maroon-600'}`}>{p}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
