-- restaurants 테이블에 sub_images 컬럼 추가
alter table public.restaurants
  add column if not exists sub_images text[] default '{}';

-- 레스토랑별 테마 이미지 적용 (Unsplash, 중복 없음)
-- 1. L'Anima Trattoria (Italian)
update public.restaurants set
  image = 'https://images.unsplash.com/photo-1539267821515-9a48cb52c2bb?auto=format&fit=crop&w=800&q=80',
  sub_images = array[
    'https://images.unsplash.com/photo-1713561058969-793049b01712?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1710587385252-73628f9faeb1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606369779314-062ff8ba39f3?auto=format&fit=crop&w=800&q=80'
  ]
where id = 1;

-- 2. Zenith Sushi (Japanese)
update public.restaurants set
  image = 'https://images.unsplash.com/photo-1611810175414-1ea054685162?auto=format&fit=crop&w=800&q=80',
  sub_images = array[
    'https://images.unsplash.com/photo-1518619745898-93e765966dcd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1758779527927-56c21385ffce?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562436260-126d541901e0?auto=format&fit=crop&w=800&q=80'
  ]
where id = 2;

-- 3. Spice Garden (Indian)
update public.restaurants set
  image = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  sub_images = array[
    'https://images.unsplash.com/photo-1633436375795-12b3b339712f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1710091691780-c7eb0dc50cf8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=800&q=80'
  ]
where id = 3;

-- 4. Sweet Bliss Patisserie (French)
update public.restaurants set
  image = 'https://images.unsplash.com/photo-1544027026-31fbbad5ecee?auto=format&fit=crop&w=800&q=80',
  sub_images = array[
    'https://images.unsplash.com/photo-1544700388-5fd3fbd2fd97?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1712265964629-6cb2c90f9e48?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548538931-b47653628cdc?auto=format&fit=crop&w=800&q=80'
  ]
where id = 4;

-- 5. The Boardroom Grill (American)
update public.restaurants set
  image = 'https://images.unsplash.com/photo-1755811248279-1ab13b7d4384?auto=format&fit=crop&w=800&q=80',
  sub_images = array[
    'https://images.unsplash.com/photo-1558030137-d464dd688b00?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543900348-f03d06be7653?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1709389883900-b0b34592ba11?auto=format&fit=crop&w=800&q=80'
  ]
where id = 5;
