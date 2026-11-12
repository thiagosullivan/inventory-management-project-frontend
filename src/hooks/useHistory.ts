// src/hooks/useHistory.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchHistory } from "@/services/history";
import type { HistoryFilters } from "@/types/history.types";

export function useHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: ["history", filters],
    queryFn: () => fetchHistory(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
