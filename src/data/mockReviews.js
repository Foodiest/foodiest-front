export const scores = [
  { label: "Taste", value: 98 },
  { label: "Service", value: 95 },
  { label: "Mood", value: 92 },
];

export const mockReview = {
  userName: "Elena Martinez",
  userInitials: "EM",
  date: "2 days ago",
  status: "Local Guide",
  rating: 5,
  content:
    '"The Cacio e Pepe was life-changing. We sat in a corner booth and could actually hear each other speak. The AI recommendation was spot on about the quiet vibe!"',
  images: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAGrKERkAoI4x2VQxH3TC3zd4gK_6TAjyvhvkYrBW3hrZGjE5SDBNJEuSXLJB74A84iybZnN7lssT39Yn2wVTghJ52TxCrxq1_eK6NqxUTf1MfRWOfAPHXxPL-wWgJRRG1hj3SO1P_xhmDLbwfzSrEYWJQb1a-uiqBIpsE-s8TXZeNCA2RSiR6EqqCK__8PGCyPOieAp_a4WWyfdRnyNZT-e6FNOtwLbIBXXSLZTeLjG4ohKjPvMSD3HnYDQypWgfKYNa4C4_O1NZ0UsdHihq",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDiJOprzucmBE7R6FGTUTwUNNjH-WMdA3rRA_-PSydHn52ztS4Z_lvxZj9Mc7wZcKSuz8VuTMkJkJqO5p1lmKjhk2OqGVjTnUwZYfri1vBLBAfIuMDdycEMlKvN8VEJqWx-8lUwvrkbSHeIrupiV4h_vp4AqBXax2e53z3nzburM05_9NbERnJxiEeofIm0YD0o-Eg2fQnJu-69beU_RXNlLGU3Tgx-J9edmVAPcPnUNdaDA3rDQlJBf6rLOIay0rM1_JI2xovrX3eO",
  ],
};

export const mockReviews = [
  {
    id: "rev-1-1",
    userNo: 1,
    userId: "hyuk_dev",
    restaurant: "L'Anima Trattoria",
    reviewText:
      "트러플 파스타의 풍미가 정말 깊어요. 조용한 분위기 덕분에 대화하기 좋습니다.",
    rating: 5,
    date: "2026-04-10",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3",
    ],
    keywords: {
      Vibe: ["Quiet"],
      Taste: ["Umami-rich"],
      Service: ["Attentive"],
    },
  },
  {
    id: "rev-1-2",
    userNo: 1,
    userId: "hyuk_dev",
    restaurant: "Zenith Sushi",
    reviewText:
      "미니멀한 인테리어와 신선한 사시미가 인상적입니다. 정갈한 맛이네요.",
    rating: 4,
    date: "2026-04-15",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBzUfzwLMQ32xHuDnvGV8J-QyTSOpMJNoPibvjsKk4axh9rixwT76n_RYoOqNt5eZNeYE1qHOF1RPhacE3sZyr-fZ6gpQAA7yx-7iVv0gtkekzaTYYsjwA1EfMMsygdrWrGxN3tbbRhFn2U3OborWQk9oeupPUufCk29ggypT949zsz-p15VtMWsJFiXG0WsVDEtsfUyayadS-l9pfC7Iu1VYfLTMxB507nBBwePxJ-kZIuYkZGZuv65aO1pptr4yxfBjFKg_ET7GDd",
    ],
    keywords: { Vibe: ["Minimalist"], Taste: ["Authentic"], Service: ["Fast"] },
  },
  {
    id: "rev-1-3",
    userNo: 1,
    userId: "hyuk_dev",
    restaurant: "Wild & Raw",
    reviewText:
      "유기농 재료라 그런지 속이 편해요. 식물원 같은 분위기도 맘에 듭니다.",
    rating: 5,
    date: "2026-04-20",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvdqc2VoexOAJdxt7---KdH4tn8CXYxIMdrxtjqNEW-YgwJk9IW1NVVHlT__lK4wFLJBcIC-9liRa3xwQi8vraA_7Pu6wom5dspTMvUY3wahKPbeXI6qAfn2B7XS-WPxZps6waSUqtmiWJiLksTu0JeCJE9eKa0cSFg2kFH4aXOf3gDSvlFqK-_dchpPRbPAz0mRnIpmAg-4MX445vS74uvHSsCRZhFfxrATblMGTguGHKzSWFetFgGmeb99qs_l5DO8vjBnkaJkIv",
    ],
    keywords: {
      Vibe: ["Sophisticated"],
      Taste: ["Savory"],
      Service: ["Friendly"],
    },
  },

  // --- 유저 2: jane_gourmet (Id: 2) ---
  {
    id: "rev-2-1",
    userNo: 2,
    userId: "jane_gourmet",
    restaurant: "Neon Sips",
    reviewText:
      "칵테일 비주얼이 대박! 음악 소리가 좀 크지만 친구들과 즐겁게 놀기 좋아요.",
    rating: 4,
    date: "2026-04-12",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-asKVKC_AIuRh5Mv7Awg8xE8-YYJP7_b5Qkri9mLbihVlfZrUulIgjwvVqUgYw-LgJHRoxRHyZKs7PA91HtA1ayoL7Vqa4qveVAtteI_4cYgQ0G7ZLBT4mXu53R_N9nPTg-5XKZjyoUlNYCWLtMo7-K5U8vrMc5YKRdBF6QUKPnxIkh4XNL6ofasWZhrvXbELUD2PghMKuRB4mWxdGc73D_KXkJ8GlaaHjPm_52S-LlJ2nSHURAYB-noG0d8qR-pc8KJuMYzIqsij",
    ],
    keywords: { Vibe: ["Vibrant"], Taste: ["Spicy"], Service: ["Fast"] },
  },
  {
    id: "rev-2-2",
    userNo: 2,
    userId: "jane_gourmet",
    restaurant: "Taco Theory",
    reviewText:
      "살사 소스가 진짜 맵고 맛있어요! 타코 속재료가 꽉 차서 든든합니다.",
    rating: 5,
    date: "2026-04-18",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHmDnYklZfS2ovFicfL3qOTQgj0DGWejlakVViEcksvnKsVjtdJ3mPWYvZV6ycd5Ggy-_QJ7Fx69dEAtecAM7bQT1FBDND4SUGMQ8GnXezodjCHiPwxYusXpPQ-3uF9C6BVglpIsSdgNd98DARCu6s1pzD2LFvmFA9XyiRLrAsGvR5dhk7-FCvFMifTQrF03fQpmbfg02bChaqCSDVaNs6WpRxt2ji4LBBhP6W4vl9Fr9gQsAjlU-Nm5XThu_e0OK9wENkvjBibqo3",
    ],
    keywords: { Vibe: ["Lively"], Taste: ["Spicy"], Service: ["Friendly"] },
  },
  {
    id: "rev-2-3",
    userNo: 2,
    userId: "jane_gourmet",
    restaurant: "The Daily Grind",
    reviewText:
      "디저트가 정말 달콤해요. 공부하러 오기엔 조금 시끄러울 수 있어요.",
    rating: 3,
    date: "2026-04-22",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6KO-M3xKogRmdAQc3tuFwF0Ifa-4Nvv0FB2agawLXLE4kt5hZG_SfvdzLPpMMODoZVDnZSzHdCxZV-wCUEzqiNZ2ZCZmYRnZuViu--wwHNbgbO92n9Dwr2nJf64hl3ZsOPgI44wxFUBJkg6UrnZ7r3jU3BPR7aG-RACAXhwQNRysAfF6Oe9IeosgimB0djze3lxIN1E23RY7zR7xvNRs3y4MFCtk2CzucuOpw3Tbl0lv_YMA3hGs3iWzsjQvrz3MqasK1TnqLpRf5",
    ],
    keywords: { Vibe: ["Social"], Taste: ["Sweet"], Service: ["Attentive"] },
  },

  // --- 유저 3: admin (Id: 3) ---
  {
    id: "rev-3-1",
    userNo: 3,
    userId: "admin",
    restaurant: "L'Anima Trattoria",
    reviewText:
      "비즈니스 미팅하기 최적의 장소입니다. 서버들이 매우 전문적입니다.",
    rating: 5,
    date: "2026-04-05",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGrKERkAoI4x2VQxH3TC3zd4gK_6TAjyvhvkYrBW3hrZGjE5SDBNJEuSXLJB74A84iybZnN7lssT39Yn2wVTghJ52TxCrxq1_eK6NqxUTf1MfRWOfAPHXxPL-wWgJRRG1hj3SO1P_xhmDLbFWMriEFXKg7LvDcy8EwMSHlGmOFIFEM3tyB2Z0FHMeG9BJXh__3s55GIon_3HlDIYGsAfswKKLI1RE0l0i6Ch2jo_TOTW1F-5FHCs4cGHqd8Zv9XuVUO-O-7iQpyppA",
    ],
    keywords: {
      Vibe: ["Sophisticated"],
      Taste: ["Savory"],
      Service: ["Valet Park"],
    },
  },
  {
    id: "rev-3-2",
    userNo: 3,
    userId: "admin",
    restaurant: "Zenith Sushi",
    reviewText:
      "조용하고 정중한 서비스가 돋보입니다. 가격만큼의 가치를 하네요.",
    rating: 5,
    date: "2026-04-08",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtLh1NYpD8QI9ZAlSIh6ro1uhnW8KKtq244wpGDLTECRQmqHpdjbmfiMtCHH_CnowDIL1pAuzMqmqFvkmK_9_7hxqDrzNXlAM80ROwjcpzhyGKn4dvOTCOEtbiSuBPVEu_2p843aJViWGH9qh0xC5hUmbrg8zkxwVwdsqb3OPCHcXqup0e-YmylykNTg4iYBTOdGshaS1DQcD2Rm1uNTWiYAsx73taEt3-t5mEfa9v3G6tl34I_4YuieUfyVlCnyJg2OwftROktxg_",
    ],
    keywords: { Vibe: ["Quiet"], Taste: ["Authentic"], Service: ["Attentive"] },
  },
  {
    id: "rev-3-3",
    userNo: 3,
    userId: "admin",
    restaurant: "Wild & Raw",
    reviewText: "전반적으로 깔끔하지만 간이 조금 심심할 수 있습니다.",
    rating: 4,
    date: "2026-04-21",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWfiTamkqsO7J-p2pjn_rBQZjm25m7UARi9O5Mu4sSC0hY00aWr7dIaThsPOoq41-okk6iybbx9CTPhjUlmq43YK8WdswzT4lLAZaFc23J2-qBd9_pHKXXnkpBI7ZHR4ms_-HgpY9hC78UeOvkChUJFz6zAjsLUY5cbyPl8ZVRPxGiVItrs5nP2zy-22TKLoUQjHAqZVae_JDS9LxP0lHqRtF93eAEppC2a1wqVXjwK91sM6-3-vC4b9GeSB573R4KK5m1qEJdAOei",
    ],
    keywords: {
      Vibe: ["Minimalist"],
      Taste: ["Savory"],
      Service: ["Friendly"],
    },
  },
];

export const nlpKeywords = [
  "Portion size: Generous",
  "Authentic flavors",
  "Date night spot",
  "Cacio e Pepe",
  "Table spacing: Wide",
];
