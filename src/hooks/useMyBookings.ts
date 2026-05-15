import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase";
import { useAuth } from "@/providers/AuthProvider";

export function useMyBookings() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["bookings", "me", userId] as const,
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("ride_id")
        .eq("user_id", userId!);
      if (error) throw error;
      // Return a Set for O(1) lookup at the call site.
      return new Set(data.map((b) => b.ride_id));
    },
  });
}
