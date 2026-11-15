// src/pages/ReportsManualOutputPage.tsx
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ReportsNav } from "@/components/reports/ReportsNav";
import { ManualOutputFilters } from "@/components/reports/manual-output-report/ManualOutputFilters";
import { ManualOutputSummaryCards } from "@/components/reports/manual-output-report/ManualOutputSummaryCards";
import { ManualOutputTable } from "@/components/reports/manual-output-report/ManualOutputTable";
import { useManualOutputReport } from "@/hooks/useManualOutputReport";
import {
  MANUAL_OUTPUT_REPORT_DEFAULTS,
  parseManualOutputReportFilters,
  serializeManualOutputReportFilters,
} from "@/lib/reports-query-params";
import type { ManualOutputReportFilters as Filters } from "@/types/reports.types";

export default function ReportsManualOutputPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<Filters>(
    () => parseManualOutputReportFilters(searchParams),
    [searchParams],
  );

  const reportQuery = useManualOutputReport(filters);

  function updateFilters(patch: Partial<Filters>) {
    const next: Filters = { ...filters, ...patch };
    // mudou filtro (não paginação) → volta pra página 1
    if (
      patch.dateFrom !== undefined ||
      patch.dateTo !== undefined ||
      patch.fromSectorId !== undefined
    ) {
      next.page = 1;
    }
    setSearchParams(serializeManualOutputReportFilters(next), {
      replace: true,
    });
  }

  function goToPage(page: number) {
    setSearchParams(serializeManualOutputReportFilters({ ...filters, page }), {
      replace: true,
    });
  }

  const data = reportQuery.data;
  const rows = data?.movements ?? [];
  const total = data?.total ?? 0;
  const page = filters.page ?? MANUAL_OUTPUT_REPORT_DEFAULTS.page;
  const limit = filters.limit ?? MANUAL_OUTPUT_REPORT_DEFAULTS.limit;
  const totalPages = data?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Saídas manuais</h1>
          <p className="text-sm text-muted-foreground">
            Movimentações de saída sem remessa vinculada. Origem, autor, motivo
            e valor.
          </p>
        </div>
        <ReportsNav />
      </header>

      <ManualOutputFilters filters={filters} onChange={updateFilters} />

      {data && <ManualOutputSummaryCards summary={data.summary} />}

      <ManualOutputTable
        movements={rows}
        isLoading={reportQuery.isLoading}
        isError={reportQuery.isError}
      />

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          {total === 0 ? "0 resultados" : `${from}–${to} de ${total}`}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="cursor-pointer"
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="cursor-pointer"
          >
            Próxima
          </Button>
        </div>
      </div>
    </section>
  );
}
