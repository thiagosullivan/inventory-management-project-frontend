// src/hooks/useConsumptionReport.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchConsumptionReport,
  fetchConsumptionSectorReport,
} from "@/services/reports";
import type {
  ConsumptionReportFilters,
  ConsumptionSectorReportFilters,
} from "@/types/reports.types";

export function useConsumptionReport(filters: ConsumptionReportFilters) {
  return useQuery({
    queryKey: ["reports", "consumption", "global", filters],
    queryFn: () => fetchConsumptionReport(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useConsumptionSectorReport(
  sectorId: string | undefined,
  filters: ConsumptionSectorReportFilters,
) {
  return useQuery({
    queryKey: ["reports", "consumption", "sector", sectorId, filters],
    queryFn: () => {
      if (!sectorId) {
        throw new Error("sectorId é obrigatório");
      }
      return fetchConsumptionSectorReport(sectorId, filters);
    },
    enabled: Boolean(sectorId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
