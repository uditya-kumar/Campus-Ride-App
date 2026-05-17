import { useQuery } from "@tanstack/react-query";
import { fetchRideMembers } from "@/api/rides";

export function useRideMembers(rideId: string) {
  return useQuery({
    queryKey: ["bookings", "members", rideId] as const,
    enabled: !!rideId,
    queryFn: () => fetchRideMembers(rideId),
  });
}
