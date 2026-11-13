// src/components/products/LabelPrintDialog.tsx
import "@/styles/label-print.css";

import { useEffect, useState } from "react";
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
import { Barcode } from "./Barcode";
import type { Product } from "@/types/products.types";

import { PrintPortal } from "@/components/print/PrintPortal";
import { enterPrintMode, exitPrintMode } from "@/lib/print/print-mode";

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
  const navigate = useNavigate();
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    function onAfterPrint() {
      exitPrintMode();
      setPrinting(false);
    }
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  if (!product) return null;

  function handlePrint() {
    setPrinting(true);
    enterPrintMode("label");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
  }

  function handleClose() {
    onOpenChange(false);
    onDone?.();
    navigate("/products");
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Imprimir etiqueta</DialogTitle>
            <DialogDescription>
              Etiqueta 60 × 40 mm. Confira a pré-visualização antes de imprimir.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border p-4 flex justify-center bg-white">
            <div className="print-label shadow-sm">
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
            <Button
              variant="outline"
              onClick={handleClose}
              className="cursor-pointer"
            >
              Fechar
            </Button>
            <Button onClick={handlePrint} className="cursor-pointer">
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {printing && (
        <PrintPortal>
          <div className="print-label">
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
        </PrintPortal>
      )}
    </>
  );
}
