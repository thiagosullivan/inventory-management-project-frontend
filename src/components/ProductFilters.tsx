import { SearchInput } from "@/filters/SearchInput";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";

/**
 * Barra de filtros da /products.
 *
 * Específico de produtos: faz a ponte entre os inputs genéricos
 * (`SearchInput`, e futuramente `SelectFilter`, `TriStateToggle`, etc.)
 * e o `useProductQueryParams` (que escreve na URL).
 *
 * Por enquanto, só o search. Novos filtros entram aqui incrementalmente
 * conforme a Fase 2 avança.
 */
// 🔹 Barra de filtros da página /products
export function ProductFilters() {
  const { filters, setFilter } = useProductQueryParams();

  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        value={filters.search ?? ""}
        onChange={(v) => setFilter("search", v || undefined)}
        placeholder="Buscar por nome, SKU ou descrição..."
        className="sm:max-w-sm"
      />
      {/* 🔹 Próximos filtros entram aqui: categoria, usuário, toggles, range */}
    </div>
  );
}
