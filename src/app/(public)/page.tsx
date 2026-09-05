import Link from 'next/link';
import { Suspense } from 'react';
import { Section } from '@/components/ui/Section';
import { PackageCard } from '@/components/packages/PackageCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getFeaturedPackages,
  getFeaturedDestinations,
  getApprovedReviews,
} from '@/lib/queries';

export const revalidate = 300; // ISR: refresh home content every 5 minutes

/* --------------------------- Hero --------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-maroon-900 via-maroon-800 to-saffron-800 text-white">
      <div className="container-page relative z-10 grid gap-8 py-20 lg:grid-cols-2 lg:py-28">
        <div className="animate-fade-up">
          <span className="badge mb-4 bg-white/15 text-white">🙏 Trusted by pilgrims across India</span>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Journeys of Faith, <span className="text-gold-400">Crafted with Care</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-maroon-100">
            Guided Char Dham, Kedarnath, Badrinath, Vaishno Devi and spiritual tours across India —
            comfortable stays, caring guides and 24×7 assistance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/packages" className="btn-primary">Explore Packages</Link>
            <Link href="/custom-tour" className="btn-secondary bg-white/10 text-white hover:bg-white/20">
              Plan a Custom Yatra
            </Link>
          </div>
        </div>

        {/* Search form */}
        <div className="animate-fade-up rounded-2xl bg-white/95 p-6 text-maroon-900 shadow-card">
          <h2 className="mb-4 text-lg">Find your yatra</h2>
          <form action="/packages" method="get" className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label" htmlFor="q">Destination</label>
              <input id="q" name="q" className="input" placeholder="Kedarnath, Char Dham…" />
            </div>
            <div>
              <label className="label" htmlFor="date">Travel Date</label>
              <input id="date" name="date" type="date" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="duration">Duration</label>
              <select id="duration" name="duration" className="input">
                <option value="">Any</option>
                <option value="1-4">1–4 days</option>
                <option value="5-7">5–7 days</option>
                <option value="8plus">8+ days</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label" htmlFor="travellers">Travellers</label>
              <input id="travellers" name="travellers" type="number" min={1} defaultValue={2} className="input" />
            </div>
            <button type="submit" className="btn-primary col-span-2">Search Packages</button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Popular packages -------------------- */
async function PopularPackages() {
  const packages = await getFeaturedPackages(6);
  if (packages.length === 0)
    return <EmptyState title="No packages yet" message="Run the seed script to load demo packages." />;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((p) => (
        <PackageCard key={p.id} pkg={p} />
      ))}
    </div>
  );
}

/* --------------------- Featured destinations ---------------- */
async function FeaturedDestinations() {
  const destinations = await getFeaturedDestinations(8);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {destinations.map((d) => (
        <Link
          key={d.id}
          href={`/destinations/${d.slug}`}
          className="card-hover group relative overflow-hidden"
        >
          <div className="flex h-32 items-end bg-gradient-to-t from-maroon-900/70 to-transparent p-4">
            <div>
              <h3 className="text-base text-white drop-shadow">{d.name}</h3>
              <p className="text-xs text-maroon-100">{d.state}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* --------------------- Testimonials ------------------------- */
async function Testimonials() {
  const reviews = await getApprovedReviews(3);
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {reviews.map((r, i) => (
        <figure key={i} className="card p-6">
          <div className="mb-2 text-gold-500" aria-label={`${r.rating} star rating`}>
            {'★'.repeat(r.rating)}
            <span className="text-maroon-200">{'★'.repeat(5 - r.rating)}</span>
          </div>
          <blockquote className="text-sm text-maroon-700">“{r.body}”</blockquote>
          <figcaption className="mt-3 text-sm font-medium text-maroon-900">— {r.author_name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

const steps = [
  { n: '1', t: 'Choose a package', d: 'Browse curated pilgrimage tours or request a custom yatra.' },
  { n: '2', t: 'Book online', d: 'Fill traveller details and submit — no payment needed to reserve.' },
  { n: '3', t: 'We confirm', d: 'Our team verifies availability and confirms your seats.' },
  { n: '4', t: 'Travel with care', d: 'Enjoy guided darshan with 24×7 on-trip assistance.' },
];

const whyUs = [
  { icon: '🛡️', t: 'Safe & Assisted', d: 'Trained guides, medical support and 24×7 helpline.' },
  { icon: '🏨', t: 'Comfortable Stays', d: 'Handpicked hotels and guesthouses near the shrines.' },
  { icon: '💰', t: 'Transparent Pricing', d: 'Server-verified pricing with no hidden charges.' },
  { icon: '🙏', t: 'Spiritual Focus', d: 'Itineraries designed around darshan and rituals.' },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Trust indicators */}
      <div className="border-y border-maroon-100 bg-white">
        <div className="container-page grid grid-cols-2 gap-4 py-6 text-center sm:grid-cols-4">
          {[
            ['15,000+', 'Happy pilgrims'],
            ['4.8/5', 'Average rating'],
            ['24×7', 'Travel assistance'],
            ['100%', 'Verified pricing'],
          ].map(([a, b]) => (
            <div key={b}>
              <p className="text-2xl font-bold text-saffron-700">{a}</p>
              <p className="text-xs text-maroon-500">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <Section title="Popular Pilgrimage Packages" subtitle="Our most-loved guided yatras.">
        <Suspense fallback={<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}</div>}>
          <PopularPackages />
        </Suspense>
        <div className="mt-8 text-center">
          <Link href="/packages" className="btn-secondary">View all packages</Link>
        </div>
      </Section>

      <div className="bg-white">
        <Section title="Featured Destinations" subtitle="Sacred places we help you reach.">
          <Suspense fallback={<div className="h-32" />}>
            <FeaturedDestinations />
          </Suspense>
        </Section>
      </div>

      <Section title="Why Choose DevYatra India">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w) => (
            <div key={w.t} className="card p-6">
              <div className="mb-3 text-3xl">{w.icon}</div>
              <h3 className="text-base text-maroon-900">{w.t}</h3>
              <p className="mt-1 text-sm text-maroon-500">{w.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="bg-white">
        <Section title="How Booking Works" subtitle="Four simple steps to your yatra.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative card p-6">
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-saffron-600 font-bold text-white">
                  {s.n}
                </span>
                <h3 className="text-base text-maroon-900">{s.t}</h3>
                <p className="mt-1 text-sm text-maroon-500">{s.d}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="What Pilgrims Say">
        <Suspense fallback={<div className="h-40" />}>
          <Testimonials />
        </Suspense>
      </Section>

      {/* Safety + custom CTA */}
      <div className="bg-gradient-to-br from-maroon-900 to-saffron-800 text-white">
        <div className="container-page grid gap-8 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl text-white sm:text-3xl">Safety & Assistance First</h2>
            <p className="mt-3 max-w-lg text-maroon-100">
              High-altitude shrines demand care. We provide fitness guidance, oxygen support on select
              routes, first-aid trained guides and a 24×7 helpline throughout your journey.
            </p>
            <Link href="/faq" className="btn-secondary mt-6 bg-white/10 text-white hover:bg-white/20">
              Read travel & safety FAQ
            </Link>
          </div>
          <div className="rounded-2xl bg-white/10 p-8">
            <h3 className="text-xl text-white">Can’t find the right package?</h3>
            <p className="mt-2 text-maroon-100">
              Tell us your dates, group size and budget — we’ll craft a custom pilgrimage just for you.
            </p>
            <Link href="/custom-tour" className="btn-primary mt-5">Request a Custom Tour</Link>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <Section>
        <div className="card mx-auto max-w-2xl p-8 text-center">
          <h2 className="text-2xl text-maroon-900">Get yatra updates & offers</h2>
          <p className="mt-2 text-maroon-500">Fixed departures, seasonal tips and special discounts.</p>
          <form action="/api/newsletter" method="post" className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input name="email" type="email" required placeholder="you@email.com" className="input flex-1" />
            <button className="btn-primary" type="submit">Subscribe</button>
          </form>
        </div>
      </Section>
    </>
  );
}
