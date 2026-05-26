-- ============================================================================
-- Add public.bookings to the realtime publication so member changes broadcast.
-- ============================================================================
-- Without this, leaving a ride only updates the leaver's own client. Other
-- members keep seeing the stale member list (and the chat keeps showing the
-- left user's name) until the 60s staleTime runs out.
--
-- Run this once in Supabase Dashboard → SQL editor.

alter publication supabase_realtime add table public.bookings;

-- Verify:
--   select schemaname, tablename from pg_publication_tables
--   where pubname = 'supabase_realtime';
-- Should now list both `messages` and `bookings`.
