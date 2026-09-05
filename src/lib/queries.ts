/**
 * Server-side data access helpers. All run under RLS via the request-bound client,
 * so public queries naturally return only published/active rows.
 */
import { createClient } from '@/lib/supabase/server';
import type { Package, Destination, PackageDeparture } from '@/types/database';

export async function getFeaturedPackages(limit = 6): Promise<Package[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('packages')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as Package[]) ?? [];
}

export async function getAllPackages(): Promise<Package[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('packages')
    .select('*')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .order('base_price', { ascending: true });
  return (data as Package[]) ?? [];
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('packages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();
  return (data as Package) ?? null;
}

export async function getPackageDepartures(packageId: string): Promise<PackageDeparture[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('package_departures')
    .select('*')
    .eq('package_id', packageId)
    .eq('is_active', true)
    .gte('departure_date', new Date().toISOString().slice(0, 10))
    .order('departure_date', { ascending: true });
  return (data as PackageDeparture[]) ?? [];
}

export async function getFeaturedDestinations(limit = 8): Promise<Destination[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('destinations')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .limit(limit);
  return (data as Destination[]) ?? [];
}

export async function getApprovedReviews(limit = 6) {
  const supabase = createClient();
  const { data } = await supabase
    .from('reviews')
    .select('author_name, rating, title, body')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}
