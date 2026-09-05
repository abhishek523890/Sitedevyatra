import { Section } from '@/components/ui/Section';
export const metadata = { title: 'Contact Us', description: 'Get in touch with DevYatra India.' };
export default function ContactPage() {
  return (
    <Section title="Contact Us" subtitle="We usually respond within a few hours.">
      <div className="grid gap-8 lg:grid-cols-2">
        <form action="/api/enquiry" method="post" className="card space-y-4 p-6">
          <div><label className="label">Name</label><input name="name" required className="input" /></div>
          <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
          <div><label className="label">Phone</label><input name="phone" className="input" /></div>
          <div><label className="label">Message</label><textarea name="message" rows={4} required className="input" /></div>
          {/* CAPTCHA placeholder: render your hCaptcha/Turnstile widget here. */}
          <button className="btn-primary w-full" type="submit">Send Enquiry</button>
        </form>
        <div className="card space-y-3 p-6 text-sm text-maroon-700">
          <h3 className="text-lg text-maroon-900">Reach us directly</h3>
          <p>📞 +91 90000 00000</p>
          <p>✉️ support@devyatra.example.com</p>
          <p>📍 Haridwar, Uttarakhand, India</p>
          <p className="text-maroon-400">Hours: 9am–8pm IST, all days</p>
        </div>
      </div>
    </Section>
  );
}
