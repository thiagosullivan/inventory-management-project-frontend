// src/pages/ReportsConsumptionPage.tsx
import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ReportsNav } from "@/components/reports/ReportsNav";
import { ConsumptionReportFilters } from "@/components/reports/consumption-report/ConsumptionReportFilters";
import { ConsumptionSummaryCards } from "@/components/reports/consumption-report/ConsumptionSummaryCards";
import { ConsumptionBySectorBarChart } from "@/components/reports/consumption-report/ConsumptionBySectorBarChart";
import { ConsumptionTopProductsTable } from "@/components/reports/consumption-report/ConsumptionTopProductsTable";
import { ConsumptionSectorView } from "@/components/reports/consumption-report/ConsumptionSectorView";
import { useConsumptionReport } from "@/hooks/useConsumptionReport";
import {
  parseConsumptionReportFilters,
  serializeConsumptionReportFilters,
} from "@/lib/reports-query-params";
import type { ConsumptionReportFilters as Filters } from "@/types/reports.types";

export default function ReportsConsumptionPage() {
  const { sectorId } = useParams<{ sectorId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<Filters>(
    () => parseConsumptionReportFilters(searchParams),
    [searchParams],
  );

  function updateFilters(patch: Partial<Filters>) {
    const next: Filters = { ...filters, ...patch };
    setSearchParams(serializeConsumptionReportFilters(next), { replace: true });
  }

  // 🔹 Drill-down: /reports/consumption/:sectorId
  if (sectorId) {
    return (
      <section className="flex flex-col mx-auto gap-6 w-full max-w-6xl px-4 py-8">
        <header className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Consumo por setor
            </h1>
            <p className="text-sm text-muted-foreground">
              Detalhamento mensal e ranking de produtos do setor.
            </p>
          </div>
          <ReportsNav />
        </header>
        <ConsumptionReportFilters filters={filters} onChange={updateFilters} />
        <ConsumptionSectorView sectorId={sectorId} />
      </section>
    );
  }

  // 🔹 Global: /reports/consumption
  return <GlobalView filters={filters} onChange={updateFilters} />;
}

function GlobalView({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  const reportQuery = useConsumptionReport(filters);
  const data = reportQuery.data;

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Consumo por setor</h1>
          <p className="text-sm text-muted-foreground">
            Consumo agregado por setor no período. Clique em um setor para ver o
            detalhamento.
          </p>
        </div>
        <ReportsNav />
      </header>

      <ConsumptionReportFilters filters={filters} onChange={onChange} />

      {reportQuery.isLoading && (
        <p className="text-sm text-muted-foreground">
          Carregando relatório de consumo...
        </p>
      )}
      {reportQuery.isError && (
        <p className="text-sm text-destructive">
          Erro ao carregar o relatório.
        </p>
      )}

      {data && (
        <>
          <ConsumptionSummaryCards summary={data.summary} />

          <ConsumptionBySectorBarChart data={data.bySector} />

          <ConsumptionTopProductsTable
            products={data.overallTopProducts}
            title="Produtos mais consumidos (global)"
            emptyMessage="Sem consumo no período."
          />
        </>
      )}
    </section>
  );
}
