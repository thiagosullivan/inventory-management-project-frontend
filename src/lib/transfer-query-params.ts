// src/lib/transfer-query-params.ts
import { clamp, getNumber, getString } from "@/lib/query-params-helpers";
import type { TransferFilters, TransferStatus } from "@/types/transfers.types";

export const TRANSFER_STATUS_VALUES: readonly TransferStatus[] = [
  "PENDENTE",
  "CONCLUIDO",
  "CANCELADO",
  "RECUSADO",
] as const;

export const TRANSFER_DEFAULTS = {
  page: 1,
  limit: 10,
} as const;

// =============================
// URL → filtros
// =============================

export function parseTransferFilters(
  params: URLSearchParams,
): Required<Pick<TransferFilters, "page" | "limit">> &
  Omit<TransferFilters, "page" | "limit"> {
  const rawStatus = getString(params, "status");
  const status =
    rawStatus &&
    (TRANSFER_STATUS_VALUES as readonly string[]).includes(rawStatus)
      ? (rawStatus as TransferStatus)
      : undefined;

  const rawPage = getNumber(params, "page");
  const rawLimit = getNumber(params, "limit");

  const page =
    rawPage !== undefined && rawPage >= 1
      ? Math.floor(rawPage)
      : TRANSFER_DEFAULTS.page;
  const limit =
    rawLimit !== undefined
      ? clamp(Math.floor(rawLimit), 1, 100)
      : TRANSFER_DEFAULTS.limit;

  return {
    status,
    fromSectorId: getString(params, "fromSectorId"),
    toSectorId: getString(params, "toSectorId"),
    purchaseRequestId: getString(params, "purchaseRequestId"),
    createdById: getString(params, "createdById"),
    dateFrom: getString(params, "dateFrom"),
    dateTo: getString(params, "dateTo"),
    sortBy: undefined, // fixo nesta fase (createdAt desc no backend)
    sortOrder: undefined,
    page,
    limit,
  };
}

// =============================
// filtros → URLSearchParams
// =============================

export function serializeTransferFilters(
  filters: TransferFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.fromSectorId) params.set("fromSectorId", filters.fromSectorId);
  if (filters.toSectorId) params.set("toSectorId", filters.toSectorId);
  if (filters.purchaseRequestId)
    params.set("purchaseRequestId", filters.purchaseRequestId);
  if (filters.createdById) params.set("createdById", filters.createdById);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);

  if (filters.page !== undefined && filters.page !== TRANSFER_DEFAULTS.page)
    params.set("page", String(filters.page));
  if (filters.limit !== undefined && filters.limit !== TRANSFER_DEFAULTS.limit)
    params.set("limit", String(filters.limit));

  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  return params;
}
