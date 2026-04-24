import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { create, update, getByRestaurant } from "../services/reviewService";
import { uploadReviewImage } from "../services/storageService";
import { useAuth } from "../contexts/AuthContext";

const keywordGroups = [
  {
    category: "Vibe",

    icon: "auto_awesome",

    items: ["Quiet", "Sophisticated", "Vibrant", "Minimalist"],

    defaults: ["Sophisticated"],
  },

  {
    category: "Taste",

    icon: "restaurant",

    items: ["Spicy", "Savory", "Umami-rich", "Authentic"],

    defaults: ["Umami-rich"],
  },

  {
    category: "Service",

    icon: "room_service",

    items: ["Friendly", "Fast", "Attentive", "Valet Park"],

    defaults: ["Friendly"],
  },
];

export default function WriteReviewPage() {
  const navigate = useNavigate();
  const { session } = useAuth();

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
  });

  const [images, setImages] = useState([]);

  // Load review data if in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      const reviews = await getByRestaurant(restaurantId);
      const review = reviews.find((r) => r.id === reviewId);
      if (review) {
        setRating(review.rating);
        setReviewText(review.review_text);
        setSelectedKeywords(review.keywords ?? { Vibe: [], Taste: [], Service: [] });
        setImages(review.images.map((src, idx) => ({ id: `edit-${idx}`, src })));
      }
    })();
  }, [isEditMode, reviewId, restaurantId]);

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
    };

    if (isEditMode) {
      await update(reviewId, payload);
    } else {
      await create({ restaurantId, ...payload });
    }

    navigate("/mypage");
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
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkmlXH30uvSRzLTC12UKIlCtQ0qOFCAgZK-LEp2CLLsoyn96hP-XrpX9hxNe1QlcQZTfkzJb7jWvd87UUWPmJPUS-LHz1XEq3qfigbFmwJbOEkO0PVfS5BZvvj3UKOr06RXRQfJrmRvh_99ySQhJ5dCu4o7cIHL0-chfvUE-56dJ_Hp4YsJn4gq8q2RZAhqjPV9oAPt-LSKcrqNd-11Kj0GaCzXJhPQgWIw-aqLvFMPd67tLVq8EQ1FFuFXRZb4GD3Xfq1rGcIlH7V"
                    alt="restaurant"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Current Reviewing
                  </span>

                  <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">
                    L'Anima Trattoria
                  </h2>

                  <p className="text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      location_on
                    </span>{" "}
                    Gangnam, Seoul
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
              <div className="mb-5 text-center py-3 border-b border-surface-container">
                <p className="font-semibold text-sm mb-2 text-on-surface">
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
          </div>

          {/* Right */}

          <div className="md:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-lg border border-primary-container/20 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary-container">
                  smart_toy
                </span>

                <h3 className="font-[Epilogue] text-lg font-semibold text-on-surface">
                  Intelligence Keywords
                </h3>
              </div>

              <div className="space-y-5">
                {keywordGroups.map(({ category, icon, items }) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        {icon}
                      </span>{" "}
                      {category}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => {
                        const active =
                          selectedKeywords[category]?.includes(item);

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleKw(category, item)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                              active
                                ? "bg-primary-container text-white"
                                : "bg-surface-container text-on-surface hover:bg-primary-container hover:text-white"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
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
              </div>
            </div>

            {/* Incentive */}

            <div className="bg-secondary-container/10 p-4 rounded-xl border border-secondary-container/20 flex gap-3">
              <span className="material-symbols-outlined text-secondary-container">
                card_giftcard
              </span>

              <div>
                <h4 className="font-semibold text-sm text-on-secondary-container">
                  Premium Insight
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
