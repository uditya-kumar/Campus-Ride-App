import { createClient } from "npm:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface Payload {
  ride_id: string;
  joiner_id: string;
  host_id: string;
}

Deno.serve(async (req) => {
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${Deno.env.get("PUSH_TRIGGER_SECRET")}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const { ride_id, joiner_id, host_id }: Payload = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const [{ data: joiner }, { data: ride }, { data: tokens }] =
    await Promise.all([
      supabase.from("users").select("full_name").eq("id", joiner_id).single(),
      supabase
        .from("rides")
        .select("origin, destination")
        .eq("id", ride_id)
        .single(),
      supabase
        .from("notification_tokens")
        .select("expo_push_token")
        .eq("user_id", host_id),
    ]);

  if (!tokens?.length) return new Response("no tokens");

  const messages = tokens.map((t) => ({
    to: t.expo_push_token,
    title: `${ride?.origin} → ${ride?.destination}`,
    body: `${joiner?.full_name ?? "Someone"} joined your ride`,
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
