import { describe, it, expect } from 'vitest';
import { bookingSchema, enquirySchema } from '@/lib/validation/schemas';

describe('validation schemas', () => {
  it('rejects a booking without accepted terms', () => {
    const res = bookingSchema.safeParse({
      packageId: '00000000-0000-0000-0000-000000000000',
      adults: 1, children: 0, rooms: 1, addons: [],
      lead: { name: 'A', email: 'a@b.com', phone: '+919000000000' },
      travellers: [{ fullName: 'A' }],
      termsAccepted: false,
      idempotencyKey: '11111111-1111-1111-1111-111111111111',
    });
    expect(res.success).toBe(false);
  });

  it('accepts a valid enquiry', () => {
    const res = enquirySchema.safeParse({ name: 'Ravi', email: 'ravi@example.com', message: 'Hello there' });
    expect(res.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const res = enquirySchema.safeParse({ name: 'Ravi', email: 'nope', message: 'Hello there' });
    expect(res.success).toBe(false);
  });
});
