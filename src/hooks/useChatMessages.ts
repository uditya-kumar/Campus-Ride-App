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
          queryClient.setQueryData<MessageWithUser[]>(queryKey, (prev) =>
            prev ? [...prev, enriched] : [enriched],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId, queryClient]);

  return query;
}
