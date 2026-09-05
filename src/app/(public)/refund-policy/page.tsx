import { PolicyPage } from '@/components/layout/PolicyPage';
export const metadata = { title: 'Cancellation & Refund Policy' };
export default function Page() {
  return (
    <PolicyPage title="Cancellation & Refund Policy">
      <ul>
        <li>30+ days before departure: placeholder — e.g. 90% refund.</li>
        <li>15–29 days: placeholder — e.g. 50% refund.</li>
        <li>Under 15 days: placeholder — e.g. no refund.</li>
      </ul>
      <p>Refunds are processed to the original payment method within a defined number of business days.</p>
    </PolicyPage>
  );
}
