import Link from 'next/link';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-maroon-900 to-saffron-800 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">🕉️</span> DevYatra India
        </Link>
        <div>
          <h2 className="text-3xl">Your sacred journey, simplified.</h2>
          <p className="mt-3 max-w-sm text-maroon-100">Track bookings, download confirmations and manage your yatra — all in one place.</p>
        </div>
        <p className="text-xs text-maroon-200">© {new Date().getFullYear()} DevYatra India</p>
      </div>
      <div className="flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
