import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import mockUsers from '../data/mockUsers';
import { loginWithKakao, loginWithGoogle } from '../utils/socialAuth';

const BG_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAEESejBsvrAH9V2Hra3qnLCX9NFGZ_dP9UhpxIyuNf-xvfdfX4MCTfK3sdrXGa1Gmaj1c6SRp06N0UIWs6cf2tJNwagmaGY18wxtbl2kkbqb1vy0Xmptj-XGF_h8mY7Qv3PbgbC_rKhffxMK0mh3jEauWglbpd65SXRqg-z3h5JryQ5uO0wfTQm_QMVz8eWExDBMzT-W3UipHgCcSiaOb8PWslKC6EeSzARN5Dd7hME0EJhAwAJSlZWVv7Va_UFfPgxOhPjruPu8LB";
const GOOGLE_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuATt_UcM1PerdrYicyNIsNE3FxcIp_ixHQk-l3BA6QtzILOUkHCwI5aNmHRQu7FG0n_t3E8IVEAUob1k3OCkvxZo1L1Kwegq0y1ZRz-QWGrqlhRJspvTLAs0A0RcQVLOgtaGcBmvTREt1c0KN0tQLzG94x-W6vrF8Dyn7ilkvg62O0e_Khku1_OB5OGwuIqIfqO66S9bQTquNyQDAocnn6E6ISQrIV0y5CehyKzPDSrxeuK76s-8tj1n6kqHxGa2WPR8ghJh30E1nxa";

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const processSocialLogin = (socialUser) => {
    const existing = mockUsers.find(
      u => u.socialId === socialUser.socialId || (socialUser.email && u.email === socialUser.email)
    );

    let userToSave;
    if (existing) {
      const { password: _, ...userWithoutPassword } = existing;
      userToSave = {
        ...userWithoutPassword,
        nickname: socialUser.nickname || userWithoutPassword.nickname,
        profileImage: socialUser.profileImage
      };
    } else {
      // 신규 유저라도 즉시 로그인 정보 생성하여 로컬스토리지에 저장
      userToSave = {
        id: Date.now(),
        userId: socialUser.email.split('@')[0] || `user_${socialUser.socialId.slice(-4)}`,
        nickname: socialUser.nickname,
        email: socialUser.email,
        profileImage: socialUser.profileImage,
        provider: socialUser.provider
      };
    }

    localStorage.setItem('currentUser', JSON.stringify(userToSave));
    localStorage.setItem("currentUserId", userToSave.userId);
    localStorage.setItem("currentUserIdNo", userToSave.id);
    navigate('/');
  };


  const handleSocialLogin = async (loginFn) => {
    try {
      const socialUser = await loginFn();
      processSocialLogin(socialUser);
    } catch (err) {
      setError(err.message || '소셜 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const socialUser = await loginWithGoogle(tokenResponse.access_token);
        processSocialLogin(socialUser);
      } catch (err) {
        setError(err.message || '구글 로그인에 실패했습니다.');
      }
    },
    onError: () => setError('구글 로그인에 실패했습니다.'),
  });


  const handleLogin = e => {
    e.preventDefault();
    const user = mockUsers.find(
      (u) =>
        (u.email === identifier || u.userId === identifier) &&
        u.password === password,
    );
    if (!user) {
      setError("아이디/이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

    // 2. 문자열 ID 저장 (WriteReviewPage 등에서 사용)
    localStorage.setItem("currentUserId", user.userId);

    // 3. 숫자 ID 저장 (MyPage의 핵심 필터링 키)
    localStorage.setItem("currentUserIdNo", user.id);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 flex items-center justify-between px-6 py-4 shadow-sm font-[Epilogue]">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          Foodiest
        </Link>
        <div className="text-slate-500 text-sm font-medium cursor-pointer hover:bg-slate-50 px-3 py-1 rounded-lg">
          Help
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 mt-16">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden">
          {/* Visual Panel */}
          <div
            className="hidden md:block relative bg-cover bg-center"
            style={{ backgroundImage: `url(${BG_IMG})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-10 text-white">
              <h2 className="font-[Epilogue] text-4xl font-bold mb-2">
                The Expert Concierge
              </h2>
              <p className="text-lg opacity-90 max-w-xs">
                Data-driven dining experiences tailored to your sophisticated
                palate.
              </p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="font-[Epilogue] text-3xl font-semibold text-on-surface mb-1">
                Welcome Back
              </h1>
              <p className="text-base text-on-surface-variant">
                Access your culinary insights and favorites.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="block font-semibold text-sm text-on-surface-variant px-1">
                  Username/Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary-container text-base"
                    placeholder="chef.jane@example.com"
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError("");
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="font-semibold text-sm text-on-surface-variant">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-secondary hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary-container text-base"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-primary-container text-white py-4 rounded-lg font-[Epilogue] font-semibold flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Login
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-surface-variant flex-1"></div>
              <span className="text-xs font-medium text-outline">
                OR CONTINUE WITH
              </span>
              <div className="h-px bg-surface-variant flex-1"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => googleLogin()}
                className="flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-lg font-semibold text-sm hover:bg-surface-container-high transition-colors active:scale-95"
              >
                <img src={GOOGLE_LOGO} alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin(loginWithKakao)}
                className="flex items-center justify-center gap-2 py-3 bg-[#FEE500] text-[#191919] rounded-lg font-semibold text-sm hover:brightness-95 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">chat_bubble</span>
                Kakao
              </button>
            </div>

            <p className="mt-6 text-center text-base text-on-surface-variant">
              New to Foodiest?{" "}
              <Link
                to="/signup"
                className="text-primary-container font-semibold hover:underline ml-1"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
