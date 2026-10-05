import { ActiveFiltersBadges } from "@/filters/ActiveFiltersBadges";
import { BooleanToggle } from "@/filters/BooleanToggle";
import { CategorySelect } from "@/filters/CategorySelect";
import { FilterShell } from "@/filters/FilterShell";
import { NumberRangeFilter } from "@/filters/NumberRangeFilter";
import { SearchInput } from "@/filters/SearchInput";
import { TriStateToggle } from "@/filters/TriStateToggle";
import { UserSelect } from "@/filters/UserSelect";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";

interface ProductFiltersProps {
  isLoading?: boolean;
}

// 🔹 Barra de filtros da página /products
export function ProductFilters({ isLoading = false }: ProductFiltersProps) {
  const { filters, setFilter, setFilters } = useProductQueryParams();

  return (
    <div className="w-full flex flex-wrap items-start gap-3 justify-between">
      <div className="w-full flex flex-wrap items-start gap-3 justify-between">
        <SearchInput
          value={filters.search ?? ""}
          onChange={(v: string) => setFilter("search", v || undefined)}
          placeholder="Buscar por nome, SKU ou descrição..."
          isLoading={isLoading}
          className="w-full"
        />

        <FilterShell>
          {/* Insira todos os seus filtros reais aqui apenas UMA vez */}
          <div className="space-y-4">
            <CategorySelect
              value={filters.categoryId}
              onChange={(v) => setFilter("categoryId", v)}
            />

            <UserSelect
              value={filters.createdById}
              onChange={(v) => setFilter("createdById", v)}
            />
            <div className="flex sm:flex-col sm:max-w-[200px] gap-3">
              <BooleanToggle
                label="Estoque baixo"
                checked={filters.isLowStock === true}
                onCheckedChange={(v) => setFilter("isLowStock", v)}
              />

              <BooleanToggle
                label="Vencendo em 30 dias"
                checked={filters.isExpiring === true}
                onCheckedChange={(v) => setFilter("isExpiring", v)}
              />
            </div>
            <TriStateToggle
              options={[
                { label: "Todos", value: undefined },
                { label: "Com validade", value: true },
                { label: "Sem validade", value: false },
              ]}
              value={filters.hasExpiryDate}
              onChange={(v) => setFilter("hasExpiryDate", v)}
            />
            <div>
              <p className="text-base text-muted-foreground mb-1">Estoque:</p>
              <NumberRangeFilter
                minValue={filters.minQuantity}
                maxValue={filters.maxQuantity}
                onChange={({ min, max }) => {
                  setFilters({
                    minQuantity: min,
                    maxQuantity: max,
                  });
                }}
              />
            </div>
          </div>
        </FilterShell>
      </div>

      <ActiveFiltersBadges />
    </div>
  );
}
