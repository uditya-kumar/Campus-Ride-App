import { useMutation } from "@tanstack/react-query";
import { sendMessage } from "@/api/messages";
import { useAuth } from "@/providers/AuthProvider";

export function useSendMessage(rideId: string) {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (content: string) => {
      if (!userId) throw new Error("Not authenticated");
      return sendMessage(rideId, userId, content);
    },
    // No onSuccess invalidation needed — realtime delivers the new row
    // back to us via the subscription, which appends to the cache.
  });
}
