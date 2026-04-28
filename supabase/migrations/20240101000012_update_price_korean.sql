-- 레스토랑별 메뉴 평균 가격을 계산해서 한글 가격대 형식으로 price 컬럼 업데이트
update public.restaurants r
set price = (
  select
    case
      when avg(m.price) < 10000  then '1인 1만원 미만'
      when avg(m.price) < 20000  then '1인 1만원 대'
      when avg(m.price) < 30000  then '1인 2만원 대'
      when avg(m.price) < 40000  then '1인 3만원 대'
      when avg(m.price) < 50000  then '1인 4만원 대'
      when avg(m.price) < 60000  then '1인 5만원 대'
      when avg(m.price) < 70000  then '1인 6만원 대'
      when avg(m.price) < 80000  then '1인 7만원 대'
      when avg(m.price) < 90000  then '1인 8만원 대'
      when avg(m.price) < 100000 then '1인 9만원 대'
      else '1인 10만원 이상'
    end
  from public.menus m
  where m.restaurant_id = r.id
)
where exists (
  select 1 from public.menus m where m.restaurant_id = r.id
);
