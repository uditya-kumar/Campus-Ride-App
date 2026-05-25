import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase";
import { useAuth } from "@/providers/AuthProvider";
import type { Tables } from "@/database.types";

export type Profile = Pick<
  Tables<"users">,
  "id" | "full_name" | "email" | "avatar_url" | "gender"
>;

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["profile", userId] as const,
    enabled: !!userId,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, avatar_url, gender")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
