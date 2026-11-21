// src/components/sectors/DeleteSectorDialog.tsx
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
import { useDeleteSector } from "@/hooks/useSectors";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Sector } from "@/types/sectors.types";

interface DeleteSectorDialogProps {
  sector: Sector | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSectorDialog({
  sector,
  open,
  onOpenChange,
}: DeleteSectorDialogProps) {
  const mutation = useDeleteSector();

  function handleConfirm() {
    if (!sector) return;
    mutation.mutate(sector.id, {
      onSuccess: () => {
        toast.success(`Setor ${sector.name} excluído.`);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, "Erro ao excluir setor."));
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            Excluir setor permanentemente
          </DialogTitle>
          <DialogDescription>
            Esta ação <strong>não pode ser desfeita</strong>. O setor{" "}
            <strong>{sector?.name}</strong> será removido do sistema.
            <br />
            <br />
            Se o setor já tem usuários, pedidos, remessas ou movimentações,
            use <strong>Inativar</strong> em vez de excluir.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={mutation.isPending}
            className="cursor-pointer"
          >
            {mutation.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}