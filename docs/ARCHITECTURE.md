# Architecture — DevYatra India

## 1. Final architecture

```
Browser (Next.js Client Components)
        │  fetch / server actions (typed, Zod-validated)
        ▼
Next.js App Router (Vercel)
   ├─ Server Components  ──────────────► Supabase (anon key, RLS as the user)
   ├─ Server Actions     ──────────────► Supabase (anon)  +  Admin client (service role)
   ├─ Route Handlers /api ─────────────► forms, CSV export, payment webhook
   └─ Middleware (session refresh + route guard for /admin, /dashboard)
        │
        ▼
Supabase (free tier)
   ├─ PostgreSQL  (32 tables, constraints, indexes, triggers, RPC functions)
   ├─ Auth        (email/password, JWT, auto profile trigger)
   ├─ Storage     (public-media = public, documents = private/signed URLs)
   └─ RLS         (every table; role helpers has_role / is_staff)

External (modular):
   ├─ Email provider (Resend adapter → Brevo/SendGrid swappable)
   └─ Payment provider (abstraction + verified idempotent webhook)
```

### Trust boundary (most important design rule)
- The browser sends **selections**, never trusted money.
- `src/lib/pricing.ts` recomputes every figure on the server from DB values (integer paise).
- `src/app/(public)/booking/actions.ts` is the single write path for customer bookings:
  validate → recompute price → idempotency check → insert → emails (best-effort).
- Seats are decremented **only** on confirmation via the `confirm_booking_seats` DB
  function, which row-locks the departure to prevent overbooking.

---

## 2. Folder structure

```
devyatra/
├─ src/
│  ├─ app/
│  │  ├─ (public)/            # Public site (shared Navbar/Footer/WhatsApp layout)
│  │  │  ├─ page.tsx          # Home
│  │  │  ├─ packages/         # List + [slug] detail (dynamic SEO, JSON-LD)
│  │  │  ├─ destinations/     # List + [slug] detail
│  │  │  ├─ booking/          # Multi-step booking + actions.ts + confirmation/
│  │  │  ├─ blog/             # List + [slug]
│  │  │  ├─ about, contact, faq, custom-tour
│  │  │  └─ privacy-policy, terms, refund-policy, disclaimer
│  │  ├─ (auth)/              # login, register, forgot-password + actions.ts
│  │  ├─ dashboard/           # Customer area (guarded) — overview, bookings, profile
│  │  ├─ admin/               # Role-guarded admin — dashboard, bookings, packages, enquiries
│  │  ├─ api/                 # enquiry, custom-tour, newsletter, profile,
│  │  │                       #   admin/export-bookings, webhooks/payment
│  │  ├─ auth/                # callback + signout route handlers
│  │  ├─ sitemap.ts, robots.ts, not-found.tsx, layout.tsx, globals.css
│  ├─ components/
│  │  ├─ ui/                  # Badge, Section, Skeleton, EmptyState
│  │  ├─ layout/              # Navbar, Footer, WhatsAppButton, PolicyPage
│  │  ├─ packages/            # PackageCard
│  │  ├─ booking/             # BookingForm (multi-step client component)
│  │  └─ admin/               # BookingActions (status + payment controls)
│  ├─ lib/
│  │  ├─ supabase/            # client, server, admin (service role), middleware
│  │  ├─ email/               # index + types + providers/{resend,console}
│  │  ├─ payments/            # provider abstraction + webhook signature verify
│  │  ├─ validation/          # Zod schemas (single source of input truth)
│  │  ├─ utils/               # format (INR/date/slug/badges), cn, rateLimit
│  │  ├─ pricing.ts           # server pricing engine (integer paise)
│  │  ├─ queries.ts           # typed data-access helpers
│  │  ├─ auth.ts              # getCurrentUser / roles / isStaff
│  │  ├─ env.ts               # validated public + server env access
│  │  └─ i18n.ts              # EN/HI dictionary + t()
│  ├─ types/database.ts       # hand-maintained DB types
│  └─ middleware.ts           # session refresh + protected route guard
├─ supabase/
│  ├─ migrations/0001_schema.sql, 0002_rls.sql, 0003_storage.sql
│  └─ seed/seed.sql
├─ tests/                     # vitest: pricing, validation
├─ scripts/seed.mjs
├─ docs/                      # ARCHITECTURE, DATABASE, TESTING
├─ .github/workflows/ci.yml
├─ .env.example, vercel.json, netlify.toml, tailwind.config.ts, next.config.mjs
```

---

## 3. Implementation phases (mapping to the brief)

- **Phase 1** — setup, schema, auth, public layout, seed → `supabase/*`, `layout.tsx`, `(public)/layout.tsx`, `(auth)/*`
- **Phase 2** — package listing, details, search/filter → `packages/*`, `queries.ts`
- **Phase 3** — booking flow, price calc, confirmation → `booking/*`, `pricing.ts`, `BookingForm.tsx`
- **Phase 4** — emails, customer dashboard → `lib/email/*`, `dashboard/*`
- **Phase 5** — admin panel, content & booking management → `admin/*`, `admin/actions.ts`
- **Phase 6** — dashboard/reports, SEO, accessibility, tests, deploy → `admin/page.tsx`, `sitemap.ts`, `robots.ts`, `tests/*`, CI

---

## 4. Security model (layers)

1. **Middleware** refreshes the session and redirects unauthenticated users away from
   `/admin` and `/dashboard`.
2. **Server checks** in every admin action re-verify role via `hasAnyRole()`.
3. **RLS** in Postgres is the final authority — even a leaked anon key cannot read other
   users’ bookings or write admin tables.
4. **Service-role key** is used only in `src/lib/supabase/admin.ts` (marked `server-only`)
   and never bundled to the client.
5. **Zod** validates all inputs; **rate limiting** guards public forms; documents live in a
   **private** bucket served via signed URLs.
