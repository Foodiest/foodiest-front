-- =============================================
-- 03_seed.sql  —  초기 레스토랑 데이터
-- 02_rls.sql 실행 후 실행
-- =============================================

insert into public.restaurants
  (id, name, cuisine, price, rating, distance, badge, event, tags, note, quote, image, sub_images, vibes, flavors, dietary, x, y, description, hours, phone, website)
values
(1, 'L''Anima Trattoria', 'Italian', '$$$', 4.9, '0.4 miles away',
  '푸슐랭 가이드', '리뷰 이벤트',
  array['Exquisite Truffle Pasta','Quiet Atmosphere'],
  'Limited seating',
  '"The portion sizes were generous and the waitstaff was incredibly attentive."',
  'https://images.unsplash.com/photo-1539267821515-9a48cb52c2bb?auto=format&fit=crop&w=800&q=80',
  array[
    'https://images.unsplash.com/photo-1713561058969-793049b01712?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1710587385252-73628f9faeb1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606369779314-062ff8ba39f3?auto=format&fit=crop&w=800&q=80'
  ],
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
  'https://images.unsplash.com/photo-1611810175414-1ea054685162?auto=format&fit=crop&w=800&q=80',
  array[
    'https://images.unsplash.com/photo-1518619745898-93e765966dcd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1758779527927-56c21385ffce?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562436260-126d541901e0?auto=format&fit=crop&w=800&q=80'
  ],
  array['Quiet','Professional'], array['Umami & Rich','Savory Classics'], array['Gluten-free','Dairy-free'],
  127.0495, 37.5172,
  null, null, null, null),

(3, 'Spice Garden', 'Indian', '$$', 4.5, '0.8 miles away',
  '푸슐랭 가이드', '리뷰 이벤트',
  array['Authentic Curry','Vibrant Flavors'],
  'Great for groups',
  '"Bold spices and a lively atmosphere — an unforgettable experience."',
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  array[
    'https://images.unsplash.com/photo-1633436375795-12b3b339712f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1710091691780-c7eb0dc50cf8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80'
  ],
  array['Lively','Social'], array['Spicy & Bold','Savory Classics'], array['Vegan','Vegetarian'],
  126.9219, 37.5563,
  null, null, null, null),

(4, 'Sweet Bliss Patisserie', 'French', '$$', 4.6, '1.5 miles away',
  '푸슐랭 가이드', '리뷰 이벤트',
  array['Handcrafted Desserts','Cozy Setting'],
  'Perfect for dates',
  '"Every bite felt like a little moment of joy."',
  'https://images.unsplash.com/photo-1544027026-31fbbad5ecee?auto=format&fit=crop&w=800&q=80',
  array[
    'https://images.unsplash.com/photo-1544700388-5fd3fbd2fd97?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1712265964629-6cb2c90f9e48?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548538931-b47653628cdc?auto=format&fit=crop&w=800&q=80'
  ],
  array['Romantic','Family Friendly'], array['Sweet Treats'], array['Nut-free','Vegan'],
  126.9887, 37.572,
  null, null, null, null),

(5, 'The Boardroom Grill', 'American', '$$$$', 4.8, '0.6 miles away',
  '푸슐랭 가이드', '리뷰 이벤트',
  array['Prime Steak','Private Dining'],
  'Business friendly',
  '"Impeccable service and a menu that impresses every client."',
  'https://images.unsplash.com/photo-1755811248279-1ab13b7d4384?auto=format&fit=crop&w=800&q=80',
  array[
    'https://images.unsplash.com/photo-1558030137-d464dd688b00?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543900348-f03d06be7653?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1709389883900-b0b34592ba11?auto=format&fit=crop&w=800&q=80'
  ],
  array['Professional','Quiet'], array['Savory Classics','Umami & Rich'], array['Keto','Gluten-free'],
  127.0276, 37.4979,
  null, null, null, null)

on conflict (id) do update set
  image = excluded.image,
  sub_images = excluded.sub_images;

-- serial 시퀀스를 seed 다음 값으로 맞춤
select setval('public.restaurants_id_seq', (select max(id) from public.restaurants));
