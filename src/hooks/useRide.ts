import { useQuery } from "@tanstack/react-query";
import { fetchRide } from "@/api/rides";

export function useRide(rideId: string) {
  return useQuery({
    queryKey: ["rides", "detail", rideId] as const,
    queryFn: () => fetchRide(rideId),
    enabled: !!rideId,
  });
}
