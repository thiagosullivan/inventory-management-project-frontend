import { fetchStockMetrics } from "@/services/stock";
import type { StockFilters } from "@/types/stock.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/**
 * Query das métricas de /stock.
 * - `keepPreviousData`: mantém os dados antigos enquanto os novos chegam
 *   (importante quando o usuário troca um filtro — evita tela em branco)
 * - `staleTime: 30s`: dados de estoque mudam com movimentações; 30s é razoável
 */
export function useStockMetrics(filters: StockFilters) {
  return useQuery({
    queryKey: ["stockMetrics", filters],
    queryFn: () => fetchStockMetrics(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}
