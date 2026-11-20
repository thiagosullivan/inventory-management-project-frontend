import type { ApiEnvelope } from "@/lib/api-envelope";
import type {
  CreateUserPayload,
  UpdateUserRolePayload,
  UpdateUserSectorPayload,
  User,
  UserFilters,
  UserOption,
  UserRole,
  UsersListResponse,
} from "@/types/users.types";
import { api } from "./api";

// ============================================================
// Options (já existia)
// ============================================================

interface GetUserOptionsResponse {
  success: boolean;
  data: UserOption[];
}

export async function fetchUserOptions(): Promise<UserOption[]> {
  const response = await api.get<GetUserOptionsResponse>(
    "/admin/users/options",
  );
  return response.data.data;
}

// ============================================================
// Lista paginada
// ============================================================

export async function fetchUsers(
  filters: UserFilters = {},
): Promise<UsersListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.isActive !== undefined)
    params.set("isActive", String(filters.isActive));
  if (filters.sectorId) params.set("sectorId", filters.sectorId);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));

  const query = params.toString();
  const url = query ? `/admin/users?${query}` : "/admin/users";

  const response = await api.get<ApiEnvelope<UsersListResponse>>(url);
  return response.data.data;
}

// ============================================================
// Criar
// ============================================================

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await api.post<ApiEnvelope<User>>("/admin/users", payload);
  return response.data.data;
}

// ============================================================
// Update role
// ============================================================

export async function updateUserRole(
  id: string,
  payload: UpdateUserRolePayload,
): Promise<User> {
  const response = await api.patch<ApiEnvelope<User>>(
    `/admin/users/${id}/role`,
    payload,
  );
  return response.data.data;
}

// ============================================================
// Update setor
// ============================================================

export async function updateUserSector(
  id: string,
  payload: UpdateUserSectorPayload,
): Promise<User> {
  const response = await api.patch<ApiEnvelope<User>>(
    `/admin/users/${id}/sector`,
    payload,
  );
  return response.data.data;
}

// ============================================================
// Toggle status (inativar / reativar)
// ⚠️ Backend é TOGGLE PURO — sem body. Não existe PATCH { isActive }.
// ============================================================

export async function toggleUserStatus(id: string): Promise<User> {
  const response = await api.patch<ApiEnvelope<User>>(
    `/admin/users/${id}/status`,
  );
  return response.data.data;
}

// ============================================================
// Delete
// ⚠️ DÍVIDA TÉCNICA — regra de negócio está só no front (Fase 7.6).
//    O backend hoje só bloqueia delete self.
// ============================================================

export async function deleteUser(id: string): Promise<void> {
  await api.delete<ApiEnvelope<null>>(`/admin/users/${id}`);
}

// ============================================================
// (Opcional) Get by id — não usado na 7.5, mas o backend tem.
// ============================================================

export async function fetchUserById(id: string): Promise<User> {
  const response = await api.get<ApiEnvelope<User>>(`/admin/users/${id}`);
  return response.data.data;
}

// Reexport de role pra conveniência dos componentes (evita import circular)
export type { UserRole };