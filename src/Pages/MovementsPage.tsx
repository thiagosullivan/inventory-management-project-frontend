// src/pages/MovementsPage.tsx
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Eye, Check, X, Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@/contexts/AuthContext";
import { useTransfers } from "@/hooks/useTransfers";
import { useSectorOptions } from "@/hooks/useSectors";
import {
  useCancelTransfer,
  useConfirmTransfer,
  useRefuseTransfer,
} from "@/hooks/useTransferMutations";
import { CreateTransferDialog } from "@/components/movements/CreateTransferDialog";
import { TransferDetailsDialog } from "@/components/movements/TransferDetailsDialog";
import {
  parseTransferFilters,
  serializeTransferFilters,
  TRANSFER_DEFAULTS,
  TRANSFER_STATUS_VALUES,
} from "@/lib/transfer-query-params";
import type { TransferResponse, TransferStatus } from "@/types/transfers.types";

const STATUS_LABEL: Record<TransferStatus, string> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  RECUSADO: "Recusado",
};

const STATUS_CLASS: Record<TransferStatus, string> = {
  PENDENTE: "bg-amber-100 text-amber-900 border-amber-300",
  CONCLUIDO: "bg-emerald-100 text-emerald-900 border-emerald-300",
  CANCELADO: "bg-zinc-200 text-zinc-800 border-zinc-300",
  RECUSADO: "bg-red-100 text-red-900 border-red-300",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ALL_VALUE = "__all__";

export default function MovementsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseTransferFilters(searchParams),
    [searchParams],
  );

  const isManager = user?.role === "MANAGER";
  const isWarehouseUser = user?.sector?.isWarehouse === true;
  const canCreate = isManager || isWarehouseUser;

  const transfersQuery = useTransfers(filters);
  const sectorOptionsQuery = useSectorOptions();

  const confirmMutation = useConfirmTransfer();
  const refuseMutation = useRefuseTransfer();
  const cancelMutation = useCancelTransfer();

  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<TransferResponse | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("");

  // =============================
  // URL helpers
  // =============================

  function updateFilters(patch: Partial<typeof filters>) {
    const next = { ...filters, ...patch };
    // ao mudar filtro (não paginação), volta pra página 1
    if (
      patch.status !== undefined ||
      patch.fromSectorId !== undefined ||
      patch.toSectorId !== undefined ||
      patch.dateFrom !== undefined ||
      patch.dateTo !== undefined
    ) {
      next.page = 1;
    }
    setSearchParams(serializeTransferFilters(next), { replace: true });
  }

  function goToPage(page: number) {
    setSearchParams(serializeTransferFilters({ ...filters, page }), {
      replace: true,
    });
  }

  // =============================
  // Ações por linha
  // =============================

  function canConfirmOrRefuse(t: TransferResponse): boolean {
    if (t.status !== "PENDENTE") return false;
    return isManager || t.toSectorId === user?.sectorId;
  }

  function canCancel(t: TransferResponse): boolean {
    if (t.status !== "PENDENTE") return false;
    return isManager || isWarehouseUser;
  }

  // =============================
  // Dados derivados
  // =============================

  const data = transfersQuery.data;
  const rows = data?.transfers ?? [];
  const total = data?.total ?? 0;
  const page = filters.page ?? TRANSFER_DEFAULTS.page;
  const limit = filters.limit ?? TRANSFER_DEFAULTS.limit;
  const totalPages = data?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const sectorOptions = sectorOptionsQuery.data ?? [];
  const destinationOptions = sectorOptions.filter((s) => !s.isWarehouse);

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Movimentações</h1>
          <p className="text-sm text-muted-foreground">
            Remessas entre setores.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)} className="py-5">
            <Plus size={16} className="mr-2" />
            Nova remessa
          </Button>
        )}
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1 min-w-[180px]">
          <Label htmlFor="filter-status">Status</Label>
          <Select
            value={filters.status ?? ALL_VALUE}
            onValueChange={(v) => {
              if (v === null) return;
              updateFilters({
                status: v === ALL_VALUE ? undefined : (v as TransferStatus),
              });
            }}
          >
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="Todos">
                {filters.status === undefined
                  ? "Todos"
                  : STATUS_LABEL[filters.status]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {TRANSFER_STATUS_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isManager && (
          <>
            <div className="flex flex-col gap-1 min-w-[200px]">
              <Label htmlFor="filter-from">Origem</Label>
              <Select
                value={filters.fromSectorId ?? ALL_VALUE}
                onValueChange={(v) => {
                  if (v === null) return;
                  updateFilters({
                    fromSectorId: v === ALL_VALUE ? undefined : v,
                  });
                }}
              >
                <SelectTrigger id="filter-from">
                  <SelectValue placeholder="Todos">
                    {filters.fromSectorId
                      ? (sectorOptions.find(
                          (s) => s.value === filters.fromSectorId,
                        )?.label ?? "Todos")
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

            <div className="flex flex-col gap-1 min-w-[200px]">
              <Label htmlFor="filter-to">Destino</Label>
              <Select
                value={filters.toSectorId ?? ALL_VALUE}
                onValueChange={(v) => {
                  if (v === null) return;
                  updateFilters({
                    toSectorId: v === ALL_VALUE ? undefined : v,
                  });
                }}
              >
                <SelectTrigger id="filter-to">
                  <SelectValue placeholder="Todos">
                    {filters.toSectorId
                      ? (sectorOptions.find(
                          (s) => s.value === filters.toSectorId,
                        )?.label ?? "Todos")
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
          </>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Destino</th>
              <th className="px-4 py-3 font-semibold">Itens</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Criada em</th>
              <th className="px-4 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transfersQuery.isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Carregando remessas...
                </td>
              </tr>
            )}
            {transfersQuery.isError && !transfersQuery.isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-destructive"
                >
                  Erro ao carregar remessas.
                </td>
              </tr>
            )}
            {!transfersQuery.isLoading &&
              !transfersQuery.isError &&
              rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhuma remessa encontrada.
                  </td>
                </tr>
              )}
            {rows.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3 font-mono text-xs">
                  {t.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3">{t.toSector?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  {t._count?.items ?? t.items?.length ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[t.status]}`}
                  >
                    {STATUS_LABEL[t.status]}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(t.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailsId(t.id)}
                      title="Ver detalhes"
                      className="cursor-pointer hover:text-primary"
                    >
                      <Eye size={16} />
                    </Button>
                    {canConfirmOrRefuse(t) && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={confirmMutation.isPending}
                          onClick={() => confirmMutation.mutate(t.id)}
                          title="Confirmar"
                          className="cursor-pointer hover:text-green-400"
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={refuseMutation.isPending}
                          onClick={() => refuseMutation.mutate(t.id)}
                          title="Recusar"
                          className="cursor-pointer hover:text-red-500"
                        >
                          <X size={16} />
                        </Button>
                      </>
                    )}
                    {canCancel(t) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCancelTarget(t);
                          setCancelReason("");
                        }}
                        title="Cancelar"
                        className="cursor-pointer hover:text-red-500"
                      >
                        <Ban size={16} />
                      </Button>
                    )}
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

      {/* Nova remessa (avulsa — sem vínculo a pedido) */}
      <CreateTransferDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        purchaseRequestId={null}
        destinationOptions={destinationOptions}
      />

      {/* Detalhes (stub até Etapa 7) */}
      <TransferDetailsDialog
        transferId={detailsId}
        open={detailsId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsId(null);
        }}
      />

      {/* Cancelamento com motivo */}
      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              Cancelar remessa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motivo do cancelamento *</Label>
            <Input
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex.: item errado, pedido cancelado"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCancelTarget(null);
                setCancelReason("");
              }}
              disabled={cancelMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              type="button"
              disabled={
                cancelMutation.isPending || cancelReason.trim().length === 0
              }
              onClick={() => {
                if (!cancelTarget) return;
                cancelMutation.mutate(
                  {
                    id: cancelTarget.id,
                    payload: { cancelReason: cancelReason.trim() },
                  },
                  {
                    onSuccess: () => {
                      setCancelTarget(null);
                      setCancelReason("");
                    },
                  },
                );
              }}
            >
              {cancelMutation.isPending
                ? "Cancelando..."
                : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
