import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "../services/authService";
import { vibes, flavors, dietary, allergies } from "../data/mockFilters";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, isLoading, session, refreshProfile } = useAuth();

  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !session) navigate("/login");
  }, [isLoading, session, navigate]);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname ?? "");
      setBio(profile.bio ?? "");
      setSelectedVibes(profile.vibes ?? []);
      setSelectedFlavors(profile.flavors ?? []);
      setSelectedDietary(profile.dietary ?? []);
      setSelectedAllergies(profile.allergies ?? []);
    }
  }, [profile]);

  const toggle = (setList, item) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        vibes: selectedVibes,
        flavors: selectedFlavors,
        dietary: selectedDietary,
        allergies: selectedAllergies,
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err.message || "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !profile) return null;

  return (
    <Layout>
      <main className="max-w-4xl mx-auto px-6 py-10 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <div>
            <h1 className="font-[Epilogue] text-2xl font-bold text-on-surface">기본 정보 수정</h1>
            <p className="text-sm text-slate-500 mt-0.5">닉네임과 취향 정보를 변경할 수 있어요.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 닉네임 */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-[Epilogue] text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">person</span>
              기본 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">닉네임</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  placeholder="닉네임을 입력하세요"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{nickname.length}/20</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">프로필 설명</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  rows={3}
                  placeholder="나를 소개하는 한 줄을 작성해보세요"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-colors resize-none"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{bio.length}/150</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">이메일</label>
                <input
                  type="text"
                  value={profile.email ?? ""}
                  disabled
                  className="w-full border border-slate-100 rounded-xl px-4 py-3 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* Vibe */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-[Epilogue] text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">mood</span>
              다이닝 분위기
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {vibes.map((v) => {
                const active = selectedVibes.includes(v.value);
                return (
                  <button
                    key={v.value}
                    onClick={() => toggle(setSelectedVibes, v.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all active:scale-95 ${
                      active
                        ? "bg-primary-container text-white border-primary-container shadow-sm"
                        : "border-slate-200 text-slate-600 bg-white hover:border-orange-300"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {v.icon}
                    </span>
                    {v.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Flavor */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-[Epilogue] text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">restaurant_menu</span>
              맛 프로필
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {flavors.map(({ label, value, icon }) => {
                const active = selectedFlavors.includes(value);
                return (
                  <div
                    key={value}
                    onClick={() => toggle(setSelectedFlavors, value)}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                      active
                        ? "border-primary-container bg-orange-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                      <span className="font-medium text-sm">{label}</span>
                    </div>
                    <input
                      type="checkbox"
                      readOnly
                      checked={active}
                      className="rounded text-primary focus:ring-primary h-4 w-4 border-slate-300"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dietary */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-[Epilogue] text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">health_and_safety</span>
              식이 요건
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {dietary.map((item) => {
                const active = selectedDietary.includes(item.value);
                return (
                  <button
                    key={item.value}
                    onClick={() => toggle(setSelectedDietary, item.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl transition-all active:scale-95 ${
                      active
                        ? "border-primary-container bg-orange-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${active ? "text-primary" : "text-slate-400"}`}
                      style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    <span className={`font-medium text-sm ${active ? "text-on-primary-container" : "text-slate-600"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Allergies */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-[Epilogue] text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">warning</span>
              알레르기 정보
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {allergies.map((item) => {
                const active = selectedAllergies.includes(item.value);
                return (
                  <button
                    key={item.value}
                    onClick={() => toggle(setSelectedAllergies, item.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl transition-all active:scale-95 ${
                      active
                        ? "border-primary-container bg-orange-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${active ? "text-primary" : "text-slate-400"}`}
                    >
                      nutrition
                    </span>
                    <span className={`font-medium text-sm ${active ? "text-on-primary-container" : "text-slate-600"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors active:scale-95"
          >
            취소
          </button>
          <div className="flex items-center gap-3">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                저장되었습니다
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-100 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
