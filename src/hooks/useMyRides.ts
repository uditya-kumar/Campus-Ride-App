import { useQuery } from "@tanstack/react-query";
import { fetchMyChats, type MyRidesView } from "@/api/rides";
import { useAuth } from "@/providers/AuthProvider";

export function useMyRides(view: MyRidesView) {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["chats", userId, view] as const,
    enabled: !!userId,
    queryFn: () => fetchMyChats(view),
  });
}
