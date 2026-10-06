import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategoriesList,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categories";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/categories.types";

// 🔹 Chave centralizada pra invalidar depois das mutations
export const categoriesListKey = ["categories", "list"] as const;

// 🔹 Chave do cache de options (mesma do useCategories.ts)
const categoriesOptionsKey = ["categories", "options"] as const;

// 🔹 Hook de listagem
export function useCategoriesList() {
  return useQuery<Category[]>({
    queryKey: categoriesListKey,
    queryFn: fetchCategoriesList,
  });
}

// 🔹 Helper: depois de qualquer write, limpa o cache de options.
// Como useCategories.ts usa staleTime de 5min, um invalidate simples
// não forçaria refetch se não houver observer ativo. removeQueries
// garante que o próximo mount busque dados frescos.
function invalidateCategoriesCaches(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: categoriesListKey });
  queryClient.removeQueries({ queryKey: categoriesOptionsKey });
}

// 🔹 Mutation: criar
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => invalidateCategoriesCaches(queryClient),
  });
}

// 🔹 Mutation: editar
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) => updateCategory(id, payload),
    onSuccess: () => invalidateCategoriesCaches(queryClient),
  });
}

// 🔹 Mutation: deletar
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => invalidateCategoriesCaches(queryClient),
  });
}
