// src/services/purchaseRequests.ts
import { api } from "./api";
import type { ApiEnvelope } from "@/lib/api-envelope";
import type {
  CatalogProduct,
  CreatePurchaseRequestData,
  FinalizePurchaseRequestData,
  PurchaseRequestFilters,
  PurchaseRequestResponse,
  PurchaseRequestsListResponse,
  RefusePurchaseRequestData,
} from "@/types/purchaseRequests.types";

// =============================
// Catálogo (pra CreatePurchaseRequestDialog)
// =============================

export async function fetchPurchaseRequestCatalog(): Promise<CatalogProduct[]> {
  const response = await api.get<ApiEnvelope<CatalogProduct[]>>(
    "/admin/purchase-requests/catalog",
  );
  return response.data.data;
}

// =============================
// Lista
// =============================

export async function fetchPurchaseRequests(
  filters: PurchaseRequestFilters = {},
): Promise<PurchaseRequestsListResponse> {
  const params = new URLSearchParams();

  if (filters.sectorId) params.set("sectorId", filters.sectorId);
  if (filters.status) params.set("status", filters.status);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const query = params.toString();
  const url = query
    ? `/admin/purchase-requests?${query}`
    : "/admin/purchase-requests";

  const response =
    await api.get<ApiEnvelope<PurchaseRequestsListResponse>>(url);
  return response.data.data;
}

// =============================
// Detalhe
// =============================

export async function fetchPurchaseRequestById(
  id: string,
): Promise<PurchaseRequestResponse> {
  const response = await api.get<ApiEnvelope<PurchaseRequestResponse>>(
    `/admin/purchase-requests/${id}`,
  );
  return response.data.data;
}

// =============================
// Criação
// =============================

export async function createPurchaseRequest(
  payload: CreatePurchaseRequestData,
): Promise<PurchaseRequestResponse> {
  const response = await api.post<ApiEnvelope<PurchaseRequestResponse>>(
    "/admin/purchase-requests",
    payload,
  );
  return response.data.data;
}

// =============================
// Ações
// =============================

export async function refusePurchaseRequest(
  id: string,
  payload: RefusePurchaseRequestData,
): Promise<PurchaseRequestResponse> {
  const response = await api.patch<ApiEnvelope<PurchaseRequestResponse>>(
    `/admin/purchase-requests/${id}/refuse`,
    payload,
  );
  return response.data.data;
}

export async function finalizePurchaseRequest(
  id: string,
  payload: FinalizePurchaseRequestData,
): Promise<PurchaseRequestResponse> {
  const response = await api.patch<ApiEnvelope<PurchaseRequestResponse>>(
    `/admin/purchase-requests/${id}/finalize`,
    payload,
  );
  return response.data.data;
}

export async function cancelPurchaseRequest(
  id: string,
): Promise<PurchaseRequestResponse> {
  const response = await api.patch<ApiEnvelope<PurchaseRequestResponse>>(
    `/admin/purchase-requests/${id}/cancel`,
  );
  return response.data.data;
}
