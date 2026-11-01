// src/services/sectors.ts
import { api } from "./api";
import type { ApiEnvelope } from "@/lib/api-envelope";
import type {
  SectorFilters,
  SectorOption,
  SectorResponse,
  SectorsListResponse,
} from "@/types/sectors.types";

// =============================
// Lista
// =============================

export async function fetchSectors(
  filters: SectorFilters = {},
): Promise<SectorsListResponse> {
  const params = new URLSearchParams();

  if (filters.search !== undefined) params.set("search", filters.search);
  if (filters.isWarehouse !== undefined)
    params.set("isWarehouse", String(filters.isWarehouse));
  if (filters.isActive !== undefined)
    params.set("isActive", String(filters.isActive));

  const query = params.toString();
  const url = query ? `/admin/sectors?${query}` : "/admin/sectors";

  const response = await api.get<ApiEnvelope<SectorsListResponse>>(url);
  return response.data.data;
}

// =============================
// Options (pra selects)
// =============================

export async function fetchSectorOptions(): Promise<SectorOption[]> {
  const response = await api.get<ApiEnvelope<SectorOption[]>>(
    "/admin/sectors/options",
  );
  return response.data.data;
}

// =============================
// Detalhe
// =============================

export async function fetchSectorById(id: string): Promise<SectorResponse> {
  const response = await api.get<ApiEnvelope<SectorResponse>>(
    `/admin/sectors/${id}`,
  );
  return response.data.data;
}
