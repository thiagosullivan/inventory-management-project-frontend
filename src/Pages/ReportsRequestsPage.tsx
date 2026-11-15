// src/pages/ReportsRequestsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportsNav } from "@/components/reports/ReportsNav";
import { RequestsReportFilters } from "@/components/reports/requests-report/RequestsReportFilters";
import { RequestsReportSummary } from "@/components/reports/requests-report/RequestsReportSummary";
import { RequestsReportTable } from "@/components/reports/requests-report/RequestsReportTable";
import { RequestsReportPrintView } from "@/components/reports/requests-report/RequestsReportPrintView";
import { PrintDialog, type PrintScope } from "@/components/print/PrintDialog";
import { PrintPortal } from "@/components/print/PrintPortal";
import { enterPrintMode, exitPrintMode } from "@/lib/print/print-mode";
import {
  parseRequestReportFilters,
  serializeRequestReportFilters,
  REQUEST_REPORT_DEFAULTS,
} from "@/lib/reports-query-params";
import { useRequestReport } from "@/hooks/useRequestReport";
import type {
  RequestReportFilters as Filters,
  RequestReportResponse,
} from "@/types/reports.types";
import { flushSync } from "react-dom";

const PAGE_SIZE = REQUEST_REPORT_DEFAULTS.limit;

export default function ReportsRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<Filters>(
    () => parseRequestReportFilters(searchParams),
    [searchParams],
  );

  const reportQuery = useRequestReport(filters);

  // =============================
  // Filtros na URL
  // =============================

  function updateFilters(patch: Partial<Filters>) {
    const next: Filters = { ...filters, ...patch };
    // mudou filtro (não paginação) → volta pra página 1
    if (
      patch.sectorId !== undefined ||
      patch.status !== undefined ||
      patch.dateFrom !== undefined ||
      patch.dateTo !== undefined ||
      patch.sortBy !== undefined ||
      patch.sortOrder !== undefined
    ) {
      next.page = 1;
    }
    setSearchParams(serializeRequestReportFilters(next), { replace: true });
  }

  function goToPage(page: number) {
    setSearchParams(serializeRequestReportFilters({ ...filters, page }), {
      replace: true,
    });
  }

  // =============================
  // Estado do print
  // =============================

  const [printOpen, setPrintOpen] = useState(false);
  const [printPayload, setPrintPayload] =
    useState<RequestReportResponse | null>(null);

  const data = reportQuery.data;
  const rows = data?.requests ?? [];
  const total = data?.total ?? 0;
  const page = filters.page ?? REQUEST_REPORT_DEFAULTS.page;
  const limit = filters.limit ?? REQUEST_REPORT_DEFAULTS.limit;
  const totalPages = data?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  function handlePrintConfirm(scope: PrintScope) {
    if (!data) return;
    if (scope === "current") {
      // 🔹 scope "current" = página atual (rows já é a página atual)
      flushSync(() => {
        setPrintPayload({ ...data, requests: rows });
        setPrintOpen(false);
      });
      setTimeout(() => {
        enterPrintMode("list");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.print();
          });
        });
      }, 150);
      return;
    }

    // 🔹 scope "all" = todos os filtros. Precisa refetch com limit grande.
    //    Como R1 tem `items` inline, o backend aceita limit alto.
    //    Simplificação: limit = total (cap em PRINT_MAX_EVENTS).
    //    Se total > PRINT_MAX_EVENTS, o PrintDialog já bloqueia o "all".
    import("@/lib/print/print-utils").then(({ PRINT_MAX_EVENTS }) => {
      const safeLimit = Math.min(total, PRINT_MAX_EVENTS);
      import("@/services/reports").then(({ fetchRequestReport }) => {
        fetchRequestReport({ ...filters, page: 1, limit: safeLimit })
          .then((full) => {
            flushSync(() => {
              setPrintPayload(full);
              setPrintOpen(false);
            });
            setTimeout(() => {
              enterPrintMode("list");
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  window.print();
                });
              });
            }, 150);
          })
          .catch(() => {
            // 🔹 erro silencioso: usuário pode tentar de novo
            setPrintOpen(true);
          });
      });
    });
  }

  // limpa payload depois do print
  useEffect(() => {
    function handleAfterPrint() {
      exitPrintMode();
      setPrintPayload(null);
    }
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Relatório de pedidos
          </h1>
          <p className="text-sm text-muted-foreground">
            Auditoria de pedidos por status, setor e período.
          </p>
        </div>
        <ReportsNav />
      </header>

      <RequestsReportFilters filters={filters} onChange={updateFilters} />

      {data && <RequestsReportSummary summary={data.summary} />}

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          {total === 0 ? "0 resultados" : `${from}–${to} de ${total}`}
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPrintOpen(true)}
          disabled={!data || data.total === 0}
          className="cursor-pointer"
        >
          <Printer size={16} className="mr-2" />
          Imprimir
        </Button>
      </div>

      <RequestsReportTable
        rows={rows}
        isLoading={reportQuery.isLoading}
        isError={reportQuery.isError}
      />

      {/* Paginação */}
      <div className="flex items-center justify-end gap-2">
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

      {/* Dialog de impressão — key força reset do state interno do dialog */}
      <PrintDialog
        key={`print-dialog-${printOpen ? "open" : "closed"}`}
        open={printOpen}
        onOpenChange={setPrintOpen}
        title="Imprimir relatório de pedidos"
        totalCount={total}
        pageSize={PAGE_SIZE}
        currentLabel={`${rows.length} pedido(s) desta página`}
        allLabel={`${total} pedido(s) no total`}
        onConfirm={handlePrintConfirm}
      />

      {/* Payload de impressão no PrintPortal */}
      {printPayload && (
        <PrintPortal>
          <RequestsReportPrintView data={printPayload} />
        </PrintPortal>
      )}
    </section>
  );
}
