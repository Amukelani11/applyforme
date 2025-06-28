-- Add admin user
INSERT INTO "public"."users" (
  "id", 
  "email", 
  "full_name", 
  "subscription_status", 
  "subscription_plan", 
  "trial_end", 
  "created_at", 
  "updated_at", 
  "is_admin", 
  "phone", 
  "address"
) VALUES (
  '683fce0d-2ce0-41de-a684-1e9ddf6ee1cf',
  'doris.maduna@gmail.com',
  'doris maduna',
  'trial',
  null,
  '2025-06-22 16:55:41.310476+00',
  '2025-06-08 16:55:41.310476+00',
  '2025-06-15 22:26:54.601562+00',
  true,
  '0628362814',
  '3174 Plate Thorn Crescent 3174'
) ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  updated_at = CURRENT_TIMESTAMP; 