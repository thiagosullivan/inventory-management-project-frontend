import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useToggleUserStatus } from "@/hooks/useUsers";
import { getApiErrorMessage } from "@/lib/api-error";
import type { User } from "@/types/users.types";
import { useState } from "react";
import { toast } from "sonner"; // ajuste se o projeto usa outro toast
import { Switch } from "../ui/switch";

interface UserStatusSwitchProps {
  user: User;
  currentUserId: string;
}

export function UserStatusSwitch({ user, currentUserId }: UserStatusSwitchProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useToggleUserStatus();

  const isSelf = user.id === currentUserId;

  function handleToggle(checked: boolean) {
    if (isSelf) return; // defesa em profundidade
    if (!checked) {
      // inativar → pede confirm
      setConfirmOpen(true);
      return;
    }
    // reativar → direto
    mutation.mutate(user.id, {
      onSuccess: () => toast.success(`${user.name ?? user.email} reativado.`),
      onError: (err) =>
        toast.error(getApiErrorMessage(err, "Erro ao reativar usuário.")),
    });
  }

  function handleConfirmInactivate() {
    mutation.mutate(user.id, {
      onSuccess: () => {
        toast.success(`${user.name ?? user.email} inativado.`);
        setConfirmOpen(false);
      },
      onError: (err) => {
        toast.error(getApiErrorMessage(err, "Erro ao inativar usuário."));
        setConfirmOpen(false);
      },
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Switch
          checked={user.isActive}
          disabled={isSelf || mutation.isPending}
          onCheckedChange={handleToggle}
          title={
            isSelf
              ? "Você não pode inativar seu próprio usuário"
              : user.isActive
                ? "Inativar usuário"
                : "Reativar usuário"
          }
        />
        <span className="text-xs text-muted-foreground">
          {user.isActive ? "Ativo" : "Inativo"}
        </span>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              Inativar usuário
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja inativar{" "}
              <strong>{user.name ?? user.email}</strong>? Ele perde acesso
              imediatamente e não poderá logar até ser reativado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={mutation.isPending}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmInactivate}
              disabled={mutation.isPending}
              className="cursor-pointer"
            >
              {mutation.isPending ? "Inativando..." : "Inativar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}