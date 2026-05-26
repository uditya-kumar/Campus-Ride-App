-- ============================================================================
-- Unread tracking + WhatsApp-style chat sort + host-only join notifications
-- ============================================================================
-- Run this in Supabase Dashboard → SQL editor. After it succeeds, regenerate
-- types:
--   npx supabase gen types typescript --linked > src/database.types.ts

-- ----------------------------------------------------------------------------
-- 1. Per-(user, ride) read marker on bookings.
-- ----------------------------------------------------------------------------
-- Default now() so existing bookings start at "all caught up" — without this,
-- everyone would see giant unread counts on first deploy.
alter table public.bookings
  add column if not exists last_read_at timestamptz not null default now();

-- ----------------------------------------------------------------------------
-- 2. Per-ride "most recent activity" timestamp on rides.
-- ----------------------------------------------------------------------------
alter table public.rides
  add column if not exists last_message_at timestamptz not null default now();

-- Backfill: actual newest message, falling back to ride creation.
update public.rides r
set last_message_at = coalesce(
  (select max(created_at) from public.messages where ride_id = r.id),
  r.created_at,
  now()
);

-- Index supports the ORDER BY in fetch_my_chats.
create index if not exists rides_last_message_at_idx
  on public.rides (last_message_at desc);

-- ----------------------------------------------------------------------------
-- 3. Trigger — every new message bumps its ride's last_message_at.
-- ----------------------------------------------------------------------------
create or replace function public.bump_ride_last_message_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.rides
  set last_message_at = new.created_at
  where id = new.ride_id;
  return new;
end;
$$;

revoke execute on function public.bump_ride_last_message_at()
  from public, anon, authenticated;

drop trigger if exists on_message_insert_bump_ride on public.messages;
create trigger on_message_insert_bump_ride
  after insert on public.messages
  for each row execute function public.bump_ride_last_message_at();

-- ----------------------------------------------------------------------------
-- 4. RPC — caller marks themselves caught up on a ride.
-- ----------------------------------------------------------------------------
create or replace function public.mark_ride_read(p_ride_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  update public.bookings
  set last_read_at = now()
  where ride_id = p_ride_id and user_id = v_user_id;
end;
$$;

revoke execute on function public.mark_ride_read(uuid) from public, anon;
grant  execute on function public.mark_ride_read(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 5. RPC — chat list with unread counts, sorted by recent activity.
-- ----------------------------------------------------------------------------
create or replace function public.fetch_my_chats(p_view text)
returns table (
  id uuid,
  created_by_user_id uuid,
  origin text,
  destination text,
  departure_date timestamptz,
  total_seats int,
  available_seats int,
  total_cost numeric,
  vehicle_type text,
  status text,
  created_at timestamptz,
  cost_per_person numeric,
  last_message_at timestamptz,
  unread_count int
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if p_view not in ('upcoming','past') then raise exception 'Invalid view'; end if;

  return query
  select
    r.id, r.created_by_user_id, r.origin, r.destination, r.departure_date,
    r.total_seats, r.available_seats, r.total_cost, r.vehicle_type,
    r.status, r.created_at, r.cost_per_person, r.last_message_at,
    coalesce((
      select count(*)::int from public.messages m
      where m.ride_id = r.id
        and m.user_id <> v_user_id
        and m.created_at > b.last_read_at
    ), 0) as unread_count
  from public.rides r
  join public.bookings b
    on b.ride_id = r.id and b.user_id = v_user_id
  where
    case when p_view = 'upcoming' then r.departure_date >= v_now
         else                          r.departure_date <  v_now end
  order by r.last_message_at desc;
end;
$$;

revoke execute on function public.fetch_my_chats(text) from public, anon;
grant  execute on function public.fetch_my_chats(text) to authenticated;

-- ----------------------------------------------------------------------------
-- 6. Trigger — when someone joins a ride, push the host (host self-join is
--    suppressed: create_ride inserts the creator's own booking but we skip
--    when joiner == host).
-- ----------------------------------------------------------------------------
create or replace function public.notify_new_member()
returns trigger
language plpgsql
security definer
set search_path = public, net, pg_temp
as $$
declare
  v_url      text;
  v_secret   text;
  v_host_id  uuid;
begin
  select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'edge_function_join_url';
  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'edge_function_key';

  if v_url is null or v_secret is null then return new; end if;

  select created_by_user_id into v_host_id
    from public.rides where id = new.ride_id;

  -- Don't ping the host about their own self-booking from create_ride.
  if v_host_id is null or v_host_id = new.user_id then return new; end if;

  perform net.http_post(
    url := v_url,
    body := jsonb_build_object(
      'ride_id',   new.ride_id,
      'joiner_id', new.user_id,
      'host_id',   v_host_id
    ),
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_secret
    )
  );
  return new;
end;
$$;

revoke execute on function public.notify_new_member()
  from public, anon, authenticated;

drop trigger if exists on_booking_insert_notify on public.bookings;
create trigger on_booking_insert_notify
  after insert on public.bookings
  for each row execute function public.notify_new_member();

-- ============================================================================
-- After running this file, do these three steps:
--
-- 1) Deploy the new edge function:
--      npx supabase functions deploy send-join-push
--
-- 2) Register its URL in Vault (one-time):
--      select vault.create_secret(
--        'https://<project-ref>.functions.supabase.co/send-join-push',
--        'edge_function_join_url',
--        'Edge function endpoint for new-member notifications'
--      );
--
--    The function reuses the same `edge_function_key` Vault secret you set up
--    for send-push, and the same PUSH_TRIGGER_SECRET env var.
--
-- 3) Regenerate types:
--      npx supabase gen types typescript --linked > src/database.types.ts
-- ============================================================================
