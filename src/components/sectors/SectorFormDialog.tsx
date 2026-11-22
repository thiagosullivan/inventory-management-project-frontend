// src/components/sectors/SectorFormDialog.tsx
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreateSector, useUpdateSector } from "@/hooks/useSectors";
import type { Sector } from "@/types/sectors.types";

interface SectorFormDialogProps {
  mode: "create" | "edit";
  sector: Sector | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectorFormDialog({
  mode,
  sector,
  open,
  onOpenChange,
}: SectorFormDialogProps) {
  const isEdit = mode === "edit";
  const createMutation = useCreateSector();
  const updateMutation = useUpdateSector();

  const [name, setName] = useState(sector?.name ?? "");
  const [description, setDescription] = useState(sector?.description ?? "");
  const [isActive, setIsActive] = useState(sector?.isActive ?? true);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const canSubmitCreate = name.trim().length >= 2;
  const canSubmitEdit =
    isEdit &&
    !!sector &&
    (name.trim() !== sector.name ||
      (description.trim() || null) !== (sector.description ?? null) ||
      isActive !== sector.isActive);

  async function handleSubmit() {
    if (isEdit && sector) {
      try {
        await updateMutation.mutateAsync({
          id: sector.id,
          payload: {
            name: name.trim() !== sector.name ? name.trim() : undefined,
            description:
              (description.trim() || null) !== (sector.description ?? null)
                ? description.trim() || null
                : undefined,
            isActive: isActive !== sector.isActive ? isActive : undefined,
          },
        });
        toast.success("Setor atualizado.");
        onOpenChange(false);
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Erro ao atualizar setor."));
      }
      return;
    }

    // 🔹 Fase 7.8 — Almoxarifado é criado pelo seed do sistema.
    //    O create de setor NUNCA cria Almoxarifado (isWarehouse: false fixo).
    createMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        isWarehouse: false,
        isActive: true,
      },
      {
        onSuccess: () => {
          toast.success("Setor criado.");
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Erro ao criar setor.")),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            {isEdit ? "Editar setor" : "Novo setor"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edite nome, descrição e status. O tipo (Almoxarifado) é imutável."
              : "Setor comum. O Almoxarifado é criado pelo seed do sistema e não pode ser duplicado."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Cozinha"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {isEdit && sector?.isWarehouse && (
            <div className="rounded border bg-muted/30 p-3 text-sm">
              Este é o <strong>Almoxarifado</strong> (ponto 0). O tipo não pode
              ser alterado.
            </div>
          )}

          {isEdit && (
            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <Label>Ativo</Label>
                <p className="text-xs text-muted-foreground">
                  Setores inativos não podem ser escolhidos em novos cadastros.
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setIsActive(v === true)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || (isEdit ? !canSubmitEdit : !canSubmitCreate)}
            className="cursor-pointer"
          >
            {isPending
              ? "Salvando..."
              : isEdit
                ? "Salvar alterações"
                : "Criar setor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
