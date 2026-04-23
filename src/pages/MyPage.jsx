import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import Layout from "../components/Layout";

// 데이터 임포트
import mockUsers from "../data/mockUsers";
import { mockReviews } from "../data/mockReviews";
import { restaurants as mockRestaurantsData } from "../data/mockRestaurants";

/**
 * 리뷰 카드 컴포넌트
 */
function ReviewCard({ review, navigate }) {
  const {
    id,
    title,
    restaurant: restaurantName,
    date,
    stars,
    desc,
    img,
  } = review;

  // 1. 식당 이름을 기반으로 mockRestaurants에서 실제 식당 ID 찾기
  const restaurantId = useMemo(() => {
    const found = mockRestaurantsData.find((r) => r.name === restaurantName);
    return found ? found.id : null;
  }, [restaurantName]);

  // 2. 식당 상세 페이지로 이동 핸들러
  const handleRestaurantClick = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트로 전파 방지
    if (restaurantId) {
      navigate(`/restaurant/${restaurantId}`);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  // 3. 리뷰 수정 페이지로 이동 핸들러 (연필 아이콘 전용)
  const handleEditClick = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트로 전파 방지
    navigate(`/write-review?reviewId=${id}`);
  };

  return (
    <article className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-50 group flex flex-col h-full cursor-default">
      <div className="h-48 relative overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* 연필(편집) 버튼: 수정 페이지로 이동 */}
        <div className="absolute top-3 right-3">
          <button
            onClick={handleEditClick}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all shadow-sm z-10"
            title="리뷰 수정"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 text-left">
        <div className="flex items-center gap-0.5 text-orange-500 mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined text-sm"
              style={{
                fontVariationSettings: i < stars ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              star
            </span>
          ))}
        </div>
        <h4 className="font-[Epilogue] text-lg font-semibold text-on-surface mb-2 line-clamp-1">
          {title}
        </h4>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4">{desc}</p>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-3">
          {/* 식당 이름 클릭 시 상세 페이지로 이동 */}
          <span
            onClick={handleRestaurantClick}
            className="text-sm font-semibold text-on-surface hover:text-primary cursor-pointer transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">
              restaurant
            </span>
            {restaurantName}
          </span>
          <time className="ml-auto text-xs text-slate-400">{date}</time>
        </div>
      </div>
    </article>
  );
}

// 상단 이미지 및 고정 데이터
const COVER_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAGYZkNW-gBSnauyYuVepWJqG_pWJfN5vO-saOqzdBraFviGD2lvP_4Wflhsqp3kGKyelpET3IZD8ZtQBIBK64u5naGNZIgqCr0jWq3Z247OREPOvMgr_elxsMYGaPxdPzA0Bv4OLbwfzSrEYWJQb1a-uiqBIpsE-s8TXZeNCA2RSiR6EqqCK__8PGCyPOieAp_a4WWyfdRnyNZT-e6FNOtwLbIBXXSLZTeLjG4ohKjPvMSD3HnYDQypWgfKYNa4C4_O1NZ0UsdHihq";
const PROFILE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvqvljU0AxRy4dCUoQ55jvVcj4jFtgNwQk5ACOhF4gRO2_FdVflIt2q-9WbqjpEySqL8mpn5PzVidLNXIxHUldKQaGiiR-vKtzi6jLI8sXwBi8hWz4vHjmYtyBo98DT52C9aq2WjwniFSrUFdlLwZ-CRpe7ZTGXbJ78YSHbPgrG_XGnlLRaz93nqWRGizaWBUhs0I3oLh7rMTbTOxvgRdCPW1Xpwhh6FxYA-Scf4-zX6qysKjd3DJRC-Y8zvh2lW0W9SlSXrTNz3Qn";

const bestRestaurants = [
  {
    name: "L'Essence",
    sub: "Modern French • 3 Michelin Stars",
    badge: "Best of 2023",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGrKERkAoI4x2VQxH3TC3zd4gK_6TAjyvhvkYrBW3hrZGjE5SDBNJEuSXLJB74A84iybZnN7lssT39Yn2wVTghJ52TxCrxq1_eK6NqxUTf1MfRWOfAPHXxPL-wWgJRRG1hj3SO1P_xhmDLbFWMriEFXKg7LvDcy8EwMSHlGmOFIFEM3tyB2Z0FHMeG9BJXh__3s55GIon_3HlDIYGsAfswKKLI1RE0l0i6Ch2jo_TOTW1F-5FHCs4cGHqd8Zv9XuVUO-O-7iQpyppA",
  },
  {
    name: "Wild & Raw",
    sub: "Organic Kitchen • Greenhouse Vibes",
    badge: "Local Gem",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvdqc2VoexOAJdxt7---KdH4tn8CXYxIMdrxtjqNEW-YgwJk9IW1NVVHlT__lK4wFLJBcIC-9liRa3xwQi8vraA_7Pu6wom5dspTMvUY3wahKPbeXI6qAfn2B7XS-WPxZps6waSUqtmiWJiLksTu0JeCJE9eKa0cSFg2kFH4aXOf3gDSvlFqK-_dchpPRbPAz0mRnIpmAg-4MX445vS74uvHSsCRZhFfxrATblMGTguGHKzSWFetFgGmeb99qs_l5DO8vjBnkaJkIv",
  },
  {
    name: "Neon Sips",
    sub: "Mixology Lab • Sensory Experience",
    badge: "Best Cocktails",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-asKVKC_AIuRh5Mv7Awg8xE8-YYJP7_b5Qkri9mLbihVlfZrUulIgjwvVqUgYw-LgJHRoxRHyZKs7PA91HtA1ayoL7Vqa4qveVAtteI_4cYgQ0G7ZLBT4mXu53R_N9nPTg-5XKZjyoUlNYCWLtMo7-K5U8vrMc5YKRdBF6QUKPnxIkh4XNL6ofasWZhrvXbELUD2PghMKuRB4mWxdGc73D_KXkJ8GlaaHjPm_52S-LlJ2nSHURAYB-noG0d8qR-pc8KJuMYzIqsij",
  },
];

export default function MyPage() {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  // 1. 로컬스토리지에서 로그인된 유저 정보 가져오기
  const storedUser = useMemo(() => {
    const data = localStorage.getItem("currentUser");
    return data ? JSON.parse(data) : null;
  }, []);

  const currentIdNo = Number(localStorage.getItem("currentUserIdNo"));
  const currentUserId =
    routeUserId || localStorage.getItem("currentUserId") || storedUser?.userId;

  // 2. 로그인 체크 및 강제 이동
  useEffect(() => {
    if (!currentUserId && !currentIdNo) {
      navigate("/login");
    }
  }, [currentUserId, currentIdNo, navigate]);

  // 3. 유저 상세 정보 매칭 (숫자 ID 혹은 문자열 ID 기준)
  const userDetail = useMemo(() => {
    return (
      mockUsers.find(
        (user) =>
          (currentIdNo && user.id === currentIdNo) ||
          (currentUserId && user.userId === currentUserId),
      ) || storedUser
    );
  }, [currentIdNo, currentUserId, storedUser]);

  // 4. 본인 리뷰 필터링
  const myReviews = useMemo(() => {
    if (!userDetail) return [];
    return mockReviews
      .filter(
        (review) =>
          review.userNo === userDetail.id ||
          review.userId === userDetail.userId,
      )
      .map((review) => ({
        id: review.id,
        title:
          review.reviewText.length > 20
            ? review.reviewText.slice(0, 20) + "..."
            : review.reviewText,
        restaurant: review.restaurant,
        date: new Date(review.date)
          .toLocaleDateString("en-US", { month: "short", day: "numeric" })
          .toUpperCase(),
        stars: review.rating,
        desc: review.reviewText,
        img: review.images?.[0] || "https://via.placeholder.com/400",
      }));
  }, [userDetail]);

  // 5. 취향 정체성 태그 데이터 구성
  const tasteIdentityTags = useMemo(() => {
    if (!userDetail) return [];
    return [
      ...(userDetail.vibes || []).map((v) => ({
        label: v,
        icon: "auto_awesome",
        color: "bg-white text-secondary border-secondary-container/30",
      })),
      ...(userDetail.flavors || []).map((f) => ({
        label: f,
        icon: "restaurant",
        color:
          "bg-primary-fixed/50 text-on-primary-fixed-variant border-primary-fixed",
      })),
      ...(userDetail.dietary || []).map((d) => ({
        label: d,
        icon: "eco",
        color: "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary",
      })),
    ];
  }, [userDetail]);

  if (!userDetail) return null;

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-6 md:px-10 pb-24 text-left">
        {/* Profile Hero Section */}
        <section className="mt-6 rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100">
          <div className="h-64 md:h-80 w-full relative">
            <img
              src={COVER_IMG}
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          <div className="px-6 md:px-10 pb-10 -mt-16 pt-5 relative z-10 flex flex-col md:flex-row items-end justify-between text-left">
            <div className="flex flex-col md:flex-row items-end gap-5 text-left">
              <div className="w-36 h-36 rounded-3xl border-4 border-white overflow-hidden shadow-lg bg-white">
                <img
                  src={PROFILE_IMG}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-2">
                <h2 className="font-[Epilogue] text-white md:text-on-surface text-2xl md:text-4xl font-bold">
                  {userDetail.nickname || userDetail.userId}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {userDetail.userId}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/mypage-settings")}
                className="bg-primary-container text-on-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-orange-200 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="px-6 md:px-10 pb-8 grid grid-cols-3 gap-6 border-t border-slate-50 mt-4 pt-6">
            <div>
              <p className="font-[Epilogue] text-2xl font-semibold text-on-surface">
                {myReviews.length}
              </p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                Reviews
              </p>
            </div>
            <div className="border-x border-slate-100 px-6">
              <p className="font-[Epilogue] text-2xl font-semibold text-on-surface">
                12.4k
              </p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                Followers
              </p>
            </div>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`rounded-xl font-bold transition-all active:scale-95 px-8 py-3 ${
                isFollowing
                  ? "bg-slate-100 text-slate-600 border border-slate-200"
                  : "bg-primary text-white shadow-lg shadow-orange-100"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </section>

        {/* Taste Identity Section */}
        <section className="mt-6">
          <div className="bg-secondary-fixed/30 rounded-3xl p-8 border border-secondary-fixed text-left">
            <h3 className="font-[Epilogue] text-xl font-semibold mb-5 flex items-center gap-2 text-on-secondary-container text-left">
              <span className="material-symbols-outlined text-secondary">
                psychology
              </span>
              My Taste Identity
            </h3>
            <div className="flex flex-wrap gap-3">
              {tasteIdentityTags.map((tag, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold shadow-sm ${tag.color}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {tag.icon}
                  </span>
                  {tag.label}
                </div>
              ))}
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-500 shadow-sm">
                <span className="material-symbols-outlined text-sm">
                  search
                </span>
                Discovering...
              </div>
            </div>
          </div>
        </section>

        {/* Best Restaurants Section */}
        <section className="mt-16 text-left">
          <h3 className="font-[Epilogue] text-3xl font-bold text-on-surface mb-7">
            Best Restaurants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bestRestaurants.map(({ name, sub, badge, img }) => (
              <div
                key={name}
                className="relative group rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white cursor-pointer"
                onClick={() => navigate("/restaurant/1")}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 left-4 bg-primary-container text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                  {badge}
                </div>
                <div className="p-5 text-left">
                  <h4 className="font-[Epilogue] text-lg font-semibold text-on-surface">
                    {name}
                  </h4>
                  <p className="text-slate-500 text-xs mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Review Journal Section */}
        <section className="mt-16 text-left">
          <div className="flex items-center justify-between mb-7">
            <h3 className="font-[Epilogue] text-3xl font-bold text-on-surface text-left">
              My Review Journal
            </h3>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              Latest First
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>
          </div>
          {myReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  navigate={navigate}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-slate-400 italic">
                No reviews found for {userDetail.userId}.
              </p>
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
