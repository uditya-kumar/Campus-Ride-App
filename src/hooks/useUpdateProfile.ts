import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase";
import { useAuth } from "@/providers/AuthProvider";

type UpdateProfileInput = {
  full_name: string;
};

export function useUpdateProfile() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("users")
        .update({ full_name: input.full_name })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}
