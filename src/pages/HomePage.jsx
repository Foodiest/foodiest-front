import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

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
        reject(
          new Error(
            'Kakao SDK loaded but map object is unavailable. Check app key and allowed web domain.'
          )
        );
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => reject(new Error('Failed to load Kakao Map SDK.'));
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
  className,
}) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    let isUnmounted = false;

    loadKakaoMapSdk()
      .then((kakao) => {
        if (isUnmounted || !mapElRef.current) {
          return;
        }

        const firstRestaurant = restaurants[0];
        const center = new kakao.maps.LatLng(
          firstRestaurant.y,
          firstRestaurant.x
        );
        const map = new kakao.maps.Map(mapElRef.current, {
          center,
          level: 4,
        });
        mapRef.current = map;

        markersRef.current = restaurants.map((restaurant) => {
          const marker = new kakao.maps.Marker({
            map,
            position: new kakao.maps.LatLng(restaurant.y, restaurant.x),
            clickable: true,
          });

          kakao.maps.event.addListener(marker, 'click', () =>
            onSelectRestaurant(restaurant.id)
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
      mapRef.current = null;
    };
  }, [onSelectRestaurant, restaurants]);

  useEffect(() => {
    if (!window.kakao?.maps || !mapRef.current || !selectedRestaurantId) {
      return;
    }

    const selected = restaurants.find(
      (restaurant) => restaurant.id === selectedRestaurantId
    );
    if (!selected) {
      return;
    }

    const selectedLatLng = new window.kakao.maps.LatLng(selected.y, selected.x);
    mapRef.current.panTo(selectedLatLng);

    markersRef.current.forEach(({ id, marker }) => {
      marker.setZIndex(id === selectedRestaurantId ? 10 : 1);
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

const restaurants = [
  {
    id: 1,
    name: "L'Anima Trattoria",
    match: 98,
    rating: 4.9,
    cuisine: 'Italian',
    price: '$$$',
    distance: '0.4 miles away',
    badge: '푸슐랭 가이드',
    event: '리뷰 이벤트',
    tags: ['Exquisite Truffle Pasta', 'Quiet Atmosphere'],
    note: 'Limited seating',
    quote:
      '"The portion sizes were generous and the waitstaff was incredibly attentive."',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3',
    vibes: ['Quiet', 'Romantic'],
    flavors: ['Savory Classics', 'Umami & Rich'],
    dietary: ['Gluten-free', 'Nut-free'],
    x: 126.9784,
    y: 37.5665,
  },
  {
    id: 2,
    name: 'Zenith Sushi',
    match: 92,
    rating: 4.7,
    cuisine: 'Japanese',
    price: '$$$$',
    distance: '1.2 miles away',
    badge: '푸슐랭 가이드',
    event: '리뷰 이벤트',
    tags: ['Freshest Sashimi'],
    note: 'Pricey but worth it',
    quote: '"A true masterclass in minimalist dining and flavor balance."',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzUfzwLMQ32xHuDnvGV8J-QyTSOpMJNoPibvjsKk4axh9rixwT76n_RYoOqNt5eZNeYE1qHOF1RPhacE3sZyr-fZ6gpQAA7yx-7iVv0gtkekzaTYYsjwA1EfMMsygdrWrGxN3tbbRhFn2U3OborWQk9oeupPUufCk29ggypT949zsz-p15VtMWsJFiXG0WsVDEtsfUyayadS-l9pfC7Iu1VYfLTMxB507nBBwePxJ-kZIuYkZGZuv65aO1pptr4yxfBjFKg_ET7GDd',
    vibes: ['Quiet', 'Professional'],
    flavors: ['Umami & Rich', 'Savory Classics'],
    dietary: ['Gluten-free', 'Dairy-free'],
    x: 127.0495,
    y: 37.5172,
  },
  {
    id: 3,
    name: 'Spice Garden',
    match: 85,
    rating: 4.5,
    cuisine: 'Indian',
    price: '$$',
    distance: '0.8 miles away',
    badge: '푸슐랭 가이드',
    event: '리뷰 이벤트',
    tags: ['Authentic Curry', 'Vibrant Flavors'],
    note: 'Great for groups',
    quote:
      '"Bold spices and a lively atmosphere — an unforgettable experience."',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3',
    vibes: ['Lively', 'Social'],
    flavors: ['Spicy & Bold', 'Savory Classics'],
    dietary: ['Vegan', 'Vegetarian'],
    x: 126.9219,
    y: 37.5563,
  },
  {
    id: 4,
    name: 'Sweet Bliss Patisserie',
    match: 78,
    rating: 4.6,
    cuisine: 'French',
    price: '$$',
    distance: '1.5 miles away',
    badge: '푸슐랭 가이드',
    event: '리뷰 이벤트',
    tags: ['Handcrafted Desserts', 'Cozy Setting'],
    note: 'Perfect for dates',
    quote: '"Every bite felt like a little moment of joy."',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzUfzwLMQ32xHuDnvGV8J-QyTSOpMJNoPibvjsKk4axh9rixwT76n_RYoOqNt5eZNeYE1qHOF1RPhacE3sZyr-fZ6gpQAA7yx-7iVv0gtkekzaTYYsjwA1EfMMsygdrWrGxN3tbbRhFn2U3OborWQk9oeupPUufCk29ggypT949zsz-p15VtMWsJFiXG0WsVDEtsfUyayadS-l9pfC7Iu1VYfLTMxB507nBBwePxJ-kZIuYkZGZuv65aO1pptr4yxfBjFKg_ET7GDd',
    vibes: ['Romantic', 'Family Friendly'],
    flavors: ['Sweet Treats'],
    dietary: ['Nut-free', 'Vegan'],
    x: 126.9887,
    y: 37.5720,
  },
  {
    id: 5,
    name: 'The Boardroom Grill',
    match: 88,
    rating: 4.8,
    cuisine: 'American',
    price: '$$$$',
    distance: '0.6 miles away',
    badge: '푸슐랭 가이드',
    event: '리뷰 이벤트',
    tags: ['Prime Steak', 'Private Dining'],
    note: 'Business friendly',
    quote: '"Impeccable service and a menu that impresses every client."',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3',
    vibes: ['Professional', 'Quiet'],
    flavors: ['Savory Classics', 'Umami & Rich'],
    dietary: ['Keto', 'Gluten-free'],
    x: 127.0276,
    y: 37.4979,
  },
];

const vibes = [
  'Quiet',
  'Lively',
  'Romantic',
  'Social',
  'Professional',
  'Family Friendly',
];
const flavors = [
  'Spicy & Bold',
  'Sweet Treats',
  'Umami & Rich',
  'Savory Classics',
];
const dietary = [
  'Nut-free',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Vegetarian',
  'Keto',
];

export default function HomePage() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const [selectedVibes, setSelectedVibes] = useState(currentUser?.vibes ?? []);
  const [selectedFlavors, setSelectedFlavors] = useState(
    currentUser?.flavors ?? []
  );
  const [selectedDietary, setSelectedDietary] = useState(
    currentUser?.dietary ?? []
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    restaurants[0]?.id ?? null
  );
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const toggle = (list, setList, item) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((r) => {
        const q = searchQuery.toLowerCase();
        const searchMatch =
          q === '' ||
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q));
        const vibeMatch =
          selectedVibes.length === 0 ||
          selectedVibes.every((v) => r.vibes.includes(v));
        const flavorMatch =
          selectedFlavors.length === 0 ||
          selectedFlavors.every((f) => r.flavors.includes(f));
        const dietaryMatch =
          selectedDietary.length === 0 ||
          selectedDietary.every((d) => r.dietary.includes(d));
        return searchMatch && vibeMatch && flavorMatch && dietaryMatch;
      }),
    [searchQuery, selectedVibes, selectedFlavors, selectedDietary]
  );

  const effectiveSelectedRestaurantId = useMemo(() => {
    if (filteredRestaurants.some((r) => r.id === selectedRestaurantId)) {
      return selectedRestaurantId;
    }
    return filteredRestaurants[0]?.id ?? null;
  }, [filteredRestaurants, selectedRestaurantId]);

  const selectedRestaurant = useMemo(
    () =>
      filteredRestaurants.find(
        (restaurant) => restaurant.id === effectiveSelectedRestaurantId
      ) ?? null,
    [filteredRestaurants, effectiveSelectedRestaurantId]
  );

  const handleGoToRestaurantDetail = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
    // Ensure the destination page starts from the top after route transition.
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover brightness-[0.4]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjnSNSUq_xXudKrikcaFzx70_v71o1kWer-PwaYc0UklahfJ8l9BiLsPB4boF6nwlUFZ6rIi9OtAHiQ4aUDBxv7igyY1sHFKeUy0NzNCfmfR94Ma82miM-5A7wT__30O7ysbuk9LlI2mQdno_VZNNClcjJyjCzsTwM3P_a_Mi3E38q0UpVx3ayhgZT9jpR31r2UbTu1MBtid8LEx_qBsqUU3PhB7taUQMRptzp56Iss_GdkLkaLIjPaPVmDfpf5Xfld_DbvQPRpWvx"
            alt="hero"
          />
        </div>
        <div className="relative z-10 w-full max-w-4xl px-6 text-center">
          <h1 className="font-[Epilogue] text-[48px] font-bold leading-tight text-white mb-4">
            Precision Dining for the Discerning Palate
          </h1>
          <p className="text-white/90 text-lg mb-8">
            AI-driven insights mapped to your personal taste profile.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-xl shadow-xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 border-r border-slate-100">
              <span className="material-symbols-outlined text-secondary mr-2">
                search
              </span>
              <input
                className="w-full border-none focus:ring-0 text-base py-3 outline-none"
                placeholder="Cuisine, restaurant, or keyword..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-primary-container text-white font-semibold px-8 py-3 rounded-lg hover:brightness-110 transition-all active:scale-95">
              Find Restaurants
            </button>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  mood
                </span>
                Vibe
              </h3>
              <div className="flex flex-wrap gap-2">
                {vibes.map((v) => (
                  <button
                    key={v}
                    onClick={() => toggle(selectedVibes, setSelectedVibes, v)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedVibes.includes(v)
                        ? 'border-orange-100 bg-orange-50 text-orange-600'
                        : 'border-slate-200 text-slate-600 hover:border-orange-200'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  restaurant_menu
                </span>
                Flavor Profile
              </h3>
              <div className="flex flex-wrap gap-2">
                {flavors.map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      toggle(selectedFlavors, setSelectedFlavors, f)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedFlavors.includes(f)
                        ? 'border-orange-100 bg-orange-50 text-orange-600'
                        : 'border-slate-200 text-slate-600 hover:border-orange-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">
                  medical_services
                </span>
                Dietary Needs
              </h3>
              <div className="flex flex-wrap gap-2">
                {dietary.map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      toggle(selectedDietary, setSelectedDietary, d)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedDietary.includes(d)
                        ? 'border-orange-100 bg-orange-50 text-orange-600'
                        : 'border-slate-200 text-slate-600 hover:border-orange-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results + Map */}
      <section className="max-w-screen-xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Results */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-[Epilogue] text-2xl font-semibold text-on-surface">
                Recommended for You
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {filteredRestaurants.length} result
                {filteredRestaurants.length !== 1 ? 's' : ''} matching your
                filters
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {filteredRestaurants.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 block">
                  search_off
                </span>
                <p className="font-medium">
                  No restaurants match the selected filters.
                </p>
                <p className="text-sm mt-1">
                  Try adjusting your vibe, taste, or dietary preferences.
                </p>
              </div>
            )}
            {filteredRestaurants.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRestaurantId(r.id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col md:flex-row h-auto md:h-64"
              >
                <div className="md:w-1/3 relative">
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {r.match}% Match
                  </div>
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-[Epilogue] text-xl font-semibold">
                        {r.name}
                      </h3>
                      <div className="flex items-center text-tertiary">
                        <span
                          className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-semibold text-sm ml-1">
                          {r.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white shadow-sm uppercase">
                        <span
                          className="material-symbols-outlined text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          military_tech
                        </span>
                        {r.badge}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase">
                        <span className="material-symbols-outlined text-[12px]">
                          priority_high
                        </span>
                        {r.event}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mb-3">
                      {r.cuisine} • {r.price} • {r.distance}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {r.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full text-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">
                            auto_awesome
                          </span>
                          {tag}
                        </span>
                      ))}
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs">
                        {r.note}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.vibes.map((v) => (
                        <span
                          key={v}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                            selectedVibes.includes(v)
                              ? 'bg-indigo-500 text-white border-indigo-500'
                              : 'bg-indigo-50 text-indigo-500 border-indigo-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            mood
                          </span>
                          {v}
                        </span>
                      ))}
                      {r.flavors.map((f) => (
                        <span
                          key={f}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                            selectedFlavors.includes(f)
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-amber-50 text-amber-500 border-amber-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            restaurant_menu
                          </span>
                          {f}
                        </span>
                      ))}
                      {r.dietary.map((d) => (
                        <span
                          key={d}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                            selectedDietary.includes(d)
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-green-50 text-green-600 border-green-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            eco
                          </span>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="text-slate-600 text-sm italic truncate max-w-[60%]">
                      {r.quote}
                    </span>
                    <button
                      onClick={() => handleGoToRestaurantDetail(r.id)}
                      className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all ml-3 flex-shrink-0"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Local View</h3>
              <button
                type="button"
                onClick={() => setIsMapExpanded(true)}
                className="text-primary text-xs cursor-pointer font-medium"
              >
                Expand Map
              </button>
            </div>
            <KakaoMapView
              className="h-72"
              restaurants={filteredRestaurants}
              selectedRestaurantId={effectiveSelectedRestaurantId}
              onSelectRestaurant={setSelectedRestaurantId}
            />
            <div className="p-5">
              {selectedRestaurant && (
                <p className="text-xs text-slate-500 mb-3">
                  Selected:{' '}
                  <span className="font-semibold text-slate-700">
                    {selectedRestaurant.name}
                  </span>
                </p>
              )}
              <h4 className="font-semibold text-sm mb-3">Nearby Favorites</h4>
              <div className="space-y-3">
                {[
                  {
                    name: 'The Daily Grind',
                    sub: '0.2 miles • Coffee',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6KO-M3xKogRmdAQc3tuFwF0Ifa-4Nvv0FB2agawLXLE4kt5hZG_SfvdzLPpMMODoZVDnZSzHdCxZV-wCUEzqiNZ2ZCZmYRnZuViu--wwHNbgbO92n9Dwr2nJf64hl3ZsOPgI44wxFUBJkg6UrnZ7r3jU3BPR7aG-RACAXhwQNRysAfF6Oe9IeosgimB0djze3lxIN1E23RY7zR7xvNRs3y4MFCtk2CzucuOpw3Tbl0lv_YMA3hGs3iWzsjQvrz3MqasK1TnqLpRf5',
                  },
                  {
                    name: 'Taco Theory',
                    sub: '0.5 miles • Mexican',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHmDnYklZfS2ovFicfL3qOTQgj0DGWejlakVViEcksvnKsVjtdJ3mPWYvZV6ycd5Ggy-_QJ7Fx69dEAtecAM7bQT1FBDND4SUGMQ8GnXezodjCHiPwxYusXpPQ-3uF9C6BVglpIsSdgNd98DARCu6s1pzD2LFvmFA9XyiRLrAsGvR5dhk7-FCvFMifTQrF03fQpmbfg02bChaqCSDVaNs6WpRxt2ji4LBBhP6W4vl9Fr9gQsAjlU-Nm5XThu_e0OK9wENkvjBibqo3',
                  },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
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
              event.key === 'Escape' ||
              event.key === 'Enter' ||
              event.key === ' '
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
              <h3 className="font-semibold text-base">Expanded Local View</h3>
              <button
                type="button"
                onClick={() => setIsMapExpanded(false)}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium"
              >
                Close
              </button>
            </div>
            <KakaoMapView
              className="h-full min-h-[420px]"
              restaurants={filteredRestaurants}
              selectedRestaurantId={effectiveSelectedRestaurantId}
              onSelectRestaurant={setSelectedRestaurantId}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
