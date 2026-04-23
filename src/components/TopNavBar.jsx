import { Link, useLocation, useNavigate } from 'react-router-dom';

const LOGO_URL = "https://lh3.googleusercontent.com/aida/ADBb0ui3TDTpTeFMuqXORvtln5ch7904DywC7IySsW8ACfAhikZiX-XCHWeOZX5nhAuUbaVvf414JmXvTp1UQZ60cCLE_bnd5698IHAw2Tg4zMzXP43lRA9Z0A9Vx80KvxEFOv_TdXR6Yjh_-85CLl6vREjQErp9l9FBUNe7XDa_D5KS11KGWgKyYI1EIiN8keoUzfF78HfhR6Ps5aR6-W4v3eqhSA0c5uwWLD1ZuzhgYDuS2wiCYQyVKDmh0kg";

export default function TopNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Explore' },
    { to: '/saved', label: 'Saved' },
    { to: '/collections', label: 'Collections' },
    { to: '/admin', label: 'Analytics' },
  ];

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto font-[Epilogue] antialiased">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Foodiest Logo" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-black tracking-tight text-orange-600">Foodiest</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-orange-600 font-bold border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <button className="active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-gray-600">notifications</span>
              </button>
              <Link to="/mypage" className="active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-gray-600">account_circle</span>
              </Link>
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
