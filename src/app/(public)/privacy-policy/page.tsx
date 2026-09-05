import { PolicyPage } from '@/components/layout/PolicyPage';
export const metadata = { title: 'Privacy Policy' };
export default function Page() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>We collect only the personal information needed to process your booking (contact, traveller
      and, where operationally required, identification details). Identification documents are stored
      privately and accessed via signed URLs only. You may request data deletion at any time.</p>
      <p>We do not sell your data. Medical/accessibility details are collected minimally and used only
      to arrange assistance.</p>
    </PolicyPage>
  );
}
