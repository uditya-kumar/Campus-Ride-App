import ridesData from "@assets/data/rides";
import { useMemo } from "react";

type FilterOptions = {
  origin: string | null;
  destination: string | null;
  selectedDate: Date | null;
  sortBy: string;
};

export function useFilteredRides({
  origin,
  destination,
  selectedDate,
  sortBy,
}: FilterOptions) {
  return useMemo(() => {
    let result = [...ridesData];

    // Filter by origin
    if (origin) {
      result = result.filter(
        (ride) => ride.origin.toLowerCase() === origin.toLowerCase(),
      );
    }

    // Filter by destination
    if (destination) {
      result = result.filter(
        (ride) => ride.destination.toLowerCase() === destination.toLowerCase(),
      );
    }

    // Filter by date
    if (selectedDate) {
      result = result.filter((ride) => {
        const rideDate = new Date(ride.departure_date);
        return (
          rideDate.getFullYear() === selectedDate.getFullYear() &&
          rideDate.getMonth() === selectedDate.getMonth() &&
          rideDate.getDate() === selectedDate.getDate()
        );
      });
    }

    // Sort results
    switch (sortBy) {
      case "Departure Time":
        result.sort(
          (a, b) =>
            new Date(a.departure_date).getTime() -
            new Date(b.departure_date).getTime(),
        );
        break;
      case "Price: Low to High":
        result.sort((a, b) => a.cost_per_person - b.cost_per_person);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.cost_per_person - a.cost_per_person);
        break;
      case "Seats Available":
        result.sort((a, b) => b.available_seats - a.available_seats);
        break;
    }

    return result;
  }, [origin, destination, selectedDate, sortBy]);
}
