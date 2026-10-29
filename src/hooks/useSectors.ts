// src/hooks/useSectors.ts
import { useQuery } from "@tanstack/react-query";
import { fetchSectors, fetchSectorOptions } from "@/services/sectors";
import type { SectorFilters } from "@/types/sectors.types";

export function useSectors(filters: SectorFilters = {}) {
  return useQuery({
    queryKey: ["sectors", filters],
    queryFn: () => fetchSectors(filters),
    staleTime: 60_000,
  });
}

export function useSectorOptions() {
  return useQuery({
    queryKey: ["sectors", "options"],
    queryFn: fetchSectorOptions,
    staleTime: 5 * 60_000,
  });
}
