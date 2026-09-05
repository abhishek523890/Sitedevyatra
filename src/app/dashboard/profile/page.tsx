import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const supabase = createClient();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-maroon-900">My Profile</h1>
      <form action="/api/profile" method="post" className="card grid gap-4 p-6 sm:grid-cols-2">
        <div><label className="label">Full name</label><input name="full_name" defaultValue={profile?.full_name ?? ''} className="input" /></div>
        <div><label className="label">Phone</label><input name="phone" defaultValue={profile?.phone ?? ''} className="input" /></div>
        <div><label className="label">City</label><input name="city" defaultValue={profile?.city ?? ''} className="input" /></div>
        <div><label className="label">State</label><input name="state" defaultValue={profile?.state ?? ''} className="input" /></div>
        <div className="sm:col-span-2"><label className="label">Address</label><input name="address" defaultValue={profile?.address ?? ''} className="input" /></div>
        <div className="sm:col-span-2"><label className="label">Email (read-only)</label><input value={user!.email ?? ''} readOnly className="input bg-maroon-50" /></div>
        <button className="btn-primary sm:col-span-2" type="submit">Save changes</button>
      </form>
    </div>
  );
}
