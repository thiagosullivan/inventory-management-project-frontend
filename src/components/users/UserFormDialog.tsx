// src/components/users/UserFormDialog.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateUser,
  useUpdateUserProfile,
  useUpdateUserRole,
  useUpdateUserSector,
} from "@/hooks/useUsers";
import { getApiErrorMessage } from "@/lib/api-error";
import { fetchSectorOptions } from "@/services/sectors";
import type { User, UserRole } from "@/types/users.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const ROLE_LABEL: Record<UserRole, string> = {
  MANAGER: "Manager",
  STAFF: "Staff",
};

interface UserFormDialogProps {
  mode: "create" | "edit";
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}

export function UserFormDialog({
  mode,
  user,
  open,
  onOpenChange,
  currentUserId,
}: UserFormDialogProps) {
  const isEdit = mode === "edit";
  const createMutation = useCreateUser();
  const roleMutation = useUpdateUserRole();
  const sectorMutation = useUpdateUserSector();
  const profileMutation = useUpdateUserProfile();

  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors", "options"],
    queryFn: fetchSectorOptions,
    staleTime: 1000 * 60 * 5,
    enabled: open,
  });

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "STAFF");
  const [sectorId, setSectorId] = useState<string>(user?.sectorId ?? "");

  const isSelf = isEdit && user?.id === currentUserId;
  const canEditRole = !isSelf;
  const isPending =
    createMutation.isPending ||
    roleMutation.isPending ||
    sectorMutation.isPending ||
    profileMutation.isPending;

  const canSubmitCreate =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    sectorId.length > 0;

  // 🔹 Fase 7.6 — name agora entra no diff
  const canSubmitEdit =
    isEdit &&
    !!user &&
    (name.trim() !== (user.name ?? "") ||
      role !== user.role ||
      sectorId !== (user.sectorId ?? ""));

  async function handleSubmit() {
    if (isEdit && user) {
      try {
        // 🔹 Fase 7.6 — profile primeiro (nome)
        if (name.trim() !== (user.name ?? "")) {
          await profileMutation.mutateAsync({
            id: user.id,
            payload: { name: name.trim() },
          });
        }
        if (role !== user.role && canEditRole) {
          await roleMutation.mutateAsync({ id: user.id, payload: { role } });
        }
        if (sectorId !== user.sectorId && sectorId) {
          await sectorMutation.mutateAsync({
            id: user.id,
            payload: { sectorId },
          });
        }
        toast.success("Usuário atualizado.");
        onOpenChange(false);
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Erro ao atualizar usuário."));
      }
      return;
    }

    createMutation.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        sectorId,
      },
      {
        onSuccess: () => {
          toast.success("Usuário criado.");
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(getApiErrorMessage(err, "Erro ao criar usuário.")),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            {isEdit ? "Editar usuário" : "Novo usuário"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edite nome, cargo e setor. Email e senha não são editáveis."
              : "Preencha os dados. O setor é obrigatório."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Nome — editável no create e no edit (Fase 7.6) */}
          <div>
            <label className="text-xs text-muted-foreground">Nome</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEdit}
              readOnly={isEdit}
              title={isEdit ? "Email não editável" : undefined}
            />
          </div>

          {/* Senha — só no create */}
          {!isEdit && (
            <div>
              <label className="text-xs text-muted-foreground">Senha (mínimo 6 caracteres)</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className="text-xs text-muted-foreground">Cargo</label>
            <Select
              value={role}
              onValueChange={(v) => {
                if (v === null) return;
                setRole(v as UserRole);
              }}
              disabled={!canEditRole}
            >
              <SelectTrigger
                title={
                  !canEditRole
                    ? "Você não pode alterar seu próprio cargo"
                    : undefined
                }
              >
                <SelectValue placeholder="Selecione">
                  {ROLE_LABEL[role]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
              </SelectContent>
            </Select>
            {!canEditRole && (
              <p className="text-xs text-muted-foreground mt-1">
                Você não pode alterar seu próprio cargo.
              </p>
            )}
          </div>

          {/* Setor */}
          <div>
            <label className="text-xs text-muted-foreground">Setor</label>
            <Select
              value={sectorId}
              onValueChange={(v) => {
                if (v === null) return;
                setSectorId(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor">
                  {sectorId
                    ? (sectors.find((s) => s.value === sectorId)?.label ??
                      "Selecione o setor")
                    : "Selecione o setor"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sectors.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}