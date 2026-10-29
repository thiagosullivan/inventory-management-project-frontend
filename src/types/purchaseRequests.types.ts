// src/types/purchaseRequests.types.ts

// =============================
// Enums (espelho do schema)
// =============================

export type PurchaseRequestStatus =
  | "PENDENTE"
  | "EM_ATENDIMENTO"
  | "ATENDIDO"
  | "RECUSADO"
  | "CANCELADO";

// =============================
// Payloads
// =============================

export interface CreatePurchaseRequestItemData {
  productId: string;
  quantity: number;
}

export interface CreatePurchaseRequestData {
  items: CreatePurchaseRequestItemData[];
  notes?: string | null; // itens não cadastrados
}

export interface RefusePurchaseRequestData {
  refusalReason: string; // obrigatório
}

export interface FinalizePurchaseRequestData {
  finalizeNote?: string | null; // obrigatório se houver Transfer RECUSADO/CANCELADO ou entrega incompleta
}

// =============================
// Filtros
// =============================

export interface PurchaseRequestFilters {
  sectorId?: string;
  status?: PurchaseRequestStatus;
  dateFrom?: string; // ISO
  dateTo?: string; // ISO
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "status";
  sortOrder?: "asc" | "desc";
}

// =============================
// Catálogo (GET /admin/purchase-requests/catalog)
// =============================

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  imageUrl: string | null;
  priceInCents: number | null;
  isOutOfStock: boolean; // baseado no Product.quantity (estoque do Almoxarifado)
  category?: { id: string; name: string };
}

// =============================
// Refs
// =============================

export interface PurchaseRequestSectorRef {
  id: string;
  name: string;
  isWarehouse: boolean;
}

export interface PurchaseRequestUserRef {
  id: string;
  name: string | null;
  email: string;
}

// =============================
// Itens
// =============================

export interface PurchaseRequestItemResponse {
  id: string;
  requestId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    imageUrl: string | null;
    priceInCents: number | null;
  };
}

// =============================
// Transfer ref (dentro do pedido)
// =============================

export interface PurchaseRequestTransferRef {
  id: string;
  status: "PENDENTE" | "CONCLUIDO" | "CANCELADO" | "RECUSADO";
  createdAt: string;
  confirmedAt: string | null;
  refusedAt: string | null;
  cancelledAt: string | null;
  _count?: { items: number };
}

// =============================
// Resposta principal
// =============================

export interface PurchaseRequestResponse {
  id: string;
  sectorId: string;
  status: PurchaseRequestStatus;
  notes: string | null;
  refusalReason: string | null;
  finalizeNote: string | null;
  createdById: string;
  finalizedById: string | null;
  refusedById: string | null;
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
  refusedAt: string | null;
  sector?: PurchaseRequestSectorRef;
  createdBy?: PurchaseRequestUserRef;
  finalizedBy?: PurchaseRequestUserRef | null;
  refusedBy?: PurchaseRequestUserRef | null;
  items?: PurchaseRequestItemResponse[];
  transfers?: PurchaseRequestTransferRef[];
  _count?: { items: number; transfers: number };
}

// =============================
// Lista
// =============================

export interface PurchaseRequestsListResponse {
  requests: PurchaseRequestResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
