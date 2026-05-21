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
