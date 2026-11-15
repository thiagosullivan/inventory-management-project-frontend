// src/hooks/useManualOutputReport.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchManualOutputReport } from "@/services/reports";
import type { ManualOutputReportFilters } from "@/types/reports.types";

export function useManualOutputReport(filters: ManualOutputReportFilters) {
  return useQuery({
    queryKey: ["reports", "manual-output", filters],
    queryFn: () => fetchManualOutputReport(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
