-- =====================================================================
-- DevYatra India :: 0002_rls.sql
-- Row Level Security + role helper + secure seat-confirmation transaction.
-- =====================================================================

-- Helper: does the current auth user hold a given role?
create or replace function has_role(check_role app_role)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = check_role
  );
$$;

-- Helper: is the current user any kind of admin/staff?
create or replace function is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid());
$$;

-- Enable RLS on every table.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','user_roles','destinations','packages','package_images',
    'package_itinerary','package_inclusions','package_exclusions','package_departures',
    'customers','coupons','bookings','booking_travellers','booking_addons',
    'booking_status_history','payments','payment_transactions','coupon_usage',
    'enquiries','custom_tour_requests','reviews','support_requests','blog_posts',
    'email_templates','email_logs','notifications','website_settings',
    'media_library','newsletter_subscribers','audit_logs'
  ] loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- ---------- PUBLIC READ (published content) --------------------------
create policy pub_read_packages on packages
  for select using (status = 'published' and deleted_at is null);
create policy staff_all_packages on packages
  for all using (is_staff()) with check (is_staff());

create policy pub_read_destinations on destinations
  for select using (is_active = true and deleted_at is null);
create policy staff_all_destinations on destinations
  for all using (is_staff()) with check (is_staff());

-- Package child tables: readable when parent is published; writable by staff.
do $$
declare t text;
begin
  foreach t in array array[
    'package_images','package_itinerary','package_inclusions',
    'package_exclusions','package_departures'
  ] loop
    execute format($f$
      create policy pub_read_%1$s on %1$s for select
        using (exists (select 1 from packages p
               where p.id = %1$s.package_id and p.status='published' and p.deleted_at is null));
      create policy staff_all_%1$s on %1$s for all
        using (is_staff()) with check (is_staff());
    $f$, t);
  end loop;
end $$;

create policy pub_read_blog on blog_posts
  for select using (is_published = true);
create policy staff_all_blog on blog_posts
  for all using (has_role('content_manager') or has_role('super_admin'))
  with check (has_role('content_manager') or has_role('super_admin'));

create policy pub_read_reviews on reviews
  for select using (is_approved = true);
create policy staff_manage_reviews on reviews
  for all using (is_staff()) with check (is_staff());
create policy user_insert_review on reviews
  for insert with check (auth.uid() = user_id);

create policy pub_read_settings on website_settings
  for select using (true);
create policy admin_write_settings on website_settings
  for update using (has_role('super_admin')) with check (has_role('super_admin'));

-- ---------- PROFILES -------------------------------------------------
create policy own_profile_select on profiles
  for select using (auth.uid() = id or is_staff());
create policy own_profile_upsert on profiles
  for insert with check (auth.uid() = id);
create policy own_profile_update on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- USER ROLES (super admin only manages) --------------------
create policy read_own_roles on user_roles
  for select using (auth.uid() = user_id or has_role('super_admin'));
create policy manage_roles on user_roles
  for all using (has_role('super_admin')) with check (has_role('super_admin'));

-- ---------- BOOKINGS -------------------------------------------------
-- A customer sees only their own bookings; staff see all.
create policy own_bookings_select on bookings
  for select using (auth.uid() = user_id or is_staff());
-- Inserts happen through server actions (service role) or the owning user.
create policy own_bookings_insert on bookings
  for insert with check (auth.uid() = user_id or user_id is null);
create policy staff_bookings_update on bookings
  for update using (is_staff() or auth.uid() = user_id)
  with check (is_staff() or auth.uid() = user_id);

-- Booking child tables follow the parent booking's ownership.
do $$
declare t text;
begin
  foreach t in array array['booking_travellers','booking_addons','booking_status_history'] loop
    execute format($f$
      create policy own_%1$s_select on %1$s for select
        using (exists (select 1 from bookings b where b.id = %1$s.booking_id
               and (b.user_id = auth.uid() or is_staff())));
      create policy staff_%1$s_write on %1$s for all
        using (is_staff()) with check (is_staff());
    $f$, t);
  end loop;
end $$;

-- ---------- PAYMENTS (finance + super admin) -------------------------
create policy read_own_payments on payments
  for select using (
    is_staff() or exists (select 1 from bookings b
      where b.id = payments.booking_id and b.user_id = auth.uid()));
create policy finance_write_payments on payments
  for all using (has_role('finance_viewer') or has_role('booking_manager') or has_role('super_admin'))
  with check (has_role('finance_viewer') or has_role('booking_manager') or has_role('super_admin'));

create policy staff_read_txns on payment_transactions
  for select using (is_staff());
-- payment_transactions are written only by the service role (webhooks) -> no anon policy.

-- ---------- CUSTOMERS ------------------------------------------------
create policy read_own_customer on customers
  for select using (auth.uid() = user_id or is_staff());
create policy staff_write_customer on customers
  for all using (is_staff()) with check (is_staff());

-- ---------- PUBLIC FORM INSERTS (anon allowed) -----------------------
create policy anyone_insert_enquiry on enquiries
  for insert with check (true);
create policy staff_read_enquiry on enquiries
  for select using (is_staff());
create policy staff_update_enquiry on enquiries
  for update using (is_staff()) with check (is_staff());

create policy anyone_insert_custom on custom_tour_requests
  for insert with check (true);
create policy staff_read_custom on custom_tour_requests
  for select using (is_staff());
create policy staff_update_custom on custom_tour_requests
  for update using (is_staff()) with check (is_staff());

create policy anyone_subscribe on newsletter_subscribers
  for insert with check (true);
create policy staff_read_subs on newsletter_subscribers
  for select using (is_staff());

-- ---------- SUPPORT REQUESTS -----------------------------------------
create policy own_support_insert on support_requests
  for insert with check (auth.uid() = user_id or user_id is null);
create policy own_support_select on support_requests
  for select using (auth.uid() = user_id or is_staff());
create policy staff_support_update on support_requests
  for update using (is_staff()) with check (is_staff());

-- ---------- NOTIFICATIONS --------------------------------------------
create policy own_notifications on notifications
  for select using (auth.uid() = user_id);
create policy own_notifications_update on notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- ADMIN-ONLY TABLES ----------------------------------------
create policy staff_media on media_library
  for all using (is_staff()) with check (is_staff());
create policy staff_email_templates on email_templates
  for all using (has_role('super_admin') or has_role('content_manager'))
  with check (has_role('super_admin') or has_role('content_manager'));
create policy staff_read_email_logs on email_logs
  for select using (is_staff());
create policy staff_read_audit on audit_logs
  for select using (has_role('super_admin'));
create policy staff_coupons on coupons
  for all using (is_staff()) with check (is_staff());
create policy pub_validate_coupon on coupons
  for select using (is_active = true);

-- =====================================================================
-- SECURE SEAT CONFIRMATION (atomic transaction)
-- Reduces available_seats ONLY when a booking becomes confirmed.
-- Runs as security definer so it can lock the departure row.
-- =====================================================================
create or replace function confirm_booking_seats(p_booking_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_dep   uuid;
  v_pax   int;
  v_avail int;
  v_status booking_status;
begin
  select departure_id, adults + children, status
    into v_dep, v_pax, v_status
  from bookings where id = p_booking_id for update;

  if v_dep is null then
    return; -- open-date booking; no fixed departure inventory to decrement
  end if;

  -- Lock the departure row to prevent overbooking under concurrency.
  select available_seats into v_avail
  from package_departures where id = v_dep for update;

  if v_avail < v_pax then
    raise exception 'Not enough seats: % requested, % available', v_pax, v_avail;
  end if;

  update package_departures
     set available_seats = available_seats - v_pax
   where id = v_dep;

  update bookings set status = 'confirmed', updated_at = now()
   where id = p_booking_id;

  insert into booking_status_history(booking_id, from_status, to_status, note, changed_by)
  values (p_booking_id, v_status, 'confirmed', 'Seats confirmed via transaction', auth.uid());
end; $$;

-- Auto-create a profile row when a new auth user signs up.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
