import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase";
import {
  fetchMessages,
  MESSAGES_PAGE_SIZE,
  type Message,
  type MessageWithUser,
} from "@/api/messages";

export function useChatMessages(rideId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["messages", rideId] as const;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const page = await fetchMessages(rideId);
      // A short first page means the whole history fits — nothing older to load.
      setHasMore(page.length === MESSAGES_PAGE_SIZE);
      return page;
    },
  });

  // Older-history paging state. The cache stays a flat ascending array (so the
  // realtime listener and optimistic sends keep appending to the end); load-
  // older just prepends a page to the front.
  //
  // Seed from any cached data so a remount within staleTime (which skips
  // queryFn) doesn't lose the flag and wrongly disable load-older. A full
  // first page means "there's probably more"; if not, the first loadOlder
  // fetch returns empty and self-corrects.
  const [hasMore, setHasMore] = useState(() => {
    const cached = queryClient.getQueryData<MessageWithUser[]>(queryKey);
    return cached ? cached.length >= MESSAGES_PAGE_SIZE : false;
  });
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const loadOlder = async () => {
    if (isLoadingOlder || !hasMore) return;
    const current = queryClient.getQueryData<MessageWithUser[]>(queryKey);
    // Oldest real message in cache is the cursor. Skip temp/optimistic rows,
    // which only ever live at the newest end anyway.
    const oldest = current?.[0];
    if (!oldest?.created_at) return;

    setIsLoadingOlder(true);
    try {
      const older = await fetchMessages(rideId, oldest.created_at);
      if (older.length < MESSAGES_PAGE_SIZE) setHasMore(false);
      if (older.length > 0) {
        queryClient.setQueryData<MessageWithUser[]>(queryKey, (prev) => {
          if (!prev) return older;
          // Guard against overlap if pages straddle equal timestamps.
          const seen = new Set(prev.map((m) => m.id));
          const fresh = older.filter((m) => !seen.has(m.id));
          return [...fresh, ...prev];
        });
      }
    } finally {
      setIsLoadingOlder(false);
    }
  };

  useEffect(() => {
    // Unique suffix per effect run. `supabase.channel(name)` returns the
    // existing channel if one with that name already exists — on fast
    // remounts (navigation, fast refresh) the previous channel hasn't
    // finished tearing down yet, so we'd get back an already-subscribed
    // instance and `.on(...)` after `.subscribe()` throws.
    const channelName = `messages:${rideId}:${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
    const channel = supabase
      .channel(channelName)
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
          queryClient.setQueryData<MessageWithUser[]>(
            ["messages", rideId],
            (prev) => {
              if (!prev) return [enriched];
              // Skip if the real row is already present (sender's optimistic
              // path replaced its temp id with the real id on mutation success).
              if (prev.some((m) => m.id === row.id)) return prev;
              return [...prev, enriched];
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId, queryClient]);

  return { ...query, loadOlder, hasMore, isLoadingOlder };
}
