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
