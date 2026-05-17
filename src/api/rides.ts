import { supabase } from "@/libs/supabase";
import { dayRangeIST } from "@/libs/datetime";
import type { Tables } from "@/database.types";

export type Ride = Tables<"rides">;

export type CreateRideInput = {
  origin: string;
  destination: string;
  departure_date: string; // ISO with IST offset, from toIsoIST()
  total_seats: number;
  total_cost: number;
  vehicle_type: string;
};

export type RideFilters = {
  origin: string | null;
  destination: string | null;
  selectedDate: string | null; // DD-MM-YYYY from the filter UI
  sortBy: string;
};

export async function fetchRides(filters: RideFilters): Promise<Ride[]> {
  // building the query — only show active rides that still have at least one
  // seat AND haven't already departed.
  let query = supabase
    .from("rides")
    .select("*")
    .eq("status", "active")
    .gt("available_seats", 0)
    .gte("departure_date", new Date().toISOString());

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

export async function fetchRide(rideId: string): Promise<Ride> {
  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .eq("id", rideId)
    .single();
  if (error) throw error;
  return data;
}

export async function createRide(input: CreateRideInput): Promise<string> {
  const { data, error } = await supabase.rpc("create_ride", {
    p_origin: input.origin,
    p_destination: input.destination,
    p_departure_date: input.departure_date,
    p_total_seats: input.total_seats,
    p_total_cost: input.total_cost,
    p_vehicle_type: input.vehicle_type,
  });
  if (error) throw error;
  return data; // ride_id (uuid)
}

export async function joinRide(rideId: string): Promise<void> {
  const { error } = await supabase.rpc("join_ride", { p_ride_id: rideId });
  if (error) throw error;
}

export type MyRidesView = "upcoming" | "past";

export async function fetchMyRides(
  userId: string,
  view: MyRidesView,
): Promise<Ride[]> {
  const now = new Date().toISOString();
  // Query rides directly; `bookings!inner(user_id)` filters to rides the user
  // is booked into. Querying rides as the parent lets `.order()` actually sort
  // the result — ordering on a referenced (one-to-one) table is a no-op.
  let query = supabase
    .from("rides")
    .select("*, bookings!inner(user_id)")
    .eq("bookings.user_id", userId);

  if (view === "upcoming") {
    query = query.gte("departure_date", now);
  } else {
    query = query.lt("departure_date", now);
  }

  query = query.order("departure_date", {
    ascending: view === "upcoming", // upcoming: soonest first; past: most recent first
  });

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
