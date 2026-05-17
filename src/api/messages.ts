import { supabase } from "@/libs/supabase";
import type { Tables, TablesInsert } from "@/database.types";

export type Message = Tables<"messages">;
export type MessageInsert = TablesInsert<"messages">;

// Message + the embedded sender profile from the `users` table. Used by the
// chat detail screen to render names/avatars without a second round-trip.
export type MessageWithUser = Message & {
  user: Pick<Tables<"users">, "full_name" | "avatar_url"> | null;
};

export async function fetchMessages(
  rideId: string,
): Promise<MessageWithUser[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*, user:users(full_name, avatar_url)")
    .eq("ride_id", rideId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MessageWithUser[];
}

export async function sendMessage(
  rideId: string,
  userId: string,
  content: string,
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ ride_id: rideId, user_id: userId, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}
