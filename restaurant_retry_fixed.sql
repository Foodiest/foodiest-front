-- =============================================
-- 생성 파일: restaurant_retry_fixed.sql
-- 원본 CSV:  restaurant_retry_fixed.csv
-- 식당: 1개 (NEW 1개 / UPDATE 0개)
-- 메뉴: 5건 / 리뷰: 10건
-- user_id=1 고정 — 실제 존재하는 users.id로 변경 필요
-- =============================================

-- ─── 유메노키친 (id=28, NEW) ───

-- [INSERT] 유메노키친 (id=28)
INSERT INTO public.restaurants (id, name, image, sub_images, tags, vibes, flavors, dietary)
VALUES (
  28,
  '유메노키친',
  'https://search.pstatic.net/common/?autoRotate=true&type=w560_sharpen&src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251018_219%2F1760773239738ESCoi_PNG%2F%25C0%25AF%25B8%25DE%25B3%25EB%25C5%25B0%25C4%25A3_%25C0%25A5%25B5%25F0_%25C1%25A4%25B9%25E6.png',
  '{"https://search.pstatic.net/common/?autoRotate=true&type=w278_sharpen&src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230921_224%2F1695262832568srNUe_JPEG%2FIMG_1776.jpeg","https://search.pstatic.net/common/?autoRotate=true&type=w278_sharpen&src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230921_168%2F1695262832216hSWvp_JPEG%2FIMG_1775.jpeg","https://search.pstatic.net/common/?autoRotate=true&type=w278_sharpen&src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230921_40%2F1695262810443sN2M5_JPEG%2FIMG_1778.jpeg"}',
  '{}', '{}', '{}', '{}'
);

INSERT INTO public.menus (restaurant_id, name, price)
VALUES (28, '돈카츠 두툼하고 육즙 가득한 돈카츠를 와사비와 소금으로 즐겨보세요.', 12500);
INSERT INTO public.menus (restaurant_id, name, price)
VALUES (28, '안심카츠 유메노키친만의 비법숙성으로 부드럽고 육즙 가득한 안심가츠', 14500);
INSERT INTO public.menus (restaurant_id, name, price)
VALUES (28, '함박카츠 갈은 소고기와 돼지고기를 갖은 야채와 함께 버무려 튀겨낸 카츠.', 14000);
INSERT INTO public.menus (restaurant_id, name, price)
VALUES (28, '네기네기카츠 두툼하고 육즙가득한 돈카츠위에 카레베이스 소스를 얹고 대파를 가득올린 아삭아삭한 돈카츠', 14000);
INSERT INTO public.menus (restaurant_id, name, price)
VALUES (28, '갈릭마요카츠 두툼한 등심 돈카츠 위에 갈릭마요소스를 얹은 맛있는 카츠를 즐겨보세요.', 14000);

INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  '36126792-d53f-43c5-9c71-55a2c24b5c8f',
  28,
  '양많고 맛있어요. 최근에 먹은 돈카츠중에 젤 맛있었어요. 촉촉하고 바삭해서 겉바속촉 그자체!! 카레도 맛있고 모둠카츠도 푸짐해서 다양하게 먹어봤네요. 혼밥하러 오신분들도 꽤 됐어요. 오리역 맛집 찾고계시다면 추천드려요~',
  5,
  '{"https://pup-review-phinf.pstatic.net/MjAyNjA0MTNfMjE5/MDAxNzc2MDYxNjIyMjQ3.4H1CLgwFpRFyjQPTX-uji7QQqIwspXUxvYDX8I3TfFQg.ZN9vB4amCneNpUmg3wdKd8DdaGtMw7BHG05hjBbRi3Ug.JPEG/IMG_9379.jpeg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjA0MTNfMTYg/MDAxNzc2MDYxNjIxODAz._NODK-GFBx9M0epuYhnrLGu-LOAlPNYx59_4_8kTcO4g.arb1Np9FAZUniH9t-pGeGLoWazlvaaQr5FsaI0gvbX0g.JPEG/IMG_9380.jpeg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  '231fd20a-6cfd-44ff-9ca1-d68a6cfa190e',
  28,
  '제가 카츠동을 엄청 좋아해서 거의 소울푸드 느낌인데, 한 입 먹자마자 와 이맛이다… 싶더라고요ㅋㅋ 일본에서 먹던 카츠동 맛이 딱 떠올라서 괜히 더 반갑고 행복했어요. 안심카츠는 겉은 바삭하고 속은 촉촉해서 육즙도 좋았고요. 냉우동도 진짜 킥이었어요. 시원한 우동에 들어간 시그니처 냉소스가 너무 맛있어서 계속 생각나는 맛이었어요. 이 냉소스를 따로 판매한다고 해서 집에서도 먹을 수 있다니 괜히 더 반가웠어요. 매장 분위기도 깔끔하고 편안해서 식사하기 좋았고, 카츠 좋아하시는 분들은 한 번 가보셔도 좋을 것 같아요. 저는 힘들 때마다 카츠동 찾는 사람이라 앞으로도 종종 생각날 것 같은 집이에요. 힐링음식을 찾아서 너무 만족스럽고 자주 방문할게요 사장님 짱짱 ⭐️',
  5,
  '{"https://pup-review-phinf.pstatic.net/MjAyNjAzMTRfMTc3/MDAxNzczNDkwNzk5MDkw.sSrVE92oxUwXNJfuib3PDF23gRmblIFIsM1jkpeTmeQg.9uEg7hlUyj3cyOUDCQXSV6xp9Y0v58zqC2-Wu8lsbxMg.JPEG/CFBD91FA-06A1-4B8E-8EEB-BA752C44B27C.jpeg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAzMTRfMjgx/MDAxNzczNDkwNzk5MjI0.7vvZRX1Lr0KkAhn14IgkkYpFHi2qBzcrZGmiY6XkRzAg.M5GrgGL93znNU5-2pVW-EviRf4Lnr8eUJX8uI4ZDQyYg.JPEG/73AB6DB3-F0E8-41D9-928C-0EA67E36A3D7.jpeg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAzMTRfMjc2/MDAxNzczNDkwNzk5MjYy.th4a3YMTTBd9u1gkpFo3Vniw72Dw_wEdxIHVtPkhVlYg.zBqM6MzG6FrQbqtWzdzQVCzXaRLatRtkhHTpsbaeTc4g.JPEG/11BC71EB-1372-4418-8AD9-160F72099B02.jpeg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  'b5b8a7d6-7bdf-4d94-b436-9470c1053229',
  28,
  '매장도 너무 깨끗하고 일본에 온 느낌도 들고음식도 너무 맛있습니다~ 안심카츠를 먹었는데 너무 부드러워서 입에서 녹더라고요 ㅎㅎ 다음에도 또 방문할 계획입니다!! 오리역 7번 출구에서 가깝더라고용 오리역 맛집 인정합니다!!!!',
  5,
  '{"https://pup-review-phinf.pstatic.net/MjAyNjAyMDNfNTgg/MDAxNzcwMTA5NjQxNTIy.ad2zl6fFN6fdlqsmYxZZHuuuYHXtxOi4YEYLaJHThTUg.nFlMPHg2jYWKVw1IIIXvtcX908yDyJfCPPEXDP0bsAYg.JPEG/6D942919-FFB8-4A02-BA9B-C79996991538.jpeg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAyMDNfMjAg/MDAxNzcwMTA5NjQwOTgz.Gm8ShnpA_d70Sn1d2yvkpTeWqdo_1Pq1dt2RZ9wuyYcg.wve0Sj37-Opxoe5W3VT0vFcLug-YStl40DnM6UELAFMg.JPEG/D8BA50FC-4E78-47E2-BD73-651A75D9653F.jpeg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAyMDNfMTY5/MDAxNzcwMTA5NjQyMjQx.1mtByXBvGbmx3xGl7SxWvobkJuwN1tdzIPEWNDimaHAg.Af8T7zXT4sv7NveC0f7nywU6llSM7IGwTEwcVV_bDNsg.JPEG/C54439C9-6F29-48F4-89BF-1BF4630C1AA5.jpeg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  '57610619-9d9d-4c9d-818d-5ab6c258131b',
  28,
  '전에 생생정보통에 나온걸 보고 분당갈일 있을때 들러봐야지하고 오늘 방문했어요. 돈가스가 두툼하고 부드러워요. 안심가츠가 특히 맛있었고 아무래도 튀김종류다보니 카레랑 아주 잘 어울렸어요. 느끼함을 잡아주는 느낌. 카레나 밥은 모자르면 리필되구요. 카츠양이 넉넉해서 카레만 조금 리필했어요. 맛도 양도 친절함도 넉넉한 곳입니다.',
  5,
  '{"https://search.pstatic.net/common/?autoRotate=true&quality=95&type=f&size=480x600&src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyNjAxMjRfODYg%2FMDAxNzY5MjYxNjY5NDQ4.rm2sK0ZJojVek0NqJl7Fyz5b59bH0OWJLv30MyyL1aMg.rpnRN2dy7S4o6UgXJZXCr7aNzh42hVaHcikbSH6JN6Ig.JPEG%2Fvideo_thumbnail.jpg","https://pup-review-phinf.pstatic.net/MjAyNjAxMjRfMTcg/MDAxNzY5MjYxNjY5NTU5.57ziTR1_5QV7VS1PgHYkaFS_LIKH4yHNCLxeiaVb7pEg.7rN4pUVgpk5pavRnNixJezybL3BjisK1teeBWubnNpcg.JPEG/20260121_181848.jpg.jpg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAxMjRfMjk1/MDAxNzY5MjYxNjY5NjU2.4wOWQctbzMJI5sDkJjOPb278GIswvW4rtiY0RVGY3AMg.ts5O-rP4ZP3qpxMgbtRVfyyb_-4CtNDIpczZ9T9QAMAg.JPEG/20260121_181830.jpg.jpg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAxMjRfMjU2/MDAxNzY5MjYxNjY5NzA0.R2tVdhLZDijw_IlLOve7rx2BdejWalvl15GoD9eSmxwg.yvWpR6c74qXJv8qZebjOHEfMa0v60XxMn6cz0krgkkgg.JPEG/20260121_181834.jpg.jpg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  '3d33ac62-c6db-459b-8271-c5d61f82a58d',
  28,
  '정말 맛있었어요!! 사장님 친절하시고 양도 많고 손님이 많더라구용! 다음에 또 방문각',
  5,
  '{"https://pup-review-phinf.pstatic.net/MjAyNjAzMThfNDEg/MDAxNzczNzkzNjMzNTcz.nhNv1oAtn1SVG-Gg-rDjNGFMHAuOKghM-ChBkgLsvUwg.MZnbQvj6EebajKjHwV9VnCfC2-Z7Tqh18KGHOVUfEQ0g.JPEG/20260317_185742.jpg.jpg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAzMThfMjA0/MDAxNzczNzkzNjM1Njc3.vMJ-5nbYBa1U6lcPi3Cwm8pGQHroIt0uNFSITFNxviQg.yhkDYubeYGR_YT6-RiCH65svU4DuBdalJVsQjXSWPTQg.JPEG/20260317_185759.jpg.jpg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAzMThfMzQg/MDAxNzczNzkzNjM2MTE3.hQNaxBgOpFhG_CYwXnrK426rGEhnRHRTwsDNI6X_dtEg.wLldRkx5G2luggJQRUblKOeaXJQIIIJDBCukL29cCkIg.JPEG/20260317_185734.jpg.jpg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  '1b2ad565-7d14-4390-9a6a-f9fb92683102',
  28,
  '돈까스매니아 아들이 엄지척 날려주네요~ 안심까스 고기가 정말 부드럽고 맛있어요♡ 청량갈릭마요 쏘쓰도 맛납니다^^느끼한 맛을 싹 잡아주네요^^~  카레도 적당히 짭쪼롬하고 맛났어요  오랫만에 기분좋은 외식입니다~~ 미xx랑은 차원이 다름요^^',
  5,
  '{"https://pup-review-phinf.pstatic.net/MjAyNjAyMDlfMjYz/MDAxNzcwNjEwNzM0MzAw.1k-pXuDltDiVAlHHkdmgBn_Y2rERuznpiIZbvzzAumUg.bOhMe_m-CeH2Azlf-ugTLt2zpIE-FDGP154TPnyi7g8g.JPEG/20260209_123027.jpg.jpg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAyMDlfMTIg/MDAxNzcwNjEwNzMzOTMx.l4zlH7mYKTA4Eu80Si3lFdw3erL5vuivon4hVkVot1Ig.UvwdSTt26Oe8AwnWTBaATomcN2PUN0AZsQGkui9OAHIg.JPEG/20260209_123034.jpg.jpg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  'ee9b6fa3-72e8-49f6-acf9-7b7afb952f25',
  28,
  '자칭 돈까스매니아 인데 엄청난 맛집을 발견해 신나요~ 믹스카츠로 안심,등심 돈까스를 맛보았는데 주문즉시 두툼한 카츠를 바로 튀켜줘서 진짜 맛있어요~ 바삭하지만 고기는 촉촉하고 육즙이 있어 소스 보다도 소금과 와사비 만으로 고급스러운 돈카츠의 맛을 느낄 수 있었어요!! 티비에도 나오고 유명 맛집이더라구요^^ 맛있는데 양도 정말 많아서 좋아하는 돈카츠 듬뿍 먹고 왔습니다! 그리고 사장님도 정말 친절 하셔요~ 이런 맛집은 더 많은 분들이오셨으면 좋겠습니다!!',
  5,
  '{"https://pup-review-phinf.pstatic.net/MjAyNjAxMTJfMjM3/MDAxNzY4MjE3NzY3MzMx.1mD0Q41XhqNbLJLwZR6mSHsK1G52S12RX9sMPHrPNGEg.OydmgqQk0Tl9WnRFDBUcQGG4fC2kdUDrBk_8-OgMoicg.JPEG/6C27ACD1-7C63-4CAD-A3C4-09AFD1E4397D.jpeg?type=w1500_60_sharpen","https://search.pstatic.net/common/?autoRotate=true&quality=95&type=f&size=480x600&src=https%3A%2F%2Fpup-review-phinf.pstatic.net%2FMjAyNjAxMTJfMzIg%2FMDAxNzY4MjE3NzY3MDY3.eH-FtkQ9rIwpvDap1ijkwNBN-YXduqDuRIsB7wkd0LIg.heP3yac7eTUPV6UOnr0h8qhgkRuIDWmDVz_8L2OOTgMg.JPEG%2F51484576-403C-4854-93BF-26946B36ACB0.jpeg","https://pup-review-phinf.pstatic.net/MjAyNjAxMTJfMTYy/MDAxNzY4MjE3NzY3MTY3.uEy2MOUpyrvPeX1mvLX7dIDMhKEno-MbXrmomuzWVDEg.hiz020yBMV4oyNZUqA3FLIuMRmlwv02y2NYX9gdkPJ0g.JPEG/E8A05115-2E8F-4EA4-BD11-F1C3D2B05AC1.jpeg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAxMTJfMTM0/MDAxNzY4MjE3NzY3MjIx.qqF8_yJUWt6DYsO58BH_IvMyUoIntyw4094N-m-Hcbcg.BRB-GcAoELLfGZF2KH6EUolxF4oee3ivzMmVeK_1i8Eg.JPEG/0A8D36AC-6F68-414D-B097-FEA397608AB1.jpeg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  '1631febb-fd75-4c50-b55b-2c04287a4666',
  28,
  '나오자마자 너무 맛있어보여서 등심 안심 한점씩 먹고 사진 찍었어요 ㅎ 양도 많고 고기가 잡내 하나 없이 촉촉하고 고소해서 맛있게 잘 먹었습니다~ 또 먹다보니 샐러드랑 밥이 조금 부족했는데 빈 그릇 보시더니 바로 리필해주셨어요. 사장님과 알바분? 두분다 너무 친절하셔서 오랜만에 이어폰 빼고 밥 먹었네요 감사합니다 또 방문할게요~',
  5,
  '{"https://pup-review-phinf.pstatic.net/MjAyNjAxMTJfMjAw/MDAxNzY4MTkxODk2NDQ4.dDDO_7sifG5lAhiOtANQYAG_F6-nf27fxQqdeIGJQ-og.1cnyPELd2BBznjHtfxGMe1GocilIGVcgIDqTig5IG7Ug.JPEG/DB43700E-CB9F-4C73-873C-0BEDFDDAA766.jpeg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAxMTJfOTUg/MDAxNzY4MTkxODk2NDk1.TgLffCD3JZc4XtejC-ovyj_zViOKVOwmU0yvhMSC3XAg.pF9FSP46_Axvr9LCDiEm1FW0z8iTtPKWpE2LfWy1vqcg.JPEG/2B417F28-3653-4EC5-A065-7260EABC485F.jpeg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  'e4a36775-2a2d-40cd-b166-26e408f58ebd',
  28,
  '모둠카츠로 시키기 너무잘했네요..새우카츠랑 안심카츠 정말 너무 맛있었고 안심이 특히 더 겉바속촉 해서 좋았어요..💛 카레도 적당히 매콤한 맛이 나면서 함박카츠와 잘 어울렸어요 ! 재방문 각이에요',
  5,
  '{"https://pup-review-phinf.pstatic.net/MjAyNjAyMDRfMTE4/MDAxNzcwMjAwODU0NDU3.oRv3yG5PNNi4EMaKcKmPXGVflBJabpAcr_ERtS6dIU0g.bxOWw_kiu3Wjl7ce_soDs3hrDVHpEUFMWG5xhJlEfkUg.JPEG/IMG_6695.jpeg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAyMDRfNzgg/MDAxNzcwMjAwODU0MzYy.1UUXSbxO129x6HaKMa74TLFHS4ukyfGCSEi-_zE__KYg.qNibkG_TAhMTt5xpMFollYI0iEu_gXYJtIR_Vb_nuc0g.JPEG/IMG_6698.jpeg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAyMDRfOTkg/MDAxNzcwMjAwODU0NjQx.co33Ng4R-vUUJW47rWr2Gwdxym9Z9Cn6SDaf15RfcDcg.80wwCeDGfE8X0xyfkmwlqYoni2sONL9La6r7QNFEZV4g.JPEG/IMG_6703.jpeg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
INSERT INTO public.reviews (id, restaurant_id, review_text, rating, images, keywords, negative_keywords, user_id)
VALUES (
  '2406c71e-d570-4e69-a3a8-359d80810d7f',
  28,
  '일본식돈카츠가 먹고싶어서 오리역근처에 왔어요 안심카츠, 네기네기카츠, 우동 먹었어요  돈카츠 느끼하지 않고 부드럽고 맛있었어요 특히 우동의 오뎅튀김이 너무 맛있었어요 굿굿',
  5,
  '{"https://pup-review-phinf.pstatic.net/MjAyNjAyMTBfMjI3/MDAxNzcwNzI2MDY2NDYx.bPecL8WnpA3JnYEr7__Cx9sUdcPiuY23XaNd25OXdkYg.g6CeftLWjUuWPqViom0TUy51cbFFBB3FAO0UiNpO33Eg.JPEG/20260210_200022.jpg?type=w1500_60_sharpen","https://pup-review-phinf.pstatic.net/MjAyNjAyMTBfNzAg/MDAxNzcwNzI2MDkwNTcy.h1cNB6fpr1a1nq9MT8wNTuVFkOVomnqtyW2N9vJnkzAg.LlZTiNTz4ztFUrKep1BRKpAir0d8y81qR-LXGnh-tlkg.JPEG/20260210_200051.jpg?type=w1500_60_sharpen"}',
  '{}'::jsonb,
  '{}',
  1
);
