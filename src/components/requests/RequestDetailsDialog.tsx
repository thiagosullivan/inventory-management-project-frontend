// src/components/requests/RequestDetailsDialog.tsx
import { useState } from "react";
import { Truck, X, CheckCircle2, Ban } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { CreateTransferDialog } from "@/components/movements/CreateTransferDialog";
import { usePurchaseRequest } from "@/hooks/usePurchaseRequest";
import {
  useCancelPurchaseRequest,
  useFinalizePurchaseRequest,
  useRefusePurchaseRequest,
} from "@/hooks/usePurchaseRequestMutations";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateTime } from "@/lib/format-date";
import type { SectorOption } from "@/types/sectors.types";
import type { PurchaseRequestStatus } from "@/types/purchaseRequests.types";

export interface RequestDetailsDialogProps {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinationOptions: SectorOption[];
}

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

const MAX_NOTE = 500;

// =============================
// Wrapper
// =============================

export function RequestDetailsDialog(props: RequestDetailsDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        {props.open && props.requestId && (
          <RequestDetailsBody
            key={props.requestId}
            requestId={props.requestId}
          />
        )}
        {props.open && !props.requestId && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-primary">
                Detalhes do pedido
              </DialogTitle>
              <DialogDescription>Nenhum pedido selecionado.</DialogDescription>
            </DialogHeader>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =============================
// Corpo (só monta quando open + requestId)
// =============================

function RequestDetailsBody({ requestId }: { requestId: string }) {
  const { user } = useAuth();
  const query = usePurchaseRequest(requestId);
  const request = query.data;

  const refuseMutation = useRefusePurchaseRequest();
  const finalizeMutation = useFinalizePurchaseRequest();
  const cancelMutation = useCancelPurchaseRequest();

  const [refuseOpen, setRefuseOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [refusalReason, setRefusalReason] = useState("");
  const [finalizeNote, setFinalizeNote] = useState("");

  const isManager = user?.role === "MANAGER";
  const isWarehouseUser = user?.sector?.isWarehouse === true;
  const isCreatorSector = !!request && request.sectorId === user?.sectorId;

  const canRefuse =
    !!request &&
    request.status === "PENDENTE" &&
    (isManager || isWarehouseUser);

  const canFinalize =
    !!request &&
    request.status === "EM_ATENDIMENTO" &&
    (isManager || isWarehouseUser);

  const canCancel =
    !!request &&
    request.status === "PENDENTE" &&
    (isManager || isCreatorSector);

  const canCreateTransfer =
    !!request &&
    (request.status === "PENDENTE" || request.status === "EM_ATENDIMENTO") &&
    (isManager || isWarehouseUser);

  // Destino fixo = setor do pedido (regra do backend: SECTOR_MISMATCH)
  const requestDestinationOptions: SectorOption[] = request?.sector
    ? [
        {
          label: request.sector.name,
          value: request.sector.id,
          isWarehouse: request.sector.isWarehouse,
        },
      ]
    : [];

  const transfersCount =
    request?._count?.transfers ?? request?.transfers?.length ?? 0;
  const items = request?.items ?? [];

  const itemsCount = request?._count?.items ?? items.length;

  function openRefuse() {
    setRefusalReason("");
    setRefuseOpen(true);
  }
  function openFinalize() {
    setFinalizeNote("");
    setFinalizeOpen(true);
  }
  function openCancel() {
    setCancelOpen(true);
  }

  async function submitRefuse() {
    if (!request || refusalReason.trim().length === 0) return;
    try {
      await refuseMutation.mutateAsync({
        id: request.id,
        payload: { refusalReason: refusalReason.trim() },
      });
      setRefuseOpen(false);
    } catch {
      // toast do hook
    }
  }

  async function submitFinalize() {
    if (!request) return;
    try {
      await finalizeMutation.mutateAsync({
        id: request.id,
        payload: { finalizeNote: finalizeNote.trim() || null },
      });
      setFinalizeOpen(false);
    } catch {
      // toast do hook
    }
  }

  async function submitCancel() {
    if (!request) return;
    try {
      await cancelMutation.mutateAsync(request.id);
      setCancelOpen(false);
    } catch {
      // toast do hook
    }
  }

  // =============================
  // Loading / erro
  // =============================

  if (query.isLoading) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            Detalhes do pedido
          </DialogTitle>
          <DialogDescription>
            Pedido <span className="font-mono">{requestId.slice(0, 8)}</span>
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Carregando pedido...</p>
      </>
    );
  }

  if (query.isError || !request) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            Detalhes do pedido
          </DialogTitle>
          <DialogDescription>
            Pedido <span className="font-mono">{requestId.slice(0, 8)}</span>
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-destructive">
          Não foi possível carregar o pedido.
        </p>
      </>
    );
  }

  // =============================
  // Render principal
  // =============================

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-primary">
          Detalhes do pedido
        </DialogTitle>
        <DialogDescription>
          ID <span className="font-mono">{request.id.slice(0, 8)}</span>
        </DialogDescription>
      </DialogHeader>

      {/* Barra de status resumida */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[request.status]}`}
        >
          {STATUS_LABEL[request.status]}
        </span>
        {request.status === "EM_ATENDIMENTO" && (
          <span className="text-xs text-muted-foreground">
            {transfersCount} remessa{transfersCount === 1 ? "" : "s"}
          </span>
        )}
        {request.status === "RECUSADO" && request.refusalReason && (
          <span className="text-xs text-muted-foreground">
            Motivo: “{request.refusalReason}”
          </span>
        )}
        {request.status === "ATENDIDO" && request.finalizeNote && (
          <span className="text-xs text-muted-foreground">
            Nota: “{request.finalizeNote}”
          </span>
        )}
      </div>

      {/* Metadados */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Setor</dt>
          <dd>{request.sector?.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Criado em</dt>
          <dd>{formatDateTime(request.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Criado por</dt>
          <dd>{request.createdBy?.name ?? "—"}</dd>
        </div>
        {request.finalizedBy && (
          <div>
            <dt className="text-muted-foreground">Finalizado por</dt>
            <dd>
              {request.finalizedBy.name ?? "—"} ·{" "}
              {formatDateTime(request.finalizedAt)}
            </dd>
          </div>
        )}
        {request.refusedBy && (
          <div>
            <dt className="text-muted-foreground">Recusado por</dt>
            <dd>
              {request.refusedBy.name ?? "—"} ·{" "}
              {formatDateTime(request.refusedAt)}
            </dd>
          </div>
        )}
        {request.notes && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Observações</dt>
            <dd className="whitespace-pre-wrap">{request.notes}</dd>
          </div>
        )}
      </dl>

      {/* Itens */}
      <div className="rounded border">
        <div className="bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
          Itens ({itemsCount})
        </div>
        {items.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">
            Sem itens.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left border-b">
              <tr>
                <th className="px-3 py-2 font-semibold">Produto</th>
                <th className="px-3 py-2 font-semibold">SKU</th>
                <th className="px-3 py-2 font-semibold">Barcode</th>
                <th className="px-3 py-2 font-semibold text-right">Qtd</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="px-3 py-2">{it.product.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {it.product.sku}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {it.product.barcode}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {it.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Ações */}
      {(canRefuse || canFinalize || canCancel || canCreateTransfer) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {canCreateTransfer && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setTransferOpen(true)}
              disabled={requestDestinationOptions.length === 0}
              title={
                requestDestinationOptions.length === 0
                  ? "Setor do pedido indisponível."
                  : undefined
              }
              className="cursor-pointer hover:bg-primary hover:text-white duration-200"
            >
              <Truck size={16} className="mr-2" />
              Criar remessa
            </Button>
          )}
          {canRefuse && (
            <Button
              type="button"
              variant="outline"
              onClick={openRefuse}
              className="cursor-pointer hover:bg-red-500 hover:text-white duration-200"
            >
              <X size={16} className="mr-2" />
              Recusar
            </Button>
          )}
          {canFinalize && (
            <Button
              type="button"
              onClick={openFinalize}
              className="cursor-pointer"
            >
              <CheckCircle2 size={16} className="mr-2" />
              Finalizar
            </Button>
          )}
          {canCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={openCancel}
              className="text-destructive cursor-pointer"
            >
              <Ban size={16} className="mr-2" />
              Cancelar pedido
            </Button>
          )}
        </div>
      )}

      {/* ---- Dialog: criar remessa ---- */}
      {canCreateTransfer && (
        <CreateTransferDialog
          open={transferOpen}
          onOpenChange={setTransferOpen}
          purchaseRequestId={request.id}
          destinationOptions={requestDestinationOptions}
        />
      )}

      {/* ---- Dialog: recusar ---- */}
      <Dialog open={refuseOpen} onOpenChange={setRefuseOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              Recusar pedido
            </DialogTitle>
            <DialogDescription>
              O motivo é obrigatório e ficará registrado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="refuse-reason">Motivo da recusa *</Label>
            <Textarea
              id="refuse-reason"
              value={refusalReason}
              onChange={(e) =>
                setRefusalReason(e.target.value.slice(0, MAX_NOTE))
              }
              rows={3}
              maxLength={MAX_NOTE}
              placeholder="Ex.: produto indisponível no momento"
            />
            <p className="text-xs text-muted-foreground text-right">
              {refusalReason.length}/{MAX_NOTE}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRefuseOpen(false)}
              disabled={refuseMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={submitRefuse}
              disabled={
                refuseMutation.isPending || refusalReason.trim().length === 0
              }
            >
              {refuseMutation.isPending ? "Recusando..." : "Confirmar recusa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Dialog: finalizar ---- */}
      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              Finalizar pedido
            </DialogTitle>
            <DialogDescription>
              Informe uma nota (obrigatória se houver remessa recusada/cancelada
              ou entrega incompleta).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="finalize-note">Nota de finalização</Label>
            <Textarea
              id="finalize-note"
              value={finalizeNote}
              onChange={(e) =>
                setFinalizeNote(e.target.value.slice(0, MAX_NOTE))
              }
              rows={3}
              maxLength={MAX_NOTE}
              placeholder="Ex.: entregue parcialmente por falta de estoque"
            />
            <p className="text-xs text-muted-foreground text-right">
              {finalizeNote.length}/{MAX_NOTE}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFinalizeOpen(false)}
              disabled={finalizeMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={submitFinalize}
              disabled={finalizeMutation.isPending}
            >
              {finalizeMutation.isPending ? "Finalizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Dialog: cancelar ---- */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              Cancelar pedido
            </DialogTitle>
            <DialogDescription>
              O pedido será cancelado. Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={submitCancel}
              disabled={cancelMutation.isPending}
              className="text-destructive"
            >
              {cancelMutation.isPending
                ? "Cancelando..."
                : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
