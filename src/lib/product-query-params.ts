import {
  PRODUCT_DEFAULTS,
  PRODUCT_LIMITS,
  type ProductFilters,
  type ProductSortBy,
  type SortOrder,
} from "@/types/products.types";

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
// Helpers internos
// ============================================================

function getString(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key);
  if (!value || value.trim() === "") return undefined;
  return value;
}

function getNumber(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key);
  if (!raw) return undefined;
  const num = Number(raw);
  if (Number.isNaN(num)) return undefined;
  return num;
}

function getBoolean(params: URLSearchParams, key: string): boolean | undefined {
  const raw = params.get(key);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}

/**
 * Só retorna true se o param for literalmente "true".
 * Pra booleanos que o backend só entende como "true" (isExpiring, isLowStock).
 */
function getBooleanTrueOnly(
  params: URLSearchParams,
  key: string,
): boolean | undefined {
  const raw = params.get(key);
  if (raw === "true") return true;
  return undefined;
}

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
