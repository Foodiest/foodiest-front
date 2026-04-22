import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const keywordGroups = [
  {
    category: 'Vibe', icon: 'auto_awesome',
    items: ['Quiet', 'Sophisticated', 'Vibrant', 'Minimalist'],
    defaults: ['Sophisticated']
  },
  {
    category: 'Taste', icon: 'restaurant',
    items: ['Spicy', 'Savory', 'Umami-rich', 'Authentic'],
    defaults: ['Umami-rich']
  },
  {
    category: 'Service', icon: 'room_service',
    items: ['Friendly', 'Fast', 'Attentive', 'Valet Park'],
    defaults: ['Friendly']
  },
];

export default function WriteReviewPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(4);
  const [reviewText, setReviewText] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState({ Vibe: ['Sophisticated'], Taste: ['Umami-rich'], Service: ['Friendly'] });

  const toggleKw = (category, item) => {
    setSelectedKeywords(prev => {
      const list = prev[category];
      return {
        ...prev,
        [category]: list.includes(item) ? list.filter(i => i !== item) : [...list, item]
      };
    });
  };

  return (
    <Layout>
      <main className="flex-grow pt-6 pb-20 px-6 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-[Epilogue] text-3xl font-semibold text-on-surface mb-1">리뷰 작성하기</h1>
          <p className="text-base text-on-surface-variant">귀하의 미식 경험을 데이터로 기록하고 공유해주세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left */}
          <div className="md:col-span-8 space-y-5">
            {/* Restaurant Context */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant flex items-center gap-5">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkmlXH30uvSRzLTC12UKIlCtQ0qOFCAgZK-LEp2CLLsoyn96hP-XrpX9hxNe1QlcQZTfkzJb7jWvd87UUWPmJPUS-LHz1XEq3qfigbFmwJbOEkO0PVfS5BZvvj3UKOr06RXRQfJrmRvh_99ySQhJ5dCu4o7cIHL0-chfvUE-56dJ_Hp4YsJn4gq8q2RZAhqjPV9oAPt-LSKcrqNd-11Kj0GaCzXJhPQgWIw-aqLvFMPd67tLVq8EQ1FFuFXRZb4GD3Xfq1rGcIlH7V"
                  alt="restaurant"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Current Reviewing</span>
                <h2 className="font-[Epilogue] text-xl font-semibold text-on-surface">The Alchemist Table</h2>
                <p className="text-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span> Gangnam, Seoul
                </p>
              </div>
            </div>

            {/* Rating & Text */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant">
              <div className="mb-5 text-center py-3 border-b border-surface-container">
                <p className="font-semibold text-sm mb-2 text-on-surface">식사는 어떠셨나요?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={() => setRating(i)}
                      className={`material-symbols-outlined text-[40px] transition-colors ${i <= rating ? 'text-primary-container' : 'text-outline-variant'}`}
                      style={{ fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-semibold text-sm block text-on-surface">상세 리뷰 작성</label>
                <textarea
                  className="w-full bg-surface p-4 rounded-lg border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none resize-none text-base placeholder:text-outline"
                  placeholder="음식의 맛, 분위기, 서비스 등 특별했던 점을 자유롭게 적어주세요. (최소 20자)"
                  rows={6}
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                />
                <div className="flex justify-end">
                  <span className="text-xs text-outline">{reviewText.length} / 2,000</span>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant">
              <h3 className="font-semibold text-sm mb-3 text-on-surface">사진 업로드 (최대 10장)</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                <button className="aspect-square rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center hover:bg-surface transition-colors">
                  <span className="material-symbols-outlined text-primary-container text-3xl">add_a_photo</span>
                  <span className="text-xs mt-1 text-on-surface-variant">추가</span>
                </button>
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZEuPDCFH_HLSpeo4EwLAZ80qZupfHsx8IyZOSnVAv8zTfpf9gp1dV7_WORuPPr13tdIYXS2S4s389YrmRatDw0LKs5EX4MLeqUBfVc9A2eoKvxlm5fSYsaOM7La_XhuxTQGO0dk-NCGBiAw7Ar7ZvH07Nl0686DPIXIMQIsWIy5_bUl7xzwB5qNLcv32pl8yA7QenXd_g0rMKVGNY8qA1cvhd9gCrQiOwCmDiU6AuVCSpVX6ADg5VRtznfgpyF4WWP5ISflOV695a',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuDTh-Fn2rqVSSowhUuCUaLxQd8cybuwf37moGPeTBQ3nSePYZEj38WR1uhuIWxAPLC5OGp4Pf1ye5Bh0S5ZSEsF0lSHCwR2_LjsD1p7Afbbo-gQZ2Zy7SqkYEpSbaxDNUBKuU6UCQ77c9sINLbtL8-0DboglECiJxTU1ECzlOn_uTl7qNHfi0rR54Y4x-JoKTibVAOPmX-SrZIPoZ-hb6MOe-vIBKbbSPqgFelpo-kbKXveBBPCYh5qWFh3OmymIzBLBbjVhSi7ai3P'
                ].map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-outline-variant">
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button className="absolute top-1 right-1 bg-on-surface/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-outline mt-3">사진은 1장당 최대 10MB까지 업로드 가능합니다.</p>
            </div>
          </div>

          {/* Right */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-lg border border-primary-container/20 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary-container">smart_toy</span>
                <h3 className="font-[Epilogue] text-lg font-semibold text-on-surface">Intelligence Keywords</h3>
              </div>

              <div className="space-y-5">
                {keywordGroups.map(({ category, icon, items }) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">{icon}</span> {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {items.map(item => {
                        const active = selectedKeywords[category]?.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleKw(category, item)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                              active
                                ? 'bg-primary-container text-white'
                                : 'bg-surface-container text-on-surface hover:bg-primary-container hover:text-white'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-surface-container">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-primary-container text-white py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">send</span>
                  리뷰 제출하기
                </button>
                <p className="text-center text-[11px] text-outline mt-3">
                  제출된 리뷰는 AI 분석을 거쳐<br />컨시어지 추천 엔진에 반영됩니다.
                </p>
              </div>
            </div>

            {/* Incentive */}
            <div className="bg-secondary-container/10 p-4 rounded-xl border border-secondary-container/20 flex gap-3">
              <span className="material-symbols-outlined text-secondary-container">card_giftcard</span>
              <div>
                <h4 className="font-semibold text-sm text-on-secondary-container">Premium Insight</h4>
                <p className="text-xs text-on-secondary-container/80 mt-1">리뷰 10개 달성 시 '미식 전문가' 배지를 획득할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
