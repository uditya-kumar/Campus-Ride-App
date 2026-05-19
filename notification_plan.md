I have what I need. Here's the complete implementation guide.

---

# Push Notifications — Implementation Guide

This stack is **Expo SDK 54 + Supabase + EAS**. We'll use Expo's push service (you already have an EAS project — `eas.json` exists in your repo). The flow:

```
User opens app
   ↓
Register device → get ExpoPushToken
   ↓
Save token to Postgres (notification_tokens table)
   ↓
Someone sends a chat message
   ↓
Postgres trigger → Edge Function → Expo Push API → user's device
```

---

## Phase 0 — Prerequisites

You need EAS Build set up for both platforms. iOS push won't work in Expo Go and Android push needs FCM v1 credentials. If you've never built the app via EAS, do this first:

```powershell
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --profile development --platform all
```

Install the resulting development build on your test devices.

**Android FCM v1 setup** (one-time): create a Firebase project, generate a `google-services.json`, and upload it via `eas credentials` → Android → Push Notifications → FCM v1. Full walkthrough: [Expo FCM credentials](https://docs.expo.dev/push-notifications/fcm-credentials).

**iOS APNs setup** (one-time): EAS handles this automatically the first time you run `eas build` and asks for your Apple credentials.

---

## Phase 1 — Database

Create a new SQL file `supabase/notifications.sql`:

```sql
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
```

After running this, set the two GUCs from Supabase Dashboard → SQL Editor:

```sql
alter database postgres set app.edge_function_url = 'https://zwdjjlcpyfbybjdexdji.functions.supabase.co/send-push';
alter database postgres set app.edge_function_key = 'YOUR_SERVICE_ROLE_KEY';
```

(Service role key, not anon key — the Edge Function will validate it.)

Then regenerate types:

```powershell
npx supabase gen types typescript --linked > src/database.types.ts
```

---

## Phase 2 — Client: register the device

### Install packages

```powershell
npx expo install expo-notifications expo-device expo-constants
```

### Update [app.json](app.json)

Add the plugin and (optional) icon/sound config:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#2c7cfe"
        }
      ]
    ]
  }
}
```

### Create [src/libs/pushNotifications.ts](src/libs/pushNotifications.ts)

```ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "@/libs/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(
  userId: string,
): Promise<string | null> {
  if (!Device.isDevice) return null; // simulators can't receive push

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2c7cfe",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) {
    if (__DEV__) console.warn("EAS projectId missing — push disabled");
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  // Upsert by expo_push_token so multiple installs / account switches work.
  await supabase
    .from("notification_tokens")
    .upsert(
      {
        user_id: userId,
        expo_push_token: token,
        platform: Platform.OS as "ios" | "android",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "expo_push_token" },
    );

  return token;
}
```

### Wire it into [src/providers/AuthProvider.tsx](src/providers/AuthProvider.tsx)

After auth resolves, register the token. Add a `useEffect` that fires when `session?.user.id` becomes truthy:

```ts
useEffect(() => {
  const userId = session?.user.id;
  if (!userId) return;
  registerForPushNotifications(userId).catch((err) => {
    if (__DEV__) console.warn("push registration failed:", err);
  });
}, [session?.user.id]);
```

### Handle taps — navigate to the chat (warm + cold start)

`addNotificationResponseReceivedListener` only fires for taps **while the app is running**. If the user taps a push when the app is killed, the listener never sees the launching tap. Cover both cases:

In [src/app/_layout.tsx](src/app/_layout.tsx):

```ts
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { router } from "expo-router";

// inside RootLayout component body:
const lastResponse = Notifications.useLastNotificationResponse();
const handledRef = useRef<string | null>(null);

// Cold-start handler: useLastNotificationResponse returns the response that
// launched the app (if any), then keeps returning it across re-renders.
// Track the request id so we navigate exactly once.
useEffect(() => {
  if (!lastResponse) return;
  const id = lastResponse.notification.request.identifier;
  if (handledRef.current === id) return;
  handledRef.current = id;
  const rideId = lastResponse.notification.request.content.data?.rideId as
    | string
    | undefined;
  if (rideId) router.push(`/message/${rideId}`);
}, [lastResponse]);

// Warm-state handler: taps that arrive while the app is foregrounded.
useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener((res) => {
    const rideId = res.notification.request.content.data?.rideId as
      | string
      | undefined;
    if (rideId) router.push(`/message/${rideId}`);
  });
  return () => sub.remove();
}, []);
```

The `handledRef` guard prevents the cold-start path from re-navigating on every re-render of `_layout.tsx`. `router.push(\`/message/${rideId}\`)` is the same pattern already used in [src/app/(tabs)/message/[id]/index.tsx:132](src/app/(tabs)/message/[id]/index.tsx#L132).

---

## Phase 3 — Edge Function (the actual sender)

```powershell
npx supabase functions new send-push
```

Replace [supabase/functions/send-push/index.ts](supabase/functions/send-push/index.ts):

```ts
// Use the npm: specifier — current Supabase recommendation for Edge Functions
// (esm.sh works but is no longer the documented path).
import { createClient } from "npm:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface Payload {
  message_id: string;
  ride_id: string;
  sender_id: string;
  content: string;
}

Deno.serve(async (req) => {
  // The trigger sends the service-role key as Bearer; reject everything else.
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const { ride_id, sender_id, content }: Payload = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Look up sender name (for the notification title).
  const { data: sender } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", sender_id)
    .single();

  // 2. Look up ride origin/destination (so the title says "Pune → Mumbai").
  const { data: ride } = await supabase
    .from("rides")
    .select("origin, destination")
    .eq("id", ride_id)
    .single();

  // 3. Find every member of this ride EXCEPT the sender, then their tokens.
  const { data: rows } = await supabase
    .from("bookings")
    .select("user_id")
    .eq("ride_id", ride_id)
    .neq("user_id", sender_id);

  const recipientIds = (rows ?? []).map((r) => r.user_id);
  if (recipientIds.length === 0) return new Response("no recipients");

  const { data: tokens } = await supabase
    .from("notification_tokens")
    .select("expo_push_token")
    .in("user_id", recipientIds);

  if (!tokens?.length) return new Response("no tokens");

  // 4. Build messages. Expo accepts up to 100 per request; chunk if needed.
  const messages = tokens.map((t) => ({
    to: t.expo_push_token,
    title: `${sender?.full_name ?? "Someone"} • ${ride?.origin} → ${ride?.destination}`,
    body: content,
    data: { rideId: ride_id },
    sound: "default",
    channelId: "default",
  }));

  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
  }

  return new Response("ok");
});
```

Deploy:

```powershell
npx supabase functions deploy send-push --no-verify-jwt
```

(`--no-verify-jwt` because we're authenticating via our own Bearer-token check, not Supabase's JWT.)

The function reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Edge Function secrets — these are auto-provided by Supabase, no manual setup.

---

## Phase 4 — Test

1. **Token registration** — sign in on a real device, then in Supabase Dashboard → Table editor → `notification_tokens`, confirm a row appears.
2. **Manual push** — paste the token into the [Expo Push Tool](https://expo.dev/notifications) and send a test. If this works, your client is fine.
3. **End-to-end** — open the app on Device A, send a chat message from Device B. Device A should get a banner that, on tap, navigates to that ride's chat.
4. **Foreground behavior** — when the app is in the foreground, the `setNotificationHandler` shows a banner instead of suppressing it. Tweak if undesired (e.g., if user is *already viewing that chat*, suppress). You can read `useFocusEffect` + the current `rideId` to skip in-chat banners.

---

## Phase 5 — Cleanup of dead tokens

When a user uninstalls or revokes permission, the Expo API returns `DeviceNotRegistered` in the receipt. Add a follow-up `getReceipts` call ~15 minutes after sending and delete the offending tokens. Easy v2 — initially you can skip this; tokens just silently fail. Worth wiring up before launch though.

---

## Files you'll create / modify

| File                                    | Action                             |
| --------------------------------------- | ---------------------------------- |
| `supabase/notifications.sql`            | new — table, RLS, trigger          |
| `supabase/functions/send-push/index.ts` | new — Edge Function                |
| `src/libs/pushNotifications.ts`         | new — register helper              |
| `src/providers/AuthProvider.tsx`        | edit — call register on login      |
| `src/app/_layout.tsx`                   | edit — tap listener                |
| `app.json`                              | edit — `expo-notifications` plugin |
| `src/database.types.ts`                 | regenerate after SQL               |

---

**Watch out for:**
- iOS simulators can't receive push. You need a physical device.
- Expo Go (not your dev build) can receive push but uses a different token format and will drop after SDK 53. Use the dev build.
- The `pg_net`-based trigger fires asynchronously — your `sendMessage` mutation returns instantly even before the push goes out. That's intended.
- If the trigger silently does nothing, `app.edge_function_url` / `app.edge_function_key` GUCs probably aren't set.
- `pg_net` lives in the `net` schema, NOT `extensions`. Calls must use `net.http_post(...)`. If you see `function extensions.http_post does not exist`, the trigger SQL is using the wrong qualifier.

---

## Verified against installed source (SDK 54)

This plan was checked against `expo-notifications@0.32.17`, `expo-device@8.0.10`, `expo-constants@~18.0.13`, and `@supabase/postgrest-js` in `node_modules/`, plus live database state via Supabase MCP.

| Item | Status |
|---|---|
| `Notifications.setNotificationHandler({ handleNotification })` | Confirmed |
| `shouldShowBanner` / `shouldShowList` (replacing deprecated `shouldShowAlert`) | Confirmed — `shouldShowAlert` is deprecated in SDK 54 |
| `Notifications.setNotificationChannelAsync('default', { importance, ... })` | Confirmed |
| `Notifications.AndroidImportance.HIGH` | Confirmed |
| `Notifications.getPermissionsAsync()` / `requestPermissionsAsync()` | Confirmed |
| `Notifications.getExpoPushTokenAsync({ projectId })` returning `{ type: 'expo', data: string }` | Confirmed |
| `Notifications.addNotificationResponseReceivedListener` (warm taps only) | Confirmed |
| `Notifications.useLastNotificationResponse()` for cold-start taps | Confirmed — required for app-killed launch path |
| `Constants.expoConfig?.extra?.eas?.projectId` and `Constants.easConfig?.projectId` fallback | Both present in SDK 54; `easConfig` is NOT deprecated |
| `Device.isDevice` | Confirmed |
| `supabase.from(...).upsert(values, { onConflict: 'col' })` signature | Confirmed in postgrest-js source |
| `pg_net` schema is `net`; function is `net.http_post` | Confirmed via Supabase MCP |
| `current_setting('app.foo', true)` returns null when missing | Confirmed via SQL execution |
| `messages` is in `supabase_realtime` publication | Confirmed — trigger and realtime fire independently |
| `authenticated` has default TRUNCATE/REFERENCES/TRIGGER on tables | Confirmed — revoke line is meaningful |
| Edge Function imports use `npm:@supabase/supabase-js@2` (not `esm.sh`) | Updated — current Supabase docs recommendation |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` auto-injected in Edge Functions | Confirmed (legacy keys, but still active) |
| `--no-verify-jwt` flag exists in Supabase CLI 2.x | Confirmed via `--help` |
| `router.push(\`/message/${id}\`)` works for cross-tab navigation | Confirmed — pattern already used in `[id]/index.tsx:132` |

Want me to start writing any of these files now?