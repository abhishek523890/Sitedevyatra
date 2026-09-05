/** Formatting helpers: Indian currency, dates, slugs, badges. */

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(input: string | Date, tz = 'Asia/Kolkata'): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: tz,
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Tailwind classes for booking status badges. */
export const bookingStatusStyles: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700',
  awaiting_confirmation: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  payment_pending: 'bg-orange-100 text-orange-800',
  partially_paid: 'bg-sky-100 text-sky-800',
  fully_paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-indigo-100 text-indigo-800',
  refunded: 'bg-purple-100 text-purple-800',
};

export function statusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
