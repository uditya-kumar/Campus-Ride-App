import { useQuery } from "@tanstack/react-query";
import { fetchMyChats, type ChatRide } from "@/api/rides";
import { useAuth } from "@/providers/AuthProvider";

// Reads the same query as the message tab's "upcoming" list. TanStack Query
// dedupes by key, so this doesn't trigger a second fetch when both hooks are
// mounted — it's purely a derived sum.
export function useUnreadTotal(): number {
  const { session } = useAuth();
  const userId = session?.user.id;

  const { data } = useQuery({
    queryKey: ["chats", userId, "upcoming"] as const,
    enabled: !!userId,
    queryFn: () => fetchMyChats("upcoming"),
  });

  if (!data) return 0;
  return (data as ChatRide[]).reduce((sum, r) => sum + (r.unread_count ?? 0), 0);
}
