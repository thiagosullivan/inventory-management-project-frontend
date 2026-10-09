import { type StockFilters } from "@/types/stock.types";
import { getBooleanTrueOnly, getString } from "@/lib/query-params-helpers";

/**
 * Lê os search params da URL e retorna um objeto StockFilters tipado.
 * - Strings vazias viram undefined
 * - Só lê as 3 chaves que existem em StockFilters
 */
export function parseStockSearchParams(
  searchParams: URLSearchParams,
): StockFilters {
  return {
    categoryId: getString(searchParams, "categoryId"),
    location: getString(searchParams, "location"),
    locationExact: getBooleanTrueOnly(searchParams, "locationExact"),
    supplier: getString(searchParams, "supplier"),
    supplierExact: getBooleanTrueOnly(searchParams, "supplierExact"),
  };
}

/**
 * Constrói URLSearchParams a partir de StockFilters.
 * - Omite undefined/null/vazio (URL limpa)
 */
export function buildStockSearchParams(filters: StockFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.categoryId) params.set("categoryId", filters.categoryId);

  if (filters.location) {
    params.set("location", filters.location);
    // 🔹 Só serializa o modificador se o filtro base existe
    if (filters.locationExact === true) params.set("locationExact", "true");
  }

  if (filters.supplier) {
    params.set("supplier", filters.supplier);
    if (filters.supplierExact === true) params.set("supplierExact", "true");
  }

  return params;
}
