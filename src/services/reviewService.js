import { cleanProfanity } from '../utils/profanityFilter';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { getMyUserId } from '../lib/getMyUserId';

export async function getByRestaurant(restaurantId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, users(user_id, nickname, profile_image)')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getByUser(userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, restaurants(id, name, image)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function create({ restaurantId, reviewText, rating, images, keywords, negative_reviews }) {
  const userId = await getMyUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');

  const id = `rev-${userId}-${Date.now()}`;

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      id,
      user_id: userId,
      restaurant_id: restaurantId,
      review_text: cleanProfanity(reviewText ?? ''),
      rating,
      images: images ?? [],
      keywords: keywords ?? {},
      negative_keywords: negative_reviews ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function update(reviewId, { reviewText, rating, images, keywords, negative_reviews }) {
  const userId = await getMyUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('reviews')
    .update({
      review_text: cleanProfanity(reviewText ?? ''),
      rating,
      images,
      keywords,
      negative_keywords: negative_reviews ?? [],
    })
    .eq('id', reviewId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAll() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, users(user_id, nickname, profile_image), restaurants(id, name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminRemove(reviewId) {
  const { error } = await supabaseAdmin
    .from('reviews')
    .delete()
    .eq('id', reviewId);
  if (error) throw error;
}

export async function remove(reviewId) {
  const userId = await getMyUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', userId);
  if (error) throw error;
}
