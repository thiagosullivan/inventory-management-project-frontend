import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { useUpdateProduct } from "@/hooks/useProductMutations";
import type { Product, UpdateProductPayload } from "@/types/products.types";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

/**
 * Wrapper de dialog pro ProductForm em mode=edit.
 * `key={product.id}` remonta o form quando troca de produto,
 * evitando `useEffect` + `form.reset` (regra do ESLint).
 */
export function EditProductDialog({
  open,
  onOpenChange,
  product,
}: EditProductDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar produto</DialogTitle>
        </DialogHeader>
        <EditProductDialogBody
          key={product.id}
          product={product}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditProductDialogBodyProps {
  product: Product;
  onSuccess: () => void;
}

function EditProductDialogBody({
  product,
  onSuccess,
}: EditProductDialogBodyProps) {
  const mutation = useUpdateProduct(product.id);

  async function handleSubmit(payload: UpdateProductPayload) {
    try {
      await mutation.mutateAsync(payload);
      onSuccess();
    } catch {
      // toast já no hook
    }
  }

  return (
    <ProductForm
      mode="edit"
      product={product}
      onSubmitEdit={handleSubmit}
      isSubmitting={mutation.isPending}
    />
  );
}
