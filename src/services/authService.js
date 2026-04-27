import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export async function signUp({ userId, nickname, email, password, phone, vibes, flavors, dietary, allergies, socialId, provider = 'email', displayEmail }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { user_id: userId, nickname, provider },
    },
  });
  if (error) throw error;

  if (data.session) {
    const updatePayload = { phone, vibes, flavors, dietary, allergies };
    if (socialId) updatePayload.social_id = socialId;
    if (displayEmail) updatePayload.email = displayEmail;
    const { error: profileError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('auth_id', data.user.id);
    if (profileError) console.warn('Profile update failed:', profileError.message);
  }

  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('auth_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminGetAllUsers() {
  const [{ data: publicUsers, error }, { data: authProviders }] = await Promise.all([
    supabaseAdmin.from('users').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.rpc('admin_get_auth_providers'),
  ]);
  if (error) throw error;

  const authMap = {};
  (authProviders || []).forEach(({ auth_id, providers }) => {
    authMap[auth_id] = providers;
  });

  return (publicUsers || []).map(u => ({
    ...u,
    providers: authMap[u.auth_id] || [u.provider || 'email'],
  }));
}

export async function adminGetReviewCountsByUser() {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('user_id');
  if (error) throw error;
  const counts = {};
  (data || []).forEach(({ user_id }) => {
    counts[user_id] = (counts[user_id] || 0) + 1;
  });
  return counts;
}

export async function adminDeleteUser(authUserId) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
  if (error) throw error;
}

export async function adminBanUser(authUserId) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ role: 'banned' })
    .eq('auth_id', authUserId);
  if (error) throw error;
}

export async function adminUnbanUser(authUserId) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ role: 'user' })
    .eq('auth_id', authUserId);
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
