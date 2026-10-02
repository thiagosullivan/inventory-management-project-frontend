import { fetchUserOptions } from "@/services/users";
import { useQuery } from "@tanstack/react-query";

/**
 * Busca as opções de usuário (label + value + isActive) pra alimentar selects.
 *
 * Usuários mudam pouco → staleTime alto (5 min) evita refetch
 * desnecessário enquanto o usuário navega.
 *
 * Retorna:
 *   { options: UserOption[], isLoading, isError, refetch }
 */
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
