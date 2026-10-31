// src/hooks/usePurchaseRequest.ts
import { useQuery } from "@tanstack/react-query";
import { fetchPurchaseRequestById } from "@/services/purchaseRequests";
import type { PurchaseRequestDetailResponse } from "@/types/purchaseRequests.types";

export function usePurchaseRequest(id: string | null | undefined) {
  return useQuery<PurchaseRequestDetailResponse>({
    queryKey: ["purchaseRequests", "detail", id],
    queryFn: () => fetchPurchaseRequestById(id as string),
    enabled: !!id,
  });
}
