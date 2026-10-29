// src/hooks/usePurchaseRequestCatalog.ts
import { useQuery } from "@tanstack/react-query";
import { fetchPurchaseRequestCatalog } from "@/services/purchaseRequests";

export function usePurchaseRequestCatalog() {
  return useQuery({
    queryKey: ["purchaseRequests", "catalog"],
    queryFn: fetchPurchaseRequestCatalog,
    staleTime: 60_000,
  });
}
