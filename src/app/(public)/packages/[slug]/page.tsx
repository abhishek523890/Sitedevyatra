import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPackageBySlug, getPackageDepartures, getAllPackages } from '@/lib/queries';
import { createClient } from '@/lib/supabase/server';
import { formatINR, formatDate } from '@/lib/utils/format';
import { PackageCard } from '@/components/packages/PackageCard';
import { publicEnv } from '@/lib/env';

interface Props {
  params: { slug: string };
}

/** Dynamic SEO metadata per package. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pkg = await getPackageBySlug(params.slug);
  if (!pkg) return { title: 'Package not found' };
  return {
    title: pkg.seo_title ?? pkg.name,
    description: pkg.seo_description ?? pkg.short_desc ?? undefined,
    alternates: { canonical: `/packages/${pkg.slug}` },
    openGraph: {
      title: pkg.name,
      description: pkg.short_desc ?? undefined,
      images: pkg.cover_image ? [pkg.cover_image] : undefined,
    },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const pkg = await getPackageBySlug(params.slug);
  if (!pkg) notFound();

  const supabase = createClient();
  const [departures, itineraryRes, inclusionsRes, exclusionsRes, imagesRes, related] =
    await Promise.all([
      getPackageDepartures(pkg.id),
      supabase.from('package_itinerary').select('*').eq('package_id', pkg.id).order('day_number'),
      supabase.from('package_inclusions').select('*').eq('package_id', pkg.id).order('sort_order'),
      supabase.from('package_exclusions').select('*').eq('package_id', pkg.id).order('sort_order'),
      supabase.from('package_images').select('*').eq('package_id', pkg.id).order('sort_order'),
      getAllPackages(),
    ]);

  const itinerary = itineraryRes.data ?? [];
  const inclusions = inclusionsRes.data ?? [];
  const exclusions = exclusionsRes.data ?? [];
  const gallery = imagesRes.data ?? [];
  const relatedPackages = related.filter((p) => p.id !== pkg.id).slice(0, 3);
  const price = pkg.discounted_price ?? pkg.base_price;

  // JSON-LD structured data for rich results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.name,
    description: pkg.short_desc,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'INR',
      url: `${publicEnv.NEXT_PUBLIC_SITE_URL}/packages/${pkg.slug}`,
    },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumbs */}
      <div className="border-b border-maroon-100 bg-white">
        <nav className="container-page py-3 text-sm text-maroon-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-saffron-700">Home</Link> ›{' '}
          <Link href="/packages" className="hover:text-saffron-700">Packages</Link> ›{' '}
          <span className="text-maroon-800">{pkg.name}</span>
        </nav>
      </div>

      {/* Hero + gallery */}
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[2fr,1fr]">
        <div>
          <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-maroon-100 sm:h-96">
            <Image
              src={pkg.cover_image || '/images/placeholders/placeholder.jpg'}
              alt={pkg.name}
              fill
              sizes="(max-width:1024px) 100vw, 66vw"
              className="object-cover"
              priority
            />
          </div>
          {gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((g) => (
                <div key={g.id} className="relative h-20 overflow-hidden rounded-lg bg-maroon-100">
                  <Image src={g.url} alt={g.alt_text ?? pkg.name} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h1 className="text-3xl text-maroon-900">{pkg.name}</h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-maroon-500">
              <span>📍 {pkg.start_location} → {pkg.end_location}</span>
              <span>🗓️ {pkg.days}D / {pkg.nights}N</span>
              <span className="capitalize">⛰️ {pkg.difficulty}</span>
              <span>🌤️ {pkg.best_season}</span>
            </div>
            <p className="mt-4 text-maroon-700">{pkg.description}</p>

            {pkg.highlights?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl text-maroon-900">Highlights</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {pkg.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-maroon-700">
                      <span className="text-saffron-600">✔</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Price + booking card (sticky) */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-6">
            <p className="text-sm text-maroon-400">Starting from</p>
            <p className="text-3xl font-bold text-saffron-700">{formatINR(price)}</p>
            <p className="text-xs text-maroon-400">per adult · + {pkg.tax_percent}% tax</p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-maroon-500">Child price</span>
                <span className="font-medium">{pkg.child_price ? formatINR(pkg.child_price) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-maroon-500">Single supplement</span>
                <span className="font-medium">{formatINR(pkg.single_supplement)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-maroon-500">Max group size</span>
                <span className="font-medium">{pkg.max_group_size}</span>
              </div>
            </div>

            {/* Availability indicator */}
            <div className="mt-4 rounded-xl bg-cream p-3 text-sm">
              <p className="font-medium text-maroon-800">Upcoming departures</p>
              {departures.length === 0 ? (
                <p className="mt-1 text-maroon-500">Open dates — enquire for a schedule.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {departures.slice(0, 3).map((d) => (
                    <li key={d.id} className="flex items-center justify-between">
                      <span>{formatDate(d.departure_date)}</span>
                      <span className={d.available_seats > 5 ? 'text-emerald-600' : 'text-orange-600'}>
                        {d.available_seats > 0 ? `${d.available_seats} seats` : 'Sold out'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link href={`/booking?package=${pkg.slug}`} className="btn-primary mt-5 w-full">
              Book Now
            </Link>
            <Link href={`/contact?package=${pkg.slug}`} className="btn-secondary mt-2 w-full">
              Enquire
            </Link>
            <a
              href={`https://wa.me/${publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `I'm interested in ${pkg.name}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-2 w-full text-green-600"
            >
              💬 WhatsApp
            </a>
          </div>
        </aside>
      </div>

      {/* Itinerary */}
      {itinerary.length > 0 && (
        <div className="bg-white">
          <div className="container-page py-10">
            <h2 className="text-2xl text-maroon-900">Day-by-Day Itinerary</h2>
            <ol className="mt-6 space-y-4">
              {itinerary.map((day) => (
                <li key={day.id} className="card p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-saffron-600 text-sm font-bold text-white">
                      {day.day_number}
                    </span>
                    <h3 className="text-lg text-maroon-900">{day.title}</h3>
                  </div>
                  {day.description && <p className="mt-2 text-sm text-maroon-600">{day.description}</p>}
                  <p className="mt-2 text-xs text-maroon-400">
                    {day.stay && <>🏨 {day.stay} </>} {day.meals && <>· 🍽️ {day.meals}</>}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Inclusions / Exclusions */}
      <div className="container-page grid gap-6 py-10 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl text-emerald-700">✔ Inclusions</h2>
          <ul className="mt-3 space-y-2 text-sm text-maroon-700">
            {inclusions.length > 0 ? (
              inclusions.map((i) => <li key={i.id}>• {i.item}</li>)
            ) : (
              <li className="whitespace-pre-line">{pkg.inclusions_text}</li>
            )}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-xl text-red-600">✘ Exclusions</h2>
          <ul className="mt-3 space-y-2 text-sm text-maroon-700">
            {exclusions.length > 0 ? (
              exclusions.map((i) => <li key={i.id}>• {i.item}</li>)
            ) : (
              <li className="whitespace-pre-line">{pkg.exclusions_text}</li>
            )}
          </ul>
        </div>
      </div>

      {/* Related packages */}
      {relatedPackages.length > 0 && (
        <div className="bg-white">
          <div className="container-page py-10">
            <h2 className="text-2xl text-maroon-900">Related Packages</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPackages.map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
