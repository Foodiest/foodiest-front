export const vibes = [
  { label: "조용한", value: "Quiet", icon: "volume_off" },
  { label: "활기찬", value: "Lively", icon: "celebration" },
  { label: "로맨틱", value: "Romantic", icon: "favorite" },
  { label: "소셜", value: "Social", icon: "groups" },
  { label: "전문적인", value: "Professional", icon: "work" },
  { label: "가족 친화적", value: "Family Friendly", icon: "child_care" },
  { label: "비즈니스", value: "Business", icon: "business_center" },
];

export const flavors = [
  { label: "매콤 강렬", value: "Spicy & Bold", icon: "local_fire_department" },
  { label: "달콤한 디저트", value: "Sweet Treats", icon: "icecream" },
  { label: "감칠맛 풍부", value: "Umami & Rich", icon: "set_meal" },
  { label: "고소한 클래식", value: "Savory Classics", icon: "bakery_dining" },
  { label: "매콤한", value: "Spicy", icon: "local_fire_department" },
  { label: "달콤한", value: "Sweet", icon: "icecream" },
  { label: "고소한", value: "Savory", icon: "egg_alt" },
  { label: "감칠맛", value: "Umami", icon: "emoji_food_beverage" },
  { label: "짭조름한", value: "Salt-heavy", icon: "water_drop" },
];

export const dietary = [
  { label: "견과류 없음", value: "Nut-free", icon: "nutrition" },
  { label: "비건", value: "Vegan", icon: "eco" },
  { label: "글루텐프리", value: "Gluten-free", icon: "egg" },
  { label: "유제품 없음", value: "Dairy-free", icon: "water_drop" },
  { label: "채식", value: "Vegetarian", icon: "spa" },
  { label: "키토", value: "Keto", icon: "bakery_dining" },
  { label: "해산물 없음", value: "No Seafood", icon: "set_meal" },
  { label: "돼지고기 없음", value: "No Pork", icon: "potted_plant" },
];

export const allergies = [
  { label: "땅콩", value: "Peanuts" },
  { label: "갑각류", value: "Shellfish" },
  { label: "유제품", value: "Dairy" },
  { label: "밀", value: "Wheat" },
  { label: "대두", value: "Soy" },
  { label: "생선", value: "Fish" },
  { label: "견과류 없음", value: "Nut-free" },
  { label: "글루텐프리", value: "Gluten-free" },
  { label: "비건", value: "Vegan" },
  { label: "해산물 없음", value: "No Seafood" },
  { label: "돼지고기 없음", value: "No Pork" },
];

// 음식 카테고리 영어 → 한글
export const cuisineMap = {
  Italian: "이탈리안",
  Japanese: "일식",
  "Japanese Ramen": "라멘",
  Indian: "인도 요리",
  French: "프렌치",
  American: "아메리칸",
  "American Burgers": "버거",
  Korean: "한식",
  Chinese: "중식",
  Mexican: "멕시칸",
  Spanish: "스페인 요리",
  Mediterranean: "지중해 요리",
  Thai: "태국 요리",
  Brunch: "브런치",
  "Wine Bar": "와인바",
  "Organic Kitchen": "오가닉 키친",
};

// DB의 영어 값 → 한글 라벨 변환 맵
export const filterLabelMap = {
  // 분위기
  Quiet: "조용한",
  Lively: "활기찬",
  Romantic: "로맨틱",
  Social: "소셜",
  Professional: "전문적인",
  "Family Friendly": "가족 친화적",
  Business: "비즈니스",
  Cozy: "아늑한",
  Casual: "캐주얼",
  // 맛
  "Spicy & Bold": "매콤 강렬",
  "Sweet Treats": "달콤한 디저트",
  "Umami & Rich": "감칠맛 풍부",
  "Savory Classics": "고소한 클래식",
  Spicy: "매콤한",
  Sweet: "달콤한",
  Savory: "고소한",
  Umami: "감칠맛",
  "Salt-heavy": "짭조름한",
  "Light & Fresh": "가볍고 신선한",
  // 식이
  "Nut-free": "견과류 없음",
  Vegan: "비건",
  "Gluten-free": "글루텐프리",
  "Dairy-free": "유제품 없음",
  Vegetarian: "채식",
  Keto: "키토",
  "No Seafood": "해산물 없음",
  "No Pork": "돼지고기 없음",
  // 알레르기
  Peanuts: "땅콩",
  Shellfish: "갑각류",
  Dairy: "유제품",
  Wheat: "밀",
  Soy: "대두",
  Fish: "생선",
};
