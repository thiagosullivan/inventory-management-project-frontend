import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";
import { useUsers } from "@/hooks/useUsers";
import { FILTER_META } from "@/lib/filter-metadata";
import { X } from "lucide-react";

/**
 * Lista os filtros ativos como badges removíveis.
 *
 * - Cada badge tem um X pra remover aquele filtro individualmente.
 * - Botão "Limpar tudo" remove todos os filtros de uma vez.
 * - Se nenhum filtro está ativo, não renderiza nada.
 *
 * Usa `useCategories` e `useUsers` pra cruzar IDs com nomes legíveis.
 * Como os hooks têm staleTime alto, reusam o cache — sem request duplicado.
 */
// 🔹 Badges de filtros ativos, com X individual e "Limpar tudo"
export function ActiveFiltersBadges() {
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useProductQueryParams();
  const { options: categories } = useCategories();
  const { options: users } = useUsers();

  if (!hasActiveFilters) return null;

  // 🔹 Monta a lista de badges ativos, na ordem definida em FILTER_META
  const activeBadges = FILTER_META.flatMap((meta) => {
    const value = filters[meta.key];
    if (value === undefined) return [];
    return [{ meta, value }];
  });

  return (
    <div className="w-full flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtros ativos:</span>

      {activeBadges.map(({ meta, value }) => {
        const displayValue = meta.format
          ? meta.format(value, { categories, users })
          : null;

        return (
          <Badge
            key={meta.key}
            variant="default"
            className="gap-1 pl-2.5 pr-1 py-0.5"
          >
            <span>
              {meta.label}
              {displayValue ? `: ${displayValue}` : ""}
            </span>

            <button
              type="button"
              onClick={() => setFilter(meta.key, undefined)}
              aria-label={`Remover filtro ${meta.label}`}
              className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Limpar tudo
      </Button>
    </div>
  );
}
