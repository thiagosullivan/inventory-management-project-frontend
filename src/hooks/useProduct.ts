import { fetchProductById } from "@/services/products";
import { useQuery } from "@tanstack/react-query";

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}
