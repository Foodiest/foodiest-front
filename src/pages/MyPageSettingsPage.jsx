import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "../services/authService";
import { uploadProfileImage, uploadCoverImage } from "../services/storageService";
import { search as searchRestaurants, getById } from "../services/restaurantService";
import { cuisineMap } from "../data/mockFilters";

function RestaurantSearchModal({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchRestaurants(query)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
          <span className="material-symbols-outlined text-primary">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="식당 이름 또는 카테고리 검색..."
            className="flex-1 text-sm focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 결과 목록 */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
              <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
              <span className="text-sm">검색 중...</span>
            </div>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-sm">
              검색 결과가 없습니다.
            </div>
          )}
          {!loading && !query.trim() && (
            <div className="py-10 text-center text-slate-400 text-sm">
              식당 이름을 입력해보세요.
            </div>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-orange-50 transition-colors text-left border-b border-slate-50 last:border-none"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-400 text-sm">restaurant</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-on-surface truncate">{r.name}</p>
                <p className="text-xs text-slate-400 truncate">{cuisineMap[r.cuisine] || r.cuisine} {r.price && `• ${r.price}`}</p>
              </div>
              <div className="flex items-center gap-0.5 text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-xs font-semibold">{r.rating}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyPageSettings() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [bio, setBio] = useState("");
  const [bestRestaurants, setBestRestaurants] = useState([null, null, null]);
  const [modalSlot, setModalSlot] = useState(null);
  const [saving, setSaving] = useState(false);

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (!profile) return;
    setBio(profile.bio ?? "");
    setProfileImagePreview(profile.profile_image ?? null);
    setCoverImagePreview(profile.cover_image ?? null);
    const ids = profile.best_restaurants ?? [];
    if (ids.length === 0) return;
    Promise.all(ids.slice(0, 3).map((id) => getById(id).catch(() => null))).then(
      (restaurants) => {
        setBestRestaurants([
          restaurants[0] ?? null,
          restaurants[1] ?? null,
          restaurants[2] ?? null,
        ]);
      }
    );
  }, [profile]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSelect = (slot, restaurant) => {
    setBestRestaurants((prev) => {
      const next = [...prev];
      next[slot] = restaurant;
      return next;
    });
    setModalSlot(null);
  };

  const handleRemove = (slot) => {
    setBestRestaurants((prev) => {
      const next = [...prev];
      next[slot] = null;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        bio: bio.trim(),
        best_restaurants: bestRestaurants.filter(Boolean).map((r) => r.id),
      };
      if (profileImageFile) updates.profile_image = await uploadProfileImage(profileImageFile);
      if (coverImageFile) updates.cover_image = await uploadCoverImage(coverImageFile);
      await updateProfile(updates);
      await refreshProfile();
      navigate(-1);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-3xl font-bold font-[Epilogue]">마이페이지 수정</h2>
        </div>

        <div className="space-y-12">
          {/* 1. 커버 및 프로필 이미지 수정 */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">image</span> 이미지
            </h3>

            {/* 커버 이미지 */}
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative group rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 aspect-[3/1] flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {coverImagePreview ? (
                <>
                  <img src={coverImagePreview} alt="cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-4xl">add_a_photo</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">add_a_photo</span>
                  <p className="text-sm font-medium text-slate-500">커버 이미지 변경</p>
                </>
              )}
            </div>

            {/* 프로필 이미지 */}
            <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
            <div className="flex items-center gap-6 mt-6">
              <div
                onClick={() => profileInputRef.current?.click()}
                className="relative group w-24 h-24 rounded-3xl overflow-hidden bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                {profileImagePreview ? (
                  <>
                    <img src={profileImagePreview} alt="profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                      <span className="material-symbols-outlined text-white text-2xl">edit</span>
                    </div>
                  </>
                ) : (
                  <span className="material-symbols-outlined text-slate-400">person_add</span>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  프로필 사진 변경
                </button>
                <p className="text-xs text-slate-400 mt-2">정사각형 이미지, 최대 2MB 권장</p>
              </div>
            </div>
          </section>

          {/* 2. 프로필 설명 */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">edit_note</span> 프로필 설명
            </h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              rows={3}
              placeholder="나를 소개하는 한 줄을 작성해보세요"
              className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-colors resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{bio.length}/150</p>
          </section>

          {/* 3. 베스트 레스토랑 */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">restaurant</span> 베스트 식당
            </h3>
            <div className="space-y-3">
              {bestRestaurants.map((restaurant, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {restaurant ? (
                      <>
                        <p className="text-sm font-semibold text-on-surface truncate">{restaurant.name}</p>
                        <p className="text-xs text-slate-400 truncate">{restaurant.cuisine} {restaurant.price && `• ${restaurant.price}`}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-300">선택된 식당이 없습니다</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {restaurant && (
                      <button
                        onClick={() => handleRemove(idx)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                    <button
                      onClick={() => setModalSlot(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-orange-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">search</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 저장 버튼 */}
          <div className="pt-10 flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-4 rounded-2xl border border-slate-200 font-semibold text-slate-500 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-[2] py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-orange-200 hover:brightness-110 transition-all disabled:opacity-60"
            >
              {saving ? "저장 중..." : "변경사항 저장"}
            </button>
          </div>
        </div>
      </main>

      {modalSlot !== null && (
        <RestaurantSearchModal
          onSelect={(r) => handleSelect(modalSlot, r)}
          onClose={() => setModalSlot(null)}
        />
      )}
    </Layout>
  );
}
