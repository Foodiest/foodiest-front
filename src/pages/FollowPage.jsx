import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getFollowingFeed } from '../services/followService';
import { cleanProfanity } from '../utils/profanityFilter';
import defaultRestaurantImg from '../assets/default-restaurant.svg';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function isNew(dateStr) {
  return (Date.now() - new Date(dateStr)) / 1000 < 86400 * 3;
}

function FeedCard({ review, onUserClick, onRestaurantClick }) {
  const user = review.users;
  const restaurant = review.restaurants;
  const text = cleanProfanity(review.review_text ?? '');
  const images = review.images ?? [];
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button
          onClick={() => user?.user_id && onUserClick(user.user_id)}
          className="w-9 h-9 rounded-full overflow-hidden bg-orange-100 flex-shrink-0 flex items-center justify-center"
        >
          {user?.profile_image
            ? <img src={user.profile_image} alt={user.nickname} className="w-full h-full object-cover" />
            : <span className="text-orange-600 font-bold text-xs">{(user?.nickname || '?').slice(0, 2).toUpperCase()}</span>
          }
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => user?.user_id && onUserClick(user.user_id)}
            className="font-semibold text-sm text-on-surface hover:text-orange-500 transition-colors block truncate"
          >
            {user?.nickname || user?.user_id || '알 수 없음'}
          </button>
          <p className="text-xs text-slate-400">{timeAgo(review.created_at)}</p>
        </div>
        {isNew(review.created_at) && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
            NEW
          </span>
        )}
      </div>

      {images.length > 0 && (
        <div className="relative h-52 overflow-hidden bg-slate-100">
          <img
            src={images[imgIdx]}
            alt="리뷰 이미지"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="px-5 py-4">
        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined text-sm text-orange-400"
              style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
            >
              star
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-700 line-clamp-3 mb-3 leading-relaxed">{text}</p>
        {restaurant && (
          <button
            onClick={() => onRestaurantClick(restaurant.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-500 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">restaurant</span>
            {restaurant.name}
          </button>
        )}
      </div>
    </article>
  );
}

export default function FollowPage() {
  const navigate = useNavigate();
  const { session, profile, isLoading } = useAuth();
  const [following, setFollowing] = useState([]);
  const [feedReviews, setFeedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    if (!isLoading && !session) navigate('/login');
  }, [isLoading, session, navigate]);

  useEffect(() => {
    if (!profile?.auth_id) return;
    setLoading(true);
    getFollowingFeed(profile.auth_id)
      .then(({ users, reviews }) => {
        setFollowing(users);
        setFeedReviews(reviews);
      })
      .finally(() => setLoading(false));
  }, [profile]);

  if (isLoading || !profile) return null;

  const handleUserClick = (userId) => navigate(`/mypage/${userId}`);
  const handleRestaurantClick = (id) => {
    navigate(`/restaurant/${id}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <Layout>
      <main className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 pb-24">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <div>
            <h1 className="font-[Epilogue] text-2xl md:text-3xl font-bold text-on-surface">팔로잉</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {following.length}명을 팔로우하고 있습니다
            </p>
          </div>
        </div>

        {/* 모바일 탭 */}
        <div className="flex md:hidden border-b border-slate-100 mb-6">
          <button
            onClick={() => setActiveTab('feed')}
            className={`pb-3 px-5 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'feed'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-500'
            }`}
          >
            새 리뷰 피드
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 px-5 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'list'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-500'
            }`}
          >
            팔로잉 목록
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 팔로잉 목록 (데스크탑: 왼쪽 사이드바, 모바일: 탭) */}
          <aside className={`md:col-span-4 ${activeTab === 'list' ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden md:sticky md:top-24">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500 text-sm">group</span>
                <h2 className="font-semibold text-sm text-on-surface">팔로잉 목록</h2>
                <span className="ml-auto text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                  {following.length}명
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-3xl block mb-2 animate-spin">refresh</span>
                  <p className="text-xs">불러오는 중...</p>
                </div>
              ) : following.length === 0 ? (
                <div className="py-12 text-center text-slate-400 px-6">
                  <span className="material-symbols-outlined text-3xl block mb-2">group_off</span>
                  <p className="text-sm">아직 팔로우한 유저가 없습니다.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-3 text-xs text-orange-500 font-medium hover:underline"
                  >
                    식당 탐색하러 가기 →
                  </button>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-50">
                  {following.map((user) => (
                    <button
                      key={user.auth_id}
                      onClick={() => handleUserClick(user.user_id)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-orange-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center flex-shrink-0">
                        {user.profile_image
                          ? <img src={user.profile_image} alt={user.nickname} className="w-full h-full object-cover" />
                          : <span className="text-orange-600 font-bold text-xs">{(user.nickname || user.user_id).slice(0, 2).toUpperCase()}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-on-surface truncate">
                          {user.nickname || user.user_id}
                        </p>
                        <p className="text-xs text-slate-400 truncate">@{user.user_id}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 text-sm flex-shrink-0">
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* 리뷰 피드 */}
          <div className={`md:col-span-8 ${activeTab === 'feed' ? 'block' : 'hidden'} md:block`}>
            <div className="hidden md:flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-orange-500 text-sm">feed</span>
              <h2 className="font-semibold text-sm text-on-surface">새 리뷰 피드</h2>
              {feedReviews.length > 0 && (
                <span className="ml-auto text-xs text-slate-400">{feedReviews.length}개</span>
              )}
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl block mb-3 animate-spin">refresh</span>
                <p className="text-sm font-medium">피드를 불러오는 중...</p>
              </div>
            ) : feedReviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl block mb-3">article</span>
                <p className="text-sm font-medium">
                  {following.length === 0
                    ? '팔로우한 유저가 없어서 피드가 비어 있습니다.'
                    : '팔로우한 유저의 리뷰가 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedReviews.map((review) => (
                  <FeedCard
                    key={review.id}
                    review={review}
                    onUserClick={handleUserClick}
                    onRestaurantClick={handleRestaurantClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
