import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <div className="text-6xl">🕉️</div>
      <h1 className="mt-4 text-3xl text-maroon-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-maroon-500">
        The path you seek does not exist. Let us guide you back to the journey.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">Go Home</Link>
        <Link href="/packages" className="btn-secondary">Browse Packages</Link>
      </div>
    </div>
  );
}
