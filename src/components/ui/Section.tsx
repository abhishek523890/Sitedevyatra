import { cn } from '@/lib/utils/cn';

/** A titled page section with consistent spacing. */
export function Section({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('py-12 sm:py-16', className)}>
      <div className="container-page">
        {title && (
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl text-maroon-900">{title}</h2>
            {subtitle && <p className="mt-2 text-maroon-600">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
