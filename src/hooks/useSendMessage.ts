import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage, type MessageWithUser } from "@/api/messages";
import { useAuth } from "@/providers/AuthProvider";

export function useSendMessage(rideId: string) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const queryKey = ["messages", rideId] as const;

  return useMutation({
    mutationFn: (content: string) => {
      if (!userId) throw new Error("Not authenticated");
      return sendMessage(rideId, userId, content);
    },
    onMutate: async (content: string) => {
      if (!userId) return { tempId: null };
      await queryClient.cancelQueries({ queryKey });
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic: MessageWithUser = {
        id: tempId,
        ride_id: rideId,
        user_id: userId,
        content,
        created_at: new Date().toISOString(),
        read_by: null,
        user: null,
      };
      queryClient.setQueryData<MessageWithUser[]>(queryKey, (prev) =>
        prev ? [...prev, optimistic] : [optimistic],
      );
      return { tempId };
    },
    onSuccess: (realRow, _vars, context) => {
      const tempId = context?.tempId;
      queryClient.setQueryData<MessageWithUser[]>(queryKey, (prev) => {
        if (!prev) return prev;
        const realAlreadyPresent = prev.some(
          (m) => m.id === realRow.id && m.id !== tempId,
        );
        if (realAlreadyPresent) {
          return prev.filter((m) => m.id !== tempId);
        }
        return prev.map((m) =>
          m.id === tempId ? { ...realRow, user: m.user } : m,
        );
      });
    },
    onError: (_err, _vars, context) => {
      const tempId = context?.tempId;
      if (!tempId) return;
      queryClient.setQueryData<MessageWithUser[]>(queryKey, (prev) =>
        prev ? prev.filter((m) => m.id !== tempId) : prev,
      );
    },
  });
}
