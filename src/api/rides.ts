import { supabase } from "@/libs/supabase";
import { dayRangeIST } from "@/libs/datetime";
import type { Tables, TablesInsert } from "@/database.types";

export type Ride = Tables<"rides">;

// `cost_per_person` is a Postgres GENERATED column — clients must not set it.
// The column is read-only at the DB level; this type makes that a compile-time
// rule too, so a stray write attempt is caught before runtime.
export type RideInsert = Omit<TablesInsert<"rides">, "cost_per_person">;

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
    const { start, end } = dayRangeIST(filters.selectedDate);
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

export async function createRide(ride: RideInsert): Promise<Ride> {
  const { data, error } = await supabase
    .from("rides")
    .insert(ride)
    .select()
    .single();
  if (error) throw error;
  return data;
}
