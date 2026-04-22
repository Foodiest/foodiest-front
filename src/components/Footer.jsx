import { Link } from 'react-router-dom';

const LOGO_URL = "https://lh3.googleusercontent.com/aida/ADBb0ui3TDTpTeFMuqXORvtln5ch7904DywC7IySsW8ACfAhikZiX-XCHWeOZX5nhAuUbaVvf414JmXvTp1UQZ60cCLE_bnd5698IHAw2Tg4zMzXP43lRA9Z0A9Vx80KvxEFOv_TdXR6Yjh_-85CLl6vREjQErp9l9FBUNe7XDa_D5KS11KGWgKyYI1EIiN8keoUzfF78HfhR6Ps5aR6-W4v3eqhSA0c5uwWLD1ZuzhgYDuS2wiCYQyVKDmh0kg";

export default function Footer() {
  return (
    <footer className="bg-gray-50 w-full py-12 border-t border-gray-200 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto font-[Epilogue] text-sm">
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img src={LOGO_URL} alt="Foodiest Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-gray-900">Foodiest</span>
          </div>
          <p className="text-gray-500">© 2024 Foodiest. Precision Dining Insights.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4">Product</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="text-gray-500 hover:text-orange-600 transition-colors">About</Link></li>
            <li><a href="#" className="text-gray-500 hover:text-orange-600 transition-colors">Partners</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-500 hover:text-orange-600 transition-colors">Privacy</a></li>
            <li><a href="#" className="text-gray-500 hover:text-orange-600 transition-colors">Terms</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4">Connect</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-500 hover:text-orange-600 transition-colors">Contact</a></li>
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
