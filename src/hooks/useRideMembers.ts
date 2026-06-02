import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRideMembers } from "@/api/rides";
import { supabase } from "@/libs/supabase";

export function useRideMembers(rideId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["bookings", "members", rideId] as const;

  const query = useQuery({
    queryKey,
    enabled: !!rideId,
    queryFn: () => fetchRideMembers(rideId),
  });

  useEffect(() => {
    if (!rideId) return;
    // Unique suffix — same rationale as useChatMessages: fast remounts can
    // re-grab a still-tearing-down channel and `.on(...)` after `.subscribe()`
    // throws.
    const channelName = `bookings:${rideId}:${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `ride_id=eq.${rideId}`,
        },
        () => {
          // Invalidate the members list (drives the chat header / info screen)
          // and the ride row (drives `available_seats`).
          queryClient.invalidateQueries({
            queryKey: ["bookings", "members", rideId],
          });
          queryClient.invalidateQueries({
            queryKey: ["rides", "detail", rideId],
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
