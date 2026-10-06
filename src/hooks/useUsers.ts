import { fetchUserOptions } from "@/services/users";
import { useQuery } from "@tanstack/react-query";

// 🔹 Hook de opções de usuário — alimenta o UserSelect
export function useUsers() {
  const query = useQuery({
    queryKey: ["users", "options"],
    queryFn: fetchUserOptions,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  return {
    options: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
