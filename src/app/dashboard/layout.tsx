import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

const nav = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/bookings', label: 'My Bookings' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/dashboard');

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-maroon-100 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-lg font-bold text-maroon-900">🕉️ DevYatra India</Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-maroon-500 sm:inline">{user.email}</span>
            <form action="/auth/signout" method="post"><button className="btn-secondary">Sign out</button></form>
          </div>
        </div>
      </header>
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[220px,1fr]">
        <nav className="space-y-1" aria-label="Dashboard">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-maroon-700 hover:bg-maroon-50">
              {n.label}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
