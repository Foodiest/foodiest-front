import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function MyPageSettings() {
  const navigate = useNavigate();

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
          <h2 className="text-3xl font-bold font-[Epilogue]">Edit My Page</h2>
        </div>

        <div className="space-y-12">
          {/* 1. 커버 및 프로필 이미지 수정 */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">image</span> Visuals
            </h3>
            <div className="relative group rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 aspect-[3/1] flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">
                add_a_photo
              </span>
              <p className="text-sm font-medium text-slate-500">
                Change Cover Image
              </p>
            </div>

            <div className="flex items-center gap-6 mt-6">
              <div className="w-24 h-24 rounded-3xl bg-slate-200 flex items-center justify-center border-2 border-dashed border-slate-300">
                <span className="material-symbols-outlined text-slate-400">
                  person_add
                </span>
              </div>
              <div>
                <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Upload Profile Picture
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  Recommended: Square image, max 2MB
                </p>
              </div>
            </div>
          </section>

          {/* 2. 베스트 레스토랑 수정 */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">restaurant</span> Best
              Restaurants
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                    {num}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400">
                      Restaurant #{num}
                    </p>
                    <input
                      type="text"
                      placeholder="Search restaurant to add..."
                      className="w-full mt-1 text-sm border-none focus:ring-0 p-0 placeholder:text-slate-300"
                    />
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined">search</span>
                  </button>
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
              Cancel
            </button>
            <button className="flex-[2] py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-orange-200 hover:brightness-110 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
