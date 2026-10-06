import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteCategory } from "@/hooks/useCategoriesList";
import type { Category } from "@/types/categories.types";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
}: DeleteCategoryDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeleteCategory();

  // 🔹 Limpa o erro sempre que reabrir
  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  async function handleConfirm() {
    if (!category) return;
    setError(null);

    try {
      await deleteMutation.mutateAsync(category.id);
      onOpenChange(false);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.message;

      // 🔹 409 — categoria tem produtos vinculados (Restrict no Prisma)
      if (code === "CATEGORY_IN_USE") {
        setError(
          "Não é possível deletar: ainda existem produtos vinculados a esta categoria.",
        );
      } else if (code === "FORBIDDEN") {
        setError("Você não tem permissão para deletar esta categoria.");
      } else if (code === "CATEGORY_NOT_FOUND") {
        setError("Categoria não encontrada. Atualize a página.");
      } else {
        setError(message ?? "Não foi possível deletar. Tente novamente.");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Deletar categoria</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar{" "}
            <span className="font-medium text-foreground">
              {category?.name}
            </span>
            ? Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deletando..." : "Deletar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
