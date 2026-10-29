// src/hooks/usePurchaseRequestMutations.ts
import { getApiErrorMessage } from "@/lib/api-error";
import {
  cancelPurchaseRequest,
  createPurchaseRequest,
  finalizePurchaseRequest,
  refusePurchaseRequest,
} from "@/services/purchaseRequests";
import type {
  CreatePurchaseRequestData,
  FinalizePurchaseRequestData,
  RefusePurchaseRequestData,
} from "@/types/purchaseRequests.types";
import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

function invalidatePurchaseRequestViews(qc: QueryClient, id?: string) {
  qc.invalidateQueries({ queryKey: ["purchaseRequests"] });
  if (id)
    qc.invalidateQueries({ queryKey: ["purchaseRequests", "detail", id] });
}

export function useCreatePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePurchaseRequestData) =>
      createPurchaseRequest(payload),
    onSuccess: () => {
      invalidatePurchaseRequestViews(qc);
      toast.success("Pedido criado com sucesso.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao criar pedido."));
    },
  });
}

export function useRefusePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: RefusePurchaseRequestData;
    }) => refusePurchaseRequest(id, payload),
    onSuccess: (_data, { id }) => {
      invalidatePurchaseRequestViews(qc, id);
      toast.success("Pedido recusado.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao recusar pedido."));
    },
  });
}

export function useFinalizePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: FinalizePurchaseRequestData;
    }) => finalizePurchaseRequest(id, payload),
    onSuccess: (_data, { id }) => {
      invalidatePurchaseRequestViews(qc, id);
      toast.success("Pedido finalizado.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao finalizar pedido."));
    },
  });
}

export function useCancelPurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelPurchaseRequest(id),
    onSuccess: (_data, id) => {
      invalidatePurchaseRequestViews(qc, id);
      toast.success("Pedido cancelado.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao cancelar pedido."));
    },
  });
}
