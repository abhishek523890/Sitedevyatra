import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';

export default async function AdminEnquiries() {
  const supabase = createClient();
  const [{ data: enquiries }, { data: custom }] = await Promise.all([
    supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('custom_tour_requests').select('*').order('created_at', { ascending: false }).limit(50),
  ]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl text-maroon-900">Contact Enquiries</h1>
        <div className="card mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-maroon-50 text-left text-maroon-500"><tr><th className="p-3">Name</th><th>Email</th><th>Message</th><th>Date</th></tr></thead>
            <tbody>{(enquiries ?? []).map((e) => (
              <tr key={e.id} className="border-t border-maroon-100"><td className="p-3">{e.name}</td><td>{e.email}</td><td className="max-w-xs truncate">{e.message}</td><td>{formatDate(e.created_at)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-xl text-maroon-900">Custom Tour Requests</h2>
        <div className="card mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-maroon-50 text-left text-maroon-500"><tr><th className="p-3">Name</th><th>Destinations</th><th>Travellers</th><th>Date</th></tr></thead>
            <tbody>{(custom ?? []).map((c) => (
              <tr key={c.id} className="border-t border-maroon-100"><td className="p-3">{c.name}</td><td className="max-w-xs truncate">{c.destinations}</td><td>{c.travellers ?? '—'}</td><td>{formatDate(c.created_at)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
