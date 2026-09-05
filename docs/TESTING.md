# Testing — DevYatra India

## Automated (Vitest)

```bash
npm test
```

Covered:
- **Pricing engine** (`tests/pricing.test.ts`)
  - adult-only total + tax + 25% advance
  - child pricing + add-ons
  - percentage coupon capped at `max_discount`
  - coupon ignored below `min_booking_value`
  - no floating-point drift (integer-paise math)
- **Validation** (`tests/validation.test.ts`)
  - booking rejected without accepted terms
  - valid enquiry accepted
  - invalid email rejected

> Extend with integration tests against a Supabase test project for the booking action,
> webhook signature verification and RLS. Use a service-role client seeded with a throwaway
> schema; assert that a non-staff user cannot read another user’s booking.

## Manual acceptance checklist

### Auth
- [ ] Register a new account; receive verification email (or auto-confirm in dev).
- [ ] Log in; protected `/dashboard` becomes accessible.
- [ ] Log out clears the session; `/dashboard` redirects to `/login`.
- [ ] Password reset email link works via `/auth/callback`.

### Packages & search
- [ ] Home shows featured packages and destinations from the DB.
- [ ] `/packages` filters by search text, category, duration, and sorts by price.
- [ ] Package detail shows gallery, itinerary, inclusions/exclusions, departures, related.
- [ ] Dynamic `<title>`/meta and JSON-LD appear in page source.

### Booking (critical)
- [ ] Complete all 5 steps; a `DYI-YYYY-000001` reference is generated.
- [ ] **Server price ≠ tampered client price**: change the estimate in devtools — the saved
      booking still uses the server-recomputed `total_amount`.
- [ ] **Duplicate prevention**: refresh/resubmit with the same idempotency key → one booking.
- [ ] Booking is saved with status `awaiting_confirmation`, payment `unpaid`.
- [ ] Availability is **not** reduced yet.

### Emails
- [ ] With no `EMAIL_API_KEY`, booking still succeeds (console adapter) and an `email_logs`
      row is written.
- [ ] With Resend configured, customer + owner emails send; `provider_id` recorded.
- [ ] Forcing an email error does **not** fail the booking (row still saved; error logged).

### Admin authorization
- [ ] A logged-in non-staff user hitting `/admin` is redirected to `/dashboard`.
- [ ] Only `super_admin`/`booking_manager` can change booking status (server rejects others).
- [ ] Only finance-capable roles can record payments.

### Seat confirmation
- [ ] Setting a booking to `confirmed` decrements `available_seats` by traveller count.
- [ ] Confirming when seats are insufficient raises an error and does not oversell.

### Payments / webhook
- [ ] `/api/webhooks/payment` returns 401 for a bad/missing signature.
- [ ] A valid `success` event marks the booking paid and inserts a `payments` row.
- [ ] Re-sending the same `provider_txn_id` is deduped (`processed = true`).
- [ ] Browser hitting a “success” URL alone never changes payment status.

### Coupons
- [ ] Valid active coupon reduces the server-side total within limits.
- [ ] Expired / over-limit / below-min coupons are ignored server-side.

### Accessibility & responsive
- [ ] Keyboard-only navigation works; visible focus rings present.
- [ ] Mobile layout (≤375px) has no horizontal scroll; tables become scrollable/cards.
- [ ] Colour contrast passes on saffron/maroon buttons and text.

### SEO
- [ ] `/sitemap.xml` lists packages, destinations, blog posts.
- [ ] `/robots.txt` disallows `/admin`, `/dashboard`, `/api`.
