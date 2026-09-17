export interface UserBasicInfo {
  id: string;
  name: string;
  email: string;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  category?: ProductCategoryRef;
  imageUrl: string;
  priceInCents: number | null;
  quantity: number;
  minStock: number;
  maxStock: number;
  expiryDate: string | null;
  batchNumber: string | null;
  location: string | null;
  supplier: string | null;
  createdById: string;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: UserBasicInfo;
  updatedBy: UserBasicInfo | null;
}

export interface ProductsResponseData {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetProductsResponse {
  success: boolean;
  data: ProductsResponseData;
}

// =============================
// Filtros e paginação
// =============================

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  minQuantity?: number;
  maxQuantity?: number;
  hasExpiryDate?: boolean;
  isExpiring?: boolean;
  isLowStock?: boolean;
  createdById?: string;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
  page: number;
  limit: number;
};

export type ProductSortBy = "createdAt" | "updatedAt" | "name" | "quantity";

export type SortOrder = "asc" | "desc";

export const PRODUCT_DEFAULTS = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
} as const;

export const PRODUCT_LIMITS = {
  min: 1,
  max: 100,
} as const;
