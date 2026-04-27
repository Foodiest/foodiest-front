import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoUrl from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/authService';

const LOGO_URL = logoUrl;

export default function TopNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto font-[Epilogue] antialiased">
        <Link to="/" onClick={() => { window.location.href = '/'; }} className="flex items-center gap-2">
          <img
            src={LOGO_URL}
            alt="Foodiest Logo"
            className="h-16 w-auto object-contain"
          />
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
              <button className="active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-gray-600">
                  notifications
                </span>
              </button>

              {/* 프로필 버튼 + 플로팅 메뉴 */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-gray-600">
                    account_circle
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
                    <Link
                      to={profile?.user_id ? `/mypage/${profile.user_id}` : "/mypage"}
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
