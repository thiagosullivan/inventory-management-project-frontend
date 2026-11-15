// src/services/reports.ts
import { api } from "./api";
import type { ApiEnvelope } from "@/lib/api-envelope";
import type {
  ConsumptionReportFilters,
  ConsumptionReportResponse,
  ConsumptionSectorReportFilters,
  ConsumptionSectorReportResponse,
  ManualOutputReportFilters,
  ManualOutputReportResponse,
  RequestReportFilters,
  RequestReportResponse,
} from "@/types/reports.types";

// =============================
// R1 — Auditoria de pedidos
// =============================

export async function fetchRequestReport(
  filters: RequestReportFilters = {},
): Promise<RequestReportResponse> {
  const params = new URLSearchParams();

  if (filters.sectorId) params.set("sectorId", filters.sectorId);
  if (filters.status) params.set("status", filters.status);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));

  const query = params.toString();
  const url = query
    ? `/admin/reports/requests?${query}`
    : "/admin/reports/requests";

  const response = await api.get<ApiEnvelope<RequestReportResponse>>(url);
  return response.data.data;
}

// =============================
// R2 — Consumo (global)
// =============================

export async function fetchConsumptionReport(
  filters: ConsumptionReportFilters = {},
): Promise<ConsumptionReportResponse> {
  const params = new URLSearchParams();

  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.priorityThreshold !== undefined) {
    params.set("priorityThreshold", String(filters.priorityThreshold));
  }
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));

  const query = params.toString();
  const url = query
    ? `/admin/reports/consumption?${query}`
    : "/admin/reports/consumption";

  const response = await api.get<ApiEnvelope<ConsumptionReportResponse>>(url);
  return response.data.data;
}

// =============================
// R2 — Consumo (por setor)
// =============================

export async function fetchConsumptionSectorReport(
  sectorId: string,
  filters: ConsumptionSectorReportFilters = {},
): Promise<ConsumptionSectorReportResponse> {
  const params = new URLSearchParams();

  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.priorityThreshold !== undefined) {
    params.set("priorityThreshold", String(filters.priorityThreshold));
  }
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));

  const query = params.toString();
  const base = `/admin/reports/consumption/${sectorId}`;
  const url = query ? `${base}?${query}` : base;

  const response =
    await api.get<ApiEnvelope<ConsumptionSectorReportResponse>>(url);
  return response.data.data;
}

// =============================
// R2b — Saídas manuais
// =============================

export async function fetchManualOutputReport(
  filters: ManualOutputReportFilters = {},
): Promise<ManualOutputReportResponse> {
  const params = new URLSearchParams();

  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.fromSectorId) params.set("fromSectorId", filters.fromSectorId);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));

  const query = params.toString();
  const url = query
    ? `/admin/reports/manual-output?${query}`
    : "/admin/reports/manual-output";

  const response = await api.get<ApiEnvelope<ManualOutputReportResponse>>(url);
  return response.data.data;
}
