import { joinRide } from "@/api/rides";
import type { Tables } from "@/database.types";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

type Ride = Tables<"rides">;

// RPC errors that mean the row shouldn't be on this user's home list right
// now. "Already booked" is intentionally excluded — useMyBookings will flip
// the card to the Chat state on its own.
const STALE_RIDE_ERRORS = new Set([
  "Ride not found",
  "Ride is not active",
  "Ride has already departed",
  "No seats available"
]);

export function useJoinRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinRide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (err, rideId) => {
      if (!STALE_RIDE_ERRORS.has(err.message)) return;
      // ["rides"] is an infinite query — drop the stale ride from every page.
      queryClient.setQueriesData<InfiniteData<Ride[]>>(
        { queryKey: ["rides"] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) =>
                  page.filter((r) => r.id !== rideId),
                ),
              }
            : old,
      );
    },
  });
}
