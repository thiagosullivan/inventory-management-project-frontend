import { getApiErrorMessage } from "@/lib/api-error";
import {
  createMovement,
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/services/products";
import type {
  CreateMovementPayload,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/products.types";
import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

function invalidateProductViews(qc: QueryClient, id?: string) {
  qc.invalidateQueries({ queryKey: ["products"] });
  qc.invalidateQueries({ queryKey: ["stockMetrics"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  if (id) {
    qc.invalidateQueries({ queryKey: ["product", id] });
    qc.invalidateQueries({ queryKey: ["productHistory", id] });
    qc.invalidateQueries({ queryKey: ["productMovements", id] });
  }
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      invalidateProductViews(qc);
      toast.success("Produto criado com sucesso.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao criar produto."));
    },
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductPayload) => updateProduct(id, payload),
    onSuccess: () => {
      invalidateProductViews(qc, id);
      toast.success("Produto atualizado com sucesso.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao atualizar produto."));
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      invalidateProductViews(qc);
      toast.success("Produto deletado.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao deletar produto."));
    },
  });
}

export function useCreateMovement(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMovementPayload) =>
      createMovement(productId, payload),
    onSuccess: () => {
      invalidateProductViews(qc, productId);
      toast.success("Movimentação realizada.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Erro ao movimentar estoque."));
    },
  });
}
