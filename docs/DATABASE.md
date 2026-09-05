# Database — DevYatra India

Money is always `numeric(12,2)` (never float). Every table has `created_at`; important
tables have `updated_at`, `created_by/updated_by`, and soft-delete (`deleted_at`).
RLS is enabled on all tables (see `0002_rls.sql`).

## Entity-relationship summary

```
auth.users ─1─1─ profiles
auth.users ─1─N─ user_roles              (role-based access)

destinations ─1─N─ packages
packages ─1─N─ package_images
packages ─1─N─ package_itinerary
packages ─1─N─ package_inclusions
packages ─1─N─ package_exclusions
packages ─1─N─ package_departures         (seats: total / available)

customers ─0..1─ auth.users               (guest or linked account)

bookings ─N─1─ packages
bookings ─N─0..1─ package_departures
bookings ─N─0..1─ customers
bookings ─N─0..1─ coupons
bookings ─1─N─ booking_travellers
bookings ─1─N─ booking_addons
bookings ─1─N─ booking_status_history
bookings ─1─N─ payments
bookings ─1─N─ payment_transactions       (raw provider events, idempotent)
coupons  ─1─N─ coupon_usage ─N─1─ bookings

enquiries, custom_tour_requests, reviews, support_requests   (leads & feedback)
blog_posts, email_templates, media_library, website_settings (content)
email_logs ─N─0..1─ bookings              (delivery audit)
notifications ─N─1─ auth.users
newsletter_subscribers
audit_logs                                (who changed what)
```

## Key tables

### bookings (the core)
- `reference` unique, human-readable `DYI-2026-000001` (via `next_booking_reference()`).
- `idempotency_key` unique → blocks duplicate submissions on refresh/double-click.
- Server-computed money: `package_amount, addons_amount, room_charges, discount_amount,
  tax_amount, total_amount, advance_amount, paid_amount`.
- `status` (9-state enum) + `payment_status` (5-state enum).
- `is_demo` flags seed data. `deleted_at` = soft delete for financial safety.
- Constraint `chk_paid_le_total` keeps payments ≤ total.

### package_departures (inventory)
- `total_seats`, `available_seats` with `chk_seats` (available ≤ total).
- Decremented **only** by `confirm_booking_seats(p_booking_id)` — a `security definer`
  function that `SELECT … FOR UPDATE` locks the row, checks capacity, decrements, flips the
  booking to `confirmed`, and writes status history — all in one transaction.

### payment_transactions (webhook safety)
- Unique `(provider, provider_txn_id)` + `processed` boolean → **idempotent** webhooks.
- Stores raw payload + signature for audit. Financial state changes only on verified success.

## Enums
- `app_role`: super_admin, booking_manager, content_manager, finance_viewer, support_agent
- `booking_status`: new, awaiting_confirmation, confirmed, payment_pending, partially_paid,
  fully_paid, cancelled, completed, refunded
- `payment_status`: unpaid, partially_paid, paid, failed, refunded
- `package_status`: draft, published, inactive, sold_out
- `difficulty_level`: easy, moderate, challenging, difficult

## RLS highlights
- **Public read** only for `status='published'` packages / `is_active` destinations /
  approved reviews / published blog posts.
- **Customers** read only their own bookings/travellers/payments (`auth.uid() = user_id`).
- **Staff** (`is_staff()`) manage operational tables; finance-scoped policies gate payments.
- **Public form inserts** (enquiries, custom tours, newsletter) allowed for anon, but reads
  are staff-only.
- **Documents** bucket: readable only by the owner (`foldername[1] = auth.uid()`) or staff.

## Helper functions
- `has_role(app_role)` / `is_staff()` — used throughout policies.
- `next_booking_reference()` — sequence-backed reference generator.
- `confirm_booking_seats(uuid)` — atomic seat confirmation.
- `handle_new_user()` — trigger creating a `profiles` row on signup.

## Storage buckets
- `public-media` (public read, staff write) — package/gallery/blog images.
- `documents` (private) — traveller IDs / invoices; access via **signed URLs** only.
