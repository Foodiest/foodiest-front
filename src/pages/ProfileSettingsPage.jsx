import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const vibeOptions = [
  { label: 'Quiet', icon: 'volume_off' },
  { label: 'Lively', icon: 'celebration' },
  { label: 'Romantic', icon: 'favorite' },
  { label: 'Business', icon: 'business_center' },
  { label: 'Family-friendly', icon: 'family_restroom' },
];
const tasteOptions = [
  { label: 'Spicy', icon: 'local_fire_department' },
  { label: 'Sweet', icon: 'icecream' },
  { label: 'Savory', icon: 'egg_alt' },
  { label: 'Umami', icon: 'emoji_food_beverage' },
  { label: 'Salt-heavy', icon: 'water_drop' },
];
const allergyOptions = ['Nut-free', 'Gluten-free', 'Vegan', 'No Seafood', 'No Pork'];

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const [selectedVibes, setSelectedVibes] = useState(['Lively']);
  const [selectedTastes, setSelectedTastes] = useState(['Sweet']);
  const [selectedAllergies, setSelectedAllergies] = useState(['Gluten-free']);

  const toggle = (list, setList, item) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <Layout>
      <main className="pt-10 pb-36 px-6 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-slate-200"></span>
            <span className="w-2 h-2 rounded-full bg-slate-200"></span>
            <span className="w-8 h-2 rounded-full bg-primary-container"></span>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Step 3 of 3</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="font-[Epilogue] text-2xl md:text-3xl font-semibold text-on-surface mb-2">당신의 미식 취향을 알려주세요</h1>
          <p className="text-base text-on-surface-variant">선택하신 정보는 최적의 맛집 매칭을 위해 사용됩니다.</p>
        </div>

        <div className="space-y-12">
          {/* Atmosphere */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary">restaurant</span>
              <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">선호하는 분위기</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {vibeOptions.map(({ label, icon }) => {
                const active = selectedVibes.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => toggle(selectedVibes, setSelectedVibes, label)}
                    className={`group flex items-center gap-2 px-5 py-3 rounded-full border-2 transition-all duration-200 active:scale-95 ${
                      active ? 'border-primary-container bg-primary-container text-white shadow-lg shadow-primary/20' : 'border-outline-variant bg-surface hover:border-primary-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                    <span className="font-semibold text-sm">{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Taste */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary">skillet</span>
              <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">선호하는 맛</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tasteOptions.map(({ label, icon }) => {
                const active = selectedTastes.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => toggle(selectedTastes, setSelectedTastes, label)}
                    className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all active:scale-95 text-center gap-2 ${
                      active ? 'border-primary-container bg-primary-container text-white shadow-lg shadow-primary/20' : 'border-outline-variant bg-surface hover:bg-orange-50 hover:border-primary-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl" style={active ? { fontVariationSettings: "'FILL' 1" } : { color: '#b02f00' }}>{icon}</span>
                    <span className="font-semibold text-sm">{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Allergies */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-error">warning</span>
              <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">알레르기 & 식이 제한</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergyOptions.map(item => {
                const active = selectedAllergies.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggle(selectedAllergies, setSelectedAllergies, item)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                      active ? 'border-error bg-error text-white shadow-sm' : 'border-error-container bg-error-container/20 text-error hover:bg-error-container/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{active ? 'check_circle' : 'cancel'}</span>
                    {item}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-200 py-5 px-6 z-40">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            onClick={() => navigate('/mypage')}
            className="flex-1 py-4 bg-primary-container text-white font-[Epilogue] font-semibold text-lg rounded-xl shadow-xl shadow-primary-container/30 active:scale-95 transition-all duration-150"
          >
            설정 완료 및 시작하기
          </button>
        </div>
      </div>
    </Layout>
  );
}
