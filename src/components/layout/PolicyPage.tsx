import { Section } from '@/components/ui/Section';
export function PolicyPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section title={title}>
      <div className="prose mx-auto max-w-3xl text-sm text-maroon-700">
        <p className="rounded-lg bg-amber-50 p-3 text-amber-800">
          This is placeholder legal text for demonstration. Replace with policy reviewed by your legal advisor before going live.
        </p>
        {children}
      </div>
    </Section>
  );
}
