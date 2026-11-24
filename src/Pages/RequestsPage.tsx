// src/pages/RequestsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Eye, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests";
import { useSectorOptions } from "@/hooks/useSectors";
import { CreatePurchaseRequestDialog } from "@/components/requests/CreatePurchaseRequestDialog";
import { RequestDetailsDialog } from "@/components/requests/RequestDetailsDialog";
import {
  parsePurchaseRequestFilters,
  serializePurchaseRequestFilters,
  PURCHASE_REQUEST_DEFAULTS,
  PURCHASE_REQUEST_STATUS_VALUES,
} from "@/lib/purchase-request-query-params";
import { formatDateTime } from "@/lib/format-date";
import type {
  PurchaseRequestResponse,
  PurchaseRequestStatus,
} from "@/types/purchaseRequests.types";
import {
  fetchPurchaseRequestById,
  fetchPurchaseRequests,
} from "@/services/purchaseRequests";

// 🔹 Impressão
import { PrintDialog, type PrintScope } from "@/components/print/PrintDialog";
import { PrintLayout } from "@/components/print/PrintLayout";
import { PrintPortal } from "@/components/print/PrintPortal";
import { RequestListPrintView } from "@/components/requests/RequestListPrintView";
import { enterPrintMode, exitPrintMode } from "@/lib/print/print-mode";
import { PRINT_MAX_EVENTS } from "@/lib/print/print-utils";

const STATUS_LABEL: Record<PurchaseRequestStatus, string> = {
  TODOS: "Todos",
  PENDENTE: "Pendente",
  EM_ATENDIMENTO: "Em atendimento",
  ATENDIDO: "Atendido",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

const STATUS_CLASS: Record<PurchaseRequestStatus, string> = {
  TODOS: "",
  PENDENTE: "bg-amber-100 text-amber-900 border-amber-300",
  EM_ATENDIMENTO: "bg-sky-100 text-sky-900 border-sky-300",
  ATENDIDO: "bg-emerald-100 text-emerald-900 border-emerald-300",
  RECUSADO: "bg-red-100 text-red-900 border-red-300",
  CANCELADO: "bg-zinc-200 text-zinc-800 border-zinc-300",
};

interface PrintPayload {
  requests: PurchaseRequestResponse[];
  includeItems: boolean;
  generatedAt: Date;
}

export default function RequestsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parsePurchaseRequestFilters(searchParams),
    [searchParams],
  );

  const isManager = user?.role === "MANAGER";
  const isWarehouseUser = user?.sector?.isWarehouse === true;
  const canCreate = isManager || !isWarehouseUser;

  const requestsQuery = usePurchaseRequests(filters);
  const sectorOptionsQuery = useSectorOptions();

  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // 🔹 Impressão
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [includeItems, setIncludeItems] = useState(false);
  const [printPayload, setPrintPayload] = useState<PrintPayload | null>(null);

  useEffect(() => {
    if (!printPayload) return;
    enterPrintMode("list");
    const raf = requestAnimationFrame(() => {
      toast.dismiss();
      window.print();
    });
    return () => cancelAnimationFrame(raf);
  }, [printPayload]);

  useEffect(() => {
    function onAfterPrint() {
      exitPrintMode();
      setPrintPayload(null);
    }
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  function setStatusTab(status: PurchaseRequestStatus) {
    setSearchParams(
      serializePurchaseRequestFilters({ ...filters, status, page: 1 }),
      { replace: true },
    );
  }

  function goToPage(page: number) {
    setSearchParams(serializePurchaseRequestFilters({ ...filters, page }), {
      replace: true,
    });
  }

  const data = requestsQuery.data;
  const rows = data?.requests ?? [];
  const total = data?.total ?? 0;
  const page = filters.page ?? PURCHASE_REQUEST_DEFAULTS.page;
  const limit = filters.limit ?? PURCHASE_REQUEST_DEFAULTS.limit;
  const totalPages = data?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const destinationOptions = (sectorOptionsQuery.data ?? []).filter(
    (s) => !s.isWarehouse,
  );

  // =============================
  // Handlers de Impressão
  // =============================

  async function enrichWithItems(
    requests: PurchaseRequestResponse[],
    includeItems: boolean,
  ): Promise<PurchaseRequestResponse[]> {
    if (!includeItems) return requests;

    // Busca o detalhe de cada pedido em paralelo (N+1 controlado)
    const detailed = await Promise.all(
      requests.map(async (r) => {
        // Se o backend já mandou items na listagem, usa
        if (r.items && r.items.length > 0) return r;
        try {
          const detail = await fetchPurchaseRequestById(r.id);
          return {
            ...r,
            // injeta items do detalhe no shape da lista
            items: detail.items,
          };
        } catch (err) {
          console.error(`Erro ao carregar itens do pedido ${r.id}:`, err);
          return r; // segue sem itens
        }
      }),
    );
    return detailed;
  }

  async function startPrintAll() {
    const toastId = toast.loading("Carregando pedidos para impressão...");
    try {
      const collected: PurchaseRequestResponse[] = [];
      let p = 1;
      const fetchLimit = 100;

      while (true) {
        const res = await fetchPurchaseRequests({
          ...filters,
          status: filters.status === "TODOS" ? undefined : filters.status,
          page: p,
          limit: fetchLimit,
        });
        collected.push(...res.requests);
        if (p >= res.totalPages) break;
        if (collected.length >= PRINT_MAX_EVENTS) break;
        p++;
      }

      const capped = collected.slice(0, PRINT_MAX_EVENTS);
      // 🔹 enriquece com items se marcado
      const enriched = await enrichWithItems(capped, includeItems);

      toast.dismiss(toastId);
      setPrintPayload({
        requests: enriched,
        includeItems,
        generatedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar pedidos para impressão.", { id: toastId });
    }
  }

  async function startPrintCurrent() {
    const enriched = await enrichWithItems(rows, includeItems);
    setPrintPayload({
      requests: enriched,
      includeItems,
      generatedAt: new Date(),
    });
  }

  function handlePrintConfirm(scope: PrintScope) {
    setPrintDialogOpen(false);
    setTimeout(() => {
      if (scope === "current") void startPrintCurrent();
      else void startPrintAll();
    }, 150);
  }

  function buildMetaLines(): string[] {
    const parts: string[] = [];
    if (filters.status && filters.status !== "TODOS")
      parts.push(`Status=${STATUS_LABEL[filters.status]}`);
    if (filters.sectorId) parts.push(`Setor filtrado`);
    return parts.length > 0 ? [`Filtros: ${parts.join(" · ")}`] : [];
  }

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Pedidos de compra entre setores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPrintDialogOpen(true)}
            disabled={total === 0}
            className="py-5 cursor-pointer"
          >
            <Printer size={16} className="mr-2" />
            Imprimir
          </Button>
          {canCreate && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="py-5 cursor-pointer"
            >
              <Plus size={16} className="mr-2" />
              Novo pedido
            </Button>
          )}
        </div>
      </header>

      {/* Tabs por status */}
      <Tabs
        value={filters.status}
        onValueChange={(v) => setStatusTab(v as PurchaseRequestStatus)}
      >
        <TabsList className="flex-wrap h-auto">
          {PURCHASE_REQUEST_STATUS_VALUES.map((s) => (
            <TabsTrigger key={s} value={s} className="cursor-pointer">
              {STATUS_LABEL[s]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Setor</th>
              <th className="px-4 py-3 font-semibold">Itens</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Criado em</th>
              <th className="px-4 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {requestsQuery.isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Carregando pedidos...
                </td>
              </tr>
            )}
            {requestsQuery.isError && !requestsQuery.isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-destructive"
                >
                  Erro ao carregar pedidos.
                </td>
              </tr>
            )}
            {!requestsQuery.isLoading &&
              !requestsQuery.isError &&
              rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            {rows.map((r: PurchaseRequestResponse) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-mono text-xs uppercase">
                  {r.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3">{r.sector?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {r._count?.items ?? r.items?.length ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDateTime(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailsId(r.id)}
                      title="Ver detalhes"
                      className="cursor-pointer hover:text-primary"
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
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
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>

      <CreatePurchaseRequestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <RequestDetailsDialog
        requestId={detailsId}
        open={detailsId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsId(null);
        }}
        destinationOptions={destinationOptions}
      />

      {/* Dialog de impressão */}
      <PrintDialog
        key={printDialogOpen ? "open" : "closed"}
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        title="Imprimir lista de pedidos"
        totalCount={total}
        pageSize={limit}
        currentLabel={`${Math.min(limit, total)} pedidos desta página`}
        allLabel={`${total} pedidos (todos os filtros)`}
        extraCheckbox={{
          label: "Incluir detalhamento de itens",
          checked: includeItems,
          onCheckedChange: setIncludeItems,
        }}
        onConfirm={handlePrintConfirm}
      />

      {/* Payload de impressão */}
      {printPayload && (
        <PrintPortal>
          <PrintLayout
            title="Lista de Pedidos"
            metaLines={buildMetaLines()}
            totalCount={printPayload.requests.length}
            generatedAt={printPayload.generatedAt}
            itemLabel="pedido"
          >
            <RequestListPrintView
              requests={printPayload.requests}
              includeItems={printPayload.includeItems}
            />
          </PrintLayout>
        </PrintPortal>
      )}
    </section>
  );
}
