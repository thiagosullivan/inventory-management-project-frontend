// src/hooks/useTransfers.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTransfers } from "@/services/transfers";
import type { TransferFilters } from "@/types/transfers.types";

export function useTransfers(filters: TransferFilters = {}) {
  return useQuery({
    queryKey: ["transfers", filters],
    queryFn: () => fetchTransfers(filters),
  });
}
