-- ============================================================================
-- Karpool — Row Level Security Policies
-- ============================================================================
-- Strategy
--   * All four tables get RLS enabled.
--   * Reads happen directly from the client; SELECT policies define visibility.
--   * Multi-row writes go through three Postgres RPCs (create_ride, join_ride,
--     leave_ride) which are converted to SECURITY DEFINER. They already gate on
--     auth.uid() internally, so they don't need permissive table policies.
--   * Direct INSERT/UPDATE/DELETE from the client is otherwise blocked, except
--     for the user updating their own profile and posting their own messages.
--
-- Apply order: run table by table in the sections below.
-- ============================================================================


-- ============================================================================
-- 0. Helper function — is_ride_member()
-- ============================================================================
-- Used by `bookings` and `messages` policies. Wrapped as SECURITY DEFINER so
-- the inner lookup on `bookings` doesn't recurse through the bookings policy
-- (Postgres would otherwise re-check RLS on the subquery).

create or replace function public.is_ride_member(p_ride_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bookings
    where ride_id = p_ride_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_ride_member(uuid) from public;
grant execute on function public.is_ride_member(uuid) to authenticated;


-- ============================================================================
-- 1. users
-- ============================================================================
-- Read patterns
--   * Embedded as `user:users(full_name, avatar_url)` from fetchMessages and
--     fetchRideMembers. Every authenticated user needs to read enough of the
--     `users` table to render names/avatars of co-members.
-- Write patterns
--   * INSERT happens only via the `handle_new_user` SECURITY DEFINER trigger
--     on auth.users — bypasses RLS, no client policy needed.
--   * UPDATE will be used by the future profile/avatar screen; restricted to
--     the user's own row.
--   * No client DELETE; auth.users cascade handles account removal.

alter table public.users enable row level security;

-- Visible to any signed-in user (needed for embedded selects).
create policy "users_select_authenticated"
  on public.users
  for select
  to authenticated
  using (true);

-- Self-update only.
create policy "users_update_self"
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());


-- ============================================================================
-- 2. rides
-- ============================================================================
-- Read patterns
--   * fetchRides — browse all active rides (filters server-side: status,
--     available_seats, departure_date).
--   * fetchRide — single ride detail.
--   * fetchMyRides — rides the current user is booked into.
--   None of these need stricter visibility than "any authenticated user can
--   browse rides."
-- Write patterns
--   * create_ride (RPC) — inserts the ride.
--   * join_ride / leave_ride (RPCs) — update available_seats.
--   All three RPCs become SECURITY DEFINER below. No direct client writes.

alter table public.rides enable row level security;

create policy "rides_select_authenticated"
  on public.rides
  for select
  to authenticated
  using (true);

-- No insert/update/delete policies — direct table writes are blocked.
-- Mutations are funnelled through the RPCs in section 5.


-- ============================================================================
-- 3. bookings
-- ============================================================================
-- Read patterns
--   * useMyBookings — the user's own ride_ids (Set for O(1) lookup).
--   * fetchRideMembers — all members of a given ride (used by chat header,
--     info screen, and "User left" derivation in chat). Only co-members
--     should see the member list.
-- Write patterns
--   * INSERT via create_ride (creator's booking) and join_ride (joining user).
--   * DELETE via leave_ride.
--   All three RPCs are SECURITY DEFINER. No direct client writes.

alter table public.bookings enable row level security;

-- A user can read a booking row if they are themselves a member of that ride.
-- (Their own booking row trivially satisfies this; co-member bookings also
-- satisfy it. Non-members see nothing.)
create policy "bookings_select_ride_members"
  on public.bookings
  for select
  to authenticated
  using (public.is_ride_member(ride_id));

-- No insert/update/delete policies — direct table writes are blocked.


-- ============================================================================
-- 4. messages
-- ============================================================================
-- Read patterns
--   * fetchMessages (initial load) and the Supabase Realtime channel both
--     filter by ride_id. Messages must be visible only to ride members.
--     Realtime applies the SELECT policy to broadcast events, so non-members
--     get nothing.
-- Write patterns
--   * sendMessage — direct INSERT from the client. The user must be a member
--     of the ride and the row's user_id must match auth.uid().
--   * No UPDATE / DELETE — chat history is immutable. Read receipts (future
--     feature on `read_by`) will need a follow-up UPDATE policy.

alter table public.messages enable row level security;

create policy "messages_select_ride_members"
  on public.messages
  for select
  to authenticated
  using (public.is_ride_member(ride_id));

create policy "messages_insert_self_and_member"
  on public.messages
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_ride_member(ride_id)
  );


-- ============================================================================
-- 5. RPC hardening — flip create_ride / join_ride / leave_ride to DEFINER
-- ============================================================================
-- Each RPC checks auth.uid() at the top of its body, so running with the
-- function-owner's privileges is safe. SECURITY DEFINER bypasses RLS on the
-- tables they touch, which is required because:
--   * leave_ride deletes the booking *before* updating rides.available_seats.
--     A member-based UPDATE policy on rides would block that final UPDATE.
--   * join_ride must INSERT into bookings then UPDATE rides.available_seats.
--     Allowing a free authenticated UPDATE on rides would let any client
--     mutate seats out-of-band.
-- search_path is pinned so a malicious search_path can't shadow `public`.

alter function public.create_ride(text, text, timestamptz, integer, numeric, text)
  security definer
  set search_path = public, pg_temp;

alter function public.join_ride(uuid)
  security definer
  set search_path = public, pg_temp;

alter function public.leave_ride(uuid)
  security definer
  set search_path = public, pg_temp;

-- Lock down EXECUTE: only authenticated users invoke these (anon should never
-- be able to call them).
revoke execute on function public.create_ride(text, text, timestamptz, integer, numeric, text) from public, anon;
revoke execute on function public.join_ride(uuid) from public, anon;
revoke execute on function public.leave_ride(uuid) from public, anon;

grant execute on function public.create_ride(text, text, timestamptz, integer, numeric, text) to authenticated;
grant execute on function public.join_ride(uuid) to authenticated;
grant execute on function public.leave_ride(uuid) to authenticated;


-- ============================================================================
-- 6. Defense-in-depth — strip default grants the advisor flagged
-- ============================================================================
-- Supabase ships with broad default GRANTs on `anon`/`authenticated` that get
-- filtered by RLS. With RLS in place these are dead grants, but they leave
-- tables discoverable in the GraphQL schema and `anon` callable on the
-- helper/trigger functions. Tightening them removes the surface entirely.

-- 6a. Anon should not see or touch any table — they aren't signed in.
revoke select, insert, update, delete on public.users    from anon;
revoke select, insert, update, delete on public.rides    from anon;
revoke select, insert, update, delete on public.bookings from anon;
revoke select, insert, update, delete on public.messages from anon;

-- 6b. Authenticated users only need direct writes on tables that have
-- INSERT/UPDATE policies (users for self-update, messages for sendMessage).
-- Everything else flows through the RPCs in section 5.
revoke insert, update, delete on public.rides    from authenticated;
revoke insert, update, delete on public.bookings from authenticated;
revoke insert,         delete on public.users    from authenticated;
revoke         update, delete on public.messages from authenticated;

-- 6c. handle_new_user is an auth.users trigger. It must not be RPC-callable.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 6d. is_ride_member is an internal helper for our RLS policies. Belongs to
-- the policy machinery, not the public API.
revoke execute on function public.is_ride_member(uuid) from public, anon;
-- (authenticated keeps EXECUTE so policy evaluation can call it on their
-- behalf — without this, every member-check would fail.)
