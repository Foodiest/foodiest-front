import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const restaurants = [
  {
    id: 1,
    name: "L'Anima Trattoria",
    match: 98,
    rating: 4.9,
    cuisine: "Italian",
    price: "$$$",
    distance: "0.4 miles away",
    badge: "푸슐랭 가이드",
    event: "리뷰 이벤트",
    tags: ["Exquisite Truffle Pasta", "Quiet Atmosphere"],
    note: "Limited seating",
    quote: '"The portion sizes were generous and the waitstaff was incredibly attentive."',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3",
    vibes: ["Quiet", "Romantic"],
    flavors: ["Savory Classics", "Umami & Rich"],
    dietary: ["Gluten-free", "Nut-free"],
  },
  {
    id: 2,
    name: "Zenith Sushi",
    match: 92,
    rating: 4.7,
    cuisine: "Japanese",
    price: "$$$$",
    distance: "1.2 miles away",
    badge: "푸슐랭 가이드",
    event: "리뷰 이벤트",
    tags: ["Freshest Sashimi"],
    note: "Pricey but worth it",
    quote: '"A true masterclass in minimalist dining and flavor balance."',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzUfzwLMQ32xHuDnvGV8J-QyTSOpMJNoPibvjsKk4axh9rixwT76n_RYoOqNt5eZNeYE1qHOF1RPhacE3sZyr-fZ6gpQAA7yx-7iVv0gtkekzaTYYsjwA1EfMMsygdrWrGxN3tbbRhFn2U3OborWQk9oeupPUufCk29ggypT949zsz-p15VtMWsJFiXG0WsVDEtsfUyayadS-l9pfC7Iu1VYfLTMxB507nBBwePxJ-kZIuYkZGZuv65aO1pptr4yxfBjFKg_ET7GDd",
    vibes: ["Quiet", "Professional"],
    flavors: ["Umami & Rich", "Savory Classics"],
    dietary: ["Gluten-free", "Dairy-free"],
  },
  {
    id: 3,
    name: "Spice Garden",
    match: 85,
    rating: 4.5,
    cuisine: "Indian",
    price: "$$",
    distance: "0.8 miles away",
    badge: "푸슐랭 가이드",
    event: "리뷰 이벤트",
    tags: ["Authentic Curry", "Vibrant Flavors"],
    note: "Great for groups",
    quote: '"Bold spices and a lively atmosphere — an unforgettable experience."',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3",
    vibes: ["Lively", "Social"],
    flavors: ["Spicy & Bold", "Savory Classics"],
    dietary: ["Vegan", "Vegetarian"],
  },
  {
    id: 4,
    name: "Sweet Bliss Patisserie",
    match: 78,
    rating: 4.6,
    cuisine: "French",
    price: "$$",
    distance: "1.5 miles away",
    badge: "푸슐랭 가이드",
    event: "리뷰 이벤트",
    tags: ["Handcrafted Desserts", "Cozy Setting"],
    note: "Perfect for dates",
    quote: '"Every bite felt like a little moment of joy."',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzUfzwLMQ32xHuDnvGV8J-QyTSOpMJNoPibvjsKk4axh9rixwT76n_RYoOqNt5eZNeYE1qHOF1RPhacE3sZyr-fZ6gpQAA7yx-7iVv0gtkekzaTYYsjwA1EfMMsygdrWrGxN3tbbRhFn2U3OborWQk9oeupPUufCk29ggypT949zsz-p15VtMWsJFiXG0WsVDEtsfUyayadS-l9pfC7Iu1VYfLTMxB507nBBwePxJ-kZIuYkZGZuv65aO1pptr4yxfBjFKg_ET7GDd",
    vibes: ["Romantic", "Family Friendly"],
    flavors: ["Sweet Treats"],
    dietary: ["Nut-free", "Vegan"],
  },
  {
    id: 5,
    name: "The Boardroom Grill",
    match: 88,
    rating: 4.8,
    cuisine: "American",
    price: "$$$$",
    distance: "0.6 miles away",
    badge: "푸슐랭 가이드",
    event: "리뷰 이벤트",
    tags: ["Prime Steak", "Private Dining"],
    note: "Business friendly",
    quote: '"Impeccable service and a menu that impresses every client."',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbV0RFghqxJ3lMU65T3gmU91Hb6Mx5TewTu4Nl6OuqrzYLlp0LtnhJST9KJhwFTdx10i-07-5YZPfaGEGZmgn2iC741ofDyTb1SDLLYCPV0Dj7nzGXCgXoYhHR2LhlRe8l5i2_XHHsXdhZrniz3FHr5g8O3Qi3S69WX8SAleqKwhXGHv2evns6brXEL5eaoHzqX6CL8W6G564--ntDO0qo1vRg6kICXPMJG-nCEwwdailk3XGabsnujTUxeSRUD3RAj3-xRdqBRXA3",
    vibes: ["Professional", "Quiet"],
    flavors: ["Savory Classics", "Umami & Rich"],
    dietary: ["Keto", "Gluten-free"],
  },
];

const vibes = ['Quiet', 'Lively', 'Romantic', 'Social', 'Professional', 'Family Friendly'];
const flavors = ['Spicy & Bold', 'Sweet Treats', 'Umami & Rich', 'Savory Classics'];
const dietary = ['Nut-free', 'Vegan', 'Gluten-free', 'Dairy-free', 'Vegetarian', 'Keto'];

export default function HomePage() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const [selectedVibes, setSelectedVibes] = useState(currentUser?.vibes ?? []);
  const [selectedFlavors, setSelectedFlavors] = useState(currentUser?.flavors ?? []);
  const [selectedDietary, setSelectedDietary] = useState(currentUser?.dietary ?? []);
  const [searchQuery, setSearchQuery] = useState('');

  const toggle = (list, setList, item) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const filteredRestaurants = restaurants.filter(r => {
    const q = searchQuery.toLowerCase();
    const searchMatch = q === '' || (
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );
    const vibeMatch = selectedVibes.length === 0 || selectedVibes.every(v => r.vibes.includes(v));
    const flavorMatch = selectedFlavors.length === 0 || selectedFlavors.every(f => r.flavors.includes(f));
    const dietaryMatch = selectedDietary.length === 0 || selectedDietary.every(d => r.dietary.includes(d));
    return searchMatch && vibeMatch && flavorMatch && dietaryMatch;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover brightness-[0.4]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjnSNSUq_xXudKrikcaFzx70_v71o1kWer-PwaYc0UklahfJ8l9BiLsPB4boF6nwlUFZ6rIi9OtAHiQ4aUDBxv7igyY1sHFKeUy0NzNCfmfR94Ma82miM-5A7wT__30O7ysbuk9LlI2mQdno_VZNNClcjJyjCzsTwM3P_a_Mi3E38q0UpVx3ayhgZT9jpR31r2UbTu1MBtid8LEx_qBsqUU3PhB7taUQMRptzp56Iss_GdkLkaLIjPaPVmDfpf5Xfld_DbvQPRpWvx"
            alt="hero"
          />
        </div>
        <div className="relative z-10 w-full max-w-4xl px-6 text-center">
          <h1 className="font-[Epilogue] text-[48px] font-bold leading-tight text-white mb-4">
            Precision Dining for the Discerning Palate
          </h1>
          <p className="text-white/90 text-lg mb-8">AI-driven insights mapped to your personal taste profile.</p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-xl shadow-xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 border-r border-slate-100">
              <span className="material-symbols-outlined text-secondary mr-2">search</span>
              <input
                className="w-full border-none focus:ring-0 text-base py-3 outline-none"
                placeholder="Cuisine, restaurant, or keyword..."
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-primary-container text-white font-semibold px-8 py-3 rounded-lg hover:brightness-110 transition-all active:scale-95">
              Find Restaurants
            </button>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">mood</span>
                Vibe
              </h3>
              <div className="flex flex-wrap gap-2">
                {vibes.map(v => (
                  <button
                    key={v}
                    onClick={() => toggle(selectedVibes, setSelectedVibes, v)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedVibes.includes(v)
                        ? 'border-orange-100 bg-orange-50 text-orange-600'
                        : 'border-slate-200 text-slate-600 hover:border-orange-200'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">restaurant_menu</span>
                Flavor Profile
              </h3>
              <div className="flex flex-wrap gap-2">
                {flavors.map(f => (
                  <button
                    key={f}
                    onClick={() => toggle(selectedFlavors, setSelectedFlavors, f)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedFlavors.includes(f)
                        ? 'border-orange-100 bg-orange-50 text-orange-600'
                        : 'border-slate-200 text-slate-600 hover:border-orange-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">medical_services</span>
                Dietary Needs
              </h3>
              <div className="flex flex-wrap gap-2">
                {dietary.map(d => (
                  <button
                    key={d}
                    onClick={() => toggle(selectedDietary, setSelectedDietary, d)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedDietary.includes(d)
                        ? 'border-orange-100 bg-orange-50 text-orange-600'
                        : 'border-slate-200 text-slate-600 hover:border-orange-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results + Map */}
      <section className="max-w-screen-xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Results */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-[Epilogue] text-2xl font-semibold text-on-surface">Recommended for You</h2>
              <p className="text-slate-500 text-sm mt-1">
                {filteredRestaurants.length} result{filteredRestaurants.length !== 1 ? 's' : ''} matching your filters
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {filteredRestaurants.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-3 block">search_off</span>
                <p className="font-medium">No restaurants match the selected filters.</p>
                <p className="text-sm mt-1">Try adjusting your vibe, taste, or dietary preferences.</p>
              </div>
            )}
            {filteredRestaurants.map(r => (
              <div
                key={r.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden flex flex-col md:flex-row"
              >
                <div className="md:w-1/3 relative">
                  <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {r.match}% Match
                  </div>
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-[Epilogue] text-xl font-semibold">{r.name}</h3>
                      <div className="flex items-center text-tertiary">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-semibold text-sm ml-1">{r.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white shadow-sm uppercase">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                        {r.badge}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase">
                        <span className="material-symbols-outlined text-[12px]">priority_high</span>
                        {r.event}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mb-3">{r.cuisine} • {r.price} • {r.distance}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {r.tags.map(tag => (
                        <span key={tag} className="bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">auto_awesome</span>
                          {tag}
                        </span>
                      ))}
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs">{r.note}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.vibes.map(v => (
                        <span
                          key={v}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                            selectedVibes.includes(v)
                              ? 'bg-indigo-500 text-white border-indigo-500'
                              : 'bg-indigo-50 text-indigo-500 border-indigo-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">mood</span>
                          {v}
                        </span>
                      ))}
                      {r.flavors.map(f => (
                        <span
                          key={f}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                            selectedFlavors.includes(f)
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-amber-50 text-amber-500 border-amber-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">restaurant_menu</span>
                          {f}
                        </span>
                      ))}
                      {r.dietary.map(d => (
                        <span
                          key={d}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                            selectedDietary.includes(d)
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-green-50 text-green-600 border-green-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">eco</span>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="text-slate-600 text-sm italic truncate max-w-[60%]">{r.quote}</span>
                    <button
                      onClick={() => navigate(`/restaurant/${r.id}`)}
                      className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all ml-3 flex-shrink-0"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Local View</h3>
              <span className="text-primary text-xs cursor-pointer font-medium">Expand Map</span>
            </div>
            <div className="h-72 w-full relative bg-slate-200">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgNF3yF-AqTDts3yhKNsNC-HjqHx44nn_Uvdwf7whQGjy14AR6QO4zgAOz2HTJkeclucJ47PgNMZZbCEw-rZGGdzY_Z4mYu_khVDdjwKnHm0gvB1-dnhisCquEBBlIDg6B-7-D3KyyNtMDd4IzyVmdK0J18eGl-96elqH1WCrvmh1Ooba5Aok3gPyCa_JeKUTgswS8GsLHOMAb5XfN92O-vrBJg9pmf7ripAk_4_IMM5krNnD5tuUkmvGkUL3reR1fGLfPijDscPzv"
                alt="map"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
            </div>
            <div className="p-5">
              <h4 className="font-semibold text-sm mb-3">Nearby Favorites</h4>
              <div className="space-y-3">
                {[
                  { name: 'The Daily Grind', sub: '0.2 miles • Coffee', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6KO-M3xKogRmdAQc3tuFwF0Ifa-4Nvv0FB2agawLXLE4kt5hZG_SfvdzLPpMMODoZVDnZSzHdCxZV-wCUEzqiNZ2ZCZmYRnZuViu--wwHNbgbO92n9Dwr2nJf64hl3ZsOPgI44wxFUBJkg6UrnZ7r3jU3BPR7aG-RACAXhwQNRysAfF6Oe9IeosgimB0djze3lxIN1E23RY7zR7xvNRs3y4MFCtk2CzucuOpw3Tbl0lv_YMA3hGs3iWzsjQvrz3MqasK1TnqLpRf5' },
                  { name: 'Taco Theory', sub: '0.5 miles • Mexican', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHmDnYklZfS2ovFicfL3qOTQgj0DGWejlakVViEcksvnKsVjtdJ3mPWYvZV6ycd5Ggy-_QJ7Fx69dEAtecAM7bQT1FBDND4SUGMQ8GnXezodjCHiPwxYusXpPQ-3uF9C6BVglpIsSdgNd98DARCu6s1pzD2LFvmFA9XyiRLrAsGvR5dhk7-FCvFMifTQrF03fQpmbfg02bChaqCSDVaNs6WpRxt2ji4LBBhP6W4vl9Fr9gQsAjlU-Nm5XThu_e0OK9wENkvjBibqo3' },
                ].map(item => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
