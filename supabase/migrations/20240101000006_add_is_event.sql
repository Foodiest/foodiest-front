ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_event boolean DEFAULT false;
