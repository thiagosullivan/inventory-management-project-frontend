import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  parseStockSearchParams,
  buildStockSearchParams,
} from "@/lib/stock-query-params";
import { type StockFilters } from "@/types/stock.types";

/**
 * Hook que lê e escreve os filtros de /stock na URL.
 * A URL é a fonte da verdade: F5 preserva, back/forward funciona, deep link funciona.
 *
 * Diferente de useProductQueryParams:
 * - Não tem page/limit/sort (a página não pagina)
 * - Não tem setPage/setLimit
 * - clearFilters simplesmente zera os 3 campos
 */
export function useStockQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseStockSearchParams(searchParams),
    [searchParams],
  );

  const writeFilters = useCallback(
    (next: StockFilters, replace = false) => {
      const params = buildStockSearchParams(next);
      setSearchParams(params, { replace });
    },
    [setSearchParams],
  );

  /**
   * Atualiza UM filtro.
   * - Texto (location, supplier): use { replace: true } (debounce, não polui histórico)
   * - Click (categoryId): use { replace: false } (usuário pode "voltar" um filtro)
   */
  const setFilter = useCallback(
    <K extends keyof StockFilters>(
      key: K,
      value: StockFilters[K],
      options?: { replace?: boolean },
    ) => {
      const next: StockFilters = { ...filters, [key]: value };
      writeFilters(next, options?.replace ?? false);
    },
    [filters, writeFilters],
  );

  /**
   * Atualiza VÁRIOS filtros de uma vez (replace: false).
   */
  const setFilters = useCallback(
    (partial: Partial<StockFilters>) => {
      const next: StockFilters = { ...filters, ...partial };
      writeFilters(next, false);
    },
    [filters, writeFilters],
  );

  /**
   * Limpa todos os filtros.
   */
  const clearFilters = useCallback(() => {
    writeFilters({}, false);
  }, [writeFilters]);

  /**
   * true se algum filtro está ativo.
   */
  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.categoryId || filters.location || filters.supplier);
  }, [filters]);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters,
  };
}
