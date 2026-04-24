import { supabase } from '../lib/supabase';

export async function getAll() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('id');
  if (error) throw error;
  return data;
}

export async function getById(id) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function search(query) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%`);
  if (error) throw error;
  return data;
}

export async function filterByPreferences({ vibes = [], flavors = [], dietary = [] }) {
  let query = supabase.from('restaurants').select('*');

  if (vibes.length > 0) {
    query = query.overlaps('vibes', vibes);
  }
  if (flavors.length > 0) {
    query = query.overlaps('flavors', flavors);
  }
  if (dietary.length > 0) {
    query = query.overlaps('dietary', dietary);
  }

  const { data, error } = await query.order('id');
  if (error) throw error;
  return data;
}
