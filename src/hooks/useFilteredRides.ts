import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchRides, type RideFilters } from "@/api/rides";

export function useFilteredRides(filters: RideFilters) {
  const query = useQuery({
    queryKey: ["rides", filters] as const,
    queryFn: () => fetchRides(filters),
    placeholderData: keepPreviousData,
  });

  return query.data ?? [];
}