import { fetchProductHistory } from "@/services/products";
import { useQuery } from "@tanstack/react-query";

export function useProductHistory(id: string | undefined) {
  return useQuery({
    queryKey: ["productHistory", id],
    queryFn: () => fetchProductHistory(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}
