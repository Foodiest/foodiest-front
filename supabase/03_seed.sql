-- =============================================
-- 03_seed.sql  —  초기 레스토랑 데이터
-- 02_rls.sql 실행 후 실행
-- =============================================

insert into public.restaurants
  (id, name, cuisine, price, rating, distance, badge, event, tags, note, quote, image, vibes, flavors, dietary, x, y, description, hours, phone, website)
values
(1, 'L''Anima Trattoria', 'Italian', '$$$', 4.9, '0.4 miles away',
  '푸슐랭 가이드', '리뷰 이벤트',
  array['Exquisite Truffle Pasta','Quiet Atmosphere'],
  'Limited seating',
  '"The portion sizes were generous and the waitstaff was incredibly attentive."',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3',
  array['Quiet','Romantic'], array['Savory Classics','Umami & Rich'], array['Gluten-free','Nut-free'],
  126.9784, 37.5665,
  'A hidden gem in the heart of the city, L''Anima Trattoria brings the soul of Rome to your table.',
  '{"weekday":"5:00 PM - 11:00 PM","weekend":"12:00 PM - 12:00 AM"}',
  '+1 (555) 012-3456', 'https://lanima-trattoria.com'),

(2, 'Zenith Sushi', 'Japanese', '$$$$', 4.7, '1.2 miles away',
  '푸슐랭 가이드', '리뷰 이벤트',
  array['Freshest Sashimi'],
  'Pricey but worth it',
  '"A true masterclass in minimalist dining and flavor balance."',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzUfzwLMQ32xHuDnvGV8J-QyTSOpMJNoPibvjsKk4axh9rixwT76n_RYoOqNt5eZNeYE1qHOFl1RPhacE3sZyr-fZ6gpQAA7yx-7iVv0gtkekzaTYYsjwA1EfMMsygdrWrGxN3tbbRhFn2U3OborWQk9oeupPUufCk29ggypT949zsz-p15VtMWsJFiXG0WsVDEtsfUyayadS-l9pfC7Iu1VYfLTMxB507nBBwePxJ-kZIuYkZGZuv65aO1pptr4yxfBjFKg_ET7GDd',
  array['Quiet','Professional'], array['Umami & Rich','Savory Classics'], array['Gluten-free','Dairy-free'],
  127.0495, 37.5172,
  null, null, null, null),

(3, 'Spice Garden', 'Indian', '$$', 4.5, '0.8 miles away',
  '푸슐랭 가이드', '리뷰 이벤트',
  array['Authentic Curry','Vibrant Flavors'],
  'Great for groups',
  '"Bold spices and a lively atmosphere — an unforgettable experience."',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3',
  array['Lively','Social'], array['Spicy & Bold','Savory Classics'], array['Vegan','Vegetarian'],
  126.9219, 37.5563,
  null, null, null, null),

(4, 'Sweet Bliss Patisserie', 'French', '$$', 4.6, '1.5 miles away',
  '푸슐랭 가이드', '리뷰 이벤트',
  array['Handcrafted Desserts','Cozy Setting'],
  'Perfect for dates',
  '"Every bite felt like a little moment of joy."',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzUfzwLMQ32xHuDnvGV8J-QyTSOpMJNoPibvjsKk4axh9rixwT76n_RYoOqNt5eZNeYE1qHOFl1RPhacE3sZyr-fZ6gpQAA7yx-7iVv0gtkekzaTYYsjwA1EfMMsygdrWrGxN3tbbRhFn2U3OborWQk9oeupPUufCk29ggypT949zsz-p15VtMWsJFiXG0WsVDEtsfUyayadS-l9pfC7Iu1VYfLTMxB507nBBwePxJ-kZIuYkZGZuv65aO1pptr4yxfBjFKg_ET7GDd',
  array['Romantic','Family Friendly'], array['Sweet Treats'], array['Nut-free','Vegan'],
  126.9887, 37.572,
  null, null, null, null),

(5, 'The Boardroom Grill', 'American', '$$$$', 4.8, '0.6 miles away',
  '푸슐랭 가이드', '리뷰 이벤트',
  array['Prime Steak','Private Dining'],
  'Business friendly',
  '"Impeccable service and a menu that impresses every client."',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3',
  array['Professional','Quiet'], array['Savory Classics','Umami & Rich'], array['Keto','Gluten-free'],
  127.0276, 37.4979,
  null, null, null, null)

on conflict (id) do nothing;

-- serial 시퀀스를 seed 다음 값으로 맞춤
select setval('public.restaurants_id_seq', (select max(id) from public.restaurants));
