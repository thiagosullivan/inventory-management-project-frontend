import { SearchInput } from "@/filters/SearchInput";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";

interface ProductFiltersProps {
  isLoading?: boolean;
}

export function ProductFilters({ isLoading = false }: ProductFiltersProps) {
  const { filters, setFilter } = useProductQueryParams();

  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        value={filters.search ?? ""}
        onChange={(v) => setFilter("search", v || undefined)}
        placeholder="Buscar por nome, SKU ou descrição..."
        isLoading={isLoading}
        className="sm:max-w-sm"
      />
    </div>
  );
}
