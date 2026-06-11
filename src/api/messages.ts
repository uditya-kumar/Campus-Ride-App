import { supabase } from "@/libs/supabase";
import type { Tables, TablesInsert } from "@/database.types";

export type Message = Tables<"messages">;
export type MessageInsert = TablesInsert<"messages">;

// Message + the embedded sender profile from the `users` table. Used by the
// chat detail screen to render names/avatars without a second round-trip.
export type MessageWithUser = Message & {
  user: Pick<Tables<"users">, "full_name" | "avatar_url"> | null;
};

// Chat page size. The chat opens on the most recent page; older pages load on
// scroll-up. A short page back means there's no more history — see
// useChatMessages' hasMore tracking.
export const MESSAGES_PAGE_SIZE = 30;

// Fetch one page of a ride's messages, newest-first, returned in ascending
// (oldest-first) order so it can be appended/prepended to the flat chat cache.
// Pass `before` (an existing message's created_at) to load the page that
// precedes it — the load-older path. Omit it for the initial latest page.
export async function fetchMessages(
  rideId: string,
  before?: string,
): Promise<MessageWithUser[]> {
  let query = supabase
    .from("messages")
    .select("*, user:users(full_name, avatar_url)")
    .eq("ride_id", rideId);

  if (before) query = query.lt("created_at", before);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(MESSAGES_PAGE_SIZE);

  if (error) throw error;
  // Reverse the newest-first DB page into oldest-first for the chat cache.
  return ((data ?? []) as MessageWithUser[]).reverse();
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
