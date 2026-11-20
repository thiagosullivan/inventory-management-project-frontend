// src/pages/Stock.tsx
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";

import { StockAlertsSections } from "@/components/stock/StockAlertsSections";
import { StockDistributionCharts } from "@/components/stock/StockDistributionCharts";
import { StockFilters } from "@/components/stock/StockFilters";
import { StockSummaryCards } from "@/components/stock/StockSummaryCards";
import { useStockMetrics } from "@/hooks/useStockMetrics";
import { useStockQueryParams } from "@/hooks/useStockQueryParams";

import { Button } from "@/components/ui/button";
import { PrintDialog } from "@/components/print/PrintDialog";
import { PrintLayout } from "@/components/print/PrintLayout";
import { PrintPortal } from "@/components/print/PrintPortal";
import { StockPrintView } from "@/components/stock/StockPrintView";
import { enterPrintMode, exitPrintMode } from "@/lib/print/print-mode";
import type { StockMetricsResponse } from "@/types/stock.types";

interface PrintPayload {
  data: StockMetricsResponse;
  includeDistribution: boolean;
  generatedAt: Date;
}

export default function StockPage() {
  const { filters } = useStockQueryParams();
  const { data, isLoading, isFetching, isError } = useStockMetrics(filters);

  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [includeDistribution, setIncludeDistribution] = useState(false);
  const [printPayload, setPrintPayload] = useState<PrintPayload | null>(null);

  // Dispara print depois que o payload montou
  useEffect(() => {
    if (!printPayload) return;
    enterPrintMode("list");
    const raf = requestAnimationFrame(() => {
      toast.dismiss();
      window.print();
    });
    return () => cancelAnimationFrame(raf);
  }, [printPayload]);

  // Limpa afterprint
  useEffect(() => {
    function onAfterPrint() {
      exitPrintMode();
      setPrintPayload(null);
    }
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

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

  function handlePrintConfirm() {
    setPrintDialogOpen(false);
    setTimeout(() => {
      if (!data) return;
      setPrintPayload({
        data,
        includeDistribution,
        generatedAt: new Date(),
      });
    }, 150);
  }

  function buildMetaLines(): string[] {
    const parts: string[] = [];
    if (filters.categoryId) parts.push("Categoria filtrada");
    if (filters.location) parts.push(`Local: "${filters.location}"`);
    if (filters.supplier) parts.push(`Fornecedor: "${filters.supplier}"`);
    return parts.length > 0 ? [`Filtros: ${parts.join(" · ")}`] : [];
  }

  return (
    <section className="flex flex-col items-center justify-center mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <div className="w-full flex items-center justify-between gap-4">
        <StockFilters isLoading={isFetching} />
        <Button
          variant="outline"
          onClick={() => setPrintDialogOpen(true)}
          className="cursor-pointer ml-auto min-h-9 p-2"
        >
          <Printer size={16} className="mr-2" />
          Imprimir
        </Button>
      </div>

      <StockSummaryCards
        summary={data.summary}
        stockStatus={data.stockStatus}
        expiryStatus={data.expiryStatus}
      />

      <StockDistributionCharts distribution={data.distribution} />

      <StockAlertsSections details={data.details} />

      {/* Dialog de impressão */}
      <PrintDialog
        key={printDialogOpen ? "open" : "closed"}
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        title="Imprimir panorama do estoque"
        totalCount={data.summary.totalProducts}
        pageSize={data.summary.totalProducts}
        currentLabel="Relatório completo (resumo + alertas)"
        allLabel="Relatório completo (resumo + alertas)"
        extraCheckbox={{
          label: "Incluir distribuição (categorias, locais, fornecedores)",
          checked: includeDistribution,
          onCheckedChange: setIncludeDistribution,
        }}
        onConfirm={handlePrintConfirm}
      />

      {/* Ficha no portal */}
      {printPayload && (
        <PrintPortal>
          <PrintLayout
            title="Panorama do estoque"
            metaLines={buildMetaLines()}
            totalCount={printPayload.data.summary.totalProducts}
            generatedAt={printPayload.generatedAt}
            itemLabel="produto"
          >
            <StockPrintView
              data={printPayload.data}
              includeDistribution={printPayload.includeDistribution}
            />
          </PrintLayout>
        </PrintPortal>
      )}
    </section>
  );
}
