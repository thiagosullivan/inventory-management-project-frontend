// src/components/reports/manual-output-report/ManualOutputFilters.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSectorOptions } from "@/hooks/useSectors";
import { toDateOnlyInputValue } from "@/lib/reports-query-params";
import type { ManualOutputReportFilters } from "@/types/reports.types";

const ALL_VALUE = "__all__";

interface ManualOutputFiltersProps {
  filters: ManualOutputReportFilters;
  onChange: (patch: Partial<ManualOutputReportFilters>) => void;
}

export function ManualOutputFilters({
  filters,
  onChange,
}: ManualOutputFiltersProps) {
  const sectorOptionsQuery = useSectorOptions();
  // 🔹 R2b: saída manual pode ter fromSectorId null (Almox) ou setor.
  //    Exibe todos os setores + opção "Sem setor" não é filtrável no backend,
  //    então só oferecemos os setores cadastrados.
  const sectorOptions = sectorOptionsQuery.data ?? [];

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="r2b-date-from">De</Label>
        <Input
          id="r2b-date-from"
          type="date"
          value={toDateOnlyInputValue(filters.dateFrom)}
          onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
          className="w-[170px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="r2b-date-to">Até</Label>
        <Input
          id="r2b-date-to"
          type="date"
          value={toDateOnlyInputValue(filters.dateTo)}
          onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
          className="w-[170px]"
        />
      </div>
      <div className="flex flex-col gap-1 min-w-[200px]">
        <Label htmlFor="r2b-from-sector">Setor de origem</Label>
        <Select
          value={filters.fromSectorId ?? ALL_VALUE}
          onValueChange={(v) => {
            if (v === null) return;
            onChange({ fromSectorId: v === ALL_VALUE ? undefined : v });
          }}
        >
          <SelectTrigger id="r2b-from-sector">
            <SelectValue placeholder="Todos">
              {filters.fromSectorId
                ? (sectorOptions.find((s) => s.value === filters.fromSectorId)
                    ?.label ?? "Todos")
                : "Todos"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            {sectorOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
