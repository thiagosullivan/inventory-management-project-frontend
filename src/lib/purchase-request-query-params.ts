// src/lib/purchase-request-query-params.ts
import { clamp, getNumber, getString } from "@/lib/query-params-helpers";
import type {
  PurchaseRequestFilters,
  PurchaseRequestStatus,
} from "@/types/purchaseRequests.types";

export const PURCHASE_REQUEST_STATUS_VALUES: readonly PurchaseRequestStatus[] =
  ["PENDENTE", "EM_ATENDIMENTO", "ATENDIDO", "RECUSADO", "CANCELADO"] as const;

export const PURCHASE_REQUEST_DEFAULTS = {
  status: "PENDENTE" as PurchaseRequestStatus,
  page: 1,
  limit: 10,
} as const;

// =============================
// URL → filtros
// =============================

export function parsePurchaseRequestFilters(
  params: URLSearchParams,
): PurchaseRequestFilters & {
  status: PurchaseRequestStatus;
  page: number;
  limit: number;
} {
  const rawStatus = getString(params, "status");
  const status =
    rawStatus &&
    (PURCHASE_REQUEST_STATUS_VALUES as readonly string[]).includes(rawStatus)
      ? (rawStatus as PurchaseRequestStatus)
      : PURCHASE_REQUEST_DEFAULTS.status;

  const rawPage = getNumber(params, "page");
  const rawLimit = getNumber(params, "limit");

  const page =
    rawPage !== undefined && rawPage >= 1
      ? Math.floor(rawPage)
      : PURCHASE_REQUEST_DEFAULTS.page;
  const limit =
    rawLimit !== undefined
      ? clamp(Math.floor(rawLimit), 1, 100)
      : PURCHASE_REQUEST_DEFAULTS.limit;

  return {
    status,
    sectorId: getString(params, "sectorId"),
    dateFrom: getString(params, "dateFrom"),
    dateTo: getString(params, "dateTo"),
    sortBy: undefined, // fixo nesta fase
    sortOrder: undefined,
    page,
    limit,
  };
}

// =============================
// filtros → URLSearchParams
// =============================

export function serializePurchaseRequestFilters(
  filters: PurchaseRequestFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== PURCHASE_REQUEST_DEFAULTS.status)
    params.set("status", filters.status);
  if (filters.sectorId) params.set("sectorId", filters.sectorId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);

  if (
    filters.page !== undefined &&
    filters.page !== PURCHASE_REQUEST_DEFAULTS.page
  )
    params.set("page", String(filters.page));
  if (
    filters.limit !== undefined &&
    filters.limit !== PURCHASE_REQUEST_DEFAULTS.limit
  )
    params.set("limit", String(filters.limit));

  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  return params;
}
