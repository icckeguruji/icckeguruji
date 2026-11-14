-- IDEAL COACHING CENTRE (ICC)
-- Migration 05: Push Notifications & Device Token Architecture

-- 1. Ensure profiles has push_token column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
COMMENT ON COLUMN public.profiles.push_token IS 'Expo / FCM device push notification token';

-- 2. Enhance notifications table for multi-platform broadcast
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_board TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_class TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'announcement';

-- 3. Enable Realtime on notifications table for instant app delivery
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
