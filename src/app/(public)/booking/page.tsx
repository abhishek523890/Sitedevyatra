import { notFound, redirect } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { BookingForm } from '@/components/booking/BookingForm';
import { getPackageBySlug, getPackageDepartures } from '@/lib/queries';

export const metadata = { title: 'Book Your Yatra', robots: { index: false } };

/** Booking page. Requires ?package=<slug>. */
export default async function BookingPage({
  searchParams,
}: {
  searchParams: { package?: string };
}) {
  if (!searchParams.package) redirect('/packages');
  const pkg = await getPackageBySlug(searchParams.package);
  if (!pkg) notFound();
  const departures = await getPackageDepartures(pkg.id);

  return (
    <Section title="Book Your Yatra" subtitle="Complete the steps below. No payment needed to reserve.">
      <BookingForm pkg={pkg} departures={departures} />
    </Section>
  );
}
