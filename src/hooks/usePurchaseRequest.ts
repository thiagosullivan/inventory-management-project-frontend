// src/hooks/usePurchaseRequest.ts
import { useQuery } from "@tanstack/react-query";
import { fetchPurchaseRequestById } from "@/services/purchaseRequests";

export function usePurchaseRequest(id: string | null | undefined) {
  return useQuery({
    queryKey: ["purchaseRequests", "detail", id],
    queryFn: () => fetchPurchaseRequestById(id as string),
    enabled: !!id,
  });
}
