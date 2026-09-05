# 🕉️ DevYatra India — Pilgrimage Travel Booking Platform

A full-stack, mobile-responsive pilgrimage travel booking application built with
**Next.js 14 (App Router) + TypeScript + Tailwind CSS** on a **Supabase (free tier)**
backend — PostgreSQL, Auth, Storage and Row Level Security.

> This is a working application scaffold with real database records, a secure
> server-side booking flow, a customer dashboard and a role-based admin panel.
> All sample data is clearly flagged as demonstration data and all images/descriptions
> are original placeholders you should replace before going live.

---

## ✨ What’s included

| Area | Status |
|---|---|
| Public site (home, packages, package details, destinations, blog, policies, FAQ, custom tour, contact) | ✅ Built |
| Multi-step booking with **server-side price recalculation** | ✅ Built |
| Duplicate-submission prevention (idempotency key) | ✅ Built |
| Booking reference generator `DYI-2026-000001` | ✅ Built |
| Customer auth (register / login / reset) + dashboard | ✅ Built |
| Role-based admin panel (`/admin`) with dashboard, bookings, packages, enquiries | ✅ Built |
| **Atomic seat confirmation** (row-locked DB transaction) | ✅ Built |
| Modular transactional email (Resend adapter) + email logs | ✅ Built |
| Payment provider abstraction + **verified, idempotent webhook** | ✅ Built |
| 32-table SQL schema + RLS policies + storage buckets | ✅ Built |
| Seed data (8 packages, 8 destinations, 10 departures, 15 demo bookings, 8 reviews, 5 posts) | ✅ Built |
| SEO (dynamic metadata, sitemap, robots, JSON-LD), i18n (EN/HI) architecture | ✅ Built |
| Vitest tests for pricing, validation | ✅ Built |
| CI workflow + Vercel/Netlify deploy config | ✅ Built |

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full design, folder tree and ER summary,
and **[docs/DATABASE.md](docs/DATABASE.md)** for the entity relationships.

---

## 🧰 Tech stack

- **Next.js 14** App Router, Server Components, Server Actions, Route Handlers
- **TypeScript** + **Zod** validation on every server input
- **Tailwind CSS** with a saffron / maroon / cream / gold design system
- **Supabase**: Postgres, Auth, Storage, RLS (all free-tier friendly)
- **Resend** email (swap-in adapter pattern; Brevo/SendGrid drop-in ready)
- **Vitest** for unit tests

---

## 🚀 Quick start (local)

### 1. Prerequisites
- Node.js **18.17+** (or 20+)
- A free **Supabase** account → <https://app.supabase.com>
- (Optional) A free **Resend** account for real emails → <https://resend.com>

### 2. Install
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env.local
# then fill in the Supabase + email values (see below)
```

### 4. Set up the database (see “Supabase setup”)
Run the three migrations, then the seed file, in the Supabase SQL Editor.

### 5. Run
```bash
npm run dev
# http://localhost:3000
```

### 6. Verify
```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest (pricing + validation)
npm run build       # production build
```

---

## 🗄️ Supabase setup (free tier)

1. **Create a project** at <https://app.supabase.com> (free plan, no card needed).
2. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(server-only — never expose)*
3. Open the **SQL Editor** and run, in order:
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_rls.sql`
   3. `supabase/migrations/0003_storage.sql`
   4. `supabase/seed/seed.sql` *(demo data — optional but recommended)*
4. Under **Authentication → Providers**, keep **Email** enabled. For local dev you can
   turn off “Confirm email” to sign in instantly.
5. Storage buckets `public-media` and `documents` are created by migration `0003`.

> **Free-tier note:** a Supabase free project pauses after ~7 days of inactivity.
> Just click *Restore* in the dashboard — your data is safe.

### Using the Supabase CLI instead (optional)
```bash
supabase link --project-ref <your-ref>
supabase db push                       # applies migrations
supabase db execute --file supabase/seed/seed.sql
```

---

## ✉️ Email provider setup (modular)

Default adapter is **Resend** (free 3,000 emails/month).

1. Create a Resend account and API key.
2. Set in `.env.local`:
   ```
   EMAIL_PROVIDER=resend
   EMAIL_API_KEY=re_xxx
   EMAIL_FROM_ADDRESS="DevYatra India <bookings@yourdomain.com>"
   OWNER_NOTIFICATION_EMAIL=you@yourdomain.com
   ```
3. **No key set?** The app automatically falls back to a **console adapter** that logs
   emails instead of sending — so booking still works offline.
4. To switch providers, add an adapter in `src/lib/email/providers/` and map it in
   `src/lib/email/index.ts → getProvider()`. Call sites never change.

Admins can edit email templates from the DB table `email_templates` (subject + HTML with
`{{placeholders}}`) without touching source code.

---

## 💳 Payments

The initial version ships with **“Pay Later / Request Confirmation”** and **manual admin
payment recording**. A provider abstraction (`src/lib/payments/provider.ts`) and a
**signature-verified, idempotent webhook** (`/api/webhooks/payment`) are included so you can
connect Razorpay/Stripe later.

- ⚠️ A booking is **never** marked paid because the browser hit a success page — only a
  verified webhook (or a manual admin record) updates payment state.
- Set `PAYMENT_WEBHOOK_SECRET` and point your provider’s webhook to `/api/webhooks/payment`.

---

## ▲ Deploy to Vercel (recommended)

1. Push this repo to GitHub (see below).
2. Import the repo at <https://vercel.com/new>.
3. Add all environment variables from `.env.example` in **Project → Settings → Environment Variables**.
4. Deploy. **Vercel’s GitHub integration auto-deploys every push to `main` to production** —
   this satisfies the “push to main = production deploy” requirement out of the box.
5. Set `NEXT_PUBLIC_SITE_URL` to your production URL and add it to Supabase
   **Authentication → URL Configuration → Redirect URLs**.

## ▲ Optional: Netlify
`netlify.toml` is included with the official Next.js plugin. Import the repo in Netlify,
add the same environment variables, and deploy.

---

## 🐙 Push to GitHub

```bash
git init
git add .
git commit -m "DevYatra India: initial full-stack scaffold"
git branch -M main
git remote add origin https://github.com/<you>/devyatra-india.git
git push -u origin main
```

---

## 👤 Create an admin user

Roles live in the `user_roles` table and are enforced by RLS + server checks.

1. Register a normal account through the site (`/register`) or Supabase Auth dashboard.
2. Find the user’s UUID under **Authentication → Users**.
3. In the SQL Editor:
   ```sql
   insert into user_roles (user_id, role)
   values ('<user-uuid>', 'super_admin');
   ```
4. Sign in and open **`/admin`**.

Available roles: `super_admin`, `booking_manager`, `content_manager`, `finance_viewer`, `support_agent`.

---

## 🧪 Testing & manual acceptance checklist

Automated:
```bash
npm test
```

Manual acceptance — see **[docs/TESTING.md](docs/TESTING.md)** for the full checklist
(registration, search, booking, server-side price recalculation, duplicate prevention,
admin authorization, webhook validation, email logging, seat updates, coupon validation).

---

## ✅ Production-readiness checklist

- [ ] Replace ALL placeholder text and images (see `public/images/placeholders/README.txt`)
- [ ] Review legal pages with a professional (privacy, terms, refund, disclaimer)
- [ ] Turn ON email confirmation in Supabase Auth; verify redirect URLs
- [ ] Set strong, unique secrets for every env var (never commit `.env.local`)
- [ ] Connect a real email provider and send a test booking
- [ ] Configure a payment provider + webhook secret before accepting money
- [ ] Add a CAPTCHA (hCaptcha/Turnstile) to public forms (architecture is ready)
- [ ] Enable Supabase automated backups / PITR (or schedule manual backups)
- [ ] Load real packages, departures and pricing; remove demo rows (`is_demo = true`)
- [ ] Run `npm run build` and Lighthouse; check mobile + accessibility

## 💾 Backup & recovery
- Supabase → **Database → Backups** for automated backups (plan-dependent).
- Manual: `supabase db dump --file backup.sql`.
- Keep migrations in version control so the schema is always reproducible.
- Demo data is idempotent-ish; re-running seed uses `on conflict do nothing` where possible.

---

## 📂 Project structure
See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the annotated folder tree.

## 📜 License & content
Original placeholder content only. Do not ship copyrighted images or descriptions.
