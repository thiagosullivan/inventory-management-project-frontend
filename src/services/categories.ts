import type { SelectOption } from "@/types/categories.types";
import { api } from "./api";

interface GetCategoryOptionsResponse {
  success: boolean;
  data: SelectOption[];
}

/**
 * Busca as opções de categoria pra alimentar dropdowns.
 * Chama GET /admin/categories/options.
 *
 * Endpoint dedicado — sem paginação, sem envelope de lista completa.
 * Já retorna `{ label, value }[]`, pronto pro <Select>.
 */
// 🔹 Opções enxutas de categoria — prontas pro <Select>
export async function fetchCategoryOptions(): Promise<SelectOption[]> {
  const response = await api.get<GetCategoryOptionsResponse>(
    "/admin/categories/options",
  );
  return response.data.data;
}
