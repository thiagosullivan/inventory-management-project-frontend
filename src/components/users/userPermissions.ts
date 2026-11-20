import type { User } from "@/types/users.types";

/**
 * Regra de visibilidade do botão "Excluir" (Fase 7.5).
 * Espelha o guard que será movido pro backend na Fase 7.6.
 *
 * - Nunca deletar MANAGER
 * - Nunca deletar a si mesmo
 * - Só deletar usuário sem atividade (nunca logou, email não verificado)
 */
export function canDeleteUser(user: User, currentUserId: string): boolean {
  return (
    user.role !== "MANAGER" &&
    user.id !== currentUserId &&
    user.lastLogin == null &&
    user.emailVerified === false
  );
}