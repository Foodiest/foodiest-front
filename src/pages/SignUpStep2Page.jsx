import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { vibes, flavors, dietary, allergies } from '../data/mockFilters';




export default function SignUpStep2Page() {
  const navigate = useNavigate();
  const [selectedVibes, setSelectedVibes] = useState(['Lively']);
  const [selectedFlavors, setSelectedFlavors] = useState(['Sweet Treats']);
  const [selectedDietary, setSelectedDietary] = useState(['Vegan']);
  const [selectedAllergies, setSelectedAllergies] = useState([]);

  const toggle = (list, setList, item) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-32">
      {/* Header */}
      <header className="bg-white fixed top-0 w-full z-50 border-b border-slate-100 shadow-sm flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-primary font-[Epilogue] text-lg font-bold tracking-tight">Foodiest</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-surface-variant">Step 2 of 2</span>
          <button className="text-secondary text-sm font-medium hover:text-primary">Help</button>
        </div>
      </header>

      <main className="pt-24 max-w-4xl mx-auto px-6">
        {/* Progress */}
        <div className="mb-10">
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-full rounded-full" />
          </div>
          <h1 className="font-[Epilogue] text-3xl font-semibold text-on-surface mt-5">Personalize Your Palate</h1>
          <p className="text-lg text-on-surface-variant mt-1">Tell us what fuels your appetite. Our expert concierge uses these insights to curate your perfect dining map.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Vibe Section */}
          <section className="md:col-span-7 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-50">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-secondary">mood</span>
              <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">Dining Vibe</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {vibes.map(v => {
                const active = selectedVibes.includes(v.label);
                return (
                  <button
                    key={v.label}
                    onClick={() => toggle(selectedVibes, setSelectedVibes, v.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all active:scale-95 ${
                      active ? 'bg-primary-container text-white border-primary-container shadow-sm' : 'border-outline-variant hover:border-primary text-on-surface bg-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {v.icon}
                    </span>
                    {v.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 rounded-lg overflow-hidden h-28 relative">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb7k-11ixOszmENzaqCuxyozCCb2zoJTaXrU4gSzJ5rPG-s4HWCPU9lQ6Og6punzDgJ8zJsQ1tlmolz16Nhs-jrTzU3jKcNrqfmmNfW_7gz5Jrp3WybxOykazp1_uwPyw1QSsKN4JOvAX62QQymDI4Hp87GYTN3oMvCyGacV3XpRSZPekqNW5Km1nf8_xTVX5-Ue6Wi6f0pTI4sYLFhI_PPPiIY6poesOF5SIZYUoRF-BUFUf-aBCv5qxYiUNaqx0Ppe-y8bnBJV91"
                alt="vibe"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <p className="text-white text-xs">Expert Pick: Places with a "Lively" atmosphere are trending tonight.</p>
              </div>
            </div>
          </section>

          {/* Flavor Section */}
          <section className="md:col-span-5 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-50 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-secondary">restaurant_menu</span>
              <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">Flavor Profile</h2>
            </div>
            <div className="space-y-3">
              {flavors.map(({ label, icon }) => {
                const active = selectedFlavors.includes(label);
                return (
                  <div
                    key={label}
                    onClick={() => toggle(selectedFlavors, setSelectedFlavors, label)}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      active ? 'border-primary-container bg-orange-50' : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                      <span className="font-semibold text-sm">{label}</span>
                    </div>
                    <input
                      type="checkbox"
                      readOnly
                      checked={active}
                      className="rounded text-primary focus:ring-primary h-5 w-5 border-outline"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dietary Section */}
          <section className="md:col-span-12 bg-white p-6 rounded-xl shadow-sm border border-slate-50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">health_and_safety</span>
                <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">Dietary Requirements</h2>
              </div>
              <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">Select all that apply</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {dietary.map(item => {
                const active = selectedDietary.includes(item.label);
                return (
                  <button
                    key={item.label}
                    onClick={() => toggle(selectedDietary, setSelectedDietary, item.label)}
                    className={`flex-none flex items-center gap-2 px-5 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                      active ? 'border-primary-container bg-orange-50 shadow-sm' : 'border-outline-variant bg-white hover:border-primary'
                    }`}
                  >
                    <span className={`material-symbols-outlined ${active ? 'text-primary' : 'text-on-surface-variant'}`} style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {item.icon}
                    </span>
                    <span className={`font-semibold text-sm whitespace-nowrap ${active ? 'text-on-primary-container' : ''}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Allergy Section */}
          <section className="md:col-span-12 bg-white p-6 rounded-xl shadow-sm border border-slate-50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">warning</span>
                <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">Allergy Information</h2>
              </div>
              <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">Select all that apply</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allergies.map(item => {
                const active = selectedAllergies.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggle(selectedAllergies, setSelectedAllergies, item)}
                    className={`flex-none flex items-center gap-2 px-5 py-3 border-2 rounded-xl cursor-pointer transition-all ${
                      active ? 'border-primary-container bg-orange-50 shadow-sm' : 'border-outline-variant bg-white hover:border-primary'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-sm ${active ? 'text-primary' : 'text-on-surface-variant'}`}>nutrition</span>
                    <span className="font-semibold text-sm whitespace-nowrap">{item}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Intelligence Engine */}
          <section className="md:col-span-12 bg-secondary-fixed/20 p-6 rounded-2xl border border-secondary-fixed/40">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h3 className="font-[Epilogue] text-xl font-semibold text-on-secondary-container">Intelligence Engine Active</h3>
                <p className="text-base text-on-secondary-fixed-variant mt-1">Based on your selections, we've identified 142 restaurants in your area that match your unique profile.</p>
              </div>
              <div className="flex-none w-full md:w-64 space-y-3">
                <div className="bg-white/60 backdrop-blur p-3 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-medium">Match Accuracy</span>
                  <span className="font-semibold text-sm text-primary">94%</span>
                </div>
                <div className="bg-white/60 backdrop-blur p-3 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">Personal Fit</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-5 border-t border-slate-100 pt-5">
          <button
            onClick={() => navigate('/signup')}
            className="font-medium text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Account Details
          </button>
          <button
            onClick={() => {
              const step1 = JSON.parse(localStorage.getItem('signupTemp') || '{}');
              const { password: _, confirmPassword: __, ...rest } = step1;
              const newUser = {
                ...rest,
                vibes: selectedVibes,
                flavors: selectedFlavors,
                dietary: selectedDietary,
                allergies: selectedAllergies,
              };
              localStorage.setItem('currentUser', JSON.stringify(newUser));
              localStorage.removeItem('signupTemp');
              localStorage.removeItem('socialSignupTemp');
              navigate('/');
            }}
            className="px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-surface-tint active:scale-95 transition-all"
          >
            Complete Registration
          </button>
        </div>
      </main>

      {/* Autosave Toast */}
      <div className="fixed bottom-8 right-8 bg-on-surface text-surface px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50">
        <span className="material-symbols-outlined text-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <span className="text-sm font-semibold text-white">Preferences autosaved</span>
      </div>
    </div>
  );
}
