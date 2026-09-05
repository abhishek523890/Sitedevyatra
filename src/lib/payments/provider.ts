import 'server-only';
import crypto from 'crypto';
import { serverEnv } from '@/lib/env';

/**
 * Payment provider abstraction.
 *
 * The initial version supports "Pay Later / Request Confirmation" and manual
 * admin recording. Razorpay/Stripe can be added by implementing verifySignature
 * + createOrder for that provider and swapping PAYMENT_PROVIDER.
 *
 * SECURITY: We NEVER trust a browser "success" redirect. Payment truth comes
 * only from a signed, verified webhook processed idempotently on the server.
 */

export interface WebhookVerification {
  valid: boolean;
  eventType?: string;
  providerTxnId?: string;
  amount?: number;
  bookingReference?: string;
}

/**
 * Verify a webhook signature. This example uses an HMAC-SHA256 scheme
 * (Razorpay-style). Replace the algorithm to match your chosen provider.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const { PAYMENT_WEBHOOK_SECRET } = serverEnv();
  if (!PAYMENT_WEBHOOK_SECRET || !signature) return false;
  const expected = crypto
    .createHmac('sha256', PAYMENT_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  // Constant-time comparison to avoid timing attacks.
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
