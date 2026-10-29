import { buildProductSearchParams } from "@/lib/product-query-params";
import type { ApiEnvelope } from "@/lib/api-envelope";
import type {
  CreateMovementPayload,
  CreateProductPayload,
  MovementResponse,
  Product,
  ProductDetailResponse,
  ProductFilters,
  ProductHistoryResponse,
  ProductMovementsResponse,
  ProductsResponseData,
  UpdateProductPayload,
} from "@/types/products.types";
import { api } from "./api";

type GetProductsApiResponse = ApiEnvelope<ProductsResponseData>;

// =============================
// Lista
// =============================

export async function fetchProducts(
  filters: ProductFilters,
): Promise<ProductsResponseData> {
  const params = buildProductSearchParams(filters);
  const query = params.toString();
  const url = query ? `/admin/products?${query}` : `/admin/products`;

  const response = await api.get<GetProductsApiResponse>(url);
  return response.data.data;
}

// =============================
// Detalhe
// =============================

export async function fetchProductById(
  id: string,
): Promise<ProductDetailResponse> {
  const response = await api.get<ApiEnvelope<ProductDetailResponse>>(
    `/admin/products/${id}`,
  );
  return response.data.data;
}

// =============================
// CRUD
// =============================

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await api.post<ApiEnvelope<Product>>(
    "/admin/products",
    payload,
  );
  return response.data.data;
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const response = await api.patch<ApiEnvelope<Product>>(
    `/admin/products/${id}`,
    payload,
  );
  return response.data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/admin/products/${id}`);
}

// =============================
// Barcode
// =============================

export async function fetchNextBarcode(): Promise<{ barcode: string }> {
  const response = await api.get<ApiEnvelope<{ barcode: string }>>(
    "/admin/products/barcode/next",
  );
  return response.data.data;
}

// =============================
// Barcode → produto
// =============================

export async function fetchProductByBarcode(barcode: string): Promise<Product> {
  const response = await api.get<ApiEnvelope<Product>>(
    `/admin/products/barcode/${encodeURIComponent(barcode)}`,
  );
  return response.data.data;
}

// =============================
// Movimentações
// =============================

export async function createMovement(
  productId: string,
  payload: CreateMovementPayload,
): Promise<MovementResponse> {
  const response = await api.post<ApiEnvelope<MovementResponse>>(
    `/admin/products/${productId}/movements`,
    payload,
  );
  return response.data.data;
}

export async function fetchProductMovements(
  productId: string,
): Promise<ProductMovementsResponse> {
  const response = await api.get<ApiEnvelope<ProductMovementsResponse>>(
    `/admin/products/${productId}/movements`,
  );
  return response.data.data;
}

// =============================
// Histórico
// =============================

export async function fetchProductHistory(
  productId: string,
): Promise<ProductHistoryResponse> {
  const response = await api.get<ApiEnvelope<ProductHistoryResponse>>(
    `/admin/products/${productId}/history`,
  );
  return response.data.data;
}
