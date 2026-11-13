// src/components/print/PrintDialog.tsx
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PRINT_MAX_EVENTS } from "@/lib/print/print-utils";

export type PrintScope = "current" | "all";

export interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  totalCount: number;
  pageSize?: number;
  currentLabel: string;
  allLabel: string;
  extraCheckbox?: {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  };
  onConfirm: (scope: PrintScope) => void;
}

export function PrintDialog({
  open,
  onOpenChange,
  title,
  totalCount,
  pageSize = 20,
  currentLabel,
  allLabel,
  extraCheckbox,
  onConfirm,
}: PrintDialogProps) {
  const fitsOnePage = totalCount <= pageSize;
  const overMax = totalCount > PRINT_MAX_EVENTS;

  const [scope, setScope] = useState<PrintScope>(
    fitsOnePage ? "current" : "all",
  );

  function handleConfirm() {
    onConfirm(scope);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Escolha o que imprimir. O preview do navegador abrirá em seguida.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">O que imprimir?</span>

            <RadioGroup
              value={scope}
              onValueChange={(v) => {
                if (v === "current" || v === "all") setScope(v);
              }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value="current" id="print-scope-current" />
                <div className="flex flex-col">
                  <Label
                    htmlFor="print-scope-current"
                    className="cursor-pointer"
                  >
                    Página atual
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {currentLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem
                  value="all"
                  id="print-scope-all"
                  disabled={overMax || fitsOnePage}
                />
                <div className="flex flex-col">
                  <Label
                    htmlFor="print-scope-all"
                    className={
                      overMax || fitsOnePage
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  >
                    Todos os filtros
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {overMax
                      ? `Refine os filtros (máx. ${PRINT_MAX_EVENTS} eventos)`
                      : fitsOnePage
                        ? "Tudo cabe em uma página"
                        : allLabel}
                  </span>
                </div>
              </div>
            </RadioGroup>
          </div>

          {extraCheckbox && (
            <div className="flex items-start gap-3 border-t pt-3">
              <Checkbox
                id="print-extra-checkbox"
                checked={extraCheckbox.checked}
                onCheckedChange={(v) =>
                  extraCheckbox.onCheckedChange(v === true)
                }
              />
              <Label
                htmlFor="print-extra-checkbox"
                className="cursor-pointer text-sm leading-snug"
              >
                {extraCheckbox.label}
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={scope === "all" && (overMax || fitsOnePage)}
            className="cursor-pointer"
          >
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
