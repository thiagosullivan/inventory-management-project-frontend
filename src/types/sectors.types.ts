// src/types/sectors.types.ts

// =============================
// Enums / refs
// =============================

export interface SectorRef {
  id: string;
  name: string;
  isWarehouse: boolean;
}

// =============================
// Resposta da API
// =============================

export interface SectorResponse {
  id: string;
  name: string;
  description: string | null;
  isWarehouse: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    transfersFrom: number;
    transfersTo: number;
    purchaseRequests: number;
    // 🔹 Fase 7.7 — movimentações também bloqueiam delete
    movementsFrom: number;
    movementsTo: number;
  };
}

// Alias semântico (usado na UI)
export type Sector = SectorResponse;

// =============================
// Lista (sem paginação — volume baixo)
// =============================

export interface SectorsListResponse {
  sectors: SectorResponse[];
  total: number;
}

// =============================
// Filtros
// =============================

export interface SectorFilters {
  search?: string;
  isWarehouse?: boolean;
  isActive?: boolean;
}

// =============================
// /options (GET /admin/sectors/options)
// =============================

export interface SectorOption {
  label: string;
  value: string;
  isWarehouse: boolean;
  isActive: boolean; // 🔹 Fase 7.7
}

// =============================
// Payloads (MANAGER)
// =============================

export interface CreateSectorData {
  name: string;
  description?: string;
  isWarehouse?: boolean;
  isActive?: boolean;
}

// isWarehouse NÃO está aqui de propósito (imutável)
export interface UpdateSectorData {
  name?: string;
  description?: string | null; // 🔹 backend aceita null (limpa)
  isActive?: boolean;
}
