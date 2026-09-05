import { Section } from '@/components/ui/Section';
export const metadata = { title: 'FAQ', description: 'Frequently asked questions about DevYatra India pilgrimages.' };
const faqs = [
  ['Do I need to pay to book?','No. You can submit a booking request without payment. Our team confirms availability first, then shares payment options.'],
  ['Is the price on the site final?','The displayed price is an estimate. The final amount is recalculated on our server from current rates before confirmation.'],
  ['How fit do I need to be for Char Dham?','High-altitude shrines involve trekking. We share a fitness guide and offer pony/palki and helicopter options on select routes.'],
  ['What is the cancellation policy?','Refunds follow our published Cancellation & Refund Policy, based on how far ahead you cancel.'],
  ['Can you build a custom itinerary?','Yes — use the Custom Tour Request page and we will craft a plan for your dates, group and budget.'],
];
export default function FaqPage() {
  return (
    <Section title="Frequently Asked Questions">
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map(([q,a])=>(
          <details key={q} className="card p-5">
            <summary className="cursor-pointer text-base font-medium text-maroon-900">{q}</summary>
            <p className="mt-2 text-sm text-maroon-600">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
