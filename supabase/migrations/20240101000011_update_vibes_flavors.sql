-- =============================================
-- 1단계: cuisine 비어있는 레스토랑 이름 키워드로 자동 배정
-- =============================================

UPDATE public.restaurants
SET cuisine = CASE
  WHEN name ILIKE ANY(ARRAY['%스시%','%초밥%','%사시미%','%오마카세%','%돈카츠%','%うどん%','%우동%'])
       THEN 'Japanese'
  WHEN name ILIKE ANY(ARRAY['%라멘%','%라면%','%탄탄면%'])
       THEN 'Japanese Ramen'
  WHEN name ILIKE ANY(ARRAY['%짜장%','%짬뽕%','%중화%','%마라%','%딤섬%','%양꼬치%'])
       THEN 'Chinese'
  WHEN name ILIKE ANY(ARRAY['%파스타%','%피자%','%트라토리아%','%리스토란테%','%이탈리안%'])
       THEN 'Italian'
  WHEN name ILIKE ANY(ARRAY['%버거%','%스테이크%','%BBQ%','%바베큐%','%그릴%'])
       THEN 'American'
  WHEN name ILIKE ANY(ARRAY['%타코%','%부리또%','%멕시코%','%칸티나%'])
       THEN 'Mexican'
  WHEN name ILIKE ANY(ARRAY['%카레%','%인도%','%탄두리%','%마살라%'])
       THEN 'Indian'
  WHEN name ILIKE ANY(ARRAY['%태국%','%팟타이%','%똠양%'])
       THEN 'Thai'
  WHEN name ILIKE ANY(ARRAY['%비스트로%','%브라세리%','%프렌치%','%크레페%','%파티스리%'])
       THEN 'French'
  WHEN name ILIKE ANY(ARRAY['%카페%','%커피%','%브런치%','%베이커리%','%디저트%','%케이크%'])
       THEN 'Brunch'
  WHEN name ILIKE ANY(ARRAY['%와인%','%바%','%펍%'])
       THEN 'Wine Bar'
  WHEN name ILIKE ANY(ARRAY['%비건%','%채식%','%오가닉%','%건강%','%샐러드%'])
       THEN 'Organic Kitchen'
  WHEN name ILIKE ANY(ARRAY['%국밥%','%갈비%','%삼겹%','%곱창%','%순대%','%냉면%','%보쌈%','%족발%','%설렁탕%','%해장%','%한식%','%한정식%'])
       THEN 'Korean'
  ELSE 'Korean'
END
WHERE cuisine IS NULL OR cuisine = '';

-- =============================================
-- 2단계: vibes / flavors 비어있는 레스토랑 일괄 업데이트
-- cuisine 기준으로 적절한 값 배정
-- =============================================

UPDATE public.restaurants
SET
  vibes = CASE
    WHEN cuisine = 'Korean'            THEN ARRAY['Lively', 'Family Friendly']
    WHEN cuisine = 'Japanese'          THEN ARRAY['Quiet', 'Professional']
    WHEN cuisine = 'Japanese Ramen'    THEN ARRAY['Lively', 'Social']
    WHEN cuisine = 'Chinese'           THEN ARRAY['Social', 'Family Friendly']
    WHEN cuisine = 'Italian'           THEN ARRAY['Quiet', 'Romantic']
    WHEN cuisine = 'French'            THEN ARRAY['Romantic', 'Quiet']
    WHEN cuisine = 'American'          THEN ARRAY['Professional', 'Quiet']
    WHEN cuisine = 'American Burgers'  THEN ARRAY['Lively', 'Social']
    WHEN cuisine = 'Indian'            THEN ARRAY['Lively', 'Social']
    WHEN cuisine = 'Mexican'           THEN ARRAY['Lively', 'Social']
    WHEN cuisine = 'Spanish'           THEN ARRAY['Romantic', 'Social']
    WHEN cuisine = 'Mediterranean'     THEN ARRAY['Quiet', 'Romantic']
    WHEN cuisine = 'Thai'              THEN ARRAY['Lively', 'Social']
    WHEN cuisine = 'Brunch'            THEN ARRAY['Quiet', 'Romantic']
    WHEN cuisine = 'Wine Bar'          THEN ARRAY['Romantic', 'Professional']
    WHEN cuisine = 'Organic Kitchen'   THEN ARRAY['Quiet', 'Family Friendly']
    WHEN cuisine IS NULL OR cuisine = '' THEN ARRAY['Social', 'Family Friendly']
    ELSE                                    ARRAY['Social', 'Lively']
  END,
  flavors = CASE
    WHEN cuisine = 'Korean'            THEN ARRAY['Spicy & Bold', 'Savory Classics']
    WHEN cuisine = 'Japanese'          THEN ARRAY['Umami & Rich', 'Savory Classics']
    WHEN cuisine = 'Japanese Ramen'    THEN ARRAY['Umami & Rich', 'Savory']
    WHEN cuisine = 'Chinese'           THEN ARRAY['Savory Classics', 'Umami & Rich']
    WHEN cuisine = 'Italian'           THEN ARRAY['Savory Classics', 'Umami & Rich']
    WHEN cuisine = 'French'            THEN ARRAY['Sweet Treats', 'Savory Classics']
    WHEN cuisine = 'American'          THEN ARRAY['Savory Classics', 'Umami & Rich']
    WHEN cuisine = 'American Burgers'  THEN ARRAY['Savory Classics', 'Umami & Rich']
    WHEN cuisine = 'Indian'            THEN ARRAY['Spicy & Bold', 'Savory Classics']
    WHEN cuisine = 'Mexican'           THEN ARRAY['Spicy & Bold', 'Savory Classics']
    WHEN cuisine = 'Spanish'           THEN ARRAY['Savory Classics', 'Umami & Rich']
    WHEN cuisine = 'Mediterranean'     THEN ARRAY['Savory Classics', 'Umami & Rich']
    WHEN cuisine = 'Thai'              THEN ARRAY['Spicy & Bold', 'Umami & Rich']
    WHEN cuisine = 'Brunch'            THEN ARRAY['Sweet Treats', 'Savory Classics']
    WHEN cuisine = 'Wine Bar'          THEN ARRAY['Savory Classics', 'Umami & Rich']
    WHEN cuisine = 'Organic Kitchen'   THEN ARRAY['Savory Classics', 'Sweet Treats']
    WHEN cuisine IS NULL OR cuisine = '' THEN ARRAY['Savory Classics', 'Umami & Rich']
    ELSE                                    ARRAY['Savory Classics']
  END
WHERE
  vibes = '{}'::text[] OR flavors = '{}'::text[];
