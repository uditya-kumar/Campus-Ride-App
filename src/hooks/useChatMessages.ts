import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase";
import {
  fetchMessages,
  type Message,
  type MessageWithUser,
} from "@/api/messages";

export function useChatMessages(rideId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["messages", rideId] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchMessages(rideId),
  });

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${rideId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `ride_id=eq.${rideId}`,
        },
        (payload) => {
          // Realtime payload is the raw row — no joined `user` field. Append
          // with `user: null`; the next refetch backfills the profile.
          const row = payload.new as Message;
          const enriched: MessageWithUser = { ...row, user: null };
          queryClient.setQueryData<MessageWithUser[]>(queryKey, (prev) => {
            if (!prev) return [enriched];
            // Skip if the real row is already present (sender's optimistic
            // path replaced its temp id with the real id on mutation success).
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, enriched];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId, queryClient]);

  return query;
}
