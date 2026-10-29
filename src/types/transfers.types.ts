// src/types/transfers.types.ts

// =============================
// Enums (espelho do schema)
// =============================

export type TransferStatus =
  | "PENDENTE"
  | "CONCLUIDO"
  | "CANCELADO"
  | "RECUSADO";

// =============================
// Payloads
// =============================

export interface CreateTransferItemData {
  productId: string;
  quantity: number;
}

export interface CreateTransferData {
  toSectorId: string;
  items: CreateTransferItemData[];
  purchaseRequestId?: string | null;
  reason?: string | null;
}

export interface CancelTransferData {
  cancelReason: string; // obrigatório (auditoria)
}

// =============================
// Filtros
// =============================

export interface TransferFilters {
  status?: TransferStatus;
  fromSectorId?: string;
  toSectorId?: string;
  purchaseRequestId?: string;
  createdById?: string;
  dateFrom?: string; // ISO
  dateTo?: string; // ISO
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "status";
  sortOrder?: "asc" | "desc";
}

// =============================
// Refs
// =============================

export interface TransferSectorRef {
  id: string;
  name: string;
  isWarehouse: boolean;
}

export interface TransferUserRef {
  id: string;
  name: string | null;
  email: string;
}

// =============================
// Itens
// =============================

export interface TransferItemResponse {
  id: string;
  transferId: string;
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
// Resposta principal
// =============================

export interface TransferResponse {
  id: string;
  fromSectorId: string;
  toSectorId: string;
  purchaseRequestId: string | null;
  status: TransferStatus;
  reason: string | null;
  cancelReason: string | null;
  createdById: string;
  confirmedById: string | null;
  refusedById: string | null;
  cancelledById: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  refusedAt: string | null;
  cancelledAt: string | null;
  fromSector?: TransferSectorRef;
  toSector?: TransferSectorRef;
  createdBy?: TransferUserRef;
  confirmedBy?: TransferUserRef | null;
  refusedBy?: TransferUserRef | null;
  cancelledBy?: TransferUserRef | null;
  items?: TransferItemResponse[];
  _count?: { items: number };
}

// =============================
// Lista
// =============================

export interface TransfersListResponse {
  transfers: TransferResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
