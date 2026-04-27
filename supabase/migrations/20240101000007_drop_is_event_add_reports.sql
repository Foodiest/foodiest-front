ALTER TABLE reviews DROP COLUMN IF EXISTS is_event;

CREATE TABLE IF NOT EXISTS reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  review_id text REFERENCES reviews(id) ON DELETE CASCADE,
  restaurant_id integer REFERENCES restaurants(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_reporter_review_type UNIQUE (reporter_id, report_type, review_id),
  CONSTRAINT unique_reporter_restaurant_type UNIQUE (reporter_id, report_type, restaurant_id),
  CONSTRAINT unique_reporter_user_type UNIQUE (reporter_id, report_type, reported_user_id)
);
