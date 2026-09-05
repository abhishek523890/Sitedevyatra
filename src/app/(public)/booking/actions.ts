'use server';

/**
 * Booking server action — the trust boundary.
 *
 * Guarantees:
 *  - Prices are recomputed from the DB (browser totals are ignored).
 *  - Duplicate submissions are blocked via a unique idempotency_key.
 *  - The booking is saved FIRST; emails are attempted after and never block it.
 *  - Seats are NOT decremented here — only when an admin confirms
 *    (confirm_booking_seats runs in a locked DB transaction).
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculatePricing } from '@/lib/pricing';
import { bookingSchema, type BookingInput } from '@/lib/validation/schemas';
import { renderTemplate, sendEmail } from '@/lib/email';
import { serverEnv } from '@/lib/env';
import { publicEnv } from '@/lib/env';
import { formatINR, formatDate } from '@/lib/utils/format';

export interface BookingActionResult {
  ok: boolean;
  reference?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createBooking(input: BookingInput): Promise<BookingActionResult> {
  // 1) Validate shape.
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { ok: false, error: 'Please check the highlighted fields.', fieldErrors };
  }
  const data = parsed.data;

  const supabase = createClient();
  const admin = createAdminClient(); // service role for writes that cross RLS safely

  // 2) Idempotency: if this key already produced a booking, return it.
  const { data: existing } = await admin
    .from('bookings')
    .select('reference')
    .eq('idempotency_key', data.idempotencyKey)
    .maybeSingle();
  if (existing) return { ok: true, reference: existing.reference };

  // 3) Load authoritative package pricing from the DB.
  const { data: pkg, error: pkgErr } = await supabase
    .from('packages')
    .select(
      'id, name, slug, base_price, discounted_price, child_price, single_supplement, tax_percent, status',
    )
    .eq('id', data.packageId)
    .eq('status', 'published')
    .maybeSingle();

  if (pkgErr || !pkg) return { ok: false, error: 'Selected package is unavailable.' };

  // 4) Optional coupon lookup (server-validated).
  let coupon = null;
  if (data.couponCode) {
    const { data: c } = await admin
      .from('coupons')
      .select('*')
      .eq('code', data.couponCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (c) {
      const now = new Date();
      const okFrom = !c.valid_from || new Date(c.valid_from) <= now;
      const okTo = !c.valid_to || new Date(c.valid_to) >= now;
      const okLimit = !c.usage_limit || c.used_count < c.usage_limit;
      if (okFrom && okTo && okLimit) coupon = c;
    }
  }

  // 5) Add-on prices must also come from a trusted source. For the demo we use a
  //    fixed server catalogue; replace with a package_addons table in production.
  const ADDON_CATALOGUE: Record<string, number> = {
    'Helicopter Upgrade': 15000,
    'Pony / Palki Assistance': 3500,
    'Extra Night Stay': 2500,
    'Airport Pickup': 1200,
  };
  const addons = data.addons.map((a) => ({
    name: a.name,
    unitPrice: ADDON_CATALOGUE[a.name] ?? 0,
    quantity: a.quantity,
  }));

  // 6) Recompute pricing on the server.
  const pricing = calculatePricing({
    basePrice: pkg.discounted_price ?? pkg.base_price,
    childPrice: pkg.child_price,
    singleSupplement: pkg.single_supplement,
    taxPercent: pkg.tax_percent,
    adults: data.adults,
    children: data.children,
    rooms: data.rooms,
    addons,
    coupon,
  });

  // 7) Generate a human-readable reference and insert the booking.
  const { data: refRow } = await admin.rpc('next_booking_reference');
  const reference = (refRow as string) ?? `DYI-${new Date().getFullYear()}-${Date.now()}`;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: booking, error: insErr } = await admin
    .from('bookings')
    .insert({
      reference,
      user_id: user?.id ?? null,
      package_id: pkg.id,
      departure_id: data.departureId ?? null,
      departure_date: data.departureDate ?? null,
      adults: data.adults,
      children: data.children,
      rooms: data.rooms,
      package_amount: pricing.packageAmount,
      addons_amount: pricing.addonsAmount,
      room_charges: pricing.roomCharges,
      discount_amount: pricing.discountAmount,
      tax_amount: pricing.taxAmount,
      total_amount: pricing.totalAmount,
      advance_amount: pricing.advanceAmount,
      paid_amount: 0,
      coupon_id: coupon?.id ?? null,
      lead_name: data.lead.name,
      lead_email: data.lead.email,
      lead_phone: data.lead.phone,
      country: data.lead.country,
      state: data.lead.state,
      city: data.lead.city,
      address: data.lead.address,
      emergency_contact: data.lead.emergencyContact,
      special_requirements: data.lead.specialRequirements,
      pickup_preference: data.lead.pickupPreference,
      status: 'awaiting_confirmation',
      payment_status: 'unpaid',
      terms_accepted: data.termsAccepted,
      policy_version: data.policyVersion,
      idempotency_key: data.idempotencyKey,
    })
    .select('id, reference')
    .single();

  if (insErr || !booking) {
    // Unique-violation on idempotency_key => a concurrent request already inserted it.
    if (insErr?.code === '23505') {
      const { data: dup } = await admin
        .from('bookings')
        .select('reference')
        .eq('idempotency_key', data.idempotencyKey)
        .maybeSingle();
      if (dup) return { ok: true, reference: dup.reference };
    }
    return { ok: false, error: 'Could not save your booking. Please try again.' };
  }

  // 8) Insert travellers + add-ons + status history (best-effort, booking already saved).
  await admin.from('booking_travellers').insert(
    data.travellers.map((t) => ({
      booking_id: booking.id,
      full_name: t.fullName,
      age: t.age ?? null,
      gender: t.gender ?? null,
      id_type: t.idType ?? null,
      id_number: t.idNumber ?? null,
      needs_assistance: t.needsAssistance,
      medical_notes: t.medicalNotes ?? null,
    })),
  );
  if (addons.length > 0) {
    await admin.from('booking_addons').insert(
      addons.map((a) => ({
        booking_id: booking.id,
        name: a.name,
        unit_price: a.unitPrice,
        quantity: a.quantity,
        amount: a.unitPrice * a.quantity,
      })),
    );
  }
  await admin.from('booking_status_history').insert({
    booking_id: booking.id,
    from_status: null,
    to_status: 'awaiting_confirmation',
    note: 'Booking submitted by customer',
  });

  // 9) Emails — AFTER save, failures recorded but never thrown.
  const { OWNER_NOTIFICATION_EMAIL } = serverEnv();
  const bookingLink = `${publicEnv.NEXT_PUBLIC_SITE_URL}/dashboard/bookings/${reference}`;
  const adminLink = `${publicEnv.NEXT_PUBLIC_SITE_URL}/admin/bookings`;
  const commonVars = {
    reference,
    lead_name: data.lead.name,
    lead_email: data.lead.email,
    lead_phone: data.lead.phone,
    package_name: pkg.name,
    departure_date: data.departureDate ? formatDate(data.departureDate) : 'Open date',
    traveller_count: String(data.adults + data.children),
    total_amount: formatINR(pricing.totalAmount),
    payment_status: 'Unpaid',
    booking_status: 'Awaiting Confirmation',
    special_requirements: data.lead.specialRequirements ?? '—',
    booking_link: bookingLink,
    admin_link: adminLink,
    company_name: 'DevYatra India',
    support_phone: '+91 90000 00000',
  };

  try {
    const ack = await renderTemplate('booking_ack', commonVars);
    await sendEmail({
      to: data.lead.email,
      subject: ack.subject,
      html: ack.html,
      emailType: 'booking_ack',
      bookingId: booking.id,
    });
    if (OWNER_NOTIFICATION_EMAIL) {
      const own = await renderTemplate('booking_owner', commonVars);
      await sendEmail({
        to: OWNER_NOTIFICATION_EMAIL,
        subject: own.subject,
        html: own.html,
        emailType: 'booking_owner',
        bookingId: booking.id,
      });
    }
  } catch {
    // Swallow — email failures must not fail the booking. Already logged in sendEmail.
  }

  return { ok: true, reference };
}
