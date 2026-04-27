import { supabase } from '../lib/supabase';
import { getMyUserId } from '../lib/getMyUserId';

export async function getSavedIds() {
  const userId = await getMyUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('saved_restaurants')
    .select('restaurant_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map(r => r.restaurant_id);
}

export async function isSaved(restaurantId) {
  const userId = await getMyUserId();
  if (!userId) return false;

  const { data, error } = await supabase
    .from('saved_restaurants')
    .select('id')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleSaved(restaurantId) {
  const userId = await getMyUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');

  const saved = await isSaved(restaurantId);

  if (saved) {
    const { error } = await supabase
      .from('saved_restaurants')
      .delete()
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId);
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from('saved_restaurants')
      .insert({ user_id: userId, restaurant_id: restaurantId });
    if (error) throw error;
    return true;
  }
}
