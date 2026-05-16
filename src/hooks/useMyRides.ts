import { useQuery } from "@tanstack/react-query";
import { fetchMyRides, type Ride } from "@/api/rides";
import { useAuth } from "@/providers/AuthProvider";

export function useMyRides() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["bookings", "rides", userId] as const,
    enabled: !!userId,
    queryFn: () => fetchMyRides(userId!),
  });
}
