import { supabase } from '../lib/supabase';

export async function signUp({ userId, nickname, email, password, phone, vibes, flavors, dietary, allergies, socialId }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { user_id: userId, nickname, provider: socialId || 'email' },
    },
  });
  if (error) throw error;

  // auto_confirm_email 트리거로 인해 세션이 즉시 생성됨
  // 세션이 있을 때만 profile update 실행 (없으면 이메일 인증 대기 상태)
  if (data.session) {
    const updatePayload = { phone, vibes, flavors, dietary, allergies };
    if (socialId) updatePayload.social_id = socialId;
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

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
