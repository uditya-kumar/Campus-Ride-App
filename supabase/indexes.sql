-- ============================================================================
-- Campus Ride — Performance indexes & RLS plan tweaks
-- ============================================================================
-- Run after rls_policies.sql. All indexes use IF NOT EXISTS so re-running is
-- safe.
-- ============================================================================


-- ============================================================================
-- 1. messages(ride_id, created_at)
-- ============================================================================
-- Drives:
--   * fetchMessages(rideId)  — `WHERE ride_id=$1 ORDER BY created_at ASC`.
--     Composite index serves both the filter and the ORDER BY in one read.
--   * Realtime channel `messages:<rideId>` — every INSERT triggers a
--     `ride_id = eq.X` filter check on the publication.
--   * Also covers the `messages_ride_id_fkey` FK (so cascading delete and the
--     unindexed-FK lint are both resolved).

create index if not exists messages_ride_created_idx
  on public.messages (ride_id, created_at);


-- ============================================================================
-- 2. bookings(user_id)
-- ============================================================================
-- Drives:
--   * useMyBookings        — `bookings WHERE user_id=$1`
--   * fetchMyRides         — `rides JOIN bookings ON bookings.user_id=$1`
-- The existing UNIQUE(ride_id, user_id) index can't help these because its
-- leading column is ride_id. This second index covers user_id-leading lookups
-- and also resolves the bookings_user_id_fkey unindexed-FK lint.

create index if not exists bookings_user_idx
  on public.bookings (user_id);


-- ============================================================================
-- 3. RLS plan optimization — wrap auth.uid() in a SELECT
-- ============================================================================
-- Postgres can hoist `(select auth.<fn>())` to evaluate once per query instead
-- of once per row. The advisor flags this on two policies.

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self"
  on public.users
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "messages_insert_self_and_member" on public.messages;
create policy "messages_insert_self_and_member"
  on public.messages
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.is_ride_member(ride_id)
  );


-- ============================================================================
-- Notes — indexes intentionally NOT created
-- ============================================================================
-- * rides(created_by_user_id) and messages(user_id):
--     The advisor flagged both as unindexed FKs. Neither column is filtered
--     or joined on by any app query (members are read from `bookings`, not
--     by ride creator). The only benefit would be faster CASCADE on user
--     deletion, which is a manual/rare admin action. Not worth the
--     write-amplification cost on every ride / message insert.
--
-- * rides_active_departure (already exists, flagged as "unused"):
--     This is the right index for fetchRides — it's only "unused" because
--     the table currently has ~3 rows and Postgres prefers a seq scan at
--     that scale. Keeping it; once the table grows the planner will pick it.
