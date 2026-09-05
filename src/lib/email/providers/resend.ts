import 'server-only';
import type { EmailProvider, SendEmailParams, SendEmailResult } from '../types';
import { serverEnv } from '@/lib/env';

/** Resend adapter (free tier: 3,000 emails/month). */
export const resendProvider: EmailProvider = {
  name: 'resend',
  async send(params: SendEmailParams): Promise<SendEmailResult> {
    const { EMAIL_API_KEY, EMAIL_FROM_ADDRESS } = serverEnv();
    if (!EMAIL_API_KEY) return { ok: false, error: 'EMAIL_API_KEY not configured' };
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${EMAIL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: EMAIL_FROM_ADDRESS,
          to: params.to,
          subject: params.subject,
          html: params.html,
          reply_to: params.replyTo,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: data?.message ?? `HTTP ${res.status}` };
      return { ok: true, providerId: data?.id };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
};
