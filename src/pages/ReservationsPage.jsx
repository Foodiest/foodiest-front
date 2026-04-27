import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getMyReservations, cancelReservation } from '../services/reservationService';
import { cuisineMap } from '../data/mockFilters';
import defaultRestaurantImg from '../assets/default-restaurant.svg';

const STATUS_LABEL = { pending: '대기 중', confirmed: '확정', cancelled: '취소됨' };
const STATUS_COLOR = {
  pending: 'bg-amber-50 text-amber-600 border border-amber-200',
  confirmed: 'bg-green-50 text-green-600 border border-green-200',
  cancelled: 'bg-slate-100 text-slate-400 border border-slate-200',
};

export default function ReservationsPage() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) { navigate('/login'); return; }
    getMyReservations()
      .then(setReservations)
      .finally(() => setLoading(false));
  }, [isLoggedIn, isLoading, navigate]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-[Epilogue] text-3xl font-bold">예약 내역</h1>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20 text-slate-400">
            <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
            불러오는 중...
          </div>
        )}

        {!loading && reservations.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 block">event_busy</span>
            <p className="text-lg font-medium mb-1">예약 내역이 없습니다.</p>
            <p className="text-sm mb-6">원하는 식당을 찾아 예약해보세요.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            >
              식당 탐색하기
            </button>
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <div className="space-y-4">
            {reservations.map(r => {
              const dateObj = new Date(r.date + 'T00:00:00');
              const dateStr = dateObj.toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
              });
              const canCancel = r.status === 'pending' || r.status === 'confirmed';
              return (
                <div key={r.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex gap-4">
                  <div
                    className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/restaurant/${r.restaurant_id}`)}
                  >
                    <img
                      src={r.restaurants?.image || defaultRestaurantImg}
                      alt={r.restaurants?.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src = defaultRestaurantImg; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className="font-semibold text-base text-slate-900 cursor-pointer hover:text-primary transition-colors truncate"
                        onClick={() => navigate(`/restaurant/${r.restaurant_id}`)}
                      >
                        {r.restaurants?.name || '식당'}
                      </h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLOR[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {cuisineMap[r.restaurants?.cuisine] || r.restaurants?.cuisine}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-400">calendar_month</span>
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                        {r.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-400">group</span>
                        {r.party_size}명
                      </span>
                    </div>
                  </div>
                  {canCancel && (
                    <div className="flex items-end flex-shrink-0">
                      <button
                        onClick={() => handleCancel(r.id)}
                        disabled={cancelling === r.id}
                        className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {cancelling === r.id ? '취소 중...' : '예약 취소'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
