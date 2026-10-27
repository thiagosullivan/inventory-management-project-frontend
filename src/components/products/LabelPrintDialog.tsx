import "@/styles/print.css";
import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Barcode } from "./Barcode";
import type { Product } from "@/types/products.types";
import { useNavigate } from "react-router-dom";

interface LabelPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onDone?: () => void;
}

export function LabelPrintDialog({
  open,
  onOpenChange,
  product,
  onDone,
}: LabelPrintDialogProps) {
  const labelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  if (!product) return null;

  function handlePrint() {
    window.print();
  }

  function handleClose() {
    onOpenChange(false);
    onDone?.();

    navigate("/products");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Imprimir etiqueta</DialogTitle>
          <DialogDescription>
            Etiqueta 60 × 40 mm. Confira a pré-visualização antes de imprimir.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border p-4 flex justify-center bg-white">
          <div ref={labelRef} className="print-label shadow-sm">
            <p className="print-label__name">{product.name}</p>
            <p className="print-label__meta">
              {product.sku}
              {product.location ? ` · ${product.location}` : ""}
            </p>
            <div className="print-label__barcode">
              <Barcode
                value={product.barcode}
                height={40}
                width={1.5}
                displayValue
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
          <Button onClick={handlePrint}>Imprimir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
