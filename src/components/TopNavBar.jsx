import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoUrl from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/authService';
import { getMyNotifications, markAllAsRead } from '../services/notificationService';
import { supabase } from '../lib/supabase';

const LOGO_URL = logoUrl;

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function TopNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: '탐색' },
    { to: '/saved', label: '저장', requireAuth: true },
    ...(isAdmin ? [{ to: '/admin', label: '분석' }] : []),
  ];

  const handleNavClick = (e, link) => {
    if (link.requireAuth && !isLoggedIn) {
      e.preventDefault();
      navigate('/login');
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await getMyNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (e) {
      console.error('알림 조회 실패:', e);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 실시간 알림 구독
  useEffect(() => {
    if (!isLoggedIn || !profile) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => fetchNotifications(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [isLoggedIn, profile, fetchNotifications]);

  const handleNotifOpen = async () => {
    setNotifOpen((prev) => {
      if (!prev) {
        // 열릴 때 읽음 처리
        if (unreadCount > 0) {
          markAllAsRead()
            .then(() => {
              setUnreadCount(0);
              setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            })
            .catch(() => {});
        }
      }
      return !prev;
    });
  };

  // 프로필 메뉴 외부 클릭 닫기
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // 알림 패널 외부 클릭 닫기
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto font-[Epilogue] antialiased">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Foodiest Logo" className="h-16 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link)}
                className={`font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-orange-600 font-bold border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* 알림 버튼 */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleNotifOpen}
                  className="relative active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-gray-600">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-slate-800">알림</h4>
                      {notifications.length > 0 && (
                        <span className="text-xs text-slate-400">{notifications.length}개</span>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-slate-400">
                          <span className="material-symbols-outlined text-3xl mb-2 block">notifications_off</span>
                          <p className="text-xs">새로운 알림이 없습니다</p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const fromUser = n.from_user;
                          const initials = fromUser?.nickname?.slice(0, 2).toUpperCase() || '?';
                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (fromUser?.user_id) navigate(`/mypage/${fromUser.user_id}`);
                                setNotifOpen(false);
                              }}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!n.is_read ? 'bg-orange-50/50' : ''}`}
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                                {fromUser?.profile_image
                                  ? <img src={fromUser.profile_image} alt={fromUser.nickname} className="w-full h-full object-cover" />
                                  : <span>{initials}</span>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-800">
                                  <span className="font-semibold">{fromUser?.nickname || '누군가'}</span>
                                  {n.type === 'follow' && '님이 팔로우를 시작했습니다.'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                              </div>
                              {!n.is_read && (
                                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 프로필 버튼 + 플로팅 메뉴 */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-gray-600">account_circle</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
                    <Link
                      to={profile?.user_id ? `/mypage/${profile.user_id}` : '/mypage'}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">person</span>
                      마이페이지
                    </Link>
                    <Link
                      to="/edit-profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-t border-slate-50"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      기본 정보 수정
                    </Link>
                    <Link
                      to="/reservations"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-t border-slate-50"
                    >
                      <span className="material-symbols-outlined text-sm">calendar_month</span>
                      예약 정보 조회
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors active:scale-95"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors active:scale-95"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
