import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBarcodePreview } from "@/hooks/useBarcodePreview";
import { Barcode } from "./Barcode";

interface BarcodeFieldProps {
  value?: string | null;
  mode: "create" | "edit";
}

export function BarcodeField({ value, mode }: BarcodeFieldProps) {
  const preview = useBarcodePreview();
  const previewValue = preview.data?.barcode ?? null;

  const displayValue = mode === "edit" ? value : previewValue;

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="barcode-display">Código de barras</Label>
          <Input
            id="barcode-display"
            readOnly
            value={displayValue ?? ""}
            placeholder={
              mode === "create" ? "Gerado automaticamente ao salvar" : "—"
            }
            className="font-mono"
          />
        </div>

        {mode === "create" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => preview.refetch()}
            disabled={preview.isFetching}
          >
            {preview.isFetching
              ? "Gerando..."
              : previewValue
                ? "Gerar outro"
                : "Gerar código de barras"}
          </Button>
        )}
      </div>

      {mode === "create" && previewValue && (
        <p className="text-xs text-muted-foreground">
          Pré-visualização. O número definitivo é alocado ao salvar — pode mudar
          se outro usuário criar um produto antes.
        </p>
      )}

      {displayValue && (
        <div className="rounded-md border bg-white p-3 flex justify-center">
          <Barcode value={displayValue} />
        </div>
      )}
    </div>
  );
}
