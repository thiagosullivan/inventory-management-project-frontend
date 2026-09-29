import { BooleanToggle } from "@/filters/BooleanToggle";
import { SearchInput } from "@/filters/SearchInput";
import { TriStateToggle } from "@/filters/TriStateToggle";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";

interface ProductFiltersProps {
  isLoading?: boolean;
}

export function ProductFilters({ isLoading = false }: ProductFiltersProps) {
  const { filters, setFilter } = useProductQueryParams();

  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
      <SearchInput
        value={filters.search ?? ""}
        onChange={(v: string) => setFilter("search", v || undefined)}
        placeholder="Buscar por nome, SKU ou descrição..."
        isLoading={isLoading}
        className="sm:max-w-sm"
      />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <BooleanToggle
            label="Estoque baixo"
            checked={filters.isLowStock === true}
            onCheckedChange={(v) => setFilter("isLowStock", v)}
          />

          <BooleanToggle
            label="Vencendo (30 dias)"
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
      </div>
    </div>
  );
}
