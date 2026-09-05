import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser, isStaff, getUserRoles } from '@/lib/auth';

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/packages', label: 'Packages' },
  { href: '/admin/enquiries', label: 'Enquiries' },
];

/**
 * Admin shell. Access is enforced on the SERVER here AND by RLS in the database.
 * Hiding UI is never the only line of defence.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/admin');
  if (!(await isStaff())) redirect('/dashboard'); // authenticated but not staff

  const roles = await getUserRoles();

  return (
    <div className="min-h-screen bg-maroon-50">
      <div className="flex">
        <aside className="hidden w-60 shrink-0 border-r border-maroon-100 bg-white p-4 lg:block">
          <Link href="/admin" className="mb-6 flex items-center gap-2 font-display font-bold text-maroon-900">
            🕉️ Admin
          </Link>
          <nav className="space-y-1">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-maroon-700 hover:bg-maroon-50">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 rounded-lg bg-maroon-50 p-3 text-xs text-maroon-500">
            <p className="font-medium text-maroon-700">Roles</p>
            <p className="mt-1">{roles.join(', ') || 'none'}</p>
          </div>
        </aside>
        <div className="flex-1">
          <header className="flex h-16 items-center justify-between border-b border-maroon-100 bg-white px-6">
            <span className="text-sm text-maroon-500">Signed in as {user.email}</span>
            <form action="/auth/signout" method="post"><button className="btn-secondary">Sign out</button></form>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
