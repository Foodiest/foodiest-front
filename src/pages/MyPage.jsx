import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { getByUser } from "../services/reviewService";
import { getById as getRestaurantById } from "../services/restaurantService";
import { follow, unfollow, checkIsFollowing, getFollowing, getFollowersCount } from "../services/followService";
import { supabase } from "../lib/supabase";

function ReviewCard({ review, navigate, isOwn }) {
  const {
    id,
    title,
    restaurant: restaurantName,
    restaurantId,
    date,
    stars,
    desc,
    img,
  } = review;

  const handleRestaurantClick = (e) => {
    e.stopPropagation();
    if (restaurantId) {
      navigate(`/restaurant/${restaurantId}`);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/write-review?reviewId=${id}&restaurantId=${restaurantId}`);
  };

  return (
    <article className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-50 group flex flex-col h-full cursor-default">
      <div className="h-48 relative overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isOwn && (
          <div className="absolute top-3 right-3">
            <button
              onClick={handleEditClick}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all shadow-sm z-10"
              title="리뷰 수정"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
        )}
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

const COVER_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAGYZkNW-gBSnauyYuVepWJqG_pWJfN5vO-saOqzdBraFviGD2lvP_4Wflhsqp3kGKyelpET3IZD8ZtQBIBK64u5naGNZIgqCr0jWq3Z247OREPOvMgr_elxsMYGaPxdPzA0Bv4OLbwfzSrEYWJQb1a-uiqBIpsE-s8TXZeNCA2RSiR6EqqCK__8PGCyPOieAp_a4WWyfdRnyNZT-e6FNOtwLbIBXXSLZTeLjG4ohKjPvMSD3HnYDQypWgfKYNa4C4_O1NZ0UsdHihq";
const PROFILE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvqvljU0AxRy4dCUoQ55jvVcj4jFtgNwQk5ACOhF4gRO2_FdVflIt2q-9WbqjpEySqL8mpn5PzVidLNXIxHUldKQaGiiR-vKtzi6jLI8sXwBi8hWz4vHjmYtyBo98DT52C9aq2WjwniFSrUFdlLwZ-CRpe7ZTGXbJ78YSHbPgrG_XGnlLRaz93nqWRGizaWBUhs0I3oLh7rMTbTOxvgRdCPW1Xpwhh6FxYA-Scf4-zX6qysKjd3DJRC-Y8zvh2lW0W9SlSXrTNz3Qn";


export default function MyPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { session, profile, isLoading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [viewedProfile, setViewedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [bestRestaurants, setBestRestaurants] = useState([]);

  const isOwnProfile = !userId || userId === profile?.user_id;

  useEffect(() => {
    if (!isLoading && !session) navigate("/login");
  }, [isLoading, session, navigate]);

  // 본인 프로필 페이지에 접근 시 URL에 user_id 포함하도록 리다이렉트
  useEffect(() => {
    if (!isLoading && session && profile && !userId) {
      navigate(`/mypage/${profile.user_id}`, { replace: true });
    }
  }, [isLoading, session, profile, userId, navigate]);

  // 표시할 프로필 결정
  useEffect(() => {
    if (!profile) return;
    if (isOwnProfile) {
      setViewedProfile(profile);
    } else {
      setProfileLoading(true);
      supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single()
        .then(({ data }) => {
          setViewedProfile(data ?? null);
          setProfileLoading(false);
        });
    }
  }, [profile, userId, isOwnProfile]);

  // 표시할 프로필의 리뷰 불러오기
  useEffect(() => {
    if (!viewedProfile) return;
    getByUser(viewedProfile.id).then((data) => {
      setReviews(
        data.map((r) => ({
          id: r.id,
          title:
            r.review_text.length > 20
              ? r.review_text.slice(0, 20) + "..."
              : r.review_text,
          restaurant: r.restaurants?.name ?? "",
          restaurantId: r.restaurant_id,
          date: new Date(r.created_at)
            .toLocaleDateString("en-US", { month: "short", day: "numeric" })
            .toUpperCase(),
          stars: r.rating,
          desc: r.review_text,
          img: r.images?.[0] || "https://via.placeholder.com/400",
        }))
      );
    });
  }, [viewedProfile]);

  // 베스트 레스토랑 불러오기
  useEffect(() => {
    const ids = viewedProfile?.best_restaurants;
    if (!ids || ids.length === 0) {
      setBestRestaurants([]);
      return;
    }
    Promise.all(ids.map((id) => getRestaurantById(id).catch(() => null))).then(
      (results) => setBestRestaurants(results.filter(Boolean))
    );
  }, [viewedProfile]);

  // 팔로워 수 & 팔로우 여부 로딩
  useEffect(() => {
    if (!viewedProfile?.auth_id) return;
    getFollowersCount(viewedProfile.auth_id).then(setFollowersCount);
    if (!isOwnProfile && profile?.auth_id) {
      checkIsFollowing(viewedProfile.auth_id).then(setIsFollowing);
    }
  }, [viewedProfile, isOwnProfile, profile]);

  const handleFollowToggle = async () => {
    if (!viewedProfile?.auth_id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollow(viewedProfile.auth_id);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
      } else {
        await follow(viewedProfile.auth_id);
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleOpenFollowingModal = async () => {
    if (!profile?.auth_id) return;
    setShowFollowingModal(true);
    const list = await getFollowing(profile.auth_id);
    setFollowingList(list);
  };

  const tasteIdentityTags = useMemo(() => {
    if (!viewedProfile) return [];
    return [
      ...(viewedProfile.vibes || []).map((v) => ({
        label: v,
        icon: "auto_awesome",
        color: "bg-white text-secondary border-secondary-container/30",
      })),
      ...(viewedProfile.flavors || []).map((f) => ({
        label: f,
        icon: "restaurant",
        color:
          "bg-primary-fixed/50 text-on-primary-fixed-variant border-primary-fixed",
      })),
      ...(viewedProfile.dietary || []).map((d) => ({
        label: d,
        icon: "eco",
        color: "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary",
      })),
    ];
  }, [viewedProfile]);

  if (isLoading || !profile || profileLoading) return null;
  if (!viewedProfile) return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-slate-400">
        유저를 찾을 수 없습니다.
      </div>
    </Layout>
  );

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-6 md:px-10 pb-24 text-left">
        {/* Profile Hero Section */}
        <section className="mt-6 rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100">
          <div className="h-64 md:h-80 w-full relative">
            <img
              src={viewedProfile.cover_image || COVER_IMG}
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          <div className="px-6 md:px-10 pb-10 -mt-16 pt-5 relative z-10 flex flex-col md:flex-row items-end justify-between text-left">
            <div className="flex flex-col md:flex-row items-end gap-5 text-left">
              <div className="w-36 h-36 rounded-3xl border-4 border-white overflow-hidden shadow-lg bg-white">
                <img
                  src={viewedProfile.profile_image || PROFILE_IMG}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-2">
                <h2 className="font-[Epilogue] text-white md:text-on-surface text-2xl md:text-4xl font-bold">
                  {viewedProfile.nickname || viewedProfile.user_id}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {viewedProfile.bio || "안녕하세요!"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate("/mypage-settings")}
                  className="bg-primary-container text-on-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-orange-200 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit Profile
                </button>
              ) : null}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="px-6 md:px-10 pb-8 grid grid-cols-3 gap-6 border-t border-slate-50 mt-4 pt-6">
            <div>
              <p className="font-[Epilogue] text-2xl font-semibold text-on-surface">
                {reviews.length}
              </p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                Reviews
              </p>
            </div>
            <div className="border-x border-slate-100 px-6">
              <p className="font-[Epilogue] text-2xl font-semibold text-on-surface">
                {followersCount.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                Followers
              </p>
            </div>
            {isOwnProfile ? (
              <button
                onClick={handleOpenFollowingModal}
                className="rounded-xl font-bold transition-all active:scale-95 px-4 py-3 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 text-sm flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">group</span>
                팔로우 목록
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`rounded-xl font-bold transition-all active:scale-95 px-8 py-3 disabled:opacity-60 ${
                  isFollowing
                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                    : "bg-primary text-white shadow-lg shadow-orange-100"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </section>

        {/* Taste Identity Section */}
        <section className="mt-6">
          <div className="bg-secondary-fixed/30 rounded-3xl p-8 border border-secondary-fixed text-left">
            <h3 className="font-[Epilogue] text-xl font-semibold mb-5 flex items-center gap-2 text-on-secondary-container text-left">
              <span className="material-symbols-outlined text-secondary">
                psychology
              </span>
              {isOwnProfile ? "My" : `${viewedProfile.nickname || viewedProfile.user_id}'s`} Taste Identity
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
        {bestRestaurants.length > 0 && (
          <section className="mt-16 text-left">
            <h3 className="font-[Epilogue] text-3xl font-bold text-on-surface mb-7">
              Best Restaurants
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bestRestaurants.map((r, idx) => (
                <div
                  key={r.id}
                  className="relative group rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white cursor-pointer"
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                >
                  <div className="h-48 overflow-hidden bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl">restaurant</span>
                  </div>
                  <div className="absolute top-4 left-4 bg-primary-container text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                    #{idx + 1} Pick
                  </div>
                  <div className="p-5 text-left">
                    <h4 className="font-[Epilogue] text-lg font-semibold text-on-surface">
                      {r.name}
                    </h4>
                    <p className="text-slate-500 text-xs mt-1">
                      {r.cuisine}{r.price ? ` • ${r.price}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Review Journal Section */}
        <section className="mt-16 text-left">
          <div className="flex items-center justify-between mb-7">
            <h3 className="font-[Epilogue] text-3xl font-bold text-on-surface text-left">
              {isOwnProfile
                ? "My Review Journal"
                : `${viewedProfile.nickname || viewedProfile.user_id}'s Reviews`}
            </h3>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              Latest First
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>
          </div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  navigate={navigate}
                  isOwn={isOwnProfile}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <p className="text-slate-400 italic">
                No reviews yet.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* 팔로잉 목록 모달 */}
      {showFollowingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowFollowingModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-[Epilogue] text-lg font-bold text-on-surface">팔로우 목록</h3>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {followingList.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl mb-2 block">group_off</span>
                  <p className="text-sm">아직 팔로우한 유저가 없습니다.</p>
                </div>
              ) : (
                followingList.map((user) => (
                  <button
                    key={user.auth_id}
                    onClick={() => {
                      setShowFollowingModal(false);
                      navigate(`/mypage/${user.user_id}`);
                    }}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-orange-50 transition-colors border-b border-slate-50 last:border-none"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {user.profile_image
                        ? <img src={user.profile_image} alt={user.nickname} className="w-full h-full object-cover" />
                        : <span className="text-primary font-bold text-sm">{(user.nickname || user.user_id).slice(0, 2).toUpperCase()}</span>
                      }
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-sm text-on-surface truncate">{user.nickname || user.user_id}</p>
                      <p className="text-xs text-slate-400 truncate">{user.user_id}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
