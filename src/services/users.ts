// src/services/users.ts
import type { ApiEnvelope } from "@/lib/api-envelope";
import type {
  CreateUserPayload,
  UpdateUserProfilePayload,
  UpdateUserRolePayload,
  UpdateUserSectorPayload,
  User,
  UserFilters,
  UserOption,
  UserRole,
  UsersListResponse,
} from "@/types/users.types";
import { api } from "./api";

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

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await api.post<ApiEnvelope<User>>("/admin/users", payload);
  return response.data.data;
}

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

// 🔹 NOVO (Fase 7.6) — PATCH /admin/users/:id/profile
export async function updateUserProfile(
  id: string,
  payload: UpdateUserProfilePayload,
): Promise<User> {
  const response = await api.patch<ApiEnvelope<User>>(
    `/admin/users/${id}/profile`,
    payload,
  );
  return response.data.data;
}

export async function toggleUserStatus(id: string): Promise<User> {
  const response = await api.patch<ApiEnvelope<User>>(
    `/admin/users/${id}/status`,
  );
  return response.data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete<ApiEnvelope<null>>(`/admin/users/${id}`);
}

export async function fetchUserById(id: string): Promise<User> {
  const response = await api.get<ApiEnvelope<User>>(`/admin/users/${id}`);
  return response.data.data;
}

export type { UserRole };