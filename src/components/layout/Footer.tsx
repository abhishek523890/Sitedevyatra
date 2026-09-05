import Link from 'next/link';

const policyLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/refund-policy', label: 'Cancellation & Refund' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

const exploreLinks = [
  { href: '/packages', label: 'All Packages' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/blog', label: 'Travel Guides' },
  { href: '/faq', label: 'FAQ' },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-maroon-900 text-maroon-100">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-saffron-600">🕉️</span>
            DevYatra India
          </div>
          <p className="text-sm text-maroon-200">
            Trusted guided pilgrimage journeys across India. Comfortable stays, caring guides and
            24×7 travel assistance.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-400">Explore</h3>
          <ul className="space-y-2 text-sm">
            {exploreLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-400">Policies</h3>
          <ul className="space-y-2 text-sm">
            {policyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-400">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>📞 +91 90000 00000</li>
            <li>✉️ support@devyatra.example.com</li>
            <li>📍 Haridwar, Uttarakhand, India</li>
          </ul>
          <div className="mt-4 flex gap-3 text-lg">
            <a href="#" aria-label="Facebook" className="hover:text-white">📘</a>
            <a href="#" aria-label="Instagram" className="hover:text-white">📷</a>
            <a href="#" aria-label="YouTube" className="hover:text-white">▶️</a>
          </div>
        </div>
      </div>
      <div className="border-t border-maroon-800 py-4">
        <p className="container-page text-center text-xs text-maroon-300">
          © {new Date().getFullYear()} DevYatra India. All rights reserved. Demo project — replace
          placeholder content and images before going live.
        </p>
      </div>
    </footer>
  );
}
