// src/services/transfers.ts
import { api } from "./api";
import type { ApiEnvelope } from "@/lib/api-envelope";
import type {
  CancelTransferData,
  CreateTransferData,
  TransferFilters,
  TransferResponse,
  TransfersListResponse,
} from "@/types/transfers.types";

// =============================
// Lista
// =============================

export async function fetchTransfers(
  filters: TransferFilters = {},
): Promise<TransfersListResponse> {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.fromSectorId) params.set("fromSectorId", filters.fromSectorId);
  if (filters.toSectorId) params.set("toSectorId", filters.toSectorId);
  if (filters.purchaseRequestId)
    params.set("purchaseRequestId", filters.purchaseRequestId);
  if (filters.createdById) params.set("createdById", filters.createdById);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const query = params.toString();
  const url = query ? `/admin/transfers?${query}` : "/admin/transfers";

  const response = await api.get<ApiEnvelope<TransfersListResponse>>(url);
  return response.data.data;
}

// =============================
// Detalhe
// =============================

export async function fetchTransferById(id: string): Promise<TransferResponse> {
  const response = await api.get<ApiEnvelope<TransferResponse>>(
    `/admin/transfers/${id}`,
  );
  return response.data.data;
}

// =============================
// Criação
// =============================

export async function createTransfer(
  payload: CreateTransferData,
): Promise<TransferResponse> {
  const response = await api.post<ApiEnvelope<TransferResponse>>(
    "/admin/transfers",
    payload,
  );
  return response.data.data;
}

// =============================
// Ações
// =============================

export async function confirmTransfer(id: string): Promise<TransferResponse> {
  const response = await api.patch<ApiEnvelope<TransferResponse>>(
    `/admin/transfers/${id}/confirm`,
  );
  return response.data.data;
}

export async function refuseTransfer(id: string): Promise<TransferResponse> {
  const response = await api.patch<ApiEnvelope<TransferResponse>>(
    `/admin/transfers/${id}/refuse`,
  );
  return response.data.data;
}

export async function cancelTransfer(
  id: string,
  payload: CancelTransferData,
): Promise<TransferResponse> {
  const response = await api.patch<ApiEnvelope<TransferResponse>>(
    `/admin/transfers/${id}/cancel`,
    payload,
  );
  return response.data.data;
}
