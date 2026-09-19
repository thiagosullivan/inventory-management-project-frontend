import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  parseProductSearchParams,
  buildProductSearchParams,
} from "@/lib/product-query-params";
import {
  PRODUCT_DEFAULTS,
  PRODUCT_LIMITS,
  type ProductFilters,
} from "@/types/products.types";

/**
 * Hook que lê e escreve os filtros de produto na URL.
 * A URL é a fonte da verdade: qualquer mudança reflete na URL, e a URL
 * reflete o estado (F5 preserva, back/forward funciona, deep link funciona).
 */
export function useProductQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lê os filtros da URL, memoizado
  const filters = useMemo(
    () => parseProductSearchParams(searchParams),
    [searchParams],
  );

  /**
   * Escreve um novo conjunto de filtros na URL.
   * `replace` controla se empilha ou substitui na história do navegador.
   */
  const writeFilters = useCallback(
    (next: ProductFilters, replace = false) => {
      const params = buildProductSearchParams(next);
      setSearchParams(params, { replace });
    },
    [setSearchParams],
  );

  /**
   * Atualiza UM filtro de conteúdo (search, categoryId, etc.).
   * Sempre reseta page pra 1, exceto se a key for literalmente "page".
   * O tipo exclui "page" e "limit" — esses têm setters dedicados.
   */
  const setFilter = useCallback(
    <K extends keyof Omit<ProductFilters, "page" | "limit">>(
      key: K,
      value: ProductFilters[K],
    ) => {
      const next: ProductFilters = {
        ...filters,
        [key]: value,
        page: PRODUCT_DEFAULTS.page, // reset
      };
      writeFilters(next, false);
    },
    [filters, writeFilters],
  );

  /**
   * Atualiza VÁRIOS filtros de uma vez.
   * Sempre reseta page pra 1.
   */
  const setFilters = useCallback(
    (partial: Partial<Omit<ProductFilters, "page" | "limit">>) => {
      const next: ProductFilters = {
        ...filters,
        ...partial,
        page: PRODUCT_DEFAULTS.page,
      };
      writeFilters(next, false);
    },
    [filters, writeFilters],
  );

  /**
   * Atualiza só a página. NÃO reseta nada.
   * Clampa entre 1 e o máximo válido.
   */
  const setPage = useCallback(
    (page: number) => {
      const safe = Math.max(1, Math.floor(page));
      const next: ProductFilters = {
        ...filters,
        page: safe,
      };
      writeFilters(next, false);
    },
    [filters, writeFilters],
  );

  /**
   * Atualiza o limit. Sempre reseta page pra 1.
   * Clampa entre PRODUCT_LIMITS.min e max.
   * Usa replace=true (não faz sentido "voltar" pro limit anterior).
   */
  const setLimit = useCallback(
    (limit: number) => {
      const safe = Math.min(
        Math.max(Math.floor(limit), PRODUCT_LIMITS.min),
        PRODUCT_LIMITS.max,
      );
      const next: ProductFilters = {
        ...filters,
        limit: safe,
        page: PRODUCT_DEFAULTS.page,
      };
      writeFilters(next, true); // replace
    },
    [filters, writeFilters],
  );

  /**
   * Limpa os filtros de conteúdo (search, categoryId, booleanos, etc.),
   * mas MANTÉM limit, sortBy e sortOrder (são preferências de visualização).
   */
  const clearFilters = useCallback(() => {
    const next: ProductFilters = {
      ...PRODUCT_DEFAULTS, // page=1, limit=10, sortBy=createdAt, sortOrder=desc
      limit: filters.limit, // preserva
      sortBy: filters.sortBy, // preserva
      sortOrder: filters.sortOrder, // preserva
      // todos os filtros de conteúdo viram undefined
    };
    writeFilters(next, false);
  }, [filters.limit, filters.sortBy, filters.sortOrder, writeFilters]);

  /**
   * true se algum filtro de conteúdo está ativo.
   * Ignora page, limit, sortBy, sortOrder.
   */
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.search ||
      filters.categoryId ||
      filters.minQuantity !== undefined ||
      filters.maxQuantity !== undefined ||
      filters.hasExpiryDate !== undefined ||
      filters.isExpiring !== undefined ||
      filters.isLowStock !== undefined ||
      filters.createdById,
    );
  }, [filters]);

  return {
    filters,
    setFilter,
    setFilters,
    setPage,
    setLimit,
    clearFilters,
    hasActiveFilters,
  };
}
