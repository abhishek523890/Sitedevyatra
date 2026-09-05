'use server';

/**
 * Admin server actions. Every action re-checks the caller's role on the SERVER
 * before mutating, and writes to the audit log. RLS provides a second layer.
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasAnyRole, getCurrentUser } from '@/lib/auth';
import type { BookingStatus, PaymentStatus } from '@/types/database';
import { renderTemplate, sendEmail } from '@/lib/email';
import { formatINR } from '@/lib/utils/format';

async function audit(action: string, entity: string, entityId: string, changes: unknown) {
  const admin = createAdminClient();
  const user = await getCurrentUser();
  await admin.from('audit_logs').insert({
    actor_id: user?.id ?? null,
    action,
    entity,
    entity_id: entityId,
    changes: changes as never,
  });
}

/**
 * Update booking status. If moving to "confirmed", seats are decremented
 * atomically via the confirm_booking_seats DB function (row-locked transaction).
 */
export async function updateBookingStatus(bookingId: string, status: BookingStatus, note?: string) {
  if (!(await hasAnyRole(['super_admin', 'booking_manager']))) {
    return { ok: false, error: 'Not authorised.' };
  }
  const admin = createAdminClient();
  const supabase = createClient();

  const { data: current } = await admin
    .from('bookings')
    .select('status, lead_name, lead_email, reference, total_amount, id')
    .eq('id', bookingId)
    .maybeSingle();
  if (!current) return { ok: false, error: 'Booking not found.' };

  if (status === 'confirmed') {
    // Atomic seat decrement + status change + history in the DB.
    const { error } = await supabase.rpc('confirm_booking_seats', { p_booking_id: bookingId });
    if (error) return { ok: false, error: error.message };
  } else {
    await admin.from('bookings').update({ status }).eq('id', bookingId);
    await admin.from('booking_status_history').insert({
      booking_id: bookingId,
      from_status: current.status,
      to_status: status,
      note: note ?? null,
    });
  }

  await audit('status_change', 'bookings', bookingId, { from: current.status, to: status });

  // Notify customer on key transitions (best-effort).
  const templateKey =
    status === 'confirmed' ? 'booking_confirmed' : status === 'cancelled' ? 'booking_cancelled' : null;
  if (templateKey) {
    try {
      const tpl = await renderTemplate(templateKey, {
        lead_name: current.lead_name,
        reference: current.reference,
        package_name: '',
        departure_date: '',
        company_name: 'DevYatra India',
      });
      await sendEmail({
        to: current.lead_email,
        subject: tpl.subject,
        html: tpl.html,
        emailType: templateKey,
        bookingId,
      });
    } catch {
      /* ignore email errors */
    }
  }

  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { ok: true };
}

/** Record a manual/offline payment (finance or booking manager). */
export async function recordPayment(bookingId: string, amount: number, method: string, note?: string) {
  if (!(await hasAnyRole(['super_admin', 'booking_manager', 'finance_viewer']))) {
    return { ok: false, error: 'Not authorised.' };
  }
  if (!(amount > 0)) return { ok: false, error: 'Amount must be positive.' };

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from('bookings')
    .select('total_amount, paid_amount, lead_name, lead_email, reference')
    .eq('id', bookingId)
    .maybeSingle();
  if (!booking) return { ok: false, error: 'Booking not found.' };

  const newPaid = Number(booking.paid_amount) + amount;
  const fullyPaid = newPaid >= Number(booking.total_amount) - 0.01;

  await admin.from('payments').insert({
    booking_id: bookingId,
    amount,
    method: method as never,
    status: 'paid',
    note: note ?? 'Manual payment recorded by admin',
  });
  await admin
    .from('bookings')
    .update({
      paid_amount: newPaid,
      payment_status: fullyPaid ? 'paid' : ('partially_paid' as PaymentStatus),
    })
    .eq('id', bookingId);

  await audit('record_payment', 'bookings', bookingId, { amount, method });

  try {
    const tpl = await renderTemplate('payment_received', {
      lead_name: booking.lead_name,
      reference: booking.reference,
      paid_amount: formatINR(newPaid),
      total_amount: formatINR(Number(booking.total_amount)),
      company_name: 'DevYatra India',
    });
    await sendEmail({
      to: booking.lead_email,
      subject: tpl.subject,
      html: tpl.html,
      emailType: 'payment_received',
      bookingId,
    });
  } catch {
    /* ignore */
  }

  revalidatePath(`/admin/bookings/${bookingId}`);
  return { ok: true };
}
