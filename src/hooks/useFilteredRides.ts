import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchRides, type RideFilters } from "@/api/rides";

export function useFilteredRides(filters: RideFilters) {
  const {data, isLoading, isError, error, refetch} = useQuery({
    queryKey: ["rides", filters] as const,
    queryFn: () => fetchRides(filters),
  });

  return {
    rides: data ?? [],
    isLoading,
    isError,
    error,
    refetch
  }
}