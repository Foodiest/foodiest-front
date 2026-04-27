import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const REPORT_TYPE = {
  REVIEW_EVENT: 'review_event',
  REVIEW: 'review',
};

export async function submitReport({ reportType, reviewId, restaurantId, reportedUserId }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const payload = {
    reporter_id: user.id,
    report_type: reportType,
    review_id: reviewId ?? null,
    restaurant_id: restaurantId ?? null,
    reported_user_id: reportedUserId ?? null,
  };

  const { error } = await supabase.from('reports').insert(payload);
  if (error) {
    if (error.code === '23505') throw new Error('ALREADY_REPORTED');
    throw error;
  }
}

export async function hasReported({ reportType, reviewId, restaurantId, reportedUserId }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  let query = supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('reporter_id', user.id)
    .eq('report_type', reportType);

  if (reviewId) query = query.eq('review_id', reviewId);
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);
  if (reportedUserId) query = query.eq('reported_user_id', reportedUserId);

  const { count } = await query;
  return (count ?? 0) > 0;
}

export async function cancelReport({ reportType, reviewId, restaurantId, reportedUserId }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  let query = supabase
    .from('reports')
    .delete()
    .eq('reporter_id', user.id)
    .eq('report_type', reportType);

  if (reviewId) query = query.eq('review_id', reviewId);
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);
  if (reportedUserId) query = query.eq('reported_user_id', reportedUserId);

  const { error } = await query;
  if (error) throw error;
}

export async function getEventReportCountsByRestaurant() {
  const { data, error } = await supabase
    .from('reports')
    .select('restaurant_id')
    .eq('report_type', REPORT_TYPE.REVIEW_EVENT)
    .not('restaurant_id', 'is', null);
  if (error) throw error;
  const counts = {};
  (data || []).forEach(({ restaurant_id }) => {
    counts[restaurant_id] = (counts[restaurant_id] || 0) + 1;
  });
  return counts;
}

export async function getReportedReviews() {
  const { data: reportRows, error: reportError } = await supabaseAdmin
    .from('reports')
    .select('review_id')
    .eq('report_type', REPORT_TYPE.REVIEW)
    .not('review_id', 'is', null);
  if (reportError) throw reportError;

  const countMap = {};
  (reportRows || []).forEach(({ review_id }) => {
    countMap[review_id] = (countMap[review_id] || 0) + 1;
  });

  const reviewIds = Object.keys(countMap);
  if (reviewIds.length === 0) return [];

  const { data: reviews, error: reviewError } = await supabaseAdmin
    .from('reviews')
    .select('*, users(user_id, nickname, profile_image), restaurants(id, name)')
    .in('id', reviewIds);
  if (reviewError) throw reviewError;

  return (reviews || [])
    .map(r => ({ ...r, reportCount: countMap[r.id] || 0 }))
    .sort((a, b) => b.reportCount - a.reportCount);
}

export async function getReportCount({ reportType, reviewId, restaurantId, reportedUserId }) {
  let query = supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('report_type', reportType);

  if (reviewId) query = query.eq('review_id', reviewId);
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);
  if (reportedUserId) query = query.eq('reported_user_id', reportedUserId);

  const { count } = await query;
  return count ?? 0;
}
