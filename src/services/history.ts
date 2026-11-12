// src/services/history.ts
import { api } from "./api";
import type { ApiEnvelope } from "@/lib/api-envelope";
import type {
  HistoryFilters,
  HistoryListResponse,
} from "@/types/history.types";

export async function fetchHistory(
  filters: HistoryFilters = {},
): Promise<HistoryListResponse> {
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
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.includeTransfers !== undefined) {
    params.set("includeTransfers", String(filters.includeTransfers));
  }

  // 🔹 novo
  if (filters.hasTransfer !== undefined) {
    params.set("hasTransfer", String(filters.hasTransfer));
  }

  const query = params.toString();
  const url = query ? `/admin/history?${query}` : "/admin/history";

  const response = await api.get<ApiEnvelope<HistoryListResponse>>(url);
  return response.data.data;
}
