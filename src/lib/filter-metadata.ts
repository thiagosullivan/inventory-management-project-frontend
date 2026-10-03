import type { ProductFilters } from "@/types/products.types";
import type { SelectOption } from "@/types/categories.types";
import type { UserOption } from "@/types/users.types";

/**
 * Contexto pra formatar valores de filtro (cruzar IDs com nomes).
 */
export interface FilterFormatContext {
  categories: SelectOption[];
  users: UserOption[];
}

export interface FilterMeta {
  /**
   * Chave do filtro em ProductFilters.
   * Exclui page/limit/sortBy/sortOrder — esses não são "filtros de conteúdo".
   */
  key: keyof Omit<ProductFilters, "page" | "limit" | "sortBy" | "sortOrder">;
  /** Rótulo base do badge. */
  label: string;
  /**
   * Formata o valor pra exibição no badge.
   * Se ausente, o badge mostra só o label (sem valor).
   * 🔹 Pros booleanos que só têm estado "ligado", não precisa de format.
   */
  format?: (value: unknown, ctx: FilterFormatContext) => string;
}

/**
 * 🔹 Ordem dos badges na UI. Editar aqui muda a ordem de exibição.
 */
export const FILTER_META: FilterMeta[] = [
  {
    key: "search",
    label: "Busca",
    format: (v) => `"${v}"`,
  },
  {
    key: "categoryId",
    label: "Categoria",
    format: (v, { categories }) =>
      categories.find((c) => c.value === v)?.label ?? String(v),
  },
  {
    key: "createdById",
    label: "Criador",
    format: (v, { users }) =>
      users.find((u) => u.value === v)?.label ?? String(v),
  },
  {
    key: "minQuantity",
    label: "Qtd. mín.",
    format: (v) => String(v),
  },
  {
    key: "maxQuantity",
    label: "Qtd. máx.",
    format: (v) => String(v),
  },
  {
    key: "hasExpiryDate",
    label: "Validade",
    format: (v) => (v === true ? "Com validade" : "Sem validade"),
  },
  {
    key: "isExpiring",
    label: "Vencendo em 30 dias",
    // 🔹 booleano sem valor — o badge mostra só o label
  },
  {
    key: "isLowStock",
    label: "Estoque baixo",
    // 🔹 booleano sem valor — o badge mostra só o label
  },
];
