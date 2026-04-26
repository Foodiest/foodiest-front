import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, signInWithGoogle } from '../services/authService';
import { loginWithKakao } from '../utils/socialAuth';
import { supabase } from '../lib/supabase';

const BG_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAEESejBsvrAH9V2Hra3qnLCX9NFGZ_dP9UhpxIyuNf-xvfdfX4MCTfK3sdrXGa1Gmaj1c6SRp06N0UIWs6cf2tJNwagmaGY18wxtbl2kkbqb1vy0Xmptj-XGF_h8mY7Qv3PbgbC_rKhffxMK0mh3jEauWglbpd65SXRqg-z3h5JryQ5uO0wfTQm_QMVz8eWExDBMzT-W3UipHgCcSiaOb8PWslKC6EeSzARN5Dd7hME0EJhAwAJSlZWVv7Va_UFfPgxOhPjruPu8LB";
const GOOGLE_LOGO = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // identifier가 이메일이 아닌 경우 users 테이블에서 이메일 조회
      let email = identifier;
      if (!identifier.includes('@')) {
        const { data } = await supabase
          .from('users')
          .select('email')
          .eq('user_id', identifier)
          .single();
        if (!data) {
          setError('아이디 또는 비밀번호가 올바르지 않습니다.');
          return;
        }
        email = data.email;
      }
      await signIn({ email, password });
      navigate('/');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        setError('아이디/이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (msg.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 가입 시 받은 이메일을 확인해주세요.');
      } else {
        setError(msg || '로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithGoogle();
      // OAuth redirect — 이후 AuthContext가 세션을 감지
    } catch (err) {
      setError(err.message || '구글 로그인에 실패했습니다.');
    }
  };

  const handleKakaoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const socialUser = await loginWithKakao();
      // Kakao 유저 정보로 Supabase 이메일 로그인 시도, 없으면 회원가입 유도
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: socialUser.email,
        password: `kakao_${socialUser.socialId}`,
      });
      if (signInErr) {
        // 미가입 유저 — 소셜 정보를 임시 저장 후 회원가입 플로우로
        localStorage.setItem('socialSignupTemp', JSON.stringify(socialUser));
        navigate('/signup');
      } else if (data.session) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || '카카오 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 flex items-center justify-between px-6 py-4 shadow-sm font-[Epilogue]">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900">Foodiest</Link>
        <div className="text-slate-500 text-sm font-medium cursor-pointer hover:bg-slate-50 px-3 py-1 rounded-lg">도움말</div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 mt-16">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden">
          {/* Visual Panel */}
          <div
            className="hidden md:block relative bg-cover bg-center"
            style={{ backgroundImage: `url(${BG_IMG})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-10 text-white">
              <h2 className="font-[Epilogue] text-4xl font-bold mb-2">전문 컨시어지</h2>
              <p className="text-lg opacity-90 max-w-xs">데이터 기반으로 당신의 입맛에 맞춘 다이닝 경험.</p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="font-[Epilogue] text-3xl font-semibold text-on-surface mb-1">다시 오셨군요</h1>
              <p className="text-base text-on-surface-variant">나의 맛집 인사이트와 즐겨찾기를 확인하세요.</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="block font-semibold text-sm text-on-surface-variant px-1">아이디/이메일</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary-container text-base"
                    placeholder="chef.jane@example.com"
                    type="text"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="font-semibold text-sm text-on-surface-variant">비밀번호</label>
                  <a href="#" className="text-xs text-secondary hover:underline">비밀번호를 잊으셨나요?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary-container text-base"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container text-white py-4 rounded-lg font-[Epilogue] font-semibold flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? '로그인 중...' : '로그인'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-surface-variant flex-1"></div>
              <span className="text-xs font-medium text-outline">또는 소셜 계정으로</span>
              <div className="h-px bg-surface-variant flex-1"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-lg font-semibold text-sm hover:bg-surface-container-high transition-colors active:scale-95"
              >
                <img src={GOOGLE_LOGO} alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button
                type="button"
                onClick={handleKakaoLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 bg-[#FEE500] text-[#191919] rounded-lg font-semibold text-sm hover:brightness-95 transition-colors active:scale-95 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-sm">chat_bubble</span>
                Kakao
              </button>
            </div>

            <p className="mt-6 text-center text-base text-on-surface-variant">
              처음 오셨나요?{' '}
              <Link to="/signup" className="text-primary-container font-semibold hover:underline ml-1">회원가입</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
