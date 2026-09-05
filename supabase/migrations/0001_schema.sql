-- =====================================================================
-- DevYatra India :: 0001_schema.sql
-- Core schema: enums, tables, keys, constraints, indexes, triggers.
-- Money is ALWAYS numeric(12,2). Never floating point.
-- Run in Supabase SQL Editor (or `supabase db push`).
-- =====================================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "unaccent";       -- slug/search helpers

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
do $$ begin
  create type app_role         as enum ('super_admin','booking_manager','content_manager','finance_viewer','support_agent');
  create type package_status    as enum ('draft','published','inactive','sold_out');
  create type difficulty_level  as enum ('easy','moderate','challenging','difficult');
  create type booking_status    as enum ('new','awaiting_confirmation','confirmed','payment_pending','partially_paid','fully_paid','cancelled','completed','refunded');
  create type payment_status    as enum ('unpaid','partially_paid','paid','failed','refunded');
  create type payment_method    as enum ('pay_later','manual','razorpay','stripe','upi','bank_transfer','cash');
  create type enquiry_status    as enum ('new','in_progress','responded','closed');
  create type gender_type       as enum ('male','female','other','prefer_not_to_say');
  create type email_status      as enum ('queued','sent','failed','delivered','bounced');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- PROFILES + ROLES  (profiles.id == auth.users.id)
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  avatar_url    text,
  country       text default 'India',
  state         text,
  city          text,
  address       text,
  locale        text default 'en' check (locale in ('en','hi')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        app_role not null,
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);
create index if not exists idx_user_roles_user on user_roles(user_id);

-- ---------------------------------------------------------------------
-- DESTINATIONS
-- ---------------------------------------------------------------------
create table if not exists destinations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  state           text,
  region          text,
  short_desc      text,
  description     text,
  cover_image     text,
  best_season     text,
  altitude_m      integer,
  is_featured     boolean not null default false,
  is_active       boolean not null default true,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists idx_destinations_active on destinations(is_active) where deleted_at is null;

-- ---------------------------------------------------------------------
-- PACKAGES
-- ---------------------------------------------------------------------
create table if not exists packages (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  slug                 text not null unique,
  short_desc           text,
  description          text,
  destination_id       uuid references destinations(id) on delete set null,
  category             text,                       -- Char Dham, Do Dham, single-shrine, city tour, custom...
  days                 int  not null check (days >= 1),
  nights               int  not null check (nights >= 0),
  start_location       text,
  end_location         text,
  base_price           numeric(12,2) not null check (base_price >= 0),
  discounted_price     numeric(12,2) check (discounted_price >= 0),
  child_price          numeric(12,2) check (child_price >= 0),
  single_supplement    numeric(12,2) not null default 0 check (single_supplement >= 0),
  tax_percent          numeric(5,2)  not null default 5 check (tax_percent >= 0 and tax_percent <= 100),
  max_group_size       int  not null default 30 check (max_group_size >= 1),
  difficulty           difficulty_level not null default 'moderate',
  best_season          text,
  cover_image          text,
  highlights           text[] not null default '{}',
  inclusions_text      text,
  exclusions_text      text,
  accommodation        text,
  transportation       text,
  meals                text,
  pickup_drop          text,
  required_documents   text,
  health_fitness       text,
  travel_advisory      text,
  cancellation_policy  text,
  terms_conditions     text,
  status               package_status not null default 'draft',
  is_featured          boolean not null default false,
  seo_title            text,
  seo_description      text,
  created_by           uuid references auth.users(id),
  updated_by           uuid references auth.users(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz,
  -- discounted price must not exceed base price
  constraint chk_discount_le_base check (discounted_price is null or discounted_price <= base_price)
);
create index if not exists idx_packages_status   on packages(status) where deleted_at is null;
create index if not exists idx_packages_featured on packages(is_featured) where deleted_at is null;
create index if not exists idx_packages_dest     on packages(destination_id);

create table if not exists package_images (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references packages(id) on delete cascade,
  url         text not null,
  alt_text    text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_pkg_images_pkg on package_images(package_id);

create table if not exists package_itinerary (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references packages(id) on delete cascade,
  day_number  int not null check (day_number >= 1),
  title       text not null,
  description text,
  meals       text,
  stay        text,
  unique (package_id, day_number)
);

create table if not exists package_inclusions (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references packages(id) on delete cascade,
  item        text not null,
  sort_order  int not null default 0
);

create table if not exists package_exclusions (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references packages(id) on delete cascade,
  item        text not null,
  sort_order  int not null default 0
);

create table if not exists package_departures (
  id             uuid primary key default gen_random_uuid(),
  package_id     uuid not null references packages(id) on delete cascade,
  departure_date date not null,
  total_seats    int not null check (total_seats >= 0),
  available_seats int not null check (available_seats >= 0),
  price_override numeric(12,2) check (price_override >= 0),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  unique (package_id, departure_date),
  constraint chk_seats check (available_seats <= total_seats)
);
create index if not exists idx_departures_pkg  on package_departures(package_id);
create index if not exists idx_departures_date on package_departures(departure_date);

-- ---------------------------------------------------------------------
-- CUSTOMERS (business record; may or may not have an auth account)
-- ---------------------------------------------------------------------
create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  full_name   text not null,
  email       text not null,
  phone       text,
  country     text default 'India',
  state       text,
  city        text,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index if not exists idx_customers_email on customers(lower(email));
create index if not exists idx_customers_user  on customers(user_id);

-- ---------------------------------------------------------------------
-- COUPONS
-- ---------------------------------------------------------------------
create table if not exists coupons (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  description       text,
  discount_type     text not null check (discount_type in ('percent','flat')),
  discount_value    numeric(12,2) not null check (discount_value >= 0),
  max_discount      numeric(12,2),
  min_booking_value numeric(12,2) not null default 0,
  usage_limit       int,
  used_count        int not null default 0,
  valid_from        date,
  valid_to          date,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------
create table if not exists bookings (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null unique,               -- DYI-2026-000001
  user_id            uuid references auth.users(id) on delete set null,
  customer_id        uuid references customers(id) on delete set null,
  package_id         uuid not null references packages(id),
  departure_id       uuid references package_departures(id),
  departure_date     date,
  adults             int not null default 1 check (adults >= 1),
  children           int not null default 0 check (children >= 0),
  rooms              int not null default 1 check (rooms >= 0),
  -- Server-computed money fields (source of truth). Browser values are never trusted.
  package_amount     numeric(12,2) not null default 0,
  addons_amount      numeric(12,2) not null default 0,
  room_charges       numeric(12,2) not null default 0,
  discount_amount    numeric(12,2) not null default 0,
  tax_amount         numeric(12,2) not null default 0,
  total_amount       numeric(12,2) not null default 0,
  advance_amount     numeric(12,2) not null default 0,
  paid_amount        numeric(12,2) not null default 0,
  coupon_id          uuid references coupons(id),
  -- Lead traveller contact
  lead_name          text not null,
  lead_email         text not null,
  lead_phone         text not null,
  country            text,
  state              text,
  city               text,
  address            text,
  emergency_contact  text,
  special_requirements text,
  pickup_preference  text,
  status             booking_status not null default 'new',
  payment_status     payment_status not null default 'unpaid',
  assigned_to        uuid references auth.users(id),
  internal_notes     text,
  terms_accepted     boolean not null default false,
  policy_version     text,
  is_demo            boolean not null default false,      -- marks sample data
  idempotency_key    text unique,                         -- blocks duplicate submits
  created_by         uuid references auth.users(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz,                         -- soft delete for financial records
  constraint chk_paid_le_total check (paid_amount <= total_amount + 0.01)
);
create index if not exists idx_bookings_user    on bookings(user_id);
create index if not exists idx_bookings_pkg     on bookings(package_id);
create index if not exists idx_bookings_status  on bookings(status);
create index if not exists idx_bookings_created on bookings(created_at desc);

create table if not exists booking_travellers (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid not null references bookings(id) on delete cascade,
  full_name      text not null,
  age            int check (age >= 0 and age <= 120),
  gender         gender_type,
  id_type        text,
  id_number      text,
  needs_assistance boolean not null default false,
  medical_notes  text,
  document_path  text,                                  -- private storage path (signed URL only)
  created_at     timestamptz not null default now()
);
create index if not exists idx_travellers_booking on booking_travellers(booking_id);

create table if not exists booking_addons (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  name        text not null,
  unit_price  numeric(12,2) not null default 0,
  quantity    int not null default 1 check (quantity >= 1),
  amount      numeric(12,2) not null default 0
);

create table if not exists booking_status_history (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  from_status booking_status,
  to_status   booking_status not null,
  note        text,
  changed_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
create index if not exists idx_status_hist_booking on booking_status_history(booking_id);

-- ---------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------
create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references bookings(id) on delete cascade,
  amount        numeric(12,2) not null check (amount >= 0),
  method        payment_method not null default 'pay_later',
  status        payment_status not null default 'unpaid',
  reference     text,                                  -- receipt / txn ref
  note          text,
  recorded_by   uuid references auth.users(id),
  is_demo       boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists idx_payments_booking on payments(booking_id);

create table if not exists payment_transactions (
  id                 uuid primary key default gen_random_uuid(),
  booking_id         uuid references bookings(id) on delete set null,
  payment_id         uuid references payments(id) on delete set null,
  provider           text not null,
  provider_txn_id    text,
  provider_order_id  text,
  signature          text,
  amount             numeric(12,2) not null,
  currency           text not null default 'INR',
  status             text not null,
  raw_payload        jsonb,
  processed          boolean not null default false,   -- idempotency guard
  created_at         timestamptz not null default now(),
  unique (provider, provider_txn_id)
);

-- ---------------------------------------------------------------------
-- COUPON USAGE
-- ---------------------------------------------------------------------
create table if not exists coupon_usage (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid not null references coupons(id) on delete cascade,
  booking_id  uuid not null references bookings(id) on delete cascade,
  user_id     uuid references auth.users(id),
  discount    numeric(12,2) not null,
  created_at  timestamptz not null default now(),
  unique (coupon_id, booking_id)
);

-- ---------------------------------------------------------------------
-- ENQUIRIES / CUSTOM TOURS / REVIEWS / SUPPORT
-- ---------------------------------------------------------------------
create table if not exists enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  package_id  uuid references packages(id) on delete set null,
  subject     text,
  message     text not null,
  status      enquiry_status not null default 'new',
  source      text default 'contact_form',
  created_at  timestamptz not null default now()
);

create table if not exists custom_tour_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  destinations  text,
  travellers    int,
  preferred_date date,
  duration_days int,
  budget        numeric(12,2),
  requirements  text,
  status        enquiry_status not null default 'new',
  created_at    timestamptz not null default now()
);

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid references packages(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating      int not null check (rating between 1 and 5),
  title       text,
  body        text,
  is_approved boolean not null default false,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_reviews_pkg on reviews(package_id) where is_approved = true;

create table if not exists support_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  booking_id  uuid references bookings(id) on delete set null,
  subject     text not null,
  message     text not null,
  status      enquiry_status not null default 'new',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CONTENT: blog, email templates, media, settings, notifications
-- ---------------------------------------------------------------------
create table if not exists blog_posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  excerpt       text,
  body          text,
  cover_image   text,
  author_name   text,
  tags          text[] not null default '{}',
  is_published  boolean not null default false,
  published_at  timestamptz,
  seo_title     text,
  seo_description text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists email_templates (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,                  -- e.g. booking_ack, booking_confirmed
  subject     text not null,
  html_body   text not null,                          -- supports {{placeholders}}
  is_active   boolean not null default true,
  updated_by  uuid references auth.users(id),
  updated_at  timestamptz not null default now()
);

create table if not exists email_logs (
  id            uuid primary key default gen_random_uuid(),
  recipient     text not null,
  subject       text,
  email_type    text,
  booking_id    uuid references bookings(id) on delete set null,
  status        email_status not null default 'queued',
  provider_id   text,
  error_message text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_email_logs_booking on email_logs(booking_id);

create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  title       text not null,
  body        text,
  type        text,
  is_read     boolean not null default false,
  link        text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id) where is_read = false;

create table if not exists website_settings (
  id                  int primary key default 1,       -- singleton row
  company_name        text not null default 'DevYatra India',
  logo_url            text,
  support_email       text,
  support_phone       text,
  whatsapp_number     text,
  address             text,
  social_facebook     text,
  social_instagram    text,
  social_youtube      text,
  social_x            text,
  cancellation_policy text,
  booking_policy      text,
  privacy_policy      text,
  terms_conditions    text,
  home_sections       jsonb not null default '{}',
  updated_at          timestamptz not null default now(),
  constraint singleton check (id = 1)
);

create table if not exists media_library (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  path        text,
  file_name   text,
  mime_type   text,
  size_bytes  bigint,
  alt_text    text,
  uploaded_by uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  action      text not null,                          -- create/update/delete/status_change...
  entity      text not null,                          -- table/entity name
  entity_id   text,
  changes     jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_entity on audit_logs(entity, entity_id);

-- ---------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','destinations','packages','customers','bookings',
    'blog_posts','email_templates','website_settings'
  ] loop
    execute format(
      'drop trigger if exists trg_updated_%1$s on %1$s;
       create trigger trg_updated_%1$s before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Booking reference generator: DYI-<year>-000001
-- ---------------------------------------------------------------------
create sequence if not exists booking_ref_seq;

create or replace function next_booking_reference() returns text as $$
begin
  return 'DYI-' || to_char(now(),'YYYY') || '-' || lpad(nextval('booking_ref_seq')::text, 6, '0');
end; $$ language plpgsql;

-- Seed the singleton settings row.
insert into website_settings (id) values (1) on conflict (id) do nothing;
