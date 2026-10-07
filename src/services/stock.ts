import { buildStockSearchParams } from "@/lib/stock-query-params";
import type { StockFilters, StockMetricsResponse } from "@/types/stock.types";
import { api } from "./api";

interface GetStockMetricsApiResponse {
  success: boolean;
  data: StockMetricsResponse;
}

/**
 * Busca as métricas de estoque do dashboard.
 * Serializa os filtros na query string e chama GET /admin/dashboard/stock.
 *
 * ⚠️ Diferente de fetchProducts, NÃO tem paginação — o retorno já é o
 * StockMetricsResponse completo (summary + distribution + details).
 * Desembrulha { success, data } aqui (padrão do projeto).
 */
export async function fetchStockMetrics(
  filters: StockFilters,
): Promise<StockMetricsResponse> {
  const params = buildStockSearchParams(filters);
  const query = params.toString();
  const url = query
    ? `/admin/dashboard/stock?${query}`
    : `/admin/dashboard/stock`;

  const response = await api.get<GetStockMetricsApiResponse>(url);
  return response.data.data;
}
