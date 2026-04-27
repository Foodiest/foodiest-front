import { supabase } from '../lib/supabase';

export async function getByRestaurant(restaurantId) {
  const { data, error } = await supabase
    .from('menus')
    .select('id, name, price')
    .eq('restaurant_id', restaurantId)
    .order('id');
  if (error) throw error;
  return data;
}
