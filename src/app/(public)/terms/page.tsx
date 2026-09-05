import { PolicyPage } from '@/components/layout/PolicyPage';
export const metadata = { title: 'Terms & Conditions' };
export default function Page() {
  return (
    <PolicyPage title="Terms & Conditions">
      <p>Submitting a booking request does not guarantee confirmation. Seats are confirmed only after
      our team verifies availability. Prices are recalculated on our server and may differ from
      estimates shown during booking. Itineraries may change due to weather or government advisories.</p>
    </PolicyPage>
  );
}
