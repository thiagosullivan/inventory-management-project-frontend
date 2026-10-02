import type { UserOption } from "@/types/users.types";
import { api } from "./api";

interface GetUserOptionsResponse {
  success: boolean;
  data: UserOption[];
}

/**
 * Busca as opções de usuário pra alimentar dropdowns.
 * Chama GET /admin/users/options.
 *
 * Endpoint dedicado — sem paginação, sem envelope de lista completa.
 * Já retorna `{ label, value, isActive }[]`.
 */
// 🔹 Opções de usuário — prontas pro <Select> com agrupamento
export async function fetchUserOptions(): Promise<UserOption[]> {
  const response = await api.get<GetUserOptionsResponse>(
    "/admin/users/options",
  );
  return response.data.data;
}
