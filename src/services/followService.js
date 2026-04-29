import { supabase } from '../lib/supabase';

async function getMyAuthId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function follow(followingAuthId) {
  const authId = await getMyAuthId();
  if (!authId) throw new Error('로그인이 필요합니다.');
  const { error } = await supabase
    .from('follows')
    .insert({ follower_auth_id: authId, following_auth_id: followingAuthId });
  if (error) throw error;

  // 팔로우 알림 생성 (실패해도 팔로우 자체는 유지)
  supabase.from('notifications').insert({
    user_id: followingAuthId,
    type: 'follow',
    from_user_id: authId,
  }).then();
}

export async function unfollow(followingAuthId) {
  const authId = await getMyAuthId();
  if (!authId) throw new Error('로그인이 필요합니다.');
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_auth_id', authId)
    .eq('following_auth_id', followingAuthId);
  if (error) throw error;
}

export async function checkIsFollowing(followingAuthId) {
  const authId = await getMyAuthId();
  if (!authId) return false;
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_auth_id', authId)
    .eq('following_auth_id', followingAuthId)
    .maybeSingle();
  return !!data;
}

export async function getFollowing(authId) {
  const { data: followRows, error } = await supabase
    .from('follows')
    .select('following_auth_id')
    .eq('follower_auth_id', authId);
  if (error) throw error;
  if (!followRows?.length) return [];

  const authIds = followRows.map((r) => r.following_auth_id);
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('user_id, nickname, profile_image, auth_id')
    .in('auth_id', authIds);
  if (usersError) throw usersError;
  return users ?? [];
}

export async function getFollowersCount(authId) {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_auth_id', authId);
  if (error) return 0;
  return count ?? 0;
}

export async function getFollowingCount(authId) {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_auth_id', authId);
  if (error) return 0;
  return count ?? 0;
}

export async function getFollowingFeed(authId) {
  const { data: followRows, error } = await supabase
    .from('follows')
    .select('following_auth_id')
    .eq('follower_auth_id', authId);
  if (error || !followRows?.length) return { users: [], reviews: [] };

  const authIds = followRows.map((r) => r.following_auth_id);

  const { data: users } = await supabase
    .from('users')
    .select('id, user_id, nickname, profile_image, auth_id')
    .in('auth_id', authIds);
  if (!users?.length) return { users: [], reviews: [] };

  const dbUserIds = users.map((u) => u.id);
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, users(user_id, nickname, profile_image), restaurants(id, name, image)')
    .in('user_id', dbUserIds)
    .order('created_at', { ascending: false })
    .limit(50);

  return { users, reviews: reviews ?? [] };
}
