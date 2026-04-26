import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUpStep1Page() {
  const navigate = useNavigate();
  const socialTemp = JSON.parse(localStorage.getItem('socialSignupTemp') || 'null');
  const isSocial = !!socialTemp;

  const [form, setForm] = useState({
    userId: '',
    nickname: socialTemp?.nickname || '',
    email: socialTemp?.email || '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [showPw, setShowPw] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 4;
  const pwMatch = form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white fixed top-0 w-full z-50 border-b border-slate-100 shadow-sm flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-bold tracking-tight text-on-surface font-[Epilogue]">Foodiest</Link>
        <button className="text-slate-500 text-sm font-medium hover:bg-slate-50 px-3 py-2 rounded-lg">도움말</button>
      </header>

      <main className="flex-grow pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-xl w-full">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h1 className="font-[Epilogue] text-2xl font-semibold text-on-surface">회원가입</h1>
                <p className="text-sm text-on-surface-variant">1단계 / 2: 계정 정보</p>
              </div>
              <span className="text-sm font-semibold text-primary">50% 완료</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/2 rounded-full" />
            </div>
          </div>

          {/* Form */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant/30">
            <form className="space-y-6" onSubmit={e => {
              e.preventDefault();
              const payload = { ...form };
              if (isSocial) {
                payload.provider = socialTemp.provider;
                payload.socialId = socialTemp.socialId;
                payload.profileImage = socialTemp.profileImage;
              }
              localStorage.setItem('signupTemp', JSON.stringify(payload));
              navigate('/signup/step2');
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User ID */}
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-on-surface">아이디</label>
                  <div className="relative">
                    <input
                      name="userId"
                      value={form.userId}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-base"
                      placeholder="고유한 아이디를 입력하세요"
                      type="text"
                    />
                    {form.userId.length > 3 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant">플랫폼에서 사용할 고유 식별자입니다.</p>
                </div>

                {/* Nickname */}
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-on-surface">닉네임</label>
                  <input
                    name="nickname"
                    value={form.nickname}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-base"
                    placeholder="닉네임을 입력하세요"
                    type="text"
                  />
                  <p className="text-xs text-on-surface-variant">프로필에 표시될 이름입니다.</p>
                </div>


                {/* Email */}
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-on-surface">이메일</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isSocial}
                    className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="gourmet@example.com"
                    type="email"
                  />
                  {isSocial && <p className="text-xs text-on-surface-variant">소셜 계정 이메일은 이메일 입력이 필요하지 않습니다.</p>}
                </div>

                {/* Password - 소셜 로그인 시 생략 */}
                {!isSocial && (
                  <div className="space-y-2">
                    <label className="font-semibold text-sm text-on-surface">비밀번호</label>
                    <div className="relative">
                      <input
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-base"
                        placeholder="••••••••"
                        type={showPw ? 'text' : 'password'}
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">{showPw ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= pwStrength ? 'bg-primary' : 'bg-surface-container'}`} />
                      ))}
                    </div>
                    {form.password && (
                      <p className={`text-xs font-medium ${pwStrength >= 3 ? 'text-green-600' : 'text-primary'}`}>
                        {pwStrength <= 1 ? '약함' : pwStrength <= 2 ? '보통' : '강함'}
                      </p>
                    )}
                  </div>
                )}

                {/* Confirm Password - 소셜 로그인 시 생략 */}
                {!isSocial && (
                  <div className="space-y-2">
                    <label className="font-semibold text-sm text-on-surface">비밀번호 확인</label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-base"
                        placeholder="••••••••"
                        type="password"
                      />
                      {form.confirmPassword && (
                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${pwMatch ? 'text-error' : 'text-primary'}`}>
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{pwMatch ? 'error' : 'check_circle'}</span>
                        </div>
                      )}
                    </div>
                    {pwMatch && <p className="text-xs text-error">비밀번호가 일치하지 않습니다.</p>}
                  </div>
                )}

                {/* Phone */}
                <div className="space-y-2 md:col-span-2">
                  <label className="font-semibold text-sm text-on-surface">전화번호</label>
                  <div className="flex gap-2">
                    <select className="bg-surface-container-low border-none rounded-lg px-3 py-3 text-base font-medium w-24">
                      <option>+82</option>
                      <option>+1</option>
                      <option>+44</option>
                    </select>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="flex-grow bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-base"
                      placeholder="010-0000-0000"
                      type="tel"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant">다중 인증 및 예약에 사용됩니다.</p>
                </div>
              </div>

              <div className="pt-5 border-t border-surface-variant/30 flex flex-col md:flex-row gap-4 items-center justify-between">
                <p className="text-xs text-on-surface-variant max-w-xs">
                  다음을 클릭하면 <a href="#" className="underline">이용약관</a> 및 <a href="#" className="underline">개인정보처리방침</a>에 동의하게 됩니다.
                </p>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-primary text-on-primary font-[Epilogue] font-semibold px-10 py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  다음: 취향 설정
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-on-surface-variant">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary-container font-semibold hover:underline">로그인</Link>
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-on-surface-variant font-[Epilogue]">
        © 2024 Foodiest. 모든 권리 보유.
      </footer>
    </div>
  );
}
