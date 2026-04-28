import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { filterLabelMap, cuisineMap } from '../data/mockFilters';
import { getById } from '../services/restaurantService';
import { getByRestaurant as getMenusByRestaurant } from '../services/menuService';
import { getByRestaurant } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import { isSaved as isSavedService, toggleSaved as toggleSavedService } from '../services/savedService';
import { analyzeReviews } from '../services/aiAnalysisService';
import { submitReport, cancelReport, hasReported, getReportCount, REPORT_TYPE } from '../services/reportService';
import ReviewReportButton from '../components/ReviewReportButton';
import defaultRestaurantImg from '../assets/default-restaurant.svg';
import { createReservation, getBookedSlots, getMyReservationForRestaurant } from '../services/reservationService';



const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const totalMinutes = 11 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

function CalendarPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayStr = fmt(today);

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    })
    : '날짜 선택';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-3 border border-surface-variant rounded-lg bg-surface-bright text-sm text-left hover:border-primary/50 transition-colors"
      >
        <span className="material-symbols-outlined text-on-surface-variant text-sm">calendar_month</span>
        <span className={value ? 'text-on-surface' : 'text-on-surface-variant'}>{displayValue}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="font-semibold text-sm">{year}년 {month + 1}월</span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const dateStr = fmt(date);
              const isPast = date < today;
              const isSelected = value === dateStr;
              const isToday = dateStr === todayStr;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => { onChange(dateStr); setOpen(false); }}
                  className={`text-xs py-1.5 rounded-full text-center transition-colors ${isPast
                    ? 'text-slate-300 cursor-not-allowed'
                    : isSelected
                      ? 'bg-primary text-white font-bold'
                      : isToday
                        ? 'border border-primary text-primary font-semibold hover:bg-primary/10'
                        : 'hover:bg-orange-50 text-slate-700'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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

  const hasCoords = x && y;

  useEffect(() => {
    if (!hasCoords) return;
    let isUnmounted = false;

    loadKakaoMapSdk()
      .then(kakao => {
        if (isUnmounted || !mapElementRef.current) return;
        const center = new kakao.maps.LatLng(Number(y), Number(x));
        const map = new kakao.maps.Map(mapElementRef.current, { center, level: 4 });
        mapRef.current = map;
        new kakao.maps.Marker({ map, position: center });
      })
      .catch(error => { if (!isUnmounted) setMapError(error.message); });

    return () => { isUnmounted = true; mapRef.current = null; };
  }, [x, y]);

  if (!hasCoords) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
        <span className="material-symbols-outlined text-sm mr-1">location_off</span>
        위치 정보 없음
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center px-3 text-center text-xs text-red-500">
        {mapError}
      </div>
    );
  }

  return <div ref={mapElementRef} className="w-full h-full" />;
}

const kwLabelMap = {
  Quiet: "조용한", Sophisticated: "세련된", Vibrant: "활기찬", Minimalist: "미니멀",
  Romantic: "로맨틱", Cozy: "아늑한", Noisy: "시끄러운", Crowded: "복잡한", Dark: "어두운",
  Spicy: "매콤한", Savory: "고소한", "Umami-rich": "감칠맛", Authentic: "정통",
  Sweet: "달콤한", Fresh: "신선한", Bland: "싱거운", Oily: "기름진", Overpriced: "가성비 낮음",
  Friendly: "친절한", Fast: "빠른", Attentive: "세심한", "Valet Park": "발렛파킹",
  Slow: "느린", Rude: "불친절한", "Long Wait": "대기 긺",
  Lively: "활기찬",
};

const negativeKwSet = new Set([
  "Noisy", "Crowded", "Dark", "Bland", "Oily", "Overpriced", "Slow", "Rude", "Long Wait"
]);

const bentoImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBtLh1NYpD8QI9ZAlSIh6ro1uhnW8KKtq244wpGDLTECRQmqHpdjbmfiMtCHH_CnowDIL1pAuzMqmqFvkmK_9_7hxqDrzNXlAM80ROwjcpzhyGKn4dvOTCOEtbiSuBPVEu_2p843aJViWGH9qh0xC5hUmbrg8zkxwVwdsqb3OPCHcXqup0e-YmylykNTg4iYBTOdGshaS1DQcD2Rm1uNTWiYAsx73taEt3-t5mEfa9v3G6tl34I_4YuieUfyVlCnyJg2OwftROktxg_',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDWfiTamkqsO7J-p2pjn_rBQZjm25m7UARi9O5Mu4sSC0hY00aWr7dIaThsPOoq41-okk6iybbx9CTPhjUlmq43YK8WdswzT4lLAZaFc23J2-qBd9_pHKXXnkpBI7ZHR4ms_-HgpY9hC78UeOvkChUJFz6zAjsLUY5cbyPl8ZVRPxGiVItrs5nP2zy-22TKLoUQjHAqZVae_JDS9LxP0lHqRtF93eAEppC2a1wqVXjwK91sM6-3-vC4b9GeSB573R4KK5m1qEJdAOei',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDvzp1mVk2qPX231Hyp9yTkS5ysLEaXNZlES_hj7DmJQ66i1SDKM_Xwayg374qG4OWy7kHf1wLpbYXjhSeWIRA1q7ZXTPVEvZ6Ln3YZRRivBY7oD4fPmkITP2Jav8doC9zVzUNdehVIMSzTBItSayO90fYD6CnuVotRvTUrQEY2FKY4H_PPqOzvlgwp_p7WPmpPOh2u0HoHhGBDMP30lEqhc-m2rNLyE7opfijNqgbIf9L5AdqITXFtuu40i_ELPnb5qGroIf2ij10P',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDCHccFkc2uCwTcGjfOMhFy-sPVDo65WJGA7hUis74RATxXWmfXzDS2Qcff7hacPldcnzIysc_KjaY2ZoNH9J4F87LsQQmPdW9jVV-5RUqEz9JxhyJxrQDJtMJIiBbdFoCVqobulcX9TFTBQSVMePEfahLfPvxm1QKTw7YifgoHHUKcGZ4N4STv4e2wH942hAL-7fIgDtNQG_JeeXovvAuAExAB8L0KYPi1yhKlz1wDOmUL6Pf3Wa1IJJ1tbuyvIgJyFl0jksI-oCCl',
];

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, profile } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [menus, setMenus] = useState([]);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copyToast, setCopyToast] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sortOrder, setSortOrder] = useState('latest');
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  // AI 분석 상태
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // 예약 상태
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('');
  const [resPartySize, setResPartySize] = useState(2);
  const [resLoading, setResLoading] = useState(false);
  const [resSuccess, setResSuccess] = useState(false);
  const [resError, setResError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [myExistingReservation, setMyExistingReservation] = useState(null);
  const [justBooked, setJustBooked] = useState(false);

  // 리뷰이벤트 신고 상태
  const [eventReported, setEventReported] = useState(false);
  const [eventReportCount, setEventReportCount] = useState(0);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const openLightbox = (images, index) => setLightbox({ open: true, images, index });
  const closeLightbox = () => setLightbox(prev => ({ ...prev, open: false }));
  const prevImage = () => setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
  const nextImage = () => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));

  const handleEventReport = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (reportSubmitting) return;
    setReportSubmitting(true);
    try {
      if (eventReported) {
        await cancelReport({ reportType: REPORT_TYPE.REVIEW_EVENT, restaurantId: restaurant.id });
        setEventReported(false);
        setEventReportCount(c => Math.max(0, c - 1));
      } else {
        await submitReport({ reportType: REPORT_TYPE.REVIEW_EVENT, restaurantId: restaurant.id });
        setEventReported(true);
        setEventReportCount(c => c + 1);
      }
    } catch (e) {
      if (e.message === 'ALREADY_REPORTED') setEventReported(true);
    } finally {
      setReportSubmitting(false);
    }
  };

  useEffect(() => {
    if (!lightbox.open) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox.open]);

  useEffect(() => {
    const restaurantId = parseInt(id);
    Promise.all([
      getById(restaurantId),
      getByRestaurant(restaurantId),
      getMenusByRestaurant(restaurantId),
    ])
      .then(([r, rv, mn]) => {
        setRestaurant(r);
        setReviews(rv);
        setMenus(mn);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn || !restaurant) return;
    isSavedService(restaurant.id).then(setSaved);
  }, [isLoggedIn, restaurant]);

  useEffect(() => {
    if (!restaurant) return;
    const rid = restaurant.id;
    getReportCount({ reportType: REPORT_TYPE.REVIEW_EVENT, restaurantId: rid })
      .then(setEventReportCount);
    if (isLoggedIn) {
      hasReported({ reportType: REPORT_TYPE.REVIEW_EVENT, restaurantId: rid })
        .then(setEventReported);
    }
  }, [restaurant, isLoggedIn]);

  // AI 리뷰 분석 호출
  useEffect(() => {
    if (!restaurant || reviews.length === 0) return;
    setAiLoading(true);
    setAiError('');
    analyzeReviews(restaurant.name, reviews)
      .then((result) => setAiAnalysis(result))
      .catch((err) => setAiError(err.message))
      .finally(() => setAiLoading(false));
  }, [restaurant, reviews]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    });
  };

  useEffect(() => {
    if (!restaurant || !isLoggedIn) return;
    getMyReservationForRestaurant(restaurant.id)
      .then(setMyExistingReservation)
      .catch((e) => console.error('예약 조회 실패:', e));
  }, [restaurant, isLoggedIn]);

  useEffect(() => {
    if (!restaurant || !resDate) { setBookedSlots([]); return; }
    getBookedSlots(restaurant.id, resDate).then(setBookedSlots).catch(() => { });
  }, [restaurant, resDate]);

  useEffect(() => {
    if (bookedSlots.includes(resTime)) setResTime('');
  }, [bookedSlots]);

  const handleReservation = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (myExistingReservation || justBooked) { setResError('이미 이 식당에 예약이 있습니다.'); return; }
    if (!resDate) { setResError('날짜를 선택해주세요.'); return; }
    if (!resTime) { setResError('시간을 선택해주세요.'); return; }
    if (bookedSlots.includes(resTime)) { setResError('이미 마감된 시간입니다. 다른 시간을 선택해주세요.'); return; }
    setResLoading(true);
    setResError('');
    try {
      await createReservation({ restaurantId: restaurant.id, date: resDate, time: resTime, partySize: resPartySize });
      setJustBooked(true);
      setResSuccess(true);
      setTimeout(() => navigate('/reservations'), 1500);
    } catch (e) {
      setResError(e.message || '예약에 실패했습니다.');
    } finally {
      setResLoading(false);
    }
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

  // AI 분석 결과 또는 폴백 데이터
  const scores = aiAnalysis
    ? [
      { label: '맛', value: aiAnalysis.scores.taste },
      { label: '서비스', value: aiAnalysis.scores.service },
      { label: '분위기', value: aiAnalysis.scores.atmosphere },
    ]
    : [
      { label: '맛', value: reviews.length ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 20) : 0 },
      { label: '서비스', value: reviews.length ? Math.min(100, Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 18) + 5) : 0 },
      { label: '분위기', value: reviews.length ? Math.min(100, Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 17) + 8) : 0 },
    ];

  const allKwFlat = reviews.flatMap(r =>
    Object.entries(r.keywords || {})
      .filter(([k]) => k !== '_negative')
      .flatMap(([, v]) => v)
  );
  const customNegativeAll = new Set(reviews.flatMap(r => r.keywords?._negative || []));
  const positiveKwList = aiAnalysis?.keywords?.positive?.length
    ? aiAnalysis.keywords.positive
    : [...new Set(allKwFlat.filter(kw => !negativeKwSet.has(kw) && !customNegativeAll.has(kw)))];
  const negativeKwList = aiAnalysis?.keywords?.negative?.length
    ? aiAnalysis.keywords.negative
    : [...new Set(allKwFlat.filter(kw => negativeKwSet.has(kw) || customNegativeAll.has(kw)))];
  const aiSummary = aiAnalysis?.summary || null;

  return (
    <Layout>
      {/* Bento Gallery */}
      <section className="max-w-7xl mx-auto w-full px-6 py-4">
        {(() => {
          const allImgs = [restaurant.image, ...(restaurant.sub_images || [])].filter(Boolean);
          const imgs = allImgs.length > 0 ? allImgs : [null, null, null, null];
          return (
            <div className="grid grid-cols-4 grid-rows-2 gap-3 mb-6" style={{ gridTemplateRows: 'repeat(2, 200px)' }}>
              <div className="col-span-2 row-span-2 relative overflow-hidden rounded-lg">
                <img src={imgs[0] || defaultRestaurantImg} alt="restaurant" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }} />
              </div>
              <div className="col-span-1 row-span-1 relative overflow-hidden rounded-lg">
                <img src={imgs[1] || defaultRestaurantImg} alt="sub 1" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }} />
              </div>
              <div className="col-span-1 row-span-1 relative overflow-hidden rounded-lg">
                <img src={imgs[2] || defaultRestaurantImg} alt="sub 2" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }} />
              </div>
              <div className="col-span-2 row-span-1 relative overflow-hidden rounded-lg">
                <img src={imgs[3] || defaultRestaurantImg} alt="sub 3" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }} />
              </div>
            </div>
          );
        })()}

        {/* Title Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mb-10">
          <div>
            <h1 className="font-[Epilogue] text-4xl md:text-5xl font-bold text-on-surface mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="flex items-center text-primary">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: restaurant.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                {restaurant.rating || '0.0'} ({reviewCount}개 리뷰)
              </span>
              {(cuisineMap[restaurant.cuisine] || restaurant.cuisine) && (
                <>
                  <span className="text-on-surface-variant">•</span>
                  <span className="text-on-surface-variant">{cuisineMap[restaurant.cuisine] || restaurant.cuisine}</span>
                </>
              )}
              {restaurant.price && (
                <>
                  <span className="text-on-surface-variant">•</span>
                  <span className="text-on-surface-variant">{restaurant.price}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleEventReport}
              disabled={reportSubmitting}
              className={`px-5 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${eventReported
                ? 'bg-red-100 text-red-500 border border-red-300 hover:bg-red-200'
                : 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                }`}
            >
              <span className="material-symbols-outlined text-sm">
                {eventReported ? 'cancel' : 'warning'}
              </span>
              {eventReported ? '신고 취소' : '리뷰이벤트 신고하기'}
              {eventReportCount > 0 && (
                <span className="bg-red-200 text-red-600 rounded-full px-1.5 py-0.5 text-[10px]">
                  {eventReportCount}
                </span>
              )}
            </button>
            <button
              onClick={handleShare}
              className="bg-surface-container-high text-on-surface-variant px-5 py-3 rounded-lg text-sm font-semibold hover:bg-surface-variant transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                {copyToast ? 'check' : 'share'}
              </span>
              {copyToast ? '복사됨!' : '공유'}
            </button>
            <button
              onClick={handleSaveToggle}
              className={`px-5 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${saved
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
              {saved ? '저장됨' : '저장'}
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
            <h2 className="font-[Epilogue] text-2xl font-semibold mb-3">소개</h2>
            <p className="text-base text-on-surface-variant mb-5 leading-relaxed">
              {restaurant.description || "도심 속 숨겨진 보석 같은 공간으로, 수제 파스타와 제철 재료를 전문으로 한 아늑한 분위기를 자랑합니다."}
            </p>
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[Epilogue] text-2xl font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 700" }}>psychology</span>
                AI 리뷰 분석
                {/* AI 엔진 배지 삭제됨 */}
              </h2>
              <span className="text-xs text-on-surface-variant">{reviewCount}개의 리뷰 기반</span>
            </div>

            {aiLoading && (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <span className="material-symbols-outlined text-2xl animate-spin mr-3">refresh</span>
                <span className="text-sm font-medium">AI가 리뷰를 분석하고 있습니다...</span>
              </div>
            )}

            {aiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-600">
                <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                AI 분석 오류: {aiError}
              </div>
            )}

            {!aiLoading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* 통계 바 */}
                  <div className="space-y-5">
                    {scores.map(({ label, value }) => (
                      <div key={label}>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-semibold text-sm">{label}</span>
                          <span className="font-semibold text-sm text-primary">{value}%</span>
                        </div>
                        <div className="w-full bg-surface-container rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 키워드 */}
                  <div className="bg-surface-container-lowest p-4 rounded-lg border border-surface-variant space-y-4">
                    <h4 className="font-semibold text-sm text-secondary">
                      AI 키워드 분석
                    </h4>

                    {positiveKwList.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-secondary uppercase tracking-wide mb-1.5">긍정적</p>
                        <div className="flex flex-wrap gap-1.5">
                          {positiveKwList.map(kw => (
                            <span key={kw} className="bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 rounded-full text-xs font-medium">
                              {kwLabelMap[kw] ?? kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {negativeKwList.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide mb-1.5">부정적</p>
                        <div className="flex flex-wrap gap-1.5">
                          {negativeKwList.map(kw => (
                            <span key={kw} className="bg-red-50 text-red-500 border border-red-200 px-2.5 py-1 rounded-full text-xs font-medium">
                              {kwLabelMap[kw] ?? kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {!positiveKwList.length && !negativeKwList.length && (
                      <p className="text-xs text-on-surface-variant">리뷰 키워드가 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* AI 요약 */}
                {aiSummary && (
                  <div className="border-t border-surface-container pt-4">
                    <p className="text-sm text-on-surface-variant italic leading-relaxed">
                      "{aiSummary}"
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Menu */}
          <div>
            <h2 className="font-[Epilogue] text-2xl font-semibold mb-5">메뉴</h2>
            {menus.length === 0 ? (
              <p className="text-sm text-on-surface-variant">등록된 메뉴가 없습니다.</p>
            ) : (
              <>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                  {(menuExpanded ? menus : menus.slice(0, 4)).map((m) => (
                    <div key={m.id} className="flex justify-between items-center px-5 py-4 hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-on-surface">{m.name}</span>
                      <span className="text-sm font-bold text-primary ml-4 flex-shrink-0">
                        {m.price.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
                {menus.length > 4 && (
                  <button
                    onClick={() => setMenuExpanded(prev => !prev)}
                    className="w-full mt-4 py-3 border border-secondary text-secondary rounded-lg font-semibold text-sm hover:bg-secondary/5 transition-colors flex items-center justify-center gap-1"
                  >
                    {menuExpanded ? (
                      <>
                        <span className="material-symbols-outlined text-sm">expand_less</span>
                        접기
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                        전체 메뉴 보기 ({menus.length}개)
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Reviews */}
          <div>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
              <h2 className="font-[Epilogue] text-2xl font-semibold">손님들의 이야기</h2>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-outline-variant overflow-hidden text-xs font-semibold">
                  {[
                    { value: 'latest', label: '최신순' },
                    { value: 'high', label: '별점 높은순' },
                    { value: 'low', label: '별점 낮은순' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setSortOrder(value)}
                      className={`px-3 py-1.5 transition-colors ${sortOrder === value
                        ? 'bg-secondary text-white'
                        : 'bg-white text-on-surface-variant hover:bg-surface-container'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (!isLoggedIn) { navigate('/login'); return; }
                    navigate(`/write-review?restaurantId=${id}`);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">rate_review</span>
                  리뷰 쓰기
                </button>
              </div>
            </div>
            {reviews.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2 block">rate_review</span>
                <p>아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...reviews].sort((a, b) => {
                  if (sortOrder === 'high') return b.rating - a.rating;
                  if (sortOrder === 'low') return a.rating - b.rating;
                  return new Date(b.created_at) - new Date(a.created_at);
                }).map((review) => {
                  const nickname = review.users?.nickname ?? '익명';
                  const reviewerUserId = review.users?.user_id;
                  const profileImage = review.users?.profile_image;
                  const initials = nickname.slice(0, 2).toUpperCase();
                  const dateStr = new Date(review.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
                  const handleAuthorClick = () => reviewerUserId && navigate(`/mypage/${reviewerUserId}`);
                  return (
                    <div key={review.id} className="bg-white p-5 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group/author"
                          onClick={handleAuthorClick}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 group-hover/author:ring-2 group-hover/author:ring-primary/40 transition-all">
                            {profileImage
                              ? <img src={profileImage} alt={nickname} className="w-full h-full object-cover" />
                              : <span>{initials}</span>
                            }
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm group-hover/author:text-primary transition-colors">{nickname}</h4>
                            <p className="text-xs text-on-surface-variant">{dateStr}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex text-primary">
                            {[...Array(review.rating)].map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            ))}
                          </div>
                          {review.user_id !== profile?.id && (
                            <ReviewReportButton reviewId={review.id} />
                          )}
                        </div>
                      </div>
                      {(() => {
                        const allKws = Object.entries(review.keywords || {}).filter(([k]) => k !== '_negative').flatMap(([, v]) => v);
                        if (!allKws.length) return null;
                        const customNegatives = new Set(review.keywords._negative || []);
                        const positiveKws = allKws.filter(kw => !negativeKwSet.has(kw) && !customNegatives.has(kw));
                        const negativeKws = allKws.filter(kw => negativeKwSet.has(kw) || customNegatives.has(kw));
                        return (
                          <div className="flex flex-col gap-1.5 mb-4">
                            {positiveKws.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {positiveKws.map((kw, i) => (
                                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                                    {kwLabelMap[kw] ?? kw}
                                  </span>
                                ))}
                              </div>
                            )}
                            {negativeKws.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {negativeKws.map((kw, i) => (
                                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500 border border-red-200">
                                    {kwLabelMap[kw] ?? kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <p className="text-base mb-3">{review.review_text}</p>
                      {review.images?.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-1">
                          {review.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="review"
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                              onClick={() => openLightbox(review.images, i)}
                            />
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
          <div className="sticky top-20 space-y-4">
            {/* Book */}
            <div className="bg-white rounded-lg p-5 shadow-md border border-primary/10">
              <h3 className="font-[Epilogue] text-xl font-semibold mb-4">테이블 예약</h3>

              <div className="space-y-3 mb-4">
                <CalendarPicker value={resDate} onChange={setResDate} />
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">group</span>
                  <select
                    value={resPartySize}
                    onChange={(e) => setResPartySize(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-surface-variant rounded-lg bg-surface-bright focus:ring-primary focus:border-primary text-sm"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}명</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">schedule</span>
                  <select
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-surface-variant rounded-lg bg-surface-bright focus:ring-primary focus:border-primary text-sm"
                  >
                    <option value="">시간 선택</option>
                    {TIME_SLOTS.map((t) => {
                      const isBooked = bookedSlots.includes(t);
                      return (
                        <option key={t} value={t} disabled={isBooked}>
                          {t}{isBooked ? ' (마감)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              {resError && (
                <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {resError}
                </p>
              )}
              {resSuccess && (
                <p className="text-xs text-green-600 mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  예약이 완료되었습니다.
                </p>
              )}
              <button
                onClick={handleReservation}
                disabled={resLoading || !!myExistingReservation || justBooked}
                className="w-full bg-primary text-white py-4 rounded-lg font-[Epilogue] font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 mb-2 disabled:opacity-60"
              >
                {resLoading ? '예약 중...' : '예약'}
              </button>
{myExistingReservation && (
                <p className="text-center text-xs text-slate-400 mt-2">이미 예약한 적 있는 식당입니다.</p>
              )}
            </div>

            {/* Info */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-50 space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-on-surface mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span> 위치
                </h4>
                <p className="text-sm text-on-surface-variant">{restaurant.address || '주소 정보 없음'}</p>
                <div className="mt-2 h-28 rounded-lg overflow-hidden">
                  <KakaoLocationMiniMap x={restaurantLocation.x} y={restaurantLocation.y} />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-on-surface mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> 영업시간
                </h4>
                <ul className="text-xs space-y-1 text-on-surface-variant">
                  <li className="flex justify-between"><span>월 - 금</span><span>{restaurant.hours?.weekday || '17:00 - 23:00'}</span></li>
                  <li className="flex justify-between font-bold text-on-surface"><span>토 - 일</span><span>{restaurant.hours?.weekend || '12:00 - 24:00'}</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-on-surface mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">call</span> 전화
                </h4>
                <p className="text-sm text-on-surface-variant">{restaurant.phone || '+1 (555) 012-3456'}</p>
              </div>
              <button className="w-full py-2.5 text-secondary font-semibold text-sm flex items-center justify-center gap-1 hover:bg-secondary/5 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm">open_in_new</span> 웹사이트 방문
              </button>
            </div>
          </div>
        </aside>
      </main>
      {/* Lightbox */}
      {lightbox.open && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* 닫기 */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>

          {/* 이전 */}
          {lightbox.images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full p-1"
            >
              <span className="material-symbols-outlined text-4xl">chevron_left</span>
            </button>
          )}

          {/* 이미지 */}
          <img
            src={lightbox.images[lightbox.index]}
            alt="확대 이미지"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* 다음 */}
          {lightbox.images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full p-1"
            >
              <span className="material-symbols-outlined text-4xl">chevron_right</span>
            </button>
          )}

          {/* 페이지 인디케이터 */}
          {lightbox.images.length > 1 && (
            <div className="absolute bottom-5 flex gap-2">
              {lightbox.images.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: i })); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === lightbox.index ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
