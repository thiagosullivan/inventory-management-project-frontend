// src/hooks/useSectors.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSector,
  deleteSector,
  fetchSectorOptions,
  fetchSectors,
  updateSector,
} from "@/services/sectors";
import type {
  CreateSectorData,
  SectorFilters,
  UpdateSectorData,
} from "@/types/sectors.types";

// =============================
// Queries
// =============================

export function useSectors(filters: SectorFilters = {}) {
  return useQuery({
    queryKey: ["sectors", "list", filters],
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

// =============================
// 🔹 Fase 7.7 — Mutations
// =============================

function useInvalidateSectors() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["sectors", "list"] });
    qc.invalidateQueries({ queryKey: ["sectors", "options"] });
  };
}

export function useCreateSector() {
  const invalidate = useInvalidateSectors();
  return useMutation({
    mutationFn: (payload: CreateSectorData) => createSector(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateSector() {
  const invalidate = useInvalidateSectors();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSectorData;
    }) => updateSector(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteSector() {
  const invalidate = useInvalidateSectors();
  return useMutation({
    mutationFn: (id: string) => deleteSector(id),
    onSuccess: invalidate,
  });
}