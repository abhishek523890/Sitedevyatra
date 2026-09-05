'use client';

/**
 * Multi-step booking form.
 * Step 1 Package & travellers · Step 2 Lead contact · Step 3 Traveller details
 * Step 4 Price review & terms · Step 5 Submit.
 *
 * A stable idempotencyKey (generated once on mount) blocks duplicate submits
 * on refresh/double-click. The server recalculates all money — the totals shown
 * here are an ESTIMATE for UX only.
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Package, PackageDeparture } from '@/types/database';
import { calculatePricing } from '@/lib/pricing';
import { formatINR, formatDate } from '@/lib/utils/format';
import { createBooking } from '@/app/(public)/booking/actions';

interface Props {
  pkg: Package;
  departures: PackageDeparture[];
}

interface Traveller {
  fullName: string;
  age: string;
  gender: string;
  idType: string;
  idNumber: string;
  needsAssistance: boolean;
  medicalNotes: string;
}

const emptyTraveller = (): Traveller => ({
  fullName: '',
  age: '',
  gender: '',
  idType: '',
  idNumber: '',
  needsAssistance: false,
  medicalNotes: '',
});

export function BookingForm({ pkg, departures }: Props) {
  const router = useRouter();
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [departureId, setDepartureId] = useState(departures[0]?.id ?? '');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  // Step 2
  const [lead, setLead] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'India',
    state: '',
    city: '',
    address: '',
    emergencyContact: '',
    specialRequirements: '',
    pickupPreference: '',
  });

  // Step 3
  const [travellers, setTravellers] = useState<Traveller[]>([emptyTraveller()]);

  // Step 4
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  const selectedDeparture = departures.find((d) => d.id === departureId);

  // Client-side ESTIMATE only (server is authoritative).
  const estimate = calculatePricing({
    basePrice: pkg.discounted_price ?? pkg.base_price,
    childPrice: pkg.child_price,
    singleSupplement: pkg.single_supplement,
    taxPercent: pkg.tax_percent,
    adults,
    children,
    rooms,
    addons: [],
    coupon: null,
  });

  function syncTravellerRows() {
    const needed = adults + children;
    setTravellers((prev) => {
      const next = [...prev];
      while (next.length < needed) next.push(emptyTraveller());
      return next.slice(0, needed);
    });
  }

  function updateTraveller(i: number, patch: Partial<Traveller>) {
    setTravellers((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  async function handleSubmit() {
    setError(null);
    if (!terms || !privacy) {
      setError('Please accept the terms and privacy policy.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createBooking({
        packageId: pkg.id,
        departureId: departureId || undefined,
        departureDate: selectedDeparture?.departure_date,
        adults,
        children,
        rooms,
        addons: [],
        lead,
        travellers: travellers.map((t) => ({
          fullName: t.fullName,
          age: t.age ? Number(t.age) : undefined,
          gender: (t.gender || undefined) as never,
          idType: t.idType || undefined,
          idNumber: t.idNumber || undefined,
          needsAssistance: t.needsAssistance,
          medicalNotes: t.medicalNotes || undefined,
        })),
        termsAccepted: true,
        policyVersion: 'v1.0',
        idempotencyKey,
      });

      if (result.ok && result.reference) {
        router.push(`/booking/confirmation?ref=${result.reference}`);
      } else {
        setError(result.error ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  const steps = ['Package', 'Contact', 'Travellers', 'Review', 'Confirm'];

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="card p-6">
        {/* Stepper */}
        <ol className="mb-6 flex flex-wrap gap-2 text-xs">
          {steps.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-1 rounded-full px-3 py-1 ${
                step === i + 1
                  ? 'bg-saffron-600 text-white'
                  : step > i + 1
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-maroon-50 text-maroon-500'
              }`}
            >
              <span>{step > i + 1 ? '✓' : i + 1}</span> {s}
            </li>
          ))}
        </ol>

        {error && (
          <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="dep">Departure date</label>
              <select
                id="dep"
                className="input"
                value={departureId}
                onChange={(e) => setDepartureId(e.target.value)}
              >
                {departures.length === 0 && <option value="">Open date (enquire)</option>}
                {departures.map((d) => (
                  <option key={d.id} value={d.id} disabled={d.available_seats <= 0}>
                    {formatDate(d.departure_date)} —{' '}
                    {d.available_seats > 0 ? `${d.available_seats} seats` : 'Sold out'}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label" htmlFor="adults">Adults</label>
                <input id="adults" type="number" min={1} className="input" value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))} onBlur={syncTravellerRows} />
              </div>
              <div>
                <label className="label" htmlFor="children">Children</label>
                <input id="children" type="number" min={0} className="input" value={children}
                  onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} onBlur={syncTravellerRows} />
              </div>
              <div>
                <label className="label" htmlFor="rooms">Rooms</label>
                <input id="rooms" type="number" min={1} className="input" value={rooms}
                  onChange={(e) => setRooms(Math.max(1, Number(e.target.value)))} />
              </div>
            </div>
            <button className="btn-primary" onClick={() => { syncTravellerRows(); setStep(2); }}>
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Full name *</label>
                <input className="input" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} /></div>
              <div><label className="label">Email *</label>
                <input type="email" className="input" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} /></div>
              <div><label className="label">Phone *</label>
                <input className="input" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} /></div>
              <div><label className="label">Emergency contact</label>
                <input className="input" value={lead.emergencyContact} onChange={(e) => setLead({ ...lead, emergencyContact: e.target.value })} /></div>
              <div><label className="label">State</label>
                <input className="input" value={lead.state} onChange={(e) => setLead({ ...lead, state: e.target.value })} /></div>
              <div><label className="label">City</label>
                <input className="input" value={lead.city} onChange={(e) => setLead({ ...lead, city: e.target.value })} /></div>
            </div>
            <div><label className="label">Address</label>
              <input className="input" value={lead.address} onChange={(e) => setLead({ ...lead, address: e.target.value })} /></div>
            <div><label className="label">Pickup preference</label>
              <input className="input" value={lead.pickupPreference} onChange={(e) => setLead({ ...lead, pickupPreference: e.target.value })} /></div>
            <div><label className="label">Special requirements</label>
              <textarea className="input" rows={3} value={lead.specialRequirements} onChange={(e) => setLead({ ...lead, specialRequirements: e.target.value })} /></div>
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" disabled={!lead.name || !lead.email || !lead.phone}
                onClick={() => setStep(3)}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            {travellers.map((t, i) => (
              <div key={i} className="rounded-xl border border-maroon-100 p-4">
                <p className="mb-2 text-sm font-medium text-maroon-800">Traveller {i + 1}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="input" placeholder="Full name" value={t.fullName}
                    onChange={(e) => updateTraveller(i, { fullName: e.target.value })} />
                  <input className="input" placeholder="Age" type="number" value={t.age}
                    onChange={(e) => updateTraveller(i, { age: e.target.value })} />
                  <select className="input" value={t.gender} onChange={(e) => updateTraveller(i, { gender: e.target.value })}>
                    <option value="">Gender (optional)</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  <input className="input" placeholder="ID type (Aadhaar/Passport)" value={t.idType}
                    onChange={(e) => updateTraveller(i, { idType: e.target.value })} />
                  <input className="input" placeholder="ID number" value={t.idNumber}
                    onChange={(e) => updateTraveller(i, { idNumber: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm text-maroon-700">
                    <input type="checkbox" checked={t.needsAssistance}
                      onChange={(e) => updateTraveller(i, { needsAssistance: e.target.checked })} />
                    Needs medical / accessibility assistance
                  </label>
                </div>
              </div>
            ))}
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary" disabled={travellers.some((t) => !t.fullName)}
                onClick={() => setStep(4)}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-cream p-4 text-sm">
              <p className="mb-1 font-medium text-maroon-800">Estimated price</p>
              <p className="text-xs text-maroon-500">Final amount is confirmed by our team after availability check.</p>
            </div>
            <label className="flex items-start gap-2 text-sm text-maroon-700">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              I accept the <a href="/terms" className="text-saffron-700 underline">Terms &amp; Conditions</a> and{' '}
              <a href="/refund-policy" className="text-saffron-700 underline">Cancellation Policy</a>.
            </label>
            <label className="flex items-start gap-2 text-sm text-maroon-700">
              <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
              I consent to the <a href="/privacy-policy" className="text-saffron-700 underline">Privacy Policy</a>.
            </label>
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(3)}>Back</button>
              <button className="btn-primary" disabled={submitting} onClick={handleSubmit}>
                {submitting ? 'Submitting…' : 'Submit Booking Request'}
              </button>
            </div>
            <p className="text-xs text-maroon-400">
              Payment options (Pay Later / online) appear after our team confirms availability.
            </p>
          </div>
        )}
      </div>

      {/* Live price summary */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="card p-6">
          <h3 className="text-lg text-maroon-900">{pkg.name}</h3>
          {selectedDeparture && (
            <p className="mt-1 text-sm text-maroon-500">🗓️ {formatDate(selectedDeparture.departure_date)}</p>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <Row label={`Package (${adults} adult, ${children} child)`} value={estimate.packageAmount} />
            <Row label="Room charges" value={estimate.roomCharges} />
            <Row label="Discount" value={-estimate.discountAmount} />
            <Row label={`Tax (${pkg.tax_percent}%)`} value={estimate.taxAmount} />
            <div className="border-t border-maroon-100 pt-2">
              <Row label="Estimated total" value={estimate.totalAmount} bold />
            </div>
            <Row label="Advance (25%)" value={estimate.advanceAmount} />
            <Row label="Remaining" value={estimate.remainingAmount} />
          </dl>
          <p className="mt-4 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
            This is an estimate. The server recalculates the final price from current rates.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold text-maroon-900' : 'text-maroon-600'}`}>
      <dt>{label}</dt>
      <dd>{formatINR(value)}</dd>
    </div>
  );
}
