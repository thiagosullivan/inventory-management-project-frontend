import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/products.types";

interface ProductCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onPrintLabel: (product: Product) => void;
}

export function ProductCreatedDialog({
  open,
  onOpenChange,
  product,
  onPrintLabel,
}: ProductCreatedDialogProps) {
  const navigate = useNavigate();

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} disablePointerDismissal>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Produto criado</DialogTitle>
          <DialogDescription>
            <strong>{product.name}</strong> foi cadastrado com sucesso.
            <br />
            SKU: <span className="font-mono">{product.sku}</span> · Código de
            barras: <span className="font-mono">{product.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onPrintLabel(product)}>
            Imprimir etiqueta
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onOpenChange(false);
              navigate(`/products/${product.id}`);
            }}
          >
            Ver produto
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              navigate("/products");
            }}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
