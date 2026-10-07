import { StockAlertsSections } from "@/components/stock/StockAlertsSections";
import { StockDistributionCharts } from "@/components/stock/StockDistributionCharts";
import { StockFilters } from "@/components/stock/StockFilters";
import { StockSummaryCards } from "@/components/stock/StockSummaryCards";
import { useStockMetrics } from "@/hooks/useStockMetrics";
import { useStockQueryParams } from "@/hooks/useStockQueryParams";

export default function StockPage() {
  const { filters } = useStockQueryParams();
  const { data, isLoading, isFetching, isError } = useStockMetrics(filters);

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Carregando métricas de estoque...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center text-destructive py-12">
        Erro ao carregar métricas de estoque.
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <StockFilters isLoading={isFetching} />

      <StockSummaryCards
        summary={data.summary}
        stockStatus={data.stockStatus}
        expiryStatus={data.expiryStatus}
      />

      <StockDistributionCharts distribution={data.distribution} />

      <StockAlertsSections details={data.details} />
    </section>
  );
}
