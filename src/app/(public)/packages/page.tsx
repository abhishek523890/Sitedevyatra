import type { Metadata } from 'next';
import { Section } from '@/components/ui/Section';
import { PackageCard } from '@/components/packages/PackageCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAllPackages } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'All Pilgrimage Packages',
  description: 'Browse Char Dham, Do Dham, Kedarnath, Badrinath and more guided pilgrimage packages.',
  alternates: { canonical: '/packages' },
};

export const revalidate = 300;

interface SearchParams {
  q?: string;
  category?: string;
  duration?: string;
  difficulty?: string;
  sort?: string;
}

/** All Packages page with server-side search & filtering. */
export default async function PackagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  let packages = await getAllPackages();

  // --- Apply filters on the server (data already RLS-limited to published) ---
  const q = searchParams.q?.toLowerCase().trim();
  if (q) {
    packages = packages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_desc?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }
  if (searchParams.category) {
    packages = packages.filter((p) => p.category === searchParams.category);
  }
  if (searchParams.difficulty) {
    packages = packages.filter((p) => p.difficulty === searchParams.difficulty);
  }
  if (searchParams.duration) {
    packages = packages.filter((p) => {
      if (searchParams.duration === '1-4') return p.days <= 4;
      if (searchParams.duration === '5-7') return p.days >= 5 && p.days <= 7;
      if (searchParams.duration === '8plus') return p.days >= 8;
      return true;
    });
  }
  if (searchParams.sort === 'price-asc')
    packages.sort((a, b) => (a.discounted_price ?? a.base_price) - (b.discounted_price ?? b.base_price));
  if (searchParams.sort === 'price-desc')
    packages.sort((a, b) => (b.discounted_price ?? b.base_price) - (a.discounted_price ?? a.base_price));

  const categories = Array.from(new Set(packages.map((p) => p.category).filter(Boolean)));

  return (
    <Section title="All Pilgrimage Packages" subtitle={`${packages.length} package(s) available.`}>
      {/* Filter bar (GET form keeps filters shareable/bookmarkable) */}
      <form className="mb-8 grid gap-3 rounded-2xl border border-maroon-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input name="q" defaultValue={searchParams.q} placeholder="Search…" className="input" aria-label="Search" />
        <select name="category" defaultValue={searchParams.category} className="input" aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c!}>{c}</option>
          ))}
        </select>
        <select name="duration" defaultValue={searchParams.duration} className="input" aria-label="Duration">
          <option value="">Any duration</option>
          <option value="1-4">1–4 days</option>
          <option value="5-7">5–7 days</option>
          <option value="8plus">8+ days</option>
        </select>
        <select name="sort" defaultValue={searchParams.sort} className="input" aria-label="Sort">
          <option value="">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <button className="btn-primary" type="submit">Apply Filters</button>
      </form>

      {packages.length === 0 ? (
        <EmptyState title="No packages match your filters" message="Try widening your search." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}
    </Section>
  );
}
