import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getById } from '../services/restaurantService';
import { getByRestaurant } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import { isSaved as isSavedService, toggleSaved as toggleSavedService } from '../services/savedService';
import defaultRestaurantImg from '../assets/default-restaurant.svg';

const popularDishes = [
  { name: 'Signature Dish', price: '₩28,000', desc: 'Chef\'s daily selection using the freshest seasonal ingredients.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtLh1NYpD8QI9ZAlSIh6ro1uhnW8KKtq244wpGDLTECRQmqHpdjbmfiMtCHH_CnowDIL1pAuzMqmqFvkmK_9_7hxqDrzNXlAM80ROwjcpzhyGKn4dvOTCOEtbiSuBPVEu_2p843aJViWGH9qh0xC5hUmbrg8zkxwVwdsqb3OPCHcXqup0e-YmylykNTg4iYBTOdGshaS1DQcD2Rm1uNTWiYAsx73taEt3-t5mEfa9v3G6tl34I_4YuieUfyVlCnyJg2OwftROktxg_' },
  { name: 'Chef\'s Special', price: '₩32,000', desc: 'A rotating menu item based on what the chef finds inspiring each week.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWfiTamkqsO7J-p2pjn_rBQZjm25m7UARi9O5Mu4sSC0hY00aWr7dIaThsPOoq41-okk6iybbx9CTPhjUlmq43YK8WdswzT4lLAZaFc23J2-qBd9_pHKXXnkpBI7ZHR4ms_-HgpY9hC78UeOvkChUJFz6zAjsLUY5cbyPl8ZVRPxGiVItrs5nP2zy-22TKLoUQjHAqZVae_JDS9LxP0lHqRtF93eAEppC2a1wqVXjwK91sM6-3-vC4b9GeSB573R4KK5m1qEJdAOei' },
  { name: 'House Favorite', price: '₩24,000', desc: 'A beloved classic that regulars keep coming back for, perfected over years.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvzp1mVk2qPX231Hyp9yTkS5ysLEaXNZlES_hj7DmJQ66i1SDKM_Xwayg374qG4OWy7kHf1wLpbYXjhSeWIRA1q7ZXTPVEvZ6Ln3YZRRivBY7oD4fPmkITP2Jav8doC9zVzUNdehVIMSzTBItSayO90fYD6CnuVotRvTUrQEY2FKY4H_PPqOzvlgwp_p7WPmpPOh2u0HoHhGBDMP30lEqhc-m2rNLyE7opfijNqgbIf9L5AdqITXFtuu40i_ELPnb5qGroIf2ij10P' },
  { name: 'Seasonal Dessert', price: '₩14,000', desc: 'A light and refreshing sweet ending crafted with seasonal fruits and local dairy.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCHccFkc2uCwTcGjfOMhFy-sPVDo65WJGA7hUis74RATxXWmfXzDS2Qcff7hacPldcnzIysc_KjaY2ZoNH9J4F87LsQQmPdW9jVV-5RUqEz9JxhyJxrQDJtMJIiBbdFoCVqobulcX9TFTBQSVMePEfahLfPvxm1QKTw7YifgoHHUKcGZ4N4STv4e2wH942hAL-7fIgDtNQG_JeeXovvAuAExAB8L0KYPi1yhKlz1wDOmUL6Pf3Wa1IJJ1tbuyvIgJyFl0jksI-oCCl' },
];


const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
let kakaoScriptPromise = null;

const loadKakaoMapSdk = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Kakao map is only available in browser.'));
  }

  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao);
  }

  if (kakaoScriptPromise) {
    return kakaoScriptPromise;
  }

  kakaoScriptPromise = new Promise((resolve, reject) => {
    if (!KAKAO_APP_KEY) {
      reject(new Error('Missing VITE_KAKAO_MAP_APP_KEY environment variable.'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error('Kakao SDK loaded but map object is unavailable. Check app key and allowed web domain.'));
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => reject(new Error('Failed to load Kakao Map SDK.'));
    document.head.appendChild(script);
  });

  kakaoScriptPromise = kakaoScriptPromise.catch(error => {
    kakaoScriptPromise = null;
    throw error;
  });

  return kakaoScriptPromise;
};

function KakaoLocationMiniMap({ x, y }) {
  const mapRef = useRef(null);
  const mapElementRef = useRef(null);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    let isUnmounted = false;

    loadKakaoMapSdk()
      .then(kakao => {
        if (isUnmounted || !mapElementRef.current) {
          return;
        }

        const center = new kakao.maps.LatLng(y, x);
        const map = new kakao.maps.Map(mapElementRef.current, {
          center,
          level: 4,
        });
        mapRef.current = map;

        new kakao.maps.Marker({
          map,
          position: center,
        });
      })
      .catch(error => {
        if (!isUnmounted) {
          setMapError(error.message);
        }
      });

    return () => {
      isUnmounted = true;
      mapRef.current = null;
    };
  }, [x, y]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center px-3 text-center text-xs text-red-500">
        {mapError}
      </div>
    );
  }

  return <div ref={mapElementRef} className="w-full h-full" />;
}

const bentoImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBtLh1NYpD8QI9ZAlSIh6ro1uhnW8KKtq244wpGDLTECRQmqHpdjbmfiMtCHH_CnowDIL1pAuzMqmqFvkmK_9_7hxqDrzNXlAM80ROwjcpzhyGKn4dvOTCOEtbiSuBPVEu_2p843aJViWGH9qh0xC5hUmbrg8zkxwVwdsqb3OPCHcXqup0e-YmylykNTg4iYBTOdGshaS1DQcD2Rm1uNTWiYAsx73taEt3-t5mEfa9v3G6tl34I_4YuieUfyVlCnyJg2OwftROktxg_',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDWfiTamkqsO7J-p2pjn_rBQZjm25m7UARi9O5Mu4sSC0hY00aWr7dIaThsPOoq41-okk6iybbx9CTPhjUlmq43YK8WdswzT4lLAZaFc23J2-qBd9_pHKXXnkpBI7ZHR4ms_-HgpY9hC78UeOvkChUJFz6zAjsLUY5cbyPl8ZVRPxGiVItrs5nP2zy-22TKLoUQjHAqZVae_JDS9LxP0lHqRtF93eAEppC2a1wqVXjwK91sM6-3-vC4b9GeSB573R4KK5m1qEJdAOei',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDvzp1mVk2qPX231Hyp9yTkS5ysLEaXNZlES_hj7DmJQ66i1SDKM_Xwayg374qG4OWy7kHf1wLpbYXjhSeWIRA1q7ZXTPVEvZ6Ln3YZRRivBY7oD4fPmkITP2Jav8doC9zVzUNdehVIMSzTBItSayO90fYD6CnuVotRvTUrQEY2FKY4H_PPqOzvlgwp_p7WPmpPOh2u0HoHhGBDMP30lEqhc-m2rNLyE7opfijNqgbIf9L5AdqITXFtuu40i_ELPnb5qGroIf2ij10P',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDCHccFkc2uCwTcGjfOMhFy-sPVDo65WJGA7hUis74RATxXWmfXzDS2Qcff7hacPldcnzIysc_KjaY2ZoNH9J4F87LsQQmPdW9jVV-5RUqEz9JxhyJxrQDJtMJIiBbdFoCVqobulcX9TFTBQSVMePEfahLfPvxm1QKTw7YifgoHHUKcGZ4N4STv4e2wH942hAL-7fIgDtNQG_JeeXovvAuAExAB8L0KYPi1yhKlz1wDOmUL6Pf3Wa1IJJ1tbuyvIgJyFl0jksI-oCCl',
];

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyToast, setCopyToast] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const restaurantId = parseInt(id);
    Promise.all([
      getById(restaurantId),
      getByRestaurant(restaurantId),
    ])
      .then(([r, rv]) => {
        setRestaurant(r);
        setReviews(rv);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn || !restaurant) return;
    isSavedService(restaurant.id).then(setSaved);
  }, [isLoggedIn, restaurant]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    });
  };

  const handleSaveToggle = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const nowSaved = await toggleSavedService(restaurant.id);
    setSaved(nowSaved);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96 text-slate-400">
          <span className="material-symbols-outlined text-4xl animate-spin mr-3">refresh</span>
          <p>식당 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-4">
          <span className="material-symbols-outlined text-5xl">search_off</span>
          <p className="text-lg font-medium">식당 정보를 찾을 수 없습니다.</p>
          <button onClick={() => navigate('/')} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold">홈으로 돌아가기</button>
        </div>
      </Layout>
    );
  }

  const restaurantLocation = { x: restaurant.x, y: restaurant.y };
  const reviewCount = reviews.length;

  const scores = [
    { label: 'Taste', value: reviews.length ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 20) : 0 },
    { label: 'Service', value: reviews.length ? Math.min(100, Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 18) + 5) : 0 },
    { label: 'Mood', value: reviews.length ? Math.min(100, Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 17) + 8) : 0 },
  ];

  const nlpKeywords = reviews.length
    ? [...new Set(reviews.flatMap((r) => Object.values(r.keywords || {}).flat()))].slice(0, 8)
    : ['Authentic flavors', 'Great atmosphere', 'Friendly service'];

  return (
    <Layout>
      {/* Bento Gallery */}
      <section className="max-w-7xl mx-auto w-full px-6 py-4">
        <div className="grid grid-cols-4 grid-rows-2 gap-3 mb-6" style={{ gridTemplateRows: 'repeat(2, 200px)' }}>
          <div className="col-span-2 row-span-2 relative overflow-hidden rounded-lg">
            <img src={bentoImages[0] || defaultRestaurantImg} alt="restaurant" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }} />
          </div>
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-lg">
            <img src={bentoImages[1] || defaultRestaurantImg} alt="dish" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }} />
          </div>
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-lg">
            <img src={bentoImages[2] || defaultRestaurantImg} alt="cocktail" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }} />
          </div>
          <div className="col-span-2 row-span-1 relative overflow-hidden rounded-lg">
            <img src={bentoImages[3] || defaultRestaurantImg} alt="chef" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }} />
          </div>
        </div>

        {/* Title Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mb-10">
          <div>
            <h1 className="font-[Epilogue] text-4xl md:text-5xl font-bold text-on-surface mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="flex items-center text-primary">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {restaurant.rating} ({reviewCount} Reviews)
              </span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant">{restaurant.cuisine}</span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant">{restaurant.price}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="bg-surface-container-high text-on-surface-variant px-5 py-3 rounded-lg text-sm font-semibold hover:bg-surface-variant transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                {copyToast ? 'check' : 'share'}
              </span>
              {copyToast ? 'Copied!' : 'Share'}
            </button>
            <button
              onClick={handleSaveToggle}
              className={`px-5 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                saved
                  ? 'bg-primary text-white hover:opacity-90'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={saved ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                bookmark
              </span>
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
        {/* Left (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-50">
            <h2 className="font-[Epilogue] text-2xl font-semibold mb-3">Overview</h2>
            <p className="text-base text-on-surface-variant mb-5 leading-relaxed">
              {restaurant.description || "A hidden gem in the heart of the city, L'Anima Trattoria brings the soul of Rome to your table. Specializing in handmade pasta and seasonal ingredients, we provide an intimate atmosphere perfect for meaningful conversations and culinary discovery."}
            </p>
            <div className="flex flex-wrap gap-3 mb-5">
              {(restaurant.tags || ['Handmade Pasta', 'Quiet Atmosphere', 'Extensive Wine List']).map(tag => (
                <span key={tag} className="bg-[#E8EAF6] text-secondary px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">restaurant</span> {tag}
                </span>
              ))}
            </div>
            {/* Match Status */}
            <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-on-surface">Matches your "Quiet" and "Italian" preferences</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Based on your recent search history and saved collections.</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-start gap-3">
                <div className="bg-error/10 p-1.5 rounded-full">
                  <span className="material-symbols-outlined text-error text-sm">warning</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-error">Note: May contain nuts</h4>
                  <p className="text-xs text-on-surface-variant mt-1">This clashes with your "Nut-free" dietary filter. Kitchen handles walnuts for Pesto.</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[Epilogue] text-2xl font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 700" }}>psychology</span>
                AI Review Analysis
              </h2>
              <span className="text-xs text-on-surface-variant">Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="space-y-4">
                {scores.map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-sm">{label}</span>
                      <span className="font-semibold text-sm text-primary">{value}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-surface-variant">
                <h4 className="font-semibold text-sm mb-3 text-secondary">NLP Keyword Extraction</h4>
                <div className="flex flex-wrap gap-2">
                  {nlpKeywords.map(kw => (
                    <span key={kw} className="bg-secondary/5 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs">{kw}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-base text-on-surface-variant italic">
              "The consensus points to an exceptional culinary experience where the noise floor remains low, ideal for professional meetings or intimate dinners."
            </p>
          </div>

          {/* Menu */}
          <div>
            <h2 className="font-[Epilogue] text-2xl font-semibold mb-5">Popular Dishes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularDishes.map(d => (
                <div key={d.name} className="flex gap-3 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <img src={d.img} alt={d.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm">{d.name}</h4>
                      <span className="text-primary font-bold text-sm">{d.price}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 py-3 border border-secondary text-secondary rounded-lg font-semibold text-sm hover:bg-secondary/5 transition-colors">
              View Full Menu
            </button>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-[Epilogue] text-2xl font-semibold mb-5">What diners are saying</h2>
            {reviews.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2 block">rate_review</span>
                <p>아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const nickname = review.users?.nickname ?? '익명';
                  const initials = nickname.slice(0, 2).toUpperCase();
                  const dateStr = new Date(review.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
                  return (
                    <div key={review.id} className="bg-white p-5 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{initials}</div>
                          <div>
                            <h4 className="font-semibold text-sm">{nickname}</h4>
                            <p className="text-xs text-on-surface-variant">{dateStr}</p>
                          </div>
                        </div>
                        <div className="flex text-primary">
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-base mb-4">{review.review_text}</p>
                      {review.images?.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-1">
                          {review.images.map((img, i) => (
                            <img key={i} src={img} alt="review" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Book */}
          <div className="bg-white rounded-lg p-5 shadow-md border border-primary/10 sticky top-20">
            <h3 className="font-[Epilogue] text-xl font-semibold mb-4">Book a Table</h3>
            <div className="space-y-3 mb-4">
              {[
                { icon: 'calendar_month', options: ['Tonight, Dec 14', 'Tomorrow, Dec 15', 'Friday, Dec 16'] },
                { icon: 'group', options: ['2 People', '3 People', '4 People', '5+ People'] },
                { icon: 'schedule', options: ['7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'] },
              ].map(({ icon, options }) => (
                <div key={icon} className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">{icon}</span>
                  <select className="w-full pl-10 pr-4 py-3 border border-surface-variant rounded-lg bg-surface-bright focus:ring-primary focus:border-primary text-sm">
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button className="w-full bg-primary text-white py-4 rounded-lg font-[Epilogue] font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 mb-2">
              Confirm Reservation
            </button>
            <p className="text-center text-xs text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">bolt</span> Instant confirmation
            </p>
          </div>

          {/* Info */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-50 space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-on-surface mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span> Location
              </h4>
              <p className="text-sm text-on-surface-variant">124 Via Della Conciliazione, Historic Center</p>
              <div className="mt-2 h-28 rounded-lg overflow-hidden">
                <KakaoLocationMiniMap x={restaurantLocation.x} y={restaurantLocation.y} />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-on-surface mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span> Hours
              </h4>
              <ul className="text-xs space-y-1 text-on-surface-variant">
                <li className="flex justify-between"><span>Mon - Fri</span><span>{restaurant.hours?.weekday || '5:00 PM - 11:00 PM'}</span></li>
                <li className="flex justify-between font-bold text-on-surface"><span>Sat - Sun</span><span>{restaurant.hours?.weekend || '12:00 PM - 12:00 AM'}</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-on-surface mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">call</span> Phone
              </h4>
              <p className="text-sm text-on-surface-variant">{restaurant.phone || '+1 (555) 012-3456'}</p>
            </div>
            <button className="w-full py-2.5 text-secondary font-semibold text-sm flex items-center justify-center gap-1 hover:bg-secondary/5 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">open_in_new</span> Visit Website
            </button>
          </div>
        </aside>
      </main>
    </Layout>
  );
}
