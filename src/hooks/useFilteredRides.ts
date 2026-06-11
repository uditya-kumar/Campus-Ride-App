import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchRides, RIDES_PAGE_SIZE, type RideFilters } from "@/api/rides";

export function useFilteredRides(filters: RideFilters) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["rides", filters] as const,
    queryFn: ({ pageParam }) => fetchRides(filters, pageParam),
    initialPageParam: 0,
    // A short last page means we've reached the end; a full page means there
    // may be more, so hand back the next page index.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < RIDES_PAGE_SIZE ? undefined : allPages.length,
    placeholderData: keepPreviousData,
  });

  return {
    rides: data?.pages.flat() ?? [],
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
