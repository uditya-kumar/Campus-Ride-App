import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase";
import { useAuth } from "@/providers/AuthProvider";
import type { ChatRide } from "@/api/rides";

// App-wide realtime listener: every INSERT into messages bumps the matching
// ride's unread_count and last_message_at in the cached chat lists. The chat
// detail screen has its own per-ride channel for rendering — this one only
// updates the list-level counters so the tab badge and ride cards react live.
//
// We don't filter to the user's rides at the DB level (RLS already does), so
// every authenticated client gets messages for rides they're a member of.
// We additionally guard with `prev.find` so messages arriving for rides not
// in the cache (e.g. just joined, list not yet refetched) are ignored.
export function useUnreadRealtime() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user-messages:${userId}:${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as {
            ride_id: string;
            user_id: string;
            created_at: string;
          };
          // Skip messages the current user sent themselves.
          if (row.user_id === userId) return;
          queryClient.setQueriesData<ChatRide[]>(
            { queryKey: ["chats"] },
            (old) => {
              if (!old) return old;
              if (!old.some((r) => r.id === row.ride_id)) return old;
              return old
                .map((r) =>
                  r.id === row.ride_id
                    ? {
                        ...r,
                        unread_count: (r.unread_count ?? 0) + 1,
                        last_message_at: row.created_at,
                      }
                    : r,
                )
                .sort(
                  (a, b) =>
                    new Date(b.last_message_at).getTime() -
                    new Date(a.last_message_at).getTime(),
                );
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
