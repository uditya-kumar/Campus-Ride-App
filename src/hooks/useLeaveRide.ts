import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveRide } from "@/api/rides";

export function useLeaveRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveRide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
