'use client';

import { publicEnv } from '@/lib/env';

/** Floating WhatsApp enquiry button. */
export function WhatsAppButton() {
  const number = publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    'Namaste! I would like to enquire about a DevYatra India pilgrimage package.',
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Enquire on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg transition-transform hover:scale-110"
    >
      💬
    </a>
  );
}
