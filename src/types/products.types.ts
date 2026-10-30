export interface UserBasicInfo {
  id: string;
  name: string | null;
  email: string;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
  prefix?: string;
}

// 🔹 Shape retornado pelo backend (Prisma devolve todos os campos)
export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description: string | null;
  categoryId: string;
  category?: ProductCategoryRef;
  imageUrl: string | null;
  priceInCents: number | null;
  avgPriceInCents: number | null;
  quantity: number;
  minStock: number | null;
  maxStock: number | null;
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

// =============================
// Lista / paginação
// =============================

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
// Movimentações
// =============================

export type MovementType = "ENTRADA" | "SAIDA" | "AJUSTE" | "TRANSFERENCIA";
export type MovementStatus = "PENDENTE" | "CONCLUIDO" | "CANCELADO";

export interface MovementProductRef {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

export interface MovementResponse {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number; // assinado: -N em SAIDA
  reason: string | null;
  status: MovementStatus;
  unitPriceInCents: number | null;
  supplier: string | null;
  fromSectorId: string | null;
  toSectorId: string | null;
  transferId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  product: MovementProductRef;
  createdBy: UserBasicInfo;
}

export interface ProductMovementsResponse {
  movements: MovementResponse[];
  total: number;
}

// =============================
// Histórico (StockHistory)
// =============================

export interface StockHistoryMovementRef {
  id: string;
  type: MovementType;
  quantity: number;
  unitPriceInCents: number | null;
  supplier: string | null;
}

export interface StockHistoryEntry {
  id: string;
  productId: string;
  oldQuantity: number;
  newQuantity: number;
  movementId: string | null;
  changedById: string;
  changedAt: string;
  reason: string | null;
  changedBy: UserBasicInfo;
  movement: StockHistoryMovementRef | null;
}

export interface ProductHistoryResponse {
  history: StockHistoryEntry[];
  total: number;
}

// =============================
// Detalhe do produto
// =============================

export interface StockAlert {
  id: string;
  productId: string;
  alertType: "OUT_OF_STOCK" | "LOW_STOCK" | "EXPIRED" | "EXPIRING_SOON";
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ProductDetailResponse extends Product {
  stockHistory: StockHistoryEntry[];
  stockAlerts: StockAlert[];
}

// =============================
// Payloads
// =============================

export interface CreateProductPayload {
  name: string;
  description?: string | null;
  categoryId: string;
  imageUrl?: string | null;
  priceInCents?: number | null;
  quantity?: number;
  minStock?: number | null;
  maxStock?: number | null;
  expiryDate?: string | null;
  batchNumber?: string | null;
  location?: string | null;
  supplier?: string | null;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string | null;
  categoryId?: string;
  imageUrl?: string | null;
  priceInCents?: number | null;
  quantity?: number;
  reason?: string; // motivo do ajuste manual (quando quantity muda)
  minStock?: number | null;
  maxStock?: number | null;
  expiryDate?: string | null;
  batchNumber?: string | null;
  location?: string | null;
  supplier?: string | null;
}

export interface CreateMovementPayload {
  type: MovementType;
  quantity: number;
  reason?: string | null;
  unitPriceInCents?: number | null;
  supplier?: string | null;
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
  isExpired?: boolean;
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
