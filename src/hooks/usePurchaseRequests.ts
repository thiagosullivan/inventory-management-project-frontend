// src/hooks/usePurchaseRequests.ts
import { useQuery } from "@tanstack/react-query";
import { fetchPurchaseRequests } from "@/services/purchaseRequests";
import type { PurchaseRequestFilters } from "@/types/purchaseRequests.types";

export function usePurchaseRequests(filters: PurchaseRequestFilters = {}) {
  return useQuery({
    queryKey: ["purchaseRequests", filters],
    queryFn: () => fetchPurchaseRequests(filters),
  });
}
