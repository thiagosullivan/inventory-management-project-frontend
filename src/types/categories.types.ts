export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponseData {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetCategoriesResponse {
  success: boolean;
  data: CategoriesResponseData;
}
