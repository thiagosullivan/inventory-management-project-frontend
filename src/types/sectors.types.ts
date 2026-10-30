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
  };
}

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
}

// =============================
// Payloads (MANAGER)
// =============================

export interface CreateSectorData {
  name: string;
  description?: string;
  isWarehouse?: boolean; // só 1 pode ser true no sistema
  isActive?: boolean;
}

// isWarehouse NÃO está aqui de propósito (imutável)
export interface UpdateSectorData {
  name?: string;
  description?: string;
  isActive?: boolean;
}
