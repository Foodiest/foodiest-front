import { supabaseAdmin } from '../lib/supabaseAdmin';

export async function adminGetKpiStats() {
  const [
    { count: userCount },
    { count: reviewCount },
    { count: restaurantCount },
    { count: reportCount },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('restaurants').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('report_type', 'review')
      .not('review_id', 'is', null),
  ]);
  return {
    userCount: userCount ?? 0,
    reviewCount: reviewCount ?? 0,
    restaurantCount: restaurantCount ?? 0,
    reportCount: reportCount ?? 0,
  };
}

export async function adminGetWeeklyReviewCounts() {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('created_at')
    .gte('created_at', start.toISOString());
  if (error) throw error;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const counts = Object.fromEntries(days.map((d) => [d, 0]));
  (data || []).forEach((r) => {
    const key = r.created_at.slice(0, 10);
    if (key in counts) counts[key]++;
  });

  return days.map((date) => ({ date, count: counts[date] }));
}

export async function adminGetSentimentStats() {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('rating');
  if (error) throw error;

  const total = (data || []).length;
  if (total === 0) return { positive: 0, neutral: 0, negative: 0, total: 0 };

  let positive = 0, neutral = 0, negative = 0;
  data.forEach(({ rating }) => {
    if (rating >= 4) positive++;
    else if (rating === 3) neutral++;
    else negative++;
  });

  return {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
    total,
  };
}

export async function adminGetTopKeywords(limit = 10) {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('negative_keywords, keywords');
  if (error) throw error;

  const freq = {};
  (data || []).forEach((r) => {
    (r.negative_keywords || []).forEach((kw) => {
      if (kw) freq[kw] = (freq[kw] || 0) + 1;
    });
    if (r.keywords && typeof r.keywords === 'object') {
      const list = Array.isArray(r.keywords)
        ? r.keywords
        : [...(r.keywords.positive || []), ...(r.keywords.negative || [])];
      list.forEach((kw) => {
        if (kw) freq[kw] = (freq[kw] || 0) + 1;
      });
    }
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([kw]) => kw);
}

export async function adminGetMonthlyUserGrowth(months = 4) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('created_at');
  if (error) throw error;

  const buckets = {};
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getMonth() + 1}월`;
    buckets[key] = { label, count: 0 };
  }

  (data || []).forEach((u) => {
    const key = u.created_at.slice(0, 7);
    if (buckets[key]) buckets[key].count++;
  });

  const values = Object.values(buckets).map((b) => b.count);
  const maxVal = Math.max(...values, 1);
  const colors = ['bg-slate-300', 'bg-secondary/60', 'bg-secondary', 'bg-primary'];

  return Object.values(buckets).map((b, i) => ({
    month: b.label,
    value: b.count,
    pct: Math.round((b.count / maxVal) * 100),
    color: colors[i] ?? 'bg-primary',
  }));
}
