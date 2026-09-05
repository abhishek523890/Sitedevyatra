import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { publicEnv } from '@/lib/env';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'DevYatra India — Pilgrimage & Spiritual Travel',
    template: '%s | DevYatra India',
  },
  description:
    'Book Char Dham, Do Dham, Kedarnath, Badrinath and more with DevYatra India. Trusted guided pilgrimage packages with comfortable stays and 24×7 support.',
  keywords: ['Char Dham Yatra', 'Kedarnath', 'Badrinath', 'pilgrimage packages', 'DevYatra India'],
  openGraph: {
    type: 'website',
    siteName: 'DevYatra India',
    title: 'DevYatra India — Pilgrimage & Spiritual Travel',
    description: 'Trusted guided pilgrimage packages across India.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // lang can be switched to "hi" once Hindi translations are wired via the i18n dictionary.
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
