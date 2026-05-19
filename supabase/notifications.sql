-- ============================================================================
-- Push notification tokens
-- ============================================================================
-- One row per (user_id, device). A user can have multiple devices; each device
-- gets one token. We replace on conflict so reinstalls update the existing row.

create table public.notification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notification_tokens_user_idx
  on public.notification_tokens (user_id);

alter table public.notification_tokens enable row level security;

-- Users only see/manage their own tokens.
create policy "tokens_select_self"
  on public.notification_tokens for select to authenticated
  using (user_id = (select auth.uid()));

create policy "tokens_insert_self"
  on public.notification_tokens for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "tokens_update_self"
  on public.notification_tokens for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "tokens_delete_self"
  on public.notification_tokens for delete to authenticated
  using (user_id = (select auth.uid()));

-- Lock down direct table access (defense in depth, mirrors rls_policies.sql §6).
revoke all on public.notification_tokens from anon;
revoke truncate, references, trigger on public.notification_tokens from authenticated;


-- ============================================================================
-- Trigger — fan out new chat messages to a "notify" queue via pg_net
-- ============================================================================
-- We don't call the Expo API directly from Postgres. Instead, we POST to our
-- own Edge Function, which has access to env secrets and can batch sends.

-- pg_net installs into its own `net` schema on Supabase. Don't pin it to
-- `extensions` — the function lives at `net.http_post`.
create extension if not exists pg_net;

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public, net
as $$
declare
  v_url      text := current_setting('app.edge_function_url', true);
  v_anon_key text := current_setting('app.edge_function_key', true);
begin
  if v_url is null or v_anon_key is null then
    return new;  -- not configured yet, silently no-op
  end if;

  perform net.http_post(
    url     := v_url,
    body    := jsonb_build_object(
      'message_id', new.id,
      'ride_id',    new.ride_id,
      'sender_id',  new.user_id,
      'content',    new.content
    ),
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    )
  );
  return new;
end;
$$;

create trigger on_message_insert_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();