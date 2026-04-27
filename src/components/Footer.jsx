import { Link } from 'react-router-dom';
import logoUrl from '../assets/logo.png';

const LOGO_URL = logoUrl;

export default function Footer() {
  return (
    <footer className="bg-gray-50 w-full py-12 border-t border-gray-200 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto font-[Epilogue] text-sm">
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img src={LOGO_URL} alt="Foodiest 로고" className="h-8 w-8 object-contain" />
            <span className="font-bold text-gray-900">Foodiest</span>
          </div>
          <p className="text-gray-500">© 2024 Foodiest. 정밀한 다이닝 인사이트.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4">서비스</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="text-gray-500 hover:text-orange-600 transition-colors">소개</Link></li>
            <li><a href="#" className="text-gray-500 hover:text-orange-600 transition-colors">파트너</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4">법적 고지</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-500 hover:text-orange-600 transition-colors">개인정보처리방침</a></li>
            <li><a href="#" className="text-gray-500 hover:text-orange-600 transition-colors">이용약관</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4">연결</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-500 hover:text-orange-600 transition-colors">문의</a></li>
            <li className="flex gap-4 mt-4">
              <span className="material-symbols-outlined text-gray-500 cursor-pointer hover:text-orange-600 transition-colors">public</span>
              <span className="material-symbols-outlined text-gray-500 cursor-pointer hover:text-orange-600 transition-colors">mail</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
