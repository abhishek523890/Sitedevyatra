import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { PackageCard } from '@/components/packages/PackageCard';
import { createClient } from '@/lib/supabase/server';
import type { Destination, Package } from '@/types/database';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from('destinations').select('name, seo_title, seo_description, short_desc').eq('slug', params.slug).maybeSingle();
  if (!data) return { title: 'Destination not found' };
  return { title: data.seo_title ?? data.name, description: data.seo_description ?? data.short_desc ?? undefined, alternates: { canonical: `/destinations/${params.slug}` } };
}

export default async function DestinationDetail({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: dest } = await supabase.from('destinations').select('*').eq('slug', params.slug).eq('is_active', true).maybeSingle();
  if (!dest) notFound();
  const d = dest as Destination;
  const { data: pkgs } = await supabase.from('packages').select('*').eq('destination_id', d.id).eq('status', 'published').is('deleted_at', null);
  const packages = (pkgs as Package[]) ?? [];
  return (
    <>
      <div className="bg-gradient-to-br from-maroon-900 to-saffron-800 py-16 text-white">
        <div className="container-page">
          <h1 className="text-3xl">{d.name}</h1>
          <p className="mt-1 text-maroon-100">{d.state} · {d.region}</p>
          <p className="mt-4 max-w-2xl text-maroon-100">{d.description}</p>
        </div>
      </div>
      <Section title={`Packages to ${d.name}`}>
        {packages.length === 0 ? <p className="text-maroon-500">No packages yet for this destination.</p> :
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{packages.map((p) => <PackageCard key={p.id} pkg={p} />)}</div>}
      </Section>
    </>
  );
}
