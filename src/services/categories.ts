import type {
  CategoriesListResponse,
  Category,
  CreateCategoryPayload,
  SelectOption,
  UpdateCategoryPayload,
} from "@/types/categories.types";
import { api } from "./api";

// 🔹 Envelope padrão do backend
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/**
 * Busca as opções de categoria pra alimentar dropdowns.
 * Chama GET /admin/categories/options.
 */
export async function fetchCategoryOptions(): Promise<SelectOption[]> {
  const response = await api.get<ApiEnvelope<SelectOption[]>>(
    "/admin/categories/options",
  );
  return response.data.data;
}

// ============================================================
// CRUD completo (Fase 3 frontend)
// ============================================================

/**
 * Lista todas as categorias (com createdBy + _count.products).
 * Chama GET /admin/categories.
 *
 * O backend devolve envelope paginado:
 *   { success, data: { categories, total, page, limit, totalPages } }
 * Como a UI não pagina, extraímos só `data.categories`.
 */
export async function fetchCategoriesList(): Promise<Category[]> {
  const response =
    await api.get<ApiEnvelope<CategoriesListResponse>>("/admin/categories");
  return response.data.data.categories;
}

/**
 * Cria uma categoria.
 * Chama POST /admin/categories.
 */
export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<Category> {
  const response = await api.post<ApiEnvelope<Category>>(
    "/admin/categories",
    payload,
  );
  return response.data.data;
}

/**
 * Atualiza uma categoria.
 * Chama PATCH /admin/categories/:id.
 */
export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const response = await api.patch<ApiEnvelope<Category>>(
    `/admin/categories/${id}`,
    payload,
  );
  return response.data.data;
}

/**
 * Deleta uma categoria.
 * Chama DELETE /admin/categories/:id.
 * Backend pode devolver 409 CATEGORY_IN_USE — tratar no dialog.
 */
export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`);
}
