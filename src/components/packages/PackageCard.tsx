import Link from 'next/link';
import Image from 'next/image';
import type { Package } from '@/types/database';
import { formatINR } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

/** Reusable package card used on Home, Packages list and Related sections. */
export function PackageCard({ pkg }: { pkg: Package }) {
  const price = pkg.discounted_price ?? pkg.base_price;
  const hasDiscount = pkg.discounted_price != null && pkg.discounted_price < pkg.base_price;

  return (
    <article className="card-hover group overflow-hidden">
      <Link href={`/packages/${pkg.slug}`} className="block">
        <div className="relative h-52 w-full overflow-hidden bg-maroon-100">
          <Image
            src={pkg.cover_image || '/images/placeholders/placeholder.jpg'}
            alt={pkg.name}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {pkg.is_featured && (
            <span className="badge absolute left-3 top-3 bg-gold-500 text-maroon-900">Featured</span>
          )}
          <span className="badge absolute right-3 top-3 bg-white/90 text-maroon-800 capitalize">
            {pkg.difficulty}
          </span>
        </div>
        <div className="p-5">
          <div className="mb-1 flex items-center gap-2 text-xs text-maroon-500">
            <span>{pkg.category}</span>
            <span aria-hidden>•</span>
            <span>
              {pkg.days}D / {pkg.nights}N
            </span>
          </div>
          <h3 className="text-lg text-maroon-900 group-hover:text-saffron-700">{pkg.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-maroon-500">{pkg.short_desc}</p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-maroon-400">From</p>
              <p className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-saffron-700">{formatINR(price)}</span>
                {hasDiscount && (
                  <span className="text-sm text-maroon-400 line-through">
                    {formatINR(pkg.base_price)}
                  </span>
                )}
              </p>
            </div>
            <span className={cn('btn-secondary px-3 py-1.5 text-xs')}>View Details</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
