import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getSavedIds, toggleSaved } from '../services/savedService';
import { getAll } from '../services/restaurantService';
import defaultRestaurantImg from '../assets/default-restaurant.svg';
import { cuisineMap } from '../data/mockFilters';

export default function SavedPage() {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const [savedIds, setSavedIds] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);

  useEffect(() => {
    if (!isLoading && !session) navigate('/login');
  }, [isLoading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    getSavedIds().then(setSavedIds);
    getAll().then(setAllRestaurants);
  }, [session]);

  const savedRestaurants = allRestaurants.filter(r => savedIds.includes(r.id));

  const handleUnsave = async (restaurantId) => {
    await toggleSaved(restaurantId);
    setSavedIds(prev => prev.filter(id => id !== restaurantId));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="font-[Epilogue] text-4xl font-bold text-on-surface mb-1">저장한 식당</h1>
          <p className="text-on-surface-variant text-sm">{savedRestaurants.length}개의 저장된 식당</p>
        </div>

        {savedRestaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl text-gray-300">bookmark</span>
            <p className="text-lg font-medium">저장된 식당이 없습니다</p>
            <p className="text-sm">식당 상세 페이지에서 저장 버튼을 눌러 저장해보세요.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
            >
              식당 탐색하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRestaurants.map(restaurant => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                >
                  <img
                    src={restaurant.image || defaultRestaurantImg}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.currentTarget.src = defaultRestaurantImg; }}
                  />
                  {restaurant.badge && (
                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {restaurant.badge}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className="font-[Epilogue] font-bold text-lg text-on-surface cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      {restaurant.name}
                    </h3>
                    <button
                      onClick={() => handleUnsave(restaurant.id)}
                      className="text-primary hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                      title="저장 취소"
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
                    <span className="flex items-center gap-0.5 text-primary font-semibold">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: restaurant.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                      {restaurant.rating || '0.0'}
                    </span>
                    <span>•</span>
                    <span>{cuisineMap[restaurant.cuisine] || restaurant.cuisine}</span>
                    <span>•</span>
                    <span>{restaurant.price}</span>
                  </div>

                  <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">
                    {restaurant.description || restaurant.quote?.replace(/"/g, '') || ''}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(restaurant.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="bg-[#E8EAF6] text-secondary px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
