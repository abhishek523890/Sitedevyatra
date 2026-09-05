import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { getFeaturedDestinations } from '@/lib/queries';
export const metadata = { title: 'Destinations', description: 'Sacred destinations across India.' , alternates:{canonical:'/destinations'}};
export const revalidate = 300;
export default async function DestinationsPage() {
  const destinations = await getFeaturedDestinations(50);
  return (
    <Section title="Sacred Destinations" subtitle={`${destinations.length} places to explore.`}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <Link key={d.id} href={`/destinations/${d.slug}`} className="card-hover overflow-hidden">
            <div className="flex h-40 items-end bg-gradient-to-t from-maroon-900/70 to-transparent p-5">
              <div><h3 className="text-lg text-white">{d.name}</h3><p className="text-xs text-maroon-100">{d.state}</p></div>
            </div>
            <p className="p-5 text-sm text-maroon-600 line-clamp-2">{d.short_desc}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
