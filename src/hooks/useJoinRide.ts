import { joinRide } from "@/api/rides";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useJoinRide(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: joinRide,
        onSuccess: () => {
            // // Refetch the home list so available_seats updates everywhere.
            queryClient.invalidateQueries({queryKey: ["rides"]});
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            // (Later) also invalidate ["bookings", userId] if you build a "My Bookings" tab.
        }
    })
}