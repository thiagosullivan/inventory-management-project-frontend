// src/components/reports/consumption-report/ConsumptionReportFilters.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDateOnlyInputValue } from "@/lib/reports-query-params";
import type { ConsumptionReportFilters } from "@/types/reports.types";

interface ConsumptionReportFiltersProps {
  filters: ConsumptionReportFilters;
  onChange: (patch: Partial<ConsumptionReportFilters>) => void;
}

export function ConsumptionReportFilters({
  filters,
  onChange,
}: ConsumptionReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="r2-date-from">De</Label>
        <Input
          id="r2-date-from"
          type="date"
          value={toDateOnlyInputValue(filters.dateFrom)}
          onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
          className="w-[170px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="r2-date-to">Até</Label>
        <Input
          id="r2-date-to"
          type="date"
          value={toDateOnlyInputValue(filters.dateTo)}
          onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
          className="w-[170px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="r2-priority-threshold">Limiar de prioridade</Label>
        <Input
          id="r2-priority-threshold"
          type="number"
          min={1}
          max={999}
          value={filters.priorityThreshold ?? ""}
          placeholder="10"
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange({ priorityThreshold: undefined });
              return;
            }
            const n = Number(raw);
            if (!Number.isFinite(n) || n < 1) return;
            onChange({ priorityThreshold: Math.floor(n) });
          }}
          className="w-[140px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="r2-limit">Top N por setor</Label>
        <Input
          id="r2-limit"
          type="number"
          min={1}
          max={50}
          value={filters.limit ?? ""}
          placeholder="10"
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange({ limit: undefined });
              return;
            }
            const n = Number(raw);
            if (!Number.isFinite(n) || n < 1) return;
            onChange({ limit: Math.min(Math.floor(n), 100) });
          }}
          className="w-[140px]"
        />
      </div>
    </div>
  );
}
