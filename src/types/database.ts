/**
 * Hand-maintained TypeScript types mirroring the SQL schema.
 * For a fully generated version run:
 *   supabase gen types typescript --project-id <ref> > src/types/supabase.ts
 * and import from there instead.
 */

export type AppRole =
  | 'super_admin'
  | 'booking_manager'
  | 'content_manager'
  | 'finance_viewer'
  | 'support_agent';

export type PackageStatus = 'draft' | 'published' | 'inactive' | 'sold_out';
export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'difficult';

export type BookingStatus =
  | 'new'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'payment_pending'
  | 'partially_paid'
  | 'fully_paid'
  | 'cancelled'
  | 'completed'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'failed' | 'refunded';

export interface Destination {
  id: string;
  name: string;
  slug: string;
  state: string | null;
  region: string | null;
  short_desc: string | null;
  description: string | null;
  cover_image: string | null;
  best_season: string | null;
  altitude_m: number | null;
  is_featured: boolean;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  short_desc: string | null;
  description: string | null;
  destination_id: string | null;
  category: string | null;
  days: number;
  nights: number;
  start_location: string | null;
  end_location: string | null;
  base_price: number;
  discounted_price: number | null;
  child_price: number | null;
  single_supplement: number;
  tax_percent: number;
  max_group_size: number;
  difficulty: DifficultyLevel;
  best_season: string | null;
  cover_image: string | null;
  highlights: string[];
  inclusions_text: string | null;
  exclusions_text: string | null;
  accommodation: string | null;
  transportation: string | null;
  meals: string | null;
  pickup_drop: string | null;
  required_documents: string | null;
  health_fitness: string | null;
  travel_advisory: string | null;
  cancellation_policy: string | null;
  terms_conditions: string | null;
  status: PackageStatus;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PackageDeparture {
  id: string;
  package_id: string;
  departure_date: string;
  total_seats: number;
  available_seats: number;
  price_override: number | null;
  is_active: boolean;
}

export interface Booking {
  id: string;
  reference: string;
  user_id: string | null;
  package_id: string;
  departure_id: string | null;
  departure_date: string | null;
  adults: number;
  children: number;
  rooms: number;
  package_amount: number;
  addons_amount: number;
  room_charges: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  advance_amount: number;
  paid_amount: number;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  special_requirements: string | null;
  is_demo: boolean;
  created_at: string;
}
