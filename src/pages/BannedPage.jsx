import { supabase } from '../lib/supabase';

export default function BannedPage() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-red-500">gavel</span>
        </div>
        <h1 className="font-[Epilogue] text-2xl font-bold text-on-surface mb-3">
          계정이 정지되었습니다
        </h1>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-2">
          이용 약관 위반으로 인해 계정이 정지되어 서비스 이용이 제한되었습니다.
        </p>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
          이의가 있으시면 고객센터로 문의해 주세요.
        </p>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 text-left">
          <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span>
            정지된 계정 안내
          </p>
          <ul className="text-xs text-red-500 space-y-1 list-disc list-inside">
            <li>모든 서비스 기능 이용 불가</li>
            <li>계정 탈퇴 불가</li>
            <li>리뷰 작성·수정·삭제 불가</li>
          </ul>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
