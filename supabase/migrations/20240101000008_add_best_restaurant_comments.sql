ALTER TABLE users ADD COLUMN IF NOT EXISTS best_restaurant_comments text[] DEFAULT '{}';
