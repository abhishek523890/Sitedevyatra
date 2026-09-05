import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatINR } from '@/lib/utils/format';

/** Admin package management list (create/edit forms would extend from here). */
export default async function AdminPackages() {
  const supabase = createClient();
  const { data } = await supabase.from('packages').select('id, name, slug, status, base_price, is_featured').is('deleted_at', null).order('created_at', { ascending: false });
  const packages = data ?? [];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-maroon-900">Packages ({packages.length})</h1>
        <button className="btn-primary" disabled title="Wire to a create form">+ New package</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-maroon-50 text-left text-maroon-500"><tr><th className="p-3">Name</th><th>Status</th><th>Price</th><th>Featured</th><th>View</th></tr></thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id} className="border-t border-maroon-100">
                <td className="p-3 font-medium text-maroon-900">{p.name}</td>
                <td><span className="badge bg-maroon-50 capitalize text-maroon-700">{p.status}</span></td>
                <td>{formatINR(p.base_price)}</td>
                <td>{p.is_featured ? '⭐' : '—'}</td>
                <td><Link href={`/packages/${p.slug}`} className="text-saffron-700 hover:underline">Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-maroon-400">
        Create/edit/duplicate/publish forms plug in here. Package writes are guarded by RLS
        (staff-only) and should also record an audit log entry.
      </p>
    </div>
  );
}
