import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { createClient } from '@/lib/supabase/server';
export const metadata = { title: 'Travel Guides', description: 'Pilgrimage travel guides and tips.', alternates:{canonical:'/blog'} };
export const revalidate = 600;
export default async function BlogPage() {
  const supabase = createClient();
  const { data } = await supabase.from('blog_posts').select('title, slug, excerpt, author_name, published_at').eq('is_published', true).order('published_at', { ascending: false });
  const posts = data ?? [];
  return (
    <Section title="Travel Guides & Blog" subtitle="Tips for a safe and meaningful yatra.">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card-hover p-6">
            <h3 className="text-lg text-maroon-900">{p.title}</h3>
            <p className="mt-2 text-sm text-maroon-500 line-clamp-3">{p.excerpt}</p>
            <p className="mt-3 text-xs text-maroon-400">By {p.author_name}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
