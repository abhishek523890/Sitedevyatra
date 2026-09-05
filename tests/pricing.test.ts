import { describe, it, expect } from 'vitest';
import { calculatePricing } from '@/lib/pricing';

describe('pricing engine (server source of truth)', () => {
  it('computes a simple adult-only booking with tax', () => {
    const r = calculatePricing({
      basePrice: 10000, childPrice: null, singleSupplement: 0, taxPercent: 5,
      adults: 2, children: 0, rooms: 1, addons: [], coupon: null,
    });
    expect(r.packageAmount).toBe(20000);
    expect(r.taxAmount).toBe(1000);
    expect(r.totalAmount).toBe(21000);
    expect(r.advanceAmount).toBe(5250); // 25%
  });

  it('applies child pricing and add-ons', () => {
    const r = calculatePricing({
      basePrice: 10000, childPrice: 7000, singleSupplement: 3000, taxPercent: 5,
      adults: 1, children: 1, rooms: 1,
      addons: [{ name: 'Airport Pickup', unitPrice: 1200, quantity: 1 }], coupon: null,
    });
    expect(r.packageAmount).toBe(17000);
    expect(r.addonsAmount).toBe(1200);
  });

  it('caps a percentage coupon at max_discount', () => {
    const r = calculatePricing({
      basePrice: 100000, childPrice: null, singleSupplement: 0, taxPercent: 5,
      adults: 1, children: 0, rooms: 1, addons: [],
      coupon: { discount_type: 'percent', discount_value: 50, max_discount: 5000, min_booking_value: 0 },
    });
    expect(r.discountAmount).toBe(5000);
  });

  it('ignores a coupon below min booking value', () => {
    const r = calculatePricing({
      basePrice: 1000, childPrice: null, singleSupplement: 0, taxPercent: 0,
      adults: 1, children: 0, rooms: 1, addons: [],
      coupon: { discount_type: 'flat', discount_value: 500, max_discount: null, min_booking_value: 5000 },
    });
    expect(r.discountAmount).toBe(0);
  });

  it('never produces floating point drift', () => {
    const r = calculatePricing({
      basePrice: 3333.33, childPrice: null, singleSupplement: 0, taxPercent: 18,
      adults: 3, children: 0, rooms: 1, addons: [], coupon: null,
    });
    expect(Number.isInteger(Math.round(r.totalAmount * 100))).toBe(true);
  });
});
