import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/payments/provider';

/**
 * Payment webhook endpoint.
 *
 * Flow:
 *  1. Read the RAW body (needed for signature verification).
 *  2. Verify the signature — reject if invalid.
 *  3. Idempotency: skip if this provider txn id was already processed.
 *  4. Record the transaction, update payment + booking status inside the DB.
 *
 * A browser redirect NEVER marks a booking paid — only this verified webhook does.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-webhook-signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: {
    provider?: string;
    txn_id?: string;
    order_id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    booking_reference?: string;
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
  }

  const admin = createAdminClient();
  const provider = event.provider ?? 'unknown';
  const txnId = event.txn_id ?? '';

  // --- Idempotency guard: unique (provider, provider_txn_id) ---
  const { data: existing } = await admin
    .from('payment_transactions')
    .select('id, processed')
    .eq('provider', provider)
    .eq('provider_txn_id', txnId)
    .maybeSingle();
  if (existing?.processed) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  // Find the target booking by human-readable reference.
  const { data: booking } = await admin
    .from('bookings')
    .select('id, total_amount, paid_amount')
    .eq('reference', event.booking_reference ?? '')
    .maybeSingle();

  // Record the raw transaction (audit trail) regardless of matching.
  const { data: txn } = await admin
    .from('payment_transactions')
    .insert({
      booking_id: booking?.id ?? null,
      provider,
      provider_txn_id: txnId,
      provider_order_id: event.order_id ?? null,
      signature,
      amount: event.amount ?? 0,
      currency: event.currency ?? 'INR',
      status: event.status ?? 'unknown',
      raw_payload: event,
      processed: false,
    })
    .select('id')
    .single();

  // Only a successful, matched payment updates financial state.
  if (booking && event.status === 'success' && (event.amount ?? 0) > 0) {
    const newPaid = Number(booking.paid_amount) + Number(event.amount);
    const fullyPaid = newPaid >= Number(booking.total_amount) - 0.01;

    await admin.from('payments').insert({
      booking_id: booking.id,
      amount: event.amount,
      method: provider === 'razorpay' ? 'razorpay' : provider === 'stripe' ? 'stripe' : 'manual',
      status: 'paid',
      reference: txnId,
      note: 'Webhook-confirmed payment',
    });

    await admin
      .from('bookings')
      .update({
        paid_amount: newPaid,
        payment_status: fullyPaid ? 'paid' : 'partially_paid',
        status: fullyPaid ? 'fully_paid' : 'partially_paid',
      })
      .eq('id', booking.id);
  }

  // Mark the transaction processed so retries are ignored.
  if (txn) {
    await admin.from('payment_transactions').update({ processed: true }).eq('id', txn.id);
  }

  return NextResponse.json({ ok: true });
}
