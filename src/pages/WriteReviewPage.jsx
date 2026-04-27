import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { create, update, remove, getByRestaurant } from "../services/reviewService";
import { uploadReviewImage } from "../services/storageService";
import { getById as getRestaurantById } from "../services/restaurantService";
import { useAuth } from "../contexts/AuthContext";

const keywordGroups = [
  {
    category: "Vibe",
    displayCategory: "분위기",
    icon: "auto_awesome",
    positive: [
      { value: "Quiet", label: "조용한" },
      { value: "Sophisticated", label: "세련된" },
      { value: "Vibrant", label: "활기찬" },
      { value: "Minimalist", label: "미니멀" },
      { value: "Romantic", label: "로맨틱" },
      { value: "Cozy", label: "아늑한" },
    ],
    negative: [
      { value: "Noisy", label: "시끄러운" },
      { value: "Crowded", label: "복잡한" },
      { value: "Dark", label: "어두운" },
    ],
  },
  {
    category: "Taste",
    displayCategory: "맛",
    icon: "restaurant",
    positive: [
      { value: "Spicy", label: "매콤한" },
      { value: "Savory", label: "고소한" },
      { value: "Umami-rich", label: "감칠맛" },
      { value: "Authentic", label: "정통" },
      { value: "Sweet", label: "달콤한" },
      { value: "Fresh", label: "신선한" },
    ],
    negative: [
      { value: "Bland", label: "싱거운" },
      { value: "Oily", label: "기름진" },
      { value: "Overpriced", label: "가성비 낮음" },
    ],
  },
  {
    category: "Service",
    displayCategory: "서비스",
    icon: "room_service",
    positive: [
      { value: "Friendly", label: "친절한" },
      { value: "Fast", label: "빠른" },
      { value: "Attentive", label: "세심한" },
      { value: "Valet Park", label: "발렛파킹" },
    ],
    negative: [
      { value: "Slow", label: "느린" },
      { value: "Rude", label: "불친절한" },
      { value: "Long Wait", label: "대기 긺" },
    ],
  },
];

const allPresetValues = new Set(
  keywordGroups.flatMap(g => [...g.positive, ...g.negative].map(i => i.value))
);

export default function WriteReviewPage() {
  const navigate = useNavigate();
  const { session, profile } = useAuth();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [searchParams] = useSearchParams();

  const reviewId = searchParams.get("reviewId");
  const restaurantId = Number(searchParams.get("restaurantId")) || 1;

  const isEditMode = !!reviewId;

  const fileInputRef = useRef(null);

  const [rating, setRating] = useState(4);

  const [reviewText, setReviewText] = useState("");

  const [selectedKeywords, setSelectedKeywords] = useState({
    Vibe: ["Sophisticated"],
    Taste: ["Umami-rich"],
    Service: ["Friendly"],
    _negative: [],
  });

  const [restaurant, setRestaurant] = useState(null);
  const [images, setImages] = useState([]);
  const [negativeReviews, setNegativeReviews] = useState([]);
  const [negativeInput, setNegativeInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [customKeywords, setCustomKeywords] = useState({ Vibe: [], Taste: [], Service: [] });
  const [customInputs, setCustomInputs] = useState({ Vibe: '', Taste: '', Service: '' });

  useEffect(() => {
    getRestaurantById(restaurantId).then(setRestaurant).catch(() => {});
  }, [restaurantId]);

  // Load review data if in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      const reviews = await getByRestaurant(restaurantId);
      const review = reviews.find((r) => r.id === reviewId);
      if (review) {
        setRating(review.rating);
        setReviewText(review.review_text);
        const kws = review.keywords ?? { Vibe: [], Taste: [], Service: [] };
        setSelectedKeywords(kws);
        const detected = { Vibe: [], Taste: [], Service: [] };
        Object.keys(detected).forEach(cat => {
          (kws[cat] || []).forEach(kw => {
            if (!allPresetValues.has(kw)) detected[cat].push(kw);
          });
        });
        setCustomKeywords(detected);
        setImages(review.images.map((src, idx) => ({ id: `edit-${idx}`, src })));
        setNegativeReviews(review.negative_keywords ?? []);
      }
    })();
  }, [isEditMode, reviewId, restaurantId]);

  const addNegativeReview = () => {
    const trimmed = negativeInput.trim();
    if (!trimmed) return;
    setNegativeReviews((prev) => [...prev, trimmed]);
    setNegativeInput("");
  };

  const removeNegativeReview = (idx) => {
    setNegativeReviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleKw = (category, item) => {
    setSelectedKeywords((prev) => {
      const list = prev[category];
      return {
        ...prev,
        [category]: list.includes(item)
          ? list.filter((i) => i !== item)
          : [...list, item],
      };
    });
  };

  const addCustomKeyword = (category) => {
    const val = customInputs[category].trim();
    if (!val) return;
    if (selectedKeywords[category]?.includes(val)) return;
    setCustomKeywords(prev => ({ ...prev, [category]: [...prev[category], val] }));
    setSelectedKeywords(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), val],
      _negative: [...(prev._negative || []), val],
    }));
    setCustomInputs(prev => ({ ...prev, [category]: '' }));
  };

  const removeCustomKeyword = (category, kw) => {
    setCustomKeywords(prev => ({ ...prev, [category]: prev[category].filter(k => k !== kw) }));
    setSelectedKeywords(prev => ({
      ...prev,
      [category]: prev[category].filter(k => k !== kw),
      _negative: (prev._negative || []).filter(k => k !== kw),
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowedCount = Math.max(0, 10 - images.length);
    const selectedFiles = files.slice(0, allowedCount);

    const newImages = selectedFiles.map((file, idx) => ({
      id: `new-${idx}-${Date.now()}`,
      src: URL.createObjectURL(file), // 미리보기용 임시 URL
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remove(reviewId);
      navigate(profile?.user_id ? `/mypage/${profile.user_id}` : "/mypage");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!session) {
      navigate('/login');
      return;
    }

    // file이 있는 신규 이미지는 Storage에 업로드, 기존 URL은 그대로 사용
    const uploadedImages = await Promise.all(
      images.map(async (img) => {
        if (img.file) return await uploadReviewImage(img.file);
        return img.src;
      })
    );

    const payload = {
      reviewText,
      rating,
      images: uploadedImages,
      keywords: selectedKeywords,
      negative_reviews: negativeReviews,
    };

    if (isEditMode) {
      await update(reviewId, payload);
    } else {
      await create({ restaurantId, ...payload });
    }

    navigate(profile?.user_id ? `/mypage/${profile.user_id}` : "/mypage");
  };

  return (
    <Layout>
      <main className="flex-grow pt-6 pb-20 px-6 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-[Epilogue] text-3xl font-semibold text-on-surface mb-1">
            {isEditMode ? "리뷰 수정하기" : "리뷰 작성하기"}
          </h1>

          <p className="text-base text-on-surface-variant">
            {isEditMode
              ? "귀하의 리뷰를 수정해주세요."
              : "귀하의 미식 경험을 데이터로 기록하고 공유해주세요."}
          </p>
        </div>

        {/* Restaurant Context - Only show in create mode or adjust */}

        {!isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left */}

            <div className="md:col-span-8 space-y-5">
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant flex items-center gap-5">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  {restaurant?.image && (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    현재 리뷰 작성 중
                  </span>

                  <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">
                    {restaurant?.name ?? '...'}
                  </h2>

                  <p className="text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      location_on
                    </span>{" "}
                    {restaurant?.address ?? ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left */}

          <div className="md:col-span-8 space-y-5">
            {/* Rating & Text */}

            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant">
              <div className="mb-5 py-3 border-b border-surface-container">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-amber-700 mb-2.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">info</span>
                    별점 가이드
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { star: 1, label: "다시 가고 싶지 않은 가게" },
                      { star: 2, label: "가격에 맞는 서비스를 받지 못한 가게" },
                      { star: 3, label: "종종 찾아갈 만한 가게" },
                      { star: 4, label: "자주 찾거나 만족도가 매우 높은 가게" },
                      { star: 5, label: "이 가게를 경험하기 위해 충분한 돈이나 시간을 쓸 가치가 있는 가게" },
                    ].map(({ star, label }) => (
                      <div key={star} className={`flex items-start gap-2 text-xs ${star === rating ? "font-semibold text-amber-800" : "text-amber-600/80"}`}>
                        <span className="flex-shrink-0 w-5 text-right">{star}★</span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="font-semibold text-sm mb-2 text-on-surface text-center">
                  식사는 어떠셨나요?
                </p>

                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      className={`material-symbols-outlined text-[40px] transition-colors ${i <= rating ? "text-primary-container" : "text-outline-variant"}`}
                      style={{
                        fontVariationSettings:
                          i <= rating ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      star
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-sm block text-on-surface">
                  상세 리뷰 작성
                </label>

                <textarea
                  className="w-full bg-surface p-4 rounded-lg border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none resize-none text-base placeholder:text-outline"
                  placeholder="음식의 맛, 분위기, 서비스 등 특별했던 점을 자유롭게 적어주세요. (최소 20자)"
                  rows={6}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />

                <div className="flex justify-end">
                  <span className="text-xs text-outline">
                    {reviewText.length} / 2,000
                  </span>
                </div>
              </div>
            </div>

            {/* Image Upload */}

            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant">
              <h3 className="font-semibold text-sm mb-3 text-on-surface">
                사진 업로드 (최대 10장)
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="aspect-square rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center hover:bg-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-primary-container text-3xl">
                    add_a_photo
                  </span>

                  <span className="text-xs mt-1 text-on-surface-variant">
                    추가
                  </span>
                </button>

                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-outline-variant"
                  >
                    <img
                      src={image.src}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-1 right-1 bg-on-surface/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-outline mt-3">
                사진은 1장당 최대 10MB까지 업로드 가능합니다. 현재{" "}
                {images.length}장 업로드됨.
              </p>
            </div>

            {/* Negative Review */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-red-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-red-400 text-base">thumb_down</span>
                <h3 className="font-semibold text-sm text-on-surface">부정적인 키워드</h3>
                <span className="ml-auto text-xs text-slate-400">{negativeReviews.length}개</span>
              </div>

              {negativeReviews.length > 0 && (
                <div className="space-y-2 mb-3">
                  {negativeReviews.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">
                        <span className="material-symbols-outlined text-sm">remove_circle</span>
                      </span>
                      <span className="text-sm text-red-800 flex-1 leading-relaxed">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeNegativeReview(idx)}
                        className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={negativeInput}
                  onChange={(e) => setNegativeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNegativeReview(); } }}
                  placeholder="불편했던 점을 한 단어로 표현해주세요"
                  className="flex-1 bg-surface px-3 py-2.5 rounded-lg border border-outline-variant focus:border-red-300 focus:ring-1 focus:ring-red-200 outline-none text-sm placeholder:text-outline"
                />
                <button
                  type="button"
                  onClick={addNegativeReview}
                  disabled={!negativeInput.trim()}
                  className="w-10 h-10 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              <p className="text-[11px] text-outline mt-2">Enter 키 또는 + 버튼으로 추가할 수 있습니다.</p>
            </div>
          </div>

          {/* Right */}

          <div className="md:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-lg border border-primary-container/20 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary-container">
                  smart_toy
                </span>

                <h3 className="font-[Epilogue] text-lg font-semibold text-on-surface">
                  AI 키워드
                </h3>
              </div>

              <div className="space-y-5">
                {keywordGroups.map(({ category, displayCategory, icon, positive, negative }) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">{icon}</span>
                      {displayCategory}
                    </h4>

                    {/* 긍정 키워드 */}
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">긍정적</p>
                    <div className="flex flex-wrap gap-1.5">
                      {positive.map(({ value, label }) => {
                        const active = selectedKeywords[category]?.includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => toggleKw(category, value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                              active
                                ? "bg-secondary text-white"
                                : "bg-surface-container text-on-surface hover:bg-secondary hover:text-white"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* 부정 키워드 */}
                    <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">부정적</p>
                    <div className="flex flex-wrap gap-1.5">
                      {negative.map(({ value, label }) => {
                        const active = selectedKeywords[category]?.includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => toggleKw(category, value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                              active
                                ? "bg-red-400 text-white"
                                : "bg-surface-container text-on-surface hover:bg-red-400 hover:text-white"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* 커스텀 키워드 */}
                    {customKeywords[category]?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {customKeywords[category].map(kw => {
                          const isNeg = (selectedKeywords._negative || []).includes(kw);
                          return (
                            <span
                              key={kw}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                                isNeg
                                  ? 'bg-red-50 text-red-500 border border-red-200'
                                  : 'bg-secondary/10 text-secondary border border-secondary/20'
                              }`}
                            >
                              {kw}
                              <button
                                type="button"
                                onClick={() => removeCustomKeyword(category, kw)}
                                className="ml-0.5 hover:opacity-70 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-[12px]">close</span>
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* 직접 입력 (부정 키워드만) */}
                    <div className="flex gap-1 pt-0.5">
                      <span className="shrink-0 px-2 py-1.5 rounded-lg text-xs font-semibold border bg-red-50 text-red-500 border-red-200 flex items-center">
                        부정
                      </span>
                      <input
                        type="text"
                        value={customInputs[category]}
                        onChange={e => setCustomInputs(prev => ({ ...prev, [category]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addCustomKeyword(category)}
                        placeholder="직접 입력 후 Enter"
                        className="flex-1 text-xs px-2.5 py-1.5 border border-outline-variant rounded-lg bg-surface focus:border-red-300 focus:ring-1 focus:ring-red-300 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addCustomKeyword(category)}
                        className="px-2.5 py-1.5 bg-surface-container rounded-lg text-on-surface-variant hover:bg-red-400 hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-surface-container">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-primary-container text-white py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">send</span>

                  {isEditMode ? "리뷰 수정하기" : "리뷰 제출하기"}
                </button>

                <p className="text-center text-[11px] text-outline mt-3">
                  제출된 리뷰는 AI 분석을 거쳐
                  <br />
                  컨시어지 추천 엔진에 반영됩니다.
                </p>

                {isEditMode && (
                  <div className="mt-4 pt-4 border-t border-surface-container">
                    {showDeleteConfirm ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm font-semibold text-red-600 mb-3 text-center">
                          정말 삭제하시겠어요?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                          >
                            {deleting ? "삭제 중..." : "삭제"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-2.5 rounded-xl border border-red-200 text-red-400 text-sm font-semibold hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        리뷰 삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Incentive */}

            <div className="bg-secondary-container/10 p-4 rounded-xl border border-secondary-container/20 flex gap-3">
              <span className="material-symbols-outlined text-secondary-container">
                card_giftcard
              </span>

              <div>
                <h4 className="font-semibold text-sm text-on-secondary-container">
                  프리미엄 인사이트
                </h4>

                <p className="text-xs text-on-secondary-container/80 mt-1">
                  리뷰 10개 달성 시 '미식 전문가' 배지를 획득할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
