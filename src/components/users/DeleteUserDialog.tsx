import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteUser } from "@/hooks/useUsers";
import { getApiErrorMessage } from "@/lib/api-error";
import type { User } from "@/types/users.types";
import { toast } from "sonner";

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  const mutation = useDeleteUser();

  function handleConfirm() {
    if (!user) return;
    mutation.mutate(user.id, {
      onSuccess: () => {
        toast.success(`Usuário ${user.name ?? user.email} excluído.`);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, "Erro ao excluir usuário."));
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            Excluir usuário permanentemente
          </DialogTitle>
          <DialogDescription>
            Esta ação <strong>não pode ser desfeita</strong>. O usuário{" "}
            <strong>{user?.name ?? user?.email}</strong> será removido do
            sistema.
            <br />
            <br />
            Se o usuário já teve qualquer atividade (login, criação de
            produtos), use <strong>Inativar</strong> em vez de excluir.
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