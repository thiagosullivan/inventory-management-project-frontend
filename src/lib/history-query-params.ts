// src/lib/history-query-params.ts
import type {
  HistoryFilters,
  HistorySortOrder,
  HistoryStatusFilter,
  MovementStatus,
  MovementType,
} from "@/types/history.types";

export const HISTORY_DEFAULTS = {
  page: 1,
  limit: 20,
  sortOrder: "desc" as HistorySortOrder,
  includeTransfers: true,
};

export const MOVEMENT_TYPE_VALUES: MovementType[] = [
  "ENTRADA",
  "SAIDA",
  "AJUSTE",
  "TRANSFERENCIA",
];

export const MOVEMENT_STATUS_VALUES: MovementStatus[] = [
  "PENDENTE",
  "CONCLUIDO",
  "CANCELADO",
];

export const HISTORY_STATUS_VALUES: HistoryStatusFilter[] = [
  "PENDENTE",
  "CONCLUIDO",
  "CANCELADO",
  "RECUSADO",
];

export function parseHistoryFilters(
  searchParams: URLSearchParams,
): HistoryFilters {
  const filters: HistoryFilters = {};

  const type = searchParams.get("type");
  if (type && MOVEMENT_TYPE_VALUES.includes(type as MovementType)) {
    filters.type = type as MovementType;
  }

  const status = searchParams.get("status");
  if (status && HISTORY_STATUS_VALUES.includes(status as HistoryStatusFilter)) {
    filters.status = status as HistoryStatusFilter;
  }

  const createdById = searchParams.get("createdById");
  if (createdById) filters.createdById = createdById;

  const productId = searchParams.get("productId");
  if (productId) filters.productId = productId;

  const dateFrom = searchParams.get("dateFrom");
  if (dateFrom) filters.dateFrom = dateFrom;

  const dateTo = searchParams.get("dateTo");
  if (dateTo) filters.dateTo = dateTo;

  const search = searchParams.get("search");
  if (search) filters.search = search;

  const page = searchParams.get("page");
  if (page) {
    const n = Number(page);
    if (Number.isFinite(n) && n >= 1) filters.page = Math.floor(n);
  }

  const limit = searchParams.get("limit");
  if (limit) {
    const n = Number(limit);
    if (Number.isFinite(n) && n >= 1)
      filters.limit = Math.min(Math.floor(n), 100);
  }

  const sortOrder = searchParams.get("sortOrder");
  if (sortOrder === "asc" || sortOrder === "desc") {
    filters.sortOrder = sortOrder;
  }

  const includeTransfers = searchParams.get("includeTransfers");
  if (includeTransfers === "true" || includeTransfers === "false") {
    filters.includeTransfers = includeTransfers === "true";
  }

  // 🔹 novo
  const hasTransfer = searchParams.get("hasTransfer");
  if (hasTransfer === "true" || hasTransfer === "false") {
    filters.hasTransfer = hasTransfer === "true";
  }

  return filters;
}

export function serializeHistoryFilters(
  filters: HistoryFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.createdById) params.set("createdById", filters.createdById);
  if (filters.productId) params.set("productId", filters.productId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.search) params.set("search", filters.search);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.sortOrder && filters.sortOrder !== HISTORY_DEFAULTS.sortOrder) {
    params.set("sortOrder", filters.sortOrder);
  }
  if (
    filters.includeTransfers !== undefined &&
    filters.includeTransfers !== HISTORY_DEFAULTS.includeTransfers
  ) {
    params.set("includeTransfers", String(filters.includeTransfers));
  }

  // 🔹 novo — sempre serializa quando definido (true ou false)
  if (filters.hasTransfer !== undefined) {
    params.set("hasTransfer", String(filters.hasTransfer));
  }

  return params;
}
