import { fetchProductMovements } from "@/services/products";
import { useQuery } from "@tanstack/react-query";

export function useProductMovements(id: string | undefined) {
  return useQuery({
    queryKey: ["productMovements", id],
    queryFn: () => fetchProductMovements(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 15,
  });
}
