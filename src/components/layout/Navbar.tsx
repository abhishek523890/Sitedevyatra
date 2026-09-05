'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/packages', label: 'Packages' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/custom-tour', label: 'Custom Tour' },
  { href: '/blog', label: 'Travel Guides' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-maroon-100 bg-cream/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-maroon-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-saffron-600 text-white">🕉️</span>
          DevYatra <span className="text-saffron-600">India</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-maroon-700 hover:bg-maroon-50 hover:text-saffron-700"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="btn-secondary ml-2">
            My Bookings
          </Link>
          <Link href="/packages" className="btn-primary">
            Book Now
          </Link>
        </div>

        <button
          className="btn-ghost md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </nav>

      <div className={cn('md:hidden', open ? 'block' : 'hidden')}>
        <div className="container-page flex flex-col gap-1 pb-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-maroon-700 hover:bg-maroon-50"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            <Link href="/login" className="btn-secondary flex-1" onClick={() => setOpen(false)}>
              My Bookings
            </Link>
            <Link href="/packages" className="btn-primary flex-1" onClick={() => setOpen(false)}>
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
