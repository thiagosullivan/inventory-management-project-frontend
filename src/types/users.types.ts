// ============================================================
// Roles
// ============================================================

export type UserRole = "MANAGER" | "STAFF";

// ============================================================
// Entidades
// ============================================================

/** Setor resumido que vem aninhado no User (select do backend). */
export interface UserSectorRef {
  id: string;
  name: string;
  isWarehouse: boolean;
}

/** Usuário como retornado por GET /admin/users (shape do select). */
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

/** Resposta de GET /admin/users. */
export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

/** Filtros aceitos por GET /admin/users (query params). */
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

/** POST /admin/users */
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole; // default STAFF no backend
  sectorId: string; // obrigatório
  image?: string;
}

/** PATCH /admin/users/:id/role */
export interface UpdateUserRolePayload {
  role: UserRole;
}

/** PATCH /admin/users/:id/sector */
export interface UpdateUserSectorPayload {
  sectorId: string;
}

// ============================================================
// Options (selects) — já existia, mantido
// ============================================================

export interface UserOption {
  label: string;
  value: string;
  isActive: boolean;
}