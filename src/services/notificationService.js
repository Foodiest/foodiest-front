import { supabase } from '../lib/supabase';

export async function getMyNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) throw error;
  if (!data?.length) return [];

  const fromIds = [...new Set(data.filter((n) => n.from_user_id).map((n) => n.from_user_id))];
  const { data: users } = await supabase
    .from('users')
    .select('auth_id, user_id, nickname, profile_image')
    .in('auth_id', fromIds);

  const userMap = Object.fromEntries((users || []).map((u) => [u.auth_id, u]));
  return data.map((n) => ({ ...n, from_user: userMap[n.from_user_id] ?? null }));
}

export async function markAllAsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) throw error;
}

export async function getUnreadCount() {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) return 0;
  return count ?? 0;
}
