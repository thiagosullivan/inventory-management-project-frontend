// src/types/users.types.ts

export type UserRole = "MANAGER" | "STAFF";

export interface UserSectorRef {
  id: string;
  name: string;
  isWarehouse: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  image: string | null;
  emailVerified: boolean;
  sectorId: string | null;
  sector: UserSectorRef | null;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sectorId?: string;
  page?: number;
  limit?: number;
}

// ============================================================
// Payloads
// ============================================================

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  sectorId: string;
  image?: string;
}

export interface UpdateUserRolePayload {
  role: UserRole;
}

export interface UpdateUserSectorPayload {
  sectorId: string;
}

// 🔹 NOVO (Fase 7.6) — PATCH /admin/users/:id/profile
export interface UpdateUserProfilePayload {
  name: string;
}

// ============================================================
// Options
// ============================================================

export interface UserOption {
  label: string;
  value: string;
  isActive: boolean;
}