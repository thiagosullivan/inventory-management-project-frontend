import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { cn } from "@/lib/utils";

interface BarcodeProps {
  value: string;
  height?: number;
  width?: number;
  displayValue?: boolean;
  className?: string;
}

export function Barcode({
  value,
  height = 60,
  width = 2,
  displayValue = true,
  className,
}: BarcodeProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        height,
        width,
        displayValue,
        margin: 8,
        fontSize: 14,
        textMargin: 4,
      });
    } catch (err) {
      console.error("Erro ao gerar barcode:", err);
    }
  }, [value, height, width, displayValue]);

  if (!value) return null;

  return <svg ref={ref} className={cn("max-w-full h-auto", className)} />;
}
