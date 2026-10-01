import { fetchCategoryOptions } from "@/services/categories";
import { useQuery } from "@tanstack/react-query";

/**
 * Busca as opções de categoria (label + value) pra alimentar selects.
 *
 * Categorias mudam pouco → staleTime alto (5 min) evita refetch
 * desnecessário enquanto o usuário navega.
 *
 * Retorna:
 *   { options: SelectOption[], isLoading, isError, refetch }
 */
// 🔹 Hook de opções de categoria — alimenta o CategorySelect
export function useCategories() {
  const query = useQuery({
    queryKey: ["categories", "options"],
    queryFn: fetchCategoryOptions,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  return {
    options: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
