import {
  createUser,
  deleteUser,
  fetchUserOptions,
  fetchUsers,
  toggleUserStatus,
  updateUserRole,
  updateUserSector,
} from "@/services/users";
import type {
  CreateUserPayload,
  UpdateUserRolePayload,
  UpdateUserSectorPayload,
  User,
  UserFilters,
} from "@/types/users.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================================
// Options (já existia) — alimenta o UserSelect
// ============================================================

export function useUsers() {
  const query = useQuery({
    queryKey: ["users", "options"],
    queryFn: fetchUserOptions,
    staleTime: 1000 * 60 * 5,
  });

  return {
    options: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ============================================================
// Lista paginada
// ============================================================

export function useUsersList(filters: UserFilters) {
  return useQuery({
    queryKey: ["users", "list", filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev, // mantém tabela anterior enquanto pagina/filtra
  });
}

// ============================================================
// Helpers de invalidação
// ============================================================

function useInvalidateUsers() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["users", "list"] });
    qc.invalidateQueries({ queryKey: ["users", "options"] });
  };
}

// ============================================================
// Mutations
// ============================================================

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateUserRole() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserRolePayload;
    }) => updateUserRole(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateUserSector() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserSectorPayload;
    }) => updateUserSector(id, payload),
    onSuccess: invalidate,
  });
}

export function useToggleUserStatus() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => toggleUserStatus(id),
    onSuccess: invalidate,
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: invalidate,
  });
}

// ============================================================
// Hook composto opcional — só se o dialog precisar de tudo junto
// ============================================================

export type { User };