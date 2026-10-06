// Mantém SelectOption (usado pelas options de categoria nos filtros)
export interface SelectOption {
  label: string;
  value: string;
}

// Usuário resumido que vem aninhado em `createdBy`
export interface CategoryCreatedBy {
  id: string;
  name: string | null;
}

// Contadores agregados retornados pelo backend
export interface CategoryCount {
  products: number;
}

// Categoria completa retornada por GET /admin/categories
export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdBy: CategoryCreatedBy;
  _count: CategoryCount;
  createdAt: string;
  updatedAt: string;
}

// 🔹 Shape real do `data` em GET /admin/categories (envelope paginado)
export interface CategoriesListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Payload de criação
export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
}

// Payload de edição
export interface UpdateCategoryPayload {
  name?: string;
  description?: string | null;
}
