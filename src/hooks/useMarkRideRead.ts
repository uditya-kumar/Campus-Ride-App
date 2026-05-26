import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markRideRead, type ChatRide } from "@/api/rides";

// Marks a ride as read on the server, then optimistically zeros that ride's
// unread_count in every cached chat list (upcoming + past). The chat list
// query and the tab-badge hook share the same query key, so a single cache
// edit updates both.
export function useMarkRideRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markRideRead,
    onMutate: (rideId: string) => {
      queryClient.setQueriesData<ChatRide[]>(
        { queryKey: ["chats"] },
        (old) =>
          old
            ? old.map((r) =>
                r.id === rideId ? { ...r, unread_count: 0 } : r,
              )
            : old,
      );
    },
  });
}
