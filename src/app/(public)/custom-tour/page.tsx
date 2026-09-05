import { Section } from '@/components/ui/Section';
export const metadata = { title: 'Custom Tour Request', description: 'Request a tailor-made pilgrimage itinerary.' };
export default function CustomTourPage() {
  return (
    <Section title="Request a Custom Yatra" subtitle="Tell us your plan — we will design it for you.">
      <form action="/api/custom-tour" method="post" className="card mx-auto max-w-2xl grid gap-4 p-6 sm:grid-cols-2">
        <div><label className="label">Name</label><input name="name" required className="input" /></div>
        <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
        <div><label className="label">Phone</label><input name="phone" required className="input" /></div>
        <div><label className="label">Travellers</label><input name="travellers" type="number" min={1} className="input" /></div>
        <div><label className="label">Preferred date</label><input name="preferredDate" type="date" className="input" /></div>
        <div><label className="label">Duration (days)</label><input name="durationDays" type="number" min={1} className="input" /></div>
        <div className="sm:col-span-2"><label className="label">Destinations of interest</label><input name="destinations" className="input" placeholder="e.g. Kedarnath, Badrinath, Rishikesh" /></div>
        <div className="sm:col-span-2"><label className="label">Budget (₹)</label><input name="budget" type="number" className="input" /></div>
        <div className="sm:col-span-2"><label className="label">Requirements</label><textarea name="requirements" rows={4} className="input" /></div>
        <button className="btn-primary sm:col-span-2" type="submit">Submit Request</button>
      </form>
    </Section>
  );
}
