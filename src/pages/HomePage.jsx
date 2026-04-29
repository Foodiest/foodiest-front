import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getAll } from "../services/restaurantService";
import { vibes, flavors, dietary, filterLabelMap, cuisineMap } from "../data/mockFilters";
import defaultRestaurantImg from "../assets/default-restaurant.svg";

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function RestaurantCard({ r, selectedVibes, selectedFlavors, selectedDietary, onSelect, onDetail }) {
  const allImgs = [r.image, ...(r.sub_images || [])].filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);

  const prev = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i - 1 + allImgs.length) % allImgs.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i + 1) % allImgs.length);
  };

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col md:flex-row w-full md:h-[19rem]"
    >
      <div className="md:w-1/3 min-w-0 relative h-48 md:h-full flex-shrink-0">
        <img
          src={allImgs[imgIdx] || defaultRestaurantImg}
          alt={r.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }}
        />
        {allImgs.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {allImgs.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
        {r.match !== null && (
          <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {r.match}% 매칭
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 md:w-2/3 flex flex-col justify-between min-h-0">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-[Epilogue] text-xl font-semibold">{r.name}</h3>
            <div className="flex items-center text-tertiary">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: r.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
              <span className="font-semibold text-sm ml-1">{r.rating ?? '0.0'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {r.badge?.includes('푸슐랭') && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white shadow-sm uppercase">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                {r.badge}
              </span>
            )}
            {r.event && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase">
                <span className="material-symbols-outlined text-[12px]">priority_high</span>
                {r.event}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mb-3">{cuisineMap[r.cuisine] || r.cuisine}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {(r.tags || []).map((tag) => (
              <span key={tag} className="bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(r.vibes || []).map((v) => (
              <span key={v} className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${selectedVibes.includes(v) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-50 text-indigo-500 border-indigo-100'}`}>
                <span className="material-symbols-outlined text-[12px]">mood</span>
                {filterLabelMap[v] || v}
              </span>
            ))}
            {(r.flavors || []).map((f) => (
              <span key={f} className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${selectedFlavors.includes(f) ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-500 border-amber-100'}`}>
                <span className="material-symbols-outlined text-[12px]">restaurant_menu</span>
                {filterLabelMap[f] || f}
              </span>
            ))}
            {(r.dietary || []).map((d) => (
              <span key={d} className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${selectedDietary.includes(d) ? 'bg-green-500 text-white border-green-500' : 'bg-green-50 text-green-600 border-green-100'}`}>
                <span className="material-symbols-outlined text-[12px]">eco</span>
                {filterLabelMap[d] || d}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
          <span className="text-slate-600 text-sm italic truncate max-w-[60%]">{r.quote}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDetail(); }}
            className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all ml-3 flex-shrink-0"
          >
            상세보기
          </button>
        </div>
      </div>
    </div>
  );
}

function calcMatch(restaurant, userVibes, userFlavors, userDietary) {
  const total = userVibes.length + userFlavors.length + userDietary.length;
  if (total === 0) return null;
  const matched =
    userVibes.filter((v) => restaurant.vibes?.includes(v)).length +
    userFlavors.filter((f) => restaurant.flavors?.includes(f)).length +
    userDietary.filter((d) => restaurant.dietary?.includes(d)).length;
  return Math.round((matched / total) * 100);
}

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
let kakaoScriptPromise = null;

const loadKakaoMapSdk = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao map is only available in browser."));
  }

  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao);
  }

  if (kakaoScriptPromise) {
    return kakaoScriptPromise;
  }

  kakaoScriptPromise = new Promise((resolve, reject) => {
    if (!KAKAO_APP_KEY) {
      reject(new Error("Missing VITE_KAKAO_MAP_APP_KEY environment variable."));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(
          new Error(
            "Kakao SDK loaded but map object is unavailable. Check app key and allowed web domain.",
          ),
        );
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => reject(new Error("Failed to load Kakao Map SDK."));
    document.head.appendChild(script);
  });

  kakaoScriptPromise = kakaoScriptPromise.catch((error) => {
    kakaoScriptPromise = null;
    throw error;
  });

  return kakaoScriptPromise;
};

function KakaoMapView({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
  userLocation,
  className,
}) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const selectedOverlayRef = useRef(null);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let isUnmounted = false;

    loadKakaoMapSdk()
      .then((kakao) => {
        if (isUnmounted || !mapElRef.current) {
          return;
        }

        const firstWithCoords = restaurants.find((r) => r.x && r.y);
        const initialLat = userLocation ? userLocation.lat : firstWithCoords?.y;
        const initialLng = userLocation ? userLocation.lng : firstWithCoords?.x;
        if (!initialLat || !initialLng) return;
        const center = new kakao.maps.LatLng(initialLat, initialLng);
        const map = new kakao.maps.Map(mapElRef.current, {
          center,
          level: 4,
        });
        mapRef.current = map;

        if (userLocation) {
          const userPos = new kakao.maps.LatLng(userLocation.lat, userLocation.lng);
          const userOverlay = new kakao.maps.CustomOverlay({
            position: userPos,
            content: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px #3b82f6aa;"></div>`,
            zIndex: 20,
          });
          userOverlay.setMap(map);
          userMarkerRef.current = userOverlay;
        }

        markersRef.current = restaurants
          .filter((restaurant) => restaurant.x && restaurant.y)
          .map((restaurant) => {
            const marker = new kakao.maps.Marker({
              map,
              position: new kakao.maps.LatLng(restaurant.y, restaurant.x),
              clickable: true,
            });

            kakao.maps.event.addListener(marker, "click", () =>
              onSelectRestaurant(restaurant.id),
            );
            return { id: restaurant.id, marker };
          });
      })
      .catch((error) => {
        if (!isUnmounted) {
          setMapError(error.message);
        }
      });

    return () => {
      isUnmounted = true;
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      if (selectedOverlayRef.current) {
        selectedOverlayRef.current.setMap(null);
        selectedOverlayRef.current = null;
      }
      mapRef.current = null;
    };
  }, [onSelectRestaurant, restaurants, userLocation]);

  useEffect(() => {
    if (!window.kakao?.maps || !mapRef.current || !selectedRestaurantId) {
      return;
    }

    const selected = restaurants.find(
      (restaurant) => restaurant.id === selectedRestaurantId,
    );
    if (!selected || !selected.x || !selected.y) {
      return;
    }

    const selectedLatLng = new window.kakao.maps.LatLng(selected.y, selected.x);
    mapRef.current.panTo(selectedLatLng);

    // 기존 강조 오버레이 제거
    if (selectedOverlayRef.current) {
      selectedOverlayRef.current.setMap(null);
    }

    // 선택된 식당 위치에 강조 오버레이 표시
    const content = `
      <div style="
        position:relative;
        display:flex;
        flex-direction:column;
        align-items:center;
        transform:translateY(-100%);
      ">
        <div style="
          background:#f97316;
          color:white;
          font-size:11px;
          font-weight:700;
          padding:4px 8px;
          border-radius:8px;
          white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          max-width:120px;
          overflow:hidden;
          text-overflow:ellipsis;
        ">${selected.name}</div>
        <div style="
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid #f97316;
        "></div>
        <div style="
          width:10px;height:10px;border-radius:50%;
          background:#f97316;
          border:2px solid white;
          box-shadow:0 0 0 2px #f97316;
          margin-top:-2px;
        "></div>
      </div>
    `;
    selectedOverlayRef.current = new window.kakao.maps.CustomOverlay({
      position: selectedLatLng,
      content,
      zIndex: 20,
    });
    selectedOverlayRef.current.setMap(mapRef.current);

    // 일반 마커는 z-index만 조정
    markersRef.current.forEach(({ id, marker }) => {
      marker.setZIndex(id === selectedRestaurantId ? 5 : 1);
    });
  }, [restaurants, selectedRestaurantId]);

  if (restaurants.length === 0) {
    return (
      <div
        className={`${className} w-full bg-slate-50 flex items-center justify-center text-slate-400 text-sm`}
      >
        표시할 식당이 없습니다.
      </div>
    );
  }

  if (mapError) {
    return (
      <div
        className={`${className} w-full bg-slate-100 flex items-center justify-center px-4 text-center text-sm text-red-500`}
      >
        {mapError}
      </div>
    );
  }

  return <div ref={mapElRef} className={`${className} w-full`} />;
}

export default function HomePage() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getAll()
      .then(setRestaurants)
      .finally(() => setLoadingRestaurants(false));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  const toggle = (list, setList, item) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return restaurants
      .filter((r) => {
        const searchMatch =
          q === "" ||
          r.name.toLowerCase().includes(q) ||
          (r.cuisine || "").toLowerCase().includes(q) ||
          (r.tags || []).some((t) => t.toLowerCase().includes(q));
        const vibeMatch =
          selectedVibes.length === 0 ||
          selectedVibes.every((v) => (r.vibes || []).includes(v));
        const flavorMatch =
          selectedFlavors.length === 0 ||
          selectedFlavors.every((f) => (r.flavors || []).includes(f));
        const dietaryMatch =
          selectedDietary.length === 0 ||
          selectedDietary.every((d) => (r.dietary || []).includes(d));
        return searchMatch && vibeMatch && flavorMatch && dietaryMatch;
      })
      .map((r) => ({
        ...r,
        match: calcMatch(r, selectedVibes, selectedFlavors, selectedDietary),
      }));
  }, [restaurants, searchQuery, selectedVibes, selectedFlavors, selectedDietary]);

  const nearbyRestaurants = useMemo(() => {
    if (!userLocation || restaurants.length === 0) return [];
    return [...restaurants]
      .filter((r) => r.x && r.y)
      .map((r) => ({
        ...r,
        distance: calcDistance(userLocation.lat, userLocation.lng, r.y, r.x),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [restaurants, userLocation]);

  const effectiveSelectedRestaurantId = useMemo(() => {
    if (filteredRestaurants.some((r) => r.id === selectedRestaurantId)) {
      return selectedRestaurantId;
    }
    return filteredRestaurants[0]?.id ?? null;
  }, [filteredRestaurants, selectedRestaurantId]);

  const selectedRestaurant = useMemo(
    () =>
      filteredRestaurants.find(
        (restaurant) => restaurant.id === effectiveSelectedRestaurantId,
      ) ?? null,
    [filteredRestaurants, effectiveSelectedRestaurantId],
  );

  const handleGoToRestaurantDetail = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
    // Ensure the destination page starts from the top after route transition.
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[280px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover brightness-[0.4]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjnSNSUq_xXudKrikcaFzx70_v71o1kWer-PwaYc0UklahfJ8l9BiLsPB4boF6nwlUFZ6rIi9OtAHiQ4aUDBxv7igyY1sHFKeUy0NzNCfmfR94Ma82miM-5A7wT__30O7ysbuk9LlI2mQdno_VZNNClcjJyjCzsTwM3P_a_Mi3E38q0UpVx3ayhgZT9jpR31r2UbTu1MBtid8LEx_qBsqUU3PhB7taUQMRptzp56Iss_GdkLkaLIjPaPVmDfpf5Xfld_DbvQPRpWvx"
            alt="hero"
          />
        </div>
        <div className="relative z-10 w-full max-w-4xl px-4 md:px-6 text-center">
          <h1 className="font-[Epilogue] text-2xl md:text-[48px] font-bold leading-tight text-white mb-2 md:mb-4">
            나만의 취향에 맞는 정밀한 다이닝
          </h1>
          <p className="text-white/90 text-sm md:text-lg mb-4 md:mb-8">
            AI 기반 인사이트로 나만의 맛집 지도를 완성하세요.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-xl shadow-xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 md:border-r border-slate-100">
              <span className="material-symbols-outlined text-secondary mr-2">
                search
              </span>
              <input
                className="w-full border-none focus:ring-0 text-base py-3 outline-none"
                placeholder="음식 종류, 식당명, 키워드..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-primary-container text-white font-semibold px-8 py-3 rounded-lg hover:brightness-110 transition-all active:scale-95">
              식당 찾기
            </button>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  mood
                </span>
                분위기
              </h3>
              <div className="flex flex-wrap gap-2">
                {vibes.map((v) => (
                  <button
                    key={v.value}
                    onClick={() =>
                      toggle(selectedVibes, setSelectedVibes, v.value)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedVibes.includes(v.value)
                        ? "border-orange-100 bg-orange-50 text-orange-600"
                        : "border-slate-200 text-slate-600 hover:border-orange-200"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  restaurant_menu
                </span>
                맛 프로필
              </h3>
              <div className="flex flex-wrap gap-2">
                {flavors.map((f) => (
                  <button
                    key={f.value}
                    onClick={() =>
                      toggle(selectedFlavors, setSelectedFlavors, f.value)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedFlavors.includes(f.value)
                        ? "border-orange-100 bg-orange-50 text-orange-600"
                        : "border-slate-200 text-slate-600 hover:border-orange-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  medical_services
                </span>
                식이 요건
              </h3>
              <div className="flex flex-wrap gap-2">
                {dietary.map((d) => (
                  <button
                    key={d.value}
                    onClick={() =>
                      toggle(selectedDietary, setSelectedDietary, d.value)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedDietary.includes(d.value)
                        ? "border-orange-100 bg-orange-50 text-orange-600"
                        : "border-slate-200 text-slate-600 hover:border-orange-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results + Map */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-6 pb-16 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Results */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-[Epilogue] text-2xl font-semibold text-on-surface">
                맞춤 추천
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {filteredRestaurants.length}개의 결과
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {loadingRestaurants && (
              <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 block animate-spin">refresh</span>
                <p className="font-medium">식당 목록을 불러오는 중...</p>
              </div>
            )}
            {!loadingRestaurants && filteredRestaurants.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 block">
                  search_off
                </span>
                <p className="font-medium">
                  선택한 필터에 맞는 식당이 없습니다.
                </p>
                <p className="text-sm mt-1">
                  분위기, 맛, 식이 조건을 조정해보세요.
                </p>
              </div>
            )}
            {filteredRestaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                r={r}
                selectedVibes={selectedVibes}
                selectedFlavors={selectedFlavors}
                selectedDietary={selectedDietary}
                onSelect={() => setSelectedRestaurantId(r.id)}
                onDetail={() => handleGoToRestaurantDetail(r.id)}
              />
            ))}
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-sm">주변 지도</h3>
              <button
                type="button"
                onClick={() => setIsMapExpanded(true)}
                className="text-primary text-xs cursor-pointer font-medium"
              >
                지도 확대
              </button>
            </div>
            <KakaoMapView
              className="h-72"
              restaurants={filteredRestaurants}
              selectedRestaurantId={effectiveSelectedRestaurantId}
              onSelectRestaurant={setSelectedRestaurantId}
              userLocation={userLocation}
            />
            <div className="p-5">
              {selectedRestaurant && (
                <p className="text-xs text-slate-500 mb-3">
                  선택됨:{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedRestaurant.name}
                  </span>
                </p>
              )}
              <h4 className="font-semibold text-sm mb-3">주변 음식점</h4>
              <div className="space-y-3">
                {nearbyRestaurants.length === 0 && (
                  <p className="text-xs text-slate-400">
                    {userLocation ? "주변 음식점 데이터가 없습니다." : "위치 권한을 허용하면 주변 음식점을 볼 수 있습니다."}
                  </p>
                )}
                {nearbyRestaurants.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-lg p-1 -mx-1 transition-colors"
                    onClick={() => handleGoToRestaurantDetail(item.id)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={item.image || defaultRestaurantImg}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.distance < 1
                          ? `${Math.round(item.distance * 1000)}m`
                          : `${item.distance.toFixed(1)}km`}{" "}
                        • {cuisineMap[item.cuisine] || item.cuisine}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isMapExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/60 px-4 py-6 md:p-10"
          onClick={() => setIsMapExpanded(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Escape" ||
              event.key === "Enter" ||
              event.key === " "
            ) {
              setIsMapExpanded(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl w-full max-w-6xl h-full max-h-[90vh] mx-auto overflow-hidden shadow-xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-base">지도 확대 보기</h3>
              <button
                type="button"
                onClick={() => setIsMapExpanded(false)}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium"
              >
                닫기
              </button>
            </div>
            <KakaoMapView
              className="h-full min-h-[420px]"
              restaurants={filteredRestaurants}
              selectedRestaurantId={effectiveSelectedRestaurantId}
              onSelectRestaurant={setSelectedRestaurantId}
              userLocation={userLocation}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
