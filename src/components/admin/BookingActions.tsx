'use client';

/**
 * Admin action panel for a booking. Calls server actions that RE-CHECK the
 * caller's role on the server — the UI buttons are convenience, not security.
 * Destructive actions (cancel) show a confirmation dialog.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { BookingStatus } from '@/types/database';
import { updateBookingStatus, recordPayment } from '@/app/admin/actions';

const STATUS_OPTIONS: BookingStatus[] = [
  'new',
  'awaiting_confirmation',
  'confirmed',
  'payment_pending',
  'partially_paid',
  'fully_paid',
  'cancelled',
  'completed',
  'refunded',
];

export function BookingActions({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('manual');
  const [message, setMessage] = useState<string | null>(null);

  function changeStatus() {
    if (status === 'cancelled' && !confirm('Cancel this booking? This will notify the customer.')) return;
    startTransition(async () => {
      const res = await updateBookingStatus(bookingId, status);
      setMessage(res.ok ? 'Status updated.' : res.error ?? 'Failed.');
      if (res.ok) router.refresh();
    });
  }

  function addPayment() {
    const value = Number(amount);
    if (!(value > 0)) return setMessage('Enter a valid amount.');
    startTransition(async () => {
      const res = await recordPayment(bookingId, value, method);
      setMessage(res.ok ? 'Payment recorded.' : res.error ?? 'Failed.');
      if (res.ok) {
        setAmount('');
        router.refresh();
      }
    });
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      {message && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">
          {message}
        </div>
      )}

      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold text-maroon-900">Update status</h3>
        <select className="input mb-3" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button className="btn-primary w-full" disabled={pending} onClick={changeStatus}>
          {pending ? 'Working…' : 'Apply status'}
        </button>
        <p className="mt-2 text-xs text-maroon-400">
          Setting “confirmed” decrements seats atomically in the database.
        </p>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold text-maroon-900">Record payment</h3>
        <input className="input mb-2" type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select className="input mb-3" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="manual">Manual / Offline</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="cash">Cash</option>
        </select>
        <button className="btn-secondary w-full" disabled={pending} onClick={addPayment}>
          Add payment
        </button>
      </div>
    </aside>
  );
}
