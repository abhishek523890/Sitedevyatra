import { Section } from '@/components/ui/Section';
export const metadata = { title: 'About Us', description: 'About DevYatra India — trusted pilgrimage travel.' };
export default function AboutPage() {
  return (
    <Section title="About DevYatra India" subtitle="Faith-first journeys, professionally managed.">
      <div className="prose max-w-none text-maroon-700">
        <p>DevYatra India is a pilgrimage-focused travel platform dedicated to making sacred journeys
        across India safe, comfortable and meaningful. This is placeholder company copy — replace it
        with your own story, mission and team details.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[['🙏','Purpose-led','We design every itinerary around darshan and devotion.'],
            ['🛡️','Safety-first','Trained guides and 24×7 assistance on every trip.'],
            ['💬','Always reachable','Real humans on WhatsApp and phone, before and during travel.']].map(([i,t,d])=>(
            <div key={t} className="card p-6"><div className="text-3xl">{i}</div>
              <h3 className="mt-2 text-lg text-maroon-900">{t}</h3><p className="text-sm text-maroon-500">{d}</p></div>
          ))}
        </div>
      </div>
    </Section>
  );
}
