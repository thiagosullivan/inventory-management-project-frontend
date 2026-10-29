// src/pages/RequestsPage.tsx
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Eye } from "lucide-react";

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

const STATUS_LABEL: Record<PurchaseRequestStatus, string> = {
  PENDENTE: "Pendente",
  EM_ATENDIMENTO: "Em atendimento",
  ATENDIDO: "Atendido",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

const STATUS_CLASS: Record<PurchaseRequestStatus, string> = {
  PENDENTE: "bg-amber-100 text-amber-900 border-amber-300",
  EM_ATENDIMENTO: "bg-sky-100 text-sky-900 border-sky-300",
  ATENDIDO: "bg-emerald-100 text-emerald-900 border-emerald-300",
  RECUSADO: "bg-red-100 text-red-900 border-red-300",
  CANCELADO: "bg-zinc-200 text-zinc-800 border-zinc-300",
};

export default function RequestsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parsePurchaseRequestFilters(searchParams),
    [searchParams],
  );

  const isManager = user?.role === "MANAGER";
  const isWarehouseUser = user?.sector?.isWarehouse === true;
  const canCreate = isManager || !isWarehouseUser; // STAFF não-Almoxarifado ou MANAGER
  // Obs.: MANAGER de setor Almoxarifado também vê o botão (regra do backend permite).
  // O backend rejeita STAFF do Almoxarifado — aqui escondo pra UX.

  const requestsQuery = usePurchaseRequests(filters);
  const sectorOptionsQuery = useSectorOptions();

  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

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

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Pedidos de compra entre setores.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} className="mr-2" />
            Novo pedido
          </Button>
        )}
      </header>

      {/* Tabs por status (sincronizadas com ?status=) */}
      <Tabs
        value={filters.status}
        onValueChange={(v) => setStatusTab(v as PurchaseRequestStatus)}
      >
        <TabsList className="flex-wrap h-auto">
          {PURCHASE_REQUEST_STATUS_VALUES.map((s) => (
            <TabsTrigger key={s} value={s}>
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
                <td className="px-4 py-3 font-mono text-xs">
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
    </section>
  );
}
