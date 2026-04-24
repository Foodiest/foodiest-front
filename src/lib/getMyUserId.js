import { supabase } from './supabase';

export async function getMyUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();
  return data?.id ?? null;
}
