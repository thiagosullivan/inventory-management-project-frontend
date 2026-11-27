// src/components/reports/requests-report/RequestsReportFilters.tsx
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
import {
  REQUEST_REPORT_STATUS_VALUES,
  toDateOnlyInputValue,
} from "@/lib/reports-query-params";
import type {
  ReportRequestStatusFilter,
  RequestReportFilters,
  RequestReportSortBy,
} from "@/types/reports.types";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<ReportRequestStatusFilter, string> = {
  PENDENTE: "Pendente",
  EM_ATENDIMENTO: "Em atendimento",
  ATENDIDO: "Atendido",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

const ALL_VALUE = "__all__";

interface RequestsReportFiltersProps {
  filters: RequestReportFilters;
  onChange: (patch: Partial<RequestReportFilters>) => void;
}

export function RequestsReportFilters({
  filters,
  onChange,
}: RequestsReportFiltersProps) {
  const sectorOptionsQuery = useSectorOptions();
  // 🔹 R1: só setores que PEDEM (não-Almox). Almox não faz pedido.
  const sectorOptions = (sectorOptionsQuery.data ?? []).filter(
    (s) => !s.isWarehouse,
  );

  const sortBy: RequestReportSortBy = filters.sortBy ?? "createdAt";
  const sortOrder = filters.sortOrder ?? "desc";

  function toggleSortOrder() {
    onChange({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Setor */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <Label htmlFor="r1-sector">Setor</Label>
        <Select
          value={filters.sectorId ?? ALL_VALUE}
          onValueChange={(v) => {
            if (v === null) return;
            onChange({ sectorId: v === ALL_VALUE ? undefined : v });
          }}
        >
          <SelectTrigger id="r1-sector">
            <SelectValue placeholder="Todos">
              {filters.sectorId
                ? (sectorOptions.find((s) => s.value === filters.sectorId)
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

      {/* Status */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <Label htmlFor="r1-status">Status</Label>
        <Select
          value={filters.status ?? ALL_VALUE}
          onValueChange={(v) => {
            if (v === null) return;
            onChange({
              status:
                v === ALL_VALUE ? undefined : (v as ReportRequestStatusFilter),
            });
          }}
        >
          <SelectTrigger id="r1-status">
            <SelectValue placeholder="Todos">
              {filters.status ? STATUS_LABEL[filters.status] : "Todos"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            {REQUEST_REPORT_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Período */}
      <div className="flex gap-x-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="r1-date-from">De</Label>
          <Input
            id="r1-date-from"
            type="date"
            value={toDateOnlyInputValue(filters.dateFrom)}
            onChange={(e) =>
              onChange({ dateFrom: e.target.value || undefined })
            }
            className="w-[140px] text-sm md:text-base md:w-[170px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="r1-date-to">Até</Label>
          <Input
            id="r1-date-to"
            type="date"
            value={toDateOnlyInputValue(filters.dateTo)}
            onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
            className="w-[140px] text-sm md:text-base md:w-[170px]"
          />
        </div>
      </div>

      {/* Ordenação */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <Label htmlFor="r1-sort-by">Ordenar por</Label>
        <Select
          value={sortBy}
          onValueChange={(v) => {
            if (v === null) return;
            onChange({ sortBy: v as RequestReportSortBy });
          }}
        >
          <SelectTrigger id="r1-sort-by">
            <SelectValue placeholder="Criado em">
              {sortBy === "createdAt" ? "Criado em" : "Finalizado em"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Criado em</SelectItem>
            <SelectItem value="finalizedAt">Finalizado em</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={toggleSortOrder}
        title={sortOrder === "asc" ? "Ascendente" : "Descendente"}
        className="cursor-pointer"
      >
        {sortOrder === "asc" ? (
          <ArrowUpNarrowWide size={16} />
        ) : (
          <ArrowDownWideNarrow size={16} />
        )}
        <span className="ml-2 text-sm">
          {sortOrder === "asc" ? "Asc" : "Desc"}
        </span>
      </Button>
    </div>
  );
}
