import { buildProductSearchParams } from "@/lib/product-query-params";
import type {
  ProductFilters,
  ProductsResponseData,
} from "@/types/products.types";
import { api } from "./api";

interface GetProductsApiResponse {
  success: boolean;
  data: ProductsResponseData;
}

/**
 * Busca produtos com filtros e paginação.
 * Serializa os filtros na query string e chama GET /admin/products.
 */
export async function fetchProducts(
  filters: ProductFilters,
): Promise<ProductsResponseData> {
  const params = buildProductSearchParams(filters);
  const query = params.toString();
  const url = query ? `/admin/products?${query}` : `/admin/products`;

  const response = await api.get<GetProductsApiResponse>(url);
  return response.data.data;
}
