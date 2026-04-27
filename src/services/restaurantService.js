import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';

async function fetchAvgRatings(restaurantIds) {
  const { data, error } = await supabase
    .from('reviews')
    .select('restaurant_id, rating')
    .in('restaurant_id', restaurantIds);
  if (error) throw error;

  return data.reduce((acc, { restaurant_id, rating }) => {
    if (!acc[restaurant_id]) acc[restaurant_id] = { sum: 0, count: 0 };
    acc[restaurant_id].sum += rating;
    acc[restaurant_id].count += 1;
    return acc;
  }, {});
}

function mergeRating(restaurant, avgMap) {
  const entry = avgMap[restaurant.id];
  const rating = entry ? Math.round((entry.sum / entry.count) * 10) / 10 : 0;
  return { ...restaurant, rating };
}

export async function getAll() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('id');
  if (error) throw error;
  const avgMap = await fetchAvgRatings(data.map(r => r.id));
  return data.map(r => mergeRating(r, avgMap));
}

export async function getById(id) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  const avgMap = await fetchAvgRatings([id]);
  return mergeRating(data, avgMap);
}

export async function search(query) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%`);
  if (error) throw error;
  const avgMap = await fetchAvgRatings(data.map(r => r.id));
  return data.map(r => mergeRating(r, avgMap));
}

const LOCATION_COLS = ['address', 'x', 'y'];

function stripMissingCols(data, error) {
  if (error?.code === 'PGRST204') {
    const col = error.message.match(/'(\w+)' column/)?.[1];
    if (col) { const d = { ...data }; delete d[col]; return d; }
  }
  return null;
}

export async function adminCreate(data) {
  const client = supabaseAdmin ?? supabase;
  let payload = { ...data };
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: result, error } = await client.from('restaurants').insert(payload).select().single();
    if (!error) return result;
    const retryPayload = stripMissingCols(payload, error);
    if (retryPayload) { payload = retryPayload; continue; }
    throw error;
  }
}

export async function adminUpdate(id, data) {
  const client = supabaseAdmin ?? supabase;
  let payload = { ...data };
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: result, error } = await client.from('restaurants').update(payload).eq('id', id).select().single();
    if (!error) return result;
    const retryPayload = stripMissingCols(payload, error);
    if (retryPayload) { payload = retryPayload; continue; }
    throw error;
  }
}

export async function adminDelete(id) {
  const client = supabaseAdmin ?? supabase;
  const { error } = await client
    .from('restaurants')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function filterByPreferences({ vibes = [], flavors = [], dietary = [] }) {
  let query = supabase.from('restaurants').select('*');

  if (vibes.length > 0) query = query.overlaps('vibes', vibes);
  if (flavors.length > 0) query = query.overlaps('flavors', flavors);
  if (dietary.length > 0) query = query.overlaps('dietary', dietary);

  const { data, error } = await query.order('id');
  if (error) throw error;
  const avgMap = await fetchAvgRatings(data.map(r => r.id));
  return data.map(r => mergeRating(r, avgMap));
}
