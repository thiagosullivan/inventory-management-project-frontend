// src/lib/reports-query-params.ts
// import type { PurchaseRequestStatus } from "@/types/purchaseRequests.types";
import type {
  ConsumptionReportFilters,
  ConsumptionSectorReportFilters,
  ManualOutputReportFilters,
  ReportRequestStatusFilter,
  ReportSortOrder,
  RequestReportFilters,
  RequestReportSortBy,
} from "@/types/reports.types";

// =============================
// R1 — Auditoria de pedidos
// =============================

export const REQUEST_REPORT_DEFAULTS = {
  page: 1,
  limit: 20,
  sortBy: "createdAt" as RequestReportSortBy,
  sortOrder: "desc" as ReportSortOrder,
};

export const REQUEST_REPORT_STATUS_VALUES: ReportRequestStatusFilter[] = [
  "PENDENTE",
  "EM_ATENDIMENTO",
  "ATENDIDO",
  "RECUSADO",
  "CANCELADO",
];

export const REQUEST_REPORT_SORT_BY_VALUES: RequestReportSortBy[] = [
  "createdAt",
  "finalizedAt",
];

export function parseRequestReportFilters(
  searchParams: URLSearchParams,
): RequestReportFilters {
  const filters: RequestReportFilters = {};

  const sectorId = searchParams.get("sectorId");
  if (sectorId) filters.sectorId = sectorId;

  const status = searchParams.get("status");
  if (
    status &&
    REQUEST_REPORT_STATUS_VALUES.includes(status as ReportRequestStatusFilter)
  ) {
    filters.status = status as ReportRequestStatusFilter;
  }

  const dateFrom = searchParams.get("dateFrom");
  if (dateFrom) filters.dateFrom = dateFrom;

  const dateTo = searchParams.get("dateTo");
  if (dateTo) filters.dateTo = dateTo;

  const sortBy = searchParams.get("sortBy");
  if (
    sortBy &&
    REQUEST_REPORT_SORT_BY_VALUES.includes(sortBy as RequestReportSortBy)
  ) {
    filters.sortBy = sortBy as RequestReportSortBy;
  }

  const sortOrder = searchParams.get("sortOrder");
  if (sortOrder === "asc" || sortOrder === "desc") {
    filters.sortOrder = sortOrder;
  }

  const page = searchParams.get("page");
  if (page) {
    const n = Number(page);
    if (Number.isFinite(n) && n >= 1) filters.page = Math.floor(n);
  }

  const limit = searchParams.get("limit");
  if (limit) {
    const n = Number(limit);
    if (Number.isFinite(n) && n >= 1) {
      filters.limit = Math.min(Math.floor(n), 100);
    }
  }

  return filters;
}

export function serializeRequestReportFilters(
  filters: RequestReportFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.sectorId) params.set("sectorId", filters.sectorId);
  if (filters.status) params.set("status", filters.status);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.sortBy && filters.sortBy !== REQUEST_REPORT_DEFAULTS.sortBy) {
    params.set("sortBy", filters.sortBy);
  }
  if (
    filters.sortOrder &&
    filters.sortOrder !== REQUEST_REPORT_DEFAULTS.sortOrder
  ) {
    params.set("sortOrder", filters.sortOrder);
  }
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));

  return params;
}

// =============================
// R2 — Consumo (global e setor)
// =============================

export const CONSUMPTION_REPORT_DEFAULTS = {
  priorityThreshold: 10,
  limit: 10,
};

function parsePriorityThreshold(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  const rounded = Math.floor(n);
  if (rounded < 1) return undefined;
  return rounded;
}

function parseLimit(raw: string | null, fallback?: number): number | undefined {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 100);
}

export function parseConsumptionReportFilters(
  searchParams: URLSearchParams,
): ConsumptionReportFilters {
  const filters: ConsumptionReportFilters = {};

  const dateFrom = searchParams.get("dateFrom");
  if (dateFrom) filters.dateFrom = dateFrom;

  const dateTo = searchParams.get("dateTo");
  if (dateTo) filters.dateTo = dateTo;

  const priorityThreshold = parsePriorityThreshold(
    searchParams.get("priorityThreshold"),
  );
  if (priorityThreshold !== undefined) {
    filters.priorityThreshold = priorityThreshold;
  }

  const limit = parseLimit(searchParams.get("limit"));
  if (limit !== undefined) filters.limit = limit;

  return filters;
}

export function serializeConsumptionReportFilters(
  filters: ConsumptionReportFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (
    filters.priorityThreshold !== undefined &&
    filters.priorityThreshold !== CONSUMPTION_REPORT_DEFAULTS.priorityThreshold
  ) {
    params.set("priorityThreshold", String(filters.priorityThreshold));
  }
  if (
    filters.limit !== undefined &&
    filters.limit !== CONSUMPTION_REPORT_DEFAULTS.limit
  ) {
    params.set("limit", String(filters.limit));
  }

  return params;
}

export function parseConsumptionSectorReportFilters(
  searchParams: URLSearchParams,
): ConsumptionSectorReportFilters {
  // 🔹 Mesmo shape do global — reusa parsers internos
  return parseConsumptionReportFilters(searchParams);
}

export function serializeConsumptionSectorReportFilters(
  filters: ConsumptionSectorReportFilters,
): URLSearchParams {
  return serializeConsumptionReportFilters(filters);
}

// =============================
// R2b — Saídas manuais
// =============================

export const MANUAL_OUTPUT_REPORT_DEFAULTS = {
  page: 1,
  limit: 20,
};

export function parseManualOutputReportFilters(
  searchParams: URLSearchParams,
): ManualOutputReportFilters {
  const filters: ManualOutputReportFilters = {};

  const dateFrom = searchParams.get("dateFrom");
  if (dateFrom) filters.dateFrom = dateFrom;

  const dateTo = searchParams.get("dateTo");
  if (dateTo) filters.dateTo = dateTo;

  const fromSectorId = searchParams.get("fromSectorId");
  if (fromSectorId) filters.fromSectorId = fromSectorId;

  const page = searchParams.get("page");
  if (page) {
    const n = Number(page);
    if (Number.isFinite(n) && n >= 1) filters.page = Math.floor(n);
  }

  const limit = searchParams.get("limit");
  if (limit) {
    const n = Number(limit);
    if (Number.isFinite(n) && n >= 1) {
      filters.limit = Math.min(Math.floor(n), 100);
    }
  }

  return filters;
}

export function serializeManualOutputReportFilters(
  filters: ManualOutputReportFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.fromSectorId) params.set("fromSectorId", filters.fromSectorId);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));

  return params;
}

// =============================
// Helper — data pura YYYY-MM-DD (o backend normaliza p/ UTC)
// =============================

export function toDateOnlyInputValue(value: string | undefined): string {
  if (!value) return "";
  // 🔹 aceita ISO ou YYYY-MM-DD; devolve YYYY-MM-DD
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match ? match[1] : "";
}
