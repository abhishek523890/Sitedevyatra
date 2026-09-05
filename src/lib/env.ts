/**
 * Centralised, validated environment access.
 * Server-only secrets are read lazily so they are never bundled into client code.
 */
import { z } from 'zod';

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default('+919000000000'),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
});

/** Server-only. Throws if called in the browser. */
export function serverEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() must never be called on the client.');
  }
  return {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER ?? 'resend',
    EMAIL_API_KEY: process.env.EMAIL_API_KEY ?? '',
    EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS ?? 'DevYatra India <no-reply@example.com>',
    OWNER_NOTIFICATION_EMAIL: process.env.OWNER_NOTIFICATION_EMAIL ?? '',
    PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET ?? '',
  };
}
