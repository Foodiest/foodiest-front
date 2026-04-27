import { useState, useEffect, useRef } from "react";
import { submitReport, hasReported, REPORT_TYPE } from "../services/reportService";
import { useAuth } from "../contexts/AuthContext";

export default function ReviewReportButton({ reviewId }) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!session || !reviewId) return;
    hasReported({ reportType: REPORT_TYPE.REVIEW, reviewId }).then(setReported);
  }, [session, reviewId]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!session) return null;

  if (reported) {
    return (
      <span className="flex items-center gap-0.5 text-[11px] text-red-300 select-none">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
        신고됨
      </span>
    );
  }

  const handleReport = async () => {
    setLoading(true);
    try {
      await submitReport({ reportType: REPORT_TYPE.REVIEW, reviewId });
      setReported(true);
      setOpen(false);
    } catch (e) {
      if (e.message === "ALREADY_REPORTED") setReported(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-0.5 text-[11px] text-slate-300 hover:text-red-400 transition-colors"
        title="리뷰 신고"
      >
        <span className="material-symbols-outlined text-sm">flag</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-30 w-44 overflow-hidden">
          <p className="px-4 py-2.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
            이 리뷰를 신고하시겠어요?
          </p>
          <div className="px-4 py-3 flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleReport}
              disabled={loading}
              className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {loading ? "..." : "신고하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
