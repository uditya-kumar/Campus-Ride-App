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
  // The trigger sends a shared secret as Bearer; reject everything else.
  // We use a dedicated PUSH_TRIGGER_SECRET (set in Edge Function secrets and
  // mirrored in Vault) instead of the service-role key, so key rotations
  // don't silently break push.
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${Deno.env.get("PUSH_TRIGGER_SECRET")}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const { ride_id, sender_id, content }: Payload = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Steps 1–3 are independent — fan out in parallel.
  const [
    { data: sender },
    { data: ride },
    { data: rows },
  ] = await Promise.all([
    supabase.from("users").select("full_name").eq("id", sender_id).single(),
    supabase
      .from("rides")
      .select("origin, destination")
      .eq("id", ride_id)
      .single(),
    supabase
      .from("bookings")
      .select("user_id")
      .eq("ride_id", ride_id)
      .neq("user_id", sender_id),
  ]);

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

  const batches: typeof messages[] = [];
  for (let i = 0; i < messages.length; i += 100) {
    batches.push(messages.slice(i, i + 100));
  }
  await Promise.all(
    batches.map((batch) =>
      fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      }),
    ),
  );

  return new Response("ok");
});
