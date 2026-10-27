import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/useProductMutations";
import type { Product } from "@/types/products.types";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onDeleted?: () => void;
}

/**
 * ⚠️ O backend faz hard delete e apaga histórico + movimentações.
 * O aviso no dialog existe pra o usuário não clicar sem saber.
 */
export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onDeleted,
}: DeleteProductDialogProps) {
  const mutation = useDeleteProduct();

  if (!product) return null;

  async function handleDelete() {
    if (!product) return;
    try {
      await mutation.mutateAsync(product.id);
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // toast já no hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Deletar produto</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar <strong>{product.name}</strong>?
            <br />
            <span className="text-destructive">
              Esta ação apaga também todas as movimentações e o histórico do
              produto, e não pode ser desfeita.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deletando..." : "Deletar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
