import { supabase } from '../lib/supabase';

export async function createReservation({ restaurantId, date, time, partySize }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      user_id: user.id,
      restaurant_id: restaurantId,
      date,
      time,
      party_size: partySize,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`*, restaurants (id, name, image, cuisine)`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function cancelReservation(id) {
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) throw error;
}

export async function getBookedSlots(restaurantId, date) {
  const { data, error } = await supabase
    .from('reservations')
    .select('time')
    .eq('restaurant_id', restaurantId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed']);

  if (error) throw error;
  return (data || []).map((r) => r.time);
}

export async function getMyReservationForRestaurant(restaurantId) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .in('status', ['pending', 'confirmed'])
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
}
