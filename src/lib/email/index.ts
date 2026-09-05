import 'server-only';
import { serverEnv } from '@/lib/env';
import type { SendEmailParams } from './types';
import { resendProvider } from './providers/resend';
import { consoleProvider } from './providers/console';
import { createAdminClient } from '@/lib/supabase/admin';

/** Resolve the active provider from env. Extend here to add Brevo/SendGrid. */
function getProvider() {
  const { EMAIL_PROVIDER, EMAIL_API_KEY } = serverEnv();
  if (!EMAIL_API_KEY) return consoleProvider; // safe dev default
  switch (EMAIL_PROVIDER) {
    case 'resend':
      return resendProvider;
    default:
      return consoleProvider;
  }
}

/**
 * Render a stored template by key, substituting {{placeholders}}.
 * Falls back to a minimal inline template if the DB row is missing.
 */
export async function renderTemplate(
  key: string,
  vars: Record<string, string | number | null | undefined>,
): Promise<{ subject: string; html: string }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('email_templates')
    .select('subject, html_body')
    .eq('key', key)
    .eq('is_active', true)
    .maybeSingle();

  let subject = data?.subject ?? `DevYatra India - ${key}`;
  let html = data?.html_body ?? '<p>{{message}}</p>';

  for (const [k, v] of Object.entries(vars)) {
    const token = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
    const value = String(v ?? '');
    subject = subject.replace(token, value);
    html = html.replace(token, value);
  }
  return { subject, html };
}

/**
 * Send an email and ALWAYS record the attempt in email_logs.
 * Email failures must never throw into the booking flow — callers ignore errors.
 */
export async function sendEmail(
  params: SendEmailParams & { emailType?: string; bookingId?: string | null },
): Promise<void> {
  const provider = getProvider();
  const admin = createAdminClient();
  let status: 'sent' | 'failed' = 'sent';
  let providerId: string | undefined;
  let error: string | undefined;

  try {
    const result = await provider.send(params);
    status = result.ok ? 'sent' : 'failed';
    providerId = result.providerId;
    error = result.error;
  } catch (e) {
    status = 'failed';
    error = (e as Error).message;
  }

  await admin.from('email_logs').insert({
    recipient: params.to,
    subject: params.subject,
    email_type: params.emailType ?? null,
    booking_id: params.bookingId ?? null,
    status,
    provider_id: providerId ?? null,
    error_message: error ?? null,
  });
}
