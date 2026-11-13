// src/types/history.types.ts

// =============================
// Enums auxiliares (espelho do backend)
// =============================

export type MovementType = "ENTRADA" | "SAIDA" | "AJUSTE" | "TRANSFERENCIA";
export type MovementStatus =
  | "PENDENTE"
  | "CONCLUIDO"
  | "CANCELADO"
  | "RECUSADO";

export type TransferStatus =
  | "PENDENTE"
  | "CONCLUIDO"
  | "CANCELADO"
  | "RECUSADO";

export type HistoryStatusFilter = MovementStatus | TransferStatus;
export type HistoryEventType = "MOVEMENT" | "TRANSFER";
export type HistorySortOrder = "asc" | "desc";

// =============================
// Filtros
// =============================

export interface HistoryFilters {
  type?: MovementType;
  status?: HistoryStatusFilter;
  createdById?: string;
  productId?: string;
  dateFrom?: string; // ISO
  dateTo?: string; // ISO
  search?: string;
  page?: number; // default 1
  limit?: number; // default 20, max 100
  sortOrder?: HistorySortOrder; // default desc
  includeTransfers?: boolean; // default true
  hasTransfer?: boolean;
}

// =============================
// Refs
// =============================

export interface HistorySectorRef {
  id: string;
  name: string;
  isWarehouse: boolean;
}

export interface HistoryUserRef {
  id: string;
  name: string | null;
}

export interface HistoryProductRef {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
}

// =============================
// Movement ref
// =============================

export interface HistoryMovementRef {
  id: string;
  type: MovementType;
  status: MovementStatus;
  quantity: number;
  reason: string | null;
  unitPriceInCents: number | null;
  createdAt: string; // backend devolve Date → JSON vira string
  product: HistoryProductRef;
  createdBy: HistoryUserRef;
  fromSector: HistorySectorRef | null;
  toSector: HistorySectorRef | null;
}

// =============================
// Transfer ref
// =============================

export interface HistoryTransferItemRef {
  productId: string;
  quantity: number;
  product: HistoryProductRef;
}

export interface HistoryTransferRef {
  id: string;
  status: TransferStatus;
  createdAt: string;
  confirmedAt: string | null;
  refusedAt: string | null;
  cancelledAt: string | null;
  reason: string | null;
  refusalReason: string | null;
  cancelReason: string | null;
  fromSector: HistorySectorRef;
  toSector: HistorySectorRef;
  createdBy: HistoryUserRef;
  items: HistoryTransferItemRef[];
  _count: { items: number };
}

// =============================
// Evento (união discriminada)
// =============================

export type HistoryEvent =
  | {
      eventType: "MOVEMENT";
      createdAt: string;
      movement: HistoryMovementRef;
    }
  | {
      eventType: "TRANSFER";
      createdAt: string;
      transfer: HistoryTransferRef;
      movements: HistoryMovementRef[];
    };

// =============================
// Resposta da lista
// =============================

export interface HistoryListResponse {
  events: HistoryEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
