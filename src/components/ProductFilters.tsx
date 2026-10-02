import { BooleanToggle } from "@/filters/BooleanToggle";
import { CategorySelect } from "@/filters/CategorySelect";
import { SearchInput } from "@/filters/SearchInput";
import { TriStateToggle } from "@/filters/TriStateToggle";
import { UserSelect } from "@/filters/UserSelect";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";

interface ProductFiltersProps {
  isLoading?: boolean;
}

// 🔹 Barra de filtros da página /products
export function ProductFilters({ isLoading = false }: ProductFiltersProps) {
  const { filters, setFilter } = useProductQueryParams();

  return (
    <div className="w-full flex flex-wrap items-center gap-3 justify-between">
      <SearchInput
        value={filters.search ?? ""}
        onChange={(v: string) => setFilter("search", v || undefined)}
        placeholder="Buscar por nome, SKU ou descrição..."
        isLoading={isLoading}
        className="sm:max-w-sm"
      />

      <div className="flex flex-col items-end gap-3">
        <div className="flex gap-3">
          <CategorySelect
            value={filters.categoryId}
            onChange={(v) => setFilter("categoryId", v)}
          />

          <UserSelect
            value={filters.createdById}
            onChange={(v) => setFilter("createdById", v)}
          />
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
      </div>
    </div>
  );
}
