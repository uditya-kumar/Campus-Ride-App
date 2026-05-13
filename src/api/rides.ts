import { supabase } from "@/libs/supabase";
import type { Tables, TablesInsert } from "@/database.types";

export type Ride = Tables<"rides">;

export type RideFilters = {
  origin: string | null;
  destination: string | null;
  selectedDate: string | null; // DD-MM-YYYY from the filter UI
  sortBy: string;
};

export async function fetchRides(filters: RideFilters): Promise<Ride[]> {
  // building the query
  let query = supabase.from("rides").select("*").eq("status", "active");

  if (filters.origin) query = query.ilike("origin", filters.origin);
  if (filters.destination)
    query = query.ilike("destination", filters.destination);

  if (filters.selectedDate) {
    const [day, month, year] = filters.selectedDate.split("-");
    const start = `${year}-${month}-${day}T00:00:00+05:30`;
    const end = `${year}-${month}-${day}T23:59:59+05:30`;
    query = query.gte("departure_date", start).lte("departure_date", end);
  }

  switch (filters.sortBy) {
    case "Price: Low to High":
      query = query
        .order("cost_per_person", { ascending: true })
        .order("departure_date", { ascending: true });
      break;
    case "Price: High to Low":
      query = query
        .order("cost_per_person", { ascending: false })
        .order("departure_date", { ascending: true });
      break;
    case "Seats Available":
      query = query
        .order("available_seats", { ascending: false })
        .order("departure_date", { ascending: true });
      break;
    default:
      // No explicit sort → morning to night
      query = query.order("departure_date", { ascending: true });
  }

  // sending the query to supabase
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createRide(ride: TablesInsert<"rides">): Promise<Ride> {
  const { data, error } = await supabase
    .from("rides")
    .insert(ride)
    .select()
    .single();
  if (error) throw error;
  return data;
}
