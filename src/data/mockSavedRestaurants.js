// DB 테이블 구조 기준 목데이터
// saved_restaurants: id | userId | restaurantId | savedAt
export const mockSavedRestaurants = [
  { id: 1, userId: 1, restaurantId: 1, savedAt: '2025-03-10T09:15:00Z' },
  { id: 2, userId: 1, restaurantId: 3, savedAt: '2025-03-18T14:30:00Z' },
  { id: 3, userId: 2, restaurantId: 2, savedAt: '2025-04-01T11:00:00Z' },
  { id: 4, userId: 2, restaurantId: 4, savedAt: '2025-04-05T18:45:00Z' },
  { id: 5, userId: 3, restaurantId: 1, savedAt: '2025-04-10T20:00:00Z' },
  { id: 6, userId: 3, restaurantId: 5, savedAt: '2025-04-12T13:20:00Z' },
];

const STORAGE_KEY = 'savedRestaurants';

function getAll() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSavedRestaurants));
  return mockSavedRestaurants;
}

function saveAll(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function nextId(records) {
  return records.length === 0 ? 1 : Math.max(...records.map(r => r.id)) + 1;
}

export function getSavedIds(userId) {
  return getAll()
    .filter(r => r.userId === userId)
    .map(r => r.restaurantId);
}

export function isSaved(userId, restaurantId) {
  return getAll().some(r => r.userId === userId && r.restaurantId === restaurantId);
}

export function toggleSaved(userId, restaurantId) {
  const records = getAll();
  const existing = records.find(r => r.userId === userId && r.restaurantId === restaurantId);

  const updated = existing
    ? records.filter(r => r.id !== existing.id)
    : [...records, { id: nextId(records), userId, restaurantId, savedAt: new Date().toISOString() }];

  saveAll(updated);
  return updated.filter(r => r.userId === userId).map(r => r.restaurantId);
}
