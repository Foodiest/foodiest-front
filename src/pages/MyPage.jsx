import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useState } from "react";
import { PROFILE_IMG, COVER_IMG, bestRestaurants, userReviews, tasteIdentity } from "../data/mockProfile";


// ReviewCard 컴포넌트 분리
function ReviewCard({ review, bestRestaurants, navigate }) {
  const { title, restaurant, date, stars, desc, img } = review;

  const handleRestaurantClick = (e) => {
    e.stopPropagation();
    const restaurantIndex = bestRestaurants.findIndex(
      (r) => r.name === restaurant,
    );
    navigate(`/restaurant/${restaurantIndex !== -1 ? restaurantIndex + 1 : 1}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate("/write-review");
  };

  const handleCardClick = () => {
    navigate("/write-review");
  };

  return (
    <article
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-50 group flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-48 relative overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <button
            onClick={handleEditClick}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-0.5 text-orange-500 mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined text-sm"
              style={{
                fontVariationSettings: i < stars ? "'FILL' 1" : "'FILL' 0",
                color: i < stars ? undefined : "#e2e2e4",
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
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-sm">
              restaurant
            </span>
          </div>
          <span
            onClick={handleRestaurantClick}
            className="text-sm font-semibold text-on-surface cursor-pointer hover:text-orange-500 transition-colors"
          >
            {restaurant}
          </span>
          <time className="ml-auto text-xs text-slate-400">{date}</time>
        </div>
      </div>
    </article>
  );
}



export default function MyPage() {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userNickname = currentUser.nickname || "Elena Gastronomy";

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        {/* Hero Section */}
        <section className="mt-6 rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100">
          <div className="h-64 md:h-80 w-full relative">
            <img
              src={COVER_IMG}
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          <div className="px-6 md:px-10 pb-6 md:pb-10 -mt-16 pt-5 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl border-4 border-white overflow-hidden shadow-lg bg-white">
                <img
                  src={PROFILE_IMG}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-2">
                <h2 className="font-[Epilogue] text-white md:text-on-surface text-2xl md:text-4xl font-bold">
                  {userNickname}
                </h2>
                <p className="text-slate-500 mt-1 max-w-lg text-sm">
                  Culinary explorer & NLP data scientist. Finding the soul of
                  the city through its hidden kitchens and Michelin stars.
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 flex gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate("/mypage-settings")}
                className="flex-1 md:flex-none bg-primary-container text-on-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
              <button className="bg-white border border-slate-200 text-on-surface px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-sm">share</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 md:px-10 pb-8 grid grid-cols-3 gap-6 border-t border-slate-50 mt-4 pt-6">
            {[
              { value: "128", label: "Reviews" },
              { value: "12.4k", label: "Followers" },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className={`text-center md:text-left ${i === 1 ? "border-x border-slate-100" : ""}`}
              >
                <p className="font-[Epilogue] text-2xl font-semibold text-on-surface">
                  {value}
                </p>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                  {label}
                </p>
              </div>
            ))}
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-8 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                isFollowing
                  ? "bg-slate-100 text-slate-600 border border-slate-200 shadow-none" // 팔로우 중 상태
                  : "bg-primary text-white shadow-lg shadow-orange-100 hover:brightness-110" // 팔로우 전 상태
              }`}
            >
              {isFollowing ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    check
                  </span>
                  Following
                </div>
              ) : (
                "Follow"
              )}
            </button>
          </div>
        </section>

        {/* Taste Identity */}
        <section className="mt-6">
          <div className="bg-secondary-fixed/30 rounded-3xl p-6 md:p-8 border border-secondary-fixed">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-secondary">
                psychology
              </span>
              <h3 className="font-[Epilogue] text-xl font-semibold text-on-secondary-container">
                My Taste Identity
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {tasteIdentity.map(({ label, icon, color }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold shadow-sm ${color}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {icon}
                  </span>
                  {label}
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

        {/* Best Restaurants */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-7">
            <h3 className="font-[Epilogue] text-3xl font-bold text-on-surface">
              Best Restaurants
            </h3>
          </div>
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
                <div className="p-5">
                  <h4 className="font-[Epilogue] text-lg font-semibold text-on-surface">
                    {name}
                  </h4>
                  <p className="text-slate-500 text-xs mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Review Journal */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-7">
            <h3 className="font-[Epilogue] text-3xl font-bold text-on-surface">
              Review Journal
            </h3>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              Latest First
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userReviews.map((review) => (
              <ReviewCard
                key={review.title}
                review={review}
                bestRestaurants={bestRestaurants}
                navigate={navigate}
              />
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
