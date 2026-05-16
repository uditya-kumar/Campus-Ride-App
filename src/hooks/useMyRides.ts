import { useQuery } from "@tanstack/react-query";
import { fetchMyRides, type MyRidesView } from "@/api/rides";
import { useAuth } from "@/providers/AuthProvider";

export function useMyRides(view: MyRidesView) {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["bookings", "rides", userId, view] as const,
    enabled: !!userId,
    queryFn: () => fetchMyRides(userId!, view),
  });
}
