import { Button } from "@/components/ui/button";
import { CategorySelect } from "@/filters/CategorySelect";
import { SearchInput } from "@/filters/SearchInput";
import { useStockQueryParams } from "@/hooks/useStockQueryParams";

interface StockFiltersProps {
  isLoading?: boolean;
}

export function StockFilters({ isLoading = false }: StockFiltersProps) {
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useStockQueryParams();

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <CategorySelect
          value={filters.categoryId}
          onChange={(v) => setFilter("categoryId", v)}
          className="w-full sm:w-[200px]"
        />

        <SearchInput
          value={filters.location ?? ""}
          onChange={(v) =>
            setFilter("location", v || undefined, { replace: true })
          }
          placeholder="Localização..."
          isLoading={isLoading}
          className="w-full sm:max-w-[240px]"
        />

        <SearchInput
          value={filters.supplier ?? ""}
          onChange={(v) =>
            setFilter("supplier", v || undefined, { replace: true })
          }
          placeholder="Fornecedor..."
          isLoading={isLoading}
          className="w-full sm:max-w-[240px]"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
