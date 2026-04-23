import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const PROFILE_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuAvqvljU0AxRy4dCUoQ55jvVcj4jFtgNwQk5ACOhF4gRO2_FdVflIt2q-9WbqjpEySqL8mpn5PzVidLNXIxHUldKQaGiiR-vKtzi6jLI8sXwBi8hWz4vHjmYtyBo98DT52C9aq2WjwniFSrUFdlLwZ-CRpe7ZTGXbJ78YSHbPgrG_XGnlLRaz93nqWRGizaWBUhs0I3oLh7rMTbTOxvgRdCPW1Xpwhh6FxYA-Scf4-zX6qysKjd3DJRC-Y8zvh2lW0W9SlSXrTNz3Qn";
const COVER_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuAGYZkNW-gBSnauyYuVepWJqG_pWJfN5vO-saOqzdBraFviGD2lvP_4Wflhsqp3kGKyelpET3IZD8ZtQBIBK64u5naGNZIgqCr0jWq3Z247OREPOvMgr_elxsMYGaPxdPzA0Bv4OLbwfzSrEYWJQb1a-uiqBIpsE-s8TXZeNCA2RSiR6EqqCK__8PGCyPOieAp_a4WWyfdRnyNZT-e6FNOtwLbIBXXSLZTeLjG4ohKjPvMSD3HnYDQypWgfKYNa4C4_O1NZ0UsdHihq";

const bestRestaurants = [
  {
    name: "L'Essence",
    sub: 'Modern French • 3 Michelin Stars',
    badge: 'Best of 2023',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGrKERkAoI4x2VQxH3TC3zd4gK_6TAjyvhvkYrBW3hrZGjE5SDBNJEuSXLJB74A84iybZnN7lssT39Yn2wVTghJ52TxCrxq1_eK6NqxUTf1MfRWOfAPHXxPL-wWgJRRG1hj3SO1P_xhmDLbFWMriEFXKg7LvDcy8EwMSHlGmOFIFEM3tyB2Z0FHMeG9BJXh__3s55GIon_3HlDIYGsAfswKKLI1RE0l0i6Ch2jo_TOTW1F-5FHCs4cGHqd8Zv9XuVUO-O-7iQpyppA',
  },
  {
    name: 'Wild & Raw',
    sub: 'Organic Kitchen • Greenhouse Vibes',
    badge: 'Local Gem',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvdqc2VoexOAJdxt7---KdH4tn8CXYxIMdrxtjqNEW-YgwJk9IW1NVVHlT__lK4wFLJBcIC-9liRa3xwQi8vraA_7Pu6wom5dspTMvUY3wahKPbeXI6qAfn2B7XS-WPxZps6waSUqtmiWJiLksTu0JeCJE9eKa0cSFg2kFH4aXOf3gDSvlFqK-_dchpPRbPAz0mRnIpmAg-4MX445vS74uvHSsCRZhFfxrATblMGTguGHKzSWFetFgGmeb99qs_l5DO8vjBnkaJkIv',
  },
  {
    name: 'Neon Sips',
    sub: 'Mixology Lab • Sensory Experience',
    badge: 'Best Cocktails',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-asKVKC_AIuRh5Mv7Awg8xE8-YYJP7_b5Qkri9mLbihVlfZrUulIgjwvVqUgYw-LgJHRoxRHyZKs7PA91HtA1ayoL7Vqa4qveVAtteI_4cYgQ0G7ZLBT4mXu53R_N9nPTg-5XKZjyoUlNYCWLtMo7-K5U8vrMc5YKRdBF6QUKPnxIkh4XNL6ofasWZhrvXbELUD2PghMKuRB4mWxdGc73D_KXkJ8GlaaHjPm_52S-LlJ2nSHURAYB-noG0d8qR-pc8KJuMYzIqsij',
  },
];

const reviews = [
  { title: 'Truffle Alchemy', restaurant: "L'Essence", date: 'OCT 12', stars: 5, desc: 'Hand-folded silk pasta with aromatic white truffles was scientifically perfect.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7kGuUJdtFn38fQMnzpR-93eI4tNaKIh_9JnO-GODEADFumPdlH4FULoKh67NLLfklAf4xo0F8ablsIpoqZcVVGvAY4t3peUpZy3NdQjuMqCCRKj-raJ_mw__OUQYjpFq8P1oAogjmfKDM3VZktJ1KahM6aZaNAgjNLYAal6CFUwLOqIcet2BbOUgrbniE8kC-5y7192Gm3alqyhdZ0IpwSmfQEuSiAHru1MM7lDO32FLtWgwWlQe-r-PFw5iUNK7lJGDM9SdcP_LE' },
  { title: 'Raw Juices', restaurant: 'Wild & Raw', date: 'SEP 28', stars: 4, desc: 'Cold-pressed extraction with no visible oxidation. Superior palette.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvdqc2VoexOAJdxt7---KdH4tn8CXYxIMdrxtjqNEW-YgwJk9IW1NVVHlT__lK4wFLJBcIC-9liRa3xwQi8vraA_7Pu6wom5dspTMvUY3wahKPbeXI6qAfn2B7XS-WPxZps6waSUqtmiWJiLksTu0JeCJE9eKa0cSFg2kFH4aXOf3gDSvlFqK-_dchpPRbPAz0mRnIpmAg-4MX445vS74uvHSsCRZhFfxrATblMGTguGHKzSWFetFgGmeb99qs_l5DO8vjBnkaJkIv' },
  { title: 'Neon Mixology', restaurant: 'Neon Sips', date: 'SEP 15', stars: 5, desc: "Molecular mixology pushing boundaries with their 'Smoked Oak' Manhattan.", img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-asKVKC_AIuRh5Mv7Awg8xE8-YYJP7_b5Qkri9mLbihVlfZrUulIgjwvVqUgYw-LgJHRoxRHyZKs7PA91HtA1ayoL7Vqa4qveVAtteI_4cYgQ0G7ZLBT4mXu53R_N9nPTg-5XKZjyoUlNYCWLtMo7-K5U8vrMc5YKRdBF6QUKPnxIkh4XNL6ofasWZhrvXbELUD2PghMKuRB4mWxdGc73D_KXkJ8GlaaHjPm_52S-LlJ2nSHURAYB-noG0d8qR-pc8KJuMYzIqsij' },
  { title: 'Coastal Brine', restaurant: 'The Oyster Bar', date: 'AUG 22', stars: 4, desc: "The cleanest, most mineral-forward oysters I've had this season.", img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNluibihhcdM9m7IqeWMRcMQvMhemnGEXu-tHxKYrIRzWHuqMZw3m8um8WQQUzFP_lNLgiXyVb_6bLkeEdJBhl12yoDEt6TSp159BbpeoeSgEpTz-xKV_NQqWYAfiiCtvfUA1PYMLlDGdPHnU-VDCXu3CXfXrZk9dgQQBo3Kyn0jNWuXqDK-_vaQDc2j-lahLYRhEjAufx0ie_U1YtwQAy5OT_4Sv3BD4O8xISIERmyDtSma5K07-7hewk6PbNwrkaFXeZPrzk_qMV' },
];

const tasteIdentity = [
  { label: 'Alfresco', icon: 'wb_sunny', color: 'bg-white border-secondary-container/30 text-secondary' },
  { label: 'Minimalist', icon: 'auto_awesome', color: 'bg-white border-secondary-container/30 text-secondary' },
  { label: 'Umami Rich', icon: 'local_fire_department', color: 'bg-primary-fixed/50 border-primary-fixed text-on-primary-fixed-variant' },
  { label: 'Fermented', icon: 'science', color: 'bg-primary-fixed/50 border-primary-fixed text-on-primary-fixed-variant' },
  { label: 'Plant-Forward', icon: 'eco', color: 'bg-tertiary-fixed border-tertiary text-on-tertiary-fixed' },
];

export default function MyPage() {
  const navigate = useNavigate();
  const navigateToTop = path => {
    navigate(path);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  };

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        {/* Hero Section */}
        <section className="mt-6 rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100">
          <div className="h-64 md:h-80 w-full relative">
            <img src={COVER_IMG} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 right-6">
              <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/30 transition-all">
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Cover
              </button>
            </div>
          </div>

          <div className="px-6 md:px-10 pb-6 md:pb-10 -mt-16 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl border-4 border-white overflow-hidden shadow-lg bg-white">
                <img src={PROFILE_IMG} alt="profile" className="w-full h-full object-cover" />
              </div>
              <div className="mb-2">
                <h2 className="font-[Epilogue] text-white md:text-on-surface text-2xl md:text-4xl font-bold">Elena Gastronomy</h2>
                <p className="text-slate-500 mt-1 max-w-lg text-sm">Culinary explorer & NLP data scientist. Finding the soul of the city through its hidden kitchens and Michelin stars.</p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 flex gap-3 w-full md:w-auto">
              <button
                onClick={() => navigateToTop('/profile-settings')}
                className="flex-1 md:flex-none bg-primary-container text-on-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
              <button className="bg-white border border-slate-200 text-on-surface px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-sm">share</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 md:px-10 pb-8 grid grid-cols-3 gap-6 border-t border-slate-50 mt-4 pt-6">
            {[
              { value: '128', label: 'Reviews' },
              { value: '12.4k', label: 'Followers' },
              { value: '842', label: 'Following' },
            ].map(({ value, label }, i) => (
              <div key={label} className={`text-center md:text-left ${i === 1 ? 'border-x border-slate-100' : ''}`}>
                <p className="font-[Epilogue] text-2xl font-semibold text-on-surface">{value}</p>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Taste Identity */}
        <section className="mt-6">
          <div className="bg-secondary-fixed/30 rounded-3xl p-6 md:p-8 border border-secondary-fixed">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-secondary">psychology</span>
              <h3 className="font-[Epilogue] text-xl font-semibold text-on-secondary-container">My Taste Identity</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {tasteIdentity.map(({ label, icon, color }) => (
                <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold shadow-sm ${color}`}>
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                  {label}
                </div>
              ))}
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-500 shadow-sm">
                <span className="material-symbols-outlined text-sm">search</span>
                Discovering...
              </div>
            </div>
          </div>
        </section>

        {/* Best Restaurants */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-7">
            <h3 className="font-[Epilogue] text-3xl font-bold text-on-surface">Best Restaurants</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View all favorites</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bestRestaurants.map(({ name, sub, badge, img }) => (
              <div
                key={name}
                className="relative group rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white cursor-pointer"
                onClick={() => navigateToTop('/restaurant/1')}
              >
                <div className="h-48 overflow-hidden">
                  <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="absolute top-4 left-4 bg-primary-container text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                  {badge}
                </div>
                <div className="p-5">
                  <h4 className="font-[Epilogue] text-lg font-semibold text-on-surface">{name}</h4>
                  <p className="text-slate-500 text-xs mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Review Journal */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-7">
            <h3 className="font-[Epilogue] text-3xl font-bold text-on-surface">Review Journal</h3>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              Latest First
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(({ title, restaurant, date, stars, desc, img }) => (
              <article
                key={title}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-50 group flex flex-col h-full cursor-pointer"
                onClick={() => navigateToTop('/write-review')}
              >
                <div className="h-48 relative overflow-hidden">
                  <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-0.5 text-orange-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: i < stars ? "'FILL' 1" : "'FILL' 0", color: i < stars ? undefined : '#e2e2e4' }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <h4 className="font-[Epilogue] text-lg font-semibold text-on-surface mb-2 line-clamp-1">{title}</h4>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">{desc}</p>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-sm">restaurant</span>
                    </div>
                    <span className="text-sm font-semibold text-on-surface">{restaurant}</span>
                    <time className="ml-auto text-xs text-slate-400">{date}</time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
