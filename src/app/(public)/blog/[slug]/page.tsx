import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { createClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from('blog_posts').select('title, seo_title, seo_description, excerpt').eq('slug', params.slug).maybeSingle();
  if (!data) return { title: 'Post not found' };
  return { title: data.seo_title ?? data.title, description: data.seo_description ?? data.excerpt ?? undefined, alternates: { canonical: `/blog/${params.slug}` } };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from('blog_posts').select('*').eq('slug', params.slug).eq('is_published', true).maybeSingle();
  if (!data) notFound();
  return (
    <Section>
      <article className="prose mx-auto max-w-3xl text-maroon-700">
        <h1 className="text-3xl text-maroon-900">{data.title}</h1>
        <p className="text-sm text-maroon-400">By {data.author_name}</p>
        <p className="mt-6 whitespace-pre-line">{data.body}</p>
      </article>
    </Section>
  );
}
