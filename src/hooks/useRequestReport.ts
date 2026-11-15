// src/hooks/useRequestReport.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchRequestReport } from "@/services/reports";
import type { RequestReportFilters } from "@/types/reports.types";

export function useRequestReport(filters: RequestReportFilters) {
  return useQuery({
    queryKey: ["reports", "requests", filters],
    queryFn: () => fetchRequestReport(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
