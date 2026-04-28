import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  navItems,
  ADMIN_AVATAR,
} from '../data/mockAdminData';
import {
  adminGetKpiStats,
  adminGetWeeklyReviewCounts,
  adminGetSentimentStats,
  adminGetTopKeywords,
  adminGetMonthlyUserGrowth,
} from '../services/adminDashboardService';
import { getReportedReviews } from '../services/reportService';
import { getAll, adminRemove } from '../services/reviewService';
import {
  getAll as getAllRestaurants,
  adminCreate,
  adminUpdate,
  adminDelete,
} from '../services/restaurantService';
import { getEventReportCountsByRestaurant } from '../services/reportService';
import {
  adminGetAllUsers,
  adminGetReviewCountsByUser,
  adminDeleteUser,
  adminBanUser,
  adminUnbanUser,
} from '../services/authService';
import { uploadRestaurantImage } from '../services/storageService';
import { vibes, flavors, dietary } from '../data/mockFilters';
import LOGO_URL from '../assets/logo.png';

const NAV_LABELS = navItems.map((n) => n.label);

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm text-orange-400"
          style={{
            fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

const PROVIDER_BADGE = {
  email: { label: '이메일', cls: 'bg-slate-100 text-slate-500' },
  google: { label: 'Google', cls: 'bg-blue-50 text-blue-500' },
  kakao: { label: 'Kakao', cls: 'bg-yellow-50 text-yellow-600' },
};

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [reviewCounts, setReviewCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([adminGetAllUsers(), adminGetReviewCountsByUser()])
      .then(([us, counts]) => {
        setUsers(us);
        setReviewCounts(counts);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nickname?.toLowerCase().includes(q) ||
        u.user_id?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleDelete = async (u) => {
    setDeleting(true);
    try {
      await adminDeleteUser(u.auth_id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setConfirmDeleteId(null);
    } catch (e) {
      console.error('유저 삭제 실패:', e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleBanToggle = async (u) => {
    const isBanned = u.role === 'banned';
    try {
      if (isBanned) {
        await adminUnbanUser(u.auth_id ?? u.id);
      } else {
        await adminBanUser(u.auth_id ?? u.id);
      }
      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id ? { ...x, role: isBanned ? 'user' : 'banned' } : x
        )
      );
    } catch (e) {
      console.error('밴 처리 실패:', e.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900 shrink-0">
          유저 관리
        </h4>
        <div className="relative max-w-xs w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="닉네임, 아이디, 이메일 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-slate-400 shrink-0">
          {filtered.length}명
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <tr>
              {[
                '유저',
                '아이디',
                '이메일',
                '가입방식',
                '리뷰수',
                '가입일',
                '상태',
                '삭제',
              ].map((h) => (
                <th key={h} className="px-5 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-16 text-center text-slate-400 text-sm"
                >
                  불러오는 중...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-16 text-center text-slate-400 text-sm"
                >
                  유저가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const authProviders = u.providers || [];
                const providerKey = authProviders.includes('google')
                  ? 'google'
                  : u.provider === 'kakao' || u.social_id
                    ? 'kakao'
                    : 'email';
                const badge =
                  PROVIDER_BADGE[providerKey] ?? PROVIDER_BADGE.email;
                const reviewCount = reviewCounts[u.id] ?? 0;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                          {u.profile_image ? (
                            <img
                              src={u.profile_image}
                              alt={u.nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (u.nickname || u.user_id || '?')
                              .slice(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                          {u.nickname || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {u.user_id}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700 font-semibold">
                      {reviewCount}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleBanToggle(u)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          u.role === 'banned'
                            ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {u.role === 'banned' ? 'lock' : 'lock_open'}
                        </span>
                        {u.role === 'banned' ? '정지됨' : '정상'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      {confirmDeleteId === u.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deleting}
                            className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                          >
                            {deleting ? '삭제 중' : '확인'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(u.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="유저 삭제"
                        >
                          <span className="material-symbols-outlined text-sm">
                            person_remove
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

let kakaoWithServicesPromise = null;
function loadKakaoWithServices() {
  if (window.kakao?.maps?.services) return Promise.resolve(window.kakao);
  if (kakaoWithServicesPromise) return kakaoWithServicesPromise;
  kakaoWithServicesPromise = new Promise((resolve, reject) => {
    // 이미 존재하는 스크립트가 있는지 확인
    const existingScript = document.querySelector(
      `script[src*="dapi.kakao.com/v2/maps/sdk.js"]`
    );
    if (existingScript) {
      window.kakao.maps.load(() => resolve(window.kakao));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        // services 라이브러리가 로드되었는지 확인
        if (window.kakao.maps.services) {
          resolve(window.kakao);
        } else {
          // services가 없더라도 일단 지도는 띄우기 위해 resolve
          console.warn(
            'Kakao Maps Services library not found, but proceeding to load map'
          );
          resolve(window.kakao);
        }
      });
    };
    script.onerror = () => {
      kakaoWithServicesPromise = null;
      reject(new Error('Kakao SDK 로드 실패'));
    };
    document.head.appendChild(script);
  });
  return kakaoWithServicesPromise;
}

function KakaoMapPicker({ selectedAddress, selectedX, selectedY, onSelect }) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState(selectedAddress || '');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const getInitCenter = (kakao) =>
      new Promise((resolve) => {
        if (selectedX && selectedY) {
          resolve(new kakao.maps.LatLng(Number(selectedY), Number(selectedX)));
          return;
        }
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve(
                new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
              ),
            () => resolve(new kakao.maps.LatLng(37.5665, 126.978)),
            { timeout: 5000 }
          );
        } else {
          resolve(new kakao.maps.LatLng(37.5665, 126.978));
        }
      });

    loadKakaoWithServices()
      .then(async (kakao) => {
        if (cancelled || !mapElementRef.current) return;
        const initCenter = await getInitCenter(kakao);

        const map = new kakao.maps.Map(mapElementRef.current, {
          center: initCenter,
          level: 4,
        });
        mapRef.current = map;

        if (selectedX && selectedY) {
          markerRef.current = new kakao.maps.Marker({
            map,
            position: initCenter,
          });
        }

        kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
          const latlng = mouseEvent.latLng;
          const x = String(latlng.getLng());
          const y = String(latlng.getLat());

          if (markerRef.current) markerRef.current.setPosition(latlng);
          else
            markerRef.current = new kakao.maps.Marker({
              map,
              position: latlng,
            });

          if (!kakao.maps.services || !kakao.maps.services.Geocoder) {
            console.error('Kakao Geocoder service is not loaded.');
            onSelect({
              x: String(latlng.getLng()),
              y: String(latlng.getLat()),
              address: '',
            });
            return;
          }

          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.coord2Address(
            latlng.getLng(),
            latlng.getLat(),
            (result, status) => {
              const addr =
                status === kakao.maps.services.Status.OK
                  ? result[0]?.road_address?.address_name ||
                    result[0]?.address?.address_name ||
                    ''
                  : '';
              setAddress(addr);
              onSelect({ x, y, address: addr });
            }
          );
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-500">
        위치 선택{' '}
        <span className="font-normal text-slate-400">
          (지도를 클릭해 위치를 지정하세요)
        </span>
      </label>
      {error ? (
        <div className="h-52 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-red-500 px-4 text-center">
          {error}
        </div>
      ) : (
        <div
          ref={mapElementRef}
          className="w-full h-52 rounded-lg overflow-hidden border border-slate-200"
        />
      )}
      {address && (
        <p className="text-xs text-green-600 font-medium px-1">✓ {address}</p>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  name: '',
  cuisine: '',
  price: '',
  badge: '',
  event: '',
  description: '',
  phone: '',
  website: '',
  address: '',
  x: '',
  y: '',
  vibes: [],
  flavors: [],
  dietary: [],
  imageList: [],
};

function RestaurantsTab() {
  const [restaurants, setRestaurants] = useState([]);
  const [reportCounts, setReportCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [modal, setModal] = useState(null); // null | { mode: 'add' | 'edit', data: {} }
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    Promise.all([getAllRestaurants(), getEventReportCountsByRestaurant()])
      .then(([rs, counts]) => {
        setRestaurants(rs);
        setReportCounts(counts);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.cuisine?.toLowerCase().includes(q)
    );
  }, [restaurants, search]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: 'add' });
  };
  const openEdit = (r) => {
    const existing = [r.image, ...(r.sub_images || [])]
      .filter(Boolean)
      .map((url) => ({ url, file: null }));
    setForm({
      name: r.name || '',
      cuisine: r.cuisine || '',
      price: r.price || '',
      badge: r.badge || '',
      event: r.event || '',
      description: r.description || '',
      phone: r.phone || '',
      website: r.website || '',
      address: r.address || '',
      x: r.x || '',
      y: r.y || '',
      vibes: r.vibes || [],
      flavors: r.flavors || [],
      dietary: r.dietary || [],
      imageList: existing,
    });
    setModal({ mode: 'edit', id: r.id });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const uploadedUrls = await Promise.all(
        form.imageList.map((img) =>
          img.file ? uploadRestaurantImage(img.file) : img.url
        )
      );
      const [mainImage, ...subImages] = uploadedUrls;

      const payload = {
        name: form.name,
        cuisine: form.cuisine || null,
        price: form.price || null,
        badge: form.badge || null,
        event: form.event || null,
        description: form.description || null,
        phone: form.phone || null,
        website: form.website || null,
        vibes: form.vibes.length ? form.vibes : null,
        flavors: form.flavors.length ? form.flavors : null,
        dietary: form.dietary.length ? form.dietary : null,
        image: mainImage || null,
        sub_images: subImages.length ? subImages : null,
        address: form.address || null,
        x: form.x ? Number(form.x) : null,
        y: form.y ? Number(form.y) : null,
      };
      if (modal.mode === 'add') {
        const created = await adminCreate(payload);
        setRestaurants((prev) => [...prev, created]);
      } else {
        const updated = await adminUpdate(modal.id, payload);
        setRestaurants((prev) =>
          prev.map((r) => (r.id === modal.id ? updated : r))
        );
      }
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await adminDelete(id);
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      setConfirmDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleEventToggle = async (r) => {
    const newEvent = r.event ? null : '리뷰이벤트';
    const updated = await adminUpdate(r.id, { event: newEvent });
    setRestaurants((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
  };


  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900 shrink-0">
            식당 관리
          </h4>
          <div className="relative max-w-xs w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="식당명, 카테고리 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-slate-400">{filtered.length}건</span>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              식당 추가
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
              <tr>
                {[
                  'ID',
                  '식당명',
                  '카테고리',
                  '가격대',
                  '리뷰이벤트 시행 여부',
                  '신고수',
                  '액션',
                ].map((h) => (
                  <th key={h} className="px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-slate-400 text-sm"
                  >
                    불러오는 중...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-slate-400 text-sm"
                  >
                    식당이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const count = reportCounts[r.id] || 0;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {r.id}
                      </td>
                      <td className="px-5 py-4 font-semibold text-sm text-slate-900 whitespace-nowrap">
                        {r.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {r.cuisine || '-'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {r.price || '-'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleEventToggle(r)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                            r.event
                              ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {r.event ? 'warning' : 'add'}
                          </span>
                          {r.event || '없음'}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        {count > 0 ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                            <span className="material-symbols-outlined text-sm">
                              warning
                            </span>
                            {count}건
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {confirmDeleteId === r.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deleting}
                              className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                            >
                              {deleting ? '삭제 중' : '확인'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="text-slate-400 hover:text-primary transition-colors"
                              title="수정"
                            >
                              <span className="material-symbols-outlined text-sm">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(r.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                              title="삭제"
                            >
                              <span className="material-symbols-outlined text-sm">
                                delete
                              </span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 추가/수정 모달 */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-[Epilogue] text-lg font-bold text-slate-900">
                {modal.mode === 'add' ? '식당 추가' : '식당 수정'}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* 기본 정보 */}
              {[
                { key: 'name', label: '식당명 *', placeholder: '식당 이름' },
                {
                  key: 'cuisine',
                  label: '카테고리',
                  placeholder: '예: 한식, 이탈리안',
                },
                { key: 'price', label: '가격대', placeholder: '예: $$, $$$' },
                {
                  key: 'badge',
                  label: '뱃지',
                  placeholder: '예: 미슐랭 1스타',
                },
                {
                  key: 'event',
                  label: '이벤트',
                  placeholder: '예: 리뷰이벤트',
                },
                {
                  key: 'phone',
                  label: '전화번호',
                  placeholder: '02-1234-5678',
                },
                {
                  key: 'website',
                  label: '웹사이트',
                  placeholder: 'https://...',
                },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {label}
                  </label>
                  <input
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  설명
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="식당 설명"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* 위치 선택 */}
              <KakaoMapPicker
                selectedAddress={form.address}
                selectedX={form.x}
                selectedY={form.y}
                onSelect={({ address, x, y }) =>
                  setForm((prev) => ({ ...prev, address, x, y }))
                }
              />

              {/* 이미지 (여러 장) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  이미지{' '}
                  <span className="text-slate-400 font-normal">
                    (첫 번째가 대표 이미지)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {form.imageList.map((img, idx) => (
                    <div key={idx} className="relative group w-20 h-20">
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover rounded-lg border border-slate-200"
                      />
                      {idx === 0 && (
                        <span className="absolute top-0.5 left-0.5 bg-primary text-white text-[9px] font-bold px-1 rounded">
                          대표
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            imageList: prev.imageList.filter(
                              (_, i) => i !== idx
                            ),
                          }))
                        }
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                  <label className="cursor-pointer w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-primary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">
                      add_a_photo
                    </span>
                    <span className="text-[10px] mt-0.5">추가</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newImgs = files.map((file) => ({
                          file,
                          url: URL.createObjectURL(file),
                        }));
                        setForm((prev) => ({
                          ...prev,
                          imageList: [...prev.imageList, ...newImgs],
                        }));
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* 분위기 키워드 */}
              {[
                { key: 'vibes', label: '분위기', items: vibes },
                { key: 'flavors', label: '맛 프로필', items: flavors },
                { key: 'dietary', label: '식이 요건', items: dietary },
              ].map(({ key, label, items }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    {label}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => {
                      const active = form[key].includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              [key]: active
                                ? prev[key].filter((v) => v !== item.value)
                                : [...prev[key], item.value],
                            }))
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            active
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getAll()
      .then(setReviews)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        r.review_text?.toLowerCase().includes(q) ||
        r.restaurants?.name?.toLowerCase().includes(q) ||
        r.users?.nickname?.toLowerCase().includes(q) ||
        r.users?.user_id?.toLowerCase().includes(q)
    );
  }, [reviews, search]);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await adminRemove(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900 shrink-0">
          리뷰 관리
        </h4>
        <div className="relative max-w-xs w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="유저, 식당, 리뷰 내용 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-slate-400 shrink-0">
          {filtered.length}건
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <tr>
              {['유저', '식당', '별점', '리뷰 내용', '날짜', '삭제'].map(
                (h) => (
                  <th key={h} className="px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center text-slate-400 text-sm"
                >
                  불러오는 중...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center text-slate-400 text-sm"
                >
                  리뷰가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 overflow-hidden">
                        {r.users?.profile_image ? (
                          <img
                            src={r.users.profile_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (r.users?.nickname || r.users?.user_id || '?')
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {r.users?.nickname || r.users?.user_id || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {r.restaurants?.name || '-'}
                  </td>
                  <td className="px-5 py-4">
                    <StarDisplay rating={r.rating} />
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm text-slate-600 truncate">
                      {r.review_text}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-5 py-4">
                    {confirmId === r.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting}
                          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                        >
                          {deleting ? '삭제 중' : '확인'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(r.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <span className="material-symbols-outlined text-sm">
                          delete
                        </span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardTab() {
  const [kpi, setKpi] = useState(null);
  const [weeklyReviews, setWeeklyReviews] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    Promise.all([
      adminGetKpiStats(),
      adminGetWeeklyReviewCounts(),
      adminGetSentimentStats(),
      getReportedReviews(),
      adminGetTopKeywords(10),
      adminGetMonthlyUserGrowth(4),
    ])
      .then(([kpiData, weekly, sentimentData, reported, kws, growth]) => {
        setKpi(kpiData);
        setWeeklyReviews(weekly);
        setSentiment(sentimentData);
        setReportedReviews(reported);
        setKeywords(kws);
        setMonthlyGrowth(growth);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteReported = async (reviewId) => {
    setDeletingId(reviewId);
    try {
      await adminRemove(reviewId);
      setReportedReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setKpi((prev) => prev ? { ...prev, reportCount: Math.max(0, prev.reportCount - 1) } : prev);
    } finally {
      setDeletingId(null);
    }
  };

  const kpiCards = [
    {
      icon: 'person_add',
      title: '전체 유저',
      value: kpi?.userCount?.toLocaleString() ?? '-',
      color: 'bg-orange-50 text-primary',
      badgeColor: 'text-slate-400 bg-slate-50',
      badge: '명',
    },
    {
      icon: 'reviews',
      title: '전체 리뷰',
      value: kpi?.reviewCount?.toLocaleString() ?? '-',
      color: 'bg-blue-50 text-secondary',
      badgeColor: 'text-slate-400 bg-slate-50',
      badge: '건',
    },
    {
      icon: 'storefront',
      title: '활성 식당',
      value: kpi?.restaurantCount?.toLocaleString() ?? '-',
      color: 'bg-purple-50 text-purple-600',
      badgeColor: 'text-slate-400 bg-slate-50',
      badge: '곳',
    },
    {
      icon: 'report',
      title: '신고된 리뷰',
      value: kpi?.reportCount?.toLocaleString() ?? '-',
      color: 'bg-error-container text-error',
      badgeColor: 'text-error bg-error-container',
      badge: kpi?.reportCount > 0 ? '긴급' : '없음',
      urgent: (kpi?.reportCount ?? 0) > 0,
    },
  ];

  const maxWeekly = Math.max(...weeklyReviews.map((r) => r.count), 1);

  const pos = sentiment?.positive ?? 0;
  const neu = sentiment?.neutral ?? 0;
  const neg = sentiment?.negative ?? 0;

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiCards.map(({ icon, title, value, badge, color, badgeColor, urgent }) => (
          <div
            key={title}
            className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between ${urgent ? 'border-error-container ring-1 ring-error/10' : 'border-slate-100'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${color}`}>
                <span className="material-symbols-outlined text-sm">{icon}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColor} ${urgent ? 'animate-pulse' : ''}`}>
                {badge}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
              <h3 className={`text-2xl font-bold ${urgent ? 'text-error' : 'text-slate-900'}`}>
                {loading ? <span className="inline-block w-16 h-7 bg-slate-100 rounded animate-pulse" /> : value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* 주간 리뷰 바 차트 */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900">주간 리뷰 트렌드</h4>
            <span className="text-xs text-slate-400">최근 7일</span>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-300 text-sm">불러오는 중...</div>
          ) : (
            <div className="h-48 flex items-end gap-2">
              {weeklyReviews.map(({ date, count }) => {
                const pct = (count / maxWeekly) * 100;
                const label = new Date(date + 'T12:00:00').toLocaleDateString('ko-KR', { weekday: 'short' });
                return (
                  <div key={date} className="flex flex-col items-center flex-1 gap-1 h-full justify-end">
                    <span className="text-[10px] text-slate-500 font-semibold">{count > 0 ? count : ''}</span>
                    <div
                      className="w-full bg-primary/20 rounded-t hover:bg-primary/40 transition-colors"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                      title={`${count}건`}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 감정 분석 도넛 */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900 mb-1">별점 분포</h4>
          <p className="text-xs text-slate-400 mb-4">전체 리뷰 {sentiment?.total?.toLocaleString() ?? 0}건 기준</p>
          {loading ? (
            <div className="flex items-center justify-center h-36 text-slate-300 text-sm">불러오는 중...</div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#b02f00"
                    strokeDasharray={`${pos} 100`} strokeLinecap="round" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#4c56af"
                    strokeDasharray={`${neu} 100`} strokeDashoffset={`-${pos}`} strokeLinecap="round" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#fca5a5"
                    strokeDasharray={`${neg} 100`} strokeDashoffset={`-${pos + neu}`} strokeLinecap="round" strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{pos}%</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">긍정</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                {[
                  { color: 'bg-primary', label: '긍정 (4-5점)', pct: `${pos}%` },
                  { color: 'bg-secondary', label: '중립 (3점)', pct: `${neu}%` },
                  { color: 'bg-red-300', label: '부정 (1-2점)', pct: `${neg}%` },
                ].map(({ color, label, pct }) => (
                  <div key={label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm font-medium text-slate-600">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 신고된 리뷰 테이블 + 사이드바 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900">신고된 리뷰</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                <tr>
                  {['유저', '식당', '리뷰 내용', '신고수', '날짜', '삭제'].map((h) => (
                    <th key={h} className="px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">불러오는 중...</td>
                  </tr>
                ) : reportedReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">신고된 리뷰가 없습니다.</td>
                  </tr>
                ) : (
                  reportedReviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                            {r.users?.profile_image
                              ? <img src={r.users.profile_image} alt="" className="w-full h-full object-cover" />
                              : (r.users?.nickname || r.users?.user_id || '?').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {r.users?.nickname || r.users?.user_id || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {r.restaurants?.name || '-'}
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-sm text-slate-600 truncate">{r.review_text}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                          <span className="material-symbols-outlined text-sm">warning</span>
                          {r.reportCount}건
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDeleteReported(r.id)}
                          disabled={deletingId === r.id}
                          className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
                          title="리뷰 삭제"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {deletingId === r.id ? 'refresh' : 'delete'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-5">
          {/* 인기 키워드 */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900 mb-3">인기 키워드</h4>
            {loading ? (
              <div className="text-slate-300 text-sm">불러오는 중...</div>
            ) : keywords.length === 0 ? (
              <p className="text-sm text-slate-400">키워드 데이터가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <span
                    key={kw}
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      i % 3 === 0
                        ? 'bg-secondary/10 text-secondary'
                        : i % 3 === 1
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface-container-high text-slate-600'
                    }`}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 유저 성장 */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900 mb-4">월별 신규 유저</h4>
            {loading ? (
              <div className="text-slate-300 text-sm">불러오는 중...</div>
            ) : (
              <div className="space-y-4">
                {monthlyGrowth.map(({ month, value, pct, color }) => (
                  <div key={month}>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-500">{month}</span>
                      <span className="text-slate-900 font-bold">{value.toLocaleString()}명 신규</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('대시보드');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-white border-r border-slate-200 shadow-sm font-[Epilogue] text-sm">
        <div className="p-6">
          <div
            className="flex items-center gap-3 mb-8 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 overflow-hidden">
              <img
                src={LOGO_URL}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Foodiest</h1>
              <p className="text-xs text-slate-500">전문 컨시어지 서비스</p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === label
                    ? 'text-orange-600 bg-orange-50 font-semibold border-r-4 border-orange-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-8 left-6 right-6">
          <button className="w-full bg-primary py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">add</span>
            리포트 생성
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 h-16 flex items-center justify-between px-8 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm font-[Epilogue]">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="인사이트 검색..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-500">
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">
                notifications
              </span>
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">
                help_outline
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">
                  관리자
                </p>
                <p className="text-xs text-slate-500">최고 관리자</p>
              </div>
              <img
                src={ADMIN_AVATAR}
                alt="Admin"
                className="w-10 h-10 rounded-full border-2 border-primary/20"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="pt-24 px-8 pb-12">
          <div className="mb-8">
            <h2 className="font-[Epilogue] text-2xl font-semibold text-slate-900">
              {activeTab === '대시보드' && '대시보드 인사이트'}
              {activeTab === '리뷰' && '리뷰 관리'}
              {activeTab === '식당' && '식당 관리'}
              {activeTab === '유저' && '유저 관리'}
              {!['대시보드', '리뷰', '식당', '유저'].includes(activeTab) &&
                activeTab}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === '대시보드' &&
                'Foodiest의 실시간 지표와 인사이트를 확인하세요.'}
              {activeTab === '리뷰' &&
                '전체 리뷰를 조회하고 삭제할 수 있습니다.'}
              {activeTab === '식당' &&
                '식당을 조회·추가·수정·삭제하고 이벤트 상태를 관리합니다.'}
              {activeTab === '유저' &&
                '전체 유저를 조회하고 계정을 삭제할 수 있습니다.'}
            </p>
          </div>

          {activeTab === '대시보드' && <DashboardTab />}
          {activeTab === '리뷰' && <ReviewsTab />}
          {activeTab === '식당' && <RestaurantsTab />}
          {activeTab === '유저' && <UsersTab />}
          {!['대시보드', '리뷰', '식당', '유저'].includes(activeTab) && (
            <div className="py-32 text-center text-slate-300">
              <span className="material-symbols-outlined text-5xl mb-3 block">
                construction
              </span>
              <p className="text-sm">준비 중입니다.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
