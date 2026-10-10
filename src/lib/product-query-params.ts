import {
  PRODUCT_DEFAULTS,
  PRODUCT_LIMITS,
  type ProductFilters,
  type ProductSortBy,
  type SortOrder,
} from "@/types/products.types";
import {
  clamp,
  getBoolean,
  getBooleanTrueOnly,
  getNumber,
  getString,
} from "@/lib/query-params-helpers";

/**
 * Lê os search params da URL e retorna um objeto ProductFilters tipado.
 * - Aplica defaults quando o param está ausente
 * - Valida e descarta valores inválidos
 * - Clampa valores fora do range (page, limit)
 */
export function parseProductSearchParams(
  searchParams: URLSearchParams,
): ProductFilters {
  return {
    search: getString(searchParams, "search"),
    categoryId: getString(searchParams, "categoryId"),
    minQuantity: getNumber(searchParams, "minQuantity"),
    maxQuantity: getNumber(searchParams, "maxQuantity"),
    hasExpiryDate: getBoolean(searchParams, "hasExpiryDate"),
    isExpiring: getBooleanTrueOnly(searchParams, "isExpiring"),
    isLowStock: getBooleanTrueOnly(searchParams, "isLowStock"),
    isExpired: getBooleanTrueOnly(searchParams, "isExpired"),
    createdById: getString(searchParams, "createdById"),
    sortBy: getSortBy(searchParams, "sortBy"),
    sortOrder: getSortOrder(searchParams, "sortOrder"),
    page: clamp(
      getNumber(searchParams, "page") ?? PRODUCT_DEFAULTS.page,
      PRODUCT_LIMITS.min,
      PRODUCT_LIMITS.max,
    ),
    limit: clamp(
      getNumber(searchParams, "limit") ?? PRODUCT_DEFAULTS.limit,
      PRODUCT_LIMITS.min,
      PRODUCT_LIMITS.max,
    ),
  };
}

/**
 * Constrói URLSearchParams a partir de ProductFilters.
 * - Omite valores iguais ao default (URL limpa)
 * - Omite undefined/null
 * - Serializa booleanos como "true"/"false"
 */
export function buildProductSearchParams(
  filters: ProductFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.minQuantity !== undefined)
    params.set("minQuantity", String(filters.minQuantity));
  if (filters.maxQuantity !== undefined)
    params.set("maxQuantity", String(filters.maxQuantity));

  if (filters.hasExpiryDate !== undefined)
    params.set("hasExpiryDate", String(filters.hasExpiryDate));

  if (filters.isExpiring === true) params.set("isExpiring", "true");
  if (filters.isLowStock === true) params.set("isLowStock", "true");
  if (filters.isExpired === true) params.set("isExpired", "true");

  if (filters.createdById) params.set("createdById", filters.createdById);

  // Só adiciona se diferente do default
  if (filters.sortBy && filters.sortBy !== PRODUCT_DEFAULTS.sortBy) {
    params.set("sortBy", filters.sortBy);
  }
  if (filters.sortOrder && filters.sortOrder !== PRODUCT_DEFAULTS.sortOrder) {
    params.set("sortOrder", filters.sortOrder);
  }

  // Page: só adiciona se diferente de 1
  if (filters.page !== PRODUCT_DEFAULTS.page) {
    params.set("page", String(filters.page));
  }
  // Limit: só adiciona se diferente de 10
  if (filters.limit !== PRODUCT_DEFAULTS.limit) {
    params.set("limit", String(filters.limit));
  }

  return params;
}

// ============================================================
// Helpers específicos de produto
// (dependem de ProductSortBy / SortOrder — não vão pro helper comum)
// ============================================================

function getSortBy(
  params: URLSearchParams,
  key: string,
): ProductSortBy | undefined {
  const raw = params.get(key);
  if (!raw) return undefined;
  const valid: ProductSortBy[] = ["name", "createdAt", "updatedAt", "quantity"];
  if (valid.includes(raw as ProductSortBy)) return raw as ProductSortBy;
  return undefined;
}

function getSortOrder(
  params: URLSearchParams,
  key: string,
): SortOrder | undefined {
  const raw = params.get(key);
  if (raw === "asc" || raw === "desc") return raw;
  return undefined;
}
