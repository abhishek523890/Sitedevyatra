/**
 * Lightweight i18n dictionary. English is the default.
 * Hindi strings can be filled in without restructuring the app — every UI
 * string should be referenced via t('key', locale).
 */
export type Locale = 'en' | 'hi';

type Dict = Record<string, { en: string; hi: string }>;

export const dictionary: Dict = {
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.packages': { en: 'Packages', hi: 'पैकेज' },
  'nav.destinations': { en: 'Destinations', hi: 'गंतव्य' },
  'nav.about': { en: 'About Us', hi: 'हमारे बारे में' },
  'nav.contact': { en: 'Contact', hi: 'संपर्क' },
  'nav.blog': { en: 'Travel Guides', hi: 'यात्रा गाइड' },
  'nav.login': { en: 'Login', hi: 'लॉगिन' },
  'nav.dashboard': { en: 'My Bookings', hi: 'मेरी बुकिंग' },
  'cta.bookNow': { en: 'Book Now', hi: 'अभी बुक करें' },
  'cta.enquire': { en: 'Enquire', hi: 'पूछताछ' },
  'cta.viewDetails': { en: 'View Details', hi: 'विवरण देखें' },
  'cta.whatsapp': { en: 'WhatsApp Enquiry', hi: 'व्हाट्सएप पूछताछ' },
  'home.heroTitle': {
    en: 'Journeys of Faith, Crafted with Care',
    hi: 'श्रद्धा की यात्राएँ, आस्था के साथ',
  },
  'home.heroSubtitle': {
    en: 'Guided Char Dham, Kedarnath, Badrinath and spiritual tours across India.',
    hi: 'भारत भर में निर्देशित चार धाम, केदारनाथ, बद्रीनाथ एवं आध्यात्मिक यात्राएँ।',
  },
  'search.destination': { en: 'Destination', hi: 'गंतव्य' },
  'search.date': { en: 'Travel Date', hi: 'यात्रा तिथि' },
  'search.duration': { en: 'Duration', hi: 'अवधि' },
  'search.travellers': { en: 'Travellers', hi: 'यात्री' },
  'search.button': { en: 'Search Packages', hi: 'पैकेज खोजें' },
};

export function t(key: string, locale: Locale = 'en'): string {
  return dictionary[key]?.[locale] ?? dictionary[key]?.en ?? key;
}
