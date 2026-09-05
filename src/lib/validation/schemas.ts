/**
 * Zod schemas — validate every server action / API input here.
 * These are the contract between the browser and the server.
 */
import { z } from 'zod';

export const emailSchema = z.string().email().max(200);
export const phoneSchema = z
  .string()
  .min(7)
  .max(20)
  .regex(/^[+0-9\s-]+$/, 'Invalid phone number');

export const enquirySchema = z.object({
  name: z.string().min(2).max(120),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  packageId: z.string().uuid().optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(5).max(2000),
  captchaToken: z.string().optional(),
});

export const customTourSchema = z.object({
  name: z.string().min(2).max(120),
  email: emailSchema,
  phone: phoneSchema,
  destinations: z.string().max(500).optional(),
  travellers: z.coerce.number().int().min(1).max(100).optional(),
  preferredDate: z.string().optional(),
  durationDays: z.coerce.number().int().min(1).max(60).optional(),
  budget: z.coerce.number().min(0).optional(),
  requirements: z.string().max(2000).optional(),
  captchaToken: z.string().optional(),
});

export const newsletterSchema = z.object({ email: emailSchema });

export const travellerSchema = z.object({
  fullName: z.string().min(2).max(120),
  age: z.coerce.number().int().min(0).max(120).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  idType: z.string().max(50).optional(),
  idNumber: z.string().max(60).optional(),
  needsAssistance: z.boolean().default(false),
  medicalNotes: z.string().max(500).optional(),
});

/**
 * Booking input from the browser. NOTE: no price fields are trusted here —
 * the server recomputes them via the pricing engine.
 */
export const bookingSchema = z.object({
  packageId: z.string().uuid(),
  departureId: z.string().uuid().optional(),
  departureDate: z.string().optional(),
  adults: z.coerce.number().int().min(1).max(50),
  children: z.coerce.number().int().min(0).max(50),
  rooms: z.coerce.number().int().min(1).max(50),
  addons: z
    .array(
      z.object({
        name: z.string().max(120),
        quantity: z.coerce.number().int().min(1).max(50),
      }),
    )
    .default([]),
  couponCode: z.string().max(40).optional(),
  lead: z.object({
    name: z.string().min(2).max(120),
    email: emailSchema,
    phone: phoneSchema,
    country: z.string().max(80).default('India'),
    state: z.string().max(80).optional(),
    city: z.string().max(80).optional(),
    address: z.string().max(300).optional(),
    emergencyContact: z.string().max(120).optional(),
    specialRequirements: z.string().max(1000).optional(),
    pickupPreference: z.string().max(200).optional(),
  }),
  travellers: z.array(travellerSchema).min(1),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms to proceed.' }),
  }),
  policyVersion: z.string().default('v1.0'),
  idempotencyKey: z.string().uuid(),
  captchaToken: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;

export const authSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(72),
  fullName: z.string().min(2).max(120).optional(),
});

/** Allowed upload types + max size (5 MB) for documents. */
export const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const MAX_DOC_BYTES = 5 * 1024 * 1024;

export function validateFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_DOC_TYPES.includes(file.type)) return 'Only JPG, PNG or PDF allowed.';
  if (file.size > MAX_DOC_BYTES) return 'File must be 5 MB or smaller.';
  return null;
}
