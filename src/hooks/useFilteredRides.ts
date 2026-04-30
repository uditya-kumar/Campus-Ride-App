import { ridesData } from "@assets/data/rides";

type FilterOptions = {
  origin: string | null;
  destination: string | null;
  selectedDate: string | null;
  sortBy: string;
};

// Parse DD-MM-YYYY string to Date object
const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export function useFilteredRides({
  origin,
  destination,
  selectedDate,
  sortBy,
}: FilterOptions) {
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
    const filterDate = parseDate(selectedDate);
    result = result.filter((ride) => {
      const rideDate = parseDate(ride.departure_date);
      return (
        rideDate.getFullYear() === filterDate.getFullYear() &&
        rideDate.getMonth() === filterDate.getMonth() &&
        rideDate.getDate() === filterDate.getDate()
      );
    });
  }

  // Sort results
  switch (sortBy) {
    case "Departure Time":
      result.sort(
        (a, b) =>
          parseDate(a.departure_date).getTime() -
          parseDate(b.departure_date).getTime(),
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
}
