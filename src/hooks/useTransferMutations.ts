// src/hooks/useTransferMutations.ts
import { getApiErrorMessage } from "@/lib/api-error";
import {
  cancelTransfer,
  confirmTransfer,
  createTransfer,
  refuseTransfer,
} from "@/services/transfers";
import type {
  CancelTransferData,
  CreateTransferData,
} from "@/types/transfers.types";
import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

function invalidateTransferViews(qc: QueryClient, id?: string) {
  qc.invalidateQueries({ queryKey: ["transfers"] });
  qc.invalidateQueries({ queryKey: ["purchaseRequests"] });
  qc.invalidateQueries({ queryKey: ["products"] });
  qc.invalidateQueries({ queryKey: ["product"] });
  if (id) qc.invalidateQueries({ queryKey: ["transfers", "detail", id] });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransferData) => createTransfer(payload),
    onSuccess: () => {
      invalidateTransferViews(qc);
      toast.success("Remessa criada com sucesso.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao criar remessa."));
    },
  });
}

export function useConfirmTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmTransfer(id),
    onSuccess: (_data, id) => {
      invalidateTransferViews(qc, id);
      toast.success("Remessa confirmada.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao confirmar remessa."));
    },
  });
}

export function useRefuseTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => refuseTransfer(id),
    onSuccess: (_data, id) => {
      invalidateTransferViews(qc, id);
      toast.success("Remessa recusada. Estoque devolvido ao Almoxarifado.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao recusar remessa."));
    },
  });
}

export function useCancelTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CancelTransferData;
    }) => cancelTransfer(id, payload),
    onSuccess: (_data, { id }) => {
      invalidateTransferViews(qc, id);
      toast.success("Remessa cancelada. Estoque devolvido ao Almoxarifado.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao cancelar remessa."));
    },
  });
}
