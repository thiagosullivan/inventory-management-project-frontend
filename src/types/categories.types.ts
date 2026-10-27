export interface SelectOption {
  label: string;
  value: string;
  prefix: string;
}

// Alias semântico pra quem consome no form de produto
export type CategoryOption = SelectOption;

export interface CategoryCreatedBy {
  id: string;
  name: string | null;
}

export interface CategoryCount {
  products: number;
}

export interface Category {
  id: string;
  name: string;
  prefix: string;
  description: string | null;
  createdById: string;
  createdBy: CategoryCreatedBy;
  _count: CategoryCount;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string | null;
}
