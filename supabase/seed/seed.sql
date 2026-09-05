-- =====================================================================
-- DevYatra India :: seed.sql  (DEMONSTRATION DATA)
-- Matches 0001_schema.sql exactly:
--   * lowercase enum values (moderate / confirmed / partially_paid ...)
--   * real column names (short_desc, room_charges, is_active, html_body ...)
--   * money is numeric(12,2)
-- All bookings / payments / reviews are flagged is_demo = true.
-- Content is original placeholder text. Images use replaceable placeholders.
-- Run AFTER 0001 / 0002 / 0003 migrations. Re-runnable (ON CONFLICT DO NOTHING).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 0. Clean previous demo rows so re-seeding is safe (only demo data)
-- ---------------------------------------------------------------------
delete from public.payments            where is_demo = true;
delete from public.booking_travellers  where booking_id in (select id from public.bookings where is_demo = true);
delete from public.bookings            where is_demo = true;
delete from public.reviews             where is_demo = true;

-- =====================================================================
-- 1. DESTINATIONS (8)
--    columns: name, slug, state, region, short_desc, description,
--             cover_image, best_season, altitude_m, is_featured, is_active
-- =====================================================================
insert into public.destinations (id, name, slug, state, region, short_desc, description, cover_image, best_season, altitude_m, is_featured, is_active)
values
  ('d1000000-0000-4000-a000-000000000001','Kedarnath','kedarnath','Uttarakhand','Garhwal Himalayas',
   'Himalayan shrine of Lord Shiva at 3,583 m.',
   'One of the twelve Jyotirlingas, Kedarnath sits amid snow-clad peaks and is reached by a scenic trek from Gaurikund. A destination of deep spiritual significance and dramatic mountain scenery. Original placeholder description.',
   '/images/placeholders/kedarnath.jpg','May-Jun, Sep-Oct',3583,true,true),

  ('d1000000-0000-4000-a000-000000000002','Badrinath','badrinath','Uttarakhand','Garhwal Himalayas',
   'Sacred abode of Lord Vishnu on the Alaknanda river.',
   'The holiest of the Char Dham, Badrinath temple lies between the Nar and Narayan mountain ranges, known for the Tapt Kund hot springs. Original placeholder description.',
   '/images/placeholders/badrinath.jpg','May-Oct',3133,true,true),

  ('d1000000-0000-4000-a000-000000000003','Gangotri','gangotri','Uttarakhand','Garhwal Himalayas',
   'Origin of the sacred river Ganga.',
   'Gangotri marks the source of the Ganges and is dedicated to Goddess Ganga, surrounded by deodar forests and glacial streams. Original placeholder description.',
   '/images/placeholders/gangotri.jpg','May-Oct',3100,false,true),

  ('d1000000-0000-4000-a000-000000000004','Yamunotri','yamunotri','Uttarakhand','Garhwal Himalayas',
   'Seat of Goddess Yamuna and source of the Yamuna river.',
   'The westernmost Char Dham shrine, reached by a trek from Janki Chatti. Pilgrims cook rice in the Surya Kund hot springs as prasad. Original placeholder description.',
   '/images/placeholders/yamunotri.jpg','May-Oct',3293,false,true),

  ('d1000000-0000-4000-a000-000000000005','Haridwar & Rishikesh','haridwar-rishikesh','Uttarakhand','Ganga Plains',
   'Twin spiritual cities on the banks of the Ganga.',
   'Haridwar is famed for the evening Ganga Aarti at Har Ki Pauri, while Rishikesh is the yoga capital of the world. Original placeholder description.',
   '/images/placeholders/haridwar.jpg','Oct-Mar',314,true,true),

  ('d1000000-0000-4000-a000-000000000006','Vaishno Devi','vaishno-devi','Jammu & Kashmir','Trikuta Hills',
   'Cave shrine of Mata Vaishno Devi.',
   'A revered Shakti Peeth reached by a 12 km trek or helicopter from Katra. Original placeholder description.',
   '/images/placeholders/vaishnodevi.jpg','Mar-Oct',1584,true,true),

  ('d1000000-0000-4000-a000-000000000007','Varanasi & Prayagraj','varanasi-prayagraj','Uttar Pradesh','Ganga Plains',
   'The eternal city of light and the sacred confluence.',
   'Varanasi is centred on the ghats of the Ganga and the Kashi Vishwanath temple; Prayagraj holds the Triveni Sangam. Original placeholder description.',
   '/images/placeholders/varanasi.jpg','Oct-Mar',80,true,true),

  ('d1000000-0000-4000-a000-000000000008','Mathura & Vrindavan','mathura-vrindavan','Uttar Pradesh','Braj Region',
   'Birthplace and playground of Lord Krishna.',
   'The Braj region celebrates the life of Krishna through countless temples, ghats and festivals. Original placeholder description.',
   '/images/placeholders/mathura.jpg','Oct-Mar',180,false,true)
on conflict (id) do nothing;

-- =====================================================================
-- 2. PACKAGES (8)
--    enum: difficulty = easy|moderate|challenging|difficult (lowercase)
--          status = draft|published|inactive|sold_out
--    columns: short_desc, description, single_supplement, tax_percent,
--             max_group_size, cover_image, highlights (text[]),
--             inclusions_text, exclusions_text, accommodation,
--             transportation, meals, is_featured, seo_title, seo_description
-- =====================================================================
insert into public.packages (
  id, name, slug, short_desc, description, destination_id, category,
  days, nights, start_location, end_location,
  base_price, discounted_price, child_price, single_supplement, tax_percent,
  max_group_size, difficulty, best_season, cover_image, highlights,
  inclusions_text, exclusions_text, accommodation, transportation, meals,
  status, is_featured, seo_title, seo_description
) values
  ('c1000000-0000-4000-b000-000000000001','Char Dham Yatra Deluxe','char-dham-yatra-deluxe',
   'Complete Char Dham circuit covering all four shrines.',
   'A guided 11-day journey to Yamunotri, Gangotri, Kedarnath and Badrinath with comfortable stays and trek support. Original placeholder itinerary copy.',
   'd1000000-0000-4000-a000-000000000002','Char Dham',11,10,'Haridwar','Haridwar',
   48500.00,44900.00,32000.00,12000.00,5.00,24,'challenging','May-Jun, Sep-Oct',
   '/images/placeholders/chardham.jpg', array['All four dhams','Experienced guide','Ganga Aarti at Haridwar'],
   'Accommodation, meals as per plan, transport, guide','Airfare, personal expenses, pony/palki',
   '3-star hotels & guesthouses','AC vehicle (hill non-AC)','Breakfast & dinner',
   'published',true,'Char Dham Yatra Deluxe 2026 | DevYatra India','Book the complete Char Dham Yatra with guided support and comfortable stays.'),

  ('c1000000-0000-4000-b000-000000000002','Do Dham Yatra (Kedarnath + Badrinath)','do-dham-yatra',
   'Two-shrine journey to Kedarnath and Badrinath.',
   'A 7-day pilgrimage to the two most revered Garhwal shrines with balanced acclimatisation. Placeholder copy.',
   'd1000000-0000-4000-a000-000000000001','Do Dham',7,6,'Haridwar','Haridwar',
   26500.00,24500.00,17000.00,7000.00,5.00,28,'moderate','May-Oct',
   '/images/placeholders/dodham.jpg', array['Kedarnath darshan','Badrinath darshan','Scenic drives'],
   'Stay, breakfast & dinner, transport','Airfare, helicopter, personal costs',
   '3-star hotels','AC vehicle (hill non-AC)','Breakfast & dinner',
   'published',true,'Do Dham Yatra 2026 | DevYatra India','Kedarnath and Badrinath in one guided 7-day trip.'),

  ('c1000000-0000-4000-b000-000000000003','Kedarnath Yatra Express','kedarnath-yatra-express',
   'Focused short trip to Kedarnath.',
   'A 5-day trip built around Kedarnath darshan with trek support from Gaurikund. Placeholder copy.',
   'd1000000-0000-4000-a000-000000000001','Single Shrine',5,4,'Haridwar','Haridwar',
   16500.00,14900.00,10500.00,4500.00,5.00,30,'moderate','May-Oct',
   '/images/placeholders/kedarnath.jpg', array['Kedarnath trek','Comfortable base stay'],
   'Stay, meals, transport','Pony/palki, helicopter','Guesthouses','Shared vehicle','Breakfast & dinner',
   'published',true,'Kedarnath Yatra Express | DevYatra India','Short and focused Kedarnath pilgrimage package.'),

  ('c1000000-0000-4000-b000-000000000004','Badrinath Yatra','badrinath-yatra',
   'Dedicated Badrinath darshan tour.',
   'A 5-day tour to Badrinath with a visit to Mana, the last Indian village. Placeholder copy.',
   'd1000000-0000-4000-a000-000000000002','Single Shrine',5,4,'Haridwar','Haridwar',
   15500.00,null,10000.00,4500.00,5.00,30,'easy','May-Oct',
   '/images/placeholders/badrinath.jpg', array['Badrinath darshan','Mana - last Indian village'],
   'Stay, meals, transport','Personal expenses','Hotels','AC vehicle (hill non-AC)','Breakfast & dinner',
   'published',false,'Badrinath Yatra | DevYatra India','Comfortable Badrinath pilgrimage tour.'),

  ('c1000000-0000-4000-b000-000000000005','Gangotri Yamunotri Yatra','gangotri-yamunotri-yatra',
   'Twin western dhams — sources of the Ganga and Yamuna.',
   'A 6-day circuit to Gangotri and Yamunotri through deodar forests and river valleys. Placeholder copy.',
   'd1000000-0000-4000-a000-000000000003','Do Dham',6,5,'Haridwar','Haridwar',
   18500.00,16999.00,12000.00,4500.00,5.00,28,'moderate','May-Oct',
   '/images/placeholders/gangotri.jpg', array['Gangotri temple','Yamunotri trek','Harsil valley'],
   'Stay, meals, transport','Pony/palki, personal expenses','Guesthouses','Shared vehicle','Breakfast & dinner',
   'published',false,'Gangotri Yamunotri Yatra | DevYatra India','Peaceful twin-dham pilgrimage to the sources of the Ganga and Yamuna.'),

  ('c1000000-0000-4000-b000-000000000006','Haridwar Rishikesh Spiritual Retreat','haridwar-rishikesh-retreat',
   'Ganga Aarti, yoga and temples.',
   'A relaxed 3-day spiritual retreat with the Har Ki Pauri aarti and Rishikesh ashrams. Placeholder copy.',
   'd1000000-0000-4000-a000-000000000005','City Tour',3,2,'Haridwar','Rishikesh',
   8500.00,7900.00,5500.00,2500.00,5.00,30,'easy','Oct-Mar',
   '/images/placeholders/haridwar.jpg', array['Ganga Aarti','Beatles Ashram','Temple tour'],
   'Stay, breakfast, transport','Lunch, dinner, activities','3-star hotels','AC vehicle','Breakfast',
   'published',true,'Haridwar Rishikesh Retreat | DevYatra India','Short spiritual retreat in Haridwar and Rishikesh.'),

  ('c1000000-0000-4000-b000-000000000007','Vaishno Devi Yatra','vaishno-devi-yatra',
   'Trikuta Hills cave shrine with helicopter option.',
   'A 4-day pilgrimage to Mata Vaishno Devi from Katra with trek, pony or helicopter choices. Placeholder copy.',
   'd1000000-0000-4000-a000-000000000006','Single Shrine',4,3,'Jammu','Jammu',
   13500.00,11999.00,8500.00,3500.00,5.00,32,'moderate','Mar-Oct',
   '/images/placeholders/vaishnodevi.jpg', array['Bhawan darshan','Helicopter option','Bhairavnath temple'],
   'Stay, meals, transport','Helicopter/pony charges, personal costs','Hotels at Katra','AC vehicle','Breakfast & dinner',
   'published',false,'Vaishno Devi Yatra | DevYatra India','Guided Vaishno Devi Yatra from Katra with helicopter option.'),

  ('c1000000-0000-4000-b000-000000000008','Kashi Varanasi Prayagraj Tour','kashi-varanasi-prayagraj',
   'Ghats, aarti and the sacred sangam.',
   'A 4-day tour of Varanasi and Prayagraj with the Ganga Aarti and a boat ride. Placeholder copy.',
   'd1000000-0000-4000-a000-000000000007','City Tour',4,3,'Varanasi','Prayagraj',
   11500.00,10900.00,7500.00,3000.00,5.00,30,'easy','Oct-Mar',
   '/images/placeholders/varanasi.jpg', array['Ganga Aarti at Dashashwamedh','Boat ride','Triveni Sangam'],
   'Stay, breakfast, transport','Lunch, dinner','3-star hotels','AC vehicle','Breakfast',
   'published',true,'Kashi Varanasi Prayagraj Tour | DevYatra India','Guided spiritual tour of Varanasi and Prayagraj.')
on conflict (id) do nothing;

-- =====================================================================
-- 3. PACKAGE IMAGES  (columns: package_id, url, alt_text, sort_order)
-- =====================================================================
insert into public.package_images (package_id, url, alt_text, sort_order) values
  ('c1000000-0000-4000-b000-000000000001','/images/placeholders/chardham.jpg','Char Dham temple amid Himalayan peaks',1),
  ('c1000000-0000-4000-b000-000000000001','/images/placeholders/kedarnath.jpg','Pilgrims on the Kedarnath trek',2),
  ('c1000000-0000-4000-b000-000000000001','/images/placeholders/badrinath.jpg','Badrinath temple by the Alaknanda river',3),
  ('c1000000-0000-4000-b000-000000000002','/images/placeholders/dodham.jpg','Kedarnath valley view',1),
  ('c1000000-0000-4000-b000-000000000002','/images/placeholders/badrinath.jpg','Badrinath colourful temple facade',2),
  ('c1000000-0000-4000-b000-000000000003','/images/placeholders/kedarnath.jpg','Kedarnath shrine with snow peaks',1),
  ('c1000000-0000-4000-b000-000000000004','/images/placeholders/badrinath.jpg','Badrinath and Nar-Narayan ranges',1),
  ('c1000000-0000-4000-b000-000000000005','/images/placeholders/gangotri.jpg','Gangotri temple by the Bhagirathi',1),
  ('c1000000-0000-4000-b000-000000000006','/images/placeholders/haridwar.jpg','Ganga Aarti at Har Ki Pauri',1),
  ('c1000000-0000-4000-b000-000000000007','/images/placeholders/vaishnodevi.jpg','Trikuta hills path to Vaishno Devi',1),
  ('c1000000-0000-4000-b000-000000000008','/images/placeholders/varanasi.jpg','Evening Ganga Aarti at Varanasi ghats',1)
on conflict do nothing;

-- =====================================================================
-- 4. PACKAGE ITINERARY  (unique per package_id, day_number)
--    columns: day_number, title, description, meals, stay
-- =====================================================================
insert into public.package_itinerary (package_id, day_number, title, description, meals, stay) values
  ('c1000000-0000-4000-b000-000000000001',1,'Arrival at Haridwar','Arrive at Haridwar, hotel check-in and evening Ganga Aarti at Har Ki Pauri.','Dinner','Haridwar hotel'),
  ('c1000000-0000-4000-b000-000000000001',2,'Haridwar to Barkot','Drive via Mussoorie and Kempty Falls to Barkot.','Breakfast, Dinner','Barkot hotel'),
  ('c1000000-0000-4000-b000-000000000001',3,'Yamunotri Darshan','Trek from Janki Chatti to Yamunotri, darshan, return to Barkot.','Breakfast, Dinner','Barkot hotel'),
  ('c1000000-0000-4000-b000-000000000001',4,'Barkot to Uttarkashi','Scenic drive along the Bhagirathi to Uttarkashi.','Breakfast, Dinner','Uttarkashi hotel'),
  ('c1000000-0000-4000-b000-000000000001',5,'Gangotri Darshan','Excursion to Gangotri temple and return to Uttarkashi.','Breakfast, Dinner','Uttarkashi hotel'),
  ('c1000000-0000-4000-b000-000000000003',1,'Haridwar to Guptkashi','Drive along the Alaknanda and Mandakini rivers to Guptkashi.','Dinner','Guptkashi hotel'),
  ('c1000000-0000-4000-b000-000000000003',2,'Trek to Kedarnath','Drive to Sonprayag, then trek/pony from Gaurikund to Kedarnath.','Breakfast, Dinner','Kedarnath stay'),
  ('c1000000-0000-4000-b000-000000000003',3,'Kedarnath to Guptkashi','Morning darshan, return trek and drive back to Guptkashi.','Breakfast, Dinner','Guptkashi hotel'),
  ('c1000000-0000-4000-b000-000000000003',4,'Guptkashi to Rishikesh','Scenic drive to Rishikesh with a stop at Devprayag.','Breakfast','Rishikesh hotel'),
  ('c1000000-0000-4000-b000-000000000003',5,'Departure','Transfer to Haridwar; tour concludes.','Breakfast','—')
on conflict (package_id, day_number) do nothing;

-- =====================================================================
-- 5. INCLUSIONS / EXCLUSIONS  (columns: item, sort_order)
-- =====================================================================
insert into public.package_inclusions (package_id, item, sort_order) values
  ('c1000000-0000-4000-b000-000000000001','Accommodation on twin-sharing basis',1),
  ('c1000000-0000-4000-b000-000000000001','Daily breakfast and dinner',2),
  ('c1000000-0000-4000-b000-000000000001','All transfers by private vehicle',3),
  ('c1000000-0000-4000-b000-000000000001','Experienced tour guide',4),
  ('c1000000-0000-4000-b000-000000000003','Accommodation on twin-sharing basis',1),
  ('c1000000-0000-4000-b000-000000000003','Daily breakfast and dinner',2),
  ('c1000000-0000-4000-b000-000000000003','Transport from Haridwar and back',3)
on conflict do nothing;

insert into public.package_exclusions (package_id, item, sort_order) values
  ('c1000000-0000-4000-b000-000000000001','Airfare and train tickets',1),
  ('c1000000-0000-4000-b000-000000000001','Pony, palki and helicopter charges',2),
  ('c1000000-0000-4000-b000-000000000001','Personal expenses and tips',3),
  ('c1000000-0000-4000-b000-000000000001','Anything not mentioned in inclusions',4),
  ('c1000000-0000-4000-b000-000000000003','Pony/palki charges at Kedarnath',1),
  ('c1000000-0000-4000-b000-000000000003','Anything not mentioned in inclusions',2)
on conflict do nothing;

-- =====================================================================
-- 6. PACKAGE DEPARTURES (10)
--    columns: departure_date, total_seats, available_seats, is_active
--    (no return_date / status columns in schema)
-- =====================================================================
insert into public.package_departures (package_id, departure_date, total_seats, available_seats, is_active) values
  ('c1000000-0000-4000-b000-000000000001','2026-05-10',24,12,true),
  ('c1000000-0000-4000-b000-000000000001','2026-06-05',24,24,true),
  ('c1000000-0000-4000-b000-000000000001','2026-09-15',24,20,true),
  ('c1000000-0000-4000-b000-000000000002','2026-05-18',28,8,true),
  ('c1000000-0000-4000-b000-000000000002','2026-06-12',28,28,true),
  ('c1000000-0000-4000-b000-000000000003','2026-05-22',30,4,true),
  ('c1000000-0000-4000-b000-000000000003','2026-06-20',30,30,true),
  ('c1000000-0000-4000-b000-000000000006','2026-11-14',30,25,true),
  ('c1000000-0000-4000-b000-000000000007','2026-07-11',32,18,true),
  ('c1000000-0000-4000-b000-000000000008','2026-11-20',30,30,true)
on conflict (package_id, departure_date) do nothing;

-- =====================================================================
-- 7. REVIEWS (8)  columns: author_name, rating, title, body, is_approved, is_demo
-- =====================================================================
insert into public.reviews (package_id, author_name, rating, title, body, is_approved, is_demo, created_at) values
  ('c1000000-0000-4000-b000-000000000001','Ramesh Iyer',5,'A flawless Char Dham experience','Every detail was handled well - hotels, food and trek support. Placeholder review. [DEMO]',true,true, now() - interval '40 days'),
  ('c1000000-0000-4000-b000-000000000001','Sunita Menon',4,'Well organised','Beautiful journey and caring staff. Placeholder review. [DEMO]',true,true, now() - interval '38 days'),
  ('c1000000-0000-4000-b000-000000000002','Arjun Deshpande',5,'Do Dham done right','Kedarnath and Badrinath both covered comfortably. Placeholder review. [DEMO]',true,true, now() - interval '30 days'),
  ('c1000000-0000-4000-b000-000000000003','Kavita Rao',5,'Smooth Kedarnath trek','Pony arrangement was quick and the base hotel clean. Placeholder review. [DEMO]',true,true, now() - interval '26 days'),
  ('c1000000-0000-4000-b000-000000000006','Farhan Sheikh',4,'Peaceful Haridwar weekend','The Ganga Aarti was unforgettable. Placeholder review. [DEMO]',true,true, now() - interval '20 days'),
  ('c1000000-0000-4000-b000-000000000007','Meera Nair',5,'Vaishno Devi made easy','Helicopter option saved us time. Placeholder review. [DEMO]',true,true, now() - interval '15 days'),
  ('c1000000-0000-4000-b000-000000000008','Vikram Sethi',5,'Kashi beautifully planned','Loved the Sangam visit and the boat ride. Placeholder review. [DEMO]',true,true, now() - interval '10 days'),
  ('c1000000-0000-4000-b000-000000000005','Anjali Gupta',4,'Lovely Gangotri Yamunotri trip','Scenic and serene, well supported trek. Placeholder review. [DEMO]',true,true, now() - interval '5 days')
on conflict do nothing;

-- =====================================================================
-- 8. BLOG POSTS (5)  columns: title, slug, excerpt, body, cover_image,
--    author_name, tags (text[]), is_published, published_at, seo_title, seo_description
-- =====================================================================
insert into public.blog_posts (title, slug, excerpt, body, cover_image, author_name, tags, is_published, published_at, seo_title, seo_description) values
  ('Char Dham Yatra: A Complete First-Timer''s Guide','char-dham-first-timer-guide',
   'Everything you need to plan the Char Dham circuit - season, fitness, packing and route.',
   'The Char Dham Yatra covers Yamunotri, Gangotri, Kedarnath and Badrinath. This guide walks through ideal months, physical preparation, altitude tips and packing. Original placeholder content.',
   '/images/placeholders/chardham.jpg','DevYatra Team',array['char dham','guide'],true, now() - interval '45 days',
   'Char Dham Yatra Complete Guide','Plan your Char Dham Yatra: season, fitness, packing and routes.'),
  ('10 Practical Tips for the Kedarnath Trek','kedarnath-trek-tips',
   'From footwear to acclimatisation - small choices that make the Kedarnath trek easier.',
   'The 16 km trek from Gaurikund to Kedarnath is rewarding but demanding. Ten practical tips on pacing, hydration and pony bookings. Original placeholder content.',
   '/images/placeholders/kedarnath.jpg','DevYatra Team',array['kedarnath','tips'],true, now() - interval '35 days',
   'Kedarnath Trek Tips','Ten practical tips to make your Kedarnath trek safer and more comfortable.'),
  ('Best Time to Visit the Uttarakhand Dhams','best-time-uttarakhand-dhams',
   'A month-by-month look at weather and crowds across the four Himalayan shrines.',
   'Timing shapes your pilgrimage. This guide breaks down the pre-monsoon and post-monsoon windows and portal dates. Original placeholder content.',
   '/images/placeholders/badrinath.jpg','DevYatra Team',array['season','planning'],true, now() - interval '28 days',
   'Best Time to Visit Uttarakhand Dhams','Month-by-month guidance on weather and crowds for the Char Dham shrines.'),
  ('A 2-Day Spiritual Itinerary for Varanasi','varanasi-2day-itinerary',
   'Ghats, aarti and hidden lanes - how to experience Kashi in two days.',
   'Varanasi rewards slow travel. A two-day plan covering the Ganga Aarti, a sunrise boat ride, Kashi Vishwanath and Sarnath. Original placeholder content.',
   '/images/placeholders/varanasi.jpg','DevYatra Team',array['varanasi','itinerary'],true, now() - interval '18 days',
   'Varanasi 2-Day Spiritual Itinerary','A two-day Varanasi itinerary covering ghats, aarti, temples and Sarnath.'),
  ('Vaishno Devi: Trek, Pony or Helicopter?','vaishno-devi-options',
   'Compare the three ways to reach the Bhawan and pick what suits your group.',
   'Reaching Mata Vaishno Devi can be done on foot, by pony/palki or helicopter. Compare cost, time and comfort. Original placeholder content.',
   '/images/placeholders/vaishnodevi.jpg','DevYatra Team',array['vaishno devi','tips'],true, now() - interval '8 days',
   'Vaishno Devi: Trek, Pony or Helicopter','Compare trek, pony and helicopter options for the Vaishno Devi Yatra.')
on conflict (slug) do nothing;

-- =====================================================================
-- 9. DEMO BOOKINGS (15) + travellers + payments
--    enum status  = new|awaiting_confirmation|confirmed|payment_pending|
--                   partially_paid|fully_paid|cancelled|completed|refunded
--    enum payment_status = unpaid|partially_paid|paid|failed|refunded
--    money columns: package_amount, addons_amount, room_charges,
--                   discount_amount, tax_amount, total_amount,
--                   advance_amount, paid_amount
-- =====================================================================
insert into public.bookings (
  reference, package_id, departure_date,
  lead_name, lead_email, lead_phone, country, state, city,
  adults, children, rooms,
  package_amount, addons_amount, room_charges, discount_amount, tax_amount,
  total_amount, advance_amount, paid_amount,
  status, payment_status, terms_accepted, policy_version, is_demo,
  internal_notes, created_at
)
select
  'DYI-2026-' || lpad(seq::text, 6, '0'),
  pkg::uuid, dep_date::date,
  lead_name, lead_email, lead_phone, 'India', st, cty,
  adults, children, rooms,
  pkg_amt, addon_amt, room_amt, disc,
  round((pkg_amt + addon_amt + room_amt - disc) * 0.05, 2),
  round((pkg_amt + addon_amt + room_amt - disc) * 1.05, 2),
  paid,   -- advance_amount = paid for demo simplicity
  paid,
  bstatus::booking_status, pstatus::payment_status, true, 'v1.0', true,
  'DEMO booking - safe to delete before go-live.',
  now() - make_interval(days => age_days)
from (values
  (1 ,'c1000000-0000-4000-b000-000000000001','2026-05-10','Ramesh Iyer','ramesh.demo@example.com','+91-90000-00001','Maharashtra','Mumbai',2,0,1, 89800.00, 0.00, 0.00, 3800.00,'confirmed','paid', 90300.00, 42),
  (2 ,'c1000000-0000-4000-b000-000000000002','2026-05-18','Sunita Menon','sunita.demo@example.com','+91-90000-00002','Kerala','Kochi',2,1,2, 66000.00, 1500.00, 7000.00, 0.00,'confirmed','partially_paid', 25000.00, 36),
  (3 ,'c1000000-0000-4000-b000-000000000003','2026-05-22','Arjun Deshpande','arjun.demo@example.com','+91-90000-00003','Maharashtra','Pune',1,0,1, 14900.00, 0.00, 4500.00, 0.00,'awaiting_confirmation','unpaid', 0.00, 30),
  (4 ,'c1000000-0000-4000-b000-000000000004','2026-06-08','Kavita Rao','kavita.demo@example.com','+91-90000-00004','Karnataka','Bengaluru',2,0,1, 31000.00, 0.00, 0.00, 2000.00,'confirmed','paid', 30450.00, 28),
  (5 ,'c1000000-0000-4000-b000-000000000006','2026-11-14','Farhan Sheikh','farhan.demo@example.com','+91-90000-00005','Delhi','New Delhi',2,2,1, 26800.00, 0.00, 0.00, 0.00,'completed','paid', 28140.00, 60),
  (6 ,'c1000000-0000-4000-b000-000000000007','2026-07-11','Meera Nair','meera.demo@example.com','+91-90000-00006','Tamil Nadu','Chennai',3,0,2, 35997.00, 4500.00, 3500.00, 0.00,'confirmed','partially_paid', 20000.00, 24),
  (7 ,'c1000000-0000-4000-b000-000000000008','2026-11-20','Vikram Sethi','vikram.demo@example.com','+91-90000-00007','Uttar Pradesh','Lucknow',2,0,1, 21800.00, 0.00, 0.00, 1500.00,'new','unpaid', 0.00, 4),
  (8 ,'c1000000-0000-4000-b000-000000000001','2026-06-05','Anjali Gupta','anjali.demo@example.com','+91-90000-00008','Gujarat','Ahmedabad',4,0,2, 179600.00, 0.00, 12000.00, 8000.00,'confirmed','partially_paid', 60000.00, 20),
  (9 ,'c1000000-0000-4000-b000-000000000005','2026-05-30','Deepak Sharma','deepak.demo@example.com','+91-90000-00009','Rajasthan','Jaipur',2,0,1, 33998.00, 0.00, 0.00, 0.00,'cancelled','refunded', 10000.00, 33),
  (10,'c1000000-0000-4000-b000-000000000002','2026-06-12','Pooja Bansal','pooja.demo@example.com','+91-90000-00010','Madhya Pradesh','Indore',1,1,1, 41500.00, 0.00, 0.00, 2500.00,'payment_pending','unpaid', 0.00, 12),
  (11,'c1000000-0000-4000-b000-000000000003','2026-06-20','Sanjay Kulkarni','sanjay.demo@example.com','+91-90000-00011','Maharashtra','Nagpur',2,0,1, 29800.00, 0.00, 4500.00, 0.00,'confirmed','paid', 36015.00, 15),
  (12,'c1000000-0000-4000-b000-000000000006','2026-11-14','Ritu Malhotra','ritu.demo@example.com','+91-90000-00012','Punjab','Amritsar',2,0,1, 15800.00, 500.00, 0.00, 0.00,'completed','paid', 17115.00, 55),
  (13,'c1000000-0000-4000-b000-000000000007','2026-07-11','Karthik Reddy','karthik.demo@example.com','+91-90000-00013','Telangana','Hyderabad',2,1,2, 32497.00, 0.00, 3500.00, 0.00,'awaiting_confirmation','unpaid', 0.00, 6),
  (14,'c1000000-0000-4000-b000-000000000008','2026-11-20','Neha Verma','neha.demo@example.com','+91-90000-00014','Uttar Pradesh','Kanpur',3,0,2, 32700.00, 0.00, 3000.00, 3000.00,'confirmed','partially_paid', 15000.00, 9),
  (15,'c1000000-0000-4000-b000-000000000004','2026-06-08','Alok Nanda','alok.demo@example.com','+91-90000-00015','West Bengal','Kolkata',2,0,1, 31000.00, 0.00, 0.00, 0.00,'new','unpaid', 0.00, 2)
) as t(seq, pkg, dep_date, lead_name, lead_email, lead_phone, st, cty,
       adults, children, rooms, pkg_amt, addon_amt, room_amt, disc,
       bstatus, pstatus, paid, age_days)
on conflict (reference) do nothing;

-- 9b. Lead traveller per demo booking (gender enum: prefer_not_to_say)
insert into public.booking_travellers (booking_id, full_name, age, gender)
select b.id, b.lead_name, 42, 'prefer_not_to_say'::gender_type
from public.bookings b
where b.is_demo = true
on conflict do nothing;

-- 9c. Payment rows for demo bookings that collected money
--     payment_method enum includes 'manual'; payment_status 'paid'
insert into public.payments (booking_id, amount, method, status, note, is_demo, created_at)
select b.id, b.paid_amount, 'manual'::payment_method, 'paid'::payment_status,
       'DEMO payment record - offline/manual entry', true, b.created_at
from public.bookings b
where b.is_demo = true and b.paid_amount > 0
on conflict do nothing;

-- =====================================================================
-- 10. EMAIL TEMPLATES  (columns: key, subject, html_body, is_active)
-- =====================================================================
insert into public.email_templates (key, subject, html_body, is_active) values
  ('booking_ack','Your DevYatra booking {{reference}} is received',
   '<h2>Namaste {{lead_name}},</h2><p>We have received your booking <b>{{reference}}</b> for <b>{{package_name}}</b> on <b>{{departure_date}}</b> for {{traveller_count}} traveller(s).</p><p>Amount: <b>{{total_amount}}</b> &middot; Payment: {{payment_status}} &middot; Status: {{booking_status}}</p><p><i>Note: submission does not guarantee confirmation until our team approves availability.</i></p><p><a href="{{booking_link}}">View your booking</a></p>',true),
  ('booking_owner','New booking {{reference}} - {{package_name}}',
   '<h2>New booking received</h2><p><b>{{reference}}</b> &middot; {{package_name}} &middot; {{departure_date}}</p><p>Customer: {{lead_name}} ({{lead_email}}, {{lead_phone}})</p><p>Travellers: {{traveller_count}} &middot; Total: {{total_amount}} &middot; Payment: {{payment_status}}</p><p><a href="{{admin_link}}">Open in admin panel</a></p>',true),
  ('booking_confirmed','Your yatra {{reference}} is confirmed',
   '<h2>Namaste {{lead_name}},</h2><p>Great news - your booking <b>{{reference}}</b> for <b>{{package_name}}</b> is now <b>confirmed</b>.</p><p>Travel date: {{departure_date}}</p>',true),
  ('booking_cancelled','Your booking {{reference}} has been cancelled',
   '<h2>Namaste {{lead_name}},</h2><p>Your booking <b>{{reference}}</b> has been cancelled. Any eligible refund follows our cancellation policy.</p>',true),
  ('payment_received','Payment received for {{reference}}',
   '<h2>Namaste {{lead_name}},</h2><p>We have recorded a payment for booking <b>{{reference}}</b>. Paid: {{paid_amount}} of {{total_amount}}.</p>',true),
  ('password_reset','Reset your DevYatra password',
   '<h2>Password reset</h2><p>Click the link to reset your password. If you did not request this, ignore this email.</p><p><a href="{{reset_link}}">Reset password</a></p>',true)
on conflict (key) do nothing;

-- =====================================================================
-- 11. WEBSITE SETTINGS  (singleton row id = 1)
-- =====================================================================
update public.website_settings set
  company_name    = 'DevYatra India',
  support_email   = 'support@devyatra.example.com',
  support_phone   = '+91 90000 00000',
  whatsapp_number = '+919000000000',
  address         = 'Placeholder Address, Haridwar, Uttarakhand, India',
  social_instagram= 'https://instagram.com/',
  social_facebook = 'https://facebook.com/',
  social_youtube  = 'https://youtube.com/'
where id = 1;

commit;

-- =====================================================================
-- POST-SEED VERIFICATION (optional — run manually)
--   select 'destinations' t, count(*) from destinations
--   union all select 'packages', count(*) from packages
--   union all select 'departures', count(*) from package_departures
--   union all select 'reviews', count(*) from reviews
--   union all select 'blog_posts', count(*) from blog_posts
--   union all select 'demo_bookings', count(*) from bookings where is_demo
--   union all select 'demo_payments', count(*) from payments where is_demo;
-- =====================================================================
