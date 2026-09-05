-- =====================================================================
-- DevYatra India :: seed.sql  (DEMONSTRATION DATA)
-- All bookings/payments/reviews below are flagged is_demo = true.
-- Content is original placeholder text. Images are replaceable placeholders.
-- Run AFTER 0001/0002/0003 migrations.
-- =====================================================================

-- ---------------- DESTINATIONS (8) ----------------
insert into destinations (name, slug, state, region, short_desc, description, cover_image, best_season, altitude_m, is_featured, is_active) values
('Kedarnath','kedarnath','Uttarakhand','Garhwal Himalayas','One of the twelve Jyotirlingas set against snow peaks.','Kedarnath is a revered Himalayan shrine reached by a scenic trek from Gaurikund. Original placeholder description - replace with your own copy.','/images/placeholders/kedarnath.jpg','May-Jun, Sep-Oct',3583,true,true),
('Badrinath','badrinath','Uttarakhand','Garhwal Himalayas','Sacred abode of Lord Vishnu on the Alaknanda river.','Badrinath town sits between the Nar and Narayan ranges. Placeholder description.','/images/placeholders/badrinath.jpg','May-Oct',3133,true,true),
('Gangotri','gangotri','Uttarakhand','Garhwal Himalayas','Origin point of the sacred Ganga.','Gangotri is the seat of Goddess Ganga. Placeholder description.','/images/placeholders/gangotri.jpg','May-Oct',3100,false,true),
('Yamunotri','yamunotri','Uttarakhand','Garhwal Himalayas','Source shrine of the Yamuna river.','Yamunotri is reached by a short trek from Janki Chatti. Placeholder description.','/images/placeholders/yamunotri.jpg','May-Oct',3293,false,true),
('Haridwar & Rishikesh','haridwar-rishikesh','Uttarakhand','Ganga Plains','Gateway to the Himalayas and yoga capital.','Twin spiritual towns known for Ganga Aarti and ashrams. Placeholder description.','/images/placeholders/haridwar.jpg','Oct-Mar',314,true,true),
('Vaishno Devi','vaishno-devi','Jammu & Kashmir','Trikuta Hills','Cave shrine of the Mother Goddess.','A revered pilgrimage trek from Katra. Placeholder description.','/images/placeholders/vaishnodevi.jpg','Mar-Oct',1584,true,true),
('Varanasi & Prayagraj','varanasi-prayagraj','Uttar Pradesh','Ganga Plains','Ancient ghats and the sacred confluence.','Spiritual cities on the Ganga. Placeholder description.','/images/placeholders/varanasi.jpg','Oct-Mar',80,true,true),
('Mathura & Vrindavan','mathura-vrindavan','Uttar Pradesh','Braj Region','Land of Lord Krishna.','Twin towns central to Krishna devotion. Placeholder description.','/images/placeholders/mathura.jpg','Oct-Mar',180,false,true)
on conflict (slug) do nothing;

-- ---------------- PACKAGES (8) ----------------
insert into packages (name, slug, short_desc, description, destination_id, category, days, nights, start_location, end_location, base_price, discounted_price, child_price, single_supplement, tax_percent, max_group_size, difficulty, best_season, cover_image, highlights, inclusions_text, exclusions_text, accommodation, transportation, meals, status, is_featured, seo_title, seo_description)
select * from (values
('Char Dham Yatra Deluxe','char-dham-yatra-deluxe','Complete Char Dham circuit covering all four shrines.','A guided 11-day journey to Yamunotri, Gangotri, Kedarnath and Badrinath. Original placeholder itinerary copy.',(select id from destinations where slug='kedarnath'),'Char Dham',11,10,'Haridwar','Haridwar',48500.00,44900.00,32000.00,12000.00,5.00,24,'challenging','May-Jun, Sep-Oct','/images/placeholders/chardham.jpg',array['All four dhams','Experienced guide','Ganga Aarti at Haridwar'],'Accommodation, meals as per plan, transport, guide','Airfare, personal expenses, pony/palki','3-star hotels & guesthouses','AC vehicle (hill non-AC)','Breakfast & dinner','published',true,'Char Dham Yatra Deluxe 2026 | DevYatra India','Book the complete Char Dham Yatra with guided support and comfortable stays.'),
('Do Dham Yatra (Kedarnath + Badrinath)','do-dham-yatra','Two-shrine journey to Kedarnath and Badrinath.','A 7-day pilgrimage to the two most revered Garhwal shrines. Placeholder copy.',(select id from destinations where slug='badrinath'),'Do Dham',7,6,'Haridwar','Haridwar',26500.00,24500.00,17000.00,7000.00,5.00,28,'moderate','May-Oct','/images/placeholders/dodham.jpg',array['Kedarnath darshan','Badrinath darshan','Scenic drives'],'Stay, breakfast & dinner, transport','Airfare, helicopter, personal costs','3-star hotels','AC vehicle (hill non-AC)','Breakfast & dinner','published',true,'Do Dham Yatra 2026 | DevYatra India','Kedarnath and Badrinath in one guided 7-day trip.'),
('Kedarnath Yatra Express','kedarnath-yatra-express','Focused short trip to Kedarnath.','A 5-day trip built around Kedarnath darshan. Placeholder copy.',(select id from destinations where slug='kedarnath'),'Single Shrine',5,4,'Haridwar','Haridwar',16500.00,14900.00,10500.00,4500.00,5.00,30,'moderate','May-Oct','/images/placeholders/kedarnath.jpg',array['Kedarnath trek','Comfortable base stay'],'Stay, meals, transport','Pony/palki, helicopter','Guesthouses','Shared vehicle','Breakfast & dinner','published',true,'Kedarnath Yatra Express | DevYatra India','Short and focused Kedarnath pilgrimage package.'),
('Badrinath Yatra','badrinath-yatra','Dedicated Badrinath darshan tour.','A 5-day tour to Badrinath with Mana village visit. Placeholder copy.',(select id from destinations where slug='badrinath'),'Single Shrine',5,4,'Haridwar','Haridwar',15500.00,null,10000.00,4500.00,5.00,30,'easy','May-Oct','/images/placeholders/badrinath.jpg',array['Badrinath darshan','Mana - last Indian village'],'Stay, meals, transport','Personal expenses','Hotels','AC vehicle (hill non-AC)','Breakfast & dinner','published',false,'Badrinath Yatra | DevYatra India','Comfortable Badrinath pilgrimage tour.'),
('Gangotri Yatra','gangotri-yatra','Journey to the source of the Ganga.','A 4-day Gangotri pilgrimage. Placeholder copy.',(select id from destinations where slug='gangotri'),'Single Shrine',4,3,'Haridwar','Haridwar',13500.00,12500.00,9000.00,4000.00,5.00,28,'easy','May-Oct','/images/placeholders/gangotri.jpg',array['Gangotri temple','Harsil valley'],'Stay, meals, transport','Personal expenses','Guesthouses','Shared vehicle','Breakfast & dinner','published',false,'Gangotri Yatra | DevYatra India','Peaceful Gangotri pilgrimage package.'),
('Yamunotri Yatra','yamunotri-yatra','Trek to the Yamuna source shrine.','A 4-day Yamunotri pilgrimage with a short trek. Placeholder copy.',(select id from destinations where slug='yamunotri'),'Single Shrine',4,3,'Dehradun','Dehradun',13000.00,null,8800.00,4000.00,5.00,26,'moderate','May-Oct','/images/placeholders/yamunotri.jpg',array['Yamunotri trek','Thermal springs at Janki Chatti'],'Stay, meals, transport','Pony/palki','Guesthouses','Shared vehicle','Breakfast & dinner','published',false,'Yamunotri Yatra | DevYatra India','Guided Yamunotri pilgrimage trek.'),
('Haridwar Rishikesh Spiritual Retreat','haridwar-rishikesh-retreat','Ganga Aarti, yoga and temples.','A relaxed 3-day spiritual retreat. Placeholder copy.',(select id from destinations where slug='haridwar-rishikesh'),'City Tour',3,2,'Haridwar','Rishikesh',8500.00,7900.00,5500.00,2500.00,5.00,30,'easy','Oct-Mar','/images/placeholders/haridwar.jpg',array['Ganga Aarti','Beatles Ashram','Temple tour'],'Stay, breakfast, transport','Lunch, dinner, activities','3-star hotels','AC vehicle','Breakfast','published',true,'Haridwar Rishikesh Retreat | DevYatra India','Short spiritual retreat in Haridwar and Rishikesh.'),
('Kashi Varanasi Prayagraj Tour','kashi-varanasi-prayagraj','Ghats, aarti and the sacred sangam.','A 4-day tour of Varanasi and Prayagraj. Placeholder copy.',(select id from destinations where slug='varanasi-prayagraj'),'City Tour',4,3,'Varanasi','Prayagraj',11500.00,10900.00,7500.00,3000.00,5.00,30,'easy','Oct-Mar','/images/placeholders/varanasi.jpg',array['Ganga Aarti at Dashashwamedh','Boat ride','Triveni Sangam'],'Stay, breakfast, transport','Lunch, dinner','3-star hotels','AC vehicle','Breakfast','published',true,'Kashi Varanasi Prayagraj Tour | DevYatra India','Guided spiritual tour of Varanasi and Prayagraj.')
) as v
on conflict (slug) do nothing;

-- ---------------- DEPARTURES (10) ----------------
insert into package_departures (package_id, departure_date, total_seats, available_seats, is_active)
select p.id, d.dt, 24, d.seats, true
from (values
  ('char-dham-yatra-deluxe','2026-10-05'::date,18),
  ('char-dham-yatra-deluxe','2026-10-20'::date,24),
  ('do-dham-yatra','2026-09-25'::date,20),
  ('do-dham-yatra','2026-10-15'::date,22),
  ('kedarnath-yatra-express','2026-09-30'::date,26),
  ('kedarnath-yatra-express','2026-10-18'::date,30),
  ('badrinath-yatra','2026-10-08'::date,28),
  ('gangotri-yatra','2026-10-02'::date,25),
  ('haridwar-rishikesh-retreat','2026-11-14'::date,30),
  ('kashi-varanasi-prayagraj','2026-11-20'::date,28)
) as d(slug, dt, seats)
join packages p on p.slug = d.slug
on conflict (package_id, departure_date) do nothing;

-- ---------------- ITINERARY (sample for Char Dham) ----------------
insert into package_itinerary (package_id, day_number, title, description, stay, meals)
select p.id, i.day, i.title, i.descr, i.stay, i.meals
from (values
 (1,'Arrival at Haridwar','Welcome and evening Ganga Aarti at Har Ki Pauri.','Haridwar hotel','Dinner'),
 (2,'Haridwar to Barkot','Scenic drive towards Yamunotri base.','Barkot hotel','Breakfast, Dinner'),
 (3,'Yamunotri darshan','Trek from Janki Chatti to Yamunotri temple.','Barkot hotel','Breakfast, Dinner'),
 (4,'Barkot to Uttarkashi','Drive to Uttarkashi for Gangotri leg.','Uttarkashi hotel','Breakfast, Dinner')
) as i(day, title, descr, stay, meals)
join packages p on p.slug = 'char-dham-yatra-deluxe'
on conflict (package_id, day_number) do nothing;

-- ---------------- INCLUSIONS / EXCLUSIONS (Char Dham) ----------------
insert into package_inclusions (package_id, item, sort_order)
select p.id, x.item, x.ord from (values
 ('Accommodation on twin-sharing basis',1),
 ('Daily breakfast and dinner',2),
 ('All transfers by private vehicle',3),
 ('Experienced tour guide',4)
) as x(item, ord) join packages p on p.slug='char-dham-yatra-deluxe';

insert into package_exclusions (package_id, item, sort_order)
select p.id, x.item, x.ord from (values
 ('Airfare and train tickets',1),
 ('Pony, palki and helicopter charges',2),
 ('Personal expenses and tips',3),
 ('Anything not mentioned in inclusions',4)
) as x(item, ord) join packages p on p.slug='char-dham-yatra-deluxe';

-- ---------------- DEMO CUSTOMERS ----------------
insert into customers (full_name, email, phone, state, city) values
('Demo Ramesh Sharma','ramesh.demo@example.com','+919000000001','Maharashtra','Mumbai'),
('Demo Anita Verma','anita.demo@example.com','+919000000002','Delhi','New Delhi'),
('Demo Suresh Nair','suresh.demo@example.com','+919000000003','Kerala','Kochi')
on conflict do nothing;

-- ---------------- DEMO BOOKINGS (15) ----------------
-- Marked is_demo = true. Uses server-style computed amounts.
do $$
declare
  v_pkg uuid; v_i int; v_ref text; v_total numeric(12,2);
  statuses booking_status[] := array['new','awaiting_confirmation','confirmed','partially_paid','fully_paid','cancelled','completed','confirmed','new','fully_paid','confirmed','completed','cancelled','partially_paid','confirmed'];
  paystat  payment_status[] := array['unpaid','unpaid','unpaid','partially_paid','paid','refunded','paid','unpaid','unpaid','paid','unpaid','paid','refunded','partially_paid','unpaid'];
begin
  select id into v_pkg from packages where slug='do-dham-yatra';
  for v_i in 1..15 loop
    v_ref := next_booking_reference();
    v_total := 24500 * (1 + (v_i % 3)) * 1.05;
    insert into bookings(reference, package_id, adults, children, rooms,
      package_amount, tax_amount, total_amount, paid_amount,
      lead_name, lead_email, lead_phone, state, city,
      status, payment_status, terms_accepted, policy_version, is_demo, created_at)
    values (v_ref, v_pkg, 1 + (v_i % 3), v_i % 2, 1 + (v_i % 2),
      24500 * (1 + (v_i % 3)), 24500 * (1 + (v_i % 3)) * 0.05, v_total,
      case when paystat[v_i]='paid' then v_total when paystat[v_i]='partially_paid' then round(v_total*0.4,2) else 0 end,
      'Demo Traveller ' || v_i, 'demo'||v_i||'@example.com', '+9190000100'||lpad(v_i::text,2,'0'),
      'Maharashtra','Mumbai', statuses[v_i], paystat[v_i], true, 'v1.0', true,
      now() - (v_i || ' days')::interval);
  end loop;
end $$;

-- ---------------- DEMO REVIEWS (8) ----------------
insert into reviews (package_id, author_name, rating, title, body, is_approved, is_demo)
select p.id, r.author, r.rating, r.title, r.body, true, true
from (values
 ('char-dham-yatra-deluxe','Ramesh S.',5,'Beautifully organised','Smooth arrangements throughout. Placeholder review text.'),
 ('char-dham-yatra-deluxe','Anita V.',5,'Once in a lifetime','Guides were caring and helpful. Placeholder review.'),
 ('do-dham-yatra','Suresh N.',4,'Great value','Comfortable stays and good food. Placeholder review.'),
 ('do-dham-yatra','Priya K.',5,'Well managed','Highly recommend for families. Placeholder review.'),
 ('kedarnath-yatra-express','Mohan L.',4,'Good short trip','Perfect for limited days. Placeholder review.'),
 ('haridwar-rishikesh-retreat','Neha G.',5,'So peaceful','Loved the Ganga Aarti. Placeholder review.'),
 ('kashi-varanasi-prayagraj','Arjun M.',5,'Spiritual and smooth','Boat ride was memorable. Placeholder review.'),
 ('badrinath-yatra','Kavita R.',4,'Comfortable tour','Well paced itinerary. Placeholder review.')
) as r(slug, author, rating, title, body)
join packages p on p.slug = r.slug;

-- ---------------- BLOG POSTS (5) ----------------
insert into blog_posts (title, slug, excerpt, body, author_name, tags, is_published, published_at) values
('Char Dham Yatra: A First-Timer''s Guide','char-dham-first-timer-guide','How to prepare for the Char Dham circuit.','Original placeholder travel guide content about preparation, packing and fitness.','DevYatra Team',array['char dham','guide'],true, now()),
('Best Time to Visit Kedarnath','best-time-kedarnath','Seasons, weather and crowd tips for Kedarnath.','Original placeholder content on Kedarnath seasons.','DevYatra Team',array['kedarnath','season'],true, now()),
('Packing Checklist for a Himalayan Yatra','himalayan-yatra-packing-checklist','Everything you need for high-altitude pilgrimage.','Original placeholder packing checklist content.','DevYatra Team',array['packing','tips'],true, now()),
('Ganga Aarti in Haridwar and Rishikesh','ganga-aarti-haridwar-rishikesh','What to expect at the evening aarti.','Original placeholder content about Ganga Aarti.','DevYatra Team',array['haridwar','rishikesh'],true, now()),
('Health & Fitness Tips for High-Altitude Shrines','health-fitness-high-altitude','Acclimatisation and safety advice.','Original placeholder health and fitness content.','DevYatra Team',array['health','safety'],true, now())
on conflict (slug) do nothing;

-- ---------------- EMAIL TEMPLATES (editable in admin) ----------------
insert into email_templates (key, subject, html_body) values
('booking_ack','Your DevYatra booking {{reference}} is received',
 '<h2>Namaste {{lead_name}},</h2><p>We have received your booking <b>{{reference}}</b> for <b>{{package_name}}</b> on <b>{{departure_date}}</b> for {{traveller_count}} traveller(s).</p><p>Amount: <b>{{total_amount}}</b> &middot; Payment: {{payment_status}} &middot; Status: {{booking_status}}</p><p><i>Note: Submission does not guarantee confirmation until our team approves availability.</i></p><p><a href="{{booking_link}}">View your booking</a></p><p>{{company_name}} &middot; {{support_phone}}</p>'),
('booking_owner','New booking {{reference}} - {{package_name}}',
 '<h2>New booking received</h2><p><b>{{reference}}</b> &middot; {{package_name}} &middot; {{departure_date}}</p><p>Customer: {{lead_name}} ({{lead_email}}, {{lead_phone}})</p><p>Travellers: {{traveller_count}} &middot; Total: {{total_amount}} &middot; Payment: {{payment_status}}</p><p>Special requirements: {{special_requirements}}</p><p><a href="{{admin_link}}">Open in admin panel</a></p>'),
('booking_confirmed','Your yatra {{reference}} is confirmed',
 '<h2>Namaste {{lead_name}},</h2><p>Great news - your booking <b>{{reference}}</b> for <b>{{package_name}}</b> is now <b>confirmed</b>.</p><p>Travel date: {{departure_date}}</p><p>{{company_name}}</p>'),
('booking_cancelled','Your booking {{reference}} has been cancelled',
 '<h2>Namaste {{lead_name}},</h2><p>Your booking <b>{{reference}}</b> has been cancelled. Any eligible refund follows our cancellation policy.</p><p>{{company_name}}</p>'),
('payment_received','Payment received for {{reference}}',
 '<h2>Namaste {{lead_name}},</h2><p>We have recorded a payment for booking <b>{{reference}}</b>. Paid: {{paid_amount}} of {{total_amount}}.</p><p>{{company_name}}</p>'),
('password_reset','Reset your DevYatra password',
 '<h2>Password reset</h2><p>Click the link to reset your password. If you did not request this, ignore this email.</p><p><a href="{{reset_link}}">Reset password</a></p>')
on conflict (key) do nothing;

-- ---------------- WEBSITE SETTINGS ----------------
update website_settings set
  company_name='DevYatra India',
  support_email='support@devyatra.example.com',
  support_phone='+91 90000 00000',
  whatsapp_number='+919000000000',
  address='Placeholder Address, Haridwar, Uttarakhand, India',
  social_instagram='https://instagram.com/',
  social_facebook='https://facebook.com/',
  social_youtube='https://youtube.com/'
where id = 1;
