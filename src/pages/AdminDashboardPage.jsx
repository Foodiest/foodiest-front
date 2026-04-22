import { Link } from 'react-router-dom';

const LOGO_URL = "https://lh3.googleusercontent.com/aida/ADBb0ui3TDTpTeFMuqXORvtln5ch7904DywC7IySsW8ACfAhikZiX-XCHWeOZX5nhAuUbaVvf414JmXvTp1UQZ60cCLE_bnd5698IHAw2Tg4zMzXP43lRA9Z0A9Vx80KvxEFOv_TdXR6Yjh_-85CLl6vREjQErp9l9FBUNe7XDa_D5KS11KGWgKyYI1EIiN8keoUzfF78HfhR6Ps5aR6-W4v3eqhSA0c5uwWLD1ZuzhgYDuS2wiCYQyVKDmh0kg";
const ADMIN_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuAKeMgSI8BR98vgazOoIZiAVkf5mSsNLBwaFJmuK1_1K9esoQWZCdkUBDSJkEhmzmHSgymVym_nviBdijmcS6u5bbtNKtQbkzROW9v_8sJ6fxp-hkecsCvgkxzQfOPunBo6MfK-xRvFYl705nVKJ28_m31TvPOkwStq4tDEFCLAqOjwyFjTevNHzFVZodz3VfNQn9nNux10rnz2N4L8awQ6H8BP4w7Py2qG5MqSXhK1RXRnndbosM4bVq-moaU6reVBBm7IqUyvvVP2";

const kpiCards = [
  { icon: 'person_add', title: 'Total Users', value: '42,892', badge: '+12.5%', color: 'bg-orange-50 text-primary', badgeColor: 'text-green-600 bg-green-50' },
  { icon: 'reviews', title: 'Total Reviews', value: '128,450', badge: '+8.2%', color: 'bg-blue-50 text-secondary', badgeColor: 'text-green-600 bg-green-50' },
  { icon: 'storefront', title: 'Active Restaurants', value: '1,245', badge: 'Stable', color: 'bg-purple-50 text-purple-600', badgeColor: 'text-slate-400 bg-slate-50' },
  { icon: 'report', title: 'Flagged Reviews', value: '24', badge: 'Urgent', color: 'bg-error-container text-error', badgeColor: 'text-error bg-error-container', urgent: true },
];

const flaggedReviews = [
  { user: 'Alex Rivera', restaurant: 'Le Petit Bistro', reason: 'Inappropriate', date: 'Oct 24, 2023', status: 'pending' },
  { user: 'Sarah Chen', restaurant: 'Oshima Sushi', reason: 'Spam Content', date: 'Oct 23, 2023', status: 'pending' },
  { user: 'Marc Dupond', restaurant: 'The Grill House', reason: 'Off-topic', date: 'Oct 22, 2023', status: 'resolved' },
];

const keywords = ['Quiet', 'Handmade Pasta', 'Noisy', 'Al Fresco', 'Authentic', 'Wait Times', 'Craft Cocktails'];
const userGrowth = [
  { month: 'September', value: 1402, pct: 85, color: 'bg-primary' },
  { month: 'August', value: 1210, pct: 72, color: 'bg-secondary' },
  { month: 'July', value: 980, pct: 60, color: 'bg-slate-300' },
];

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/admin', active: true },
  { icon: 'analytics', label: 'Analytics', to: '/admin' },
  { icon: 'group', label: 'Users', to: '/admin' },
  { icon: 'restaurant', label: 'Restaurants', to: '/admin' },
  { icon: 'rate_review', label: 'Reviews', to: '/admin' },
  { icon: 'settings', label: 'Settings', to: '/admin' },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-white border-r border-slate-200 shadow-sm font-[Epilogue] text-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 overflow-hidden">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Foodiest</h1>
              <p className="text-xs text-slate-500">Expert Concierge Service</p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ icon, label, to, active }) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  active
                    ? 'text-orange-600 bg-orange-50 font-semibold border-r-4 border-orange-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-8 left-6 right-6">
          <button className="w-full bg-primary py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">add</span>
            Generate Report
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 h-16 flex items-center justify-between px-8 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm font-[Epilogue]">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Search insights..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-500">
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">notifications</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">help_outline</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">Admin Profile</p>
                <p className="text-xs text-slate-500">Master Administrator</p>
              </div>
              <img src={ADMIN_AVATAR} alt="Admin" className="w-10 h-10 rounded-full border-2 border-primary/20" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="pt-24 px-8 pb-12">
          <div className="mb-8">
            <h2 className="font-[Epilogue] text-2xl font-semibold text-slate-900">Dashboard Insights</h2>
            <p className="text-slate-500 text-sm mt-1">Review real-time metrics and intelligence summaries for Gourmet Intelligence.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {kpiCards.map(({ icon, title, value, badge, color, badgeColor, urgent }) => (
              <div key={title} className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between ${urgent ? 'border-error-container ring-1 ring-error/10' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColor} ${urgent ? 'animate-pulse' : ''}`}>{badge}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                  <h3 className={`text-2xl font-bold ${urgent ? 'text-error' : 'text-slate-900'}`}>{value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Line Chart */}
            <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900">Weekly Review Trends</h4>
                <select className="text-xs font-medium bg-surface-container-low border-none rounded-lg focus:ring-0">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-48 relative flex items-end justify-between gap-2 pt-4">
                <div className="absolute inset-0 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#b02f00', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                    <path d="M0 150 Q 100 100, 200 130 T 400 80 T 600 110 T 800 50" fill="none" stroke="#b02f00" strokeWidth="3" strokeLinecap="round" />
                    <path d="M0 150 Q 100 100, 200 130 T 400 80 T 600 110 T 800 50 L 800 200 L 0 200 Z" fill="url(#grad1)" opacity="0.1" />
                  </svg>
                </div>
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                  <div key={day} className="flex flex-col items-center flex-1 z-10">
                    <span className="w-2 h-2 rounded-full bg-primary mb-2"></span>
                    <span className="text-[10px] text-slate-400 font-medium">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900 mb-5">Sentiment Analysis</h4>
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 mb-5">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#b02f00" strokeDasharray="70 100" strokeLinecap="round" strokeWidth="4" />
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#4c56af" strokeDasharray="20 100" strokeDashoffset="-70" strokeLinecap="round" strokeWidth="4" />
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#fca5a5" strokeDasharray="10 100" strokeDashoffset="-90" strokeLinecap="round" strokeWidth="4" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">70%</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Positive</span>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  {[
                    { color: 'bg-primary', label: 'Positive', pct: '70%' },
                    { color: 'bg-secondary', label: 'Neutral', pct: '20%' },
                    { color: 'bg-red-300', label: 'Negative', pct: '10%' },
                  ].map(({ color, label, pct }) => (
                    <div key={label} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${color}`}></span>
                        <span className="text-sm font-medium text-slate-600">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table + Sidebar */}
          <div className="grid grid-cols-12 gap-6">
            {/* Flagged Table */}
            <div className="col-span-12 lg:col-span-9 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900">Flagged Reports</h4>
                <button className="text-primary font-medium text-sm hover:underline">View All Actions</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                    <tr>
                      {['User', 'Restaurant', 'Reason', 'Date', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {flaggedReviews.map(({ user, restaurant, reason, date, status }) => (
                      <tr key={user} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                              {user.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm font-semibold text-slate-900">{user}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{restaurant}</td>
                        <td className="px-5 py-4">
                          <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">{reason}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{date}</td>
                        <td className="px-5 py-4">
                          {status === 'pending' ? (
                            <span className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Pending
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Resolved
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button className={`text-sm font-medium ${status === 'pending' ? 'text-secondary hover:underline' : 'text-slate-400'}`}>
                            {status === 'pending' ? 'Review' : 'Archive'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right */}
            <div className="col-span-12 lg:col-span-3 space-y-5">
              {/* Keywords */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900 mb-3">Trending NLP Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, i) => (
                    <span
                      key={kw}
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        i % 2 === 0 ? 'bg-secondary/10 text-secondary' :
                        i % 3 === 0 ? 'bg-primary/10 text-primary' :
                        'bg-surface-container-high text-slate-600'
                      }`}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* User Growth */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-[Epilogue] text-lg font-semibold text-slate-900 mb-4">User Growth</h4>
                <div className="space-y-4">
                  {userGrowth.map(({ month, value, pct, color }) => (
                    <div key={month}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-500">{month}</span>
                        <span className="text-slate-900 font-bold">{value.toLocaleString()} New</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-5 py-2 border-2 border-secondary text-secondary rounded-lg font-medium text-sm hover:bg-secondary/5 transition-colors">
                  View Growth Report
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
