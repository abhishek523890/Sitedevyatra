import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { createClient } from '@/lib/supabase/server';
import { formatINR, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/Badge';

export const metadata = { title: 'Booking Confirmation', robots: { index: false } };

/** Booking confirmation page. Shows the saved booking by reference. */
export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const ref = searchParams.ref;
  const supabase = createClient();
  const { data: booking } = ref
    ? await supabase
        .from('bookings')
        .select(
          'reference, lead_name, lead_email, departure_date, adults, children, total_amount, status, payment_status',
        )
        .eq('reference', ref)
        .maybeSingle()
    : { data: null };

  return (
    <Section>
      <div className="mx-auto max-w-xl">
        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">
            ✅
          </div>
          <h1 className="text-2xl text-maroon-900">Booking Request Received</h1>
          <p className="mt-2 text-maroon-500">
            Thank you! Your request has been submitted. Our team will verify availability and confirm
            shortly. A confirmation email is on its way.
          </p>

          {booking ? (
            <div className="mt-6 space-y-2 rounded-xl bg-cream p-5 text-left text-sm">
              <Row label="Reference" value={booking.reference} strong />
              <Row label="Lead traveller" value={booking.lead_name} />
              <Row
                label="Travel date"
                value={booking.departure_date ? formatDate(booking.departure_date) : 'Open date'}
              />
              <Row
                label="Travellers"
                value={`${booking.adults} adult(s), ${booking.children} child(ren)`}
              />
              <Row label="Total amount" value={formatINR(booking.total_amount)} />
              <div className="flex items-center justify-between pt-1">
                <span className="text-maroon-500">Status</span>
                <StatusBadge status={booking.status} />
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              Reference {ref ?? ''} — details will appear in your dashboard once processed.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/dashboard" className="btn-primary">View My Bookings</Link>
            <Link href="/packages" className="btn-secondary">Browse More</Link>
          </div>
          <p className="mt-4 text-xs text-maroon-400">
            Note: Submission does not guarantee confirmation until approved by our team.
          </p>
        </div>
      </div>
    </Section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-maroon-500">{label}</span>
      <span className={strong ? 'font-bold text-saffron-700' : 'font-medium text-maroon-900'}>
        {value}
      </span>
    </div>
  );
}
