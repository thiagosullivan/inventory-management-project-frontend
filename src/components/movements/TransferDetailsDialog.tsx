// src/components/movements/TransferDetailsDialog.tsx
import { useState } from "react";
import { Ban, Check, ImageOff, X } from "lucide-react";

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

import { useAuth } from "@/contexts/AuthContext";
import { useTransfer } from "@/hooks/useTransfer";
import {
  useCancelTransfer,
  useConfirmTransfer,
  useRefuseTransfer,
} from "@/hooks/useTransferMutations";
import { formatDateTime } from "@/lib/format-date";
import type { TransferStatus } from "@/types/transfers.types";

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

const MAX_NOTE = 500;

interface TransferDetailsDialogProps {
  transferId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** opcional — chamado após qualquer ação bem-sucedida (confirm/refuse/cancel) */
  onActionSuccess?: () => void;
}

// =============================
// Wrapper
// =============================

export function TransferDetailsDialog(props: TransferDetailsDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        {props.open && props.transferId && (
          <TransferDetailsBody
            key={props.transferId}
            transferId={props.transferId}
            onOpenChange={props.onOpenChange}
            onActionSuccess={props.onActionSuccess}
          />
        )}
        {props.open && !props.transferId && (
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              Detalhes da remessa
            </DialogTitle>
            <DialogDescription>Nenhuma remessa selecionada.</DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =============================
// Corpo
// =============================

function TransferDetailsBody({
  transferId,
  onOpenChange,
  onActionSuccess,
}: {
  transferId: string;
  onOpenChange: (open: boolean) => void;
  onActionSuccess?: () => void;
}) {
  const { user } = useAuth();
  const query = useTransfer(transferId);
  const transfer = query.data;

  const confirmMutation = useConfirmTransfer();
  const refuseMutation = useRefuseTransfer();
  const cancelMutation = useCancelTransfer();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [refuseOpen, setRefuseOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [refusalReason, setRefusalReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const items = transfer?.items ?? [];

  // =============================
  // Permissões
  // =============================

  const isManager = user?.role === "MANAGER";
  const isWarehouseUser = user?.sector?.isWarehouse === true;

  const canConfirmOrRefuse =
    !!transfer &&
    transfer.status === "PENDENTE" &&
    (isManager || transfer.toSectorId === user?.sectorId);

  // Cancelamento: mantido o padrão do MovementsPage (isManager) —
  // se quiser Almoxarifado também, troque por (isManager || isWarehouseUser)
  const canCancel = !!transfer && transfer.status === "PENDENTE" && isManager;

  // =============================
  // Handlers
  // =============================

  function openConfirm() {
    setConfirmOpen(true);
  }
  function openRefuse() {
    setRefusalReason("");
    setRefuseOpen(true);
  }
  function openCancel() {
    setCancelReason("");
    setCancelOpen(true);
  }

  async function submitConfirm() {
    if (!transfer) return;
    try {
      await confirmMutation.mutateAsync(transfer.id);
      setConfirmOpen(false);
      onActionSuccess?.();
    } catch {
      // toast do hook
    }
  }

  async function submitRefuse() {
    if (!transfer || refusalReason.trim().length === 0) return;
    try {
      await refuseMutation.mutateAsync({
        id: transfer.id,
        payload: { refusalReason: refusalReason.trim() },
      });
      setRefuseOpen(false);
      onActionSuccess?.();
    } catch {
      // toast do hook
    }
  }

  async function submitCancel() {
    if (!transfer || cancelReason.trim().length === 0) return;
    try {
      await cancelMutation.mutateAsync({
        id: transfer.id,
        payload: { cancelReason: cancelReason.trim() },
      });
      setCancelOpen(false);
      onActionSuccess?.();
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
            Detalhes da remessa
          </DialogTitle>
          <DialogDescription>
            ID{" "}
            <span className="font-mono uppercase">
              {transferId.slice(0, 8)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Carregando remessa...</p>
      </>
    );
  }

  if (query.isError || !transfer) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            Detalhes da remessa
          </DialogTitle>
          <DialogDescription>
            ID{" "}
            <span className="font-mono uppercase">
              {transferId.slice(0, 8)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-destructive">
          Não foi possível carregar a remessa.
        </p>
      </>
    );
  }

  // =============================
  // Render
  // =============================

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-primary">
          Detalhes da remessa
        </DialogTitle>
        <DialogDescription>
          <div className="flex items-center gap-x-2">
            <div className="flex items-center gap-x-1">
              <strong>ID:</strong>
              <span className="font-mono uppercase">
                {transfer.id.slice(0, 8)}
              </span>
            </div>
            {transfer.purchaseRequestId && (
              <div className="flex items-center gap-x-1">
                <strong>Pedido:</strong>
                <span className="font-mono uppercase">
                  {transfer.purchaseRequestId.slice(0, 8)}
                </span>
              </div>
            )}
          </div>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Status + setores */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-lg">
            <strong>{transfer.fromSector?.name ?? "—"}</strong>
            {" → "}
            <strong>{transfer.toSector?.name ?? "—"}</strong>
          </span>
          <span
            className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[transfer.status]}`}
          >
            {STATUS_LABEL[transfer.status]}
          </span>
        </div>

        {/* Metadados */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Criada por</dt>
            <dd>{transfer.createdBy?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Criada em</dt>
            <dd>{formatDateTime(transfer.createdAt)}</dd>
          </div>

          {transfer.confirmedBy && (
            <>
              <div>
                <dt className="text-muted-foreground">Confirmada por</dt>
                <dd>{transfer.confirmedBy.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Confirmada em</dt>
                <dd>{formatDateTime(transfer.confirmedAt)}</dd>
              </div>
            </>
          )}

          {transfer.refusedBy && (
            <>
              <div>
                <dt className="text-muted-foreground">Recusada por</dt>
                <dd>{transfer.refusedBy.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Recusada em</dt>
                <dd>{formatDateTime(transfer.refusedAt)}</dd>
              </div>
            </>
          )}

          {transfer.cancelledBy && (
            <>
              <div>
                <dt className="text-muted-foreground">Cancelada por</dt>
                <dd>{transfer.cancelledBy.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cancelada em</dt>
                <dd>{formatDateTime(transfer.cancelledAt)}</dd>
              </div>
            </>
          )}

          {transfer.reason && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Motivo</dt>
              <dd className="whitespace-pre-wrap">{transfer.reason}</dd>
            </div>
          )}

          {transfer.refusalReason && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Motivo da recusa</dt>
              <dd className="whitespace-pre-wrap">{transfer.refusalReason}</dd>
            </div>
          )}

          {transfer.cancelReason && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Motivo do cancelamento</dt>
              <dd className="whitespace-pre-wrap">{transfer.cancelReason}</dd>
            </div>
          )}
        </dl>

        {/* Itens */}
        <div className="rounded border">
          <div className="bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
            Itens ({items.length})
          </div>
          {items.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Sem itens carregados.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold"></th>
                  <th className="px-3 py-2 font-semibold">Produto</th>
                  <th className="px-3 py-2 font-semibold">SKU</th>
                  <th className="px-3 py-2 font-semibold">Barcode</th>
                  <th className="px-3 py-2 font-semibold text-right">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-3 py-2">
                      {it.product.imageUrl ? (
                        <img
                          src={it.product.imageUrl}
                          className="w-15 h-15"
                          alt={it.product.name}
                        />
                      ) : (
                        <div className="w-15 h-15 flex items-center justify-center border border-gray-300 rounded-md">
                          <ImageOff />
                        </div>
                      )}
                    </td>
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
        {(canConfirmOrRefuse || canCancel) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {canConfirmOrRefuse && (
              <>
                <Button
                  type="button"
                  onClick={openConfirm}
                  className="cursor-pointer"
                >
                  <Check size={16} className="mr-2" />
                  Aceitar remessa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openRefuse}
                  className="cursor-pointer hover:bg-red-500 hover:text-white duration-200"
                >
                  <X size={16} className="mr-2" />
                  Recusar
                </Button>
              </>
            )}
            {canCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={openCancel}
                className="text-destructive cursor-pointer"
              >
                <Ban size={16} className="mr-2" />
                Cancelar remessa
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ---- Dialog: confirmar ---- */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              Confirmar recebimento
            </DialogTitle>
            <DialogDescription>
              A remessa será marcada como <strong>Concluída</strong>. Essa ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={confirmMutation.isPending}
              className="cursor-pointer"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={submitConfirm}
              disabled={confirmMutation.isPending}
              className="cursor-pointer"
            >
              {confirmMutation.isPending ? "Confirmando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Dialog: recusar ---- */}
      <Dialog open={refuseOpen} onOpenChange={setRefuseOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              Recusar remessa
            </DialogTitle>
            <DialogDescription>
              O motivo é obrigatório e ficará registrado. O estoque será
              devolvido ao Almoxarifado.
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
              placeholder="Ex.: itens faltando, produto danificado"
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
              className="cursor-pointer"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={submitRefuse}
              disabled={
                refuseMutation.isPending || refusalReason.trim().length === 0
              }
              className="cursor-pointer"
            >
              {refuseMutation.isPending ? "Recusando..." : "Confirmar recusa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Dialog: cancelar ---- */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              Cancelar remessa
            </DialogTitle>
            <DialogDescription>
              O motivo é obrigatório e ficará registrado. O estoque será
              devolvido ao Almoxarifado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="cancel-reason">Motivo do cancelamento *</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) =>
                setCancelReason(e.target.value.slice(0, MAX_NOTE))
              }
              rows={3}
              maxLength={MAX_NOTE}
              placeholder="Ex.: item errado, pedido cancelado"
            />
            <p className="text-xs text-muted-foreground text-right">
              {cancelReason.length}/{MAX_NOTE}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelMutation.isPending}
              className="cursor-pointer"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={submitCancel}
              disabled={
                cancelMutation.isPending || cancelReason.trim().length === 0
              }
              className="cursor-pointer"
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
