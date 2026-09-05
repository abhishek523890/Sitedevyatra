import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { publicEnv } from '@/lib/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL;
  const staticRoutes = ['', '/packages', '/destinations', '/about', '/contact', '/faq', '/blog', '/custom-tour']
    .map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));

  try {
    const supabase = createClient();
    const [{ data: pkgs }, { data: dests }, { data: posts }] = await Promise.all([
      supabase.from('packages').select('slug, updated_at').eq('status', 'published'),
      supabase.from('destinations').select('slug, updated_at').eq('is_active', true),
      supabase.from('blog_posts').select('slug, updated_at').eq('is_published', true),
    ]);
    const dyn = [
      ...(pkgs ?? []).map((p) => ({ url: `${base}/packages/${p.slug}`, lastModified: new Date(p.updated_at) })),
      ...(dests ?? []).map((d) => ({ url: `${base}/destinations/${d.slug}`, lastModified: new Date(d.updated_at) })),
      ...(posts ?? []).map((b) => ({ url: `${base}/blog/${b.slug}`, lastModified: new Date(b.updated_at) })),
    ];
    return [...staticRoutes, ...dyn];
  } catch {
    return staticRoutes;
  }
}
