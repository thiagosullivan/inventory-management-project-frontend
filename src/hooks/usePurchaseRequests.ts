// src/hooks/usePurchaseRequests.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchPurchaseRequests } from "@/services/purchaseRequests";
import type { PurchaseRequestFilters } from "@/types/purchaseRequests.types";
import type { PurchaseRequestStatusFilter } from "@/lib/purchase-request-query-params";

type FiltersWithStatusFilter = Omit<PurchaseRequestFilters, "status"> & {
  status?: PurchaseRequestStatusFilter;
};

export function usePurchaseRequests(filters: FiltersWithStatusFilter = {}) {
  const apiFilters: PurchaseRequestFilters = {
    ...filters,
    status: filters.status === "TODOS" ? undefined : filters.status,
  };

  return useQuery({
    queryKey: ["purchaseRequests", apiFilters],
    queryFn: () => fetchPurchaseRequests(apiFilters),
    placeholderData: keepPreviousData,
  });
}
