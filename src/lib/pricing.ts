/**
 * Server-side pricing engine — the single source of truth for money.
 *
 * The browser NEVER sends a trusted total. It sends selections (package,
 * departure, adults, children, rooms, add-ons, coupon code). The server
 * recomputes every figure from current database values.
 *
 * All money is handled in integer paise internally to avoid float errors,
 * then returned as fixed 2-decimal numbers.
 */

export interface PricingInput {
  basePrice: number; // effective adult price (discounted ?? base)
  childPrice: number | null;
  singleSupplement: number;
  taxPercent: number;
  adults: number;
  children: number;
  rooms: number;
  addons: { name: string; unitPrice: number; quantity: number }[];
  coupon?: {
    discount_type: 'percent' | 'flat';
    discount_value: number;
    max_discount: number | null;
    min_booking_value: number;
  } | null;
  advancePercent?: number; // default 25%
}

export interface PricingBreakdown {
  packageAmount: number;
  addonsAmount: number;
  roomCharges: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
}

const toPaise = (rupees: number) => Math.round(rupees * 100);
const toRupees = (paise: number) => Math.round(paise) / 100;

export function calculatePricing(input: PricingInput): PricingBreakdown {
  const {
    basePrice,
    childPrice,
    singleSupplement,
    taxPercent,
    adults,
    children,
    rooms,
    addons,
    coupon,
    advancePercent = 25,
  } = input;

  const effectiveChild = childPrice ?? Math.round(basePrice * 0.7 * 100) / 100;

  // Package amount = adults * adult price + children * child price.
  let packagePaise = adults * toPaise(basePrice) + children * toPaise(effectiveChild);

  // Room charges: single-occupancy supplement when rooms exceed a shared baseline.
  // Baseline: 2 travellers per room. Extra rooms attract the single supplement.
  const travellers = adults + children;
  const sharedRooms = Math.ceil(travellers / 2);
  const extraRooms = Math.max(0, rooms - sharedRooms);
  const roomPaise = extraRooms * toPaise(singleSupplement);

  // Add-ons.
  const addonsPaise = addons.reduce(
    (sum, a) => sum + toPaise(a.unitPrice) * Math.max(0, a.quantity),
    0,
  );

  const subtotalPaise = packagePaise + roomPaise + addonsPaise;

  // Coupon discount (applied to subtotal before tax).
  let discountPaise = 0;
  if (coupon && subtotalPaise >= toPaise(coupon.min_booking_value)) {
    if (coupon.discount_type === 'percent') {
      discountPaise = Math.round((subtotalPaise * coupon.discount_value) / 100);
    } else {
      discountPaise = toPaise(coupon.discount_value);
    }
    if (coupon.max_discount != null) {
      discountPaise = Math.min(discountPaise, toPaise(coupon.max_discount));
    }
    discountPaise = Math.min(discountPaise, subtotalPaise);
  }

  const taxablePaise = subtotalPaise - discountPaise;
  const taxPaise = Math.round((taxablePaise * taxPercent) / 100);
  const totalPaise = taxablePaise + taxPaise;
  const advancePaise = Math.round((totalPaise * advancePercent) / 100);

  return {
    packageAmount: toRupees(packagePaise),
    addonsAmount: toRupees(addonsPaise),
    roomCharges: toRupees(roomPaise),
    subtotal: toRupees(subtotalPaise),
    discountAmount: toRupees(discountPaise),
    taxAmount: toRupees(taxPaise),
    totalAmount: toRupees(totalPaise),
    advanceAmount: toRupees(advancePaise),
    remainingAmount: toRupees(totalPaise - advancePaise),
  };
}
